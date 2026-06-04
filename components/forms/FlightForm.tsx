"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Flight } from "@/lib/types/database";
import { isoToLocal, localToISO } from "@/lib/utils/date";

interface FlightFormProps {
  tripId: string;
  existing?: Flight;
  onSuccess: () => void;
  onCancel: () => void;
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: "#6b6b7b" }}>
      {children}
    </label>
  );
}

function FieldInput({
  placeholder, value, onChange, type = "text", required, accent,
}: {
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  required?: boolean;
  accent?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className="w-full text-sm px-3.5 py-2.5 rounded-xl outline-none transition-all"
      style={{ border: "1.5px solid #ebebed", background: "#fafafa", color: "#0a0a0b" }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = accent ?? "#0066ff";
        e.currentTarget.style.background = "#ffffff";
        e.currentTarget.style.boxShadow = `0 0 0 3px ${accent ? accent + "18" : "#0066ff18"}`;
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = "#ebebed";
        e.currentTarget.style.background = "#fafafa";
        e.currentTarget.style.boxShadow = "none";
      }}
    />
  );
}

export default function FlightForm({ tripId, existing, onSuccess, onCancel }: FlightFormProps) {
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

  if (file.size > 4 * 1024 * 1024) {
    setExtractError("El archivo es demasiado grande. Usá un PDF o imagen de menos de 4MB.");
    return;
  }

  setFileName(file.name);
  setExtractError(null);
  setExtracting(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/extract-flight", { method: "POST", body: formData });
      const json = await res.json();
      if (!res.ok || json.error) {
        setExtractError(json.error ?? "Error al procesar el archivo");
        return;
      }
      const d = json.data;
      setForm((prev) => ({
        airline: d.airline ?? prev.airline,
        flight_number: d.flight_number ?? prev.flight_number,
        origin: d.origin ?? prev.origin,
        destination: d.destination ?? prev.destination,
        departure_at: d.departure_at ? isoToLocal(d.departure_at) : prev.departure_at,
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
    if (error) setError(error.message);
    else onSuccess();
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit}>

      {/* Upload con IA — solo al crear */}
      {!existing && (
        <div className="mb-5">
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
            className="w-full flex items-center justify-center gap-3 px-4 py-4 rounded-2xl transition-all"
            style={{
              border: extracting ? "2px dashed #0066ff40" : fileName && !extractError ? "2px dashed #00a67e60" : "2px dashed #d0d0d8",
              background: extracting ? "#f0f4ff" : fileName && !extractError ? "#f0faf7" : "#fafafa",
              cursor: extracting ? "wait" : "pointer",
            }}
          >
            {extracting ? (
              <>
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="#0066ff" strokeWidth="4"/>
                  <path className="opacity-75" fill="#0066ff" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                <span className="text-sm font-medium" style={{ color: "#0066ff" }}>
                  Analizando pasaje con IA...
                </span>
              </>
            ) : fileName && !extractError ? (
              <>
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "#00a67e20" }}>
                  <svg className="w-4 h-4" style={{ color: "#00a67e" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium" style={{ color: "#00a67e" }}>Datos extraídos</p>
                  <p className="text-xs" style={{ color: "#6b6b7b" }}>Revisá y corregí si es necesario</p>
                </div>
              </>
            ) : (
              <>
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "#f0f4ff" }}>
                  <svg className="w-4 h-4" style={{ color: "#0066ff" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium" style={{ color: "#0a0a0b" }}>Subir pasaje con IA</p>
                  <p className="text-xs" style={{ color: "#6b6b7b" }}>PDF, JPG o PNG — se completa solo</p>
                </div>
              </>
            )}
          </button>

          {extractError && (
            <div className="mt-2 px-4 py-3 rounded-xl text-xs" style={{ background: "#fff8f5", border: "1px solid #fde0cc", color: "#c05010" }}>
              {extractError} — completá los datos manualmente.
            </div>
          )}

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px" style={{ background: "#ebebed" }} />
            <span className="text-xs" style={{ color: "#a0a0b0" }}>o completá manualmente</span>
            <div className="flex-1 h-px" style={{ background: "#ebebed" }} />
          </div>
        </div>
      )}

      {/* Ruta visual — origen y destino destacados */}
      <div className="mb-5 p-4 rounded-2xl" style={{ background: "#f0f4ff", border: "1px solid #dde8ff" }}>
        <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "#6b96ff" }}>
          Ruta del vuelo
        </p>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <FieldLabel>Origen</FieldLabel>
            <FieldInput
              placeholder="EZE o Buenos Aires"
              value={form.origin}
              onChange={(e) => set("origin", e.target.value)}
              required
              accent="#0066ff"
            />
          </div>

          <div className="flex-shrink-0 mt-5">
            <svg className="w-5 h-5" style={{ color: "#0066ff" }} fill="currentColor" viewBox="0 0 24 24">
              <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
            </svg>
          </div>

          <div className="flex-1">
            <FieldLabel>Destino</FieldLabel>
            <FieldInput
              placeholder="CDG o París"
              value={form.destination}
              onChange={(e) => set("destination", e.target.value)}
              required
              accent="#0066ff"
            />
          </div>
        </div>
      </div>

      {/* Aerolínea y número */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <FieldLabel>Aerolínea</FieldLabel>
          <FieldInput
            placeholder="LATAM, Aerolíneas..."
            value={form.airline}
            onChange={(e) => set("airline", e.target.value)}
            required
          />
        </div>
        <div>
          <FieldLabel>Nro. de vuelo</FieldLabel>
          <FieldInput
            placeholder="LA 1234"
            value={form.flight_number}
            onChange={(e) => set("flight_number", e.target.value)}
            required
          />
        </div>
      </div>

      {/* Fecha */}
      <div className="mb-4">
        <FieldLabel>Fecha y hora de salida</FieldLabel>
        <FieldInput
          type="datetime-local"
          value={form.departure_at}
          onChange={(e) => set("departure_at", e.target.value)}
          required
        />
      </div>

      {/* Notas */}
      <div className="mb-5">
        <FieldLabel>Observaciones (opcional)</FieldLabel>
        <textarea
          value={form.notes}
          onChange={(e) => set("notes", e.target.value)}
          placeholder="Terminal, equipaje, check-in online..."
          rows={2}
          className="w-full text-sm px-3.5 py-2.5 rounded-xl outline-none transition-all resize-none"
          style={{ border: "1.5px solid #ebebed", background: "#fafafa", color: "#0a0a0b" }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "#0066ff";
            e.currentTarget.style.background = "#ffffff";
            e.currentTarget.style.boxShadow = "0 0 0 3px #0066ff18";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "#ebebed";
            e.currentTarget.style.background = "#fafafa";
            e.currentTarget.style.boxShadow = "none";
          }}
        />
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl text-xs" style={{ background: "#fff0f0", border: "1px solid #fecaca", color: "#e53e3e" }}>
          {error}
        </div>
      )}

      {/* Acciones */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
          style={{ border: "1.5px solid #ebebed", color: "#6b6b7b", background: "white" }}
          onMouseEnter={(e) => e.currentTarget.style.background = "#f7f7f8"}
          onMouseLeave={(e) => e.currentTarget.style.background = "white"}
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2"
          style={{ background: loading ? "#0066ff80" : "#0066ff", color: "white" }}
          onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = "#0052cc"; }}
          onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = "#0066ff"; }}
        >
          {loading ? (
            <>
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Guardando...
            </>
          ) : (
            existing ? "Guardar cambios" : "Agregar vuelo"
          )}
        </button>
      </div>
    </form>
  );
}