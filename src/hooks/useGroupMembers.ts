"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { GroupMember, MemberBalance } from "@/types";

export function useGroupMembers(groupId: string | null | undefined) {
  return useQuery({
    queryKey: ["group_members", groupId],
    queryFn: async () => {
      if (!groupId) return [];
      const { data, error } = await supabase
        .from("group_members")
        .select("*, users(id, name, phone_number)")
        .eq("group_id", groupId)
        .order("joined_at");
      if (error) throw error;
      return data as GroupMember[];
    },
    enabled: !!groupId,
  });
}

export function useApproveMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, groupId }: { id: string; groupId: string }) => {
      const { error } = await supabase
        .from("group_members")
        .update({ status: "active" })
        .eq("id", id);
      if (error) throw error;
      return groupId;
    },
    onSuccess: (groupId) => qc.invalidateQueries({ queryKey: ["group_members", groupId] }),
  });
}

export function useRemoveMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, groupId }: { id: string; groupId: string }) => {
      const { error } = await supabase.from("group_members").delete().eq("id", id);
      if (error) throw error;
      return groupId;
    },
    onSuccess: (groupId) => qc.invalidateQueries({ queryKey: ["group_members", groupId] }),
  });
}

export function computeBalances(
  members: GroupMember[],
  expenses: { paid_by_user_id: string; amount: number }[]
): MemberBalance[] {
  const activeMembers = members.filter((m) => m.status === "active");
  if (activeMembers.length === 0) return [];

  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const fairShare = totalExpenses / activeMembers.length;

  return activeMembers.map((m) => {
    const totalPaid = expenses
      .filter((e) => e.paid_by_user_id === m.user_id)
      .reduce((sum, e) => sum + Number(e.amount), 0);
    return {
      userId: m.user_id,
      name: m.users?.name || "Unknown",
      totalPaid,
      fairShare,
      balance: Math.round((totalPaid - fairShare) * 100) / 100,
    };
  });
}
