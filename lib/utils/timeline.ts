import type { Flight, Accommodation, Activity, TimelineItem } from "@/lib/types/database";

export function buildTimeline(
  flights: Flight[],
  accommodations: Accommodation[],
  activities: Activity[]
): TimelineItem[] {
  const items: TimelineItem[] = [
    ...flights.map((f): TimelineItem => ({
      type: "flight",
      sortKey: f.departure_at,
      data: f,
    })),
    ...accommodations.map((a): TimelineItem => ({
      type: "accommodation",
      sortKey: a.checkin_at,
      data: a,
    })),
    ...activities.map((a): TimelineItem => ({
      type: "activity",
      sortKey: a.starts_at,
      data: a,
    })),
  ];

  return items.sort((a, b) =>
    new Date(a.sortKey).getTime() - new Date(b.sortKey).getTime()
  );
}
