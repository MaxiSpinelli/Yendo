"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Flight } from "@/lib/types/database";
import { isoToLocal, localToISO } from "@/lib/utils/date";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";

interface FlightFormProps {
  tripId: string;
  existing?: Flight;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function FlightForm({
  tripId,
  existing,
  onSuccess,
  onCancel,
}: FlightFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const [form, setForm] = useState({
    airline: existing?.airline ?? "",
    flight_number: existing?.flight_number ?? "",
    origin: existing?.origin ?? "",
    destination: existing?.destination ?? "",
    departure_at: existing ? isoToLocal(existing.departure_at) : "",
    notes: existing?.notes ?? "",
  });

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setExtractError(null);
    setExtracting(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/extract-flight", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();

      if (!res.ok || json.error) {
        setExtractError(json.error ?? "Error al procesar el archivo");
        setExtracting(false);
        return;
      }

      const d = json.data;

      // Pre-fill form with extracted data — only override empty fields
      setForm((prev) => ({
        airline:       d.airline       ?? prev.airline,
        flight_number: d.flight_number ?? prev.flight_number,
        origin:        d.origin        ?? prev.origin,
        destination:   d.destination   ?? prev.destination,
        departure_at:  d.departure_at
          ? isoToLocal(d.departure_at)
          : prev.departure_at,
        notes: d.notes ?? prev.notes,
      }));
    } catch {
      setExtractError("No se pudo conectar con el servidor");
    } finally {
      setExtracting(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();

    const shared = {
      airline: form.airline,
      flight_number: form.flight_number,
      origin: form.origin,
      destination: form.destination,
      departure_at: localToISO(form.departure_at),
      notes: form.notes || null,
    };

    const { error } = existing
      ? await supabase.from("flights").update(shared).eq("id", existing.id)
      : await supabase.from("flights").insert({ trip_id: tripId, ...shared });

    if (error) {
      setError(error.message);
    } else {
      onSuccess();
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* ── Upload section ── */}
      {!existing && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileChange}
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={extracting}
            className={`w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl border-2 border-dashed text-sm font-medium transition-all
              ${extracting
                ? "border-brand-200 bg-brand-50 text-brand-500 cursor-wait"
                : "border-stone-200 text-stone-500 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-600 cursor-pointer"
              }`}
          >
            {extracting ? (
              <>
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Analizando pasaje con IA...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {fileName ? `✓ ${fileName}` : "Subir pasaje (PDF o imagen)"}
              </>
            )}
          </button>

          {fileName && !extracting && !extractError && (
            <p className="mt-1.5 text-xs text-brand-600 text-center">
              ✓ Datos extraídos — revisá y corregí si es necesario
            </p>
          )}

          {extractError && (
            <div className="mt-2 bg-amber-50 border border-amber-100 rounded-xl p-3 text-xs text-amber-700">
              {extractError} — podés completar los datos manualmente.
            </div>
          )}

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-stone-100" />
            <span className="text-xs text-stone-400">o completá manualmente</span>
            <div className="flex-1 h-px bg-stone-100" />
          </div>
        </div>
      )}

      {/* ── Form fields ── */}
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Aerolínea"
          placeholder="Aerolíneas Argentinas"
          value={form.airline}
          onChange={(e) => set("airline", e.target.value)}
          required
        />
        <Input
          label="Nro. de vuelo"
          placeholder="AR 1234"
          value={form.flight_number}
          onChange={(e) => set("flight_number", e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Origen"
          placeholder="EZE"
          value={form.origin}
          onChange={(e) => set("origin", e.target.value)}
          required
        />
        <Input
          label="Destino"
          placeholder="CDG"
          value={form.destination}
          onChange={(e) => set("destination", e.target.value)}
          required
        />
      </div>

      <Input
        label="Fecha y hora de salida"
        type="datetime-local"
        value={form.departure_at}
        onChange={(e) => set("departure_at", e.target.value)}
        required
      />

      <Textarea
        label="Observaciones (opcional)"
        placeholder="Ej: check-in online disponible 24hs antes"
        value={form.notes}
        onChange={(e) => set("notes", e.target.value)}
        rows={2}
      />

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-xs text-red-600">
          {error}
        </div>
      )}

      <div className="flex gap-3 pt-1">
        <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">
          Cancelar
        </Button>
        <Button type="submit" loading={loading} className="flex-1">
          {existing ? "Guardar cambios" : "Agregar vuelo"}
        </Button>
      </div>
    </form>
  );
}
