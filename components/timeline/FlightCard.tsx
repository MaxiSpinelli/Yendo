"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Flight } from "@/lib/types/database";
import { formatDateTime } from "@/lib/utils/date";
import Modal from "@/components/ui/Modal";
import FlightForm from "@/components/forms/FlightForm";

interface FlightCardProps {
  flight: Flight;
  onRefresh: () => void;
}

export default function FlightCard({ flight, onRefresh }: FlightCardProps) {
  const supabase = createClient();
  const [editOpen, setEditOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm("¿Eliminar este vuelo?")) return;
    setDeleting(true);
    await supabase.from("flights").delete().eq("id", flight.id);
    onRefresh();
  }

  return (
    <>
      <div className="card p-4 border-l-4 border-l-sky-400 hover:shadow-md transition-shadow">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center flex-shrink-0">
              <span className="text-base">✈️</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-semibold text-stone-900 text-sm">{flight.airline}</span>
                <span className="text-xs text-stone-400 font-mono">{flight.flight_number}</span>
              </div>
              <p className="text-sm text-stone-700 mt-0.5">
                {flight.origin}
                <span className="mx-1.5 text-stone-400">→</span>
                {flight.destination}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => setEditOpen(true)}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-stone-400 hover:bg-stone-100 hover:text-stone-600 transition-colors"
              title="Editar"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-stone-400 hover:bg-red-50 hover:text-red-500 transition-colors"
              title="Eliminar"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Date */}
        <div className="mt-2.5 flex items-center gap-1.5 text-xs text-stone-500">
          <svg className="w-3.5 h-3.5 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {formatDateTime(flight.departure_at)}
        </div>

        {flight.notes && (
          <p className="mt-2 text-xs text-stone-500 bg-stone-50 rounded-lg px-3 py-2">
            {flight.notes}
          </p>
        )}
      </div>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Editar vuelo">
        <FlightForm
          tripId={flight.trip_id}
          existing={flight}
          onSuccess={() => { setEditOpen(false); onRefresh(); }}
          onCancel={() => setEditOpen(false)}
        />
      </Modal>
    </>
  );
}
