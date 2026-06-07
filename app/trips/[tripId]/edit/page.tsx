"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import Navbar from "@/components/layout/Navbar";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import PageTransition from "@/components/ui/PageTransition";

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
  const [showConfirm, setShowConfirm] = useState(false);

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

  useEffect(() => { load(); }, [load]);

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
    const { error } = await supabase.from("trips").update(form).eq("id", params.tripId);
    if (error) { setError(error.message); setLoading(false); }
    else { router.push(`/trips/${params.tripId}`); }
  }

  async function handleDelete() {
    setDeleting(true);
    const supabase = createClient();
    await supabase.from("trips").delete().eq("id", params.tripId);
    router.push("/dashboard");
  }

  if (fetching) {
    return (
      <div style={{ minHeight: "100vh", background: "#faf7f2", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 24, height: 24, border: "2px solid #e8e0d8", borderTopColor: "#1a1714", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#faf7f2", fontFamily: "var(--font-sans)" }}>
      <Navbar breadcrumb={{ label: "Editar viaje", href: `/trips/${params.tripId}/edit` }} />

      <PageTransition>
        <main style={{ maxWidth: "520px", margin: "0 auto", padding: "40px 24px" }}>
          <Link
            href={`/trips/${params.tripId}`}
            style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#6b5f54", textDecoration: "none", marginBottom: "24px" }}
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver al viaje
          </Link>

          <div style={{ background: "#f0ebe3", border: "1px solid #e8e0d8", borderRadius: "20px", padding: "28px" }}>
            <h1 style={{ fontSize: "18px", fontWeight: 500, color: "#1a1714", margin: "0 0 24px" }}>
              Editar viaje
            </h1>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <Input label="Nombre del viaje" name="name" value={form.name} onChange={handleChange} required />
              <Input label="Destino" name="destination" value={form.destination} onChange={handleChange} required />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <Input label="Fecha de inicio" name="start_date" type="date" value={form.start_date} onChange={handleChange} required />
                <Input label="Fecha de fin" name="end_date" type="date" value={form.end_date} onChange={handleChange} required min={form.start_date} />
              </div>

              {error && (
                <div style={{ background: "#f5ede8", border: "1px solid #dfc8b8", borderRadius: "12px", padding: "10px 14px", fontSize: "12px", color: "#c4622d" }}>
                  {error}
                </div>
              )}

              <div style={{ display: "flex", gap: "10px", paddingTop: "4px" }}>
                <Link
                  href={`/trips/${params.tripId}`}
                  style={{ flex: 1, textAlign: "center", padding: "10px", borderRadius: "12px", fontSize: "13px", fontWeight: 500, color: "#1a1714", background: "#e8e0d8", textDecoration: "none" }}
                >
                  Cancelar
                </Link>
                <Button type="submit" loading={loading} className="flex-1">
                  Guardar
                </Button>
              </div>
            </form>

            <div style={{ marginTop: "28px", paddingTop: "20px", borderTop: "1px solid #e8e0d8" }}>
              <p style={{ fontSize: "11px", color: "#a09088", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Zona peligrosa
              </p>
              <Button
                type="button"
                variant="danger"
                onClick={() => setShowConfirm(true)}
                loading={deleting}
                className="w-full"
              >
                Eliminar este viaje
              </Button>
            </div>
          </div>
        </main>
      </PageTransition>

      <ConfirmDialog
        open={showConfirm}
        title="Eliminar viaje"
        description="Se eliminará todo el contenido (vuelos, alojamientos, actividades) y todos los miembros perderán el acceso. Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        danger
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
}
