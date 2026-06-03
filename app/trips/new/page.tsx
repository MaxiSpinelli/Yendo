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

    if (!user) {
      router.push("/auth/login");
      return;
    }

    const { data, error } = await supabase
      .from("trips")
      .insert({
        owner_id: user.id,
        name: form.name,
        destination: form.destination,
        start_date: form.start_date,
        end_date: form.end_date,
      })
      .select()
      .single();

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push(`/trips/${data.id}`);
  }

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />

      <main className="max-w-lg mx-auto px-4 py-10">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-navy-300 hover:text-navy-700 mb-6 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Mis viajes
        </Link>

        <div className="card p-7">
          <h1 className="text-xl font-semibold text-navy-900 mb-1">Nuevo viaje</h1>
          <p className="text-sm text-navy-700 mb-7">
            Completá los datos básicos. Después podés agregar vuelos, alojamientos y actividades.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
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
              placeholder="Ej: París, Francia"
              value={form.destination}
              onChange={handleChange}
              required
            />
            <div className="grid grid-cols-2 gap-4">
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
              <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-xs text-red-600">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <Link href="/dashboard" className="btn-secondary flex-1 text-center">
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
