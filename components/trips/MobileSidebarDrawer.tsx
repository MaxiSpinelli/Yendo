"use client";

import { useState } from "react";
import TripSidebar from "@/components/trips/TripSidebar";
import ExpensesPanel from "@/components/trips/ExpensesPanel";
import type { Trip, Flight, Accommodation, Activity } from "@/lib/types/database";

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
}

export default function MobileSidebarDrawer({
  currentUserId,
  initialExpenses,
  accommodationCost,
  flightCost,
  ...props
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Botón flotante — solo mobile */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 z-40 flex items-center gap-2 shadow-lg"
        style={{
          background: "#1a1714",
          color: "#faf7f2",
          borderRadius: "99px",
          padding: "12px 18px",
          fontSize: "13px",
          fontWeight: 500,
          border: "none",
          cursor: "pointer",
        }}
      >
        <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Info del viaje
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-40"
          style={{ background: "rgba(26,23,20,0.4)" }}
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50 overflow-y-auto"
        style={{
          background: "#faf7f2",
          borderRadius: "20px 20px 0 0",
          padding: "0 16px 32px",
          maxHeight: "85vh",
          transform: open ? "translateY(0)" : "translateY(100%)",
          transition: "transform 0.3s ease",
        }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-4">
          <div style={{ width: 36, height: 4, borderRadius: 99, background: "#e8e0d8" }} />
        </div>

        <div className="flex flex-col gap-4">
          <TripSidebar {...props} />
          <ExpensesPanel
            tripId={props.trip.id}
            participants={props.participants}
            currentUserId={currentUserId}
            initialExpenses={initialExpenses}
            accommodationCost={accommodationCost}
            flightCost={flightCost}
          />
        </div>
      </div>
    </>
  );
}