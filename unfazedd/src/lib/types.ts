/** Domain model for the Unfazed practice OS demo. Everything is serialisable
 *  so the whole practice can live in one localStorage record. */

export type Tier = "STARTER" | "PRO" | "CLINIC";

export type TemplateKey = "FREEFORM" | "SOAP" | "DAP";

export type FeatureKey =
  | "BRANDED_PAGE"
  | "CLIENT_CAP"
  | "SOAP_NOTES"
  | "DAP_NOTES"
  | "SESSION_PACKAGES"
  | "INVOICE_EXPORT"
  | "CARE_CHAT"
  | "ANALYTICS";

export type SessionStatus = "CONFIRMED" | "COMPLETED" | "NO_SHOW" | "CANCELLED";

export type PaymentMode = "RAZORPAY" | "PACKAGE";

export interface Service {
  id: string;
  name: string;
  durationMin: number;
  price: number;
  format: "Video" | "In-person";
}

export interface Therapist {
  name: string;
  slug: string;
  title: string;
  bio: string;
  photoUrl: string;
  languages: string[];
  specialisations: string[];
  experienceYears: number;
  tier: Tier;
  sessionDuration: number;
  bufferMinutes: number;
  dayStart: string; // "09:00"
  dayEnd: string; // "18:00"
  workDays: number[]; // 0 = Sunday
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  tags: string[];
  since: string; // ISO date
  archived: boolean;
}

export interface Appointment {
  id: string;
  clientId: string;
  serviceId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm, IST
  durationMin: number;
  amount: number;
  status: SessionStatus;
  paymentMode: PaymentMode;
  purchaseId?: string;
}

export interface NoteSection {
  label: string;
  text: string;
}

export interface Note {
  id: string;
  clientId: string;
  title: string;
  template: TemplateKey;
  visibility: "PRIVATE" | "SHARED";
  sections: NoteSection[];
  createdAt: string; // ISO
}

export interface Bundle {
  id: string;
  name: string;
  sessions: number;
  price: number;
  discountPct: number;
}

export interface Purchase {
  id: string;
  bundleId: string;
  clientId: string;
  sessionsTotal: number;
  sessionsUsed: number;
  purchasedAt: string;
  paid: number;
}

export interface Invoice {
  id: string;
  clientName: string;
  description: string;
  gross: number;
  fee: number;
  net: number;
  date: string;
  provider: "RAZORPAY";
  status: "PAID";
}

export interface Message {
  id: string;
  from: "THERAPIST" | "CLIENT";
  text: string;
  at: string;
}

export interface BlockedDate {
  date: string;
  reason: string;
}

export interface TierConfig {
  key: Tier;
  name: string;
  priceMonthly: number;
  clientCap: number | null;
  templates: TemplateKey[];
  features: FeatureKey[];
  blurb: string;
}

export interface AppState {
  version: number;
  therapist: Therapist;
  tiers: Record<Tier, TierConfig>;
  services: Service[];
  clients: Client[];
  appointments: Appointment[];
  notes: Note[];
  bundles: Bundle[];
  purchases: Purchase[];
  invoices: Invoice[];
  messages: Message[];
  blockedDates: BlockedDate[];
  consent: { clientId: string; signedAt: string | null };
  platformFeePct: number;
}

export interface Entitlement {
  allowed: boolean;
  feature: FeatureKey;
  reason: string;
  used?: number;
  limit?: number | null;
}
