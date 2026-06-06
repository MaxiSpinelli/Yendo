import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import JoinSuccess from "@/components/trips/JoinSuccess";
import PublicTripView from "./PublicTripView";
import { differenceInDays, parseISO } from "date-fns";

interface Props {
  params: Promise<{ token: string }>;
}

export default async function JoinTripPage({ params }: Props) {
  const { token } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  // Buscar el viaje por share_token
  const { data: trip } = await supabase
    .from("trips")
    .select("*")
    .eq("share_token", token)
    .single();

  if (!trip) {
  console.log("Trip not found for token:", token);
  redirect("/dashboard");
}

  // Si no está logueado — mostrar preview público
  if (!user) {
  console.log("No user — fetching public data for token:", token);
  console.log("Trip found:", trip?.id);
    const [flightsRes, accommodationsRes, activitiesRes, membersRes, ownerProfileRes] = await Promise.all([
      supabase.from("flights").select("*").eq("trip_id", trip.id).order("departure_at"),
      supabase.from("accommodations").select("*").eq("trip_id", trip.id).order("checkin_at"),
      supabase.from("activities").select("*").eq("trip_id", trip.id).order("starts_at"),
      supabase.from("trip_members").select("user_id").eq("trip_id", trip.id),
      supabase.from("profiles").select("nickname, first_name").eq("id", trip.owner_id).single(),
    ]);

    const participantCount = (membersRes.data?.length ?? 0) + 1;
    const tripDays = differenceInDays(parseISO(trip.end_date), parseISO(trip.start_date)) + 1;
    const ownerName = ownerProfileRes.data?.nickname ?? ownerProfileRes.data?.first_name ?? "alguien";

    return (
      <PublicTripView
        trip={trip}
        flights={flightsRes.data ?? []}
        accommodations={accommodationsRes.data ?? []}
        activities={activitiesRes.data ?? []}
        participantCount={participantCount}
        tripDays={tripDays}
        ownerName={ownerName}
        joinToken={token}
      />
    );
  }

  // Si ya es el owner, ir directo
  if (trip.owner_id === user.id) redirect(`/trips/${trip.id}`);

  // Verificar si ya es miembro
  const { data: existing } = await supabase
    .from("trip_members")
    .select("id")
    .eq("trip_id", trip.id)
    .eq("user_id", user.id)
    .single();

  // Si no es miembro, agregarlo
  if (!existing) {
    await supabase.from("trip_members").insert({
      trip_id: trip.id,
      user_id: user.id,
      role: "editor",
    });
  }

  const { data: ownerProfile } = await supabase
    .from("profiles")
    .select("nickname, first_name")
    .eq("id", trip.owner_id)
    .single();

  const ownerName = ownerProfile?.nickname ?? ownerProfile?.first_name ?? "alguien";

  return (
    <JoinSuccess
      tripId={trip.id}
      tripName={trip.name}
      ownerName={ownerName}
      isNew={!existing}
    />
  );
}
