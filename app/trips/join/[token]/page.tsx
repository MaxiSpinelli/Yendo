import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

interface Props {
  params: Promise<{ token: string }>;
}

export default async function JoinTripPage({ params }: Props) {
  const { token } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/auth/login?next=/trips/join/${token}`);

  // Buscar el viaje por share_token
  const { data: trip } = await supabase
    .from("trips")
    .select("id, owner_id")
    .eq("share_token", token)
    .single();

  if (!trip) redirect("/dashboard");

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

  redirect(`/trips/${trip.id}`);
}