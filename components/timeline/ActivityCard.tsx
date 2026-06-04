"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Activity } from "@/lib/types/database";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import ActivityForm from "@/components/forms/ActivityForm";
import { toast } from "@/components/ui/Toast";

interface ActivityCardProps {
  activity: Activity;
  onRefresh: () => void;
  canEdit?: boolean;
}

export default function ActivityCard({ activity, onRefresh, canEdit = true }: ActivityCardProps) {
  const supabase = createClient();
  const [editOpen, setEditOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    const { error } = await supabase.from("activities").delete().eq("id", activity.id);
    setDeleting(false);
    setConfirmOpen(false);
    if (error) toast("No se pudo eliminar la actividad", "error");
    else { toast("Actividad eliminada"); onRefresh(); }
  }

  const time = format(parseISO(activity.starts_at), "HH:mm");
  const date = format(parseISO(activity.starts_at), "d MMM", { locale: es });

  return (
    <>
      <div
        className="rounded-2xl p-4 transition-all"
        style={{ border: "1px solid #dfc8b8", background: "#f5ede5" }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className="flex-shrink-0 text-center w-12">
              <p className="font-bold text-base tabular-nums" style={{ color: "#c4622d", lineHeight: 1 }}>
                {time}
              </p>
              <p className="text-xs mt-0.5" style={{ color: "#a09088" }}>
                {date}
              </p>
            </div>

            <div className="w-px self-stretch mx-1" style={{ background: "#dfc8b8" }} />

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <span
                  className="text-xs font-semibold px-2 py-0.5 rounded-md"
                  style={{ background: "#c4622d", color: "#faf7f2" }}
                >
                  Actividad
                </span>
              </div>

              <p className="font-semibold text-sm" style={{ color: "#1a1714" }}>
                {activity.name}
              </p>

              {activity.location && (
                <p className="text-xs mt-0.5" style={{ color: "#6b5f54" }}>
                  📍 {activity.location}
                </p>
              )}

              {activity.notes && (
                <p className="mt-2 text-xs px-3 py-1.5 rounded-lg" style={{ background: "#dfc8b8", color: "#7a3a1a" }}>
                  {activity.notes}
                </p>
              )}
            </div>
          </div>

          {canEdit && (
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => setEditOpen(true)}
                className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors"
                style={{ color: "#c4622d" }}
                onMouseEnter={(e) => e.currentTarget.style.background = "#dfc8b8"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
              <button
                onClick={() => setConfirmOpen(true)}
                className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors"
                style={{ color: "#c4622d" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#f5ede8"; e.currentTarget.style.color = "#8a2a0a"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#c4622d"; }}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Editar actividad">
        <ActivityForm tripId={activity.trip_id} existing={activity}
          onSuccess={() => { setEditOpen(false); onRefresh(); toast("Actividad actualizada"); }}
          onCancel={() => setEditOpen(false)} />
      </Modal>

      <ConfirmDialog open={confirmOpen} title="¿Eliminar actividad?"
        description={`Se eliminará "${activity.name}". Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar actividad" onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)} loading={deleting} />
    </>
  );
}