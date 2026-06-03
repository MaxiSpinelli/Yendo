import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/layout/Navbar";
import TripCard from "@/components/trips/TripCard";
import EmptyState from "@/components/layout/EmptyState";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  // Fetch trips y memberships en paralelo
  const [{ data: trips }, { data: memberships }] = await Promise.all([
    supabase.from("trips").select("*").order("start_date", { ascending: true }),
    supabase.from("trip_members").select("trip_id").eq("user_id", user.id),
  ]);

  const memberTripIds = new Set((memberships ?? []).map((m) => m.trip_id));

  // Filtrar explícitamente por membresía real
  const myTrips = (trips ?? []).filter((t) => t.owner_id === user.id);
  const sharedTrips = (trips ?? []).filter(
    (t) => t.owner_id !== user.id && memberTripIds.has(t.id)
  );

  const allMyTrips = [...myTrips, ...sharedTrips];
  const tripIds = allMyTrips.map((t) => t.id);

  const [flightCounts, accommodationCounts, activityCounts] = await Promise.all([
    supabase.from("flights").select("trip_id").in("trip_id", tripIds),
    supabase.from("accommodations").select("trip_id").in("trip_id", tripIds),
    supabase.from("activities").select("trip_id").in("trip_id", tripIds),
  ]);

  function countForTrip(rows: { trip_id: string }[] | null, tripId: string) {
    return (rows ?? []).filter((r) => r.trip_id === tripId).length;
  }

  function itemCount(tripId: string) {
    return (
      countForTrip(flightCounts.data, tripId) +
      countForTrip(accommodationCounts.data, tripId) +
      countForTrip(activityCounts.data, tripId)
    );
  }

  const totalTrips = myTrips.length + sharedTrips.length;

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar email={user.email} />

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-7">
          <div>
            <h1 className="text-2xl font-semibold text-stone-900">Mis viajes</h1>
            <p className="text-stone-500 text-sm mt-0.5">
              {totalTrips
                ? `${totalTrips} ${totalTrips === 1 ? "viaje" : "viajes"}`
                : "Todavía no tenés viajes"}
            </p>
          </div>
          <Link href="/trips/new" className="btn-primary">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Nuevo viaje
          </Link>
        </div>

        {/* Mis viajes */}
        {myTrips.length > 0 ? (
          <div className="mb-10">
            <h2 className="text-sm font-medium text-stone-500 uppercase tracking-wide mb-3">
              Creados por mí
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {myTrips.map((trip) => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  itemCount={itemCount(trip.id)}
                  isOwner={true}
                />
              ))}
            </div>
          </div>
        ) : (
          <EmptyState
            icon={
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776" />
              </svg>
            }
            title="Todavía no tenés viajes"
            description="Creá tu primer viaje y empezá a organizar vuelos, alojamientos y actividades en un solo lugar."
            action={
              <Link href="/trips/new" className="btn-primary">
                Crear mi primer viaje
              </Link>
            }
          />
        )}

        {/* Viajes compartidos */}
        {sharedTrips.length > 0 && (
          <div>
            <h2 className="text-sm font-medium text-stone-500 uppercase tracking-wide mb-3">
              Compartidos conmigo
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {sharedTrips.map((trip) => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  itemCount={itemCount(trip.id)}
                  isOwner={false}
                />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}