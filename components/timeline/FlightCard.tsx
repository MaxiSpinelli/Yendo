"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Flight, PersonalTicket } from "@/lib/types/database";
import { formatDateTime } from "@/lib/utils/date";
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
    airline: "",
    flight_number: "",
    seat: "",
    pnr: "",
    notes: "",
  });
  const [savingTicket, setSavingTicket] = useState(false);
  const [confirmTicketDelete, setConfirmTicketDelete] = useState(false);

  useEffect(() => {
    loadTicket();
  }, [flight.id]);

  async function loadTicket() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("personal_tickets")
      .select("*")
      .eq("flight_id", flight.id)
      .eq("user_id", user.id)
      .single();
    if (data) {
      setTicket(data);
      setTicketForm({
        airline: data.airline ?? "",
        flight_number: data.flight_number ?? "",
        seat: data.seat ?? "",
        pnr: data.pnr ?? "",
        notes: data.notes ?? "",
      });
    }
  }

  async function handleDelete() {
    setDeleting(true);
    const { error } = await supabase.from("flights").delete().eq("id", flight.id);
    setDeleting(false);
    setConfirmOpen(false);
    if (error) {
      toast("No se pudo eliminar el vuelo", "error");
    } else {
      toast("Vuelo eliminado");
      onRefresh();
    }
  }

  async function handleSaveTicket() {
    setSavingTicket(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    let error;
    if (ticket) {
      ({ error } = await supabase
        .from("personal_tickets")
        .update(ticketForm)
        .eq("id", ticket.id));
    } else {
      ({ error } = await supabase
        .from("personal_tickets")
        .insert({
          flight_id: flight.id,
          trip_id: flight.trip_id,
          user_id: user.id,
          ...ticketForm,
        }));
    }

    setSavingTicket(false);
    if (error) {
      toast("No se pudo guardar el pasaje", "error");
    } else {
      toast("Pasaje guardado");
      await loadTicket();
      setTicketOpen(false);
    }
  }

  async function handleDeleteTicket() {
    if (!ticket) return;
    await supabase.from("personal_tickets").delete().eq("id", ticket.id);
    setTicket(null);
    setTicketForm({ airline: "", flight_number: "", seat: "", pnr: "", notes: "" });
    setConfirmTicketDelete(false);
    toast("Pasaje eliminado");
  }

  return (
    <>
      <div className="card p-4 border-l-4 border-l-sky-400 hover:shadow-md transition-shadow">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-sky-accent flex items-center justify-center flex-shrink-0">
              <span className="text-base">✈️</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-semibold text-navy-900 text-sm">{flight.airline}</span>
                <span className="text-xs text-navy-300 font-mono">{flight.flight_number}</span>
              </div>
              <p className="text-sm text-navy-700 mt-0.5">
                {flight.origin}
                <span className="mx-1.5 text-navy-300">→</span>
                {flight.destination}
              </p>
            </div>
          </div>

          {canEdit && (
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => setEditOpen(true)}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-navy-300 hover:bg-cream-dark hover:text-navy-700 transition-colors"
                title="Editar"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
              <button
                onClick={() => setConfirmOpen(true)}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-navy-300 hover:bg-red-50 hover:text-red-500 transition-colors"
                title="Eliminar"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Date */}
        <div className="mt-2.5 flex items-center gap-1.5 text-xs text-navy-700">
          <svg className="w-3.5 h-3.5 text-navy-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {formatDateTime(flight.departure_at)}
        </div>

        {flight.notes && (
          <p className="mt-2 text-xs text-navy-700 bg-cream rounded-lg px-3 py-2">
            {flight.notes}
          </p>
        )}

        {/* Pasaje personal — siempre visible para todos */}
        <div className="mt-3 pt-3 border-t border-navy-100">
          {ticket ? (
            <div className="bg-sky-accent rounded-lg px-3 py-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-sky-700">🎫 Mi pasaje</span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setTicketOpen(true)}
                    className="text-xs text-sky-600 hover:text-sky-800"
                  >
                    Editar
                  </button>
                  <span className="text-navy-100">·</span>
                  <button
                    onClick={() => setConfirmTicketDelete(true)}
                    className="text-xs text-red-400 hover:text-red-600"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs text-navy-700">
                {ticket.airline && <span>Aerolínea: {ticket.airline}</span>}
                {ticket.flight_number && <span>Vuelo: {ticket.flight_number}</span>}
                {ticket.seat && <span>Asiento: {ticket.seat}</span>}
                {ticket.pnr && <span>PNR: {ticket.pnr}</span>}
                {ticket.notes && <span className="col-span-2">Nota: {ticket.notes}</span>}
              </div>
            </div>
          ) : (
            <button
              onClick={() => setTicketOpen(true)}
              className="w-full text-xs text-navy-300 hover:text-sky-600 hover:bg-sky-accent rounded-lg px-3 py-2 border border-dashed border-navy-100 hover:border-sky-200 transition-colors text-left"
            >
              + Agregar mi pasaje personal
            </button>
          )}
        </div>
      </div>

      {/* Edit modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Editar vuelo">
        <FlightForm
          tripId={flight.trip_id}
          existing={flight}
          onSuccess={() => { setEditOpen(false); onRefresh(); toast("Vuelo actualizado"); }}
          onCancel={() => setEditOpen(false)}
        />
      </Modal>

      {/* Delete confirm */}
      <ConfirmDialog
        open={confirmOpen}
        title="¿Eliminar vuelo?"
        description={`Se eliminará el vuelo ${flight.airline} ${flight.flight_number} (${flight.origin} → ${flight.destination}). Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar vuelo"
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
        loading={deleting}
      />

      {/* Ticket modal */}
      <Modal open={ticketOpen} onClose={() => setTicketOpen(false)} title="Mi pasaje personal">
        <div className="space-y-4">
          <p className="text-xs text-navy-300">Solo vos podés ver esta información.</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-navy-700 mb-1">Aerolínea</label>
              <input
                className="w-full text-sm border border-navy-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber/20 focus:border-amber"
                value={ticketForm.airline}
                onChange={(e) => setTicketForm((f) => ({ ...f, airline: e.target.value }))}
                placeholder="Aerolíneas Arg."
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-navy-700 mb-1">Nro. de vuelo</label>
              <input
                className="w-full text-sm border border-navy-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber/20 focus:border-amber"
                value={ticketForm.flight_number}
                onChange={(e) => setTicketForm((f) => ({ ...f, flight_number: e.target.value }))}
                placeholder="AR1234"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-navy-700 mb-1">Asiento</label>
              <input
                className="w-full text-sm border border-navy-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber/20 focus:border-amber"
                value={ticketForm.seat}
                onChange={(e) => setTicketForm((f) => ({ ...f, seat: e.target.value }))}
                placeholder="14A"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-navy-700 mb-1">PNR / Código</label>
              <input
                className="w-full text-sm border border-navy-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber/20 focus:border-amber"
                value={ticketForm.pnr}
                onChange={(e) => setTicketForm((f) => ({ ...f, pnr: e.target.value }))}
                placeholder="ABC123"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-navy-700 mb-1">Notas</label>
            <input
              className="w-full text-sm border border-navy-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber/20 focus:border-amber"
              value={ticketForm.notes}
              onChange={(e) => setTicketForm((f) => ({ ...f, notes: e.target.value }))}
              placeholder="Equipaje extra, preferencias..."
            />
          </div>
          <div className="flex gap-3 pt-1">
            <button onClick={() => setTicketOpen(false)} className="btn-secondary flex-1">
              Cancelar
            </button>
            <button onClick={handleSaveTicket} disabled={savingTicket} className="btn-primary flex-1">
              {savingTicket ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete ticket confirm */}
      <ConfirmDialog
        open={confirmTicketDelete}
        title="¿Eliminar tu pasaje?"
        description="Se eliminará tu información personal de este vuelo."
        confirmLabel="Eliminar pasaje"
        onConfirm={handleDeleteTicket}
        onCancel={() => setConfirmTicketDelete(false)}
      />
    </>
  );
}
