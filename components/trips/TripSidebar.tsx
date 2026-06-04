"use client";

import { useEffect, useRef } from "react";
import type { Trip, Flight, Accommodation, Activity } from "@/lib/types/database";
import { formatDate } from "@/lib/utils/date";
import { differenceInDays, parseISO, isPast, isFuture, format } from "date-fns";
import { es } from "date-fns/locale";

interface Participant {
  id: string;
  nickname: string | null;
  first_name: string | null;
  isOwner: boolean;
}

interface MyTicket {
  cost: number | null;
}

interface TripSidebarProps {
  trip: Trip;
  participants: Participant[];
  flights: Flight[];
  accommodations: Accommodation[];
  activities: Activity[];
  cities: string[];
  myTickets: MyTicket[];
  participantCount: number;
}

function getCountdown(startDate: string): { label: string; value: string } {
  const start = parseISO(startDate);
  const today = new Date();
  if (isPast(start)) {
    const end = new Date(startDate);
    if (isPast(end)) return { label: "Viaje finalizado", value: "✓" };
    return { label: "En curso", value: "🟢" };
  }
  const days = differenceInDays(start, today);
  if (days === 0) return { label: "¡Hoy es el día!", value: "🎉" };
  if (days === 1) return { label: "Faltan", value: "1 día" };
  return { label: "Faltan", value: `${days} días` };
}

function formatCost(amount: number): string {
  return amount.toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export default function TripSidebar({
  trip,
  participants,
  flights,
  accommodations,
  activities,
  cities,
  myTickets,
  participantCount,
}: TripSidebarProps) {
  const countdown = getCountdown(trip.start_date);

  const allEvents = [
    ...flights.map((f) => ({
      type: "flight" as const,
      date: f.departure_at,
      label: `${f.origin} → ${f.destination}`,
      sub: f.airline,
    })),
    ...accommodations.map((a) => ({
      type: "accommodation" as const,
      date: a.checkin_at,
      label: a.name,
      sub: "Check-in",
    })),
    ...activities.map((a) => ({
      type: "activity" as const,
      date: a.starts_at,
      label: a.name,
      sub: a.location ?? "",
    })),
  ]
    .filter((e) => isFuture(parseISO(e.date)))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 3);

  const typeIcon = { flight: "✈️", accommodation: "🏨", activity: "📍" };
  const typeColor = { flight: "#2563eb", accommodation: "#2d6a4f", activity: "#c4622d" };

  // ── Cálculo de costos ──────────────────────────────────────────────────────

  // Alojamiento: si es total → divide por participantes; si es per_person → usa directo
  const accommodationCost = accommodations.reduce((sum, a) => {
    if (!a.cost) return sum;
    if (a.cost_type === "total") return sum + a.cost / participantCount;
    return sum + a.cost;
  }, 0);

  // Vuelos: suma de mis pasajes personales
  const flightCost = myTickets.reduce((sum, t) => sum + (t.cost ?? 0), 0);

  const totalCost = accommodationCost + flightCost;
  const hasCosts = accommodationCost > 0 || flightCost > 0;

  return (
    <div className="flex flex-col gap-4">

      {/* Countdown */}
      <div
        className="rounded-2xl p-5 text-center"
        style={{ background: "#f0ebe3", border: "1px solid #e8e0d8" }}
      >
        <p className="text-xs font-medium uppercase tracking-wide mb-1" style={{ color: "#a09088" }}>
          {countdown.label}
        </p>
        <p className="font-semibold" style={{ fontSize: 36, color: "#1a1714", lineHeight: 1 }}>
          {countdown.value}
        </p>
        <p className="text-xs mt-2" style={{ color: "#6b5f54" }}>
          {format(parseISO(trip.start_date), "d 'de' MMMM, yyyy", { locale: es })}
        </p>
      </div>

      {/* Próximos eventos */}
      {allEvents.length > 0 && (
        <div
          className="rounded-2xl p-4"
          style={{ background: "#f0ebe3", border: "1px solid #e8e0d8" }}
        >
          <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "#6b5f54" }}>
            Próximos eventos
          </p>
          <div className="flex flex-col gap-3">
            {allEvents.map((event, i) => (
              <div key={i} className="flex items-start gap-3">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-sm"
                  style={{ background: `${typeColor[event.type]}18` }}
                >
                  {typeIcon[event.type]}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: "#1a1714" }}>
                    {event.label}
                  </p>
                  <p className="text-xs" style={{ color: "#a09088" }}>
                    {event.sub && `${event.sub} · `}
                    {format(parseISO(event.date), "d MMM · HH:mm", { locale: es })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Viajeros */}
      {participants.length > 0 && (
        <div
          className="rounded-2xl p-4"
          style={{ background: "#f0ebe3", border: "1px solid #e8e0d8" }}
        >
          <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "#6b5f54" }}>
            Viajeros
          </p>
          <div className="flex flex-col gap-2.5">
            {participants.map((p) => (
              <div key={p.id} className="flex items-center gap-2.5">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
                  style={{ background: "#e8e0d8", color: "#1a1714" }}
                >
                  {(p.nickname ?? p.first_name ?? "?")[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: "#1a1714" }}>
                    {p.nickname ?? p.first_name ?? "Sin nombre"}
                  </p>
                </div>
                {p.isOwner && (
                  <span
                    className="text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{ background: "#e8e0d8", color: "#6b5f54" }}
                  >
                    owner
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resumen de costos */}
      {hasCosts && (
        <div
          className="rounded-2xl p-4"
          style={{ background: "#f0ebe3", border: "1px solid #e8e0d8" }}
        >
          <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "#6b5f54" }}>
            Costos estimados
          </p>
          <div className="flex flex-col gap-2.5">

            {accommodationCost > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm">🏨</span>
                  <span className="text-sm" style={{ color: "#6b5f54" }}>Alojamiento</span>
                </div>
                <span className="text-sm font-medium" style={{ color: "#1a1714" }}>
                  ${formatCost(accommodationCost)}
                </span>
              </div>
            )}

            {flightCost > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm">✈️</span>
                  <span className="text-sm" style={{ color: "#6b5f54" }}>Vuelos</span>
                </div>
                <span className="text-sm font-medium" style={{ color: "#1a1714" }}>
                  ${formatCost(flightCost)}
                </span>
              </div>
            )}

            <div
              className="flex items-center justify-between pt-2.5 mt-0.5"
              style={{ borderTop: "1px solid #e8e0d8" }}
            >
              <span className="text-sm font-semibold" style={{ color: "#1a1714" }}>Total por persona</span>
              <span className="text-sm font-bold" style={{ color: "#1a1714" }}>
                ${formatCost(totalCost)}
              </span>
            </div>

          </div>

          <p className="text-xs mt-3" style={{ color: "#a09088" }}>
            Estimado en base a los costos cargados. No incluye gastos personales ni actividades.
          </p>
        </div>
      )}

    </div>
  );
}