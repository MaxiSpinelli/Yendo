import { format, formatDistanceToNow, parseISO } from "date-fns";
import { es } from "date-fns/locale";

export function formatDate(iso: string): string {
  return format(parseISO(iso), "d 'de' MMMM, yyyy", { locale: es });
}

export function formatDateTime(iso: string): string {
  return format(parseISO(iso), "d MMM yyyy · HH:mm", { locale: es });
}

export function formatTime(iso: string): string {
  return format(parseISO(iso), "HH:mm");
}

export function formatShortDate(iso: string): string {
  return format(parseISO(iso), "d MMM", { locale: es });
}

export function formatRelative(iso: string): string {
  return formatDistanceToNow(parseISO(iso), { addSuffix: true, locale: es });
}

/** Convert a local datetime-local input value to ISO string */
export function localToISO(local: string): string {
  return new Date(local).toISOString();
}

/** Convert ISO string to datetime-local input format */
export function isoToLocal(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}`
  );
}
