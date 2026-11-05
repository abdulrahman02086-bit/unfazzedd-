import { Badge, Button, Locked, Panel, Stat, cx } from "../../components/ui";
import { activeClients, canAccess } from "../../lib/entitlements";
import { dateLabel, inr, timeLabel, todayISO, upcoming } from "../../lib/format";
import { useStore } from "../../lib/store";
import type { SessionStatus } from "../../lib/types";

const WEEKS = 6;

const statusTone = (s: SessionStatus) =>
  s === "CONFIRMED" ? "pine" : s === "COMPLETED" ? "neutral" : s === "NO_SHOW" ? "signal" : "warn";

export function OverviewTab() {
  const { state, update, notify } = useStore();
  const analytics = canAccess(state, "ANALYTICS");

  const today = todayISO();
  const todays = state.appointments
    .filter((a) => a.date === today)
    .sort((a, b) => a.time.localeCompare(b.time));

  const completed = state.appointments.filter((a) => a.status === "COMPLETED").length;
  const noShows = state.appointments.filter((a) => a.status === "NO_SHOW").length;
  const held = completed + noShows;
  const noShowRate = held ? Math.round((noShows / held) * 100) : 0;
  const net = state.invoices.reduce((sum, i) => sum + i.net, 0);
  const confirmed = upcoming(state).length;

  // Revenue by week, oldest first — plain arithmetic, no chart library.
  const buckets = Array.from({ length: WEEKS }, (_, i) => {
    const end = i === 0 ? "9999-99-99" : new Date(Date.now() - i * 7 * 864e5).toISOString().slice(0, 10);
    return { end, total: 0 };
  });
  state.invoices.forEach((inv) => {
    for (let i = 0; i < buckets.length; i += 1) {
      if (inv.date <= buckets[i].end) {
        buckets[i].total += inv.net;
        break;
      }
    }
  });
  const ordered = [...buckets].reverse();
  const peak = Math.max(...ordered.map((b) => b.total), 1);

  const mark = (id: string, status: SessionStatus) => {
    update((draft) => {
      const apt = draft.appointments.find((a) => a.id === id);
      if (apt) apt.status = status;
      return draft;
    });
    notify(
      status === "COMPLETED"
        ? "Session marked complete and moved into the ledger."
        : status === "NO_SHOW"
          ? "Marked as a no-show. It will count against the attendance rate."
          : "Session cancelled and the slot released.",
      status === "NO_SHOW" ? "warn" : "default",
    );
  };

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-2 gap-y-4 border-y border-rule sm:grid-cols-4">
        <Stat label="Active clients" value={activeClients(state).length} hint="Non-archived records" />
        <Stat label="Confirmed ahead" value={confirmed} hint="Locked future slots" />
        <Stat label="Net settled" value={inr(net)} hint={`After ${state.platformFeePct}% platform fee`} />
        <Stat label="No-show rate" value={`${noShowRate}%`} hint={`${noShows} of ${held} held sessions`} tone={noShowRate > 15 ? "signal" : undefined} />
      </section>

      <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <Panel
          label="Today"
          title={dateLabel(today, { weekday: true, year: true })}
          action={<Badge>{todays.length} scheduled</Badge>}
        >
          {todays.length === 0 ? (
            <p className="py-6 text-center text-[12.5px] text-ink-3">
              Nothing on the calendar. The public page is still open for bookings.
            </p>
          ) : (
            <ul className="divide-y divide-rule">
              {todays.map((a) => {
                const client = state.clients.find((c) => c.id === a.clientId);
                const service = state.services.find((s) => s.id === a.serviceId);
                return (
                  <li key={a.id} className="flex flex-wrap items-center gap-3 py-3 first:pt-0 last:pb-0">
                    <div className="w-16 shrink-0">
                      <p className="num text-[13px] text-ink">{timeLabel(a.time)}</p>
                      <p className="num text-[10.5px] text-ink-3">{a.durationMin}m</p>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium text-ink">{client?.name}</p>
                      <p className="truncate text-[11.5px] text-ink-3">{service?.name}</p>
                    </div>
                    <Badge tone={statusTone(a.status)}>{a.status.replace("_", " ").toLowerCase()}</Badge>
                    {a.status === "CONFIRMED" && (
                      <div className="flex gap-1">
                        <Button size="sm" variant="quiet" onClick={() => mark(a.id, "COMPLETED")}>
                          Done
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => mark(a.id, "NO_SHOW")}>
                          No-show
                        </Button>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>

        <div className="space-y-4">
          {analytics.allowed ? (
            <Panel label="Settled per week" title="Revenue, last six weeks" action={<Badge tone="pine">live</Badge>}>
              <ul className="space-y-2.5">
                {ordered.map((b, i) => (
                  <li key={b.end} className="flex items-center gap-3">
                    <span className="label w-10 shrink-0 text-ink-3">{i === WEEKS - 1 ? "now" : `-${WEEKS - 1 - i}w`}</span>
                    <span className="h-3 flex-1 border border-rule bg-paper-2">
                      <span
                        className={cx("block h-full", i === WEEKS - 1 ? "bg-pine" : "bg-ink/70")}
                        style={{ width: `${Math.max(2, (b.total / peak) * 100)}%` }}
                      />
                    </span>
                    <span className="num w-16 shrink-0 text-right text-[11.5px] text-ink">
                      {b.total ? inr(b.total) : "—"}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-[11.5px] text-ink-3">
                Figures are net of the platform fee, derived from stored invoices rather than a
                separate analytics pipeline.
              </p>
            </Panel>
          ) : (
            <Panel label="Analytics" title="Locked on this plan">
              <Locked reason={analytics.reason}>
                <Button size="sm" variant="quiet" onClick={() => (window.location.hash = "#/console")}>
                  Go to plan & entitlements
                </Button>
              </Locked>
            </Panel>
          )}

          <Panel label="Attention" title="Needs a decision">
            <ul className="space-y-2.5">
              {[
                {
                  label: "Notes awaiting a share decision",
                  value: state.notes.filter((n) => n.visibility === "PRIVATE").length,
                },
                {
                  label: "Package credits outstanding",
                  value: state.purchases.reduce((n, p) => n + (p.sessionsTotal - p.sessionsUsed), 0),
                },
                {
                  label: "Clients without an upcoming slot",
                  value: state.clients.filter(
                    (c) => !c.archived && !state.appointments.some((a) => a.clientId === c.id && a.date >= today),
                  ).length,
                },
              ].map((row) => (
                <li key={row.label} className="flex items-baseline justify-between gap-3">
                  <span className="text-[12px] text-ink-2">{row.label}</span>
                  <span className="num text-[13px] text-ink">{row.value}</span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </div>
  );
}
