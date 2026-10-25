/**
 * Module 3: Supabase Connector & Intelligent Eligibility Matching Engine
 * Connected to live Supabase `schemes` and `eligibility_rules` tables
 * With Safe, Server-Mediated TinyFish Online Discovery Fallback
 */

import { supabase } from "@/lib/supabase";
import type { Profile } from "@/lib/welfare-demo";
import type { QueryIntent } from "@/services/voiceEngine";
import {
  discoverSchemesViaBackend,
  type DiscoveredScheme,
  SCHEME_PORTAL_URLS,
} from "@/services/tinyfishService";

export type EligibilityStatus = "eligible" | "not_eligible" | "insufficient_info";
export type EligibilityVerdict = "LIKELY_ELIGIBLE" | "NOT_ELIGIBLE" | "MORE_INFORMATION_REQUIRED";

export interface DetailedEligibilityResult {
  verdict: EligibilityVerdict;
  headline: { en: string; hi: string };
  summary: { en: string; hi: string };
  failedConditions: { en: string; hi: string }[];
  missingFields: { field: string; en: string; hi: string }[];
  satisfiedConditions: { en: string; hi: string }[];
  isPreliminary: boolean;
}

export interface EligibilityRule {
  id: string;
  scheme_id: string;
  min_age: number;
  max_age: number;
  max_income: number;
  required_state: string;
  required_gender: string;
  required_occupation: string;
}

export interface DbScheme {
  id: string;
  name: string;
  hindi_name: string;
  category: string;
  benefit_amount: string;
  benefit_summary: string;
  icon?: "farmer" | "health" | "worker" | "women" | "education" | "business" | "housing" | "pension" | undefined;
  eligibilityStatus?: EligibilityStatus | undefined;
  detailedEligibility?: DetailedEligibilityResult | undefined;
  eligibilityReason?: {
    en: string;
    hi: string;
  } | undefined;
  rule?: EligibilityRule | undefined;

  // Web discovery metadata fields
  isDiscovered?: boolean;
  isPermanentRecord?: boolean;
  officialUrl?: string;
  sourceTitle?: string;
  lastVerifiedAt?: string;
  verificationStatus?: "verified" | "pending" | "fallback";
  requiredDocuments?: string[];
  eligibilityCriteria?: string;
}

export interface SchemeSearchResponse {
  schemes: DbScheme[];
  matchedIntent: string | null;
  purpose: string;
  noResults: boolean;
  needsClarification: boolean;
  clarificationQuestion?: { en: string; hi: string } | null;
  unmetNeedExplanation?: { en: string; hi: string } | null;
  isDiscoveryActive?: boolean;
  discoverySource?: string | null;
  discoveredCount?: number;
  databaseError?: boolean;
}

export const FALLBACK_SCHEMES: DbScheme[] = [
  {
    id: "45170ee9-d661-4746-a2bf-9d781719de7d",
    name: "PM-Kisan Samman Nidhi",
    hindi_name: "पीएम-किसान सम्मान निधि",
    category: "Agriculture",
    benefit_amount: "₹6,000 / Year",
    benefit_summary: "Direct income support for cultivating farmer families.",
    icon: "farmer",
    isDiscovered: false,
    isPermanentRecord: true,
  },
  {
    id: "227a5a63-56fd-4d39-a281-3d3f5dbec2bd",
    name: "Ayushman Bharat (PM-JAY)",
    hindi_name: "आयुष्मान भारत (पीएम-जय)",
    category: "Healthcare",
    benefit_amount: "₹5,00,000 / Family",
    benefit_summary: "Annual health cover for secondary and tertiary care hospitalization.",
    icon: "health",
    isDiscovered: false,
    isPermanentRecord: true,
  },
  {
    id: "e3cb111a-cbe3-41f4-9eae-c056e79ecfe7",
    name: "UP Shramik Pension Yojna",
    hindi_name: "यूपी श्रमिक पेंशन योजना",
    category: "Social Security",
    benefit_amount: "₹1,000 / Month",
    benefit_summary: "Monthly pension support for registered construction workers.",
    icon: "worker",
    isDiscovered: false,
    isPermanentRecord: true,
  },
  {
    id: "fe7ab07d-d4e0-4fde-bc14-91489c080c1a",
    name: "Ladli Behna Yojna",
    hindi_name: "लाडली बहना योजना",
    category: "Women Welfare",
    benefit_amount: "₹1,250 / Month",
    benefit_summary: "Direct financial empowerment aid for women.",
    icon: "women",
    isDiscovered: false,
    isPermanentRecord: true,
  },
  {
    id: "36fa81fa-f5cc-4f72-8c0e-9adfb4f84559",
    name: "Post-Matric Scholarship Scheme",
    hindi_name: "पोस्ट-मैट्रिक छात्रवृत्ति योजना",
    category: "Education",
    benefit_amount: "₹15,000 / Year",
    benefit_summary: "Financial grant covering tuition fees and maintenance allowance.",
    icon: "education",
    isDiscovered: false,
    isPermanentRecord: true,
  },
];

export const FALLBACK_RULES: Record<string, EligibilityRule> = {
  "45170ee9-d661-4746-a2bf-9d781719de7d": {
    id: "rule-1",
    scheme_id: "45170ee9-d661-4746-a2bf-9d781719de7d",
    min_age: 18,
    max_age: 100,
    max_income: 300000,
    required_state: "All",
    required_gender: "Any",
    required_occupation: "Farmer",
  },
  "227a5a63-56fd-4d39-a281-3d3f5dbec2bd": {
    id: "rule-2",
    scheme_id: "227a5a63-56fd-4d39-a281-3d3f5dbec2bd",
    min_age: 0,
    max_age: 120,
    max_income: 250000,
    required_state: "All",
    required_gender: "Any",
    required_occupation: "Any",
  },
  "e3cb111a-cbe3-41f4-9eae-c056e79ecfe7": {
    id: "rule-3",
    scheme_id: "e3cb111a-cbe3-41f4-9eae-c056e79ecfe7",
    min_age: 60,
    max_age: 120,
    max_income: 200000,
    required_state: "Uttar Pradesh",
    required_gender: "Any",
    required_occupation: "Laborer",
  },
  "fe7ab07d-d4e0-4fde-bc14-91489c080c1a": {
    id: "rule-4",
    scheme_id: "fe7ab07d-d4e0-4fde-bc14-91489c080c1a",
    min_age: 21,
    max_age: 60,
    max_income: 250000,
    required_state: "All",
    required_gender: "Female",
    required_occupation: "Any",
  },
  "36fa81fa-f5cc-4f72-8c0e-9adfb4f84559": {
    id: "rule-5",
    scheme_id: "36fa81fa-f5cc-4f72-8c0e-9adfb4f84559",
    min_age: 15,
    max_age: 28,
    max_income: 250000,
    required_state: "All",
    required_gender: "Any",
    required_occupation: "Student",
  },
};

/**
 * Fetch schemes & eligibility rules from Supabase
 * Distinguishes database query failures from legitimate 0-result outcomes (Requirement 6).
 */
export async function fetchSchemesAndRules(): Promise<{
  schemes: DbScheme[];
  rulesMap: Record<string, EligibilityRule>;
  databaseError: boolean;
}> {
  try {
    const [schemesRes, rulesRes] = await Promise.all([
      supabase.from("schemes").select("*"),
      supabase.from("eligibility_rules").select("*"),
    ]);

    if (schemesRes.error) {
      console.warn("Supabase schemes table fetch error:", schemesRes.error);
      return { schemes: FALLBACK_SCHEMES, rulesMap: FALLBACK_RULES, databaseError: true };
    }

    const rawSchemes = schemesRes.data && schemesRes.data.length > 0 ? schemesRes.data : FALLBACK_SCHEMES;
    const rulesMap: Record<string, EligibilityRule> = {};

    if (rulesRes.data && rulesRes.data.length > 0) {
      rulesRes.data.forEach((r: EligibilityRule) => {
        rulesMap[r.scheme_id] = r;
      });
    } else {
      Object.assign(rulesMap, FALLBACK_RULES);
    }

    const schemes: DbScheme[] = rawSchemes.map((s) => ({
      ...s,
      icon: mapCategoryToIcon(s.category, s.name),
      rule: rulesMap[s.id] || FALLBACK_RULES[s.id],
      isDiscovered: false,
      isPermanentRecord: true,
    }));

    return { schemes, rulesMap, databaseError: false };
  } catch (err) {
    console.warn("Supabase connection exception, using fallback data:", err);
    return { schemes: FALLBACK_SCHEMES, rulesMap: FALLBACK_RULES, databaseError: true };
  }
}

/**
 * STEP 3 & STEP 4: Search schemes by understood intent & evaluate mandatory conditions
 * With Safe Supabase-First -> Web Discovery Flow (Requirement 6)
 */
export async function searchSchemesWithIntent(
  intentData: QueryIntent | null,
  profile: Profile,
  allowDiscovery: boolean = true
): Promise<SchemeSearchResponse> {
  const { schemes, rulesMap, databaseError } = await fetchSchemesAndRules();

  // If user query is vague or empty (e.g. "I need help"), ask clarification without web call
  if (intentData?.needs_clarification) {
    return {
      schemes: [],
      matchedIntent: null,
      purpose: intentData.purpose,
      noResults: false,
      needsClarification: true,
      clarificationQuestion: intentData.clarification_question,
      databaseError,
    };
  }

  const intent = intentData?.intent || null;
  const rawQuery = (intentData?.raw_query || "").toLowerCase();

  // 1. First, search existing Supabase schemes
  let candidates: DbScheme[] = [];

  if (intent === "scholarship") {
    candidates = schemes.filter(
      (s) => s.category.toLowerCase().includes("edu") || s.name.toLowerCase().includes("scholarship")
    );
  } else if (intent === "agriculture") {
    candidates = schemes.filter(
      (s) => s.category.toLowerCase().includes("agri") || s.name.toLowerCase().includes("kisan")
    );
  } else if (intent === "healthcare") {
    candidates = schemes.filter(
      (s) => s.category.toLowerCase().includes("health") || s.name.toLowerCase().includes("ayushman")
    );
  } else if (intent === "social_security") {
    candidates = schemes.filter(
      (s) => s.category.toLowerCase().includes("social") || s.name.toLowerCase().includes("pension")
    );
  } else if (intent === "women_welfare") {
    candidates = schemes.filter(
      (s) => s.category.toLowerCase().includes("women") || s.name.toLowerCase().includes("ladli")
    );
  } else if (intent === "business_financing" || intent === "housing" || intent === "other") {
    // Categories that do not exist in current 5 Supabase records
    candidates = [];
  } else if (rawQuery.trim()) {
    // Keyword search fallback when intent is unclassified
    const STOP_WORDS = new Set([
      "mujhe", "chahiye", "hai", "hain", "me", "mein", "mera", "meri", "mere", "ko", "se", "ke", "ki", "ka",
      "liye", "kuch", "aur", "hota", "hoga", "sarkari", "yojana", "scheme", "help", "need", "want",
      "give", "car", "get", "for", "the", "and", "in", "to", "a", "an", "is"
    ]);

    const words = rawQuery
      .split(/[\s,?.!]+/)
      .map((w) => w.trim().toLowerCase())
      .filter((w) => w.length > 2 && !STOP_WORDS.has(w));

    if (words.length > 0) {
      candidates = schemes.filter((s) => {
        const text = `${s.name} ${s.hindi_name} ${s.category} ${s.benefit_summary}`.toLowerCase();
        return words.some((w) => {
          const regex = new RegExp(`\\b${w}\\b`, "i");
          return regex.test(text);
        });
      });
    } else {
      candidates = [];
    }
  } else {
    // Default: return all schemes evaluated against profile only when query is completely empty
    candidates = schemes;
  }

  // 2. Evaluate Supabase candidate relevance
  // If Supabase candidates exist and directly satisfy the user's intent, return them without calling TinyFish!
  // (Requirement 6: "Do not call TinyFish on every request if the existing database already provides relevant results.")
  const isDirectDatabaseMatch =
    candidates.length > 0 &&
    (intent === "agriculture" ||
      intent === "healthcare" ||
      intent === "women_welfare" ||
      (intent === "scholarship" && !rawQuery.includes("uttar pradesh") && !rawQuery.includes("obc")) ||
      (intent === "social_security" && rawQuery.includes("shramik")));

  if (isDirectDatabaseMatch) {
    const evaluated = candidates.map((scheme) => {
      const rule = rulesMap[scheme.id] || scheme.rule || FALLBACK_RULES[scheme.id];
      const { status, reason } = evaluateSchemeEligibility(rule, profile);

      return {
        ...scheme,
        rule,
        eligibilityStatus: status,
        eligibilityReason: reason,
        isDiscovered: false,
        isPermanentRecord: true,
      };
    });

    return {
      schemes: evaluated,
      matchedIntent: intent,
      purpose: intentData?.purpose || "Identified database schemes",
      noResults: false,
      needsClarification: false,
      databaseError,
    };
  }

  // 3. TinyFish Web Discovery: Triggered when Supabase results are insufficient or 0
  let discoveredSchemes: DbScheme[] = [];
  let discoverySource: string | null = null;

  if (allowDiscovery) {
    try {
      const discoveryResponse = await discoverSchemesViaBackend({
        query: rawQuery || intentData?.purpose || "government welfare scheme",
        intent,
        purpose: intentData?.purpose,
        userState: profile.state,
        userCategory: profile.category,
      });

      discoverySource = discoveryResponse.source;

      // Deduplicate discovered results against existing database schemes (Requirement 6 & 11)
      const existingNames = new Set(schemes.map((s) => s.name.toLowerCase().trim()));
      const existingUrls = new Set(
        Object.values(SCHEME_PORTAL_URLS).map((p) => p.url.toLowerCase().replace(/\/$/, ""))
      );

      discoveredSchemes = discoveryResponse.discovered_schemes
        .filter((d: DiscoveredScheme) => {
          const cleanName = (d.name || "").toLowerCase().trim();
          const cleanUrl = (d.official_url || "").toLowerCase().replace(/\/$/, "");
          if (existingNames.has(cleanName)) return false;
          if (existingUrls.has(cleanUrl)) return false;
          return true;
        })
        .map((d: DiscoveredScheme) => {
          const synthesizedRule: EligibilityRule = {
            id: `rule-${d.id}`,
            scheme_id: d.id,
            min_age: d.age_limit ? 18 : 0,
            max_age: 100,
            max_income: d.income_limit ? 300000 : 1000000,
            required_state: d.state_restriction || "All",
            required_gender: "Any",
            required_occupation: "Any",
          };

          return {
            id: d.id,
            name: d.name,
            hindi_name: d.hindi_name || d.name,
            category: d.category,
            benefit_amount: d.benefit_amount || "Check official guidelines",
            benefit_summary: d.benefit_summary,
            icon: mapCategoryToIcon(d.category, d.name),
            isDiscovered: true,
            isPermanentRecord: false,
            officialUrl: d.official_url,
            sourceTitle: d.source_title,
            lastVerifiedAt: d.last_verified_at,
            verificationStatus: d.verification_status,
            requiredDocuments: d.required_documents || ["Aadhaar Card", "Application Form", "Bank Passbook"],
            eligibilityCriteria: d.eligibility_criteria,
            rule: synthesizedRule,
            eligibilityStatus: "insufficient_info" as EligibilityStatus,
            eligibilityReason: {
              en: "Online discovered scheme. Review the verified portal for definitive requirements.",
              hi: "ऑनलाइन खोजी गई योजना। आधिकारिक पोर्टल पर विस्तृत शर्तें देखें।",
            },
          };
        });
    } catch (err) {
      console.warn("TinyFish discovery exception, proceeding with fallback logic:", err);
    }
  }

  // Combine database candidates with discovered candidates
  const combinedCandidates = [...candidates, ...discoveredSchemes];

  // If no scheme matched in DB and web discovery returned nothing
  if (combinedCandidates.length === 0) {
    let unMetEn = "No welfare schemes currently match your specific request in the database or online.";
    let unMetHi = "डेटाबेस अथवा ऑनलाइन खोज में आपकी इस आवश्यकता से संबंधित कोई योजना नहीं मिली।";

    if (intent === "business_financing") {
      unMetEn =
        "No small business financing or MSME loan schemes (e.g., PMEGP, Mudra) are currently registered in this database.";
      unMetHi = "वर्तमान डेटाबेस में व्यवसाय ऋण या मुद्रा लोन योजना पंजीकृत नहीं है।";
    } else if (intent === "housing") {
      unMetEn = "Housing assistance schemes (e.g., PM Awas Yojna) are not currently registered in this database.";
      unMetHi = "आवास सहायता योजनाएं (जैसे पीएम आवास योजना) वर्तमान डेटाबेस में उपलब्ध नहीं हैं।";
    }

    return {
      schemes: [],
      matchedIntent: intent,
      purpose: intentData?.purpose || "Unknown",
      noResults: true,
      needsClarification: false,
      unmetNeedExplanation: { en: unMetEn, hi: unMetHi },
      databaseError,
    };
  }

  // Evaluate strict eligibility against database rules for DB schemes, and maintain discovery info
  const evaluated = combinedCandidates.map((scheme) => {
    if (scheme.isDiscovered) {
      return scheme;
    }

    const rule = rulesMap[scheme.id] || scheme.rule || FALLBACK_RULES[scheme.id];
    const { status, reason } = evaluateSchemeEligibility(rule, profile);

    return {
      ...scheme,
      rule,
      eligibilityStatus: status,
      eligibilityReason: reason,
      isDiscovered: false,
      isPermanentRecord: true,
    };
  });

  return {
    schemes: evaluated,
    matchedIntent: intent,
    purpose: intentData?.purpose || "Identified schemes",
    noResults: false,
    needsClarification: false,
    isDiscoveryActive: discoveredSchemes.length > 0,
    discoverySource,
    discoveredCount: discoveredSchemes.length,
    databaseError,
  };
}

/**
 * STEP 4: Detailed Eligibility Evaluation with 3 Rigorous Outcomes
 * - LIKELY_ELIGIBLE: Satisfies all verified database rules
 * - NOT_ELIGIBLE: Fails at least one verified condition with reason
 * - MORE_INFORMATION_REQUIRED: Incomplete input or incomplete scheme rules in database
 */
export function evaluateDetailedEligibility(
  scheme: DbScheme,
  applicantDetails: {
    age?: string | number | undefined;
    income?: string | number | undefined;
    state?: string | undefined;
    category?: string | undefined;
    gender?: string | undefined;
  }
): DetailedEligibilityResult {
  // If this is an online discovered scheme without permanent database rule, return safe preliminary guidance
  if (scheme.isDiscovered) {
    return {
      verdict: "MORE_INFORMATION_REQUIRED",
      headline: {
        en: "Official Portal Verification Required",
        hi: "आधिकारिक पोर्टल सत्यापन आवश्यक",
      },
      summary: {
        en: `This scheme was discovered online from ${scheme.officialUrl || "official government portal"}. Please verify full guidelines and apply on the official website.`,
        hi: `यह योजना ऑनलाइन खोजी गई है (${scheme.officialUrl || "सरकारी पोर्टल"})। कृपया पूरी जानकारी आधिकारिक वेबसाइट पर देखें।`,
      },
      failedConditions: [],
      missingFields: [],
      satisfiedConditions: [
        {
          en: `Matched your need: ${scheme.category}`,
          hi: `आपकी आवश्यकता से मेल खाता है: ${scheme.category}`,
        },
      ],
      isPreliminary: true,
    };
  }

  const rule = scheme.rule;

  // A scheme with incomplete or missing eligibility rules does not produce a falsely confident verdict
  if (!rule || !rule.max_income || !rule.max_age) {
    return {
      verdict: "MORE_INFORMATION_REQUIRED",
      headline: {
        en: "Official Verification Required",
        hi: "आधिकारिक सत्यापन आवश्यक",
      },
      summary: {
        en: "This scheme does not currently have verified eligibility rules in our database. Eligibility rules are not fully documented yet. Please check official government guidelines.",
        hi: "इस योजना के नियम डेटाबेस में पूर्ण नहीं हैं। आधिकारिक दिशानिर्देश देखें।",
      },
      failedConditions: [],
      missingFields: [],
      satisfiedConditions: [],
      isPreliminary: true,
    };
  }

  const missingFields: { field: string; en: string; hi: string }[] = [];
  const failedConditions: { en: string; hi: string }[] = [];
  const satisfiedConditions: { en: string; hi: string }[] = [];

  const ageStr = (applicantDetails.age ?? "").toString().trim();
  const incomeStr = (applicantDetails.income ?? "").toString().trim();
  const stateStr = (applicantDetails.state ?? "").toString().trim();
  const categoryStr = (applicantDetails.category ?? "").toString().trim();
  const genderStr = (applicantDetails.gender ?? "").toString().trim();

  // 1. Check Age
  if (!ageStr) {
    missingFields.push({ field: "age", en: "Age", hi: "आयु" });
  } else {
    const ageNum = parseInt(ageStr, 10);
    if (isNaN(ageNum)) {
      missingFields.push({ field: "age", en: "Valid Age", hi: "सही आयु" });
    } else if (ageNum < rule.min_age) {
      failedConditions.push({
        en: `Applicant age (${ageNum}) is outside the required range. Age must be between ${rule.min_age} and ${rule.max_age} years.`,
        hi: `आवेदक की आयु (${ageNum}) पात्र सीमा से बाहर है। आयु ${rule.min_age} से ${rule.max_age} वर्ष के बीच होनी चाहिए।`,
      });
    } else if (ageNum > rule.max_age) {
      failedConditions.push({
        en: `Applicant age (${ageNum}) exceeds the maximum eligible age of ${rule.max_age} years. Age must be between ${rule.min_age} and ${rule.max_age} years.`,
        hi: `आवेदक की आयु (${ageNum}) अधिकतम अनुमत आयु ${rule.max_age} वर्ष से अधिक है। आयु ${rule.min_age} से ${rule.max_age} वर्ष के बीच होनी चाहिए।`,
      });
    } else {
      satisfiedConditions.push({
        en: `Age ${ageNum} is within eligible range (${rule.min_age}–${rule.max_age} years).`,
        hi: `आयु ${ageNum} पात्र सीमा (${rule.min_age}–${rule.max_age} वर्ष) में है।`,
      });
    }
  }

  // 2. Check Income
  if (!incomeStr) {
    missingFields.push({ field: "income", en: "Annual Family Income", hi: "वार्षिक पारिवारिक आय" });
  } else {
    const cleanIncome = incomeStr.replace(/[^\d.]/g, "");
    const incomeNum = parseFloat(cleanIncome);
    if (isNaN(incomeNum)) {
      missingFields.push({ field: "income", en: "Valid Annual Income", hi: "सही वार्षिक आय" });
    } else if (incomeNum > rule.max_income) {
      failedConditions.push({
        en: `Annual family income exceeds ₹${rule.max_income.toLocaleString("en-IN")} limit (Applicant income: ₹${incomeNum.toLocaleString("en-IN")}). Annual family income exceeds the allowable limit.`,
        hi: `पारिवारिक वार्षिक आय निर्धारित सीमा ₹${rule.max_income.toLocaleString("en-IN")} से अधिक है (आवेदक आय: ₹${incomeNum.toLocaleString("en-IN")})।`,
      });
    } else {
      satisfiedConditions.push({
        en: `Income ₹${incomeNum.toLocaleString("en-IN")} is within the ceiling of ₹${rule.max_income.toLocaleString("en-IN")}.`,
        hi: `वार्षिक आय ₹${incomeNum.toLocaleString("en-IN")} निर्धारित सीमा ₹${rule.max_income.toLocaleString("en-IN")} के भीतर है।`,
      });
    }
  }

  // 3. Check State Restriction
  if (rule.required_state && rule.required_state !== "All") {
    if (!stateStr || stateStr === "All States") {
      missingFields.push({ field: "state", en: "State of Residence", hi: "निवास राज्य" });
    } else if (stateStr.toLowerCase() !== rule.required_state.toLowerCase()) {
      failedConditions.push({
        en: `Scheme is only open to residents of ${rule.required_state}. (Selected: ${stateStr})`,
        hi: `यह योजना केवल ${rule.required_state} के निवासियों के लिए है। (चयनित: ${stateStr})`,
      });
    } else {
      satisfiedConditions.push({
        en: `Resident of ${rule.required_state}.`,
        hi: `${rule.required_state} के पात्र निवासी।`,
      });
    }
  }

  // 4. Check Gender Restriction
  if (rule.required_gender && rule.required_gender !== "Any") {
    if (!genderStr) {
      missingFields.push({ field: "gender", en: "Gender", hi: "लिंग" });
    } else if (genderStr.toLowerCase() !== rule.required_gender.toLowerCase()) {
      failedConditions.push({
        en: `Scheme is exclusively for ${rule.required_gender} applicants.`,
        hi: `यह योजना केवल ${rule.required_gender === "Female" ? "महिला" : rule.required_gender} आवेदकों के लिए है।`,
      });
    } else {
      satisfiedConditions.push({
        en: `Gender matches scheme requirement (${rule.required_gender}).`,
        hi: `लिंग आवश्यकता अनुसार मेल खाता है।`,
      });
    }
  }

  // 5. Check Occupation / Category Restriction
  if (rule.required_occupation && rule.required_occupation !== "Any") {
    if (!categoryStr || categoryStr === "General") {
      missingFields.push({ field: "category", en: "Applicant Category/Occupation", hi: "आवेदक श्रेणी/व्यवसाय" });
    } else if (categoryStr.toLowerCase() !== rule.required_occupation.toLowerCase()) {
      failedConditions.push({
        en: `Scheme is designated for ${rule.required_occupation}s. (Selected: ${categoryStr})`,
        hi: `यह योजना ${rule.required_occupation} श्रेणी के लिए है। (चयनित: ${categoryStr})`,
      });
    } else {
      satisfiedConditions.push({
        en: `Category matches (${rule.required_occupation}).`,
        hi: `श्रेणी (${rule.required_occupation}) मेल खाती है।`,
      });
    }
  }

  // Verdict Resolution
  if (failedConditions.length > 0) {
    return {
      verdict: "NOT_ELIGIBLE",
      headline: {
        en: "Not Eligible Based on Verified Rules",
        hi: "सत्यापित नियमों के अनुसार अपात्र",
      },
      summary: {
        en: failedConditions[0]!.en,
        hi: failedConditions[0]!.hi,
      },
      failedConditions,
      missingFields,
      satisfiedConditions,
      isPreliminary: false,
    };
  }

  if (missingFields.length > 0) {
    const missingFieldNamesEn = missingFields.map((f) => f.en).join(", ");
    const missingFieldNamesHi = missingFields.map((f) => f.hi).join(", ");

    return {
      verdict: "MORE_INFORMATION_REQUIRED",
      headline: {
        en: "Additional Details Required",
        hi: "अतिरिक्त विवरण आवश्यक",
      },
      summary: {
        en: `Please provide your ${missingFieldNamesEn} to confirm eligibility.`,
        hi: `पात्रता की पुष्टि के लिए कृपया अपना ${missingFieldNamesHi} भरें।`,
      },
      failedConditions: [],
      missingFields,
      satisfiedConditions,
      isPreliminary: true,
    };
  }

  return {
    verdict: "LIKELY_ELIGIBLE",
    headline: {
      en: "Likely Eligible for this Scheme",
      hi: "आप इस योजना के लिए पात्र प्रतीत होते हैं",
    },
    summary: {
      en: "Your profile satisfies all verified eligibility conditions registered in our database.",
      hi: "आपका विवरण डेटाबेस में दर्ज सभी पात्रता शर्तों को पूरा करता है।",
    },
    failedConditions: [],
    missingFields: [],
    satisfiedConditions,
    isPreliminary: false,
  };
}

/**
 * STEP 4: Mandatory Condition Evaluation (Adapter for backward compatibility)
 */
export function evaluateSchemeEligibility(
  rule: EligibilityRule | undefined,
  profile: Profile
): { status: EligibilityStatus; reason: { en: string; hi: string } } {
  const dummyScheme: DbScheme = {
    id: rule?.scheme_id || "temp",
    name: "Scheme",
    hindi_name: "योजना",
    category: "General",
    benefit_amount: "",
    benefit_summary: "",
    rule,
  };

  const det = evaluateDetailedEligibility(dummyScheme, profile);
  const status: EligibilityStatus =
    det.verdict === "LIKELY_ELIGIBLE"
      ? "eligible"
      : det.verdict === "NOT_ELIGIBLE"
      ? "not_eligible"
      : "insufficient_info";

  return {
    status,
    reason: det.summary,
  };
}

export function mapCategoryToIcon(category: string, name: string): DbScheme["icon"] {
  const text = `${category} ${name}`.toLowerCase();
  if (text.includes("agri") || text.includes("kisan") || text.includes("farm") || text.includes("crop")) return "farmer";
  if (text.includes("health") || text.includes("ayushman") || text.includes("hospital")) return "health";
  if (text.includes("women") || text.includes("ladli") || text.includes("female")) return "women";
  if (text.includes("edu") || text.includes("scholar") || text.includes("matric") || text.includes("student")) return "education";
  if (text.includes("business") || text.includes("loan") || text.includes("mudra") || text.includes("pmegp") || text.includes("msme")) return "business";
  if (text.includes("house") || text.includes("awas") || text.includes("urban") || text.includes("housing")) return "housing";
  if (text.includes("pension") || text.includes("senior") || text.includes("old age")) return "pension";
  return "worker";
}
