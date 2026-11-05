import { useMemo, useState } from "react";
import { Badge, Button, Field, Input, Note, Panel, Select, Textarea, cx } from "../../components/ui";
import { canAccess } from "../../lib/entitlements";
import { templateSections } from "../../lib/data";
import { useStore } from "../../lib/store";
import type { Note as NoteModel, TemplateKey } from "../../lib/types";

const blankSections = (template: TemplateKey, prior?: NoteModel["sections"]) =>
  templateSections(template).map((label) => ({
    label,
    text: prior?.find((s) => s.label === label)?.text ?? "",
  }));

export function NotesTab() {
  const { state, update, notify } = useStore();
  const [template, setTemplate] = useState<TemplateKey>("SOAP");
  const [clientId, setClientId] = useState(state.clients[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [visibility, setVisibility] = useState<"PRIVATE" | "SHARED">("PRIVATE");
  const [sections, setSections] = useState(() => blankSections("SOAP"));
  const [filter, setFilter] = useState<"ALL" | "PRIVATE" | "SHARED">("ALL");

  const soap = canAccess(state, "SOAP_NOTES");
  const dap = canAccess(state, "DAP_NOTES");

  const templateBlocked = (t: TemplateKey) =>
    (t === "SOAP" && !soap.allowed) || (t === "DAP" && !dap.allowed);

  const shown = useMemo(
    () =>
      [...state.notes]
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .filter((n) => filter === "ALL" || n.visibility === filter),
    [state.notes, filter],
  );

  const pickTemplate = (t: TemplateKey) => {
    if (templateBlocked(t)) {
      notify(`${t} notes are not included in the ${state.therapist.tier} plan.`, "warn");
      return;
    }
    setTemplate(t);
    setSections((prev) => blankSections(t, prev));
  };

  const save = () => {
    if (templateBlocked(template)) {
      notify("This template is locked on your plan.", "warn");
      return;
    }
    if (!sections.some((s) => s.text.trim())) {
      notify("An empty note is not a note. Write something first.", "warn");
      return;
    }
    update((s) => {
      s.notes.unshift({
        id: `note-${Date.now()}`,
        clientId,
        title: title.trim() || `${template} · ${new Date().toLocaleDateString("en-IN")}`,
        template,
        visibility,
        sections: sections.filter((x) => x.text.trim()),
        createdAt: new Date().toISOString().slice(0, 10),
      });
      return s;
    });
    notify(
      visibility === "PRIVATE"
        ? "Saved privately. This note will not serialise to the client portal."
        : "Saved and shared. The client can read this in their portal now.",
    );
    setTitle("");
    setSections(blankSections(template));
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
        <Panel
          label="New note"
          title="Structured clinical writing"
          action={<Badge tone={visibility === "PRIVATE" ? "signal" : "pine"}>{visibility.toLowerCase()}</Badge>}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Client">
              <Select value={clientId} onChange={(e) => setClientId(e.target.value)}>
                {state.clients.filter((c) => !c.archived).map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </Select>
            </Field>
            <Field label="Template">
              <Select value={template} onChange={(e) => pickTemplate(e.target.value as TemplateKey)}>
                {(["FREEFORM", "SOAP", "DAP"] as TemplateKey[]).map((t) => (
                  <option key={t} value={t}>
                    {t === "FREEFORM" ? "Freeform" : t}
                    {templateBlocked(t) ? " (locked)" : ""}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Title" className="sm:col-span-2">
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Session 10 · hierarchy step 4" />
            </Field>
          </div>

          {templateBlocked(template) ? (
            <div className="mt-3">
              <Note tone="warn">
                {template === "SOAP" ? soap.reason : dap.reason}
              </Note>
            </div>
          ) : (
            <div className="mt-3 space-y-2.5">
              {sections.map((section, i) => (
                <div key={section.label}>
                  <p className="label text-ink-3">{section.label}</p>
                  <Textarea
                    value={section.text}
                    onChange={(e) =>
                      setSections((prev) =>
                        prev.map((s, idx) => (idx === i ? { ...s, text: e.target.value } : s)),
                      )
                    }
                    className="mt-1 min-h-16"
                    placeholder={`${section.label}…`}
                  />
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-end justify-between gap-3 border-t border-rule pt-3">
            <Field label="Visibility">
              <div className="flex gap-1">
                {(["PRIVATE", "SHARED"] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => setVisibility(v)}
                    className={cx(
                      "border px-2.5 py-1.5 text-[11.5px] transition-colors",
                      visibility === v
                        ? v === "PRIVATE"
                          ? "border-signal bg-signal-soft text-signal"
                          : "border-pine bg-pine-soft text-pine"
                        : "border-rule text-ink-2 hover:border-pine",
                    )}
                  >
                    {v === "PRIVATE" ? "Private to me" : "Shared with client"}
                  </button>
                ))}
              </div>
            </Field>
            <Button variant="solid" onClick={save}>Save note</Button>
          </div>
          <p className="mt-2 text-[11px] leading-snug text-ink-3">
            Private notes are removed at serialisation, before the client portal receives any payload —
            not hidden with CSS.
          </p>
        </Panel>

        <Panel
          label="Archive"
          title={`${state.notes.length} notes`}
          action={
            <Select value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)} className="h-7 w-28 py-1 text-[11.5px]">
              <option value="ALL">All</option>
              <option value="PRIVATE">Private</option>
              <option value="SHARED">Shared</option>
            </Select>
          }
        >
          <ul className="divide-y divide-rule">
            {shown.map((n) => {
              const client = state.clients.find((c) => c.id === n.clientId);
              return (
                <li key={n.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="text-[12.5px] font-medium text-ink">{n.title}</p>
                    <Badge tone={n.visibility === "PRIVATE" ? "signal" : "pine"}>
                      {n.visibility.toLowerCase()}
                    </Badge>
                  </div>
                  <p className="mt-0.5 text-[11px] text-ink-3">
                    {client?.name} · {n.template} · {n.createdAt}
                  </p>
                  <p className="mt-1.5 line-clamp-2 text-[11.5px] leading-relaxed text-ink-2">
                    {n.sections[0]?.text}
                  </p>
                  <button
                    className="mt-1.5 text-[11px] text-ink-3 hover:text-signal"
                    onClick={() => {
                      update((s) => {
                        s.notes = s.notes.filter((x) => x.id !== n.id);
                        return s;
                      });
                      notify("Note deleted from the record.");
                    }}
                  >
                    delete
                  </button>
                </li>
              );
            })}
            {shown.length === 0 && <li className="text-[12px] text-ink-3">No notes match the filter.</li>}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
