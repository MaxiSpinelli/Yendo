import Link from "next/link";
import { format, parseISO, differenceInDays } from "date-fns";
import { es } from "date-fns/locale";
import YendoLogo from "@/components/ui/YendoLogo";

const DEMO_TRIP = {
  name: "Europa 2025",
  destination: "París, Roma, Barcelona",
  start_date: "2025-07-10",
  end_date: "2025-07-25",
};

const DEMO_FLIGHTS = [
  {
    id: "f1",
    airline: "Aerolíneas Argentinas",
    flight_number: "AR1160",
    origin: "EZE",
    destination: "CDG",
    departure_at: "2025-07-10T22:00:00",
    notes: "Terminal B, llevar documentación",
  },
  {
    id: "f2",
    airline: "Vueling",
    flight_number: "VY8832",
    origin: "CDG",
    destination: "FCO",
    departure_at: "2025-07-15T09:30:00",
    notes: null,
  },
  {
    id: "f3",
    airline: "Ryanair",
    flight_number: "FR2241",
    origin: "FCO",
    destination: "BCN",
    departure_at: "2025-07-20T14:15:00",
    notes: null,
  },
];

const DEMO_ACCOMMODATIONS = [
  {
    id: "a1",
    name: "Hotel Le Marais",
    address: "12 Rue de Bretagne, París",
    checkin_at: "2025-07-11T14:00:00",
    checkout_at: "2025-07-15T11:00:00",
    notes: "Check-in a partir de las 14hs",
    cost: 600,
    cost_type: "total",
  },
  {
    id: "a2",
    name: "Airbnb Trastevere",
    address: "Via della Lungaretta 45, Roma",
    checkin_at: "2025-07-15T16:00:00",
    checkout_at: "2025-07-20T10:00:00",
    notes: null,
    cost: 180,
    cost_type: "per_person",
  },
  {
    id: "a3",
    name: "Hotel Arts Barcelona",
    address: "Carrer de la Marina 19, Barcelona",
    checkin_at: "2025-07-20T15:00:00",
    checkout_at: "2025-07-25T12:00:00",
    notes: null,
    cost: 750,
    cost_type: "total",
  },
];

const DEMO_ACTIVITIES = [
  {
    id: "ac1",
    name: "Tour por el Louvre",
    starts_at: "2025-07-12T10:00:00",
    location: "Musée du Louvre, París",
    notes: "Entradas compradas, imprimir voucher",
  },
  {
    id: "ac2",
    name: "Cena en Le Jules Verne",
    starts_at: "2025-07-13T20:30:00",
    location: "Torre Eiffel, París",
    notes: "Reserva a nombre de García",
  },
  {
    id: "ac3",
    name: "Visita al Coliseo",
    starts_at: "2025-07-16T09:00:00",
    location: "Piazza del Colosseo, Roma",
    notes: null,
  },
  {
    id: "ac4",
    name: "Sagrada Família",
    starts_at: "2025-07-21T11:00:00",
    location: "Carrer de Mallorca 401, Barcelona",
    notes: "Entradas para las 11hs",
  },
];

const DEMO_PARTICIPANTS = [
  { name: "Maxi", isOwner: true },
  { name: "Sofi", isOwner: false },
  { name: "Nico", isOwner: false },
];

const DEMO_SEGMENTS = [
  {
    city: "Buenos Aires",
    nights: 0,
    arrivalFlight: null,
    departureFlight: DEMO_FLIGHTS[0],
    accommodation: null,
    dayGroups: [],
  },
  {
    city: "París",
    nights: 4,
    arrivalFlight: DEMO_FLIGHTS[0],
    departureFlight: DEMO_FLIGHTS[1],
    accommodation: DEMO_ACCOMMODATIONS[0],
    dayGroups: [
      { date: "2025-07-12", label: "sábado 12 jul", activities: [DEMO_ACTIVITIES[0]] },
      { date: "2025-07-13", label: "domingo 13 jul", activities: [DEMO_ACTIVITIES[1]] },
    ],
  },
  {
    city: "Roma",
    nights: 5,
    arrivalFlight: DEMO_FLIGHTS[1],
    departureFlight: DEMO_FLIGHTS[2],
    accommodation: DEMO_ACCOMMODATIONS[1],
    dayGroups: [
      { date: "2025-07-16", label: "miércoles 16 jul", activities: [DEMO_ACTIVITIES[2]] },
    ],
  },
  {
    city: "Barcelona",
    nights: 5,
    arrivalFlight: DEMO_FLIGHTS[2],
    departureFlight: null,
    accommodation: DEMO_ACCOMMODATIONS[2],
    dayGroups: [
      { date: "2025-07-21", label: "lunes 21 jul", activities: [DEMO_ACTIVITIES[3]] },
    ],
  },
];

const PARTICIPANT_COUNT = DEMO_PARTICIPANTS.length;
const tripDays = differenceInDays(parseISO(DEMO_TRIP.end_date), parseISO(DEMO_TRIP.start_date)) + 1;

// Costo estimado por persona
const accommodationCost = DEMO_ACCOMMODATIONS.reduce((sum, a) => {
  if (!a.cost) return sum;
  return sum + (a.cost_type === "total" ? a.cost / PARTICIPANT_COUNT : a.cost);
}, 0);
const flightCost = 850; // Demo: pasaje personal hardcodeado
const totalCost = accommodationCost + flightCost;

function fmtTime(iso: string) {
  return format(parseISO(iso), "HH:mm");
}
function fmtShort(iso: string) {
  return format(parseISO(iso), "d MMM", { locale: es });
}
function fmtDateTime(iso: string) {
  return format(parseISO(iso), "d MMM · HH:mm", { locale: es });
}
function formatCost(n: number) {
  return n.toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export default function DemoPage() {
  return (
    <div className="min-h-screen" style={{ background: "#faf7f2", fontFamily: "var(--font-sans)" }}>

      {/* Banner demo */}
      <div
        className="text-center text-sm py-2.5 px-4 flex items-center justify-center gap-2"
        style={{ background: "#1a1714", color: "#faf7f2" }}
      >
        <span style={{ color: "#a09088" }}>Estás viendo una demo con datos de ejemplo.</span>
        <Link href="/auth/login" className="font-medium underline" style={{ color: "#faf7f2" }}>
          Creá tu cuenta gratis →
        </Link>
      </div>

      {/* Hero */}
      <div className="relative w-full" style={{ height: "60vh", minHeight: 440 }}>
        <img
          src="/landing/rome.jpg"
          alt="Europa"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.75) 100%)" }}
        />

        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 z-10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 text-sm font-medium backdrop-blur-sm bg-white/10 px-3 py-1.5 rounded-full"
              style={{ color: "rgba(255,255,255,0.8)" }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Inicio
            </Link>
            <YendoLogo height={28} color="white" />
          </div>
        </div>

        {/* Contenido hero */}
        <div className="absolute bottom-0 left-0 right-0 z-10 pb-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1
              className="text-white mb-2"
              style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 700, lineHeight: 1.1 }}
            >
              {DEMO_TRIP.name}
            </h1>
            <p className="mb-5 font-light tracking-wide text-lg" style={{ color: "rgba(255,255,255,0.8)" }}>
              {DEMO_TRIP.destination}
            </p>

            <div className="flex flex-wrap items-center gap-2 mb-6">
              {[
                `📅 ${fmtShort(DEMO_TRIP.start_date)} → ${fmtShort(DEMO_TRIP.end_date)}`,
                `🗓 ${tripDays} días`,
                `👥 ${DEMO_PARTICIPANTS.length} viajeros`,
                `🎯 ${DEMO_ACTIVITIES.length} actividades`,
              ].map((pill) => (
                <span
                  key={pill}
                  className="text-white text-xs font-medium px-3 py-1.5 rounded-full"
                  style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)", backdropFilter: "blur(8px)" }}
                >
                  {pill}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {DEMO_PARTICIPANTS.map((p) => (
                  <div
                    key={p.name}
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold"
                    style={{ background: "rgba(255,255,255,0.2)", border: "2px solid rgba(255,255,255,0.4)", color: "white", backdropFilter: "blur(8px)" }}
                  >
                    {p.name[0]}
                  </div>
                ))}
              </div>
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>
                Maxi, Sofi y Nico
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stat bar */}
      <div className="w-full border-b" style={{ borderColor: "#e8e0d8", background: "#f0ebe3" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-stretch overflow-x-auto">
            {[
              { icon: "✈️", value: DEMO_FLIGHTS.length, label: "Vuelos" },
              { icon: "🏨", value: DEMO_ACCOMMODATIONS.length, label: "Alojamientos" },
              { icon: "🎯", value: DEMO_ACTIVITIES.length, label: "Actividades" },
              { icon: "📍", value: 3, label: "Ciudades" },
              { icon: "🗓", value: tripDays, label: "Días" },
              { icon: "👥", value: DEMO_PARTICIPANTS.length, label: "Viajeros" },
            ].map((stat, i, arr) => (
              <div
                key={stat.label}
                className="flex flex-col items-center justify-center py-5 px-6 flex-shrink-0"
                style={{ borderRight: i < arr.length - 1 ? "1px solid #e8e0d8" : "none", minWidth: 100 }}
              >
                <span className="text-lg mb-1">{stat.icon}</span>
                <span className="font-semibold tabular-nums" style={{ fontSize: 22, color: "#1a1714", lineHeight: 1 }}>
                  {stat.value}
                </span>
                <span className="mt-1 text-xs font-medium uppercase tracking-wide" style={{ color: "#a09088" }}>
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex gap-10 items-start">

          {/* Timeline */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-semibold text-lg" style={{ color: "#1a1714" }}>Itinerario</h2>
                <p className="text-sm mt-0.5" style={{ color: "#6b5f54" }}>4 destinos · 10 elementos</p>
              </div>
              <Link
                href="/auth/login"
                className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-xl"
                style={{ background: "#1a1714", color: "#faf7f2" }}
              >
                Crear mi viaje →
              </Link>
            </div>

            <div className="space-y-8">
              {DEMO_SEGMENTS.map((segment, i) => (
                <div key={segment.city} className="relative">
                  {i < DEMO_SEGMENTS.length - 1 && (
                    <div
                      className="absolute left-5 z-0"
                      style={{ top: 48, bottom: -32, width: 2, background: "linear-gradient(to bottom, #e8e0d8, transparent)" }}
                    />
                  )}

                  {/* Header ciudad */}
                  <div className="relative z-10 flex items-center gap-4 mb-4">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-semibold text-sm"
                      style={{ background: "#1a1714", color: "#faf7f2", boxShadow: "0 2px 12px rgba(0,0,0,0.15)" }}
                    >
                      {i + 1}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg" style={{ color: "#1a1714", lineHeight: 1.2 }}>
                        {segment.city}
                      </h3>
                      <p className="text-sm" style={{ color: "#6b5f54" }}>
                        {segment.arrivalFlight ? fmtShort(segment.arrivalFlight.departure_at) : "Origen"}
                        {segment.nights > 0 && ` · ${segment.nights} noches`}
                      </p>
                    </div>
                  </div>

                  <div className="ml-14 space-y-3 mb-2">

                    {/* Vuelo — estilo FlightCard */}
                    {segment.arrivalFlight && (
                      <div
                        className="rounded-2xl overflow-hidden"
                        style={{ border: "1px solid #d8cfc8", background: "#f5f0ea" }}
                      >
                        <div className="p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <div
                              className="px-2 py-0.5 rounded-md text-xs font-semibold"
                              style={{ background: "#2563eb", color: "#faf7f2" }}
                            >
                              ✈️ {segment.arrivalFlight.flight_number}
                            </div>
                            <span className="text-xs" style={{ color: "#6b5f54" }}>
                              {segment.arrivalFlight.airline}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-center">
                              <p className="font-bold text-xl tabular-nums" style={{ color: "#1a1714", lineHeight: 1 }}>
                                {segment.arrivalFlight.origin}
                              </p>
                              <p className="text-xs mt-0.5" style={{ color: "#6b5f54" }}>
                                {fmtTime(segment.arrivalFlight.departure_at)}
                              </p>
                            </div>
                            <div className="flex-1 flex items-center gap-1.5">
                              <div className="flex-1 h-px" style={{ background: "#b8c8e8" }} />
                              <svg className="w-4 h-4 flex-shrink-0" style={{ color: "#2563eb" }} fill="currentColor" viewBox="0 0 24 24">
                                <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
                              </svg>
                              <div className="flex-1 h-px" style={{ background: "#b8c8e8" }} />
                            </div>
                            <div className="text-center">
                              <p className="font-bold text-xl tabular-nums" style={{ color: "#1a1714", lineHeight: 1 }}>
                                {segment.arrivalFlight.destination}
                              </p>
                              <p className="text-xs mt-0.5" style={{ color: "#6b5f54" }}>
                                {fmtShort(segment.arrivalFlight.departure_at)}
                              </p>
                            </div>
                          </div>
                          {segment.arrivalFlight.notes && (
                            <p className="mt-3 text-xs px-3 py-2 rounded-lg" style={{ background: "#e8e0d8", color: "#6b5f54" }}>
                              {segment.arrivalFlight.notes}
                            </p>
                          )}
                        </div>
                        {/* Separador boarding pass */}
                        <div className="flex items-center px-4">
                          <div className="w-4 h-4 rounded-full flex-shrink-0 -ml-6" style={{ background: "#faf7f2", border: "1px solid #d8cfc8" }} />
                          <div className="flex-1 border-t border-dashed" style={{ borderColor: "#b8c8e8" }} />
                          <div className="w-4 h-4 rounded-full flex-shrink-0 -mr-6" style={{ background: "#faf7f2", border: "1px solid #d8cfc8" }} />
                        </div>
                        <div className="px-4 py-3">
                          <span className="text-xs font-medium" style={{ color: "#a09088" }}>
                            🎫 Pasaje: <strong style={{ color: "#1a1714" }}>$850</strong> por persona
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Alojamiento — estilo AccommodationCard */}
                    {segment.accommodation && (
                      <div
                        className="rounded-2xl p-4"
                        style={{ border: "1px solid #c0d8cc", background: "#eaf4f0" }}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
                            style={{ background: "rgba(45,106,79,0.12)" }}
                          >
                            🏨
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-semibold px-2 py-0.5 rounded-md" style={{ background: "#2d6a4f", color: "#faf7f2" }}>
                                Hotel
                              </span>
                              <span className="text-xs" style={{ color: "#2d6a4f" }}>
                                {differenceInDays(parseISO(segment.accommodation.checkout_at), parseISO(segment.accommodation.checkin_at))} noches
                              </span>
                            </div>
                            <p className="font-semibold text-sm" style={{ color: "#1a1714" }}>
                              {segment.accommodation.name}
                            </p>
                            <p className="text-xs mt-0.5 truncate" style={{ color: "#6b5f54" }}>
                              📍 {segment.accommodation.address}
                            </p>
                            <div className="flex items-center gap-3 mt-2 flex-wrap">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-medium" style={{ color: "#2d6a4f" }}>In</span>
                                <span className="text-xs" style={{ color: "#1a1714" }}>{fmtDateTime(segment.accommodation.checkin_at)}</span>
                              </div>
                              <div className="w-px h-3" style={{ background: "#c0d8cc" }} />
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-medium" style={{ color: "#6b5f54" }}>Out</span>
                                <span className="text-xs" style={{ color: "#1a1714" }}>{fmtDateTime(segment.accommodation.checkout_at)}</span>
                              </div>
                            </div>
                            {segment.accommodation.notes && (
                              <p className="mt-2 text-xs px-3 py-1.5 rounded-lg" style={{ background: "#c8e8d8", color: "#1a4a34" }}>
                                {segment.accommodation.notes}
                              </p>
                            )}
                            {segment.accommodation.cost && (
                              <p className="mt-2 text-xs" style={{ color: "#a09088" }}>
                                Costo:{" "}
                                <strong style={{ color: "#1a1714" }}>
                                  ${formatCost(segment.accommodation.cost_type === "total"
                                    ? segment.accommodation.cost / PARTICIPANT_COUNT
                                    : segment.accommodation.cost
                                  )} por persona
                                </strong>
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Actividades — estilo ActivityCard */}
                    {segment.dayGroups.map(({ label, activities }) => (
                      <div key={label}>
                        <p className="text-xs font-semibold uppercase tracking-wider mb-2 mt-4" style={{ color: "#a09088" }}>
                          {label}
                        </p>
                        <div className="space-y-2">
                          {activities.map((activity) => (
                            <div
                              key={activity.id}
                              className="rounded-2xl p-4"
                              style={{ border: "1px solid #dfc8b8", background: "#f5ede5" }}
                            >
                              <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 text-center w-12">
                                  <p className="font-bold text-base tabular-nums" style={{ color: "#c4622d", lineHeight: 1 }}>
                                    {fmtTime(activity.starts_at)}
                                  </p>
                                  <p className="text-xs mt-0.5" style={{ color: "#a09088" }}>
                                    {fmtShort(activity.starts_at)}
                                  </p>
                                </div>
                                <div className="w-px self-stretch mx-1" style={{ background: "#dfc8b8" }} />
                                <div className="flex-1 min-w-0">
                                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md" style={{ background: "#c4622d", color: "#faf7f2" }}>
                                    Actividad
                                  </span>
                                  <p className="font-semibold text-sm mt-1" style={{ color: "#1a1714" }}>
                                    {activity.name}
                                  </p>
                                  {activity.location && (
                                    <p className="text-xs mt-0.5" style={{ color: "#6b5f54" }}>📍 {activity.location}</p>
                                  )}
                                  {activity.notes && (
                                    <p className="mt-2 text-xs px-3 py-1.5 rounded-lg" style={{ background: "#dfc8b8", color: "#7a3a1a" }}>
                                      {activity.notes}
                                    </p>
                                  )}
                                </div>
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
          </div>

          {/* Sidebar — estilo TripSidebar */}
          <aside className="hidden lg:flex flex-col gap-4 w-72 flex-shrink-0 sticky top-6">

            {/* Countdown */}
            <div
              className="rounded-2xl p-5 text-center"
              style={{ background: "#f0ebe3", border: "1px solid #e8e0d8" }}
            >
              <p className="text-xs font-medium uppercase tracking-wide mb-1" style={{ color: "#a09088" }}>Faltan</p>
              <p className="font-semibold" style={{ fontSize: 36, color: "#1a1714", lineHeight: 1 }}>37 días</p>
              <p className="text-xs mt-2" style={{ color: "#6b5f54" }}>10 de julio, 2025</p>
            </div>

            {/* Próximos eventos */}
            <div className="rounded-2xl p-4" style={{ background: "#f0ebe3", border: "1px solid #e8e0d8" }}>
              <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "#6b5f54" }}>Próximos eventos</p>
              <div className="flex flex-col gap-3">
                {[
                  { icon: "✈️", color: "#2563eb", bg: "#2563eb18", label: "EZE → CDG", sub: "AR1160 · 10 jul · 22:00" },
                  { icon: "🏨", color: "#2d6a4f", bg: "#2d6a4f18", label: "Hotel Le Marais", sub: "Check-in · 11 jul · 14:00" },
                  { icon: "📍", color: "#c4622d", bg: "#c4622d18", label: "Tour por el Louvre", sub: "12 jul · 10:00" },
                ].map((e) => (
                  <div key={e.label} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-sm" style={{ background: e.bg }}>
                      {e.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: "#1a1714" }}>{e.label}</p>
                      <p className="text-xs" style={{ color: "#a09088" }}>{e.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Viajeros */}
            <div className="rounded-2xl p-4" style={{ background: "#f0ebe3", border: "1px solid #e8e0d8" }}>
              <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "#6b5f54" }}>Viajeros</p>
              <div className="flex flex-col gap-2.5">
                {DEMO_PARTICIPANTS.map((p) => (
                  <div key={p.name} className="flex items-center gap-2.5">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
                      style={{ background: "#e8e0d8", color: "#1a1714" }}
                    >
                      {p.name[0]}
                    </div>
                    <p className="text-sm font-medium flex-1" style={{ color: "#1a1714" }}>{p.name}</p>
                    {p.isOwner && (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: "#e8e0d8", color: "#6b5f54" }}>
                        owner
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Costos estimados */}
            <div className="rounded-2xl p-4" style={{ background: "#f0ebe3", border: "1px solid #e8e0d8" }}>
              <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "#6b5f54" }}>Costos estimados</p>
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">🏨</span>
                    <span className="text-sm" style={{ color: "#6b5f54" }}>Alojamiento</span>
                  </div>
                  <span className="text-sm font-medium" style={{ color: "#1a1714" }}>
                    ${formatCost(accommodationCost)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">✈️</span>
                    <span className="text-sm" style={{ color: "#6b5f54" }}>Vuelos</span>
                  </div>
                  <span className="text-sm font-medium" style={{ color: "#1a1714" }}>
                    ${formatCost(flightCost)}
                  </span>
                </div>
                <div
                  className="flex items-center justify-between pt-2.5 mt-0.5"
                  style={{ borderTop: "1px solid #e8e0d8" }}
                >
                  <span className="text-sm font-semibold" style={{ color: "#1a1714" }}>Total por persona</span>
                  <span className="text-sm font-bold" style={{ color: "#1a1714" }}>${formatCost(totalCost)}</span>
                </div>
              </div>
              <p className="text-xs mt-3" style={{ color: "#a09088" }}>
                Estimado en base a los costos cargados.
              </p>
            </div>

            {/* CTA */}
            <Link
              href="/auth/login"
              className="block text-center py-3.5 rounded-2xl text-sm font-semibold transition-all"
              style={{ background: "#1a1714", color: "#faf7f2" }}
              onMouseEnter={undefined}
            >
              Crear mi viaje gratis →
            </Link>
          </aside>
        </div>
      </div>

      {/* CTA final mobile */}
      <div className="lg:hidden mx-4 mb-10 text-center rounded-2xl p-8" style={{ background: "#f0ebe3", border: "1px solid #e8e0d8" }}>
        <h2 className="font-semibold text-lg mb-2" style={{ color: "#1a1714" }}>¿Te gustó lo que viste?</h2>
        <p className="text-sm mb-5" style={{ color: "#6b5f54" }}>Creá tu cuenta gratis y organizá tu próximo viaje en minutos.</p>
        <Link
          href="/auth/login"
          className="inline-block px-8 py-3 rounded-2xl text-sm font-semibold"
          style={{ background: "#1a1714", color: "#faf7f2" }}
        >
          Empezar gratis →
        </Link>
      </div>

    </div>
  );
}