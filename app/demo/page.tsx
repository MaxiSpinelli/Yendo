import Link from "next/link";
import { format, parseISO, differenceInDays } from "date-fns";
import { es } from "date-fns/locale";

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
  },
  {
    id: "a2",
    name: "Airbnb Trastevere",
    address: "Via della Lungaretta 45, Roma",
    checkin_at: "2025-07-15T16:00:00",
    checkout_at: "2025-07-20T10:00:00",
    notes: null,
  },
  {
    id: "a3",
    name: "Hotel Arts Barcelona",
    address: "Carrer de la Marina 19, Barcelona",
    checkin_at: "2025-07-20T15:00:00",
    checkout_at: "2025-07-25T12:00:00",
    notes: null,
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

// Segmentos por ciudad
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
      {
        date: "2025-07-12",
        label: "sábado 12 jul",
        activities: [DEMO_ACTIVITIES[0]],
      },
      {
        date: "2025-07-13",
        label: "domingo 13 jul",
        activities: [DEMO_ACTIVITIES[1]],
      },
    ],
  },
  {
    city: "Roma",
    nights: 5,
    arrivalFlight: DEMO_FLIGHTS[1],
    departureFlight: DEMO_FLIGHTS[2],
    accommodation: DEMO_ACCOMMODATIONS[1],
    dayGroups: [
      {
        date: "2025-07-16",
        label: "miércoles 16 jul",
        activities: [DEMO_ACTIVITIES[2]],
      },
    ],
  },
  {
    city: "Barcelona",
    nights: 5,
    arrivalFlight: DEMO_FLIGHTS[2],
    departureFlight: null,
    accommodation: DEMO_ACCOMMODATIONS[2],
    dayGroups: [
      {
        date: "2025-07-21",
        label: "lunes 21 jul",
        activities: [DEMO_ACTIVITIES[3]],
      },
    ],
  },
];

const tripDays = differenceInDays(parseISO(DEMO_TRIP.end_date), parseISO(DEMO_TRIP.start_date)) + 1;

function fmtTime(iso: string) {
  return format(parseISO(iso), "HH:mm");
}
function fmtShort(iso: string) {
  return format(parseISO(iso), "d MMM", { locale: es });
}
function fmtDateTime(iso: string) {
  return format(parseISO(iso), "d MMM · HH:mm", { locale: es });
}

export default function DemoPage() {
  return (
    <div className="min-h-screen" style={{ background: "#ffffff" }}>

      {/* Banner demo */}
      <div
        className="text-center text-sm py-2.5 px-4 flex items-center justify-center gap-2"
        style={{ background: "#0a0a0b", color: "white" }}
      >
        <span style={{ color: "#a0a0b0" }}>Estás viendo una demo con datos de ejemplo.</span>
        <Link
          href="/auth/login"
          className="font-medium underline transition-colors"
          style={{ color: "white" }}
        >
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
              className="flex items-center gap-2 text-sm font-medium transition-colors backdrop-blur-sm bg-white/10 px-3 py-1.5 rounded-full"
              style={{ color: "rgba(255,255,255,0.8)" }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Inicio
            </Link>
            <span
              className="text-white text-2xl tracking-tight"
              style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontWeight: 700 }}
            >
              Yendo
            </span>
          </div>
        </div>

        {/* Contenido hero */}
        <div className="absolute bottom-0 left-0 right-0 z-10 pb-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1
              className="text-white mb-2"
              style={{
                fontFamily: "'DM Serif Display', Georgia, serif",
                fontSize: "clamp(2rem, 5vw, 3.5rem)",
                fontWeight: 400,
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
              }}
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

            {/* Participantes */}
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {DEMO_PARTICIPANTS.map((p) => (
                  <div
                    key={p.name}
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold"
                    style={{ background: "rgba(255,255,255,0.2)", border: "2px solid rgba(255,255,255,0.4)", color: "white", backdropFilter: "blur(8px)" }}
                    title={p.name}
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
      <div className="w-full border-b" style={{ borderColor: "#ebebed" }}>
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
                style={{ borderRight: i < arr.length - 1 ? "1px solid #ebebed" : "none", minWidth: 100 }}
              >
                <span className="text-lg mb-1">{stat.icon}</span>
                <span className="font-semibold tabular-nums" style={{ fontSize: 22, color: "#0a0a0b", lineHeight: 1 }}>
                  {stat.value}
                </span>
                <span className="mt-1 text-xs font-medium uppercase tracking-wide" style={{ color: "#a0a0b0" }}>
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

          {/* Timeline por ciudad */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-semibold text-lg" style={{ color: "#0a0a0b" }}>Itinerario</h2>
                <p className="text-sm mt-0.5" style={{ color: "#6b6b7b" }}>4 destinos · 10 elementos</p>
              </div>
              <Link
                href="/auth/login"
                className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-xl transition-all"
                style={{ background: "#0066ff", color: "white" }}
              >
                Crear mi viaje →
              </Link>
            </div>

            <div className="space-y-8">
              {DEMO_SEGMENTS.map((segment, i) => (
                <div key={segment.city} className="relative">
                  {/* Línea vertical */}
                  {i < DEMO_SEGMENTS.length - 1 && (
                    <div
                      className="absolute left-5 z-0"
                      style={{ top: 48, bottom: -32, width: 2, background: "linear-gradient(to bottom, #ebebed, transparent)" }}
                    />
                  )}

                  {/* Header ciudad */}
                  <div className="relative z-10 flex items-center gap-4 mb-4">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-semibold text-sm"
                      style={{ background: "#0a0a0b", color: "white", boxShadow: "0 2px 12px rgba(0,0,0,0.15)" }}
                    >
                      {i + 1}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg" style={{ color: "#0a0a0b", lineHeight: 1.2 }}>
                        {segment.city}
                      </h3>
                      <p className="text-sm" style={{ color: "#6b6b7b" }}>
                        {segment.arrivalFlight ? fmtShort(segment.arrivalFlight.departure_at) : "Origen"}
                        {segment.nights > 0 && ` · ${segment.nights} noches`}
                      </p>
                    </div>
                  </div>

                  <div className="ml-14 space-y-3 mb-2">
                    {/* Vuelo de llegada */}
                    {segment.arrivalFlight && (
                      <div
                        className="rounded-2xl p-4"
                        style={{ border: "1px solid #dde8ff", background: "#f8faff" }}
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <span
                            className="px-2 py-0.5 rounded-md text-xs font-semibold"
                            style={{ background: "#0066ff", color: "white" }}
                          >
                            ✈️ {segment.arrivalFlight.flight_number}
                          </span>
                          <span className="text-xs" style={{ color: "#6b96ff" }}>
                            {segment.arrivalFlight.airline}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-center">
                            <p className="font-bold text-xl tabular-nums" style={{ color: "#0a0a0b", lineHeight: 1 }}>
                              {segment.arrivalFlight.origin}
                            </p>
                            <p className="text-xs mt-0.5" style={{ color: "#6b6b7b" }}>
                              {fmtTime(segment.arrivalFlight.departure_at)}
                            </p>
                          </div>
                          <div className="flex-1 flex items-center gap-1.5">
                            <div className="flex-1 h-px" style={{ background: "#c0d0ff" }} />
                            <svg className="w-4 h-4" style={{ color: "#0066ff" }} fill="currentColor" viewBox="0 0 24 24">
                              <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
                            </svg>
                            <div className="flex-1 h-px" style={{ background: "#c0d0ff" }} />
                          </div>
                          <div className="text-center">
                            <p className="font-bold text-xl tabular-nums" style={{ color: "#0a0a0b", lineHeight: 1 }}>
                              {segment.arrivalFlight.destination}
                            </p>
                            <p className="text-xs mt-0.5" style={{ color: "#6b6b7b" }}>
                              {fmtShort(segment.arrivalFlight.departure_at)}
                            </p>
                          </div>
                        </div>
                        {segment.arrivalFlight.notes && (
                          <p className="mt-3 text-xs px-3 py-2 rounded-lg" style={{ background: "#eef2ff", color: "#4b6bcc" }}>
                            {segment.arrivalFlight.notes}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Alojamiento */}
                    {segment.accommodation && (
                      <div
                        className="rounded-2xl p-4"
                        style={{ border: "1px solid #c8efe5", background: "#f0faf7" }}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0" style={{ background: "#00a67e20" }}>
                            🏨
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-semibold px-2 py-0.5 rounded-md" style={{ background: "#00a67e", color: "white" }}>
                                Hotel
                              </span>
                              <span className="text-xs" style={{ color: "#00a67e" }}>
                                {differenceInDays(parseISO(segment.accommodation.checkout_at), parseISO(segment.accommodation.checkin_at))} noches
                              </span>
                            </div>
                            <p className="font-semibold text-sm" style={{ color: "#0a0a0b" }}>{segment.accommodation.name}</p>
                            <p className="text-xs mt-0.5" style={{ color: "#6b6b7b" }}>📍 {segment.accommodation.address}</p>
                            <div className="flex items-center gap-3 mt-2">
                              <span className="text-xs">
                                <span className="font-medium" style={{ color: "#00a67e" }}>In</span>
                                <span style={{ color: "#0a0a0b" }}> {fmtDateTime(segment.accommodation.checkin_at)}</span>
                              </span>
                              <div className="w-px h-3" style={{ background: "#c8efe5" }} />
                              <span className="text-xs">
                                <span className="font-medium" style={{ color: "#6b6b7b" }}>Out</span>
                                <span style={{ color: "#0a0a0b" }}> {fmtDateTime(segment.accommodation.checkout_at)}</span>
                              </span>
                            </div>
                            {segment.accommodation.notes && (
                              <p className="mt-2 text-xs px-3 py-1.5 rounded-lg" style={{ background: "#d4f5eb", color: "#007a5a" }}>
                                {segment.accommodation.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Actividades por día */}
                    {segment.dayGroups.map(({ label, activities }) => (
                      <div key={label}>
                        <p className="text-xs font-semibold uppercase tracking-wider mb-2 mt-4" style={{ color: "#a0a0b0" }}>
                          {label}
                        </p>
                        <div className="space-y-2">
                          {activities.map((activity) => (
                            <div
                              key={activity.id}
                              className="rounded-2xl p-4"
                              style={{ border: "1px solid #fde0cc", background: "#fff8f5" }}
                            >
                              <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 text-center w-12">
                                  <p className="font-bold text-base tabular-nums" style={{ color: "#f5620f", lineHeight: 1 }}>
                                    {fmtTime(activity.starts_at)}
                                  </p>
                                  <p className="text-xs mt-0.5" style={{ color: "#c0a090" }}>
                                    {fmtShort(activity.starts_at)}
                                  </p>
                                </div>
                                <div className="w-px self-stretch mx-1" style={{ background: "#fde0cc" }} />
                                <div className="flex-1 min-w-0">
                                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md" style={{ background: "#f5620f", color: "white" }}>
                                    Actividad
                                  </span>
                                  <p className="font-semibold text-sm mt-1" style={{ color: "#0a0a0b" }}>{activity.name}</p>
                                  {activity.location && (
                                    <p className="text-xs mt-0.5" style={{ color: "#6b6b7b" }}>📍 {activity.location}</p>
                                  )}
                                  {activity.notes && (
                                    <p className="mt-2 text-xs px-3 py-1.5 rounded-lg" style={{ background: "#fde0cc", color: "#c05010" }}>
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

          {/* Sidebar */}
          <aside className="hidden lg:flex flex-col gap-4 w-72 flex-shrink-0 sticky top-6">

            {/* Countdown */}
            <div className="rounded-2xl p-5 text-center" style={{ background: "#f7f7f8", border: "1px solid #ebebed" }}>
              <p className="text-xs font-medium uppercase tracking-wide mb-1" style={{ color: "#a0a0b0" }}>Faltan</p>
              <p className="font-semibold" style={{ fontSize: 36, color: "#0a0a0b", lineHeight: 1 }}>37 días</p>
              <p className="text-xs mt-2" style={{ color: "#6b6b7b" }}>10 de julio, 2025</p>
            </div>

            {/* Próximos eventos */}
            <div className="rounded-2xl p-4" style={{ border: "1px solid #ebebed" }}>
              <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "#6b6b7b" }}>Próximos eventos</p>
              <div className="flex flex-col gap-3">
                {[
                  { icon: "✈️", color: "#0066ff", bg: "#f0f4ff", label: "EZE → CDG", sub: "AR1160 · 10 jul · 22:00" },
                  { icon: "🏨", color: "#00a67e", bg: "#f0faf7", label: "Hotel Le Marais", sub: "Check-in · 11 jul · 14:00" },
                  { icon: "📍", color: "#f5620f", bg: "#fff8f5", label: "Tour por el Louvre", sub: "12 jul · 10:00" },
                ].map((e) => (
                  <div key={e.label} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-sm" style={{ background: e.bg }}>
                      {e.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: "#0a0a0b" }}>{e.label}</p>
                      <p className="text-xs" style={{ color: "#a0a0b0" }}>{e.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Viajeros */}
            <div className="rounded-2xl p-4" style={{ border: "1px solid #ebebed" }}>
              <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "#6b6b7b" }}>Viajeros</p>
              <div className="flex flex-col gap-2.5">
                {DEMO_PARTICIPANTS.map((p) => (
                  <div key={p.name} className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0" style={{ background: "#f0f0f2", color: "#0a0a0b" }}>
                      {p.name[0]}
                    </div>
                    <p className="text-sm font-medium flex-1" style={{ color: "#0a0a0b" }}>{p.name}</p>
                    {p.isOwner && (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: "#f0f0f2", color: "#6b6b7b" }}>
                        owner
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <Link
              href="/auth/login"
              className="block text-center py-3.5 rounded-2xl text-sm font-semibold transition-all"
              style={{ background: "#0a0a0b", color: "white" }}
            >
              Crear mi viaje gratis →
            </Link>
          </aside>
        </div>
      </div>

      {/* CTA final mobile */}
      <div className="lg:hidden mx-4 mb-10 text-center rounded-2xl p-8" style={{ background: "#f7f7f8", border: "1px solid #ebebed" }}>
        <h2 className="font-semibold text-lg mb-2" style={{ color: "#0a0a0b" }}>¿Te gustó lo que viste?</h2>
        <p className="text-sm mb-5" style={{ color: "#6b6b7b" }}>Creá tu cuenta gratis y organizá tu próximo viaje en minutos.</p>
        <Link
          href="/auth/login"
          className="inline-block px-8 py-3 rounded-2xl text-sm font-semibold"
          style={{ background: "#0a0a0b", color: "white" }}
        >
          Empezar gratis →
        </Link>
      </div>
    </div>
  );
}