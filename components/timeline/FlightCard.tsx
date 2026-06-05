"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Flight, PersonalTicket } from "@/lib/types/database";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import FlightForm from "@/components/forms/FlightForm";
import { toast } from "@/components/ui/Toast";

interface FlightCardProps {
  flight: Flight;
  onRefresh: () => void;
  canEdit?: boolean;
}

export default function FlightCard({ flight, onRefresh, canEdit = true }: FlightCardProps) {
  const supabase = createClient();
  const [editOpen, setEditOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [ticket, setTicket] = useState<PersonalTicket | null>(null);
  const [ticketOpen, setTicketOpen] = useState(false);
  const [ticketForm, setTicketForm] = useState({
    airline: "", flight_number: "", seat: "", pnr: "", notes: "", cost: "",
  });
  const [savingTicket, setSavingTicket] = useState(false);
  const [confirmTicketDelete, setConfirmTicketDelete] = useState(false);

  useEffect(() => { loadTicket(); }, [flight.id]);

  async function loadTicket() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("personal_tickets").select("*")
      .eq("flight_id", flight.id).eq("user_id", user.id).single();
    if (data) {
      setTicket(data);
      setTicketForm({
        airline: data.airline ?? "",
        flight_number: data.flight_number ?? "",
        seat: data.seat ?? "",
        pnr: data.pnr ?? "",
        notes: data.notes ?? "",
        cost: data.cost?.toString() ?? "",
      });
    }
  }

  async function handleDelete() {
    setDeleting(true);
    const { error } = await supabase.from("flights").delete().eq("id", flight.id);
    setDeleting(false);
    setConfirmOpen(false);
    if (error) toast("No se pudo eliminar el vuelo", "error");
    else { toast("Vuelo eliminado"); onRefresh(); }
  }

  async function handleSaveTicket() {
    setSavingTicket(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const payload = {
      airline: ticketForm.airline || null,
      flight_number: ticketForm.flight_number || null,
      seat: ticketForm.seat || null,
      pnr: ticketForm.pnr || null,
      notes: ticketForm.notes || null,
      cost: ticketForm.cost ? parseFloat(ticketForm.cost) : null,
    };

    let error;
    if (ticket) {
      ({ error } = await supabase.from("personal_tickets").update(payload).eq("id", ticket.id));
    } else {
      ({ error } = await supabase.from("personal_tickets").insert({
        flight_id: flight.id, trip_id: flight.trip_id, user_id: user.id, ...payload,
      }));
    }
    setSavingTicket(false);
    if (error) toast("No se pudo guardar el pasaje", "error");
    else { toast("Pasaje guardado"); await loadTicket(); setTicketOpen(false); }
  }

  async function handleDeleteTicket() {
    if (!ticket) return;
    await supabase.from("personal_tickets").delete().eq("id", ticket.id);
    setTicket(null);
    setTicketForm({ airline: "", flight_number: "", seat: "", pnr: "", notes: "", cost: "" });
    setConfirmTicketDelete(false);
    toast("Pasaje eliminado");
  }

  const depTime = format(parseISO(flight.departure_at), "HH:mm");
  const depDate = format(parseISO(flight.departure_at), "d MMM", { locale: es });

  return (
    <>
      <div
        className="rounded-2xl overflow-hidden transition-all"
        style={{ border: "1px solid #d8cfc8", background: "#f5f0ea" }}
      >
        {/* Card principal */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-3">

            {/* Ruta visual */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="px-2 py-0.5 rounded-md text-xs font-semibold"
                  style={{ background: "#2563eb", color: "#faf7f2" }}
                >
                  {flight.transport_type === "bus" ? "🚌" : flight.transport_type === "car" ? "🚗" : "✈️"} {flight.flight_number ?? flight.origin}
                </div>
                <span className="text-xs" style={{ color: "#6b5f54" }}>
                  {flight.airline}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-center">
                  <p className="font-bold text-xl tabular-nums" style={{ color: "#1a1714", lineHeight: 1 }}>
                    {flight.origin}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "#6b5f54" }}>{depTime}</p>
                </div>

                <div className="flex-1 flex items-center gap-1.5">
                  <div className="flex-1 h-px" style={{ background: "#b8c8e8" }} />
                  <svg className="w-4 h-4 flex-shrink-0" style={{ color: "#2563eb" }} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
                  </svg>
                  <div className="flex-1 h-px" style={{ background: "#b8c8e8" }} />
                </div>

                <div className="text-center">
                  <p className="font-bold text-xl tabular-nums" style={{ color: "#1a1714", lineHeight: 1 }}>
                    {flight.destination}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "#6b5f54" }}>{depDate}</p>
                </div>
              </div>
            </div>

            {/* Acciones */}
            {canEdit && (
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => setEditOpen(true)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors"
                  style={{ color: "#2563eb" }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "#e8f0ff"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                <button
                  onClick={() => setConfirmOpen(true)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors"
                  style={{ color: "#2563eb" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "#f5ede8"; e.currentTarget.style.color = "#c4622d"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#2563eb"; }}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          {flight.notes && (
            <p className="mt-3 text-xs px-3 py-2 rounded-lg" style={{ background: "#e8e0d8", color: "#6b5f54" }}>
              {flight.notes}
            </p>
          )}
        </div>

        {/* Separador boarding pass */}
        <div className="flex items-center px-4">
          <div className="w-4 h-4 rounded-full flex-shrink-0 -ml-6" style={{ background: "#faf7f2", border: "1px solid #d8cfc8" }} />
          <div className="flex-1 border-t border-dashed" style={{ borderColor: "#b8c8e8" }} />
          <div className="w-4 h-4 rounded-full flex-shrink-0 -mr-6" style={{ background: "#faf7f2", border: "1px solid #d8cfc8" }} />
        </div>

        {/* Pasaje personal */}
        <div className="px-4 py-3">
          {ticket ? (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold" style={{ color: "#2563eb" }}>🎫 Mi pasaje</span>
                <div className="flex gap-2">
                  <button onClick={() => setTicketOpen(true)} className="text-xs" style={{ color: "#6b5f54" }}>Editar</button>
                  <span style={{ color: "#d8cfc8" }}>·</span>
                  <button onClick={() => setConfirmTicketDelete(true)} className="text-xs" style={{ color: "#c4622d" }}>Eliminar</button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs" style={{ color: "#6b5f54" }}>
                {ticket.seat && <span>Asiento: <strong style={{ color: "#1a1714" }}>{ticket.seat}</strong></span>}
                {ticket.pnr && <span>PNR: <strong style={{ color: "#1a1714" }}>{ticket.pnr}</strong></span>}
                {ticket.airline && <span>Aerolínea: {ticket.airline}</span>}
                {ticket.flight_number && <span>Vuelo: {ticket.flight_number}</span>}
                {ticket.cost && (
                  <span className="col-span-2">
                    Costo: <strong style={{ color: "#1a1714" }}>${ticket.cost.toLocaleString("es-AR")}</strong>
                  </span>
                )}
                {ticket.notes && <span className="col-span-2">{ticket.notes}</span>}
              </div>
            </div>
          ) : (
            <button
              onClick={() => setTicketOpen(true)}
              className="w-full text-xs font-medium text-left transition-colors"
              style={{ color: "#6b5f54" }}
              onMouseEnter={(e) => e.currentTarget.style.color = "#2563eb"}
              onMouseLeave={(e) => e.currentTarget.style.color = "#6b5f54"}
            >
              + Agregar mi pasaje personal
            </button>
          )}
        </div>
      </div>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Editar transporte">
        <FlightForm tripId={flight.trip_id} existing={flight}
          onSuccess={() => { setEditOpen(false); onRefresh(); toast("Vuelo actualizado"); }}
          onCancel={() => setEditOpen(false)} />
      </Modal>

      <ConfirmDialog open={confirmOpen} title="¿Eliminar transporte?"
        description={`Se eliminará el tramo ${flight.origin} → ${flight.destination}. Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar" onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)} loading={deleting}
         />

      <Modal open={ticketOpen} onClose={() => setTicketOpen(false)} title="Mi pasaje personal">
        <div className="space-y-4">
          <p className="text-xs" style={{ color: "#6b5f54" }}>Solo vos podés ver esta información.</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Aerolínea", key: "airline", placeholder: "Aerolíneas Arg." },
              { label: "Nro. de vuelo", key: "flight_number", placeholder: "AR1234" },
              { label: "Asiento", key: "seat", placeholder: "14A" },
              { label: "PNR / Código", key: "pnr", placeholder: "ABC123" },
            ].map(({ label, key, placeholder }) => (
              <div key={key}>
                <label className="block text-xs font-medium mb-1" style={{ color: "#6b5f54" }}>{label}</label>
                <input
                  className="w-full text-sm px-3 py-2 rounded-lg outline-none transition-all"
                  style={{ border: "1px solid #e8e0d8", background: "#faf7f2", color: "#1a1714" }}
                  value={ticketForm[key as keyof typeof ticketForm]}
                  onChange={(e) => setTicketForm((f) => ({ ...f, [key]: e.target.value }))}
                  placeholder={placeholder}
                  onFocus={(e) => e.currentTarget.style.borderColor = "#2563eb"}
                  onBlur={(e) => e.currentTarget.style.borderColor = "#e8e0d8"}
                />
              </div>
            ))}
          </div>

          {/* Costo del pasaje */}
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "#6b5f54" }}>
              Costo del pasaje (opcional)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              className="w-full text-sm px-3 py-2 rounded-lg outline-none transition-all"
              style={{ border: "1px solid #e8e0d8", background: "#faf7f2", color: "#1a1714" }}
              value={ticketForm.cost}
              onChange={(e) => setTicketForm((f) => ({ ...f, cost: e.target.value }))}
              placeholder="Ej: 350"
              onFocus={(e) => e.currentTarget.style.borderColor = "#2563eb"}
              onBlur={(e) => e.currentTarget.style.borderColor = "#e8e0d8"}
            />
            <p className="text-xs mt-1" style={{ color: "#a09088" }}>
              Se usa para calcular el costo total de tu viaje.
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "#6b5f54" }}>Notas</label>
            <input
              className="w-full text-sm px-3 py-2 rounded-lg outline-none"
              style={{ border: "1px solid #e8e0d8", background: "#faf7f2", color: "#1a1714" }}
              value={ticketForm.notes}
              onChange={(e) => setTicketForm((f) => ({ ...f, notes: e.target.value }))}
              placeholder="Equipaje extra, preferencias..."
              onFocus={(e) => e.currentTarget.style.borderColor = "#2563eb"}
              onBlur={(e) => e.currentTarget.style.borderColor = "#e8e0d8"}
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button
              onClick={() => setTicketOpen(false)}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{ border: "1.5px solid #e8e0d8", color: "#6b5f54", background: "#faf7f2" }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#f0ebe3"}
              onMouseLeave={(e) => e.currentTarget.style.background = "#faf7f2"}
            >
              Cancelar
            </button>
            <button
              onClick={handleSaveTicket}
              disabled={savingTicket}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{ background: savingTicket ? "#2563eb80" : "#2563eb", color: "white" }}
              onMouseEnter={(e) => { if (!savingTicket) e.currentTarget.style.background = "#1d4ed8"; }}
              onMouseLeave={(e) => { if (!savingTicket) e.currentTarget.style.background = "#2563eb"; }}
            >
              {savingTicket ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={confirmTicketDelete} title="¿Eliminar tu pasaje?"
        description="Se eliminará tu información personal de este vuelo."
        confirmLabel="Eliminar pasaje" onConfirm={handleDeleteTicket}
        onCancel={() => setConfirmTicketDelete(false)} />
    </>
  );
}