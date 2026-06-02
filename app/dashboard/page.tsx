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

  // Fetch trips
  const { data: trips } = await supabase
    .from("trips")
    .select("*")
    .order("start_date", { ascending: true });

  // Fetch item counts per trip
  const tripIds = (trips ?? []).map((t) => t.id);

  const [flightCounts, accommodationCounts, activityCounts] =
    await Promise.all([
      supabase.from("flights").select("trip_id").in("trip_id", tripIds),
      supabase.from("accommodations").select("trip_id").in("trip_id", tripIds),
      supabase.from("activities").select("trip_id").in("trip_id", tripIds),
    ]);

  function countForTrip(rows: { trip_id: string }[] | null, tripId: string) {
    return (rows ?? []).filter((r) => r.trip_id === tripId).length;
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar email={user.email} />

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-7">
          <div>
            <h1 className="text-2xl font-semibold text-stone-900">Mis viajes</h1>
            <p className="text-stone-500 text-sm mt-0.5">
              {trips?.length
                ? `${trips.length} ${trips.length === 1 ? "viaje" : "viajes"}`
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

        {/* Grid */}
        {trips && trips.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {trips.map((trip) => (
              <TripCard
                key={trip.id}
                trip={trip}
                itemCount={
                  countForTrip(flightCounts.data, trip.id) +
                  countForTrip(accommodationCounts.data, trip.id) +
                  countForTrip(activityCounts.data, trip.id)
                }
              />
            ))}
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
      </main>
    </div>
  );
}
