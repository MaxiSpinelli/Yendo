"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Accommodation } from "@/lib/types/database";
import { isoToLocal, localToISO } from "@/lib/utils/date";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";

interface AccommodationFormProps {
  tripId: string;
  existing?: Accommodation;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function AccommodationForm({
  tripId,
  existing,
  onSuccess,
  onCancel,
}: AccommodationFormProps) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: existing?.name ?? "",
    address: existing?.address ?? "",
    checkin_at: existing ? isoToLocal(existing.checkin_at) : "",
    checkout_at: existing ? isoToLocal(existing.checkout_at) : "",
    notes: existing?.notes ?? "",
    cost: existing?.cost?.toString() ?? "",
    cost_type: (existing?.cost_type ?? "total") as "total" | "per_person",
  });

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (form.checkout_at <= form.checkin_at) {
      setError("El check-out debe ser posterior al check-in.");
      setLoading(false);
      return;
    }

    const costValue = form.cost ? parseFloat(form.cost) : null;

    const shared = {
      name: form.name,
      address: form.address,
      checkin_at: localToISO(form.checkin_at),
      checkout_at: localToISO(form.checkout_at),
      notes: form.notes || null,
      cost: costValue,
      cost_type: costValue ? form.cost_type : null,
    };

    const { error } = existing
      ? await supabase.from("accommodations").update(shared).eq("id", existing.id)
      : await supabase.from("accommodations").insert({ trip_id: tripId, ...shared });

    if (error) {
      setError(error.message);
    } else {
      onSuccess();
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Nombre del alojamiento"
        placeholder="Hotel Ibis París"
        value={form.name}
        onChange={(e) => set("name", e.target.value)}
        required
      />

      <Input
        label="Dirección"
        placeholder="Av. Les Champs-Élysées 12, París"
        value={form.address}
        onChange={(e) => set("address", e.target.value)}
        required
      />

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Check-in"
          type="datetime-local"
          value={form.checkin_at}
          onChange={(e) => set("checkin_at", e.target.value)}
          required
        />
        <Input
          label="Check-out"
          type="datetime-local"
          value={form.checkout_at}
          onChange={(e) => set("checkout_at", e.target.value)}
          required
          min={form.checkin_at}
        />
      </div>

      {/* Costo */}
      <div
        className="rounded-2xl p-4"
        style={{ background: "#f0ebe3", border: "1px solid #e8e0d8" }}
      >
        <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "#6b5f54" }}>
          Costo (opcional)
        </p>

        {/* Toggle total / por persona */}
        <div
          className="flex rounded-xl p-1 mb-3"
          style={{ background: "#e8e0d8" }}
        >
          {(["total", "per_person"] as const).map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setForm((f) => ({ ...f, cost_type: opt }))}
              className="flex-1 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                background: form.cost_type === opt ? "#faf7f2" : "transparent",
                color: form.cost_type === opt ? "#1a1714" : "#6b5f54",
                boxShadow: form.cost_type === opt ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
              }}
            >
              {opt === "total" ? "Total" : "Por persona"}
            </button>
          ))}
        </div>

        <input
          type="number"
          min="0"
          step="0.01"
          placeholder={form.cost_type === "total" ? "Ej: 400" : "Ej: 200"}
          value={form.cost}
          onChange={(e) => set("cost", e.target.value)}
          className="w-full text-sm px-3.5 py-2.5 rounded-xl outline-none transition-all"
          style={{ border: "1.5px solid #e8e0d8", background: "#faf7f2", color: "#1a1714" }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "#2d6a4f";
            e.currentTarget.style.boxShadow = "0 0 0 3px #2d6a4f18";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "#e8e0d8";
            e.currentTarget.style.boxShadow = "none";
          }}
        />

        {form.cost && form.cost_type === "total" && (
          <p className="text-xs mt-2" style={{ color: "#a09088" }}>
            Se dividirá por la cantidad de viajeros al mostrar el resumen.
          </p>
        )}
      </div>

      <Textarea
        label="Observaciones (opcional)"
        placeholder="Ej: confirmar reserva 48hs antes, piso 4, habitación doble"
        value={form.notes}
        onChange={(e) => set("notes", e.target.value)}
        rows={2}
      />

      {error && (
        <div className="rounded-xl p-3 text-xs" style={{ background: "#fff8f5", border: "1px solid #e8e0d8", color: "#c4622d" }}>
          {error}
        </div>
      )}

      <div className="flex gap-3 pt-1">
        <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">
          Cancelar
        </Button>
        <Button type="submit" loading={loading} className="flex-1">
          {existing ? "Guardar cambios" : "Agregar alojamiento"}
        </Button>
      </div>
    </form>
  );
}