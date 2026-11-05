import type { AppState, Appointment } from "./types";

export const inr = (n: number) =>
  "₹" + new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(Math.round(n));

export const inrFrom = (n: number) =>
  "₹" + new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(Math.round(n));

export const minutesOf = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

export const clock = (minutes: number) => {
  const m = Math.max(0, minutes) % (24 * 60);
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
};

export const timeLabel = (hhmm: string) => {
  const total = minutesOf(hhmm);
  const h24 = Math.floor(total / 60);
  const m = total % 60;
  const suffix = h24 >= 12 ? "pm" : "am";
  const h = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h}:${String(m).padStart(2, "0")} ${suffix}`;
};

export const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export const isoPlus = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const WEEKDAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const parseISO = (isoDate: string) => {
  const [y, m, d] = isoDate.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
};

export const dayOf = (isoDate: string) => parseISO(isoDate).getDay();

export const dateLabel = (isoDate: string, opts: { weekday?: boolean; year?: boolean } = {}) => {
  const d = parseISO(isoDate);
  const parts = [];
  if (opts.weekday !== false) parts.push(WEEKDAY[d.getDay()]);
  parts.push(`${d.getDate()} ${MONTH[d.getMonth()]}`);
  if (opts.year) parts.push(String(d.getFullYear()));
  return parts.join(" ");
};

export const relativeDay = (isoDate: string) => {
  const today = todayISO();
  if (isoDate === today) return "Today";
  if (isoDate === isoPlus(1)) return "Tomorrow";
  if (isoDate === isoPlus(-1)) return "Yesterday";
  return dateLabel(isoDate);
};

export const stamp = () =>
  new Date().toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

export const initials = (name: string) =>
  name
    .replace(/^Dr\.?\s+/i, "")
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");

export const overlap = (aStart: number, aEnd: number, bStart: number, bEnd: number) =>
  aStart < bEnd && bStart < aEnd;

/** Generates bookable starts for a day, honouring duration, buffer, holidays and
 *  already-booked sessions. Past times on the current day are dropped. */
export function slotsFor(
  state: AppState,
  date: string,
  durationMin: number,
  ignoreAppointmentId?: string,
): string[] {
  if (state.blockedDates.some((b) => b.date === date)) return [];
  if (!state.therapist.workDays.includes(dayOf(date))) return [];

  const booked = state.appointments.filter(
    (a) => a.date === date && a.status !== "CANCELLED" && a.id !== ignoreAppointmentId,
  );

  const open = minutesOf(state.therapist.dayStart);
  const close = minutesOf(state.therapist.dayEnd);
  const step = durationMin + state.therapist.bufferMinutes;
  const now = new Date();
  const isToday = date === todayISO();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const out: string[] = [];
  for (let start = open; start + durationMin <= close; start += step) {
    if (isToday && start <= nowMinutes + 30) continue;
    const end = start + durationMin;
    const clash = booked.some((a) => {
      const bStart = minutesOf(a.time);
      return overlap(start, end, bStart, bStart + a.durationMin + state.therapist.bufferMinutes);
    });
    if (!clash) out.push(clock(start));
  }
  return out;
}

export const appointmentLabel = (state: AppState, a: Appointment) =>
  state.clients.find((c) => c.id === a.clientId)?.name ?? "Client";

export const upcoming = (state: AppState) =>
  state.appointments
    .filter((a) => a.status === "CONFIRMED" && a.date >= todayISO())
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

export const past = (state: AppState) =>
  state.appointments
    .filter((a) => a.date < todayISO() || a.status === "COMPLETED" || a.status === "NO_SHOW")
    .sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time));
