import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import JoinSuccess from "@/components/trips/JoinSuccess";

interface Props {
  params: Promise<{ token: string }>;
}

export default async function JoinTripPage({ params }: Props) {
  const { token } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/auth/login?next=/join/${token}`);

  // Buscar el viaje por share_token
  const { data: trip } = await supabase
    .from("trips")
    .select("id, owner_id, name")
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

  // Buscar el nombre del owner
  const { data: ownerProfile } = await supabase
    .from("profiles")
    .select("nickname, first_name")
    .eq("id", trip.owner_id)
    .single();

  const ownerName = ownerProfile?.nickname ?? ownerProfile?.first_name ?? "alguien";

  // Mostrar pantalla de bienvenida en vez de redirigir directo
  return (
    <JoinSuccess
      tripId={trip.id}
      tripName={trip.name}
      ownerName={ownerName}
      isNew={!existing}
    />
  );
}