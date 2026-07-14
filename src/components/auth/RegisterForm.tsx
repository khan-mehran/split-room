"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhoneInput, COUNTRIES } from "@/components/ui/phone-input";
import { PinInput } from "@/components/ui/pin-input";
import { ArrowLeft, User } from "lucide-react";

interface Props {
  onBack: () => void;
}

export default function RegisterForm({ onBack }: Props) {
  const { signUp } = useAuth();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState(COUNTRIES[0].code);
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function validate() {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Name is required";

    const country = COUNTRIES.find((c) => phone.startsWith(c.code));
    const digits = phone.replace(country?.code ?? "", "").replace(/\D/g, "");
    if (!country || digits.length !== country.digits) {
      e.phone = `Enter exactly ${country?.digits ?? 8} digits after the country code`;
    }

    if (pin.length < 4) e.pin = "PIN must be at least 4 digits";
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

      <div className="bg-white dark:bg-card rounded-2xl p-6 shadow-xl w-full max-w-sm mx-auto">
        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
          <Input
            label="Full Name"
            placeholder="Ali Hassan"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
            autoComplete="name"
            leftIcon={<User className="h-4 w-4" />}
          />

          <PhoneInput
            label="Phone Number"
            value={phone}
            onChange={setPhone}
            error={errors.phone}
          />

          <PinInput
            label="Create PIN (4+ digits)"
            placeholder="Choose a PIN"
            value={pin}
            onChange={setPin}
            error={errors.pin}
            autoComplete="new-password"
          />

          <PinInput
            label="Confirm PIN"
            placeholder="Repeat your PIN"
            value={confirmPin}
            onChange={setConfirmPin}
            error={errors.confirmPin}
            autoComplete="new-password"
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
