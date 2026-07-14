"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Phone, Lock } from "lucide-react";

interface Props {
  onBack: () => void;
}

export default function SignInForm({ onBack }: Props) {
  const { signIn } = useAuth();
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function validate() {
    const e: Record<string, string> = {};
    if (!phone.trim()) e.phone = "Phone number is required";
    if (!pin) e.pin = "PIN is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setError("");
    const result = await signIn(phone, pin);
    setLoading(false);
    if (result.error) setError(result.error);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-700 via-teal-600 to-teal-800 flex flex-col p-6">
      <button onClick={onBack} className="text-white/80 hover:text-white flex items-center gap-1.5 mb-8 w-fit">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white">Welcome Back</h1>
        <p className="text-teal-100 mt-1 text-sm">Sign in with your phone number and PIN</p>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-xl w-full max-w-sm mx-auto">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Phone Number"
            type="tel"
            placeholder="+974 5555 1234"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            error={errors.phone}
            leftIcon={<Phone className="h-4 w-4" />}
          />
          <Input
            label="PIN"
            type="password"
            inputMode="numeric"
            placeholder="••••"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            error={errors.pin}
            leftIcon={<Lock className="h-4 w-4" />}
          />

          {error && (
            <p className="text-sm text-destructive bg-destructive/5 rounded-lg px-3 py-2">{error}</p>
          )}

          <Button type="submit" className="w-full" size="lg" loading={loading}>
            Sign In
          </Button>
        </form>
      </div>
    </div>
  );
}
