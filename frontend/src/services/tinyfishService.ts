/**
 * Module 2: TinyFish Real-Time Web Agent & Discovery Service
 * Secure Server-Mediated Web Scraping, Verification & Scheme Discovery
 */

export interface LiveSchemeVerification {
  schemeId: string;
  officialUrl: string;
  portalTitle: string;
  status: "verified" | "pending" | "fallback";
  lastVerifiedAt: string;
  latestNotice: string;
  eligibilitySnippet: string;
  markdownContent?: string;
}

export interface DiscoveredScheme {
  id: string;
  name: string;
  hindi_name: string;
  category: string;
  benefit_amount: string;
  benefit_summary: string;
  eligibility_criteria: string;
  income_limit?: string | null;
  age_limit?: string | null;
  state_restriction?: string | null;
  category_restriction?: string | null;
  required_documents?: string[];
  official_url: string;
  source_title: string;
  last_verified_at: string;
  verification_status: "verified" | "pending" | "fallback";
  is_discovered: boolean;
  is_permanent_record: boolean;
}

export interface DiscoveryResponse {
  discovered_schemes: DiscoveredScheme[];
  status: "verified" | "pending" | "fallback";
  source: string;
  query: string;
  total_discovered: number;
  message?: string;
}

const BACKEND_URL = (import.meta.env["VITE_BACKEND_URL"] as string | undefined) || "http://127.0.0.1:8001";

export const SCHEME_PORTAL_URLS: Record<string, { url: string; fallbackNotice: string }> = {
  "pm-kisan": {
    url: "https://pmkisan.gov.in",
    fallbackNotice: "18th Installment disbursed. e-KYC is mandatory for farmer beneficiaries.",
  },
  "45170ee9-d661-4746-a2bf-9d781719de7d": {
    url: "https://pmkisan.gov.in",
    fallbackNotice: "Active nationwide income support of ₹6,000 in 3 installments.",
  },
  "ayushman": {
    url: "https://nha.gov.in",
    fallbackNotice: "Ayushman Card provides free treatment up to ₹5 lakh per year per family.",
  },
  "227a5a63-56fd-4d39-a281-3d3f5dbec2bd": {
    url: "https://nha.gov.in",
    fallbackNotice: "Secondary and tertiary healthcare coverage active across empaneled hospitals.",
  },
  "up-pension": {
    url: "https://upbocw.in",
    fallbackNotice: "UP Building & Other Construction Workers Board active monthly pension.",
  },
  "e3cb111a-cbe3-41f4-9eae-c056e79ecfe7": {
    url: "https://upbocw.in",
    fallbackNotice: "UP Shramik monthly pension portal active for registered unorganized laborers.",
  },
  "fe7ab07d-d4e0-4fde-bc14-91489c080c1a": {
    url: "https://cmladlibahna.mp.gov.in",
    fallbackNotice: "Direct monthly benefit transfer active for eligible resident women.",
  },
  "36fa81fa-f5cc-4f72-8c0e-9adfb4f84559": {
    url: "https://scholarships.gov.in",
    fallbackNotice: "National Scholarship Portal active for post-matric eligible students.",
  },
};

const verificationCache = new Map<string, LiveSchemeVerification>();
const discoveryCache = new Map<string, DiscoveryResponse>();

/**
 * Fetch real-time verification through the secure backend endpoint
 * Avoids exposing secret TinyFish API keys in browser client code.
 */
export async function verifySchemeWithTinyFish(
  schemeId: string,
  schemeName: string
): Promise<LiveSchemeVerification> {
  const cached = verificationCache.get(schemeId);
  if (cached) {
    return cached;
  }

  const portalInfo = SCHEME_PORTAL_URLS[schemeId] || {
    url: "https://india.gov.in",
    fallbackNotice: "Official national portal verified.",
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(`${BACKEND_URL}/api/verify-portal`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        scheme_id: schemeId,
        portal_url: portalInfo.url,
        scheme_name: schemeName,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      const verification: LiveSchemeVerification = {
        schemeId,
        officialUrl: data.official_url || portalInfo.url,
        portalTitle: `${schemeName} Official Portal`,
        status: data.status === "verified" ? "verified" : "fallback",
        lastVerifiedAt:
          data.status === "verified"
            ? new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
            : "",
        latestNotice: data.notice || portalInfo.fallbackNotice,
        eligibilitySnippet: data.snippet || portalInfo.fallbackNotice,
      };

      verificationCache.set(schemeId, verification);
      return verification;
    }
  } catch (err) {
    console.warn("Backend portal verification unreachable, using static fallback:", err);
  }

  const fallback = getFallbackVerification(schemeId, schemeName, portalInfo.url, portalInfo.fallbackNotice);
  verificationCache.set(schemeId, fallback);
  return fallback;
}

/**
 * Perform query-driven online discovery of government welfare schemes via TinyFish
 * Prioritizes official government portals (.gov.in, .nic.in).
 */
export async function discoverSchemesViaBackend(params: {
  query: string;
  intent?: string | null;
  purpose?: string | null;
  userState?: string | null;
  userCategory?: string | null;
}): Promise<DiscoveryResponse> {
  const cacheKey = `${params.query}_${params.intent || ""}_${params.userState || ""}`.toLowerCase();
  const cached = discoveryCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const response = await fetch(`${BACKEND_URL}/api/discover-schemes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: params.query,
        intent: params.intent,
        purpose: params.purpose,
        user_state: params.userState,
        user_category: params.userCategory,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data: DiscoveryResponse = await response.json();
      discoveryCache.set(cacheKey, data);
      return data;
    }
  } catch (err) {
    console.warn("TinyFish web discovery network error, falling back:", err);
  }

  // Safe fallback response when backend or external network is unavailable
  const fallbackResponse: DiscoveryResponse = {
    discovered_schemes: [],
    status: "fallback",
    source: "offline_fallback",
    query: params.query,
    total_discovered: 0,
    message: "Live discovery service was temporarily unreachable.",
  };

  return fallbackResponse;
}

/**
 * Returns static fallback when live verification is unavailable
 * Requirement 9: Status is strictly "fallback" (NOT "verified"), without fabricated verification timestamps.
 */
export function getFallbackVerification(
  schemeId: string,
  schemeName: string,
  url: string,
  notice: string
): LiveSchemeVerification {
  return {
    schemeId,
    officialUrl: url,
    portalTitle: `${schemeName} Portal`,
    status: "fallback",
    lastVerifiedAt: "", // Do not fabricate live timestamps for offline fallbacks
    latestNotice: notice,
    eligibilitySnippet: `Static reference guide for ${schemeName}. Live web verification is currently offline. Refer to official portal directly.`,
  };
}
