import type { AppState } from "./types";

export const STORAGE_KEY = "unfazed.practice.v1";

const today = new Date();
const iso = (d: Date) => d.toISOString().slice(0, 10);
const plusDays = (n: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + n);
  return iso(d);
};

export const TEMPLATE_SECTIONS: Record<string, string[]> = {
  SOAP: ["Subjective", "Objective", "Assessment", "Plan"],
  DAP: ["Data", "Assessment", "Plan"],
  FREEFORM: ["Session notes"],
};

export const templateSections = (t: string) => TEMPLATE_SECTIONS[t] ?? ["Session notes"];

export function seedState(): AppState {
  return {
    version: 1,
    platformFeePct: 5,
    therapist: {
      name: "Dr. Ananya Sharma",
      slug: "dr-sharma",
      title: "Senior Clinical Psychologist · M.Phil (NIMHANS) · RCI Licensed",
      bio: "Nine years of clinical practice with young adults and working professionals. I work in CBT and ACT, with a trauma-informed lens, on anxiety, burnout, identity and relationship difficulty.",
      photoUrl:
        "https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=400&q=80",
      languages: ["English", "Hindi", "Marathi"],
      specialisations: ["CBT", "ACT", "Trauma-informed care", "Burnout"],
      experienceYears: 9,
      tier: "PRO",
      sessionDuration: 60,
      bufferMinutes: 15,
      dayStart: "09:00",
      dayEnd: "18:00",
      workDays: [1, 2, 3, 4, 5, 6],
    },
    tiers: {
      STARTER: {
        key: "STARTER",
        name: "Starter",
        priceMonthly: 0,
        clientCap: 5,
        templates: ["FREEFORM"],
        features: ["BRANDED_PAGE"],
        blurb: "For practitioners opening a first caseload.",
      },
      PRO: {
        key: "PRO",
        name: "Pro",
        priceMonthly: 1499,
        clientCap: 50,
        templates: ["FREEFORM", "SOAP", "DAP"],
        features: [
          "BRANDED_PAGE",
          "SOAP_NOTES",
          "DAP_NOTES",
          "SESSION_PACKAGES",
          "INVOICE_EXPORT",
          "CARE_CHAT",
          "ANALYTICS",
        ],
        blurb: "The working practice: notes, packages, billing, chat.",
      },
      CLINIC: {
        key: "CLINIC",
        name: "Clinic",
        priceMonthly: 3999,
        clientCap: null,
        templates: ["FREEFORM", "SOAP", "DAP"],
        features: [
          "BRANDED_PAGE",
          "SOAP_NOTES",
          "DAP_NOTES",
          "SESSION_PACKAGES",
          "INVOICE_EXPORT",
          "CARE_CHAT",
          "ANALYTICS",
        ],
        blurb: "For multi-therapist practices that need no ceilings.",
      },
    },
    services: [
      { id: "svc-1", name: "Individual therapy · 60 min", durationMin: 60, price: 2200, format: "Video" },
      { id: "svc-2", name: "Focused check-in · 45 min", durationMin: 45, price: 1600, format: "Video" },
      { id: "svc-3", name: "Couples session · 90 min", durationMin: 90, price: 3400, format: "In-person" },
    ],
    clients: [
      { id: "cli-1", name: "Aarav Verma", email: "aarav.verma@gmail.com", phone: "+91 98200 11223", tags: ["Anxiety", "Weekly"], since: plusDays(-140), archived: false },
      { id: "cli-2", name: "Meera Iyer", email: "meera.iyer@outlook.com", phone: "+91 99870 41120", tags: ["Burnout"], since: plusDays(-92), archived: false },
      { id: "cli-3", name: "Rohan Dutta", email: "rohan.dutta@gmail.com", phone: "+91 90045 77611", tags: ["Grief", "Fortnightly"], since: plusDays(-54), archived: false },
      { id: "cli-4", name: "Sana Qureshi", email: "sana.q@protonmail.com", phone: "+91 98330 90211", tags: ["Referral"], since: plusDays(-21), archived: false },
    ],
    appointments: [
      { id: "apt-1", clientId: "cli-1", serviceId: "svc-1", date: plusDays(0), time: "10:00", durationMin: 60, amount: 2200, status: "CONFIRMED", paymentMode: "PACKAGE", purchaseId: "pur-1" },
      { id: "apt-2", clientId: "cli-2", serviceId: "svc-2", date: plusDays(0), time: "12:00", durationMin: 45, amount: 1600, status: "CONFIRMED", paymentMode: "RAZORPAY" },
      { id: "apt-3", clientId: "cli-3", serviceId: "svc-1", date: plusDays(1), time: "15:00", durationMin: 60, amount: 2200, status: "CONFIRMED", paymentMode: "RAZORPAY" },
      { id: "apt-4", clientId: "cli-1", serviceId: "svc-1", date: plusDays(-7), time: "10:00", durationMin: 60, amount: 2200, status: "COMPLETED", paymentMode: "PACKAGE", purchaseId: "pur-1" },
      { id: "apt-5", clientId: "cli-2", serviceId: "svc-1", date: plusDays(-9), time: "12:00", durationMin: 60, amount: 2200, status: "COMPLETED", paymentMode: "RAZORPAY" },
      { id: "apt-6", clientId: "cli-3", serviceId: "svc-1", date: plusDays(-11), time: "16:00", durationMin: 60, amount: 2200, status: "NO_SHOW", paymentMode: "RAZORPAY" },
      { id: "apt-7", clientId: "cli-4", serviceId: "svc-2", date: plusDays(-14), time: "11:00", durationMin: 45, amount: 1600, status: "COMPLETED", paymentMode: "RAZORPAY" },
      { id: "apt-8", clientId: "cli-1", serviceId: "svc-1", date: plusDays(-21), time: "10:00", durationMin: 60, amount: 2200, status: "COMPLETED", paymentMode: "PACKAGE", purchaseId: "pur-1" },
      { id: "apt-9", clientId: "cli-2", serviceId: "svc-1", date: plusDays(-23), time: "12:00", durationMin: 60, amount: 2200, status: "COMPLETED", paymentMode: "RAZORPAY" },
      { id: "apt-10", clientId: "cli-3", serviceId: "svc-1", date: plusDays(-28), time: "15:00", durationMin: 60, amount: 2200, status: "COMPLETED", paymentMode: "RAZORPAY" },
    ],
    notes: [
      {
        id: "note-1",
        clientId: "cli-1",
        title: "Session 9 · exposure hierarchy review",
        template: "SOAP",
        visibility: "PRIVATE",
        createdAt: plusDays(-7),
        sections: [
          { label: "Subjective", text: "Reports two panic episodes this week, both in the metro. Rates distress 6/10, down from 8/10." },
          { label: "Objective", text: "Speech fluent, affect congruent, no psychomotor slowing. Engaged throughout." },
          { label: "Assessment", text: "Sustained habituation to interoceptive exposure. Avoidance narrowing." },
          { label: "Plan", text: "Move to step 4 of hierarchy. Continue thought records; review at next session." },
        ],
      },
      {
        id: "note-2",
        clientId: "cli-1",
        title: "Between-session plan",
        template: "FREEFORM",
        visibility: "SHARED",
        createdAt: plusDays(-7),
        sections: [
          { label: "Session notes", text: "Three thought records this week, one metro ride without safety behaviour. Log the anxiety peak, not just the average." },
        ],
      },
      {
        id: "note-3",
        clientId: "cli-2",
        title: "Session 5 · workload boundaries",
        template: "DAP",
        visibility: "PRIVATE",
        createdAt: plusDays(-9),
        sections: [
          { label: "Data", text: "Described a 62-hour week and two missed meals. Decline in sleep quality over three weeks." },
          { label: "Assessment", text: "Burnout with early depressive features. No active risk." },
          { label: "Plan", text: "Boundary script rehearsal; sleep hygiene sheet; review in ten days." },
        ],
      },
    ],
    bundles: [
      { id: "bun-1", name: "Care bundle · 3 sessions", sessions: 3, price: 6000, discountPct: 9 },
      { id: "bun-2", name: "Care bundle · 6 sessions", sessions: 6, price: 11400, discountPct: 14 },
      { id: "bun-3", name: "Care bundle · 12 sessions", sessions: 12, price: 21100, discountPct: 20 },
    ],
    purchases: [
      { id: "pur-1", bundleId: "bun-2", clientId: "cli-1", sessionsTotal: 6, sessionsUsed: 3, purchasedAt: plusDays(-35), paid: 11400 },
    ],
    invoices: [
      { id: "INV-2409-018", clientName: "Meera Iyer", description: "Individual therapy · 60 min", gross: 2200, fee: 110, net: 2090, date: plusDays(-9), provider: "RAZORPAY", status: "PAID" },
      { id: "INV-2409-019", clientName: "Sana Qureshi", description: "Focused check-in · 45 min", gross: 1600, fee: 80, net: 1520, date: plusDays(-14), provider: "RAZORPAY", status: "PAID" },
      { id: "INV-2410-002", clientName: "Aarav Verma", description: "Care bundle · 6 sessions", gross: 11400, fee: 570, net: 10830, date: plusDays(-35), provider: "RAZORPAY", status: "PAID" },
    ],
    messages: [
      { id: "msg-1", from: "THERAPIST", text: "Morning Aarav — I've put the thought-record sheet in the portal. Bring whatever you managed, partial counts.", at: plusDays(-2) + " 08:12" },
      { id: "msg-2", from: "CLIENT", text: "Got it. Managed two of three. The metro one was rough but I stayed on till the next stop.", at: plusDays(-2) + " 09:40" },
      { id: "msg-3", from: "THERAPIST", text: "Staying on is the exposure. We'll unpack it at 10:00 today.", at: plusDays(-2) + " 10:02" },
    ],
    blockedDates: [{ date: plusDays(6), reason: "Conference · Bangalore" }],
    consent: { clientId: "cli-1", signedAt: plusDays(-140) + " 11:20" },
  };
}
