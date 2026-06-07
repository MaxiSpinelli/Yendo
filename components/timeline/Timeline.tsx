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
  if (flights.length === 0 && accommodations.length === 0 && activities.length === 0) return [];

  if (flights.length === 0) {
    const city = accommodations[0]?.address?.split(",").slice(-2, -1)[0]?.trim()
      ?? accommodations[0]?.name ?? "Destino";
    const dayMap = new Map<string, Activity[]>();
    activities.forEach((a) => {
      const day = a.starts_at.slice(0, 10);
      if (!dayMap.has(day)) dayMap.set(day, []);
      dayMap.get(day)!.push(a);
    });
    const nights = accommodations.length > 0
      ? differenceInDays(parseISO(accommodations[0].checkout_at), parseISO(accommodations[0].checkin_at))
      : 0;
    return [{ city, arrivalDate: accommodations[0]?.checkin_at ?? null, departureDate: accommodations[0]?.checkout_at ?? null, arrivalFlight: null, departureFlight: null, accommodation: accommodations[0] ?? null, dayGroups: Array.from(dayMap.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([date, acts]) => ({ date, activities: acts })), nights }];
  }

  const sortedFlights = [...flights].sort((a, b) => a.departure_at.localeCompare(b.departure_at));
  const segments: CitySegment[] = [];

  const firstFlight = sortedFlights[0];
  segments.push({ city: firstFlight.origin, arrivalDate: null, departureDate: firstFlight.departure_at, arrivalFlight: null, departureFlight: firstFlight, accommodation: null, dayGroups: [], nights: 0 });

  sortedFlights.forEach((flight, i) => {
    const nextFlight = sortedFlights[i + 1] ?? null;
    const city = flight.destination;
    const accommodation = accommodations.find((a) =>
      a.address?.toLowerCase().includes(city.toLowerCase()) ||
      a.name?.toLowerCase().includes(city.toLowerCase())
    ) ?? accommodations[i] ?? null;
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
      ? differenceInDays(parseISO(accommodation.checkout_at), parseISO(accommodation.checkin_at))
      : nextFlight ? differenceInDays(parseISO(nextFlight.departure_at), parseISO(flight.departure_at)) : 0;
    segments.push({ city, arrivalDate: flight.departure_at, departureDate: nextFlight?.departure_at ?? null, arrivalFlight: flight, departureFlight: nextFlight, accommodation, dayGroups: Array.from(dayMap.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([date, acts]) => ({ date, activities: acts })), nights });
  });

  return segments;
}

function CitySegmentBlock({ segment, index, isLast, onRefresh, canEdit, onAdd }: {
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
      {!isLast && (
        <div
          className="absolute left-5 z-0"
          style={{ top: 48, bottom: -32, width: 2, background: "linear-gradient(to bottom, #e8e0d8, transparent)" }}
        />
      )}

      <button
        onClick={() => setCollapsed((c) => !c)}
        className="relative z-10 w-full flex items-center gap-4 mb-4 group"
      >
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-semibold text-sm transition-all group-hover:scale-105"
          style={{ background: "#1a1714", color: "#faf7f2", boxShadow: "0 2px 12px rgba(26,23,20,0.2)" }}
        >
          {index + 1}
        </div>
        <div className="flex-1 text-left">
          <h3 className="font-semibold text-lg" style={{ color: "#1a1714", lineHeight: 1.2 }}>
            {segment.city}
          </h3>
          <p className="text-sm" style={{ color: "#6b5f54" }}>
            {segment.arrivalDate
              ? format(parseISO(segment.arrivalDate), "d MMM", { locale: es })
              : "Origen"}
            {segment.nights > 0 && ` · ${segment.nights} ${segment.nights === 1 ? "noche" : "noches"}`}
          </p>
        </div>
        <svg
          className="w-4 h-4 flex-shrink-0 transition-transform"
          style={{ color: "#a09088", transform: collapsed ? "rotate(-90deg)" : "rotate(0deg)" }}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {!collapsed && (
        <div className="ml-14 space-y-3 mb-2">
          {segment.arrivalFlight && (
            <FlightCard flight={segment.arrivalFlight} onRefresh={onRefresh} canEdit={canEdit} />
          )}
          {segment.accommodation && (
            <AccommodationCard accommodation={segment.accommodation} onRefresh={onRefresh} canEdit={canEdit} />
          )}
          {segment.dayGroups.map(({ date, activities: acts }) => (
            <div key={date}>
              <p className="text-xs font-semibold uppercase tracking-wider mb-2 mt-4" style={{ color: "#a09088" }}>
                {format(parseISO(date), "EEEE d MMM", { locale: es })}
              </p>
              <div className="space-y-2">
                {acts.map((activity) => (
                  <ActivityCard key={activity.id} activity={activity} onRefresh={onRefresh} canEdit={canEdit} />
                ))}
              </div>
            </div>
          ))}
          {canEdit && (
            <button
              onClick={() => onAdd("activity")}
              className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-all"
              style={{ border: "1px dashed #d8cfc8", color: "#a09088", background: "transparent" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#c4622d"; e.currentTarget.style.color = "#c4622d"; e.currentTarget.style.background = "#f5ede5"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#d8cfc8"; e.currentTarget.style.color = "#a09088"; e.currentTarget.style.background = "transparent"; }}
            >
              <span>📍</span>
              Agregar actividad en {segment.city.split(",")[0]}
            </button>
          )}
        </div>
      )}

      {!isLast && segment.departureFlight && !collapsed && (
        <div
          className="ml-14 mb-4 flex items-center gap-3 py-2.5 px-4 rounded-xl"
          style={{ background: "#eef2f8", border: "1px solid #c8d4e8" }}
        >
          <span style={{ color: "#2563eb" }}>✈️</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium" style={{ color: "#2563eb" }}>
              {segment.departureFlight.airline} {segment.departureFlight.flight_number}
            </p>
            <p className="text-xs" style={{ color: "#6b7fa0" }}>
              Sale {format(parseISO(segment.departureFlight.departure_at), "d MMM · HH:mm", { locale: es })}
              {" "}→ {segment.departureFlight.destination}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

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

      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="font-semibold text-lg" style={{ color: "#1a1714" }}>Itinerario</h2>
          {totalItems > 0 && (
            <p className="text-sm mt-0.5" style={{ color: "#6b5f54" }}>
              {segments.length} {segments.length === 1 ? "destino" : "destinos"} · {totalItems} {totalItems === 1 ? "elemento" : "elementos"}
            </p>
          )}
        </div>
        {canEdit && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAddModal("flight")}
              className="flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-xl transition-all"
              style={{ background: "#eef2f8", color: "#2563eb", border: "1px solid #c8d4e8" }}
            >
              🚗 Transporte
            </button>
            <button
              onClick={() => setAddModal("accommodation")}
              className="flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-xl transition-all"
              style={{ background: "#eaf4f0", color: "#2d6a4f", border: "1px solid #c0d8cc" }}
            >
              🏨 Hotel
            </button>
            <button
              onClick={() => setAddModal("activity")}
              className="flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-xl transition-all"
              style={{ background: "#f5ede5", color: "#c4622d", border: "1px solid #dfc8b8" }}
            >
              📍 Actividad
            </button>
          </div>
        )}
      </div>

      {!canEdit && (
        <div
          className="flex items-center gap-2 mb-6 px-4 py-2.5 rounded-xl text-sm"
          style={{ background: "#f0ebe3", color: "#6b5f54", border: "1px solid #e8e0d8" }}
        >
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          Solo tenés acceso de visualización en este viaje
        </div>
      )}

      {totalItems === 0 && canEdit && (
        <div
          className="flex flex-col items-center justify-center text-center py-16 px-6 rounded-2xl"
          style={{ background: "#f0ebe3", border: "1px dashed #d8cfc8" }}
        >
          {/* Ilustración SVG */}
          <div style={{ marginBottom: 20 }}>
            <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="72" height="72" rx="20" fill="#e8e0d8" />
              <path d="M20 44L28 36L34 42L44 30L52 38" stroke="#a09088" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="52" cy="24" r="6" fill="#2563eb" fillOpacity="0.15" stroke="#2563eb" strokeWidth="1.5"/>
              <path d="M52 21v3.5l2 1.5" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round"/>
              <rect x="20" y="48" width="12" height="4" rx="2" fill="#e8e0d8" stroke="#c8bdb5" strokeWidth="1"/>
              <rect x="36" y="48" width="16" height="4" rx="2" fill="#e8e0d8" stroke="#c8bdb5" strokeWidth="1"/>
            </svg>
          </div>
          <h3 className="font-semibold mb-2" style={{ color: "#1a1714", fontSize: 16 }}>
            El itinerario está vacío
          </h3>
          <p className="text-sm mb-6 max-w-xs leading-relaxed" style={{ color: "#6b5f54" }}>
            Empezá agregando el primer tramo — un vuelo, bus o auto que los lleve al destino.
          </p>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <button
              onClick={() => setAddModal("flight")}
              className="flex items-center gap-1.5 text-sm font-medium px-4 py-2.5 rounded-xl active:scale-95 transition-transform"
              style={{ background: "#2563eb", color: "#faf7f2" }}
            >
              ✈️ Agregar transporte
            </button>
            <button
              onClick={() => setAddModal("accommodation")}
              className="flex items-center gap-1.5 text-sm font-medium px-4 py-2.5 rounded-xl active:scale-95 transition-transform"
              style={{ background: "#faf7f2", color: "#1a1714", border: "1px solid #e8e0d8" }}
            >
              🏨 Alojamiento
            </button>
            <button
              onClick={() => setAddModal("activity")}
              className="flex items-center gap-1.5 text-sm font-medium px-4 py-2.5 rounded-xl active:scale-95 transition-transform"
              style={{ background: "#faf7f2", color: "#1a1714", border: "1px solid #e8e0d8" }}
            >
              📍 Actividad
            </button>
          </div>
        </div>
      )}

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

      {canEdit && (
        <>
          <Modal open={addModal === "flight"} onClose={() => setAddModal(null)} title="Agregar transporte">
            <FlightForm tripId={tripId}
              onSuccess={() => { setAddModal(null); refresh(); toast("Vuelo agregado"); }}
              onCancel={() => setAddModal(null)} />
          </Modal>
          <Modal open={addModal === "accommodation"} onClose={() => setAddModal(null)} title="Agregar alojamiento">
            <AccommodationForm tripId={tripId}
              onSuccess={() => { setAddModal(null); refresh(); toast("Alojamiento agregado"); }}
              onCancel={() => setAddModal(null)} />
          </Modal>
          <Modal open={addModal === "activity"} onClose={() => setAddModal(null)} title="Agregar actividad">
            <ActivityForm tripId={tripId}
              onSuccess={() => { setAddModal(null); refresh(); toast("Actividad agregada"); }}
              onCancel={() => setAddModal(null)} />
          </Modal>
        </>
      )}
    </>
  );
}