import type { AppState, Entitlement, FeatureKey, TemplateKey, TierConfig } from "./types";

export const FEATURE_LABEL: Record<FeatureKey, string> = {
  BRANDED_PAGE: "Branded booking page",
  CLIENT_CAP: "Active client cap",
  SOAP_NOTES: "SOAP clinical notes",
  DAP_NOTES: "DAP clinical notes",
  SESSION_PACKAGES: "Multi-session packages",
  INVOICE_EXPORT: "Invoice export",
  CARE_CHAT: "Secure care chat",
  ANALYTICS: "Practice analytics",
};

export const tierOf = (state: AppState): TierConfig => state.tiers[state.therapist.tier];

export const activeClients = (state: AppState) => state.clients.filter((c) => !c.archived);

/**
 * The single gate for every gated surface in the app.
 * UI renders nothing privileged without asking this first.
 */
export function canAccess(state: AppState, feature: FeatureKey): Entitlement {
  const tier = tierOf(state);

  if (feature === "CLIENT_CAP") {
    const used = activeClients(state).length;
    const limit = tier.clientCap;
    const allowed = limit === null || used < limit;
    return {
      allowed,
      feature,
      used,
      limit,
      reason: allowed
        ? `${tier.name} allows ${limit === null ? "unlimited" : limit} active clients.`
        : `${tier.name} is capped at ${limit} active clients — ${used} in use. Move to a higher tier to add more.`,
    };
  }

  const allowed = tier.features.includes(feature);
  return {
    allowed,
    feature,
    reason: allowed
      ? `${FEATURE_LABEL[feature]} is included in ${tier.name}.`
      : `${FEATURE_LABEL[feature]} is not included in ${tier.name}. Upgrade to unlock it.`,
  };
}

export function templateAllowed(state: AppState, template: TemplateKey): boolean {
  return tierOf(state).templates.includes(template);
}
