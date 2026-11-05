import { HeadGlyph, SageBackdrop } from "../components/Brand";
import { Icon, cx } from "../components/ui";
import { activeClients } from "../lib/entitlements";
import { dateLabel, inr, isoPlus, slotsFor, timeLabel, todayISO, upcoming } from "../lib/format";
import { useStore } from "../lib/store";

const SERVICE_SHOTS = [
  "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=700&q=80",
  "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=700&q=80",
  "https://images.unsplash.com/photo-1517021897933-0e0319cfbc28?auto=format&fit=crop&w=700&q=80",
  "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=700&q=80",
];

const STORIES = [
  {
    quote:
      "I came in for burnout and stayed for the honesty. Eighteen months of sessions, and not once did I have to explain myself twice.",
    name: "Nikita R.",
    meta: "In care since 2023",
  },
  {
    quote:
      "The portal made the practical part disappear — receipts, sessions, the little note after each hour. The rest was just work.",
    name: "Aarav V.",
    meta: "Weekly sessions",
  },
  {
    quote:
      "She holds the hour properly. I stopped rehearsing what I was going to say on the way there.",
    name: "Meera I.",
    meta: "Nine months in care",
  },
];

const FAQ = [
  {
    q: "What kinds of therapy are available?",
    a: "Individual therapy for anxiety, depression, burnout, grief and relationship difficulty; couples work; and focused 45-minute check-ins for people already in an ongoing course of care.",
  },
  {
    q: "Is my privacy protected during sessions?",
    a: "Yes. Notes are clinical records kept on the practice side — a client only ever sees what the practitioner deliberately shares to the portal, and everything else stays behind that boundary.",
  },
  {
    q: "Do I need a referral to schedule a session?",
    a: "No referral is needed. You can book a first session directly; if the fit isn't right, you'll be pointed to a colleague whose specialism matches better.",
  },
  {
    q: "What if I'm unsure whether therapy is right for me?",
    a: "A free 15-minute conversation is enough to find out. There is no obligation to continue, and the first session is refundable if it doesn't feel workable.",
  },
];

const FORMATS = [
  { icon: "clock", label: "60 minute hours" },
  { icon: "shield", label: "Notes stay private" },
  { icon: "check", label: "No lock-in contract" },
];

export function Landing() {
  const { state } = useStore();
  const t = state.therapist;
  const today = todayISO();
  const todays = state.appointments.filter((a) => a.date === today && a.status !== "CANCELLED");
  const next = upcoming(state)[0];
  const net = state.invoices.reduce((sum, i) => sum + i.net, 0);

  const openThisWeek = (() => {
    let total = 0;
    for (let i = 0; i < 7; i += 1) total += slotsFor(state, isoPlus(i), t.sessionDuration).length;
    return total;
  })();

  const nextOpen = (() => {
    for (let i = 0; i < 7; i += 1) {
      const d = isoPlus(i);
      const open = slotsFor(state, d, t.sessionDuration);
      if (open[0]) return `${i === 0 ? "Today" : dateLabel(d)} · ${timeLabel(open[0])}`;
    }
    return "Fully booked";
  })();

  const heroTiles = [t.photoUrl, SERVICE_SHOTS[0], SERVICE_SHOTS[1], SERVICE_SHOTS[2]];

  return (
    <div className="relative isolate pb-16">
      <SageBackdrop />

      <div className="mx-auto max-w-[1240px] px-3 sm:px-5">
        {/* ── Hero canvas ─────────────────────────────────────────────── */}
        <section className="overflow-hidden rounded-[30px] border border-white/70 bg-canvas shadow-[0_60px_150px_-90px_rgba(15,61,46,0.8)]">
          <div className="grid items-center gap-12 px-6 py-10 sm:px-10 sm:py-14 lg:grid-cols-[1.02fr_0.98fr] lg:gap-14 lg:px-12">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-[#e7f2ea] px-3.5 py-1.5 text-[11.5px] font-semibold text-[#157a4d]">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#12a05e] opacity-70" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#12a05e]" />
                </span>
                Open for work · {openThisWeek} slots this week
              </span>

              <h1 className="display-serif mt-7 text-[clamp(2.7rem,5.2vw,4.05rem)] text-ink">
                A quiet space to
                <br />
                heal and grow.
              </h1>

              <p className="mt-5 max-w-[42ch] text-[15px] font-normal leading-[1.6] text-[#5f6d66]">
                Professional psychological support tailored to your needs — online and in-person
                sessions available, in English, Hindi and Marathi.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <a
                  href="#about"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById("about")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="inline-flex h-12 items-center rounded-full border border-line bg-white px-6 text-[13px] font-semibold text-ink transition-colors hover:bg-canvas-2"
                >
                  Learn More
                </a>
                <a
                  href="#/public"
                  className="inline-flex h-12 items-center gap-2 rounded-full bg-[#12a05e] px-6 text-[13px] font-semibold text-white shadow-[0_16px_34px_-18px_rgba(18,160,94,1)] transition-colors hover:bg-[#0e8c52]"
                >
                  Book Your First Session
                  <Icon name="arrow" className="h-4 w-4" strokeWidth={2} />
                </a>
              </div>

              <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-2.5">
                {FORMATS.map((f) => (
                  <li key={f.label} className="inline-flex items-center gap-2 text-[12px] font-medium text-[#6b7972]">
                    <Icon name={f.icon} className="h-3.5 w-3.5 text-[#12a05e]" strokeWidth={2} />
                    {f.label}
                  </li>
                ))}
              </ul>
            </div>

            {/* Collage with the line-art head, as in the reference */}
            <div className="relative">
              <div className="grid grid-cols-2 gap-[6px]">
                {heroTiles.map((src, i) => (
                  <div
                    key={i}
                    className={cx(
                      "relative overflow-hidden bg-[#cfe0d5]",
                      i === 0 && "rounded-tl-[24px]",
                      i === 1 && "rounded-tr-[24px]",
                      i === 2 && "rounded-bl-[24px]",
                      i === 3 && "rounded-br-[24px]",
                    )}
                  >
                    <img
                      src={src}
                      alt=""
                      loading={i > 1 ? "lazy" : "eager"}
                      className="h-[150px] w-full object-cover object-center saturate-[0.82] sm:h-[178px] lg:h-[196px]"
                    />
                    <span className="absolute inset-0 bg-[#123a2b]/15" />
                  </div>
                ))}
              </div>

              <div aria-hidden="true" className="pointer-events-none absolute inset-0">
                <span className="absolute left-1/2 top-0 h-full w-[2px] -translate-x-1/2 bg-white/85" />
                <span className="absolute left-0 top-1/2 h-[2px] w-full -translate-y-1/2 bg-white/85" />
                <HeadGlyph
                  className="absolute inset-0 m-auto h-[72%] w-[72%] text-white drop-shadow-[0_12px_30px_rgba(11,46,33,0.25)]"
                  strokeWidth={6}
                />
              </div>

              <a
                href="#/public"
                className="absolute -bottom-4 left-3 flex items-center gap-2.5 rounded-2xl border border-white/70 bg-white/95 px-3.5 py-2.5 shadow-[0_18px_40px_-24px_rgba(15,61,46,0.7)] backdrop-blur sm:left-5"
              >
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#e7f2ea] text-[#12a05e]">
                  <Icon name="calendar" className="h-4 w-4" strokeWidth={1.9} />
                </span>
                <span>
                  <span className="block text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-3">
                    Next available
                  </span>
                  <span className="block text-[12px] font-semibold text-ink">{nextOpen}</span>
                </span>
              </a>
            </div>
          </div>

          {/* numbers strip, still inside the canvas */}
          <div className="grid grid-cols-2 gap-px border-t border-line bg-line sm:grid-cols-4">
            {[
              { k: "Active clients", v: String(activeClients(state).length) },
              { k: "Sessions today", v: String(todays.length) },
              { k: "Net settled", v: inr(net) },
              { k: "Languages", v: t.languages.join(" · ") },
            ].map((s) => (
              <div key={s.k} className="bg-canvas px-6 py-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">
                  {s.k}
                </p>
                <p className="num mt-1.5 text-[16px] leading-none text-ink">{s.v}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── About ───────────────────────────────────────────────────── */}
        <section id="about" className="scroll-mt-24 pt-16 sm:pt-20">
          <div className="grid gap-10 rounded-[30px] border border-white/60 bg-canvas/92 p-6 shadow-[0_40px_100px_-80px_rgba(15,61,46,0.8)] backdrop-blur sm:p-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-14">
            <div>
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[#157a4d]">
                About the practice
              </p>
              <h2 className="display-serif mt-4 text-[clamp(2rem,4vw,2.9rem)] text-ink">
                Care that helps
                <br />
                you heal.
              </h2>
              <p className="mt-5 max-w-[46ch] text-[14px] leading-[1.7] text-[#5f6d66]">{t.bio}</p>

              <div className="mt-6 flex flex-wrap gap-2">
                {t.specialisations.map((s) => (
                  <span
                    key={s}
                    className="rounded-full border border-line bg-white px-3 py-1.5 text-[11.5px] font-medium text-ink-2"
                  >
                    {s}
                  </span>
                ))}
              </div>

              <dl className="mt-8 grid grid-cols-3 gap-4 border-t border-line pt-6">
                {[
                  { k: "In practice", v: `${t.experienceYears} yrs` },
                  { k: "Session", v: `${t.sessionDuration} min` },
                  { k: "Format", v: "Online · In-person" },
                ].map((row) => (
                  <div key={row.k}>
                    <dt className="text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-3">
                      {row.k}
                    </dt>
                    <dd className="num mt-1 text-[13px] text-ink">{row.v}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="relative">
              <div className="overflow-hidden rounded-[24px] bg-[#cfe0d5]">
                <img
                  src={SERVICE_SHOTS[1]}
                  alt="A session in progress"
                  loading="lazy"
                  className="h-[300px] w-full object-cover saturate-[0.85] sm:h-[360px]"
                />
              </div>
              <div className="absolute -bottom-5 right-3 w-[200px] rounded-2xl border border-white/70 bg-white/95 p-3.5 shadow-[0_20px_50px_-28px_rgba(15,61,46,0.7)] backdrop-blur sm:right-5">
                <div className="flex items-center gap-1 text-[#e0a53a]">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Icon key={i} name="star" className="h-3 w-3 fill-current" strokeWidth={1.2} />
                  ))}
                  <span className="num ml-1 text-[11px] text-ink">4.9</span>
                </div>
                <p className="mt-1.5 text-[11px] leading-snug text-ink-2">
                  “She holds the hour properly.” — client, 14 months in care
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Services ────────────────────────────────────────────────── */}
        <section id="services" className="scroll-mt-24 pt-16 sm:pt-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[#157a4d]">
                Services
              </p>
              <h2 className="display-serif mt-3 text-[clamp(1.9rem,3.6vw,2.7rem)] text-ink">
                Ways to work together.
              </h2>
            </div>
            <p className="max-w-[34ch] text-[12.5px] leading-relaxed text-[#5f6d66]">
              Every format is priced up front, held in the same calendar, and can be drawn from a
              prepaid package.
            </p>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {state.services.map((service, i) => (
              <article
                key={service.id}
                className="group overflow-hidden rounded-[24px] border border-white/70 bg-canvas shadow-[0_30px_70px_-60px_rgba(15,61,46,0.8)] transition-transform duration-300 hover:-translate-y-1"
              >
                <div className="relative overflow-hidden bg-[#cfe0d5]">
                  <img
                    src={SERVICE_SHOTS[i % SERVICE_SHOTS.length]}
                    alt=""
                    loading="lazy"
                    className="h-[178px] w-full object-cover saturate-[0.85] transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                  <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[10.5px] font-semibold text-ink">
                    {service.format}
                  </span>
                </div>
                <div className="p-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">
                    {service.durationMin} minutes
                  </p>
                  <h3 className="mt-1.5 text-[15px] font-semibold leading-snug text-ink">
                    {service.name}
                  </h3>
                  <div className="mt-4 flex items-center justify-between border-t border-line pt-3.5">
                    <span className="num text-[15px] text-ink">{inr(service.price)}</span>
                    <a
                      href="#/public"
                      className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#157a4d] hover:gap-2.5"
                    >
                      Book
                      <Icon name="arrow" className="h-3.5 w-3.5" strokeWidth={2.1} />
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ── Console band ────────────────────────────────────────────── */}
        <section className="pt-16 sm:pt-20">
          <div className="grid gap-10 overflow-hidden rounded-[30px] bg-[#0f3d2e] p-6 shadow-[0_50px_110px_-70px_rgba(15,61,46,0.9)] sm:p-10 lg:grid-cols-[1fr_0.92fr] lg:gap-14">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[#cfe7d8]">
                For practitioners
              </span>
              <h2 className="display-serif mt-5 text-[clamp(1.9rem,3.6vw,2.7rem)] text-white">
                Everything else stays
                <br />
                in the room.
              </h2>
              <p className="mt-4 max-w-[42ch] text-[13.5px] leading-[1.7] text-[#c3d8cb]">
                Unfazed is the practice behind the page: one calendar, clinical notes with a
                visibility switch, prepaid packages, and a ledger that reconciles itself. Sign in
                and the whole practice is here.
              </p>

              <ul className="mt-7 space-y-3">
                {[
                  { icon: "calendar", text: "Slots generated from duration, buffer and working days" },
                  { icon: "note", text: "SOAP and DAP notes, private by default" },
                  { icon: "users", text: "Packages that draw down session by session" },
                  { icon: "bolt", text: "Razorpay settlements with the platform fee already applied" },
                ].map((row) => (
                  <li key={row.text} className="flex items-start gap-3">
                    <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/10 text-[#a9d3bb]">
                      <Icon name={row.icon} className="h-3.5 w-3.5" strokeWidth={1.9} />
                    </span>
                    <span className="text-[12.5px] leading-relaxed text-[#d6e6dc]">{row.text}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="#/login"
                  className="inline-flex h-11 items-center gap-2 rounded-full bg-white px-5 text-[12.5px] font-semibold text-[#0f3d2e] transition-colors hover:bg-[#eaf3ed]"
                >
                  Sign in to the console
                  <Icon name="arrow" className="h-3.5 w-3.5" strokeWidth={2.1} />
                </a>
                <a
                  href="#/public"
                  className="inline-flex h-11 items-center rounded-full border border-white/25 px-5 text-[12.5px] font-semibold text-white transition-colors hover:bg-white/10"
                >
                  Preview the booking page
                </a>
              </div>
            </div>

            {/* Mini console preview */}
            <div className="rounded-[24px] bg-white p-4 shadow-[0_30px_60px_-40px_rgba(0,0,0,0.7)] sm:p-5">
              <div className="flex items-baseline justify-between">
                <div>
                  <p className="text-[9.5px] font-semibold uppercase tracking-[0.14em] text-ink-3">
                    Today
                  </p>
                  <p className="mt-1 text-[13px] font-semibold text-ink">{dateLabel(today)}</p>
                </div>
                <span className="rounded-full bg-[#e7f2ea] px-2.5 py-1 text-[10px] font-semibold text-[#157a4d]">
                  {todays.length} booked
                </span>
              </div>

              <ul className="mt-4 divide-y divide-line">
                {todays.slice(0, 4).map((a) => {
                  const client = state.clients.find((c) => c.id === a.clientId);
                  const service = state.services.find((s) => s.id === a.serviceId);
                  return (
                    <li key={a.id} className="flex items-center gap-3 py-3">
                      <span className="num w-[52px] shrink-0 text-[11.5px] text-ink-3">
                        {timeLabel(a.time)}
                      </span>
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#eef4f0] text-[10px] font-bold text-[#157a4d]">
                        {(client?.name ?? "C")
                          .split(" ")
                          .slice(0, 2)
                          .map((p) => p[0])
                          .join("")}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[12px] font-semibold text-ink">
                          {client?.name ?? "Client"}
                        </span>
                        <span className="block truncate text-[10.5px] text-ink-3">
                          {service?.name ?? "Session"}
                        </span>
                      </span>
                      <span className="rounded-full bg-[#f4f1e8] px-2 py-1 text-[9.5px] font-semibold text-[#8a7428]">
                        {a.paymentMode === "PACKAGE" ? "Package" : "Paid"}
                      </span>
                    </li>
                  );
                })}
                {todays.length === 0 && (
                  <li className="py-6 text-[12px] text-ink-3">No sessions booked for today.</li>
                )}
              </ul>

              <div className="mt-3 flex items-center justify-between rounded-xl bg-[#f7f5ef] px-3 py-2.5">
                <span className="text-[10.5px] text-ink-3">Next session</span>
                <span className="num text-[11px] text-ink">
                  {next ? `${dateLabel(next.date)} · ${timeLabel(next.time)}` : "Open"}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Stories ─────────────────────────────────────────────────── */}
        <section className="pt-16 sm:pt-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[#157a4d]">
                In their words
              </p>
              <h2 className="display-serif mt-3 max-w-[18ch] text-[clamp(1.9rem,3.6vw,2.7rem)] text-ink">
                Stories that remind you you're not alone.
              </h2>
            </div>
            <div className="flex gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-full border border-white/70 bg-canvas/70 text-ink-3">
                <Icon name="arrow" className="h-3.5 w-3.5 rotate-180" strokeWidth={2} />
              </span>
              <span className="grid h-9 w-9 place-items-center rounded-full bg-[#0f3d2e] text-white">
                <Icon name="arrow" className="h-3.5 w-3.5" strokeWidth={2} />
              </span>
            </div>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {STORIES.map((s) => (
              <figure
                key={s.name}
                className="flex h-full flex-col rounded-[24px] border border-white/70 bg-canvas p-5 shadow-[0_30px_70px_-60px_rgba(15,61,46,0.8)]"
              >
                <span className="font-serif text-[34px] leading-none text-[#12a05e]">“</span>
                <blockquote className="mt-1 flex-1 text-[13px] leading-[1.7] text-[#4f5f57]">
                  {s.quote}
                </blockquote>
                <figcaption className="mt-5 flex items-center gap-2.5 border-t border-line pt-4">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-[#e7f2ea] text-[10px] font-bold text-[#157a4d]">
                    {s.name.slice(0, 1)}
                  </span>
                  <span>
                    <span className="block text-[12px] font-semibold text-ink">{s.name}</span>
                    <span className="block text-[10.5px] text-ink-3">{s.meta}</span>
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        {/* ── Pricing ─────────────────────────────────────────────────── */}
        <section id="pricing" className="scroll-mt-24 pt-16 sm:pt-20">
          <div className="rounded-[30px] border border-white/60 bg-canvas/92 p-6 shadow-[0_40px_100px_-80px_rgba(15,61,46,0.8)] backdrop-blur sm:p-10">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[#157a4d]">
                  For practitioners
                </p>
                <h2 className="display-serif mt-3 text-[clamp(1.9rem,3.6vw,2.7rem)] text-ink">
                  Priced by caseload, not by seat.
                </h2>
              </div>
              <p className="max-w-[36ch] text-[12.5px] leading-relaxed text-[#5f6d66]">
                One gate — <code className="font-medium text-ink">canAccess(tier, feature)</code> —
                decides every locked surface, so a plan boundary is a function, not twelve
                conditionals.
              </p>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {Object.values(state.tiers).map((tier) => {
                const current = tier.key === t.tier;
                return (
                  <div
                    key={tier.key}
                    className={cx(
                      "flex flex-col rounded-[22px] border p-5",
                      current
                        ? "border-[#12a05e]/40 bg-white shadow-[0_24px_60px_-46px_rgba(18,160,94,0.9)]"
                        : "border-line bg-white/70",
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-[14px] font-semibold text-ink">{tier.name}</h3>
                      {current && (
                        <span className="rounded-full bg-[#e7f2ea] px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.08em] text-[#157a4d]">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="num mt-3 text-[26px] leading-none text-ink">
                      {tier.priceMonthly === 0 ? "Free" : inr(tier.priceMonthly)}
                      {tier.priceMonthly > 0 && (
                        <span className="text-[11px] font-normal text-ink-3">/mo</span>
                      )}
                    </p>
                    <p className="mt-2 text-[12px] leading-relaxed text-ink-2">{tier.blurb}</p>
                    <ul className="mt-4 flex-1 space-y-2 border-t border-line pt-4 text-[12px] text-ink-2">
                      <li className="flex items-center gap-2">
                        <Icon name="check" className="h-3.5 w-3.5 text-[#12a05e]" strokeWidth={2.2} />
                        {tier.clientCap ? `${tier.clientCap} active clients` : "Unlimited clients"}
                      </li>
                      <li className="flex items-center gap-2">
                        <Icon name="check" className="h-3.5 w-3.5 text-[#12a05e]" strokeWidth={2.2} />
                        {tier.templates.length} note templates
                      </li>
                      <li className="flex items-center gap-2">
                        <Icon name="check" className="h-3.5 w-3.5 text-[#12a05e]" strokeWidth={2.2} />
                        {tier.features.length} modules unlocked
                      </li>
                    </ul>
                    <a
                      href="#/login"
                      className={cx(
                        "mt-5 inline-flex h-10 items-center justify-center rounded-full text-[12px] font-semibold transition-colors",
                        current
                          ? "bg-[#12a05e] text-white hover:bg-[#0e8c52]"
                          : "border border-line text-ink hover:bg-[#f4f2ec]",
                      )}
                    >
                      {current ? "Open the console" : "Choose this plan"}
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── FAQ ─────────────────────────────────────────────────────── */}
        <section className="pt-16 sm:pt-20">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[#157a4d]">
                Frequently asked
              </p>
              <h2 className="display-serif mt-3 text-[clamp(1.9rem,3.6vw,2.6rem)] text-ink">
                Questions before
                <br />
                the first hour.
              </h2>
              <p className="mt-4 max-w-[32ch] text-[12.5px] leading-relaxed text-[#5f6d66]">
                Still unsure? Write to the practice and you'll get a reply from a person, not a
                form.
              </p>
            </div>

            <div className="rounded-[24px] border border-white/70 bg-canvas px-5 py-2 shadow-[0_30px_70px_-60px_rgba(15,61,46,0.8)] sm:px-6">
              {FAQ.map((item) => (
                <details key={item.q} className="group border-b border-line py-4 last:border-0">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[13px] font-medium text-ink [&::-webkit-details-marker]:hidden">
                    {item.q}
                    <Icon
                      name="cross"
                      className="h-4 w-4 shrink-0 text-ink-3 transition-transform duration-200 group-open:rotate-45"
                      strokeWidth={2}
                    />
                  </summary>
                  <p className="mt-2 max-w-[62ch] text-[12.5px] leading-[1.7] text-[#5f6d66]">
                    {item.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ── Closing ─────────────────────────────────────────────────── */}
        <section className="pt-16 sm:pt-20">
          <div className="relative overflow-hidden rounded-[30px] bg-[#d9e8de] p-7 sm:p-12">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-16 -top-24 h-[320px] w-[320px] rounded-full border border-white/60 opacity-60"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-28 -left-16 h-[360px] w-[360px] rounded-full bg-[#bfd7c8]/60 blur-3xl"
            />
            <div className="relative grid items-center gap-8 lg:grid-cols-[1.2fr_auto]">
              <div>
                <p className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[#157a4d]">
                  Start here
                </p>
                <h2 className="display-serif mt-3 max-w-[20ch] text-[clamp(2rem,4vw,2.9rem)] text-ink">
                  Let's start with a conversation.
                </h2>
                <p className="mt-3 max-w-[46ch] text-[13px] leading-relaxed text-[#4f5f57]">
                  Book a first session, or sign in to the practice console if you're already running
                  your caseload on Unfazed.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <a
                  href="#/public"
                  className="inline-flex h-12 items-center gap-2 rounded-full bg-[#0f3d2e] px-6 text-[13px] font-semibold text-white transition-colors hover:bg-[#14503c]"
                >
                  Book a session
                  <Icon name="arrow" className="h-4 w-4" strokeWidth={2} />
                </a>
                <a
                  href="#/login"
                  className="inline-flex h-12 items-center rounded-full border border-[#0f3d2e]/20 bg-white/70 px-6 text-[13px] font-semibold text-[#0f3d2e] transition-colors hover:bg-white"
                >
                  Sign in
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
