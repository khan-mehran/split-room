"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useGroupMembers, useApproveMember, useRemoveMember } from "@/hooks/useGroupMembers";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Check, X, Copy, Crown, LogOut } from "lucide-react";


export default function MembersPage() {
  const { user, currentGroup, isAdmin, signOut } = useAuth();
  const { data: members = [], isLoading } = useGroupMembers(currentGroup?.id);
  const approveMember = useApproveMember();
  const removeMember = useRemoveMember();
  const [copied, setCopied] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  const active = members.filter((m) => m.status === "active");
  const pending = members.filter((m) => m.status === "pending");

  async function handleApprove(id: string) {
    if (!currentGroup) return;
    setActionId(id);
    try { await approveMember.mutateAsync({ id, groupId: currentGroup.id }); }
    finally { setActionId(null); }
  }

  async function handleRemove(id: string, name: string) {
    if (!currentGroup) return;
    if (!confirm(`Remove ${name} from the group?`)) return;
    setActionId(id);
    try { await removeMember.mutateAsync({ id, groupId: currentGroup.id }); }
    finally { setActionId(null); }
  }

  async function copyInviteCode() {
    if (!currentGroup) return;
    await navigator.clipboard.writeText(currentGroup.invite_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="p-4 space-y-4 animate-fade-in">
      <div className="flex items-center justify-between pt-2">
        <h1 className="text-xl font-bold">Members</h1>
        <Badge variant="secondary">{active.length} active</Badge>
      </div>

      {/* Invite code card */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground mb-2">Group invite code</p>
          <div className="flex items-center justify-between">
            <p className="font-mono text-3xl font-bold tracking-widest text-primary">
              {currentGroup?.invite_code}
            </p>
            <Button size="sm" variant="outline" onClick={copyInviteCode} className="gap-1.5">
              <Copy className="h-3.5 w-3.5" />
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Share this code with housemates to invite them</p>
        </CardContent>
      </Card>

      {/* Pending approvals */}
      {isAdmin && pending.length > 0 && (
        <div>
          <h2 className="font-semibold text-sm text-muted-foreground mb-2">PENDING APPROVAL ({pending.length})</h2>
          <div className="space-y-2">
            {pending.map((m) => (
              <Card key={m.id} className="border-amber-200">
                <CardContent className="flex items-center gap-3 p-4">
                  <Avatar name={m.users?.name || "?"} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{m.users?.name}</p>
                    <p className="text-xs text-muted-foreground">{m.users?.phone_number}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleApprove(m.id)}
                      disabled={actionId === m.id}
                      className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center hover:bg-emerald-200 transition-colors disabled:opacity-50"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleRemove(m.id, m.users?.name || "this member")}
                      disabled={actionId === m.id}
                      className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center hover:bg-rose-200 transition-colors disabled:opacity-50"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Active members */}
      <div>
        <h2 className="font-semibold text-sm text-muted-foreground mb-2">ACTIVE MEMBERS ({active.length})</h2>
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => <div key={i} className="h-16 rounded-2xl bg-muted animate-pulse" />)}
          </div>
        ) : (
          <div className="space-y-2">
            {active.map((m) => {
              const isMe = m.user_id === user?.id;
              const isGroupAdmin = m.role === "admin";
              return (
                <Card key={m.id}>
                  <CardContent className="flex items-center gap-3 p-4">
                    <Avatar name={m.users?.name || "?"} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="font-semibold truncate">{m.users?.name}</p>
                        {isGroupAdmin && <Crown className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />}
                      </div>
                      <p className="text-xs text-muted-foreground">{m.users?.phone_number}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {isMe && <Badge variant="default" className="text-[10px]">You</Badge>}
                      {isAdmin && !isMe && !isGroupAdmin && (
                        <button
                          onClick={() => handleRemove(m.id, m.users?.name || "this member")}
                          disabled={actionId === m.id}
                          className="w-7 h-7 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-100 transition-colors disabled:opacity-50"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Sign out */}
      <div className="pt-2">
        <Button variant="ghost" className="w-full text-muted-foreground gap-2" onClick={signOut}>
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
