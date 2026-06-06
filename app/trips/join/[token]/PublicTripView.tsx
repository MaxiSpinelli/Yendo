import Link from "next/link";
import { format, parseISO, differenceInDays } from "date-fns";
import { es } from "date-fns/locale";
import type { Flight, Accommodation, Activity } from "@/lib/types/database";
import YendoLogo from "@/components/ui/YendoLogo";

interface TripData {
  id: string;
  name: string;
  destination: string;
  start_date: string;
  end_date: string;
}

interface Props {
  trip: TripData;
  flights: Flight[];
  accommodations: Accommodation[];
  activities: Activity[];
  participantCount: number;
  tripDays: number;
  ownerName: string;
  joinToken: string;
}

interface CitySegment {
  city: string;
  arrivalDate: string | null;
  arrivalFlight: Flight | null;
  departureFlight: Flight | null;
  accommodation: Accommodation | null;
  dayGroups: { date: string; activities: Activity[] }[];
  nights: number;
}

function buildCitySegments(
  flights: Flight[],
  accommodations: Accommodation[],
  activities: Activity[]
): CitySegment[] {
  if (flights.length === 0 && accommodations.length === 0 && activities.length === 0) return [];

  if (flights.length === 0) {
    const city = accommodations[0]?.name ?? "Destino";
    const dayMap = new Map<string, Activity[]>();
    activities.forEach((a) => {
      const day = a.starts_at.slice(0, 10);
      if (!dayMap.has(day)) dayMap.set(day, []);
      dayMap.get(day)!.push(a);
    });
    const nights = accommodations.length > 0
      ? differenceInDays(parseISO(accommodations[0].checkout_at), parseISO(accommodations[0].checkin_at))
      : 0;
    return [{ city, arrivalDate: accommodations[0]?.checkin_at ?? null, arrivalFlight: null, departureFlight: null, accommodation: accommodations[0] ?? null, dayGroups: Array.from(dayMap.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([date, acts]) => ({ date, activities: acts })), nights }];
  }

  const sortedFlights = [...flights].sort((a, b) => a.departure_at.localeCompare(b.departure_at));
  const segments: CitySegment[] = [];

  const firstFlight = sortedFlights[0];
  segments.push({ city: firstFlight.origin, arrivalDate: null, arrivalFlight: null, departureFlight: firstFlight, accommodation: null, dayGroups: [], nights: 0 });

  sortedFlights.forEach((flight, i) => {
    const nextFlight = sortedFlights[i + 1] ?? null;
    const city = flight.destination;
    const accommodation = accommodations.find((a) =>
      a.address?.toLowerCase().includes(city.toLowerCase()) ||
      a.name?.toLowerCase().includes(city.toLowerCase())
    ) ?? accommodations[i] ?? null;
    const arriveAt = flight.departure_at;
    const leaveAt = nextFlight?.departure_at ?? null;
    const cityActivities = activities.filter((a) => {
      if (a.starts_at < arriveAt) return false;
      if (leaveAt && a.starts_at > leaveAt) return false;
      return true;
    });
    const dayMap = new Map<string, Activity[]>();
    cityActivities.forEach((a) => {
      const day = a.starts_at.slice(0, 10);
      if (!dayMap.has(day)) dayMap.set(day, []);
      dayMap.get(day)!.push(a);
    });
    const nights = accommodation
      ? differenceInDays(parseISO(accommodation.checkout_at), parseISO(accommodation.checkin_at))
      : nextFlight ? differenceInDays(parseISO(nextFlight.departure_at), parseISO(flight.departure_at)) : 0;
    segments.push({ city, arrivalDate: flight.departure_at, arrivalFlight: flight, departureFlight: nextFlight, accommodation, dayGroups: Array.from(dayMap.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([date, acts]) => ({ date, activities: acts })), nights });
  });

  return segments;
}

export default function PublicTripView({
  trip,
  flights,
  accommodations,
  activities,
  participantCount,
  tripDays,
  ownerName,
  joinToken,
}: Props) {
  const segments = buildCitySegments(flights, accommodations, activities);
  const loginUrl = `/auth/login?next=/trips/join/${joinToken}`;

  return (
    <div className="min-h-screen" style={{ background: "#faf7f2" }}>

      <div style={{ background: "#1a1714" }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <YendoLogo height={24} color="#faf7f2" />
          <Link
            href={loginUrl}
            className="text-xs font-medium px-4 py-2 rounded-xl transition-all"
            style={{ background: "#faf7f2", color: "#1a1714" }}
          >
            Iniciar sesión
          </Link>
        </div>
      </div>

      <div style={{ background: "#1a1714", paddingBottom: "2rem" }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-8">
          <p className="text-xs font-medium mb-2" style={{ color: "rgba(250,247,242,0.5)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            {ownerName} te invitó a su viaje
          </p>
          <h1
            className="font-normal mb-1"
            style={{ color: "#faf7f2", fontSize: "clamp(1.75rem, 4vw, 2.5rem)", letterSpacing: "-0.02em", lineHeight: 1.1 }}
          >
            {trip.name}
          </h1>
          <p className="mb-5" style={{ color: "rgba(250,247,242,0.6)", fontSize: "16px" }}>
            {trip.destination}
          </p>

          <div className="flex flex-wrap gap-2 mb-7">
            {[
              `📅 ${format(parseISO(trip.start_date), "d MMM", { locale: es })} → ${format(parseISO(trip.end_date), "d MMM yyyy", { locale: es })}`,
              `🗓 ${tripDays} ${tripDays === 1 ? "día" : "días"}`,
              `👥 ${participantCount} ${participantCount === 1 ? "viajero" : "viajeros"}`,
            ].map((pill) => (
              <span
                key={pill}
                className="text-xs font-medium px-3 py-1.5 rounded-full"
                style={{ background: "rgba(250,247,242,0.12)", color: "#faf7f2", border: "1px solid rgba(250,247,242,0.15)" }}
              >
                {pill}
              </span>
            ))}
          </div>

          <Link
            href={loginUrl}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm"
            style={{ background: "#c4622d", color: "#faf7f2" }}
          >
            Unite al viaje para colaborar →
          </Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <h2 className="font-semibold text-lg mb-6" style={{ color: "#1a1714" }}>
          Itinerario
        </h2>

        {segments.length === 0 ? (
          <div
            className="text-center py-12 rounded-2xl"
            style={{ background: "#f0ebe3", border: "1px dashed #d8cfc8" }}
          >
            <p className="text-3xl mb-3">🗺️</p>
            <p className="text-sm" style={{ color: "#6b5f54" }}>El itinerario está siendo armado.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {segments.map((segment, i) => (
              <div key={`${segment.city}-${i}`} className="relative">
                {i < segments.length - 1 && (
                  <div
                    className="absolute left-5 z-0"
                    style={{ top: 48, bottom: -32, width: 2, background: "linear-gradient(to bottom, #e8e0d8, transparent)" }}
                  />
                )}

                <div className="relative z-10 flex items-center gap-4 mb-4">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-semibold text-sm"
                    style={{ background: "#1a1714", color: "#faf7f2" }}
                  >
                    {i + 1}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg" style={{ color: "#1a1714", lineHeight: 1.2 }}>
                      {segment.city}
                    </h3>
                    <p className="text-sm" style={{ color: "#6b5f54" }}>
                      {segment.arrivalDate
                        ? format(parseISO(segment.arrivalDate), "d MMM", { locale: es })
                        : "Origen"}
                      {segment.nights > 0 && ` · ${segment.nights} ${segment.nights === 1 ? "noche" : "noches"}`}
                    </p>
                  </div>
                </div>

                <div className="ml-14 space-y-3 mb-2">
                  {segment.arrivalFlight && (
                    <div
                      className="flex items-center gap-3 px-4 py-3 rounded-xl"
                      style={{ background: "#eef2f8", border: "1px solid #c8d4e8" }}
                    >
                      <span>✈️</span>
                      <div>
                        <p className="text-sm font-medium" style={{ color: "#2563eb" }}>
                          {segment.arrivalFlight.airline} {segment.arrivalFlight.flight_number}
                        </p>
                        <p className="text-xs" style={{ color: "#6b7fa0" }}>
                          {segment.arrivalFlight.origin} → {segment.arrivalFlight.destination} · {format(parseISO(segment.arrivalFlight.departure_at), "d MMM · HH:mm", { locale: es })}
                        </p>
                      </div>
                    </div>
                  )}

                  {segment.accommodation && (
                    <div
                      className="flex items-center gap-3 px-4 py-3 rounded-xl"
                      style={{ background: "#eaf4f0", border: "1px solid #c0d8cc" }}
                    >
                      <span>🏨</span>
                      <div>
                        <p className="text-sm font-medium" style={{ color: "#2d6a4f" }}>
                          {segment.accommodation.name}
                        </p>
                        <p className="text-xs" style={{ color: "#4a8a6a" }}>
                          Check-in {format(parseISO(segment.accommodation.checkin_at), "d MMM · HH:mm", { locale: es })}
                          {" · "}
                          Check-out {format(parseISO(segment.accommodation.checkout_at), "d MMM", { locale: es })}
                        </p>
                      </div>
                    </div>
                  )}

                  {segment.dayGroups.map(({ date, activities: acts }) => (
                    <div key={date}>
                      <p className="text-xs font-semibold uppercase tracking-wider mb-2 mt-4" style={{ color: "#a09088" }}>
                        {format(parseISO(date), "EEEE d MMM", { locale: es })}
                      </p>
                      <div className="space-y-2">
                        {acts.map((activity) => (
                          <div
                            key={activity.id}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl"
                            style={{ background: "#f5ede5", border: "1px solid #dfc8b8" }}
                          >
                            <span>📍</span>
                            <div>
                              <p className="text-sm font-medium" style={{ color: "#c4622d" }}>
                                {activity.name}
                              </p>
                              <p className="text-xs" style={{ color: "#a06040" }}>
                                {format(parseISO(activity.starts_at), "HH:mm", { locale: es })}
                                {activity.location && ` · ${activity.location}`}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div
          className="mt-12 rounded-2xl p-8 text-center"
          style={{ background: "#1a1714" }}
        >
          <p className="font-semibold text-lg mb-1" style={{ color: "#faf7f2" }}>
            ¿Viajás con {ownerName}?
          </p>
          <p className="text-sm mb-6" style={{ color: "rgba(250,247,242,0.6)" }}>
            Unite para ver todos los detalles, agregar tus datos y coordinar con el grupo.
          </p>
          <Link
            href={loginUrl}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm"
            style={{ background: "#c4622d", color: "#faf7f2" }}
          >
            Crear cuenta gratis →
          </Link>
          <p className="text-xs mt-3" style={{ color: "rgba(250,247,242,0.35)" }}>
            ¿Ya tenés cuenta?{" "}
            <Link
              href={loginUrl}
              style={{ color: "rgba(250,247,242,0.6)", textDecoration: "underline" }}
            >
              Iniciá sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
