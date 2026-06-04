import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/layout/Navbar";
import TripCard from "@/components/trips/TripCard";
import EmptyState from "@/components/layout/EmptyState";
import { formatShortDate } from "@/lib/utils/date";
import type { Trip, Flight, Accommodation, Activity } from "@/lib/types/database";

type UpcomingEvent =
  | { type: "flight"; date: string; label: string; sub: string }
  | { type: "accommodation"; date: string; label: string; sub: string }
  | { type: "activity"; date: string; label: string; sub: string };

function getCities(destination: string): string[] {
  return destination.split(",").map((c) => c.trim());
}

function getDaysUntil(dateStr: string): number {
  const diff = new Date(dateStr).getTime() - new Date().getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function fmt(iso: string): string {
  return new Date(iso).toLocaleDateString("es-AR", { day: "numeric", month: "short" });
}

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
}

function NextTripCard({ trip, participants }: { trip: Trip; participants: string[] }) {
  const cities = getCities(trip.destination);
  const days = getDaysUntil(trip.start_date);
  const isOngoing = new Date(trip.start_date) <= new Date() && new Date(trip.end_date) >= new Date();

  return (
    <Link href={`/trips/${trip.id}`} style={{ textDecoration: "none", display: "block" }}>
      <div style={{ background: "#1a1714", borderRadius: "20px", padding: "28px", height: "100%" }}>
        <p style={{ fontSize: "11px", color: "rgba(250,247,242,0.35)", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 8px" }}>
          {isOngoing ? "Viaje en curso" : "Próxima aventura"}
        </p>

        <p style={{ fontSize: "24px", fontWeight: 500, color: "#faf7f2", margin: "0 0 16px", fontFamily: "var(--font-display)", fontStyle: "italic" }}>
          {trip.name}
        </p>

        <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "6px", marginBottom: "20px" }}>
          {cities.map((city, i) => (
            <div key={city} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ background: "rgba(250,247,242,0.1)", border: "1px solid rgba(250,247,242,0.15)", borderRadius: "99px", padding: "5px 12px", fontSize: "12px", color: "rgba(250,247,242,0.9)" }}>
                {city}
              </span>
              {i < cities.length - 1 && (
                <span style={{ fontSize: "14px", color: "rgba(250,247,242,0.25)" }}>→</span>
              )}
            </div>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" }}>
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: "rgba(250,247,242,0.4)", flexShrink: 0 }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span style={{ color: "rgba(250,247,242,0.85)" }}>
              {formatShortDate(trip.start_date)} → {formatShortDate(trip.end_date)}
            </span>
          </div>
          {participants.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px" }}>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: "rgba(250,247,242,0.4)", flexShrink: 0 }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span style={{ color: "rgba(250,247,242,0.85)" }}>
                {participants.join(", ")}
              </span>
            </div>
          )}
        </div>

        {!isOngoing && days > 0 && (
          <div style={{ marginBottom: "20px" }}>
            <span style={{ fontSize: "32px", fontWeight: 500, color: "#c4622d", lineHeight: 1 }}>{days}</span>
            <span style={{ fontSize: "13px", color: "rgba(250,247,242,0.35)", marginLeft: "8px" }}>
              días para despegar
            </span>
          </div>
        )}

        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#faf7f2", color: "#1a1714", borderRadius: "99px", padding: "9px 18px", fontSize: "13px", fontWeight: 500 }}>
          Ver itinerario
          <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </div>
      </div>
    </Link>
  );
}

function UpcomingEvents({ events }: { events: UpcomingEvent[] }) {
  const iconBg = (type: string) =>
    type === "flight" ? "#e8f0ff" : type === "accommodation" ? "#e8f5ee" : "#f5ede8";
  const iconColor = (type: string) =>
    type === "flight" ? "#2563eb" : type === "accommodation" ? "#2d6a4f" : "#c4622d";
  const iconPath = (type: string) => {
    if (type === "flight") return "M12 19l9 2-9-18-9 18 9-2zm0 0v-8";
    if (type === "accommodation") return "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z";
    return "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z";
  };

  return (
    <div style={{ background: "#f0ebe3", border: "1px solid #e8e0d8", borderRadius: "20px", padding: "20px" }}>
      <p style={{ fontSize: "11px", color: "#a09088", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 16px" }}>
        Próximos eventos
      </p>
      <div style={{ display: "flex", flexDirection: "column" }}>
       {events.map((event, i) => (
  <div key={i} className={i === 2 ? "hidden sm:flex" : "flex"} style={{ alignItems: "flex-start", gap: "12px", padding: "12px 0", borderBottom: i < events.length - 1 ? "1px solid #e8e0d8" : "none" }}>
            <div style={{ width: "34px", height: "34px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: iconBg(event.type) }}>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke={iconColor(event.type)} strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d={iconPath(event.type)} />
              </svg>
            </div>
            <div>
              <p style={{ fontSize: "13px", fontWeight: 500, color: "#1a1714", margin: "0 0 2px" }}>{event.label}</p>
              <p style={{ fontSize: "12px", color: "#a09088", margin: 0 }}>{event.sub}</p>
            </div>
          </div>
        ))}
        {events.length === 0 && (
          <p style={{ fontSize: "13px", color: "#a09088", margin: 0 }}>Sin eventos próximos</p>
        )}
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("nickname, first_name")
    .eq("id", user.id)
    .single();

  const displayName = profile?.nickname ?? profile?.first_name ?? user.email?.split("@")[0] ?? "viajero";

  const [{ data: trips }, { data: memberships }] = await Promise.all([
    supabase.from("trips").select("*").order("start_date", { ascending: true }),
    supabase.from("trip_members").select("trip_id, user_id").eq("user_id", user.id),
  ]);

  const memberTripIds = new Set((memberships ?? []).map((m) => m.trip_id));
  const myTrips = (trips ?? []).filter((t) => t.owner_id === user.id);
  const sharedTrips = (trips ?? []).filter((t) => t.owner_id !== user.id && memberTripIds.has(t.id));
  const allTrips = [...myTrips, ...sharedTrips];

  const now = new Date();
  const nextTrip = allTrips.find((t) => new Date(t.end_date) >= now) ?? null;

  let participantNames: string[] = [];
  if (nextTrip) {
    const { data: members } = await supabase
      .from("trip_members").select("user_id").eq("trip_id", nextTrip.id);
    const memberIds = (members ?? []).map((m) => m.user_id);
    const allIds = [nextTrip.owner_id, ...memberIds].filter(Boolean);
    if (allIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles").select("id, nickname, first_name").in("id", allIds);
      participantNames = (profiles ?? []).map((p) => p.nickname ?? p.first_name ?? "Viajero");
    }
  }

  let upcomingEvents: UpcomingEvent[] = [];
  if (nextTrip) {
    const [{ data: flights }, { data: accommodations }, { data: activities }] = await Promise.all([
      supabase.from("flights").select("*").eq("trip_id", nextTrip.id).gte("departure_at", now.toISOString()).order("departure_at").limit(2),
      supabase.from("accommodations").select("*").eq("trip_id", nextTrip.id).gte("checkin_at", now.toISOString()).order("checkin_at").limit(1),
      supabase.from("activities").select("*").eq("trip_id", nextTrip.id).gte("starts_at", now.toISOString()).order("starts_at").limit(2),
    ]);

    const raw: UpcomingEvent[] = [
      ...(flights ?? []).map((f: Flight) => ({
        type: "flight" as const,
        date: f.departure_at,
        label: `${f.origin} → ${f.destination}`,
        sub: `${fmt(f.departure_at)} · ${fmtTime(f.departure_at)}`,
      })),
      ...(accommodations ?? []).map((a: Accommodation) => ({
        type: "accommodation" as const,
        date: a.checkin_at,
        label: a.name,
        sub: `Check-in · ${fmt(a.checkin_at)} · ${fmtTime(a.checkin_at)}`,
      })),
      ...(activities ?? []).map((a: Activity) => ({
        type: "activity" as const,
        date: a.starts_at,
        label: a.name,
        sub: `${fmt(a.starts_at)} · ${fmtTime(a.starts_at)}`,
      })),
    ];

    upcomingEvents = raw
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 3);
  }

  const totalTrips = allTrips.length;

  return (
    <div style={{ minHeight: "100vh", background: "#faf7f2", fontFamily: "var(--font-sans)" }}>
      <Navbar email={user.email} userName={displayName} />

      <main style={{ maxWidth: "900px", margin: "0 auto", padding: "24px 16px" }}>

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 style={{ fontSize: "22px", fontWeight: 500, color: "#1a1714", margin: "0 0 4px" }}>
              Hola, {displayName}
            </h1>
            <p style={{ fontSize: "14px", color: "#6b5f54", margin: 0 }}>
              {nextTrip
                ? `Tu próxima aventura sale en ${getDaysUntil(nextTrip.start_date)} días`
                : totalTrips
                ? `${totalTrips} ${totalTrips === 1 ? "viaje" : "viajes"} en total`
                : "Todavía no tenés viajes"}
            </p>
          </div>
          <Link
            href="/trips/new"
            className="hidden sm:inline-flex items-center gap-1.5"
            style={{ background: "#1a1714", color: "#faf7f2", borderRadius: "99px", padding: "10px 20px", fontSize: "13px", fontWeight: 500, textDecoration: "none", whiteSpace: "nowrap" }}
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Nuevo viaje
          </Link>
        </div>

        {/* Próximo viaje — stack en mobile, grid en desktop */}
        {nextTrip && (
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_260px] gap-3 mb-8">
            <NextTripCard trip={nextTrip} participants={participantNames} />
            <UpcomingEvents events={upcomingEvents} />
          </div>
        )}

        {/* Mis viajes — 2 cols en mobile, 4 en desktop */}
        {allTrips.length > 0 ? (
          <div>
            <p style={{ fontSize: "11px", color: "#a09088", fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 12px" }}>
              Mis viajes
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {allTrips.map((trip) => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  isOwner={trip.owner_id === user.id}
                />
              ))}
              <Link
                href="/trips/new"
                className="flex flex-col items-center justify-center gap-1.5"
                style={{ border: "1px dashed #e8e0d8", borderRadius: "16px", minHeight: "110px", textDecoration: "none", color: "#a09088" }}
              >
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                <span style={{ fontSize: "13px" }}>Nuevo viaje</span>
              </Link>
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
            description="Creá tu primer viaje y empezá a organizar vuelos, alojamientos y actividades."
            action={<Link href="/trips/new" className="btn-primary">Crear mi primer viaje</Link>}
          />
        )}
      </main>
    </div>
  );
}