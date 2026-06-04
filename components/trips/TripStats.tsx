interface TripStatsProps {
  flights: number;
  accommodations: number;
  activities: number;
  days: number;
  cities: number;
  participants: number;
}

export default function TripStats({
  flights,
  accommodations,
  activities,
  days,
  cities,
  participants,
}: TripStatsProps) {
  const stats = [
    { icon: "✈️", label: "Vuelos", value: flights },
    { icon: "🏨", label: "Alojamientos", value: accommodations },
    { icon: "🎯", label: "Actividades", value: activities },
    { icon: "📍", label: "Ciudades", value: cities },
    { icon: "🗓", label: "Días", value: days },
    { icon: "👥", label: "Viajeros", value: participants },
  ].filter((s) => s.value > 0);

  return (
    <div
      className="w-full border-b"
      style={{ borderColor: "#e8e0d8", backgroundColor: "#faf7f2" }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-stretch overflow-x-auto scrollbar-none">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className="flex flex-col items-center justify-center py-5 px-6 flex-shrink-0"
              style={{
                borderRight: i < stats.length - 1 ? "1px solid #e8e0d8" : "none",
                minWidth: 100,
              }}
            >
              <span className="text-lg mb-1">{stat.icon}</span>
              <span
                className="font-semibold tabular-nums"
                style={{ fontSize: 22, color: "#1a1714", lineHeight: 1 }}
              >
                {stat.value}
              </span>
              <span
                className="mt-1 text-xs font-medium uppercase tracking-wide"
                style={{ color: "#a09088" }}
              >
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}