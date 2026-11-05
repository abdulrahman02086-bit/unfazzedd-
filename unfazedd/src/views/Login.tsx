import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { HeadGlyph, Logo, SageBackdrop } from "../components/Brand";
import { Icon, cx } from "../components/ui";
import {
  DEMO_ACCOUNTS,
  ROLE_LABEL,
  rememberedEmail,
  rememberEmail,
  signIn,
  signOut,
  useSession,
} from "../lib/auth";
import type { SessionRole } from "../lib/auth";
import { useStore } from "../lib/store";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const HIGHLIGHTS = [
  "Today's schedule, live from the same calendar clients book from",
  "Clinical notes that stay private until you deliberately share one",
  "Packages, invoices and settlements in a single ledger",
];

export function Login({ intent }: { intent?: "console" | "portal" }) {
  const { state, notify } = useStore();
  const session = useSession();
  const [role, setRole] = useState<SessionRole>(
    intent === "portal" ? "CLIENT" : "PRACTITIONER",
  );
  const [email, setEmail] = useState(() => rememberedEmail());
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(() => Boolean(rememberedEmail()));
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const destination = (nextRole: SessionRole) =>
    intent ? (intent === "console" ? "#/console" : "#/portal") : nextRole === "CLIENT" ? "#/portal" : "#/console";

  useEffect(() => {
    document.title = "Sign in · Unfazed";
    return () => {
      document.title = "Unfazed — Practice OS for therapists";
    };
  }, []);

  const complete = (nextRole: SessionRole, name: string, nextEmail: string) => {
    signIn({ role: nextRole, name, email: nextEmail });
    if (remember) rememberEmail(nextEmail);
    else rememberEmail(null);
    setBusy(true);
    notify(`Signed in as ${name}.`);
    window.setTimeout(() => {
      window.location.hash = destination(nextRole);
      window.scrollTo({ top: 0 });
    }, 260);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const clean = email.trim().toLowerCase();

    if (!EMAIL_RE.test(clean)) {
      setError("Enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Passwords are at least 6 characters.");
      return;
    }

    const account = DEMO_ACCOUNTS[role];
    if (clean !== account.email || password !== account.password) {
      const other = role === "PRACTITIONER" ? DEMO_ACCOUNTS.CLIENT : DEMO_ACCOUNTS.PRACTITIONER;
      setError(
        clean === other.email
          ? `That email belongs to a ${ROLE_LABEL[other.role].toLowerCase()} account — switch the tab above.`
          : "Those details don't match this practice. Use the demo account shown below.",
      );
      return;
    }

    complete(role, account.name, clean);
  };

  const useDemo = () => {
    const account = DEMO_ACCOUNTS[role];
    setEmail(account.email);
    setPassword(account.password);
    setError(null);
    complete(account.role, account.name, account.email);
  };

  const fillOnly = (next: SessionRole) => {
    const account = DEMO_ACCOUNTS[next];
    setRole(next);
    setEmail(account.email);
    setPassword(account.password);
    setError(null);
  };

  return (
    <div className="relative isolate px-3 pb-16 pt-4 sm:px-5 sm:pt-6">
      <SageBackdrop />

      <div className="mx-auto max-w-[1060px]">
        {intent && !session && (
          <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/80 px-3.5 py-1.5 text-[11.5px] font-medium text-[#157a4d] shadow-[0_10px_30px_-24px_rgba(15,61,46,0.8)] backdrop-blur">
            <Icon name="lock" className="h-3.5 w-3.5" strokeWidth={1.9} />
            {intent === "console"
              ? "Sign in to open the practice console."
              : "Sign in to open the client portal."}
          </p>
        )}

        <div className="grid overflow-hidden rounded-[30px] border border-white/70 bg-canvas shadow-[0_60px_150px_-80px_rgba(15,61,46,0.85)] lg:grid-cols-[0.9fr_1.1fr]">
          {/* ── Brand panel ─────────────────────────────────────────── */}
          <aside className="relative hidden overflow-hidden bg-[#0f3d2e] p-9 lg:flex lg:flex-col">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-24 -top-20 h-[300px] w-[300px] rounded-full border border-white/10"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-24 -left-20 h-[360px] w-[360px] rounded-full border border-white/[0.08]"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-16 right-2 text-white/[0.07]"
            >
              <HeadGlyph className="h-[280px] w-[280px]" strokeWidth={4} />
            </div>

            <Logo tone="white" className="relative" />

            <div className="relative mt-auto pt-16">
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[#9fc7b2]">
                The practice, held quietly
              </p>
              <h2 className="display-serif mt-4 text-[clamp(1.8rem,2.6vw,2.35rem)] text-white">
                Good to see you
                <br />
                again.
              </h2>
              <p className="mt-3 max-w-[34ch] text-[12.5px] leading-[1.7] text-[#bfd6c8]">
                {state.therapist.name} · {state.therapist.title.split("·")[0].trim()}
              </p>

              <ul className="mt-7 space-y-3.5">
                {HIGHLIGHTS.map((line) => (
                  <li key={line} className="flex items-start gap-2.5">
                    <span className="mt-[3px] grid h-4 w-4 shrink-0 place-items-center rounded-full bg-white/10 text-[#a9d3bb]">
                      <Icon name="check" className="h-2.5 w-2.5" strokeWidth={2.6} />
                    </span>
                    <span className="text-[12px] leading-relaxed text-[#d3e4da]">{line}</span>
                  </li>
                ))}
              </ul>

              <figure className="mt-9 rounded-2xl bg-white/[0.06] p-4 ring-1 ring-inset ring-white/10">
                <blockquote className="text-[12px] leading-relaxed text-[#dceade]">
                  “The room is ready before I am. That has made the difference for eighteen months.”
                </blockquote>
                <figcaption className="mt-2 text-[10.5px] text-[#9fc7b2]">
                  Client, weekly sessions
                </figcaption>
              </figure>
            </div>
          </aside>

          {/* ── Form ────────────────────────────────────────────────── */}
          <div className="p-6 sm:p-10">
            <div className="flex items-center justify-between">
              <span className="lg:hidden">
                <Logo />
              </span>
              <a
                href="#/"
                className="ml-auto inline-flex items-center gap-1.5 text-[11.5px] font-medium text-ink-3 transition-colors hover:text-ink"
              >
                <Icon name="arrow" className="h-3.5 w-3.5 rotate-180" strokeWidth={2} />
                Back to site
              </a>
            </div>

            {session && (
              <div className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl border border-[#12a05e]/25 bg-[#eef6f1] px-4 py-3">
                <span className="flex-1 text-[12px] text-ink">
                  Already signed in as <strong className="font-semibold">{session.name}</strong>.
                </span>
                <a
                  href={session.role === "CLIENT" ? "#/portal" : "#/console"}
                  className="rounded-full bg-[#0f3d2e] px-3 py-1.5 text-[11px] font-semibold text-white"
                >
                  Continue
                </a>
                <button
                  type="button"
                  onClick={() => signOut()}
                  className="rounded-full border border-line px-3 py-1.5 text-[11px] font-semibold text-ink-2"
                >
                  Sign out
                </button>
              </div>
            )}

            <h1 className="display-serif mt-6 text-[clamp(2rem,3.4vw,2.6rem)] text-ink">Welcome back.</h1>
            <p className="mt-2 text-[12.5px] leading-relaxed text-[#5f6d66]">
              Sign in to your practice. Sessions are held on this device for the demo — no password
              ever leaves the browser.
            </p>

            {/* Role switch */}
            <div
              role="tablist"
              aria-label="Account type"
              className="mt-6 grid grid-cols-2 gap-1 rounded-full border border-line bg-[#f4f2ec] p-1"
            >
              {(["PRACTITIONER", "CLIENT"] as SessionRole[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  role="tab"
                  aria-selected={role === r}
                  onClick={() => {
                    setRole(r);
                    setError(null);
                  }}
                  className={cx(
                    "h-9 rounded-full text-[12px] font-semibold transition-colors",
                    role === r ? "bg-white text-ink shadow-[0_6px_16px_-12px_rgba(15,61,46,0.9)]" : "text-ink-3 hover:text-ink",
                  )}
                >
                  {ROLE_LABEL[r]}
                </button>
              ))}
            </div>

            <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
              <div className="block">
                <label
                  htmlFor="login-email"
                  className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-ink-3"
                >
                  Email
                </label>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={role === "CLIENT" ? "you@example.com" : "you@practice.in"}
                  className="mt-1.5 h-12 w-full rounded-2xl border border-line bg-white px-4 text-[13px] text-ink placeholder:text-ink-3/70 focus:border-[#12a05e] focus:outline-none focus:ring-4 focus:ring-[#12a05e]/12"
                />
              </div>

              <div className="block">
                <span className="flex items-baseline justify-between">
                  <label
                    htmlFor="login-password"
                    className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-ink-3"
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      notify(
                        "A reset link would be emailed by the practice. In this demo, use the credentials below.",
                      )
                    }
                    className="text-[11px] font-medium text-[#157a4d] hover:underline"
                  >
                    Forgot?
                  </button>
                </span>
                <span className="relative mt-1.5 block">
                  <input
                    id="login-password"
                    type={show ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-12 w-full rounded-2xl border border-line bg-white px-4 pr-16 text-[13px] text-ink placeholder:text-ink-3/70 focus:border-[#12a05e] focus:outline-none focus:ring-4 focus:ring-[#12a05e]/12"
                  />
                  <button
                    type="button"
                    onClick={() => setShow((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full px-2.5 py-1 text-[11px] font-semibold text-ink-3 hover:bg-[#f4f2ec] hover:text-ink"
                  >
                    {show ? "Hide" : "Show"}
                  </button>
                </span>
              </div>

              <label className="flex cursor-pointer items-center gap-2.5 text-[12px] text-ink-2">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-line accent-[#12a05e]"
                />
                Keep me signed in on this device
              </label>

              {error && (
                <p
                  role="alert"
                  className="rounded-xl border border-[#b8443a]/20 bg-[#fbeceb] px-3 py-2 text-[11.5px] leading-snug text-[#a53c33]"
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={busy}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#12a05e] text-[13px] font-semibold text-white shadow-[0_18px_36px_-20px_rgba(18,160,94,1)] transition-colors hover:bg-[#0e8c52] disabled:opacity-70"
              >
                {busy ? "Opening your practice…" : "Sign in"}
                {!busy && <Icon name="arrow" className="h-4 w-4" strokeWidth={2} />}
              </button>
            </form>

            <div className="my-6 flex items-center gap-3">
              <span className="h-px flex-1 bg-line" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-3">or</span>
              <span className="h-px flex-1 bg-line" />
            </div>

            <button
              type="button"
              onClick={useDemo}
              disabled={busy}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-line bg-white text-[12.5px] font-semibold text-ink transition-colors hover:bg-[#f6f4ee] disabled:opacity-70"
            >
              <Icon name="bolt" className="h-3.5 w-3.5 text-[#12a05e]" strokeWidth={2} />
              Continue with demo {ROLE_LABEL[role].toLowerCase()} access
            </button>

            <div className="mt-5 rounded-2xl border border-line bg-[#f4f2ec] p-3.5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-3">
                Demo credentials
              </p>
              <div className="mt-2 space-y-2">
                {(["PRACTITIONER", "CLIENT"] as SessionRole[]).map((r) => {
                  const account = DEMO_ACCOUNTS[r];
                  const active = role === r;
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => fillOnly(r)}
                      className={cx(
                        "flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-colors",
                        active ? "bg-white shadow-[0_8px_20px_-18px_rgba(15,61,46,0.9)]" : "hover:bg-white/70",
                      )}
                    >
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#e7f2ea] text-[9.5px] font-bold uppercase text-[#157a4d]">
                        {ROLE_LABEL[r].slice(0, 2)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[11.5px] font-semibold text-ink">
                          {account.email}
                        </span>
                        <span className="block text-[10px] text-ink-3">
                          {account.password} · {account.note}
                        </span>
                      </span>
                      {active && (
                        <span className="shrink-0 text-[9.5px] font-bold uppercase tracking-[0.08em] text-[#157a4d]">
                          selected
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <p className="mt-5 text-center text-[11.5px] text-ink-3">
              New here?{" "}
              <a href="#/public" className="font-semibold text-[#157a4d] hover:underline">
                Book your first session
              </a>{" "}
              · {" "}
              <a href="#/" className="font-semibold text-[#157a4d] hover:underline">
                Read about the practice
              </a>
            </p>
          </div>
        </div>

        <p className="mt-4 text-center text-[10.5px] leading-relaxed text-[#3f5a4b]/80">
          Protected area. Records are synthetic and stored locally for this demonstration build.
          In an emergency, call Tele-MANAS on 14416.
        </p>
      </div>
    </div>
  );
}
