"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import Navbar from "@/components/layout/Navbar";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function EditTripPage() {
  const router = useRouter();
  const params = useParams<{ tripId: string }>();

  const [form, setForm] = useState({
    name: "",
    destination: "",
    start_date: "",
    end_date: "",
  });
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("trips")
      .select("*")
      .eq("id", params.tripId)
      .single();
    if (data) {
      setForm({
        name: data.name,
        destination: data.destination,
        start_date: data.start_date,
        end_date: data.end_date,
      });
    }
    setFetching(false);
  }, [params.tripId]);

  useEffect(() => {
    load();
  }, [load]);

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
    const { error } = await supabase
      .from("trips")
      .update(form)
      .eq("id", params.tripId);
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push(`/trips/${params.tripId}`);
    }
  }

  async function handleDelete() {
    if (
      !confirm(
        "¿Eliminar este viaje? Se eliminará todo el contenido (vuelos, alojamientos, actividades) y todos los miembros perderán el acceso. Esta acción no se puede deshacer."
      )
    )
      return;
    setDeleting(true);
    const supabase = createClient();
    await supabase.from("trips").delete().eq("id", params.tripId);
    router.push("/dashboard");
  }

  if (fetching) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-amber/40 border-t-amber rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />

      <main className="max-w-lg mx-auto px-4 py-10">
        <Link
          href={`/trips/${params.tripId}`}
          className="inline-flex items-center gap-1.5 text-sm text-navy-300 hover:text-navy-700 mb-6 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver al viaje
        </Link>

        <div className="card p-7">
          <h1 className="text-xl font-semibold text-navy-900 mb-7">Editar viaje</h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Nombre del viaje"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
            <Input
              label="Destino"
              name="destination"
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
              <Link
                href={`/trips/${params.tripId}`}
                className="btn-secondary flex-1 text-center"
              >
                Cancelar
              </Link>
              <Button type="submit" loading={loading} className="flex-1">
                Guardar
              </Button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-navy-100">
            <p className="text-xs text-navy-300 mb-3">Zona peligrosa</p>
            <Button
              type="button"
              variant="danger"
              onClick={handleDelete}
              loading={deleting}
              className="w-full"
            >
              Eliminar este viaje
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
