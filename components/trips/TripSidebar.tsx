"use client";

import { useEffect, useRef } from "react";
import type { Trip, Flight, Accommodation, Activity } from "@/lib/types/database";
import { formatDateTime, formatDate } from "@/lib/utils/date";
import { differenceInDays, parseISO, isPast, isFuture, format } from "date-fns";
import { es } from "date-fns/locale";

interface Participant {
  id: string;
  nickname: string | null;
  first_name: string | null;
  isOwner: boolean;
}

interface TripSidebarProps {
  trip: Trip;
  participants: Participant[];
  flights: Flight[];
  accommodations: Accommodation[];
  activities: Activity[];
  cities: string[];
}

// Coordenadas aproximadas por nombre de ciudad/aeropuerto
const CITY_COORDS: Record<string, [number, number]> = {
  // Aeropuertos IATA comunes
  EZE: [-34.8222, -58.5358], BUE: [-34.6037, -58.3816],
  GRU: [-23.4356, -46.4731], GIG: [-22.8099, -43.2505],
  SCL: [-33.3929, -70.7858], LIM: [-12.0219, -77.1143],
  BOG: [4.7016, -74.1469],  MEX: [19.4363, -99.0721],
  MIA: [25.7959, -80.2870], JFK: [40.6413, -73.7781],
  LAX: [33.9425, -118.4081], ORD: [41.9742, -87.9073],
  LHR: [51.4700, -0.4543],  CDG: [48.8566,  2.3522],
  MAD: [40.4983, -3.5676],  BCN: [41.2974,  2.0833],
  FCO: [41.8003,  12.2389], MXP: [45.6306,  8.7281],
  AMS: [52.3086,  4.7639],  FRA: [50.0379,  8.5622],
  MUC: [48.3538, 11.7861],  ZRH: [47.4647,  8.5492],
  DXB: [25.2532, 55.3657],  SIN: [1.3644,  103.9915],
  NRT: [35.7720, 140.3929], HND: [35.5494, 139.7798],
  SYD: [-33.9399, 151.1753],
  // Ciudades por nombre
  "buenos aires": [-34.6037, -58.3816],
  "paris": [48.8566, 2.3522], "parís": [48.8566, 2.3522],
  "london": [51.5074, -0.1278], "londres": [51.5074, -0.1278],
  "rome": [41.9028, 12.4964], "roma": [41.9028, 12.4964],
  "barcelona": [41.3851, 2.1734],
  "madrid": [40.4168, -3.7038],
  "new york": [40.7128, -74.0060], "nueva york": [40.7128, -74.0060],
  "miami": [25.7617, -80.1918],
  "tokyo": [35.6762, 139.6503], "tokio": [35.6762, 139.6503],
  "sydney": [-33.8688, 151.2093],
  "amsterdam": [52.3676, 4.9041],
  "berlin": [52.5200, 13.4050], "berlín": [52.5200, 13.4050],
  "dubai": [25.2048, 55.2708],
  "singapore": [1.3521, 103.8198], "singapur": [1.3521, 103.8198],
  "mexico": [19.4326, -99.1332], "ciudad de mexico": [19.4326, -99.1332],
  "lima": [-12.0464, -77.0428],
  "bogota": [4.7110, -74.0721], "bogotá": [4.7110, -74.0721],
  "santiago": [-33.4489, -70.6693],
};

function getCityCoords(name: string): [number, number] | null {
  const key = name.toLowerCase().trim();
  if (CITY_COORDS[key]) return CITY_COORDS[key];
  // Intentar match parcial
  for (const [k, v] of Object.entries(CITY_COORDS)) {
    if (key.includes(k) || k.includes(key)) return v;
  }
  return null;
}

function getCountdown(startDate: string): { label: string; value: string } {
  const start = parseISO(startDate);
  const today = new Date();
  if (isPast(start)) {
    const end = new Date(startDate);
    if (isPast(end)) return { label: "Viaje finalizado", value: "✓" };
    return { label: "En curso", value: "🟢" };
  }
  const days = differenceInDays(start, today);
  if (days === 0) return { label: "¡Hoy es el día!", value: "🎉" };
  if (days === 1) return { label: "Faltan", value: "1 día" };
  return { label: "Faltan", value: `${days} días` };
}

// Mapa con Leaflet (solo cliente)
function TripMap({ cities }: { cities: string[] }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const points = cities
      .map((c) => ({ name: c, coords: getCityCoords(c) }))
      .filter((p) => p.coords !== null) as { name: string; coords: [number, number] }[];

    if (points.length === 0) return;

    // Importar Leaflet dinámicamente
    import("leaflet").then((L) => {
      // Fix icono default de Leaflet en Next.js
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(mapRef.current!, {
        zoomControl: false,
        attributionControl: false,
        scrollWheelZoom: false,
        dragging: points.length > 1,
      });

      mapInstance.current = map;

      // Tiles estilo minimalista (CartoDB Positron — sin API key)
      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        maxZoom: 19,
      }).addTo(map);

      // Marcadores con estilo custom
      const customIcon = L.divIcon({
        className: "",
        html: `<div style="
          width:12px;height:12px;
          background:#0066ff;
          border:2px solid white;
          border-radius:50%;
          box-shadow:0 2px 6px rgba(0,102,255,0.4);
        "></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6],
      });

      points.forEach((p, i) => {
        L.marker(p.coords, { icon: customIcon })
          .addTo(map)
          .bindTooltip(p.name, {
            permanent: false,
            direction: "top",
            offset: [0, -8],
            className: "leaflet-tooltip-custom",
          });

        // Número de orden
        L.divIcon({
          className: "",
          html: `<div style="
            width:18px;height:18px;
            background:#0a0a0b;
            color:white;
            border-radius:50%;
            font-size:10px;
            font-weight:600;
            display:flex;align-items:center;justify-content:center;
            font-family:system-ui,sans-serif;
          ">${i + 1}</div>`,
        });
      });

      // Línea conectando ciudades en orden
      if (points.length > 1) {
        L.polyline(points.map((p) => p.coords), {
          color: "#0066ff",
          weight: 2,
          opacity: 0.5,
          dashArray: "6 6",
        }).addTo(map);
      }

      // Fit bounds
      const bounds = L.latLngBounds(points.map((p) => p.coords));
      map.fitBounds(bounds, { padding: [24, 24] });
    });

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [cities]);

  return (
    <>
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      />
      <style>{`
        .leaflet-tooltip-custom {
          background: #0a0a0b;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 500;
          padding: 4px 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }
        .leaflet-tooltip-custom::before { display: none; }
      `}</style>
      <div
        ref={mapRef}
        style={{ width: "100%", height: 200, borderRadius: 12, overflow: "hidden" }}
      />
    </>
  );
}

export default function TripSidebar({
  trip,
  participants,
  flights,
  accommodations,
  activities,
  cities,
}: TripSidebarProps) {
  const countdown = getCountdown(trip.start_date);

  // Próximos eventos — unir todo y ordenar por fecha
  const allEvents = [
    ...flights.map((f) => ({
      type: "flight" as const,
      date: f.departure_at,
      label: `${f.origin} → ${f.destination}`,
      sub: f.airline,
    })),
    ...accommodations.map((a) => ({
      type: "accommodation" as const,
      date: a.checkin_at,
      label: a.name,
      sub: "Check-in",
    })),
    ...activities.map((a) => ({
      type: "activity" as const,
      date: a.starts_at,
      label: a.name,
      sub: a.location ?? "",
    })),
  ]
    .filter((e) => isFuture(parseISO(e.date)))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 3);

  const typeIcon = {
    flight: "✈️",
    accommodation: "🏨",
    activity: "📍",
  };

  const typeColor = {
    flight: "#0066ff",
    accommodation: "#00a67e",
    activity: "#f5620f",
  };

  return (
    <div className="flex flex-col gap-4">

      {/* Countdown */}
      <div
        className="rounded-2xl p-5 text-center"
        style={{ background: "#f7f7f8", border: "1px solid #ebebed" }}
      >
        <p className="text-xs font-medium uppercase tracking-wide mb-1" style={{ color: "#a0a0b0" }}>
          {countdown.label}
        </p>
        <p className="font-semibold" style={{ fontSize: 36, color: "#0a0a0b", lineHeight: 1 }}>
          {countdown.value}
        </p>
        <p className="text-xs mt-2" style={{ color: "#6b6b7b" }}>
          {format(parseISO(trip.start_date), "d 'de' MMMM, yyyy", { locale: es })}
        </p>
      </div>

      {/* Mapa */}
      {cities.length > 0 && (
        <div
          className="rounded-2xl overflow-hidden"
          style={{ border: "1px solid #ebebed" }}
        >
          <div className="px-4 pt-4 pb-3 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#6b6b7b" }}>
              Ruta
            </p>
            <div className="flex items-center gap-1.5">
              {cities.slice(0, 4).map((c, i) => (
                <span key={c}>
                  <span className="text-xs font-medium" style={{ color: "#0a0a0b" }}>
                    {c.length > 3 ? c.split(",")[0].trim().split(" ")[0] : c}
                  </span>
                  {i < Math.min(cities.length, 4) - 1 && (
                    <span className="text-xs mx-1" style={{ color: "#a0a0b0" }}>→</span>
                  )}
                </span>
              ))}
              {cities.length > 4 && (
                <span className="text-xs" style={{ color: "#a0a0b0" }}>+{cities.length - 4}</span>
              )}
            </div>
          </div>
          <TripMap cities={cities} />
        </div>
      )}

      {/* Próximos eventos */}
      {allEvents.length > 0 && (
        <div
          className="rounded-2xl p-4"
          style={{ border: "1px solid #ebebed" }}
        >
          <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "#6b6b7b" }}>
            Próximos eventos
          </p>
          <div className="flex flex-col gap-3">
            {allEvents.map((event, i) => (
              <div key={i} className="flex items-start gap-3">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-sm"
                  style={{ background: `${typeColor[event.type]}15` }}
                >
                  {typeIcon[event.type]}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: "#0a0a0b" }}>
                    {event.label}
                  </p>
                  <p className="text-xs" style={{ color: "#a0a0b0" }}>
                    {event.sub && `${event.sub} · `}
                    {format(parseISO(event.date), "d MMM · HH:mm", { locale: es })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Viajeros */}
      {participants.length > 0 && (
        <div
          className="rounded-2xl p-4"
          style={{ border: "1px solid #ebebed" }}
        >
          <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: "#6b6b7b" }}>
            Viajeros
          </p>
          <div className="flex flex-col gap-2.5">
            {participants.map((p) => (
              <div key={p.id} className="flex items-center gap-2.5">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
                  style={{ background: "#f0f0f2", color: "#0a0a0b" }}
                >
                  {(p.nickname ?? p.first_name ?? "?")[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: "#0a0a0b" }}>
                    {p.nickname ?? p.first_name ?? "Sin nombre"}
                  </p>
                </div>
                {p.isOwner && (
                  <span
                    className="text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{ background: "#f0f0f2", color: "#6b6b7b" }}
                  >
                    owner
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}