"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import YendoLogo from "@/components/ui/YendoLogo";

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}

function Field({
  label, type = "text", placeholder, value, onChange, required, minLength, autoComplete,
}: {
  label: string; type?: string; placeholder?: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean; minLength?: number; autoComplete?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: "#6b5f54" }}>
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        minLength={minLength}
        autoComplete={autoComplete}
        className="w-full text-sm px-3.5 py-2.5 rounded-xl outline-none transition-all"
        style={{ border: "1.5px solid #e8e0d8", background: "#faf7f2", color: "#1a1714" }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = "#1a1714";
          e.currentTarget.style.boxShadow = "0 0 0 3px rgba(26,23,20,0.08)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = "#e8e0d8";
          e.currentTarget.style.boxShadow = "none";
        }}
      />
    </div>
  );
}

function PasswordField({
  label, placeholder, value, onChange, required, minLength, autoComplete,
}: {
  label: string; placeholder?: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean; minLength?: number; autoComplete?: string;
}) {
  const [show, setShow] = useState(false);

  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: "#6b5f54" }}>
        {label}
      </label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          minLength={minLength}
          autoComplete={autoComplete}
          className="w-full text-sm px-3.5 py-2.5 pr-10 rounded-xl outline-none transition-all"
          style={{ border: "1.5px solid #e8e0d8", background: "#faf7f2", color: "#1a1714" }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "#1a1714";
            e.currentTarget.style.boxShadow = "0 0 0 3px rgba(26,23,20,0.08)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "#e8e0d8";
            e.currentTarget.style.boxShadow = "none";
          }}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
          style={{ color: "#a09088" }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "#1a1714"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "#a09088"; }}
          tabIndex={-1}
          aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
        >
          <EyeIcon open={show} />
        </button>
      </div>
    </div>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (mode === "signup" && password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);

    const supabase = createClient();

    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) {
        setError(error.message);
      } else if (data.user) {
        await supabase.from("profiles").upsert({
          id: data.user.id,
          first_name: firstName,
          last_name: lastName,
          nickname: nickname,
        });

        if (data.session) {
          const next = searchParams.get("next") ?? "/dashboard";
          router.push(next);
          router.refresh();
        } else {
          setSuccessMsg("Revisá tu correo para confirmar tu cuenta. Luego podés iniciar sesión.");
        }
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message === "Invalid login credentials"
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

  function handleModeChange(m: "login" | "signup") {
    setMode(m);
    setError(null);
    setSuccessMsg(null);
    setPassword("");
    setConfirmPassword("");
  }

  return (
    <div
      className="w-full max-w-sm rounded-2xl p-8"
      style={{ background: "#f0ebe3", border: "1px solid #e8e0d8" }}
    >
      <div className="flex rounded-xl p-1 mb-7" style={{ background: "#e8e0d8" }}>
        {(["login", "signup"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => handleModeChange(m)}
            className="flex-1 py-2 text-sm font-medium rounded-lg transition-all"
            style={{
              background: mode === m ? "#faf7f2" : "transparent",
              color: mode === m ? "#1a1714" : "#a09088",
              boxShadow: mode === m ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
            }}
          >
            {m === "login" ? "Iniciar sesión" : "Registrarse"}
          </button>
        ))}
      </div>

      {successMsg ? (
        <div
          className="rounded-xl p-4 text-sm"
          style={{ background: "#faf7f2", border: "1px solid #e8e0d8", color: "#6b5f54" }}
        >
          {successMsg}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Nombre" placeholder="Juan" value={firstName}
                  onChange={(e) => setFirstName(e.target.value)} required autoComplete="given-name" />
                <Field label="Apellido" placeholder="García" value={lastName}
                  onChange={(e) => setLastName(e.target.value)} required autoComplete="family-name" />
              </div>
              <Field label="Apodo" placeholder="juanchi" value={nickname}
                onChange={(e) => setNickname(e.target.value)} required autoComplete="nickname" />
            </>
          )}

          <Field label="Email" type="email" placeholder="tu@email.com" value={email}
            onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />

          <PasswordField
            label="Contraseña"
            placeholder={mode === "signup" ? "Mínimo 6 caracteres" : "Tu contraseña"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
          />

          {mode === "signup" && (
            <PasswordField
              label="Confirmar contraseña"
              placeholder="Repetí tu contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
            />
          )}

          {error && (
            <div
              className="rounded-xl p-3 text-xs"
              style={{ background: "#fff8f5", border: "1px solid #e8e0d8", color: "#c4622d" }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 mt-2"
            style={{ background: loading ? "#1a171480" : "#1a1714", color: "#faf7f2" }}
            onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = "#2d2825"; }}
            onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = "#1a1714"; }}
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                {mode === "login" ? "Entrando..." : "Creando cuenta..."}
              </>
            ) : (
              mode === "login" ? "Entrar" : "Crear cuenta"
            )}
          </button>
        </form>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ background: "#faf7f2", fontFamily: "var(--font-sans)" }}
    >
      <Link href="/" style={{ textDecoration: "none", marginBottom: "32px" }}>
        <YendoLogo height={36} color="#1a1714" />
      </Link>

      <Suspense fallback={
        <div className="w-full max-w-sm rounded-2xl h-64 animate-pulse" style={{ background: "#f0ebe3" }} />
      }>
        <LoginForm />
      </Suspense>

      <p className="mt-6 text-xs" style={{ color: "#a09088" }}>
        Al registrarte aceptás los términos de uso.
      </p>
    </div>
  );
}
