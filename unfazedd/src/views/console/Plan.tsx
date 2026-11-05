import { useState } from "react";
import { Badge, Button, Field, Input, Panel, cx } from "../../components/ui";
import { FEATURE_LABEL, activeClients, canAccess, tierOf } from "../../lib/entitlements";
import { inr } from "../../lib/format";
import { useStore } from "../../lib/store";
import type { FeatureKey, TemplateKey, Tier } from "../../lib/types";

const TEMPLATES: TemplateKey[] = ["FREEFORM", "SOAP", "DAP"];
const FEATURES: FeatureKey[] = [
  "BRANDED_PAGE",
  "SESSION_PACKAGES",
  "INVOICE_EXPORT",
  "CARE_CHAT",
  "ANALYTICS",
];

export function PlanTab() {
  const { state, update, notify } = useStore();
  const current = tierOf(state);
  const used = activeClients(state).length;
  const cap = current.clientCap;
  const pressure = cap ? Math.min(100, Math.round((used / cap) * 100)) : 0;

  const [capDraft, setCapDraft] = useState(cap === null ? "" : String(cap));

  const switchTier = (key: Tier) => {
    const next = state.tiers[key];
    if (next.clientCap !== null && used > next.clientCap) {
      notify(
        `Cannot move to ${next.name} with ${used} active clients — that tier caps at ${next.clientCap}. Archive records first.`,
        "warn",
      );
      return;
    }
    update((s) => {
      s.therapist.tier = key;
      return s;
    });
    setCapDraft(next.clientCap === null ? "" : String(next.clientCap));
    notify(`Plan changed to ${next.name}. Entitlements recalculated.`);
  };

  const toggle = (list: FeatureKey[], key: FeatureKey) =>
    list.includes(key) ? list.filter((f) => f !== key) : [...list, key];

  const toggleTemplate = (list: TemplateKey[], key: TemplateKey) =>
    list.includes(key) ? list.filter((t) => t !== key) : [...list, key];

  return (
    <div className="space-y-5">
      <Panel label="Current plan" title={`${current.name} · ${current.priceMonthly === 0 ? "free" : `${inr(current.priceMonthly)} per month`}`}>
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <p className="text-[12.5px] text-ink-2">{current.blurb}</p>
          <Badge tone="pine">{current.templates.length} note templates</Badge>
        </div>

        <div className="mt-4">
          <div className="flex items-baseline justify-between">
            <span className="label text-ink-3">Client cap</span>
            <span className="num text-[12px] text-ink">
              {used} / {cap === null ? "unlimited" : cap}
            </span>
          </div>
          <div className="mt-1.5 h-2 border border-rule bg-paper-2">
            <div
              className={cx("h-full", pressure > 85 ? "bg-signal" : "bg-pine")}
              style={{ width: `${cap === null ? 6 : Math.max(3, pressure)}%` }}
            />
          </div>
          <p className="mt-1.5 text-[11.5px] text-ink-3">
            {cap === null
              ? "No ceiling on active client records at this tier."
              : `${cap - used} seats free. New records are blocked at the cap, not silently accepted.`}
          </p>
        </div>
      </Panel>

      <div className="grid gap-px bg-rule md:grid-cols-3">
        {Object.values(state.tiers).map((t) => {
          const active = t.key === state.therapist.tier;
          return (
            <div key={t.key} className={cx("bg-paper px-4 py-4", active && "bg-pine-soft/60")}>
              <div className="flex items-baseline justify-between">
                <h3 className="text-[14px] font-medium text-ink">{t.name}</h3>
                {active && <Badge tone="pine">active</Badge>}
              </div>
              <p className="num mt-1 text-[18px] text-ink">
                {t.priceMonthly === 0 ? "Free" : inr(t.priceMonthly)}
                {t.priceMonthly !== 0 && <span className="text-[11px] text-ink-3">/mo</span>}
              </p>
              <p className="mt-2 min-h-[34px] text-[11.5px] leading-snug text-ink-2">{t.blurb}</p>
              <ul className="mt-3 space-y-1 text-[11.5px] text-ink-2">
                <li className="flex justify-between border-t border-rule pt-1.5">
                  <span>Clients</span>
                  <span className="num">{t.clientCap ?? "∞"}</span>
                </li>
                <li className="flex justify-between border-t border-rule pt-1.5">
                  <span>Templates</span>
                  <span className="num">{t.templates.length}</span>
                </li>
                <li className="flex justify-between border-t border-rule pt-1.5">
                  <span>Modules</span>
                  <span className="num">{t.features.length}</span>
                </li>
              </ul>
              <Button
                size="sm"
                variant={active ? "quiet" : "outline"}
                className="mt-3 w-full"
                disabled={active}
                onClick={() => switchTier(t.key)}
              >
                {active ? "Current plan" : `Move to ${t.name}`}
              </Button>
            </div>
          );
        })}
      </div>

      <Panel
        label="Plan admin"
        title={`Edit ${current.name} entitlements`}
        action={<Badge tone="warn">configurable</Badge>}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Monthly price (INR)">
            <Input
              type="number"
              min={0}
              step={100}
              value={current.priceMonthly}
              onChange={(e) =>
                update((s) => {
                  s.tiers[current.key].priceMonthly = Number(e.target.value);
                  return s;
                })
              }
            />
          </Field>
          <Field label="Active client cap" hint="Leave blank for unlimited.">
            <Input
              type="number"
              min={1}
              placeholder="unlimited"
              value={capDraft}
              onChange={(e) => {
                setCapDraft(e.target.value);
                const v = e.target.value.trim();
                update((s) => {
                  s.tiers[current.key].clientCap = v === "" ? null : Math.max(1, Number(v));
                  return s;
                });
              }}
            />
          </Field>
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <p className="label text-ink-3">Note templates</p>
            <div className="mt-2 space-y-1.5">
              {TEMPLATES.map((tpl) => {
                const on = current.templates.includes(tpl);
                return (
                  <label key={tpl} className="flex cursor-pointer items-center gap-2 text-[12.5px] text-ink">
                    <input
                      type="checkbox"
                      checked={on}
                      onChange={() =>
                        update((s) => {
                          s.tiers[current.key].templates = toggleTemplate(s.tiers[current.key].templates, tpl);
                          return s;
                        })
                      }
                      className="h-3.5 w-3.5 accent-[#1f4d3f]"
                    />
                    {tpl === "FREEFORM" ? "Freeform" : tpl}
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <p className="label text-ink-3">Modules</p>
            <div className="mt-2 space-y-1.5">
              {FEATURES.filter((f) => f !== "BRANDED_PAGE").map((f) => {
                const on = current.features.includes(f);
                return (
                  <label key={f} className="flex cursor-pointer items-center gap-2 text-[12.5px] text-ink">
                    <input
                      type="checkbox"
                      checked={on}
                      onChange={() =>
                        update((s) => {
                          s.tiers[current.key].features = toggle(s.tiers[current.key].features, f);
                          return s;
                        })
                      }
                      className="h-3.5 w-3.5 accent-[#1f4d3f]"
                    />
                    {FEATURE_LABEL[f]}
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        <p className="mt-4 border-t border-rule pt-3 text-[11.5px] leading-snug text-ink-3">
          Toggling a module takes effect everywhere at once — the nav still lists the tab, but the tab
          body asks <code className="font-mono">canAccess</code> before rendering anything privileged.
          Current answer for care chat:{" "}
          <span className="text-ink">{canAccess(state, "CARE_CHAT").allowed ? "allowed" : "blocked"}</span>.
        </p>
      </Panel>
    </div>
  );
}
