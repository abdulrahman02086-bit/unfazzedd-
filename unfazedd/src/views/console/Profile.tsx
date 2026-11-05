import { useState } from "react";
import { Badge, Button, Field, Input, Panel, Select, Textarea, cx } from "../../components/ui";
import { useStore } from "../../lib/store";
import type { Service, Therapist } from "../../lib/types";

const DAY_NAMES = ["S", "M", "T", "W", "T", "F", "S"];

export function ProfileTab() {
  const { state, update, notify } = useStore();
  const [draft, setDraft] = useState<Therapist>(state.therapist);
  const [services, setServices] = useState<Service[]>(state.services);

  const set = <K extends keyof Therapist>(key: K, value: Therapist[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const save = () => {
    if (!draft.name.trim() || !draft.slug.trim()) {
      notify("Name and branded slug cannot be empty.", "warn");
      return;
    }
    update((s) => {
      s.therapist = {
        ...draft,
        slug: draft.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-"),
        languages: draft.languages.filter(Boolean),
        specialisations: draft.specialisations.filter(Boolean),
      };
      s.services = services.filter((svc) => svc.name.trim());
      return s;
    });
    notify("Practice profile published to the branded page.");
  };

  const patchService = (id: string, patch: Partial<Service>) =>
    setServices((list) => list.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  return (
    <div className="space-y-5">
      <Panel
        label="Public identity"
        title="What a client sees before they book"
        action={<Badge tone="pine">unfazed.in/{draft.slug}</Badge>}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Practitioner name">
            <Input value={draft.name} onChange={(e) => set("name", e.target.value)} />
          </Field>
          <Field label="Branded slug" hint="Lowercase letters, numbers and hyphens.">
            <Input value={draft.slug} onChange={(e) => set("slug", e.target.value)} />
          </Field>
          <Field label="Credentials line" className="sm:col-span-2">
            <Input value={draft.title} onChange={(e) => set("title", e.target.value)} />
          </Field>
          <Field label="Portrait URL" className="sm:col-span-2">
            <Input value={draft.photoUrl} onChange={(e) => set("photoUrl", e.target.value)} />
          </Field>
          <Field label="Bio" className="sm:col-span-2">
            <Textarea value={draft.bio} onChange={(e) => set("bio", e.target.value)} />
          </Field>
          <Field label="Languages" hint="Comma separated.">
            <Input
              value={draft.languages.join(", ")}
              onChange={(e) => set("languages", e.target.value.split(",").map((v) => v.trim()))}
            />
          </Field>
          <Field label="Specialisations" hint="Comma separated.">
            <Input
              value={draft.specialisations.join(", ")}
              onChange={(e) => set("specialisations", e.target.value.split(",").map((v) => v.trim()))}
            />
          </Field>
        </div>
      </Panel>

      <Panel label="Services" title="Session formats and prices" action={<Button size="sm" onClick={() => setServices((l) => [...l, { id: `svc-${Date.now()}`, name: "", durationMin: 60, price: 2000, format: "Video" }])}>Add service</Button>}>
        <div className="space-y-2">
          {services.map((s) => (
            <div key={s.id} className="grid gap-2 border border-rule p-2.5 sm:grid-cols-[1fr_84px_104px_112px_auto] sm:items-center">
              <Input
                value={s.name}
                placeholder="Service name"
                onChange={(e) => patchService(s.id, { name: e.target.value })}
              />
              <Input
                type="number"
                min={15}
                step={5}
                value={s.durationMin}
                aria-label="Duration in minutes"
                onChange={(e) => patchService(s.id, { durationMin: Number(e.target.value) })}
              />
              <Input
                type="number"
                min={0}
                step={100}
                value={s.price}
                aria-label="Price in rupees"
                onChange={(e) => patchService(s.id, { price: Number(e.target.value) })}
              />
              <Select
                value={s.format}
                aria-label="Session format"
                onChange={(e) => patchService(s.id, { format: e.target.value as Service["format"] })}
              >
                <option value="Video">Video</option>
                <option value="In-person">In-person</option>
              </Select>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setServices((l) => l.filter((x) => x.id !== s.id))}
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[11.5px] text-ink-3">
          Duration drives slot generation. A 60-minute service with a 15-minute buffer steps across the
          day in 75-minute increments.
        </p>
      </Panel>

      <Panel label="Availability" title="Working window">
        <div className="grid gap-4 sm:grid-cols-4">
          <Field label="Day starts">
            <Input type="time" value={draft.dayStart} onChange={(e) => set("dayStart", e.target.value)} />
          </Field>
          <Field label="Day ends">
            <Input type="time" value={draft.dayEnd} onChange={(e) => set("dayEnd", e.target.value)} />
          </Field>
          <Field label="Default session">
            <Select
              value={String(draft.sessionDuration)}
              onChange={(e) => set("sessionDuration", Number(e.target.value))}
            >
              {[30, 45, 60, 90].map((m) => (
                <option key={m} value={m}>{m} min</option>
              ))}
            </Select>
          </Field>
          <Field label="Buffer between">
            <Select
              value={String(draft.bufferMinutes)}
              onChange={(e) => set("bufferMinutes", Number(e.target.value))}
            >
              {[0, 10, 15, 30].map((m) => (
                <option key={m} value={m}>{m} min</option>
              ))}
            </Select>
          </Field>
        </div>

        <div className="mt-4">
          <p className="label text-ink-3">Days open</p>
          <div className="mt-1.5 flex gap-1.5">
            {DAY_NAMES.map((d, i) => {
              const on = draft.workDays.includes(i);
              return (
                <button
                  key={i}
                  aria-pressed={on}
                  onClick={() =>
                    set("workDays", on ? draft.workDays.filter((x) => x !== i) : [...draft.workDays, i].sort())
                  }
                  className={cx(
                    "h-9 w-9 rounded-full border text-[12px] font-semibold transition-colors",
                    on ? "border-pine bg-pine text-white" : "border-rule text-ink-3 hover:border-pine hover:text-pine",
                  )}
                >
                  {d[0]}
                </button>
              );
            })}
          </div>
        </div>
      </Panel>

      <div className="sticky bottom-0 flex items-center justify-between gap-3 border-t border-rule bg-paper/95 py-3 backdrop-blur">
        <p className="text-[11.5px] text-ink-3">Changes publish to the branded page immediately.</p>
        <div className="flex gap-2">
          <Button
            onClick={() => {
              setDraft(state.therapist);
              setServices(state.services);
            }}
          >
            Discard
          </Button>
          <Button variant="solid" onClick={save}>
            Save profile
          </Button>
        </div>
      </div>
    </div>
  );
}
