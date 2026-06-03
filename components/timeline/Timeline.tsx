"use client";

import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Flight, Accommodation, Activity } from "@/lib/types/database";
import { format, parseISO, differenceInDays } from "date-fns";
import { es } from "date-fns/locale";
import FlightCard from "./FlightCard";
import AccommodationCard from "./AccommodationCard";
import ActivityCard from "./ActivityCard";
import Modal from "@/components/ui/Modal";
import FlightForm from "@/components/forms/FlightForm";
import AccommodationForm from "@/components/forms/AccommodationForm";
import ActivityForm from "@/components/forms/ActivityForm";
import { ToastProvider, toast } from "@/components/ui/Toast";

type AddModal = "flight" | "accommodation" | "activity" | null;

interface TimelineProps {
  tripId: string;
  initialFlights: Flight[];
  initialAccommodations: Accommodation[];
  initialActivities: Activity[];
  canEdit?: boolean;
  cities?: string[];
}

// ─── Lógica de agrupación por ciudad ─────────────────────────────────────────

interface CitySegment {
  city: string;
  arrivalDate: string | null;
  departureDate: string | null;
  arrivalFlight: Flight | null;
  departureFlight: Flight | null;
  accommodation: Accommodation | null;
  dayGroups: { date: string; activities: Activity[] }[];
  nights: number;
}

function buildCitySegments(
  flights: Flight[],
  accommodations: Accommodation[],
  activities: Activity[]
): CitySegment[] {
  if (flights.length === 0 && accommodations.length === 0 && activities.length === 0) {
    return [];
  }

  // Si no hay vuelos, agrupar todo bajo una sola ciudad
  if (flights.length === 0) {
    const city = accommodations[0]?.address?.split(",").slice(-2, -1)[0]?.trim()
      ?? accommodations[0]?.name
      ?? "Destino";

    const dayMap = new Map<string, Activity[]>();
    activities.forEach((a) => {
      const day = a.starts_at.slice(0, 10);
      if (!dayMap.has(day)) dayMap.set(day, []);
      dayMap.get(day)!.push(a);
    });

    const nights = accommodations.length > 0
      ? differenceInDays(
          parseISO(accommodations[0].checkout_at),
          parseISO(accommodations[0].checkin_at)
        )
      : 0;

    return [{
      city,
      arrivalDate: accommodations[0]?.checkin_at ?? null,
      departureDate: accommodations[0]?.checkout_at ?? null,
      arrivalFlight: null,
      departureFlight: null,
      accommodation: accommodations[0] ?? null,
      dayGroups: Array.from(dayMap.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, acts]) => ({ date, activities: acts })),
      nights,
    }];
  }

  // Con vuelos: construir segmentos origen → destino
  const sortedFlights = [...flights].sort((a, b) =>
    a.departure_at.localeCompare(b.departure_at)
  );

  const segments: CitySegment[] = [];

  // Ciudad de origen (antes del primer vuelo)
  const firstFlight = sortedFlights[0];
  segments.push({
    city: firstFlight.origin,
    arrivalDate: null,
    departureDate: firstFlight.departure_at,
    arrivalFlight: null,
    departureFlight: firstFlight,
    accommodation: null,
    dayGroups: [],
    nights: 0,
  });

  // Ciudades intermedias y final
  sortedFlights.forEach((flight, i) => {
    const nextFlight = sortedFlights[i + 1] ?? null;
    const city = flight.destination;

    // Alojamiento en esta ciudad
    const accommodation = accommodations.find((a) =>
      a.address?.toLowerCase().includes(city.toLowerCase()) ||
      a.name?.toLowerCase().includes(city.toLowerCase())
    ) ?? accommodations[i] ?? null;

    // Actividades en esta ciudad (entre llegada y próximo vuelo)
    const arriveAt = flight.departure_at;
    const leaveAt = nextFlight?.departure_at ?? null;

    const cityActivities = activities.filter((a) => {
      if (a.starts_at < arriveAt) return false;
      if (leaveAt && a.starts_at > leaveAt) return false;
      return true;
    });

    const dayMap = new Map<string, Activity[]>();
    cityActivities.forEach((a) => {
      const day = a.starts_at.slice(0, 10);
      if (!dayMap.has(day)) dayMap.set(day, []);
      dayMap.get(day)!.push(a);
    });

    const nights = accommodation
      ? differenceInDays(
          parseISO(accommodation.checkout_at),
          parseISO(accommodation.checkin_at)
        )
      : nextFlight
      ? differenceInDays(parseISO(nextFlight.departure_at), parseISO(flight.departure_at))
      : 0;

    segments.push({
      city,
      arrivalDate: flight.departure_at,
      departureDate: nextFlight?.departure_at ?? null,
      arrivalFlight: flight,
      departureFlight: nextFlight,
      accommodation,
      dayGroups: Array.from(dayMap.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, acts]) => ({ date, activities: acts })),
      nights,
    });
  });

  return segments;
}

// ─── Componente de segmento de ciudad ────────────────────────────────────────

function CitySegmentBlock({
  segment,
  index,
  isLast,
  onRefresh,
  canEdit,
  onAdd,
}: {
  segment: CitySegment;
  index: number;
  isLast: boolean;
  onRefresh: () => void;
  canEdit: boolean;
  onAdd: (type: AddModal) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="relative">
      {/* Línea vertical conectora */}
      {!isLast && (
        <div
          className="absolute left-5 z-0"
          style={{
            top: 48,
            bottom: -32,
            width: 2,
            background: "linear-gradient(to bottom, #ebebed, transparent)",
          }}
        />
      )}

      {/* Header de ciudad */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="relative z-10 w-full flex items-center gap-4 mb-4 group"
      >
        {/* Dot */}
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-semibold text-sm transition-all group-hover:scale-105"
          style={{
            background: "#0a0a0b",
            color: "white",
            boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
          }}
        >
          {index + 1}
        </div>

        {/* Info ciudad */}
        <div className="flex-1 text-left">
          <h3 className="font-semibold text-lg" style={{ color: "#0a0a0b", lineHeight: 1.2 }}>
            {segment.city}
          </h3>
          <p className="text-sm" style={{ color: "#6b6b7b" }}>
            {segment.arrivalDate
              ? format(parseISO(segment.arrivalDate), "d MMM", { locale: es })
              : "Origen"}
            {segment.nights > 0 && ` · ${segment.nights} ${segment.nights === 1 ? "noche" : "noches"}`}
          </p>
        </div>

        {/* Chevron */}
        <svg
          className="w-4 h-4 flex-shrink-0 transition-transform"
          style={{
            color: "#a0a0b0",
            transform: collapsed ? "rotate(-90deg)" : "rotate(0deg)",
          }}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Contenido del segmento */}
      {!collapsed && (
        <div className="ml-14 space-y-3 mb-2">

          {/* Vuelo de llegada */}
          {segment.arrivalFlight && (
            <FlightCard
              flight={segment.arrivalFlight}
              onRefresh={onRefresh}
              canEdit={canEdit}
            />
          )}

          {/* Alojamiento */}
          {segment.accommodation && (
            <AccommodationCard
              accommodation={segment.accommodation}
              onRefresh={onRefresh}
              canEdit={canEdit}
            />
          )}

          {/* Actividades agrupadas por día */}
          {segment.dayGroups.map(({ date, activities: acts }) => (
            <div key={date}>
              <p
                className="text-xs font-semibold uppercase tracking-wider mb-2 mt-4"
                style={{ color: "#a0a0b0" }}
              >
                {format(parseISO(date), "EEEE d MMM", { locale: es })}
              </p>
              <div className="space-y-2">
                {acts.map((activity) => (
                  <ActivityCard
                    key={activity.id}
                    activity={activity}
                    onRefresh={onRefresh}
                    canEdit={canEdit}
                  />
                ))}
              </div>
            </div>
          ))}

          {/* Botón agregar actividad en esta ciudad */}
          {canEdit && (
            <button
              onClick={() => onAdd("activity")}
              className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-all"
              style={{
                border: "1px dashed #d0d0d8",
                color: "#a0a0b0",
                background: "transparent",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#f5620f";
                e.currentTarget.style.color = "#f5620f";
                e.currentTarget.style.background = "#fff8f5";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#d0d0d8";
                e.currentTarget.style.color = "#a0a0b0";
                e.currentTarget.style.background = "transparent";
              }}
            >
              <span>📍</span>
              Agregar actividad en {segment.city.split(",")[0]}
            </button>
          )}
        </div>
      )}

      {/* Conector entre ciudades — vuelo de salida */}
      {!isLast && segment.departureFlight && !collapsed && (
        <div
          className="ml-14 mb-4 flex items-center gap-3 py-2.5 px-4 rounded-xl"
          style={{ background: "#f0f4ff", border: "1px solid #dde8ff" }}
        >
          <span style={{ color: "#0066ff" }}>✈️</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium" style={{ color: "#0066ff" }}>
              {segment.departureFlight.airline} {segment.departureFlight.flight_number}
            </p>
            <p className="text-xs" style={{ color: "#6b96ff" }}>
              Sale {format(parseISO(segment.departureFlight.departure_at), "d MMM · HH:mm", { locale: es })}
              {" "}→ {segment.departureFlight.destination}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Timeline principal ───────────────────────────────────────────────────────

export default function Timeline({
  tripId,
  initialFlights,
  initialAccommodations,
  initialActivities,
  canEdit = true,
  cities = [],
}: TimelineProps) {
  const supabase = createClient();

  const [flights, setFlights] = useState(initialFlights);
  const [accommodations, setAccommodations] = useState(initialAccommodations);
  const [activities, setActivities] = useState(initialActivities);
  const [addModal, setAddModal] = useState<AddModal>(null);

  const refresh = useCallback(async () => {
    const [f, a, ac] = await Promise.all([
      supabase.from("flights").select("*").eq("trip_id", tripId).order("departure_at"),
      supabase.from("accommodations").select("*").eq("trip_id", tripId).order("checkin_at"),
      supabase.from("activities").select("*").eq("trip_id", tripId).order("starts_at"),
    ]);
    if (f.data) setFlights(f.data);
    if (a.data) setAccommodations(a.data);
    if (ac.data) setActivities(ac.data);
  }, [supabase, tripId]);

  const segments = buildCitySegments(flights, accommodations, activities);
  const totalItems = flights.length + accommodations.length + activities.length;

  return (
    <>
      <ToastProvider />

      {/* Header con acciones */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="font-semibold text-lg" style={{ color: "#0a0a0b" }}>
            Itinerario
          </h2>
          {totalItems > 0 && (
            <p className="text-sm mt-0.5" style={{ color: "#6b6b7b" }}>
              {segments.length} {segments.length === 1 ? "destino" : "destinos"} · {totalItems} {totalItems === 1 ? "elemento" : "elementos"}
            </p>
          )}
        </div>

        {canEdit && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAddModal("flight")}
              className="flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-xl transition-all"
              style={{ background: "#f0f4ff", color: "#0066ff", border: "1px solid #dde8ff" }}
            >
              ✈️ Vuelo
            </button>
            <button
              onClick={() => setAddModal("accommodation")}
              className="flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-xl transition-all"
              style={{ background: "#f0faf7", color: "#00a67e", border: "1px solid #c8efe5" }}
            >
              🏨 Hotel
            </button>
            <button
              onClick={() => setAddModal("activity")}
              className="flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-xl transition-all"
              style={{ background: "#fff8f5", color: "#f5620f", border: "1px solid #fde0cc" }}
            >
              📍 Actividad
            </button>
          </div>
        )}
      </div>

      {/* Viewer badge */}
      {!canEdit && (
        <div
          className="flex items-center gap-2 mb-6 px-4 py-2.5 rounded-xl text-sm"
          style={{ background: "#f7f7f8", color: "#6b6b7b", border: "1px solid #ebebed" }}
        >
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          Solo tenés acceso de visualización en este viaje
        </div>
      )}

      {/* Estado vacío */}
      {totalItems === 0 && canEdit && (
        <div
          className="text-center py-16 rounded-2xl"
          style={{ background: "#f7f7f8", border: "1px dashed #d0d0d8" }}
        >
          <p className="text-4xl mb-4">🗺️</p>
          <h3 className="font-semibold mb-1" style={{ color: "#0a0a0b" }}>
            El viaje está vacío
          </h3>
          <p className="text-sm mb-6" style={{ color: "#6b6b7b" }}>
            Agregá el primer vuelo para empezar a construir tu itinerario.
          </p>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <button
              onClick={() => setAddModal("flight")}
              className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-xl"
              style={{ background: "#0066ff", color: "white" }}
            >
              ✈️ Agregar vuelo
            </button>
            <button
              onClick={() => setAddModal("accommodation")}
              className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-xl"
              style={{ background: "#f7f7f8", color: "#0a0a0b", border: "1px solid #ebebed" }}
            >
              🏨 Agregar alojamiento
            </button>
            <button
              onClick={() => setAddModal("activity")}
              className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-xl"
              style={{ background: "#f7f7f8", color: "#0a0a0b", border: "1px solid #ebebed" }}
            >
              📍 Agregar actividad
            </button>
          </div>
        </div>
      )}

      {/* Segmentos por ciudad */}
      {segments.length > 0 && (
        <div className="space-y-8">
          {segments.map((segment, i) => (
            <CitySegmentBlock
              key={`${segment.city}-${i}`}
              segment={segment}
              index={i}
              isLast={i === segments.length - 1}
              onRefresh={refresh}
              canEdit={canEdit}
              onAdd={setAddModal}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {canEdit && (
        <>
          <Modal open={addModal === "flight"} onClose={() => setAddModal(null)} title="Agregar vuelo">
            <FlightForm
              tripId={tripId}
              onSuccess={() => { setAddModal(null); refresh(); toast("Vuelo agregado"); }}
              onCancel={() => setAddModal(null)}
            />
          </Modal>
          <Modal open={addModal === "accommodation"} onClose={() => setAddModal(null)} title="Agregar alojamiento">
            <AccommodationForm
              tripId={tripId}
              onSuccess={() => { setAddModal(null); refresh(); toast("Alojamiento agregado"); }}
              onCancel={() => setAddModal(null)}
            />
          </Modal>
          <Modal open={addModal === "activity"} onClose={() => setAddModal(null)} title="Agregar actividad">
            <ActivityForm
              tripId={tripId}
              onSuccess={() => { setAddModal(null); refresh(); toast("Actividad agregada"); }}
              onCancel={() => setAddModal(null)}
            />
          </Modal>
        </>
      )}
    </>
  );
}