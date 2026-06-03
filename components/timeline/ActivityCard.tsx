"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Activity } from "@/lib/types/database";
import { formatDateTime } from "@/lib/utils/date";
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
    if (error) {
      toast("No se pudo eliminar la actividad", "error");
    } else {
      toast("Actividad eliminada");
      onRefresh();
    }
  }

  return (
    <>
      <div className="card p-4 border-l-4 border-l-green-400 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-sage-accent flex items-center justify-center flex-shrink-0">
              <span className="text-base">📍</span>
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-navy-900 text-sm truncate">{activity.name}</p>
              {activity.location && (
                <p className="text-xs text-navy-300 mt-0.5 truncate">{activity.location}</p>
              )}
            </div>
          </div>

          {canEdit && (
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => setEditOpen(true)}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-navy-300 hover:bg-cream-dark hover:text-navy-700 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
              <button
                onClick={() => setConfirmOpen(true)}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-navy-300 hover:bg-red-50 hover:text-red-500 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          )}
        </div>

        <div className="mt-2.5 flex items-center gap-1.5 text-xs text-navy-700">
          <svg className="w-3.5 h-3.5 text-navy-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {formatDateTime(activity.starts_at)}
        </div>

        {activity.notes && (
          <p className="mt-2 text-xs text-navy-700 bg-cream rounded-lg px-3 py-2">
            {activity.notes}
          </p>
        )}
      </div>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Editar actividad">
        <ActivityForm
          tripId={activity.trip_id}
          existing={activity}
          onSuccess={() => { setEditOpen(false); onRefresh(); toast("Actividad actualizada"); }}
          onCancel={() => setEditOpen(false)}
        />
      </Modal>

      <ConfirmDialog
        open={confirmOpen}
        title="¿Eliminar actividad?"
        description={`Se eliminará "${activity.name}". Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar actividad"
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
        loading={deleting}
      />
    </>
  );
}
