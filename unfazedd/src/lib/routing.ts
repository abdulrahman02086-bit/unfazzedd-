import { useEffect, useState } from "react";
import type { AppState, Invoice } from "./types";
import { inr, todayISO } from "./format";

export type Route =
  | { name: "landing" }
  | { name: "login" }
  | { name: "public" }
  | { name: "console" }
  | { name: "portal" };

const parse = (hash: string): Route => {
  const clean = hash.replace(/^#\/?/, "").toLowerCase();
  if (clean.startsWith("login")) return { name: "login" };
  if (clean.startsWith("console")) return { name: "console" };
  if (clean.startsWith("portal")) return { name: "portal" };
  if (clean !== "" && clean !== "home") return { name: "public" };
  return { name: "landing" };
};

export function useRoute() {
  const [route, setRoute] = useState<Route>(() => parse(window.location.hash));
  useEffect(() => {
    const onChange = () => setRoute(parse(window.location.hash));
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  const go = (path: string) => {
    window.location.hash = path === "#/" ? "" : path;
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  };
  return { route, go, path: window.location.hash };
}

/** Serialise a payment into the ledger with the platform fee applied. */
export function recordInvoice(
  state: AppState,
  input: { clientName: string; description: string; gross: number },
): { invoice: Invoice; state: AppState } {
  const fee = Math.round((input.gross * state.platformFeePct) / 100);
  const seq = String(state.invoices.length + 1).padStart(3, "0");
  const invoice: Invoice = {
    id: `INV-${todayISO().replace(/-/g, "").slice(2)}-${seq}`,
    clientName: input.clientName,
    description: input.description,
    gross: input.gross,
    fee,
    net: input.gross - fee,
    date: todayISO(),
    provider: "RAZORPAY",
    status: "PAID",
  };
  return { invoice, state: { ...state, invoices: [invoice, ...state.invoices] } };
}

export function invoiceText(invoice: Invoice, practice: AppState): string {
  return [
    "UNFAZED PRACTICE OS — SESSION RECEIPT",
    "------------------------------------------------------------",
    `Invoice        ${invoice.id}`,
    `Date           ${invoice.date}`,
    `Practitioner   ${practice.therapist.name}  (/${practice.therapist.slug})`,
    `Billed to      ${invoice.clientName}`,
    `Description    ${invoice.description}`,
    "------------------------------------------------------------",
    `Gross          ${inr(invoice.gross)}`,
    `Platform fee   ${inr(invoice.fee)}  (${practice.platformFeePct}%)`,
    `Net settled    ${inr(invoice.net)}`,
    "------------------------------------------------------------",
    `Status         PAID · verified via Razorpay webhook signature`,
    "This receipt is computer generated and does not require a signature.",
  ].join("\n");
}

export function downloadInvoice(invoice: Invoice, practice: AppState) {
  const blob = new Blob([invoiceText(invoice, practice)], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${invoice.id}.txt`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
