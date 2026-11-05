import { useMemo, useState } from "react";
import { Badge, Button, Field, Input, Panel, Select, cx } from "../../components/ui";
import { dateLabel, inr, isoPlus, slotsFor, timeLabel, todayISO } from "../../lib/format";
import { recordInvoice } from "../../lib/routing";
import { useStore } from "../../lib/store";
import type { SessionStatus } from "../../lib/types";

const shift = (isoDate: string, days: number) => {
  const d = new Date(`${isoDate}T00:00:00`);
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export function ScheduleTab() {
  const { state, update, notify } = useStore();
  const [date, setDate] = useState(todayISO());
  const [block, setBlock] = useState({ date: isoPlus(3), reason: "" });
  const [booking, setBooking] = useState({ clientId: state.clients[0]?.id ?? "", serviceId: state.services[0]?.id ?? "", time: "" });

  const service = state.services.find((s) => s.id === booking.serviceId);
  const slots = useMemo(
    () => (service ? slotsFor(state, date, service.durationMin) : []),
    [state, date, service],
  );
  const agenda = state.appointments
    .filter((a) => a.date === date)
    .sort((a, b) => a.time.localeCompare(b.time));

  const blocked = state.blockedDates.find((b) => b.date === date);

  const setStatus = (id: string, status: SessionStatus) => {
    update((s) => {
      const a = s.appointments.find((x) => x.id === id);
      if (a) a.status = status;
      return s;
    });
    notify(`Session marked ${status.toLowerCase().replace("_", " ")}.`);
  };

  const book = () => {
    if (!service || !booking.time) {
      notify("Pick a service and an open slot.", "warn");
      return;
    }
    update((s) => {
      s.appointments.push({
        id: `apt-${Date.now()}`,
        clientId: booking.clientId,
        serviceId: service.id,
        date,
        time: booking.time,
        durationMin: service.durationMin,
        amount: service.price,
        status: "CONFIRMED",
        paymentMode: "RAZORPAY",
      });
      const client = s.clients.find((c) => c.id === booking.clientId);
      const result = recordInvoice(s, {
        clientName: client?.name ?? "Client",
        description: service.name,
        gross: service.price,
      });
      s.invoices = result.state.invoices;
      return s;
    });
    notify(`Slot locked for ${dateLabel(date)} at ${timeLabel(booking.time)}.`);
    setBooking({ ...booking, time: "" });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-y border-rule py-3">
        <div className="flex items-center gap-1.5">
          <Button size="sm" onClick={() => setDate(shift(date, -1))} aria-label="Previous day">←</Button>
          <Input
            type="date"
            value={date}
            onChange={(e) => e.target.value && setDate(e.target.value)}
            className="h-8 w-40 py-1 text-[12px]"
            aria-label="Selected date"
          />
          <Button size="sm" onClick={() => setDate(shift(date, 1))} aria-label="Next day">→</Button>
          <Button size="sm" variant="ghost" onClick={() => setDate(todayISO())}>Today</Button>
        </div>
        <div className="flex items-center gap-2">
          <p className="label text-ink-3">{dateLabel(date, { weekday: true, year: true })}</p>
          {blocked ? <Badge tone="signal">closed · {blocked.reason}</Badge> : <Badge tone="pine">open</Badge>}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <Panel label="Agenda" title={`${agenda.length} session${agenda.length === 1 ? "" : "s"}`}>
          {agenda.length === 0 ? (
            <p className="py-6 text-center text-[12.5px] text-ink-3">Nothing booked on this date.</p>
          ) : (
            <ul className="divide-y divide-rule">
              {agenda.map((a) => {
                const client = state.clients.find((c) => c.id === a.clientId);
                const svc = state.services.find((s) => s.id === a.serviceId);
                return (
                  <li key={a.id} className="py-3 first:pt-0 last:pb-0">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[13px] font-medium text-ink">
                          <span className="num mr-2 text-ink-3">{timeLabel(a.time)}</span>
                          {client?.name}
                        </p>
                        <p className="mt-0.5 text-[11.5px] text-ink-3">
                          {svc?.name} · {a.paymentMode === "PACKAGE" ? "package credit" : inr(a.amount)}
                        </p>
                      </div>
                      <Badge tone={a.status === "CONFIRMED" ? "pine" : a.status === "NO_SHOW" ? "signal" : "neutral"}>
                        {a.status.toLowerCase().replace("_", " ")}
                      </Badge>
                    </div>
                    {a.status === "CONFIRMED" && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <Button size="sm" variant="quiet" onClick={() => setStatus(a.id, "COMPLETED")}>Mark complete</Button>
                        <Button size="sm" variant="ghost" onClick={() => setStatus(a.id, "NO_SHOW")}>No-show</Button>
                        <Button size="sm" variant="ghost" onClick={() => setStatus(a.id, "CANCELLED")}>Cancel</Button>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>

        <div className="space-y-5">
          <Panel label="Book internally" title="Add a session for a client">
            <div className="space-y-3">
              <Field label="Client">
                <Select value={booking.clientId} onChange={(e) => setBooking({ ...booking, clientId: e.target.value })}>
                  {state.clients.filter((c) => !c.archived).map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Service">
                <Select
                  value={booking.serviceId}
                  onChange={(e) => setBooking({ ...booking, serviceId: e.target.value, time: "" })}
                >
                  {state.services.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} · {inr(s.price)}</option>
                  ))}
                </Select>
              </Field>
              <div>
                <p className="label text-ink-3">Open slots</p>
                {slots.length === 0 ? (
                  <p className="mt-2 text-[11.5px] text-ink-3">No slots — this date is closed or full.</p>
                ) : (
                  <div className="mt-1.5 grid grid-cols-4 gap-1">
                    {slots.map((s) => (
                      <button
                        key={s}
                        onClick={() => setBooking({ ...booking, time: s })}
                        className={cx(
                          "rounded-lg border py-2 text-center transition-colors",
                          booking.time === s ? "border-pine bg-pine text-white" : "border-rule text-ink hover:border-pine",
                        )}
                      >
                        <span className="num text-[11.5px]">{s}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <Button variant="solid" className="w-full" onClick={book}>Lock slot & raise invoice</Button>
            </div>
          </Panel>

          <Panel label="Overrides" title="Closed dates">
            <ul className="space-y-1.5">
              {state.blockedDates.map((b) => (
                <li key={b.date} className="flex items-center justify-between gap-2 border-b border-rule pb-1.5 text-[12px]">
                  <span className="text-ink">
                    <span className="num mr-2">{b.date}</span>
                    <span className="text-ink-3">{b.reason}</span>
                  </span>
                  <button
                    className="text-[11px] text-ink-3 hover:text-signal"
                    onClick={() => {
                      update((s) => {
                        s.blockedDates = s.blockedDates.filter((x) => x.date !== b.date);
                        return s;
                      });
                      notify("Date reopened for bookings.");
                    }}
                  >
                    reopen
                  </button>
                </li>
              ))}
              {state.blockedDates.length === 0 && (
                <li className="text-[11.5px] text-ink-3">No overrides. The calendar follows your working days.</li>
              )}
            </ul>
            <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
              <Input
                type="date"
                value={block.date}
                onChange={(e) => setBlock({ ...block, date: e.target.value })}
                aria-label="Date to close"
              />
              <Input
                value={block.reason}
                placeholder="Reason"
                onChange={(e) => setBlock({ ...block, reason: e.target.value })}
              />
              <Button
                onClick={() => {
                  if (!block.date) return;
                  update((s) => {
                    const reason = block.reason.trim() || "Practice closed";
                    const existing = s.blockedDates.find((x) => x.date === block.date);
                    if (existing) existing.reason = reason;
                    else s.blockedDates.push({ date: block.date, reason });
                    return s;
                  });
                  notify(`${block.date} closed for bookings.`);
                  setBlock({ ...block, reason: "" });
                }}
              >
                Close date
              </Button>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
