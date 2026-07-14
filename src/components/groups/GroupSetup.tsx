"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { generateInviteCode } from "@/lib/utils";
import { Plus, Hash, LogOut } from "lucide-react";
import type { Group, GroupMember } from "@/types";

export default function GroupSetup() {
  const { user, signOut, setCurrentGroup } = useAuth();
  const [mode, setMode] = useState<"choose" | "create" | "join">("choose");
  const [groupName, setGroupName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pendingMsg, setPendingMsg] = useState("");

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!groupName.trim() || !user) return;
    setLoading(true);
    setError("");

    const invite = generateInviteCode();
    const { data: group, error: gErr } = await supabase
      .from("groups")
      .insert({ name: groupName.trim(), invite_code: invite, admin_id: user.id })
      .select()
      .single();
    if (gErr || !group) { setError(gErr?.message || "Failed to create group."); setLoading(false); return; }

    const { data: mem, error: mErr } = await supabase
      .from("group_members")
      .insert({ group_id: group.id, user_id: user.id, role: "admin", status: "active" })
      .select()
      .single();
    if (mErr || !mem) { setError(mErr?.message || "Failed to join group."); setLoading(false); return; }

    setLoading(false);
    setCurrentGroup(group as Group, mem as GroupMember);
  }

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteCode.trim() || !user) return;
    setLoading(true);
    setError("");

    const { data: group, error: gErr } = await supabase
      .from("groups")
      .select("*")
      .eq("invite_code", inviteCode.trim().toUpperCase())
      .single();
    if (gErr || !group) { setError("Group not found. Check the invite code."); setLoading(false); return; }

    const { data: existing } = await supabase
      .from("group_members")
      .select("id, status")
      .eq("group_id", group.id)
      .eq("user_id", user.id)
      .single();

    if (existing) {
      if (existing.status === "active") {
        const { data: mem } = await supabase
          .from("group_members").select("*").eq("id", existing.id).single();
        if (mem) setCurrentGroup(group as Group, mem as GroupMember);
      } else {
        setPendingMsg(`You already requested to join "${group.name}". Waiting for admin approval.`);
      }
      setLoading(false);
      return;
    }

    const { error: mErr } = await supabase
      .from("group_members")
      .insert({ group_id: group.id, user_id: user.id, role: "member", status: "pending" });
    if (mErr) { setError(mErr.message); setLoading(false); return; }

    setLoading(false);
    setPendingMsg(`Join request sent to "${group.name}"! The admin will approve you shortly.`);
  }

  if (pendingMsg) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="text-center max-w-sm space-y-4">
          <div className="text-5xl">⏳</div>
          <h2 className="text-xl font-bold">Pending Approval</h2>
          <p className="text-muted-foreground">{pendingMsg}</p>
          <Button variant="outline" onClick={signOut} className="w-full">
            <LogOut className="mr-2 h-4 w-4" /> Sign Out
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="text-center mb-8">
        <div className="text-5xl mb-3">👋</div>
        <h1 className="text-2xl font-bold">Hi, {user?.name}!</h1>
        <p className="text-muted-foreground mt-1">Set up your group to get started</p>
      </div>

      {mode === "choose" && (
        <div className="w-full max-w-sm space-y-3 animate-fade-in">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setMode("create")}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Plus className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">Create a Group</CardTitle>
                <CardDescription className="text-sm mt-0.5">Start fresh and invite housemates</CardDescription>
              </div>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setMode("join")}>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center">
                <Hash className="h-6 w-6 text-accent" />
              </div>
              <div>
                <CardTitle className="text-base">Join a Group</CardTitle>
                <CardDescription className="text-sm mt-0.5">Enter an invite code from your admin</CardDescription>
              </div>
            </CardContent>
          </Card>

          <Button variant="ghost" className="w-full text-muted-foreground" onClick={signOut}>
            <LogOut className="mr-2 h-4 w-4" /> Sign Out
          </Button>
        </div>
      )}

      {mode === "create" && (
        <Card className="w-full max-w-sm animate-fade-in">
          <CardHeader>
            <CardTitle>New Group</CardTitle>
            <CardDescription>Give your group a name (e.g. &quot;Apartment 4B&quot;)</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <Input
                label="Group Name"
                placeholder="Apartment 4B"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="flex gap-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setMode("choose")}>Back</Button>
                <Button type="submit" className="flex-1" loading={loading}>Create</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {mode === "join" && (
        <Card className="w-full max-w-sm animate-fade-in">
          <CardHeader>
            <CardTitle>Join a Group</CardTitle>
            <CardDescription>Enter the 6-character invite code from your group admin</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleJoin} className="space-y-4">
              <Input
                label="Invite Code"
                placeholder="ABC123"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                className="uppercase tracking-widest text-lg font-mono"
                maxLength={6}
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="flex gap-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setMode("choose")}>Back</Button>
                <Button type="submit" className="flex-1" loading={loading}>Request to Join</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
