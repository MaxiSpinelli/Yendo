"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Activity } from "@/lib/types/database";
import { isoToLocal, localToISO } from "@/lib/utils/date";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";

interface ActivityFormProps {
  tripId: string;
  existing?: Activity;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ActivityForm({
  tripId,
  existing,
  onSuccess,
  onCancel,
}: ActivityFormProps) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: existing?.name ?? "",
    starts_at: existing ? isoToLocal(existing.starts_at) : "",
    location: existing?.location ?? "",
    notes: existing?.notes ?? "",
  });

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const shared = {
      name: form.name,
      starts_at: localToISO(form.starts_at),
      location: form.location || null,
      notes: form.notes || null,
    };

    const { error } = existing
      ? await supabase.from("activities").update(shared).eq("id", existing.id)
      : await supabase.from("activities").insert({ trip_id: tripId, ...shared });

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
        label="Nombre de la actividad"
        placeholder="Tour por el Louvre"
        value={form.name}
        onChange={(e) => set("name", e.target.value)}
        required
      />

      <Input
        label="Fecha y hora"
        type="datetime-local"
        value={form.starts_at}
        onChange={(e) => set("starts_at", e.target.value)}
        required
      />

      <Input
        label="Ubicación (opcional)"
        placeholder="Rue de Rivoli 99, París"
        value={form.location}
        onChange={(e) => set("location", e.target.value)}
      />

      <Textarea
        label="Notas (opcional)"
        placeholder="Ej: entrada comprada online, encontrarse en la entrada principal"
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
          {existing ? "Guardar cambios" : "Agregar actividad"}
        </Button>
      </div>
    </form>
  );
}
