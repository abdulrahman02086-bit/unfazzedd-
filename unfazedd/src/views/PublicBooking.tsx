import { useMemo, useState } from "react";
import { Badge, Button, Field, Input, Modal, Note, Panel, Select, cx } from "../components/ui";
import { canAccess } from "../lib/entitlements";
import { dateLabel, inr, isoPlus, slotsFor, timeLabel, todayISO } from "../lib/format";
import { recordInvoice } from "../lib/routing";
import { useStore } from "../lib/store";
import type { Appointment, PaymentMode } from "../lib/types";

const DAYS = 14;

export function PublicBooking() {
  const { state, update, notify } = useStore();
  const t = state.therapist;

  const [serviceId, setServiceId] = useState(state.services[0]?.id ?? "");
  const service = state.services.find((s) => s.id === serviceId) ?? state.services[0];

  const [date, setDate] = useState(() => {
    // Land on the first date that can actually take a booking.
    for (let i = 0; i < DAYS; i += 1) {
      const d = isoPlus(i);
      if (slotsFor(state, d, state.services[0]?.durationMin ?? 60).length > 0) return d;
    }
    return isoPlus(0);
  });
  const [slot, setSlot] = useState<string | null>(null);
  const [clientId, setClientId] = useState(state.clients[0]?.id ?? "new");
  const [newClient, setNewClient] = useState({ name: "", email: "", phone: "" });
  const [mode, setMode] = useState<PaymentMode>("RAZORPAY");
  const [purchaseId, setPurchaseId] = useState<string | null>(null);
  const [payOpen, setPayOpen] = useState(false);
  const [booked, setBooked] = useState<Appointment | null>(null);

  const packagesOn = canAccess(state, "SESSION_PACKAGES").allowed;
  const client = state.clients.find((c) => c.id === clientId) ?? null;
  const credits = state.purchases.filter(
    (p) => p.clientId === clientId && p.sessionsTotal > p.sessionsUsed,
  );
  const purchase = credits.find((p) => p.id === purchaseId) ?? credits[0] ?? null;

  const days = useMemo(
    () =>
      Array.from({ length: DAYS }, (_, i) => {
        const d = isoPlus(i);
        return { date: d, open: slotsFor(state, d, service?.durationMin ?? 60).length };
      }),
    [state, service?.durationMin],
  );

  const slots = useMemo(
    () => (service ? slotsFor(state, date, service.durationMin) : []),
    [state, date, service],
  );

  const amount = service?.price ?? 0;
  const selectedLabel = slot ? `${dateLabel(date, { weekday: true })} · ${timeLabel(slot)}` : "No time selected";
  const canConfirm = Boolean(slot && service) && (clientId !== "new" || newClient.name.trim().length > 1);

  const openPayment = () => {
    if (!slot) {
      notify("Pick a time slot first.", "warn");
      return;
    }
    if (mode === "PACKAGE" && !purchase) {
      notify("No package credits left on this client record.", "warn");
      return;
    }
    setPayOpen(true);
  };

  const confirm = () => {
    if (!service || !slot) return;

    const cap = canAccess(state, "CLIENT_CAP");
    if (clientId === "new" && !cap.allowed) {
      notify(cap.reason, "warn");
      return;
    }

    const targetId = clientId === "new" ? `cli-${Date.now()}` : clientId;
    const appointment: Appointment = {
      id: `apt-${Date.now()}`,
      clientId: targetId,
      serviceId: service.id,
      date,
      time: slot,
      durationMin: service.durationMin,
      amount,
      status: "CONFIRMED",
      paymentMode: mode,
      purchaseId: mode === "PACKAGE" ? purchase?.id : undefined,
    };

    update((draft) => {
      if (clientId === "new") {
        draft.clients.push({
          id: targetId,
          name: newClient.name.trim(),
          email: newClient.email.trim(),
          phone: newClient.phone.trim(),
          tags: ["Self-booked"],
          since: todayISO(),
          archived: false,
        });
      }

      draft.appointments.push(appointment);

      if (mode === "PACKAGE" && purchase) {
        const target = draft.purchases.find((p) => p.id === purchase.id);
        if (target) target.sessionsUsed += 1;
      } else {
        const name = draft.clients.find((c) => c.id === targetId)?.name ?? "Client";
        const result = recordInvoice(draft, {
          clientName: name,
          description: service.name,
          gross: amount,
        });
        draft.invoices = result.state.invoices;
      }
      return draft;
    });

    setPayOpen(false);
    setSlot(null);
    setBooked(appointment);
    notify(
      mode === "PACKAGE"
        ? "Slot locked. One session deducted from the client's package."
        : `Slot locked. ${inr(amount)} captured in Razorpay test mode.`,
    );
  };

  if (booked) {
    const svc = state.services.find((s) => s.id === booked.serviceId);
    return (
      <div className="mx-auto max-w-[720px] px-4 py-14 sm:px-6">
        <p className="label text-pine">Confirmed</p>
        <h1 className="display mt-3 text-[clamp(2rem,4vw,2.8rem)] text-ink">
          The slot is held for you.
        </h1>
        <dl className="mt-8 divide-y divide-rule border-y border-rule">
          {[
            ["Practitioner", t.name],
            ["Service", svc?.name ?? "Session"],
            ["When", `${dateLabel(booked.date, { weekday: true, year: true })} · ${timeLabel(booked.time)} IST`],
            ["Duration", `${booked.durationMin} minutes`],
            ["Paid", booked.paymentMode === "PACKAGE" ? "One session from package" : inr(booked.amount)],
            ["Reference", booked.id.toUpperCase()],
          ].map(([k, v]) => (
            <div key={k} className="flex items-baseline justify-between gap-4 py-3">
              <dt className="text-[12px] text-ink-3">{k}</dt>
              <dd className="num text-right text-[13px] text-ink">{v}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-6 text-[12.5px] leading-relaxed text-ink-2">
          A confirmation has been recorded on the practice ledger. In a live deployment this is where
          the calendar invite, the Razorpay receipt and the WhatsApp reminder would fire.
        </p>
        <div className="mt-7 flex flex-wrap gap-2">
          <Button variant="solid" onClick={() => setBooked(null)}>
            Book another session
          </Button>
          <Button onClick={() => (window.location.hash = "#/portal")}>Open client portal</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1180px] px-4 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-rule py-2.5">
        <p className="label text-ink-3">
          unfazed.in/<span className="text-ink">{t.slug}</span>
        </p>
        <p className="label text-pine">Accepting bookings · IST</p>
      </div>

      {/* Practitioner identity */}
      <section className="grid gap-6 border-b border-rule py-8 sm:grid-cols-[auto_1fr] sm:items-start">
        <img
          src={t.photoUrl}
          alt={t.name}
          className="h-24 w-24 rounded-2xl object-cover shadow-soft sm:h-28 sm:w-28"
        />
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="pine">Verified practice</Badge>
            <span className="label text-ink-3">
              {t.experienceYears} yrs · {t.languages.join(" / ")}
            </span>
          </div>
          <h1 className="display mt-2 text-[clamp(1.8rem,3.6vw,2.4rem)] text-ink">{t.name}</h1>
          <p className="mt-1 text-[12.5px] text-ink-2">{t.title}</p>
          <p className="mt-3 max-w-[62ch] text-[13px] leading-relaxed text-ink-2">{t.bio}</p>
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {t.specialisations.map((s) => (
              <li key={s} className="rounded-full bg-paper-2 px-2.5 py-1 text-[11.5px] font-medium text-ink-2">
                {s}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div className="grid gap-8 py-8 lg:grid-cols-[0.92fr_1.08fr]">
        {/* Step 1 */}
        <div className="space-y-4">
          <Panel label="Step 01" title="Choose a service">
            <div className="space-y-px">
              {state.services.map((s) => {
                const active = s.id === serviceId;
                return (
                  <button
                    key={s.id}
                    onClick={() => {
                      setServiceId(s.id);
                      setSlot(null);
                    }}
                    className={cx(
                      "flex w-full items-baseline justify-between gap-3 rounded-xl border px-3.5 py-3 text-left transition-all",
                      active
                        ? "border-pine bg-mint shadow-soft"
                        : "border-rule bg-paper hover:border-pine/40 hover:bg-paper-2",
                    )}
                  >
                    <span>
                      <span className="block text-[13px] font-medium text-ink">{s.name}</span>
                      <span className="mt-0.5 block text-[11.5px] text-ink-3">
                        {s.durationMin} min · {s.format}
                      </span>
                    </span>
                    <span className="num shrink-0 text-[13px] text-ink">{inr(s.price)}</span>
                  </button>
                );
              })}
            </div>
          </Panel>

          {packagesOn && (
            <Panel
              label="Optional"
              title="Care packages"
              action={<Badge tone="warn">Prepaid</Badge>}
            >
              <p className="-mt-1 text-[12px] leading-relaxed text-ink-2">
                Prepay for a course of sessions at a lower rate. Credits sit on the client record and
                are deducted at each booking.
              </p>
              <ul className="mt-3 divide-y divide-rule border-y border-rule">
                {state.bundles.map((b) => (
                  <li key={b.id} className="flex items-baseline justify-between gap-3 py-2.5">
                    <span>
                      <span className="block text-[12.5px] font-medium text-ink">{b.name}</span>
                      <span className="num block text-[11px] text-ink-3">
                        {inr(Math.round(b.price / b.sessions))} per session · save {b.discountPct}%
                      </span>
                    </span>
                    <span className="num text-[12.5px] text-ink">{inr(b.price)}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-[11.5px] leading-snug text-ink-3">
                A package can be purchased during checkout after a slot is chosen.
              </p>
            </Panel>
          )}

          <Panel label="Step 03" title="Who is this for">
            <div className="space-y-3">
              <Field label="Client record">
                <Select
                  value={clientId}
                  onChange={(e) => {
                    setClientId(e.target.value);
                    setPurchaseId(null);
                    setMode("RAZORPAY");
                  }}
                >
                  {state.clients
                    .filter((c) => !c.archived)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  <option value="new">Someone new…</option>
                </Select>
              </Field>

              {clientId === "new" ? (
                <div className="space-y-2.5">
                  <Field label="Full name">
                    <Input
                      value={newClient.name}
                      onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                      placeholder="e.g. Nila Menon"
                    />
                  </Field>
                  <div className="grid gap-2.5 sm:grid-cols-2">
                    <Field label="Email">
                      <Input
                        type="email"
                        value={newClient.email}
                        onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                        placeholder="you@email.com"
                      />
                    </Field>
                    <Field label="Phone">
                      <Input
                        value={newClient.phone}
                        onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                        placeholder="+91"
                      />
                    </Field>
                  </div>
                  {!canAccess(state, "CLIENT_CAP").allowed && (
                    <Note tone="warn">{canAccess(state, "CLIENT_CAP").reason}</Note>
                  )}
                </div>
              ) : (
                <p className="text-[11.5px] text-ink-3">
                  Booking on behalf of an existing record. Identity verification would run here in a
                  live deployment.
                </p>
              )}

              {client && credits.length > 0 && packagesOn && (
                <Field label="Payment">
                  <Select
                    value={mode === "PACKAGE" ? "PACKAGE" : "RAZORPAY"}
                    onChange={(e) => setMode(e.target.value as PaymentMode)}
                  >
                    <option value="RAZORPAY">Razorpay · {inr(amount)}</option>
                    {credits.map((p) => {
                      const bundle = state.bundles.find((b) => b.id === p.bundleId);
                      return (
                        <option key={p.id} value="PACKAGE">
                          Redeem package · {p.sessionsTotal - p.sessionsUsed} left
                          {bundle ? ` (${bundle.name.split("·")[1]?.trim()})` : ""}
                        </option>
                      );
                    })}
                  </Select>
                </Field>
              )}
            </div>
          </Panel>
        </div>

        {/* Step 2 */}
        <Panel
          label="Step 02"
          title="Pick a date and a time"
          action={<Badge>Buffer {t.bufferMinutes} min</Badge>}
        >
          <div className="-mx-1 flex gap-1.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {days.map((d) => {
              const active = d.date === date;
              const off = d.open === 0;
              return (
                <button
                  key={d.date}
                  disabled={off}
                  onClick={() => {
                    setDate(d.date);
                    setSlot(null);
                  }}
                  className={cx(
                    "flex min-w-[60px] flex-col items-center gap-1 rounded-2xl border px-2 py-2.5 transition-all",
                    active
                      ? "border-pine bg-pine text-white shadow-glow"
                      : off
                        ? "cursor-not-allowed border-rule bg-paper-2/50 text-ink-3/60"
                        : "border-rule text-ink hover:border-pine/40 hover:bg-paper-2",
                  )}
                >
                  <span className="label opacity-70">{dateLabel(d.date).split(" ")[0]}</span>
                  <span className="num text-[15px] leading-none">{d.date.slice(-2)}</span>
                  <span className="num text-[10px] opacity-60">{off ? "—" : d.open}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-5 flex items-baseline justify-between">
            <p className="label text-ink-3">{dateLabel(date, { weekday: true, year: true })}</p>
            <p className="label text-ink-3">{service?.durationMin} min sessions</p>
          </div>

          {slots.length === 0 ? (
            <p className="mt-3 border border-dashed border-rule-strong px-3 py-6 text-center text-[12.5px] text-ink-3">
              No open slots. This date is either fully booked or closed for the practice.
            </p>
          ) : (
            <div className="mt-2 grid grid-cols-3 gap-1.5 sm:grid-cols-4">
              {slots.map((s) => (
                <button
                  key={s}
                  onClick={() => setSlot(s)}
                  className={cx(
                    "rounded-xl border py-2.5 text-center transition-all",
                    slot === s
                      ? "border-pine bg-pine text-white shadow-glow"
                      : "border-rule text-ink hover:border-pine/40 hover:bg-paper-2",
                  )}
                >
                  <span className="num text-[12.5px]">{timeLabel(s)}</span>
                </button>
              ))}
            </div>
          )}

          <div className="mt-6 border-t border-rule pt-4">
            <div className="flex items-baseline justify-between gap-4">
              <div className="min-w-0">
                <p className="label text-ink-3">Selected</p>
                <p className="mt-1 truncate text-[13px] font-medium text-ink">{selectedLabel}</p>
                <p className="mt-0.5 text-[11.5px] text-ink-3">
                  {mode === "PACKAGE" ? "Paid from package credits" : service?.name}
                </p>
              </div>
              <div className="text-right">
                <p className="label text-ink-3">Due</p>
                <p className="num mt-1 text-[18px] leading-none text-ink">
                  {mode === "PACKAGE" ? "1 credit" : inr(amount)}
                </p>
              </div>
            </div>
            <Button
              variant="solid"
              className="mt-4 h-10 w-full"
              disabled={!canConfirm}
              onClick={openPayment}
            >
              {mode === "PACKAGE" ? "Redeem & lock slot" : "Continue to payment"}
            </Button>
            <p className="mt-2 text-center text-[11px] text-ink-3">
              Slot is locked only after payment confirms. Razorpay runs in test mode.
            </p>
          </div>
        </Panel>
      </div>

      <Modal open={payOpen} onClose={() => setPayOpen(false)} title="Razorpay · test checkout">
        <div className="space-y-3">
          <div className="flex items-baseline justify-between border-b border-rule pb-3">
            <div>
              <p className="text-[13px] font-medium text-ink">{service?.name}</p>
              <p className="num text-[11.5px] text-ink-3">{selectedLabel}</p>
            </div>
            <p className="num text-[20px] text-ink">{inr(amount)}</p>
          </div>
          <dl className="space-y-1.5">
            {[
              ["Practitioner", t.name],
              ["Client", clientId === "new" ? newClient.name || "New client" : client?.name ?? ""],
              ["Mode", "Test · no card is charged"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 text-[12px]">
                <dt className="text-ink-3">{k}</dt>
                <dd className="text-ink">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="flex gap-2 pt-2">
            <Button variant="solid" className="flex-1" onClick={confirm}>
              Pay {inr(amount)} & lock slot
            </Button>
            <Button onClick={() => setPayOpen(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
