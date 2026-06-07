"use client";

import { useState } from "react";
import TripSidebar from "@/components/trips/TripSidebar";
import ExpensesPanel from "@/components/trips/ExpensesPanel";
import Timeline from "@/components/timeline/Timeline";
import TripOnboarding from "@/components/trips/TripOnboarding";
import type { Trip, Flight, Accommodation, Activity } from "@/lib/types/database";
import React from "react";

interface Participant {
  id: string;
  nickname: string | null;
  first_name: string | null;
  isOwner: boolean;
}

interface MyTicket {
  cost: number | null;
}

interface Expense {
  id: string;
  paid_by: string;
  description: string;
  amount: number;
  created_at: string;
}

interface Props {
  trip: Trip;
  participants: Participant[];
  flights: Flight[];
  accommodations: Accommodation[];
  activities: Activity[];
  cities: string[];
  myTickets: MyTicket[];
  participantCount: number;
  currentUserId: string;
  initialExpenses: Expense[];
  accommodationCost: number;
  flightCost: number;
  canEdit: boolean;
  isFirstTrip: boolean;
}

type Tab = "itinerary" | "expenses" | "info";

const tabs: { id: Tab; label: string; icon: (active: boolean) => React.ReactNode }[] = [
  {
    id: "itinerary",
    label: "Itinerario",
    icon: (active) => (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    id: "expenses",
    label: "Gastos",
    icon: (active) => (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    id: "info",
    label: "Info",
    icon: (active) => (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

export default function MobileTabBar({
  trip,
  participants,
  flights,
  accommodations,
  activities,
  cities,
  myTickets,
  participantCount,
  currentUserId,
  initialExpenses,
  accommodationCost,
  flightCost,
  canEdit,
  isFirstTrip,
}: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("itinerary");

  return (
    // Contenedor que ocupa el espacio debajo del hero en mobile
    <div className="lg:hidden flex flex-col" style={{ minHeight: "calc(100vh - 55vh)" }}>

      {/* Contenido del tab activo */}
      <div className="flex-1 px-4 pt-4 pb-24">
        {activeTab === "itinerary" && (
          <div className="flex flex-col gap-4">
            {isFirstTrip && (
              <TripOnboarding
                tripId={trip.id}
                hasFlights={flights.length > 0}
                hasAccommodation={accommodations.length > 0}
                hasMembers={participants.length > 1}
                shareToken={trip.share_token}
              />
            )}
            <Timeline
              tripId={trip.id}
              initialFlights={flights}
              initialAccommodations={accommodations}
              initialActivities={activities}
              canEdit={canEdit}
              cities={cities}
            />
          </div>
        )}

        {activeTab === "expenses" && (
          <ExpensesPanel
            tripId={trip.id}
            participants={participants}
            currentUserId={currentUserId}
            initialExpenses={initialExpenses}
            accommodationCost={accommodationCost}
            flightCost={flightCost}
          />
        )}

        {activeTab === "info" && (
          <TripSidebar
            trip={trip}
            participants={participants}
            flights={flights}
            accommodations={accommodations}
            activities={activities}
            cities={cities}
            myTickets={myTickets}
            participantCount={participantCount}
          />
        )}
      </div>

      {/* Tab bar fija en el fondo */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 flex lg:hidden"
        style={{
          background: "#faf7f2",
          borderTop: "1px solid #e8e0d8",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        {tabs.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-1 flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform"
              style={{
                padding: "10px 0 8px",
                color: active ? "#1a1714" : "#a09088",
                background: "none",
                border: "none",
                cursor: "pointer",
                transition: "color 0.15s ease",
              }}
            >
              {tab.icon(active)}
              <span
                style={{
                  fontSize: 11,
                  fontWeight: active ? 600 : 400,
                  letterSpacing: "0.01em",
                  lineHeight: 1,
                }}
              >
                {tab.label}
              </span>
              {active && (
                <span
                  style={{
                    position: "absolute",
                    bottom: "calc(env(safe-area-inset-bottom) + 0px)",
                    width: 24,
                    height: 2,
                    borderRadius: 99,
                    background: "#1a1714",
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
