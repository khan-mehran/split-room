"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, User, Phone, Lock } from "lucide-react";

interface Props {
  onBack: () => void;
}

export default function RegisterForm({ onBack }: Props) {
  const { signUp } = useAuth();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function validate() {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Name is required";
    if (!phone.trim()) e.phone = "Phone number is required";
    else if (!/^\+?[\d\s\-()]{7,15}$/.test(phone.trim())) e.phone = "Enter a valid phone number";
    if (pin.length < 4) e.pin = "PIN must be at least 4 digits";
    if (!/^\d+$/.test(pin)) e.pin = "PIN must be digits only";
    if (pin !== confirmPin) e.confirmPin = "PINs do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setError("");
    const result = await signUp(name, phone, pin);
    setLoading(false);
    if (result.error) setError(result.error);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-700 via-teal-600 to-teal-800 flex flex-col p-6">
      <button onClick={onBack} className="text-white/80 hover:text-white flex items-center gap-1.5 mb-8 w-fit">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white">Create Account</h1>
        <p className="text-teal-100 mt-1 text-sm">Join or create a shared expense group</p>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-xl w-full max-w-sm mx-auto">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="Ali Hassan"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
            leftIcon={<User className="h-4 w-4" />}
          />
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
            label="Create PIN (4+ digits)"
            type="password"
            inputMode="numeric"
            placeholder="••••"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            error={errors.pin}
            leftIcon={<Lock className="h-4 w-4" />}
          />
          <Input
            label="Confirm PIN"
            type="password"
            inputMode="numeric"
            placeholder="••••"
            value={confirmPin}
            onChange={(e) => setConfirmPin(e.target.value)}
            error={errors.confirmPin}
            leftIcon={<Lock className="h-4 w-4" />}
          />

          {error && (
            <p className="text-sm text-destructive bg-destructive/5 rounded-lg px-3 py-2">{error}</p>
          )}

          <Button type="submit" className="w-full" size="lg" loading={loading}>
            Create Account
          </Button>
        </form>
      </div>

      <p className="text-teal-100/60 text-xs text-center mt-6">
        After registering, you can create a group or join one with an invite code.
      </p>
    </div>
  );
}
