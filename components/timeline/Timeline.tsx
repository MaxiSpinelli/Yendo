"use client";

import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Flight, Accommodation, Activity } from "@/lib/types/database";
import { buildTimeline } from "@/lib/utils/timeline";
import { formatShortDate } from "@/lib/utils/date";
import FlightCard from "./FlightCard";
import AccommodationCard from "./AccommodationCard";
import ActivityCard from "./ActivityCard";
import Modal from "@/components/ui/Modal";
import FlightForm from "@/components/forms/FlightForm";
import AccommodationForm from "@/components/forms/AccommodationForm";
import ActivityForm from "@/components/forms/ActivityForm";
import EmptyState from "@/components/layout/EmptyState";
import { ToastProvider, toast } from "@/components/ui/Toast";

type AddModal = "flight" | "accommodation" | "activity" | null;

interface TimelineProps {
  tripId: string;
  initialFlights: Flight[];
  initialAccommodations: Accommodation[];
  initialActivities: Activity[];
  canEdit?: boolean;
}

export default function Timeline({
  tripId,
  initialFlights,
  initialAccommodations,
  initialActivities,
  canEdit = true,
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

  const timeline = buildTimeline(flights, accommodations, activities);
  const totalItems = flights.length + accommodations.length + activities.length;

  const grouped: { date: string; items: typeof timeline }[] = [];
  for (const item of timeline) {
    const date = formatShortDate(item.sortKey);
    const last = grouped[grouped.length - 1];
    if (!last || last.date !== date) {
      grouped.push({ date, items: [item] });
    } else {
      last.items.push(item);
    }
  }

  return (
    <>
      <ToastProvider />

      {/* Add buttons — solo para editors */}
      {canEdit && totalItems > 0 && (
        <div className="flex gap-2 flex-wrap mb-6">
          <button onClick={() => setAddModal("flight")} className="btn-secondary text-sm gap-2">
            <span>✈️</span> Vuelo
          </button>
          <button onClick={() => setAddModal("accommodation")} className="btn-secondary text-sm gap-2">
            <span>🏨</span> Alojamiento
          </button>
          <button onClick={() => setAddModal("activity")} className="btn-secondary text-sm gap-2">
            <span>📍</span> Actividad
          </button>
        </div>
      )}

      {/* Viewer badge */}
      {!canEdit && (
        <div className="flex items-center gap-2 mb-5 px-3 py-2 bg-cream rounded-xl border border-navy-100 text-xs text-navy-300">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          Solo tenés acceso de visualización en este viaje
        </div>
      )}

      {/* Timeline */}
      {totalItems === 0 ? (
        canEdit ? (
          <div className="text-center py-12">
            <div className="w-14 h-14 rounded-full bg-cream-dark flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-navy-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
              </svg>
            </div>
            <h3 className="text-sm font-medium text-navy-700 mb-1">El viaje está vacío</h3>
            <p className="text-sm text-navy-300 mb-6">Empezá agregando lo primero que tengas confirmado.</p>
            <div className="flex gap-2 justify-center flex-wrap">
              <button onClick={() => setAddModal("flight")} className="btn-secondary text-sm gap-2">
                <span>✈️</span> Agregar vuelo
              </button>
              <button onClick={() => setAddModal("accommodation")} className="btn-secondary text-sm gap-2">
                <span>🏨</span> Agregar alojamiento
              </button>
              <button onClick={() => setAddModal("activity")} className="btn-secondary text-sm gap-2">
                <span>📍</span> Agregar actividad
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-sm text-navy-300">Este viaje todavía no tiene contenido.</p>
          </div>
        )
      ) : (
        <div className="space-y-6">
          {grouped.map(({ date, items }) => (
            <div key={date}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-2 h-2 rounded-full bg-amber flex-shrink-0" />
                <span className="text-xs font-semibold text-navy-300 uppercase tracking-wide">
                  {date}
                </span>
                <div className="flex-1 h-px bg-navy-100" />
              </div>

              <div className="space-y-3 pl-5">
                {items.map((item) => {
                  if (item.type === "flight") {
                    return (
                      <FlightCard
                        key={item.data.id}
                        flight={item.data}
                        onRefresh={refresh}
                        canEdit={canEdit}
                      />
                    );
                  }
                  if (item.type === "accommodation") {
                    return (
                      <AccommodationCard
                        key={item.data.id}
                        accommodation={item.data}
                        onRefresh={refresh}
                        canEdit={canEdit}
                      />
                    );
                  }
                  return (
                    <ActivityCard
                      key={item.data.id}
                      activity={item.data}
                      onRefresh={refresh}
                      canEdit={canEdit}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add modals — solo se muestran si canEdit */}
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
