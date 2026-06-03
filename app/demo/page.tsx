import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import { formatDate } from "@/lib/utils/date";

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
    origin: "Buenos Aires (EZE)",
    destination: "París (CDG)",
    departure_at: "2025-07-10T22:00:00",
    notes: "Terminal B, llevar documentación",
  },
  {
    id: "f2",
    airline: "Vueling",
    flight_number: "VY8832",
    origin: "París (CDG)",
    destination: "Roma (FCO)",
    departure_at: "2025-07-15T09:30:00",
    notes: null,
  },
  {
    id: "f3",
    airline: "Ryanair",
    flight_number: "FR2241",
    origin: "Roma (FCO)",
    destination: "Barcelona (BCN)",
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

function formatDateTime(dt: string) {
  return new Date(dt).toLocaleString("es-AR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function DemoPage() {
  const totalItems = DEMO_FLIGHTS.length + DEMO_ACCOMMODATIONS.length + DEMO_ACTIVITIES.length;

  type Item =
    | { type: "flight"; sortKey: string; data: (typeof DEMO_FLIGHTS)[0] }
    | { type: "accommodation"; sortKey: string; data: (typeof DEMO_ACCOMMODATIONS)[0] }
    | { type: "activity"; sortKey: string; data: (typeof DEMO_ACTIVITIES)[0] };

  const timeline: Item[] = [
    ...DEMO_FLIGHTS.map((f) => ({ type: "flight" as const, sortKey: f.departure_at, data: f })),
    ...DEMO_ACCOMMODATIONS.map((a) => ({ type: "accommodation" as const, sortKey: a.checkin_at, data: a })),
    ...DEMO_ACTIVITIES.map((a) => ({ type: "activity" as const, sortKey: a.starts_at, data: a })),
  ].sort((a, b) => a.sortKey.localeCompare(b.sortKey));

  const grouped: { date: string; items: Item[] }[] = [];
  for (const item of timeline) {
    const date = new Date(item.sortKey).toLocaleDateString("es-AR", {
      weekday: "short", day: "numeric", month: "short",
    });
    const last = grouped[grouped.length - 1];
    if (!last || last.date !== date) {
      grouped.push({ date, items: [item] });
    } else {
      last.items.push(item);
    }
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Banner demo */}
      <div className="bg-navy-900 text-white text-center text-sm py-2.5 px-4">
        Estás viendo una demo — los datos son de ejemplo.{" "}
        <Link href="/auth/login" className="underline font-medium hover:text-amber transition-colors">
          Creá tu cuenta gratis →
        </Link>
      </div>

      <Navbar />

      <main className="max-w-2xl mx-auto px-4 py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-navy-300 hover:text-navy-700 mb-5 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Inicio
        </Link>

        {/* Trip header */}
        <div className="mb-7">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold text-navy-900">{DEMO_TRIP.name}</h1>
              <p className="text-navy-700 mt-0.5">{DEMO_TRIP.destination}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-3 text-sm text-navy-700 flex-wrap">
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-navy-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {formatDate(DEMO_TRIP.start_date)} → {formatDate(DEMO_TRIP.end_date)}
            </div>
            <span className="text-navy-100">·</span>
            <span>{totalItems} elementos</span>
          </div>

          {/* Participantes demo */}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            {["Maxi 👑", "Sofi", "Nico"].map((p) => (
              <div key={p} className="flex items-center gap-1.5 bg-white border border-navy-100 rounded-full px-3 py-1">
                <div className="w-5 h-5 rounded-full bg-amber-light flex items-center justify-center text-xs font-semibold text-amber-hover">
                  {p[0]}
                </div>
                <span className="text-xs text-navy-700">{p}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-6">
          {grouped.map(({ date, items }) => (
            <div key={date}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-2 h-2 rounded-full bg-amber flex-shrink-0" />
                <span className="text-xs font-semibold text-navy-300 uppercase tracking-wide">{date}</span>
                <div className="flex-1 h-px bg-navy-100" />
              </div>

              <div className="space-y-3 pl-5">
                {items.map((item) => {
                  if (item.type === "flight") {
                    const f = item.data;
                    return (
                      <div key={f.id} className="card p-4 border-l-4 border-l-sky-400">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-base">✈️</span>
                          <span className="text-xs font-medium text-navy-300">{f.airline} · {f.flight_number}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm font-medium text-navy-900">
                          <span>{f.origin}</span>
                          <svg className="w-4 h-4 text-navy-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                          <span>{f.destination}</span>
                        </div>
                        <p className="text-xs text-navy-300 mt-1">{formatDateTime(f.departure_at)}</p>
                        {f.notes && <p className="text-xs text-navy-700 mt-2 bg-cream rounded-lg px-3 py-2">{f.notes}</p>}
                      </div>
                    );
                  }
                  if (item.type === "accommodation") {
                    const a = item.data;
                    return (
                      <div key={a.id} className="card p-4 border-l-4 border-l-amber-400">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-base">🏨</span>
                          <span className="text-xs font-medium text-navy-300">Alojamiento</span>
                        </div>
                        <p className="text-sm font-medium text-navy-900">{a.name}</p>
                        <p className="text-xs text-navy-300 mt-1">{a.address}</p>
                        <div className="flex gap-3 mt-2 text-xs text-navy-700">
                          <span>Check-in: {formatDateTime(a.checkin_at)}</span>
                          <span>·</span>
                          <span>Check-out: {formatDateTime(a.checkout_at)}</span>
                        </div>
                        {a.notes && <p className="text-xs text-navy-700 mt-2 bg-cream rounded-lg px-3 py-2">{a.notes}</p>}
                      </div>
                    );
                  }
                  const ac = item.data;
                  return (
                    <div key={ac.id} className="card p-4 border-l-4 border-l-sage-accent">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-base">📍</span>
                        <span className="text-xs font-medium text-navy-300">Actividad</span>
                      </div>
                      <p className="text-sm font-medium text-navy-900">{ac.name}</p>
                      {ac.location && <p className="text-xs text-navy-300 mt-1">{ac.location}</p>}
                      <p className="text-xs text-navy-300 mt-1">{formatDateTime(ac.starts_at)}</p>
                      {ac.notes && <p className="text-xs text-navy-700 mt-2 bg-cream rounded-lg px-3 py-2">{ac.notes}</p>}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* CTA final */}
        <div className="mt-10 text-center bg-white border border-navy-100 rounded-2xl p-8">
          <h2 className="text-lg font-semibold text-navy-900 mb-2">¿Te gustó lo que viste?</h2>
          <p className="text-navy-700 text-sm mb-5">Creá tu cuenta gratis y organizá tu próximo viaje en minutos.</p>
          <Link href="/auth/login" className="btn-primary px-8 py-3 rounded-2xl">
            Empezar gratis →
          </Link>
        </div>
      </main>
    </div>
  );
}
