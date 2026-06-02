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

    const shared = {
      name: form.name,
      address: form.address,
      checkin_at: localToISO(form.checkin_at),
      checkout_at: localToISO(form.checkout_at),
      notes: form.notes || null,
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

      <Textarea
        label="Observaciones (opcional)"
        placeholder="Ej: confirmar reserva 48hs antes, piso 4, habitación doble"
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
          {existing ? "Guardar cambios" : "Agregar alojamiento"}
        </Button>
      </div>
    </form>
  );
}
