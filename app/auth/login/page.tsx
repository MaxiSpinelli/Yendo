"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    const supabase = createClient();

    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        setError(error.message);
      } else if (data.user) {
        // Guardar perfil
        await supabase.from("profiles").upsert({
          id: data.user.id,
          first_name: firstName,
          last_name: lastName,
          nickname: nickname,
        });
        setSuccessMsg(
          "Revisá tu correo para confirmar tu cuenta. Luego podés iniciar sesión."
        );
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setError(
          error.message === "Invalid login credentials"
            ? "Email o contraseña incorrectos."
            : error.message
        );
      } else {
        const next = searchParams.get("next") ?? "/dashboard";
        router.push(next);
        router.refresh();
      }
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center px-4 py-12">
      <Link
        href="/"
        className="font-display text-3xl text-brand-700 mb-10 tracking-tight hover:text-brand-800 transition-colors"
      >
        Yendo
      </Link>

      <div className="card w-full max-w-sm p-8">
        <div className="flex rounded-xl bg-stone-100 p-1 mb-7">
          {(["login", "signup"] as const).map((m) => (
            <button
              key={m}
              onClick={() => {
                setMode(m);
                setError(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                mode === m
                  ? "bg-white text-stone-900 shadow-sm"
                  : "text-stone-500 hover:text-stone-700"
              }`}
            >
              {m === "login" ? "Iniciar sesión" : "Registrarse"}
            </button>
          ))}
        </div>

        {successMsg ? (
          <div className="bg-brand-50 border border-brand-100 rounded-xl p-4 text-sm text-brand-700">
            {successMsg}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <>
                <div className="flex gap-3">
                  <Input
                    label="Nombre"
                    type="text"
                    placeholder="Juan"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    autoComplete="given-name"
                  />
                  <Input
                    label="Apellido"
                    type="text"
                    placeholder="García"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    autoComplete="family-name"
                  />
                </div>
                <Input
                  label="Apodo"
                  type="text"
                  placeholder="juanchi"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  required
                  autoComplete="nickname"
                />
              </>
            )}
            <Input
              label="Email"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <Input
              label="Contraseña"
              type="password"
              placeholder={mode === "signup" ? "Mínimo 6 caracteres" : "Tu contraseña"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
            />

            {error && (
              <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-xs text-red-600">
                {error}
              </div>
            )}

            <Button type="submit" loading={loading} className="w-full mt-2">
              {mode === "login" ? "Entrar" : "Crear cuenta"}
            </Button>
          </form>
        )}
      </div>

      <p className="mt-6 text-xs text-stone-400">
        Al registrarte aceptás los términos de uso.
      </p>
    </div>
  );
}