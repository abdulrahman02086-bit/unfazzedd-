import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { STORAGE_KEY, seedState } from "./data";
import type { AppState } from "./types";

export interface Toast {
  id: string;
  message: string;
  tone: "default" | "warn";
}

interface Store {
  state: AppState;
  update: (fn: (draft: AppState) => AppState) => void;
  reset: () => void;
  toasts: Toast[];
  notify: (message: string, tone?: "default" | "warn") => void;
  dismiss: (id: string) => void;
}

const StoreContext = createContext<Store | null>(null);

function read(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedState();
    const parsed = JSON.parse(raw) as AppState;
    if (!parsed || parsed.version !== 1 || !parsed.therapist) return seedState();
    return parsed;
  } catch {
    return seedState();
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(read);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage full or blocked — the session still works in memory */
    }
  }, [state]);

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  const dismiss = useCallback((id: string) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const notify = useCallback(
    (message: string, tone: "default" | "warn" = "default") => {
      const id = `t-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`;
      setToasts((t) => [...t.slice(-2), { id, message, tone }]);
      const handle = window.setTimeout(() => dismiss(id), 4600);
      timers.current.push(handle);
    },
    [dismiss],
  );

  const update = useCallback((fn: (draft: AppState) => AppState) => {
    setState((prev) => fn(structuredClone(prev)));
  }, []);

  const reset = useCallback(() => {
    setState(seedState());
    notify("Demo restored to its seeded state.");
  }, [notify]);

  const value = useMemo<Store>(
    () => ({ state, update, reset, toasts, notify, dismiss }),
    [state, update, reset, toasts, notify, dismiss],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
