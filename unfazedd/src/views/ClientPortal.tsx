import { useEffect, useRef, useState } from "react";
import { Badge, Button, Input, Locked, Panel, Stat, cx } from "../components/ui";
import { canAccess } from "../lib/entitlements";
import { dateLabel, inr, stamp, timeLabel, todayISO } from "../lib/format";
import { useStore } from "../lib/store";

export function ClientPortal() {
  const { state, update, notify } = useStore();
  const client =
    state.clients.find((c) => c.id === state.consent.clientId) ?? state.clients[0] ?? null;
  const [consentChecked, setConsentChecked] = useState(false);
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const chatGate = canAccess(state, "CARE_CHAT");

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "nearest" });
  }, [state.messages.length]);

  if (!client) {
    return (
      <p className="mx-auto max-w-[1180px] px-6 py-16 text-[13px] text-ink-2">
        No client record is attached to this portal.
      </p>
    );
  }

  const mine = state.appointments.filter((a) => a.clientId === client.id);
  const next = mine
    .filter((a) => a.status === "CONFIRMED" && a.date >= todayISO())
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))[0];
  const history = mine
    .filter((a) => a.date < todayISO() || a.status === "COMPLETED" || a.status === "NO_SHOW")
    .sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time))
    .slice(0, 5);

  // The privacy boundary: only SHARED notes for this client ever reach this array.
  const sharedNotes = state.notes
    .filter((n) => n.visibility === "SHARED" && n.clientId === client.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const credits = state.purchases
    .filter((p) => p.clientId === client.id)
    .reduce((n, p) => n + (p.sessionsTotal - p.sessionsUsed), 0);

  const signed = Boolean(state.consent.signedAt);

  const send = () => {
    const body = text.trim();
    if (!body) return;
    update((s) => {
      s.messages.push({ id: `msg-${Date.now()}`, from: "CLIENT", text: body, at: stamp() });
      return s;
    });
    setText("");
  };

  return (
    <div className="mx-auto max-w-[1180px] px-4 sm:px-6">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-rule py-6">
        <div>
          <p className="label text-ink-3">Client portal</p>
          <h1 className="display mt-1.5 text-[clamp(1.7rem,3.4vw,2.3rem)] text-ink">{client.name}</h1>
          <p className="mt-1 text-[12px] text-ink-2">
            Care with {state.therapist.name} · {client.email || client.phone}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="#/public"
            className="inline-flex h-9 items-center rounded-full border border-rule-strong px-4 text-[12px] font-semibold text-ink hover:bg-paper-2"
          >
            Book a session
          </a>
          {signed ? <Badge tone="pine">consent on file</Badge> : <Badge tone="warn">consent pending</Badge>}
        </div>
      </header>

      <section className="grid grid-cols-2 gap-y-4 border-b border-rule py-4 sm:grid-cols-4">
        <Stat
          label="Next session"
          value={next ? dateLabel(next.date) : "None"}
          hint={next ? timeLabel(next.time) + " IST" : "Book a slot from the branded page"}
        />
        <Stat label="Package credits" value={credits} hint={credits ? "Sessions already paid for" : "No active package"} />
        <Stat label="Sessions with practice" value={mine.length} hint={`Since ${client.since}`} />
        <Stat label="Shared notes" value={sharedNotes.length} hint="Clinical notes stay private" />
      </section>

      <div className="grid gap-6 py-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          <Panel label="Upcoming" title={next ? `${dateLabel(next.date, { weekday: true })} · ${timeLabel(next.time)}` : "Nothing scheduled"}>
            {next ? (
              <>
                <p className="text-[12.5px] text-ink-2">
                  {state.services.find((s) => s.id === next.serviceId)?.name} · {next.durationMin} minutes ·{" "}
                  {next.paymentMode === "PACKAGE" ? "package credit" : inr(next.amount)}
                </p>
                <p className="mt-2 text-[11.5px] leading-relaxed text-ink-3">
                  Arrive a few minutes early. Cancellations inside 24 hours are charged in full.
                </p>
              </>
            ) : (
              <p className="text-[12.5px] text-ink-3">
                No confirmed slot. Use the branded page to lock a time — the link is on the practice
                header.
              </p>
            )}
          </Panel>

          <Panel label="History" title="Recent sessions">
            {history.length === 0 ? (
              <p className="text-[12.5px] text-ink-3">No sessions recorded yet.</p>
            ) : (
              <ul className="divide-y divide-rule">
                {history.map((a) => (
                  <li key={a.id} className="flex items-baseline justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                    <div>
                      <p className="text-[12.5px] text-ink">{dateLabel(a.date, { year: true })}</p>
                      <p className="text-[11px] text-ink-3">
                        {state.services.find((s) => s.id === a.serviceId)?.name}
                      </p>
                    </div>
                    <Badge tone={a.status === "NO_SHOW" ? "signal" : "neutral"}>
                      {a.status.toLowerCase().replace("_", " ")}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel label="Your notes" title="Shared by your therapist" action={<Badge>{sharedNotes.length}</Badge>}>
            {sharedNotes.length === 0 ? (
              <p className="text-[12.5px] leading-relaxed text-ink-3">
                Nothing shared yet. Notes your therapist keeps private are never sent to this page.
              </p>
            ) : (
              <div className="space-y-4">
                {sharedNotes.map((n) => (
                  <article key={n.id} className="border-l-2 border-pine pl-3">
                    <p className="text-[12.5px] font-medium text-ink">{n.title}</p>
                    <p className="num text-[10.5px] text-ink-3">{n.createdAt}</p>
                    {n.sections.map((s) => (
                      <p key={s.label} className="mt-1.5 text-[12px] leading-relaxed text-ink-2">
                        {s.text}
                      </p>
                    ))}
                  </article>
                ))}
              </div>
            )}
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel label="Consent" title="Informed consent for care">
            <p className="text-[12px] leading-relaxed text-ink-2">
              I understand the limits of confidentiality, the cancellation policy, and that records are
              held for the period required by my practitioner's professional body.
            </p>
            {signed ? (
              <div className="mt-3 border border-pine/30 bg-pine-soft px-3 py-2.5">
                <p className="label text-pine">Signed</p>
                <p className="num mt-1 text-[11.5px] text-ink">{state.consent.signedAt}</p>
              </div>
            ) : (
              <div className="mt-3 space-y-2">
                <label className="flex cursor-pointer items-start gap-2 text-[12px] text-ink-2">
                  <input
                    type="checkbox"
                    checked={consentChecked}
                    onChange={(e) => setConsentChecked(e.target.checked)}
                    className="mt-0.5 h-3.5 w-3.5 accent-[#1f4d3f]"
                  />
                  I have read and agree to the terms above.
                </label>
                <Button
                  variant="solid"
                  className="w-full"
                  onClick={() => {
                    if (!consentChecked) {
                      notify("Tick the consent box first.", "warn");
                      return;
                    }
                    const at = new Date().toLocaleString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    });
                    update((s) => {
                      s.consent = { clientId: client.id, signedAt: at };
                      return s;
                    });
                    notify("Digital consent recorded with a timestamp.");
                  }}
                >
                  Sign consent
                </Button>
              </div>
            )}
          </Panel>

          {chatGate.allowed ? (
            <Panel label="Care chat" title="Message your therapist" action={<Badge tone="pine">secure</Badge>}>
              <div className="max-h-64 space-y-2.5 overflow-y-auto pr-1">
                {state.messages.map((m) => {
                  const mineMsg = m.from === "CLIENT";
                  return (
                    <div key={m.id} className={cx("flex", mineMsg ? "justify-end" : "justify-start")}>
                      <div
                        className={cx(
                          "max-w-[86%] rounded-2xl px-3.5 py-2.5",
                          mineMsg ? "rounded-br-md bg-pine text-white" : "rounded-bl-md bg-paper-2 text-ink",
                        )}
                      >
                        <p className="text-[12px] leading-relaxed">{m.text}</p>
                        <p className={cx("num mt-1 text-[10px]", mineMsg ? "text-paper/50" : "text-ink-3")}>{m.at}</p>
                      </div>
                    </div>
                  );
                })}
                <div ref={endRef} />
              </div>
              <div className="mt-3 flex gap-2 border-t border-rule pt-3">
                <Input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  placeholder="Write a message…"
                  aria-label="Message text"
                />
                <Button variant="solid" onClick={send}>Send</Button>
              </div>
              <p className="mt-2 text-[11px] text-ink-3">
                If you are in crisis, call Tele-MANAS on 14416. This chat is not monitored overnight.
              </p>
            </Panel>
          ) : (
            <Panel label="Care chat" title="Not available">
              <Locked reason={chatGate.reason} />
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
}
