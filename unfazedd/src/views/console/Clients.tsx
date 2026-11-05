import { useMemo, useState } from "react";
import { Badge, Button, Field, Input, Note, Panel, cx } from "../../components/ui";
import { activeClients, canAccess } from "../../lib/entitlements";
import { dateLabel, inr, todayISO } from "../../lib/format";
import { useStore } from "../../lib/store";

export function ClientsTab() {
  const { state, update, notify } = useStore();
  const [q, setQ] = useState("");
  const [form, setForm] = useState({ name: "", email: "", phone: "", tags: "" });
  const [showArchived, setShowArchived] = useState(false);

  const cap = canAccess(state, "CLIENT_CAP");

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return state.clients
      .filter((c) => (showArchived ? true : !c.archived))
      .filter((c) =>
        !needle
          ? true
          : [c.name, c.email, c.phone, c.tags.join(" ")].join(" ").toLowerCase().includes(needle),
      );
  }, [state.clients, q, showArchived]);

  const add = () => {
    if (form.name.trim().length < 2) {
      notify("A client needs a name.", "warn");
      return;
    }
    if (!cap.allowed) {
      notify(cap.reason, "warn");
      return;
    }
    update((s) => {
      s.clients.push({
        id: `cli-${Date.now()}`,
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        since: todayISO(),
        archived: false,
      });
      return s;
    });
    notify(`${form.name.trim()} added to the caseload.`);
    setForm({ name: "", email: "", phone: "", tags: "" });
  };

  return (
    <div className="space-y-5">
      <Panel
        label="Caseload"
        title={`${activeClients(state).length} active${cap.limit ? ` of ${cap.limit}` : ""}`}
        action={
          <div className="flex items-center gap-2">
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search name, tag, phone"
              aria-label="Search clients"
              className="h-7 w-48 py-1 text-[12px]"
            />
            <Button size="sm" variant="ghost" onClick={() => setShowArchived((v) => !v)}>
              {showArchived ? "Hide archived" : "Show archived"}
            </Button>
          </div>
        }
      >
        {rows.length === 0 ? (
          <p className="py-6 text-center text-[12.5px] text-ink-3">No matching records.</p>
        ) : (
          <div className="-mx-4 overflow-x-auto">
            <table className="w-full min-w-[620px] text-left">
              <thead>
                <tr className="border-y border-rule">
                  {["Client", "Tags", "Since", "Next", "Credits", ""].map((h) => (
                    <th key={h} className="label px-3 py-2 text-ink-3 first:pl-4 last:pr-4">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((c) => {
                  const next = state.appointments
                    .filter((a) => a.clientId === c.id && a.status === "CONFIRMED" && a.date >= todayISO())
                    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))[0];
                  const credits = state.purchases
                    .filter((p) => p.clientId === c.id)
                    .reduce((n, p) => n + (p.sessionsTotal - p.sessionsUsed), 0);
                  return (
                    <tr key={c.id} className={cx("border-b border-rule align-top", c.archived && "opacity-55")}>
                      <td className="py-2.5 pl-4 pr-3">
                        <p className="text-[13px] font-medium text-ink">{c.name}</p>
                        <p className="text-[11px] text-ink-3">{c.email || c.phone || "No contact"}</p>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex flex-wrap gap-1">
                          {c.tags.slice(0, 3).map((t) => (
                            <Badge key={t}>{t}</Badge>
                          ))}
                        </div>
                      </td>
                      <td className="num px-3 py-2.5 text-[11.5px] text-ink-2">{c.since}</td>
                      <td className="px-3 py-2.5 text-[11.5px] text-ink-2">
                        {next ? `${dateLabel(next.date)} · ${next.time}` : <span className="text-ink-3">—</span>}
                      </td>
                      <td className="num px-3 py-2.5 text-[11.5px] text-ink">
                        {credits > 0 ? `${credits} left` : <span className="text-ink-3">—</span>}
                      </td>
                      <td className="py-2.5 pl-3 pr-4 text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            update((s) => {
                              const target = s.clients.find((x) => x.id === c.id);
                              if (target) target.archived = !target.archived;
                              return s;
                            });
                            notify(c.archived ? `${c.name} restored.` : `${c.name} archived.`);
                          }}
                        >
                          {c.archived ? "Restore" : "Archive"}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <Panel label="New record" title="Add a client by hand">
        {!cap.allowed ? (
          <Note tone="warn">{cap.reason}</Note>
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-4">
              <Field label="Name">
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </Field>
              <Field label="Email">
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </Field>
              <Field label="Phone">
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </Field>
              <Field label="Tags" hint="Comma separated.">
                <Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
              </Field>
            </div>
            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="text-[11.5px] text-ink-3">
                {cap.limit === null
                  ? "This plan has no client ceiling."
                  : `${Math.max(0, (cap.limit ?? 0) - (cap.used ?? 0))} seats remaining on ${state.therapist.tier}.`}
              </p>
              <Button variant="solid" onClick={add}>
                Add client
              </Button>
            </div>
          </>
        )}
      </Panel>

      <Panel label="Package ledger" title="Prepaid sessions by client">
        {state.purchases.length === 0 ? (
          <p className="text-[12.5px] text-ink-3">No packages sold yet.</p>
        ) : (
          <ul className="divide-y divide-rule">
            {state.purchases.map((p) => {
              const client = state.clients.find((c) => c.id === p.clientId);
              const bundle = state.bundles.find((b) => b.id === p.bundleId);
              const left = p.sessionsTotal - p.sessionsUsed;
              return (
                <li key={p.id} className="flex flex-wrap items-baseline justify-between gap-2 py-2.5 first:pt-0 last:pb-0">
                  <div>
                    <p className="text-[12.5px] font-medium text-ink">{client?.name ?? "Client"}</p>
                    <p className="text-[11px] text-ink-3">
                      {bundle?.name ?? "Bundle"} · paid {inr(p.paid)} · purchased {p.purchasedAt}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-24 border border-rule bg-paper-2">
                      <div
                        className="h-full bg-pine"
                        style={{ width: `${(p.sessionsUsed / p.sessionsTotal) * 100}%` }}
                      />
                    </div>
                    <span className="num text-[11.5px] text-ink">
                      {p.sessionsUsed}/{p.sessionsTotal} used · {left} left
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>
    </div>
  );
}
