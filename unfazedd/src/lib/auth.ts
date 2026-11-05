import { useEffect, useState } from "react";

/** Local demo identity. No server: the session and the demo credentials live in
 *  localStorage so a signed-in practice survives a refresh. */

export type SessionRole = "PRACTITIONER" | "CLIENT";

export interface Session {
  role: SessionRole;
  name: string;
  email: string;
  at: string;
}

export interface DemoAccount {
  role: SessionRole;
  name: string;
  email: string;
  password: string;
  note: string;
}

export const ROLE_LABEL: Record<SessionRole, string> = {
  PRACTITIONER: "Practitioner",
  CLIENT: "Client",
};

export const DEMO_ACCOUNTS: Record<SessionRole, DemoAccount> = {
  PRACTITIONER: {
    role: "PRACTITIONER",
    name: "Dr. Ananya Sharma",
    email: "ananya@unfazed.in",
    password: "unfazed2026",
    note: "Owns the practice console",
  },
  CLIENT: {
    role: "CLIENT",
    name: "Aarav Verma",
    email: "aarav.verma@gmail.com",
    password: "unfazed2026",
    note: "Sees the client portal",
  },
};

const SESSION_KEY = "unfazed.session.v1";
const REMEMBER_KEY = "unfazed.remembered.v1";
const EVENT = "unfazed:session";

let cache: Session | null | undefined;

const isSession = (value: unknown): value is Session => {
  if (!value || typeof value !== "object") return false;
  const s = value as Partial<Session>;
  return (
    (s.role === "PRACTITIONER" || s.role === "CLIENT") &&
    typeof s.name === "string" &&
    typeof s.email === "string" &&
    typeof s.at === "string"
  );
};

const load = (): Session | null => {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isSession(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

export function readSession(): Session | null {
  if (cache === undefined) cache = load();
  return cache;
}

const emit = () => {
  cache = load();
  window.dispatchEvent(new Event(EVENT));
};

export function signIn(input: Omit<Session, "at">): Session {
  const session: Session = { ...input, at: new Date().toISOString() };
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    /* storage blocked — the session still holds for this tab */
  }
  cache = session;
  emit();
  return session;
}

export function signOut() {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
  cache = null;
  emit();
}

export function useSession(): Session | null {
  const [session, setSession] = useState<Session | null>(() => readSession());
  useEffect(() => {
    const sync = () => setSession(readSession());
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return session;
}

export const rememberedEmail = () => {
  try {
    return localStorage.getItem(REMEMBER_KEY) ?? "";
  } catch {
    return "";
  }
};

export function rememberEmail(email: string | null) {
  try {
    if (email) localStorage.setItem(REMEMBER_KEY, email);
    else localStorage.removeItem(REMEMBER_KEY);
  } catch {
    /* ignore */
  }
}

export const initialsOf = (name: string) =>
  name
    .replace(/^Dr\.?\s+/i, "")
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
