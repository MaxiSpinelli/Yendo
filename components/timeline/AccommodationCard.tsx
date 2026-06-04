"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Accommodation } from "@/lib/types/database";
import { format, parseISO, differenceInDays } from "date-fns";
import { es } from "date-fns/locale";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import AccommodationForm from "@/components/forms/AccommodationForm";
import { toast } from "@/components/ui/Toast";

interface AccommodationCardProps {
  accommodation: Accommodation;
  onRefresh: () => void;
  canEdit?: boolean;
}

export default function AccommodationCard({ accommodation, onRefresh, canEdit = true }: AccommodationCardProps) {
  const supabase = createClient();
  const [editOpen, setEditOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    const { error } = await supabase.from("accommodations").delete().eq("id", accommodation.id);
    setDeleting(false);
    setConfirmOpen(false);
    if (error) toast("No se pudo eliminar el alojamiento", "error");
    else { toast("Alojamiento eliminado"); onRefresh(); }
  }

  const nights = differenceInDays(
    parseISO(accommodation.checkout_at),
    parseISO(accommodation.checkin_at)
  );

  const checkin = format(parseISO(accommodation.checkin_at), "d MMM · HH:mm", { locale: es });
  const checkout = format(parseISO(accommodation.checkout_at), "d MMM · HH:mm", { locale: es });

  return (
    <>
      <div
        className="rounded-2xl p-4 transition-all"
        style={{ border: "1px solid #c0d8cc", background: "#eaf4f0" }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
              style={{ background: "rgba(45,106,79,0.12)" }}
            >
              🏨
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="text-xs font-semibold px-2 py-0.5 rounded-md"
                  style={{ background: "#2d6a4f", color: "#faf7f2" }}
                >
                  Hotel
                </span>
                {nights > 0 && (
                  <span className="text-xs" style={{ color: "#2d6a4f" }}>
                    {nights} {nights === 1 ? "noche" : "noches"}
                  </span>
                )}
              </div>

              <p className="font-semibold text-sm" style={{ color: "#1a1714" }}>
                {accommodation.name}
              </p>

              {accommodation.address && (
                <p className="text-xs mt-0.5 truncate" style={{ color: "#6b5f54" }}>
                  📍 {accommodation.address}
                </p>
              )}

              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-medium" style={{ color: "#2d6a4f" }}>In</span>
                  <span className="text-xs" style={{ color: "#1a1714" }}>{checkin}</span>
                </div>
                <div className="w-px h-3" style={{ background: "#c0d8cc" }} />
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-medium" style={{ color: "#6b5f54" }}>Out</span>
                  <span className="text-xs" style={{ color: "#1a1714" }}>{checkout}</span>
                </div>
              </div>

              {accommodation.notes && (
                <p className="mt-2 text-xs px-3 py-1.5 rounded-lg" style={{ background: "#c8e8d8", color: "#1a4a34" }}>
                  {accommodation.notes}
                </p>
              )}
            </div>
          </div>

          {canEdit && (
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => setEditOpen(true)}
                className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors"
                style={{ color: "#2d6a4f" }}
                onMouseEnter={(e) => e.currentTarget.style.background = "#c0d8cc"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
              <button
                onClick={() => setConfirmOpen(true)}
                className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors"
                style={{ color: "#2d6a4f" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#f5ede8"; e.currentTarget.style.color = "#c4622d"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#2d6a4f"; }}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Editar alojamiento">
        <AccommodationForm tripId={accommodation.trip_id} existing={accommodation}
          onSuccess={() => { setEditOpen(false); onRefresh(); toast("Alojamiento actualizado"); }}
          onCancel={() => setEditOpen(false)} />
      </Modal>

      <ConfirmDialog open={confirmOpen} title="¿Eliminar alojamiento?"
        description={`Se eliminará "${accommodation.name}". Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar alojamiento" onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)} loading={deleting} />
    </>
  );
}