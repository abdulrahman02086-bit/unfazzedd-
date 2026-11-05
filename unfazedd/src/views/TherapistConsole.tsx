import { useState } from "react";
import { Badge, cx } from "../components/ui";
import { activeClients, tierOf } from "../lib/entitlements";
import { inr } from "../lib/format";
import { useStore } from "../lib/store";
import { BillingTab } from "./console/Billing";
import { ClientsTab } from "./console/Clients";
import { MessagesTab } from "./console/Messages";
import { NotesTab } from "./console/Notes";
import { OverviewTab } from "./console/Overview";
import { PlanTab } from "./console/Plan";
import { ProfileTab } from "./console/Profile";
import { ScheduleTab } from "./console/Schedule";

const TABS = [
  { key: "overview", code: "A", label: "Overview", el: OverviewTab },
  { key: "profile", code: "B", label: "Profile & services", el: ProfileTab },
  { key: "plan", code: "C", label: "Plan & entitlements", el: PlanTab },
  { key: "clients", code: "D", label: "Clients", el: ClientsTab },
  { key: "schedule", code: "E", label: "Schedule", el: ScheduleTab },
  { key: "notes", code: "F", label: "Clinical notes", el: NotesTab },
  { key: "billing", code: "G", label: "Billing", el: BillingTab },
  { key: "messages", code: "H", label: "Care chat", el: MessagesTab },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export function TherapistConsole() {
  const { state } = useStore();
  const [tab, setTab] = useState<TabKey>("overview");
  const tier = tierOf(state);
  const Active = TABS.find((t) => t.key === tab)?.el ?? OverviewTab;

  return (
    <div className="mx-auto max-w-[1180px] px-4 sm:px-6">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-rule py-6">
        <div>
          <p className="label text-ink-3">Practice console</p>
          <h1 className="display mt-1.5 text-[clamp(1.7rem,3.4vw,2.3rem)] text-ink">
            {state.therapist.name}
          </h1>
          <p className="mt-1 text-[12px] text-ink-2">
            {tier.name} tier · {activeClients(state).length}
            {tier.clientCap ? `/${tier.clientCap}` : ""} active clients ·{" "}
            {inr(tier.priceMonthly)}/month
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="#/public"
            className="num rounded-full border border-rule-strong px-3 py-1.5 text-[12px] text-ink hover:bg-paper-2"
          >
            unfazed.in/{state.therapist.slug}
          </a>
          <Badge tone="pine">{tier.name}</Badge>
        </div>
      </header>

      <div className="grid gap-8 py-6 lg:grid-cols-[168px_1fr]">
        <nav aria-label="Console sections" className="lg:sticky lg:top-20 lg:self-start">
          <ul className="flex gap-1 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
            {TABS.map((t) => {
              const active = t.key === tab;
              return (
                <li key={t.key} className="shrink-0">
                  <button
                    onClick={() => setTab(t.key)}
                    className={cx(
                      "flex w-full items-center gap-2.5 whitespace-nowrap rounded-full px-3 py-2 text-left text-[12.5px] transition-colors",
                      active
                        ? "bg-mint font-bold text-pine"
                        : "font-medium text-ink-2 hover:bg-paper-2 hover:text-ink",
                    )}
                  >
                    <span className={cx("num text-[10px]", active ? "text-paper/60" : "text-ink-3")}>
                      {t.code}
                    </span>
                    {t.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div key={tab} className="rise min-w-0">
          <Active />
        </div>
      </div>
    </div>
  );
}
