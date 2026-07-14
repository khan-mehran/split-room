"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "./supabase";
import type { User, Group, GroupMember } from "@/types";

interface AuthState {
  user: User | null;
  currentGroup: Group | null;
  membership: GroupMember | null;
  isLoading: boolean;
  isAdmin: boolean;
}

interface AuthContextValue extends AuthState {
  signIn: (phoneNumber: string, pin: string) => Promise<{ error?: string }>;
  signUp: (name: string, phoneNumber: string, pin: string) => Promise<{ error?: string; user?: User }>;
  signOut: () => void;
  setCurrentGroup: (group: Group, membership: GroupMember) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const SESSION_KEY = "splitroom_session";

interface StoredSession {
  userId: string;
  groupId?: string;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [currentGroup, setGroup] = useState<Group | null>(null);
  const [membership, setMembership] = useState<GroupMember | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAdmin = membership?.role === "admin";

  useEffect(() => {
    restoreSession();
  }, []);

  async function restoreSession() {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (!raw) { setIsLoading(false); return; }
      const session: StoredSession = JSON.parse(raw);

      const { data: userData } = await supabase
        .from("users")
        .select("*")
        .eq("id", session.userId)
        .single();
      if (!userData) { localStorage.removeItem(SESSION_KEY); setIsLoading(false); return; }
      setUser(userData);

      if (session.groupId) {
        const { data: gm } = await supabase
          .from("group_members")
          .select("*, groups(*)")
          .eq("user_id", session.userId)
          .eq("group_id", session.groupId)
          .eq("status", "active")
          .single();
        if (gm && gm.groups) {
          setGroup(gm.groups as Group);
          setMembership(gm as GroupMember);
        }
      }
    } catch {
      localStorage.removeItem(SESSION_KEY);
    } finally {
      setIsLoading(false);
    }
  }

  async function signUp(name: string, phoneNumber: string, pin: string) {
    const trimmedPhone = phoneNumber.trim();

    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("phone_number", trimmedPhone)
      .single();
    if (existing) return { error: "Phone number already registered." };

    const { data, error } = await supabase
      .from("users")
      .insert({ name: name.trim(), phone_number: trimmedPhone, pin })
      .select()
      .single();
    if (error || !data) return { error: error?.message || "Registration failed." };

    localStorage.setItem(SESSION_KEY, JSON.stringify({ userId: data.id }));
    setUser(data);
    return { user: data };
  }

  async function signIn(phoneNumber: string, pin: string) {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("phone_number", phoneNumber.trim())
      .single();

    if (error || !data) return { error: "Phone number not found. Please check and try again." };

    // Verify PIN against the value stored in the database
    if (data.pin && data.pin !== pin) {
      return { error: "Incorrect PIN. Please try again." };
    }

    // If pin is null (legacy user before migration), save it now
    if (!data.pin) {
      await supabase.from("users").update({ pin }).eq("id", data.id);
    }

    const session: StoredSession = { userId: data.id };
    const { data: memberships } = await supabase
      .from("group_members")
      .select("*, groups(*)")
      .eq("user_id", data.id)
      .eq("status", "active")
      .limit(1);

    if (memberships?.[0]?.groups) {
      session.groupId = (memberships[0].groups as Group).id;
      setGroup(memberships[0].groups as Group);
      setMembership(memberships[0] as GroupMember);
    }

    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setUser(data);
    return {};
  }

  function signOut() {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
    setGroup(null);
    setMembership(null);
  }

  function setCurrentGroup(group: Group, mem: GroupMember) {
    setGroup(group);
    setMembership(mem);
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) {
      const session = JSON.parse(raw);
      localStorage.setItem(SESSION_KEY, JSON.stringify({ ...session, groupId: group.id }));
    }
  }

  async function refreshUser() {
    if (!user) return;
    const { data } = await supabase.from("users").select("*").eq("id", user.id).single();
    if (data) setUser(data);
  }

  return (
    <AuthContext.Provider value={{
      user, currentGroup, membership, isLoading, isAdmin,
      signIn, signUp, signOut, setCurrentGroup, refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
