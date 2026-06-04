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
    <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: "#6b5f54" }}>
      {children}
    </label>
  );
}

function FieldInput({
  placeholder, value, onChange, type = "text", required, accent, min,
}: {
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  required?: boolean;
  accent?: string;
  min?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      min={min}
      className="w-full text-sm px-3.5 py-2.5 rounded-xl outline-none transition-all"
      style={{ border: "1.5px solid #e8e0d8", background: "#faf7f2", color: "#1a1714" }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = accent ?? "#2563eb";
        e.currentTarget.style.background = "#ffffff";
        e.currentTarget.style.boxShadow = `0 0 0 3px ${accent ? accent + "18" : "#2563eb18"}`;
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = "#e8e0d8";
        e.currentTarget.style.background = "#faf7f2";
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
        ...prev,
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
              border: extracting ? "2px dashed #2563eb40" : fileName && !extractError ? "2px dashed #2d6a4f60" : "2px dashed #e8e0d8",
              background: extracting ? "#f0f4ff" : fileName && !extractError ? "#f0faf7" : "#faf7f2",
              cursor: extracting ? "wait" : "pointer",
            }}
          >
            {extracting ? (
              <>
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="#2563eb" strokeWidth="4"/>
                  <path className="opacity-75" fill="#2563eb" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                <span className="text-sm font-medium" style={{ color: "#2563eb" }}>
                  Analizando pasaje con IA...
                </span>
              </>
            ) : fileName && !extractError ? (
              <>
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "#2d6a4f20" }}>
                  <svg className="w-4 h-4" style={{ color: "#2d6a4f" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium" style={{ color: "#2d6a4f" }}>Datos extraídos</p>
                  <p className="text-xs" style={{ color: "#6b5f54" }}>Revisá y corregí si es necesario</p>
                </div>
              </>
            ) : (
              <>
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "#2563eb12" }}>
                  <svg className="w-4 h-4" style={{ color: "#2563eb" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium" style={{ color: "#1a1714" }}>Subir pasaje con IA</p>
                  <p className="text-xs" style={{ color: "#6b5f54" }}>PDF, JPG o PNG — se completa solo</p>
                </div>
              </>
            )}
          </button>

          {extractError && (
            <div className="mt-2 px-4 py-3 rounded-xl text-xs" style={{ background: "#fff8f5", border: "1px solid #e8e0d8", color: "#c4622d" }}>
              {extractError} — completá los datos manualmente.
            </div>
          )}

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px" style={{ background: "#e8e0d8" }} />
            <span className="text-xs" style={{ color: "#a09088" }}>o completá manualmente</span>
            <div className="flex-1 h-px" style={{ background: "#e8e0d8" }} />
          </div>
        </div>
      )}

      {/* Ruta */}
      <div className="mb-5 p-4 rounded-2xl" style={{ background: "#eef3ff", border: "1px solid #dde8ff" }}>
        <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "#2563eb" }}>
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
              accent="#2563eb"
            />
          </div>
          <div className="flex-shrink-0 mt-5">
            <svg className="w-5 h-5" style={{ color: "#2563eb" }} fill="currentColor" viewBox="0 0 24 24">
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
              accent="#2563eb"
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
          style={{ border: "1.5px solid #e8e0d8", background: "#faf7f2", color: "#1a1714" }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "#2563eb";
            e.currentTarget.style.background = "#ffffff";
            e.currentTarget.style.boxShadow = "0 0 0 3px #2563eb18";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "#e8e0d8";
            e.currentTarget.style.background = "#faf7f2";
            e.currentTarget.style.boxShadow = "none";
          }}
        />
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl text-xs" style={{ background: "#fff8f5", border: "1px solid #e8e0d8", color: "#c4622d" }}>
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
          style={{ border: "1.5px solid #e8e0d8", color: "#6b5f54", background: "#faf7f2" }}
          onMouseEnter={(e) => e.currentTarget.style.background = "#f0ebe3"}
          onMouseLeave={(e) => e.currentTarget.style.background = "#faf7f2"}
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2"
          style={{ background: loading ? "#2563eb80" : "#2563eb", color: "white" }}
          onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = "#1d4ed8"; }}
          onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = "#2563eb"; }}
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