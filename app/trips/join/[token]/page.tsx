import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import JoinSuccess from "@/components/trips/JoinSuccess";
import PublicTripView from "./PublicTripView";
import { differenceInDays, parseISO, format } from "date-fns";
import { es } from "date-fns/locale";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ token: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params;
  const supabase = await createClient();

  const { data: trip } = await supabase
    .from("trips")
    .select("name, destination, start_date, end_date")
    .eq("share_token", token)
    .single();

  if (!trip) {
    return {
      title: "Yendo — Tu viaje en un solo lugar",
    };
  }

  const start = format(parseISO(trip.start_date), "d MMM", { locale: es });
  const end = format(parseISO(trip.end_date), "d MMM yyyy", { locale: es });
  const days = differenceInDays(parseISO(trip.end_date), parseISO(trip.start_date)) + 1;

  const title = `${trip.name} — Yendo`;
  const description = `${trip.destination} · ${start} → ${end} · ${days} días. Unite al viaje en Yendo.`;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://yendo.app";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${appUrl}/trips/join/${token}`,
      siteName: "Yendo",
      type: "website",
      images: [
        {
          url: `${appUrl}/og-default.png`,
          width: 1200,
          height: 630,
          alt: `${trip.name} — ${trip.destination}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function JoinTripPage({ params }: Props) {
  const { token } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  const { data: trip } = await supabase
    .from("trips")
    .select("*")
    .eq("share_token", token)
    .single();

  if (!trip) {
    console.log("Trip not found for token:", token);
    redirect("/dashboard");
  }

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

  if (trip.owner_id === user.id) redirect(`/trips/${trip.id}`);

  const { data: existing } = await supabase
    .from("trip_members")
    .select("id")
    .eq("trip_id", trip.id)
    .eq("user_id", user.id)
    .single();

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