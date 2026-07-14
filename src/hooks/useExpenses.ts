"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Expense } from "@/types";

export function useExpenses(groupId: string | null | undefined, since?: string | null) {
  return useQuery({
    queryKey: ["expenses", groupId, since ?? null],
    queryFn: async () => {
      if (!groupId) return [];
      let q = supabase
        .from("expenses")
        .select("*, users(id, name)")
        .eq("group_id", groupId)
        .order("expense_date", { ascending: false })
        .order("created_at", { ascending: false });
      if (since) q = q.gt("created_at", since);
      const { data, error } = await q;
      if (error) throw error;
      return data as Expense[];
    },
    enabled: !!groupId,
  });
}

export function useAddExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      group_id: string;
      paid_by_user_id: string;
      amount: number;
      description: string;
      expense_date: string;
    }) => {
      const { data, error } = await supabase.from("expenses").insert(payload).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["expenses", data.group_id] });
    },
  });
}

export function useDeleteExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, groupId }: { id: string; groupId: string }) => {
      const { error } = await supabase.from("expenses").delete().eq("id", id);
      if (error) throw error;
      return groupId;
    },
    onSuccess: (groupId) => {
      qc.invalidateQueries({ queryKey: ["expenses", groupId] });
    },
  });
}

export function useEndPeriod() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ groupId }: { groupId: string }) => {
      const now = new Date().toISOString();
      const { error } = await supabase
        .from("groups")
        .update({ last_cleared_at: now })
        .eq("id", groupId);
      if (error) throw error;
      return now;
    },
    onSuccess: (_, { groupId }) => {
      qc.invalidateQueries({ queryKey: ["expenses", groupId] });
    },
  });
}
