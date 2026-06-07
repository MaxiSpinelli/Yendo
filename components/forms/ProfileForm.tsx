"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import type { Profile } from "@/lib/types/database";
import { translateError } from "@/lib/utils/errors";

interface Props {
  profile: Profile | null;
}

export default function ProfileForm({ profile }: Props) {
  const [form, setForm] = useState({
    first_name: profile?.first_name ?? "",
    last_name: profile?.last_name ?? "",
    nickname: profile?.nickname ?? "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setSuccess(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({
        first_name: form.first_name || null,
        last_name: form.last_name || null,
        nickname: form.nickname || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", (await supabase.auth.getUser()).data.user!.id);

    if (error) {
      setError(translateError(error.message));
    } else {
      setSuccess(true);
    }
    setLoading(false);
  }

  const initials = ((form.nickname || form.first_name || "?")[0]).toUpperCase();

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Avatar */}
      <div className="flex justify-center mb-2">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-semibold"
          style={{ background: "#e8e0d8", color: "#1a1714", border: "1px solid #d8cfc8" }}
        >
          {initials}
        </div>
      </div>

      <Input
        label="Nombre"
        name="first_name"
        value={form.first_name}
        onChange={handleChange}
      />
      <Input
        label="Apellido"
        name="last_name"
        value={form.last_name}
        onChange={handleChange}
      />
      <Input
        label="Apodo"
        name="nickname"
        value={form.nickname}
        onChange={handleChange}
        placeholder="Como te conocen en el grupo"
      />

      {error && (
        <div
          className="rounded-xl p-3 text-xs"
          style={{ background: "#fff8f5", border: "1px solid #f0d0c8", color: "#c4622d" }}
        >
          {error}
        </div>
      )}

      {success && (
        <div
          className="rounded-xl p-3 text-xs"
          style={{ background: "#eaf4f0", border: "1px solid #c0d8cc", color: "#2d6a4f" }}
        >
          ✓ Perfil actualizado correctamente.
        </div>
      )}

      <Button type="submit" loading={loading} className="w-full">
        Guardar cambios
      </Button>
    </form>
  );
}
