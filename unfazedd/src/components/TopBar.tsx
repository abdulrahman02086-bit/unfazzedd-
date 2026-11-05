import { initialsOf, signOut, useSession } from "../lib/auth";
import { Logo } from "./Brand";
import { Icon, cx } from "./ui";

const NAV = [
  { label: "Home", target: "top" },
  { label: "About", target: "about" },
  { label: "Services", target: "services" },
  { label: "Pricing", target: "pricing" },
];

const onLanding = () => {
  const hash = window.location.hash.replace(/^#\/?/, "");
  return hash === "" || hash === "home";
};

const jump = (target: string) => {
  window.scrollTo({ top: 0, behavior: "smooth" });
  if (!onLanding()) {
    window.location.hash = "";
    window.setTimeout(() => scrollTo(target), 80);
    return;
  }
  scrollTo(target);
};

const scrollTo = (target: string) => {
  if (target === "top") {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }
  document.getElementById(target)?.scrollIntoView({ behavior: "smooth", block: "start" });
};

export function TopBar({ active }: { active: string }) {
  const session = useSession();
  const signedIn = Boolean(session);

  return (
    <div className="sticky top-0 z-40 px-3 pb-1 pt-3 sm:px-5">
      <header className="mx-auto flex h-[64px] max-w-[1240px] items-center gap-3 rounded-full border border-white/70 bg-white/80 px-3 shadow-[0_18px_50px_-32px_rgba(15,61,46,0.55)] backdrop-blur-xl sm:gap-6 sm:px-5">
        <a href="#/" aria-label="Unfazed home" className="shrink-0">
          <Logo />
        </a>

        <nav aria-label="Primary" className="hidden flex-1 items-center justify-center gap-1 md:flex">
          {NAV.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => jump(item.target)}
              className={cx(
                "rounded-full px-3.5 py-2 text-[13px] transition-colors",
                item.target === "top" && active === "landing"
                  ? "font-semibold text-ink"
                  : "font-medium text-ink-2 hover:bg-white hover:text-ink",
              )}
            >
              {item.label}
            </button>
          ))}
          <a
            href="#/console"
            className={cx(
              "rounded-full px-3.5 py-2 text-[13px] transition-colors",
              active === "console" ? "bg-[#e8f2ec] font-semibold text-[#157a4d]" : "font-medium text-ink-2 hover:bg-white hover:text-ink",
            )}
          >
            Console
          </a>
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          {signedIn ? (
            <>
              <a
                href="#/console"
                className="hidden items-center gap-2 rounded-full border border-line bg-white px-2 py-1.5 pr-3 sm:inline-flex"
                title={session?.email}
              >
                <span className="grid h-7 w-7 place-items-center rounded-full bg-[#e8f2ec] text-[10.5px] font-bold text-[#157a4d]">
                  {initialsOf(session?.name ?? "")}
                </span>
                <span className="leading-tight">
                  <span className="block text-[11.5px] font-semibold text-ink">
                    {session?.name}
                  </span>
                  <span className="block text-[10px] text-ink-3">
                    {session?.role === "CLIENT" ? "Client" : "Practitioner"}
                  </span>
                </span>
              </a>
              <button
                type="button"
                onClick={() => {
                  signOut();
                  window.location.hash = "";
                }}
                className="hidden rounded-full px-2.5 py-2 text-[12px] font-medium text-ink-3 transition-colors hover:text-ink lg:block"
              >
                Sign out
              </button>
            </>
          ) : (
            <a
              href="#/login"
              className="rounded-full px-3 py-2 text-[12.5px] font-semibold text-ink-2 transition-colors hover:bg-white hover:text-ink"
            >
              Sign in
            </a>
          )}

          <a
            href="#/public"
            className="inline-flex h-10 items-center gap-2 rounded-full bg-[#12a05e] px-4 text-[12.5px] font-semibold text-white shadow-[0_12px_26px_-14px_rgba(18,160,94,0.95)] transition-colors hover:bg-[#0e8c52]"
          >
            <span className="hidden sm:inline">Book a Session</span>
            <span className="sm:hidden">Book</span>
            <Icon name="arrow" className="h-3.5 w-3.5" strokeWidth={2.1} />
          </a>
        </div>
      </header>
    </div>
  );
}
