import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/layout/Navbar";
import Timeline from "@/components/timeline/Timeline";
import { formatDate } from "@/lib/utils/date";
import ShareButton from "@/components/trips/ShareButton";

interface Props {
  params: Promise<{ tripId: string }>;
}

export default async function TripPage({ params }: Props) {
  const { tripId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // Fetch trip
  const { data: trip } = await supabase
    .from("trips")
    .select("*")
    .eq("id", tripId)
    .single();

  if (!trip) notFound();

  // Fetch all items in parallel
  const [flightsRes, accommodationsRes, activitiesRes, membersRes, ownerProfileRes] = await Promise.all([
    supabase.from("flights").select("*").eq("trip_id", tripId).order("departure_at"),
    supabase.from("accommodations").select("*").eq("trip_id", tripId).order("checkin_at"),
    supabase.from("activities").select("*").eq("trip_id", tripId).order("starts_at"),
    supabase.from("trip_members").select("user_id").eq("trip_id", tripId),
    supabase.from("profiles").select("nickname, first_name").eq("id", trip.owner_id).single(),
  ]);

  const flights = flightsRes.data ?? [];
  const accommodations = accommodationsRes.data ?? [];
  const activities = activitiesRes.data ?? [];
  const totalItems = flights.length + accommodations.length + activities.length;

  // Traer perfiles de los miembros
  const memberIds = (membersRes.data ?? []).map((m) => m.user_id);
  let memberProfiles: { id: string; nickname: string | null; first_name: string | null }[] = [];
  if (memberIds.length > 0) {
    const { data } = await supabase
      .from("profiles")
      .select("id, nickname, first_name")
      .in("id", memberIds);
    memberProfiles = data ?? [];
  }

  // Owner profile
  const ownerProfile = ownerProfileRes.data;

  // Todos los participantes: owner + miembros
  const allParticipants = [
    { id: trip.owner_id, nickname: ownerProfile?.nickname, first_name: ownerProfile?.first_name, isOwner: true },
    ...memberProfiles.map((p) => ({ ...p, isOwner: false })),
  ];

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar email={user.email} />

      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-700 mb-5 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Mis viajes
        </Link>

        {/* Trip header */}
        <div className="mb-7">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold text-stone-900">{trip.name}</h1>
              <p className="text-stone-500 mt-0.5">{trip.destination}</p>
            </div>
            <div className="flex items-center gap-2">
              <ShareButton shareToken={trip.share_token} />
              <Link
                href={`/trips/${trip.id}/edit`}
                className="btn-ghost text-sm flex-shrink-0"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Editar
              </Link>
            </div>
          </div>

          {/* Meta row */}
          <div className="flex items-center gap-4 mt-3 text-sm text-stone-500 flex-wrap">
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {formatDate(trip.start_date)} → {formatDate(trip.end_date)}
            </div>
            <span className="text-stone-300">·</span>
            <span>{totalItems} {totalItems === 1 ? "elemento" : "elementos"}</span>
          </div>

          {/* Participantes */}
          {allParticipants.length > 0 && (
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              {allParticipants.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-1.5 bg-white border border-stone-200 rounded-full px-3 py-1"
                >
                  <div className="w-5 h-5 rounded-full bg-brand-100 flex items-center justify-center text-xs font-semibold text-brand-700">
                    {(p.nickname ?? p.first_name ?? "?")[0].toUpperCase()}
                  </div>
                  <span className="text-xs text-stone-700">
                    {p.nickname ?? p.first_name ?? "Sin nombre"}
                  </span>
                  {p.isOwner && (
                    <span className="text-xs text-stone-400">👑</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Timeline (client component) */}
        <Timeline
          tripId={tripId}
          initialFlights={flights}
          initialAccommodations={accommodations}
          initialActivities={activities}
        />
      </main>
    </div>
  );
}