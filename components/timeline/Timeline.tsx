"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
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

type AddModal = "flight" | "accommodation" | "activity" | null;

interface TimelineProps {
  tripId: string;
  initialFlights: Flight[];
  initialAccommodations: Accommodation[];
  initialActivities: Activity[];
}

export default function Timeline({
  tripId,
  initialFlights,
  initialAccommodations,
  initialActivities,
}: TimelineProps) {
  const router = useRouter();
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

  // Group by date label
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
      {/* Add buttons — solo cuando ya hay items */}
{totalItems > 0 && (
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

      {/* Timeline */}
      {totalItems === 0 ? (
  <div className="text-center py-12">
    <div className="w-14 h-14 rounded-full bg-brand-50 flex items-center justify-center mx-auto mb-4">
      <svg className="w-7 h-7 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" />
      </svg>
    </div>
    <h3 className="text-sm font-medium text-stone-700 mb-1">El viaje está vacío</h3>
    <p className="text-sm text-stone-400 mb-6">Empezá agregando lo primero que tengas confirmado.</p>
    <div className="flex gap-2 justify-center flex-wrap">
      <button
        onClick={() => setAddModal("flight")}
        className="btn-secondary text-sm gap-2"
      >
        <span>✈️</span> Agregar vuelo
      </button>
      <button
        onClick={() => setAddModal("accommodation")}
        className="btn-secondary text-sm gap-2"
      >
        <span>🏨</span> Agregar alojamiento
      </button>
      <button
        onClick={() => setAddModal("activity")}
        className="btn-secondary text-sm gap-2"
      >
        <span>📍</span> Agregar actividad
      </button>
    </div>
  </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(({ date, items }) => (
            <div key={date}>
              {/* Date header */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-2 h-2 rounded-full bg-brand-400 flex-shrink-0" />
                <span className="text-xs font-semibold text-stone-500 uppercase tracking-wide">
                  {date}
                </span>
                <div className="flex-1 h-px bg-stone-100" />
              </div>

              {/* Items for this date */}
              <div className="space-y-3 pl-5">
                {items.map((item) => {
                  if (item.type === "flight") {
                    return (
                      <FlightCard
                        key={item.data.id}
                        flight={item.data}
                        onRefresh={refresh}
                      />
                    );
                  }
                  if (item.type === "accommodation") {
                    return (
                      <AccommodationCard
                        key={item.data.id}
                        accommodation={item.data}
                        onRefresh={refresh}
                      />
                    );
                  }
                  return (
                    <ActivityCard
                      key={item.data.id}
                      activity={item.data}
                      onRefresh={refresh}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add modals */}
      <Modal
        open={addModal === "flight"}
        onClose={() => setAddModal(null)}
        title="Agregar vuelo"
      >
        <FlightForm
          tripId={tripId}
          onSuccess={() => { setAddModal(null); refresh(); }}
          onCancel={() => setAddModal(null)}
        />
      </Modal>

      <Modal
        open={addModal === "accommodation"}
        onClose={() => setAddModal(null)}
        title="Agregar alojamiento"
      >
        <AccommodationForm
          tripId={tripId}
          onSuccess={() => { setAddModal(null); refresh(); }}
          onCancel={() => setAddModal(null)}
        />
      </Modal>

      <Modal
        open={addModal === "activity"}
        onClose={() => setAddModal(null)}
        title="Agregar actividad"
      >
        <ActivityForm
          tripId={tripId}
          onSuccess={() => { setAddModal(null); refresh(); }}
          onCancel={() => setAddModal(null)}
        />
      </Modal>
    </>
  );
}
