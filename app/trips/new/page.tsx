"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import Navbar from "@/components/layout/Navbar";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function NewTripPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    destination: "",
    start_date: "",
    end_date: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadNickname() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase
        .from("profiles")
        .select("nickname")
        .eq("id", user.id)
        .single();
      if (profile?.nickname) {
        setForm((f) => ({ ...f, name: `Viaje de ${profile.nickname}` }));
      }
    }
    loadNickname();
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (form.end_date < form.start_date) {
      setError("La fecha de fin no puede ser anterior a la de inicio.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/auth/login"); return; }
    const { data, error } = await supabase
      .from("trips")
      .insert({ owner_id: user.id, name: form.name, destination: form.destination, start_date: form.start_date, end_date: form.end_date })
      .select()
      .single();
    if (error) { setError(error.message); setLoading(false); return; }
    router.push(`/trips/${data.id}`);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#faf7f2", fontFamily: "var(--font-sans)" }}>
      <Navbar />

      <main style={{ maxWidth: "520px", margin: "0 auto", padding: "40px 24px" }}>
        <Link
          href="/dashboard"
          style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#6b5f54", textDecoration: "none", marginBottom: "24px" }}
        >
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Mis viajes
        </Link>

        <div style={{ background: "#f0ebe3", border: "1px solid #e8e0d8", borderRadius: "20px", padding: "28px" }}>
          <h1 style={{ fontSize: "18px", fontWeight: 500, color: "#1a1714", margin: "0 0 6px" }}>
            Nuevo viaje
          </h1>
          <p style={{ fontSize: "13px", color: "#6b5f54", margin: "0 0 24px" }}>
            Completá los datos básicos. Después podés agregar vuelos, alojamientos y actividades.
          </p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <Input
              label="Nombre del viaje"
              name="name"
              placeholder="Ej: Eurotrip 2025"
              value={form.name}
              onChange={handleChange}
              required
            />
            <Input
              label="Destino"
              name="destination"
              placeholder="Ej: París, Roma, Barcelona"
              value={form.destination}
              onChange={handleChange}
              required
            />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <Input
                label="Fecha de inicio"
                name="start_date"
                type="date"
                value={form.start_date}
                onChange={handleChange}
                required
              />
              <Input
                label="Fecha de fin"
                name="end_date"
                type="date"
                value={form.end_date}
                onChange={handleChange}
                required
                min={form.start_date}
              />
            </div>

            {error && (
              <div style={{ background: "#f5ede8", border: "1px solid #dfc8b8", borderRadius: "12px", padding: "10px 14px", fontSize: "12px", color: "#c4622d" }}>
                {error}
              </div>
            )}

            <div style={{ display: "flex", gap: "10px", paddingTop: "4px" }}>
              <Link
                href="/dashboard"
                style={{ flex: 1, textAlign: "center", padding: "10px", borderRadius: "12px", fontSize: "13px", fontWeight: 500, color: "#1a1714", background: "#e8e0d8", textDecoration: "none" }}
              >
                Cancelar
              </Link>
              <Button type="submit" loading={loading} className="flex-1">
                Crear viaje
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}