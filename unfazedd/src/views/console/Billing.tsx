import { useState } from "react";
import { Badge, Button, Field, Input, Locked, Panel, Stat } from "../../components/ui";
import { canAccess } from "../../lib/entitlements";
import { inr } from "../../lib/format";
import { downloadInvoice } from "../../lib/routing";
import { useStore } from "../../lib/store";

export function BillingTab() {
  const { state, update, notify } = useStore();
  const exportGate = canAccess(state, "INVOICE_EXPORT");
  const packageGate = canAccess(state, "SESSION_PACKAGES");

  const gross = state.invoices.reduce((n, i) => n + i.gross, 0);
  const fees = state.invoices.reduce((n, i) => n + i.fee, 0);
  const net = state.invoices.reduce((n, i) => n + i.net, 0);
  const creditsOut = state.purchases.reduce((n, p) => n + (p.sessionsTotal - p.sessionsUsed), 0);

  const [bundle, setBundle] = useState({ name: "", sessions: 6, price: 12000 });

  return (
    <div className="space-y-5">
      <section className="grid grid-cols-2 gap-y-4 border-y border-rule sm:grid-cols-4">
        <Stat label="Gross collected" value={inr(gross)} hint={`${state.invoices.length} receipts`} />
        <Stat label="Platform fee" value={inr(fees)} hint={`${state.platformFeePct}% of gross`} />
        <Stat label="Net settled" value={inr(net)} hint="Credited to practice" />
        <Stat label="Credits outstanding" value={creditsOut} hint="Sold but not delivered" />
      </section>

      <Panel
        label="Ledger"
        title="Receipts"
        action={<Badge tone="pine">Razorpay · test</Badge>}
      >
        {state.invoices.length === 0 ? (
          <p className="py-6 text-center text-[12.5px] text-ink-3">No receipts yet.</p>
        ) : (
          <div className="-mx-4 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left">
              <thead>
                <tr className="border-y border-rule">
                  {["Invoice", "Client", "Description", "Date", "Gross", "Fee", "Net", ""].map((h) => (
                    <th key={h} className="label px-3 py-2 text-ink-3 first:pl-4 last:pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {state.invoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-rule">
                    <td className="num py-2.5 pl-4 pr-3 text-[11.5px] text-ink">{inv.id}</td>
                    <td className="px-3 py-2.5 text-[12px] text-ink">{inv.clientName}</td>
                    <td className="px-3 py-2.5 text-[11.5px] text-ink-2">{inv.description}</td>
                    <td className="num px-3 py-2.5 text-[11.5px] text-ink-2">{inv.date}</td>
                    <td className="num px-3 py-2.5 text-[11.5px] text-ink">{inr(inv.gross)}</td>
                    <td className="num px-3 py-2.5 text-[11.5px] text-ink-3">−{inr(inv.fee)}</td>
                    <td className="num px-3 py-2.5 text-[11.5px] text-ink">{inr(inv.net)}</td>
                    <td className="py-2.5 pl-3 pr-4 text-right">
                      {exportGate.allowed ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            downloadInvoice(inv, state);
                            notify(`${inv.id} exported as a plain-text receipt.`);
                          }}
                        >
                          Export
                        </Button>
                      ) : (
                        <span className="label text-ink-3" title={exportGate.reason}>locked</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!exportGate.allowed && (
          <div className="mt-4">
            <Locked reason={exportGate.reason} />
          </div>
        )}
      </Panel>

      <Panel
        label="Packages"
        title="Sell a course of sessions"
        action={<Badge tone={packageGate.allowed ? "pine" : "warn"}>{packageGate.allowed ? "enabled" : "locked"}</Badge>}
      >
        {!packageGate.allowed ? (
          <Locked reason={packageGate.reason} />
        ) : (
          <>
            <ul className="divide-y divide-rule">
              {state.bundles.map((b) => (
                <li key={b.id} className="flex flex-wrap items-baseline justify-between gap-2 py-2.5 first:pt-0">
                  <div>
                    <p className="text-[12.5px] font-medium text-ink">{b.name}</p>
                    <p className="num text-[11px] text-ink-3">
                      {b.sessions} sessions · {inr(Math.round(b.price / b.sessions))} each · save {b.discountPct}%
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="num text-[12.5px] text-ink">{inr(b.price)}</span>
                    <button
                      className="text-[11px] text-ink-3 hover:text-signal"
                      onClick={() => {
                        update((s) => {
                          s.bundles = s.bundles.filter((x) => x.id !== b.id);
                          return s;
                        });
                        notify("Bundle withdrawn from the public page.");
                      }}
                    >
                      remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-4 grid gap-2 border-t border-rule pt-3 sm:grid-cols-[1fr_88px_112px_auto]">
              <Field label="Bundle name">
                <Input value={bundle.name} onChange={(e) => setBundle({ ...bundle, name: e.target.value })} placeholder="Care bundle · 8 sessions" />
              </Field>
              <Field label="Sessions">
                <Input
                  type="number"
                  min={2}
                  value={bundle.sessions}
                  onChange={(e) => setBundle({ ...bundle, sessions: Number(e.target.value) })}
                />
              </Field>
              <Field label="Price (INR)">
                <Input
                  type="number"
                  min={0}
                  step={100}
                  value={bundle.price}
                  onChange={(e) => setBundle({ ...bundle, price: Number(e.target.value) })}
                />
              </Field>
              <div className="flex items-end">
                <Button
                  variant="solid"
                  onClick={() => {
                    if (!bundle.name.trim()) {
                      notify("Name the bundle first.", "warn");
                      return;
                    }
                    const per = Math.max(1, state.services[0]?.price ?? 2000);
                    const full = per * bundle.sessions;
                    update((s) => {
                      s.bundles.push({
                        id: `bun-${Date.now()}`,
                        name: bundle.name.trim(),
                        sessions: bundle.sessions,
                        price: bundle.price,
                        discountPct: Math.max(0, Math.round(((full - bundle.price) / full) * 100)),
                      });
                      return s;
                    });
                    notify("Bundle published to the branded page.");
                    setBundle({ name: "", sessions: 6, price: 12000 });
                  }}
                >
                  Publish
                </Button>
              </div>
            </div>
          </>
        )}
      </Panel>
    </div>
  );
}
