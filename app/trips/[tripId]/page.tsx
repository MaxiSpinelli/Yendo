import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Timeline from "@/components/timeline/Timeline";
import TripHero from "@/components/trips/TripHero";
import TripStats from "@/components/trips/TripStats";
import TripSidebar from "@/components/trips/TripSidebar";
import ShareButton from "@/components/trips/ShareButton";
import { differenceInDays, parseISO } from "date-fns";
import MobileSidebarDrawer from "@/components/trips/MobileSidebarDrawer";
import ExpensesPanel from "@/components/trips/ExpensesPanel";

interface Props {
  params: Promise<{ tripId: string }>;
}

export default async function TripPage({ params }: Props) {
  const { tripId } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: trip } = await supabase
    .from("trips")
    .select("*")
    .eq("id", tripId)
    .single();

  if (!trip) notFound();

  const [flightsRes, accommodationsRes, activitiesRes, membersRes, ownerProfileRes, myTicketsRes, expensesRes] = await Promise.all([
    supabase.from("flights").select("*").eq("trip_id", tripId).order("departure_at"),
    supabase.from("accommodations").select("*").eq("trip_id", tripId).order("checkin_at"),
    supabase.from("activities").select("*").eq("trip_id", tripId).order("starts_at"),
    supabase.from("trip_members").select("user_id, role").eq("trip_id", tripId),
    supabase.from("profiles").select("nickname, first_name").eq("id", trip.owner_id).single(),
    supabase.from("personal_tickets").select("cost").eq("trip_id", tripId).eq("user_id", user.id),
    supabase.from("expenses").select("*").eq("trip_id", tripId).order("created_at"),
  ]);

  const flights = flightsRes.data ?? [];
  const accommodations = accommodationsRes.data ?? [];
  const activities = activitiesRes.data ?? [];
  const myTickets = myTicketsRes.data ?? [];
  const expenses = expensesRes.data ?? [];

  const memberIds = (membersRes.data ?? []).map((m) => m.user_id);
  let memberProfiles: { id: string; nickname: string | null; first_name: string | null }[] = [];
  if (memberIds.length > 0) {
    const { data } = await supabase
      .from("profiles")
      .select("id, nickname, first_name")
      .in("id", memberIds);
    memberProfiles = data ?? [];
  }

  const ownerProfile = ownerProfileRes.data;
  const isOwner = trip.owner_id === user.id;
  const myMembership = (membersRes.data ?? []).find((m) => m.user_id === user.id);
  const canEdit = isOwner || myMembership?.role === "editor";

  const allParticipants = [
  {
    id: trip.owner_id,
    nickname: ownerProfile?.nickname ?? null,
    first_name: ownerProfile?.first_name ?? null,
    isOwner: true,
  },
  ...memberProfiles.map((p) => ({
    ...p,
    nickname: p.nickname ?? null,
    first_name: p.first_name ?? null,
    isOwner: false,
  })),
];

const participantCount = allParticipants.length;
const accommodationCost = accommodations.reduce((sum, a) => {
  if (!a.cost) return sum;
  return sum + (a.cost_type === "total" ? a.cost / participantCount : a.cost);
}, 0);
const flightCost = myTickets.reduce((sum, t) => sum + (t.cost ?? 0), 0);

  const tripDays = differenceInDays(parseISO(trip.end_date), parseISO(trip.start_date)) + 1;

  // Extraer ciudades únicas de vuelos para el mapa
  const cities = [
    ...new Set([
      ...flights.map((f) => f.origin),
      ...flights.map((f) => f.destination),
    ]),
  ];

return (
    <div className="min-h-screen bg-white">

      {/* Hero — 65vh */}
      <TripHero
        trip={trip}
        participants={allParticipants}
        tripDays={tripDays}
        totalActivities={activities.length}
        isOwner={isOwner}
        canEdit={canEdit}
      />

      {/* Stat bar */}
      <TripStats
        flights={flights.length}
        accommodations={accommodations.length}
        activities={activities.length}
        days={tripDays}
        cities={cities.length}
        participants={allParticipants.length}
      />

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex gap-10 items-start">

          {/* Timeline — columna principal */}
          <div className="flex-1 min-w-0">
            <Timeline
              tripId={tripId}
              initialFlights={flights}
              initialAccommodations={accommodations}
              initialActivities={activities}
              canEdit={canEdit}
              cities={cities}
            />
          </div>

         <aside className="hidden lg:flex flex-col gap-4 w-72 flex-shrink-0 sticky top-6">
  <TripSidebar
    trip={trip}
    participants={allParticipants}
    flights={flights}
    accommodations={accommodations}
    activities={activities}
    cities={cities}
    myTickets={myTickets}
    participantCount={allParticipants.length}
  />
  <ExpensesPanel
    tripId={tripId}
    participants={allParticipants}
    currentUserId={user.id}
    initialExpenses={expenses}
    accommodationCost={accommodationCost}
    flightCost={flightCost}
  />
</aside>

        </div>
      </div>

      {/* Drawer mobile */}
      <MobileSidebarDrawer
  trip={trip}
  participants={allParticipants}
  flights={flights}
  accommodations={accommodations}
  activities={activities}
  cities={cities}
  myTickets={myTickets}
  participantCount={allParticipants.length}
  currentUserId={user.id}
  initialExpenses={expenses}
  accommodationCost={accommodationCost}
  flightCost={flightCost}
/>

    </div>
  );
}