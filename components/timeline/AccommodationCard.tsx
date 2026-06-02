"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Accommodation } from "@/lib/types/database";
import { formatDateTime } from "@/lib/utils/date";
import Modal from "@/components/ui/Modal";
import AccommodationForm from "@/components/forms/AccommodationForm";

interface AccommodationCardProps {
  accommodation: Accommodation;
  onRefresh: () => void;
}

export default function AccommodationCard({
  accommodation,
  onRefresh,
}: AccommodationCardProps) {
  const supabase = createClient();
  const [editOpen, setEditOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm("¿Eliminar este alojamiento?")) return;
    setDeleting(true);
    await supabase.from("accommodations").delete().eq("id", accommodation.id);
    onRefresh();
  }

  return (
    <>
      <div className="card p-4 border-l-4 border-l-amber-400 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
              <span className="text-base">🏨</span>
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-stone-900 text-sm truncate">{accommodation.name}</p>
              <p className="text-xs text-stone-500 mt-0.5 truncate">{accommodation.address}</p>
            </div>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => setEditOpen(true)}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-stone-400 hover:bg-stone-100 hover:text-stone-600 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-stone-400 hover:bg-red-50 hover:text-red-500 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        <div className="mt-2.5 grid grid-cols-2 gap-2 text-xs text-stone-500">
          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            <span>Check-in: {formatDateTime(accommodation.checkin_at)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Check-out: {formatDateTime(accommodation.checkout_at)}</span>
          </div>
        </div>

        {accommodation.notes && (
          <p className="mt-2 text-xs text-stone-500 bg-stone-50 rounded-lg px-3 py-2">
            {accommodation.notes}
          </p>
        )}
      </div>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Editar alojamiento">
        <AccommodationForm
          tripId={accommodation.trip_id}
          existing={accommodation}
          onSuccess={() => { setEditOpen(false); onRefresh(); }}
          onCancel={() => setEditOpen(false)}
        />
      </Modal>
    </>
  );
}
