export type UserRole = "admin" | "member";
export type MemberStatus = "pending" | "active";

export interface Group {
  id: string;
  name: string;
  invite_code: string;
  admin_id: string;
  created_at: string;
}

export interface User {
  id: string;
  name: string;
  phone_number: string;
  created_at: string;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: UserRole;
  status: MemberStatus;
  joined_at: string;
  users?: User;
  groups?: Group;
}

export interface Expense {
  id: string;
  group_id: string;
  paid_by_user_id: string;
  amount: number;
  description: string;
  expense_date: string;
  created_at: string;
  users?: User;
}

export interface MemberBalance {
  userId: string;
  name: string;
  totalPaid: number;
  fairShare: number;
  balance: number; // positive = gets back, negative = owes
}

export interface SettleTransaction {
  from: string;
  fromName: string;
  to: string;
  toName: string;
  amount: number;
}
