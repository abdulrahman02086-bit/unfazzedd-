import { useEffect, useRef, useState } from "react";
import { Badge, Button, Input, Locked, Panel, cx } from "../../components/ui";
import { canAccess } from "../../lib/entitlements";
import { stamp } from "../../lib/format";
import { useStore } from "../../lib/store";

export function MessagesTab() {
  const { state, update, notify } = useStore();
  const gate = canAccess(state, "CARE_CHAT");
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const client = state.clients.find((c) => c.id === state.consent.clientId) ?? state.clients[0];

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "nearest" });
  }, [state.messages.length]);

  if (!gate.allowed) {
    return (
      <Panel label="Care chat" title="Not included on this plan">
        <Locked reason={gate.reason}>
          <p className="text-[11.5px] text-ink-3">
            Messages already stored are retained and reappear if the module is re-enabled.
          </p>
        </Locked>
      </Panel>
    );
  }

  const send = () => {
    const body = text.trim();
    if (!body) return;
    update((s) => {
      s.messages.push({ id: `msg-${Date.now()}`, from: "THERAPIST", text: body, at: stamp() });
      return s;
    });
    setText("");
    notify("Message sent. Delivered to the client portal thread.");
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_260px]">
      <Panel
        label="Thread"
        title={`${client?.name ?? "Client"} · direct care chat`}
        action={<Badge tone="pine">open</Badge>}
      >
        <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
          {state.messages.map((m) => {
            const mine = m.from === "THERAPIST";
            return (
              <div key={m.id} className={cx("flex", mine ? "justify-end" : "justify-start")}>
                <div
                  className={cx(
                    "max-w-[86%] rounded-2xl px-3.5 py-2.5",
                    mine ? "rounded-br-md bg-pine text-white" : "rounded-bl-md bg-paper-2 text-ink",
                  )}
                >
                  <p className="text-[12.5px] leading-relaxed">{m.text}</p>
                  <p className={cx("num mt-1 text-[10px] font-medium", mine ? "text-white/60" : "text-ink-3")}>{m.at}</p>
                </div>
              </div>
            );
          })}
          <div ref={endRef} />
        </div>

        <div className="mt-4 flex gap-2 border-t border-rule pt-3">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Write to the client…"
            aria-label="Message text"
          />
          <Button variant="solid" onClick={send}>Send</Button>
        </div>
      </Panel>

      <Panel label="Boundaries" title="What chat is for">
        <ul className="space-y-2.5 text-[11.5px] leading-relaxed text-ink-2">
          <li className="border-b border-rule pb-2.5">
            <span className="label block text-ink-3">Not for crisis</span>
            Out-of-hours risk routes to the emergency contact on the client record, not to this thread.
          </li>
          <li className="border-b border-rule pb-2.5">
            <span className="label block text-ink-3">Not a record</span>
            Clinical content belongs in a note. Chat is logistics and between-session nudges.
          </li>
          <li>
            <span className="label block text-ink-3">Exportable</span>
            Threads are part of the client record and would be released on a subject access request.
          </li>
        </ul>
      </Panel>
    </div>
  );
}
