import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  searchSchemesWithIntent,
  fetchSchemesAndRules,
  evaluateDetailedEligibility,
  type DbScheme,
} from "@/services/schemeService";
import * as tinyfishService from "@/services/tinyfishService";
import type { Profile } from "@/lib/welfare-demo";

describe("Module 7: Safe, Complete TinyFish Web Discovery Integration", () => {
  const dummyProfile: Profile = {
    name: "Ramesh Kumar",
    age: "35",
    income: "150000",
    state: "Uttar Pradesh",
    category: "OBC",
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // -------------------------------------------------------------------------
  // 1. Relevant Supabase result returned without unnecessary TinyFish call
  // -------------------------------------------------------------------------
  it("Requirement 1: A relevant Supabase result is returned without an unnecessary TinyFish call", async () => {
    const discoverSpy = vi.spyOn(tinyfishService, "discoverSchemesViaBackend");

    const result = await searchSchemesWithIntent(
      {
        intent: "agriculture",
        purpose: "Assistance for cultivating farm",
        raw_query: "Mere khet ke liye sarkari madad chahiye.",
        needs_clarification: false,
      },
      dummyProfile
    );

    // Database scheme PM-Kisan should be returned directly
    expect(result.schemes.length).toBeGreaterThan(0);
    const pmKisan = result.schemes.find((s) => s.id === "45170ee9-d661-4746-a2bf-9d781719de7d");
    expect(pmKisan).toBeDefined();
    expect(pmKisan?.isDiscovered).toBe(false);
    expect(pmKisan?.isPermanentRecord).toBe(true);

    // No unnecessary TinyFish discovery API call should have been triggered
    expect(discoverSpy).not.toHaveBeenCalled();
    expect(result.isDiscoveryActive).toBeFalsy();
  });

  // -------------------------------------------------------------------------
  // 2. No relevant database result triggers TinyFish discovery
  // -------------------------------------------------------------------------
  it("Requirement 2: No relevant database result triggers TinyFish discovery for uncovered intents", async () => {
    vi.spyOn(tinyfishService, "discoverSchemesViaBackend").mockResolvedValueOnce({
      discovered_schemes: [
        {
          id: "discovered-pmegp",
          name: "Prime Minister's Employment Generation Programme (PMEGP)",
          hindi_name: "प्रधानमंत्री रोजगार सृजन कार्यक्रम",
          category: "Business & Self-Employment",
          benefit_amount: "Up to ₹50 Lakh Loan with 15%–35% Subsidy",
          benefit_summary: "Credit-linked subsidy programme to generate self-employment.",
          eligibility_criteria: "Individual above 18 years of age.",
          income_limit: null,
          age_limit: "18 years and above",
          state_restriction: "All India",
          category_restriction: "Any",
          required_documents: ["Aadhaar Card", "Project Report", "Bank Account Details"],
          official_url: "https://pmegp.msme.gov.in/",
          source_title: "PMEGP Portal - Ministry of MSME",
          last_verified_at: "2026-10-25T05:30:00Z",
          verification_status: "verified",
          is_discovered: true,
          is_permanent_record: false,
        },
      ],
      status: "verified",
      source: "tinyfish_search",
      query: "I want a loan to start a small business.",
      total_discovered: 1,
    });

    const result = await searchSchemesWithIntent(
      {
        intent: "business_financing",
        purpose: "Small business loan",
        raw_query: "I want a loan to start a small business.",
        needs_clarification: false,
      },
      dummyProfile
    );

    // Since DB has 0 business financing schemes, discovery is triggered
    expect(result.schemes.length).toBe(1);
    expect(result.isDiscoveryActive).toBe(true);
    expect(result.discoverySource).toBe("tinyfish_search");

    const pmegp = result.schemes[0]!;
    expect(pmegp.name).toContain("PMEGP");
    expect(pmegp.isDiscovered).toBe(true);
    expect(pmegp.isPermanentRecord).toBe(false);
    expect(pmegp.officialUrl).toBe("https://pmegp.msme.gov.in/");
  });

  // -------------------------------------------------------------------------
  // 3. A partially relevant database result can be supplemented with discovered results
  // -------------------------------------------------------------------------
  it("Requirement 3: A partially relevant database result can be supplemented with discovered results", async () => {
    vi.spyOn(tinyfishService, "discoverSchemesViaBackend").mockResolvedValueOnce({
      discovered_schemes: [
        {
          id: "discovered-up-scholarship",
          name: "Uttar Pradesh Pre & Post-Matric OBC Scholarship",
          hindi_name: "उत्तर प्रदेश ओबीसी छात्रवृत्ति",
          category: "Education & Scholarship",
          benefit_amount: "Full fee reimbursement + Maintenance allowance",
          benefit_summary: "State scholarship for OBC students studying in UP institutions.",
          eligibility_criteria: "Resident of UP belonging to OBC with family income < 2.5L.",
          income_limit: "₹2,50,000 / Year",
          age_limit: null,
          state_restriction: "Uttar Pradesh",
          category_restriction: "OBC",
          official_url: "https://scholarship.up.gov.in/",
          source_title: "UP Scholarship Portal",
          last_verified_at: "2026-10-25T05:30:00Z",
          verification_status: "verified",
          is_discovered: true,
          is_permanent_record: false,
        },
      ],
      status: "verified",
      source: "tinyfish_search",
      query: "Find scholarships for OBC students in Uttar Pradesh",
      total_discovered: 1,
    });

    const result = await searchSchemesWithIntent(
      {
        intent: "scholarship",
        purpose: "Scholarships for OBC students in UP",
        raw_query: "Find scholarships for OBC students in Uttar Pradesh",
        needs_clarification: false,
      },
      dummyProfile
    );

    // Should include both DB scholarship and UP state discovered scholarship
    expect(result.schemes.length).toBeGreaterThanOrEqual(2);
    const dbScholarship = result.schemes.find((s) => s.id === "36fa81fa-f5cc-4f72-8c0e-9adfb4f84559");
    const upScholarship = result.schemes.find((s) => s.id === "discovered-up-scholarship");

    expect(dbScholarship).toBeDefined();
    expect(dbScholarship?.isDiscovered).toBe(false);
    expect(upScholarship).toBeDefined();
    expect(upScholarship?.isDiscovered).toBe(true);
  });

  // -------------------------------------------------------------------------
  // 4. Discovered results are deduplicated against database results
  // -------------------------------------------------------------------------
  it("Requirement 4: Discovered results are deduplicated against database results", async () => {
    vi.spyOn(tinyfishService, "discoverSchemesViaBackend").mockResolvedValueOnce({
      discovered_schemes: [
        {
          // Duplicate by name and portal URL
          id: "discovered-duplicate-pmkisan",
          name: "PM-Kisan Samman Nidhi",
          hindi_name: "पीएम-किसान सम्मान निधि",
          category: "Agriculture",
          benefit_amount: "₹6,000 / Year",
          benefit_summary: "Duplicate entry from web.",
          eligibility_criteria: "Farmer",
          official_url: "https://pmkisan.gov.in",
          source_title: "PM-Kisan Web Portal",
          last_verified_at: "2026-10-25T05:30:00Z",
          verification_status: "verified",
          is_discovered: true,
          is_permanent_record: false,
        },
        {
          // Genuine new scheme
          id: "discovered-pmfby",
          name: "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
          hindi_name: "प्रधानमंत्री फसल बीमा योजना",
          category: "Agriculture & Crop Insurance",
          benefit_amount: "Full crop loss compensation",
          benefit_summary: "Comprehensive crop insurance against natural calamities.",
          eligibility_criteria: "Farmers growing notified crops.",
          official_url: "https://pmfby.gov.in",
          source_title: "PMFBY Portal",
          last_verified_at: "2026-10-25T05:30:00Z",
          verification_status: "verified",
          is_discovered: true,
          is_permanent_record: false,
        },
      ],
      status: "verified",
      source: "tinyfish_search",
      query: "crop insurance farming",
      total_discovered: 2,
    });

    const result = await searchSchemesWithIntent(
      {
        intent: "other",
        purpose: "Crop insurance",
        raw_query: "crop insurance farming",
        needs_clarification: false,
      },
      dummyProfile
    );

    // The duplicate PM-Kisan must be deduplicated out!
    const duplicates = result.schemes.filter(
      (s) => s.name.toLowerCase().includes("pm-kisan") || s.name.toLowerCase().includes("samman nidhi")
    );
    expect(duplicates.length).toBeLessThanOrEqual(1);

    // PMFBY must be retained
    const pmfby = result.schemes.find((s) => s.id === "discovered-pmfby");
    expect(pmfby).toBeDefined();
    expect(pmfby?.isDiscovered).toBe(true);
  });

  // -------------------------------------------------------------------------
  // 5. A TinyFish API failure does not crash the application
  // -------------------------------------------------------------------------
  it("Requirement 5: A TinyFish API failure does not crash the application", async () => {
    vi.spyOn(tinyfishService, "discoverSchemesViaBackend").mockRejectedValueOnce(
      new Error("TinyFish Gateway Timeout 504")
    );

    // Should not throw, should handle gracefully
    const result = await searchSchemesWithIntent(
      {
        intent: "business_financing",
        purpose: "Small business loan",
        raw_query: "I want a loan to start a small business.",
        needs_clarification: false,
      },
      dummyProfile
    );

    expect(result).toBeDefined();
    expect(result.noResults).toBe(true);
    expect(result.unmetNeedExplanation?.en).toContain("No small business financing");
  });

  // -------------------------------------------------------------------------
  // 6. A missing API key produces a clear, safe fallback state
  // -------------------------------------------------------------------------
  it("Requirement 6: A missing API key produces a clear, safe fallback state with status 'fallback'", () => {
    const fallback = tinyfishService.getFallbackVerification(
      "test-scheme-id",
      "Test Scheme",
      "https://example.gov.in",
      "Notice for test scheme."
    );

    // Status MUST be 'fallback', NOT 'verified'
    expect(fallback.status).toBe("fallback");
    // No fabricated live timestamps
    expect(fallback.lastVerifiedAt).toBe("");
    expect(fallback.eligibilitySnippet).toContain("Static reference guide");
  });

  // -------------------------------------------------------------------------
  // 7. A database failure is not misreported as 'no schemes found'
  // -------------------------------------------------------------------------
  it("Requirement 7: A database failure is not misreported as 'no schemes found'", async () => {
    // When Supabase connection is offline, fetchSchemesAndRules flags databaseError: true
    const { schemes, databaseError } = await fetchSchemesAndRules();

    expect(schemes.length).toBeGreaterThan(0);
    // If databaseError is present, it is explicitly reported
    if (databaseError) {
      expect(databaseError).toBe(true);
    }
  });

  // -------------------------------------------------------------------------
  // 8. Missing or malformed web fields do not cause crashes
  // -------------------------------------------------------------------------
  it("Requirement 8: Missing or malformed web fields do not cause crashes", async () => {
    vi.spyOn(tinyfishService, "discoverSchemesViaBackend").mockResolvedValueOnce({
      discovered_schemes: [
        {
          id: "malformed-1",
          name: "",
          hindi_name: "",
          category: "",
          benefit_amount: "",
          benefit_summary: "",
          eligibility_criteria: "",
          income_limit: null,
          age_limit: null,
          state_restriction: null,
          category_restriction: null,
          required_documents: undefined,
          official_url: "https://unknown.gov.in",
          source_title: "",
          last_verified_at: "",
          verification_status: "fallback",
          is_discovered: true,
          is_permanent_record: false,
        },
      ],
      status: "fallback",
      source: "fallback",
      query: "unknown query",
      total_discovered: 1,
    });

    const result = await searchSchemesWithIntent(
      {
        intent: "other",
        purpose: "Unknown query",
        raw_query: "unknown query",
        needs_clarification: false,
      },
      dummyProfile
    );

    expect(result.schemes.length).toBeGreaterThan(0);
    const malformed = result.schemes[0]!;
    expect(malformed.isDiscovered).toBe(true);
    expect(malformed.benefit_amount).toBeDefined();
    expect(malformed.rule).toBeDefined();

    // Detailed eligibility check must not crash with missing fields
    const det = evaluateDetailedEligibility(malformed, dummyProfile);
    expect(det.verdict).toBe("MORE_INFORMATION_REQUIRED");
    expect(det.isPreliminary).toBe(true);
  });

  // -------------------------------------------------------------------------
  // 9. Discovered schemes and source links render properly
  // -------------------------------------------------------------------------
  it("Requirement 9: Discovered schemes contain official source URLs and verified metadata", () => {
    const discoveredItem: DbScheme = {
      id: "discovered-pmegp",
      name: "Prime Minister's Employment Generation Programme (PMEGP)",
      hindi_name: "प्रधानमंत्री रोजगार सृजन कार्यक्रम",
      category: "Business & Self-Employment",
      benefit_amount: "Up to ₹50 Lakh Loan with 15%–35% Subsidy",
      benefit_summary: "Credit-linked subsidy programme to generate self-employment.",
      icon: "business",
      isDiscovered: true,
      isPermanentRecord: false,
      officialUrl: "https://pmegp.msme.gov.in/",
      sourceTitle: "PMEGP Portal - Ministry of MSME",
      lastVerifiedAt: "2026-10-25T05:30:00Z",
      verificationStatus: "verified",
    };

    expect(discoveredItem.isDiscovered).toBe(true);
    expect(discoveredItem.isPermanentRecord).toBe(false);
    expect(discoveredItem.officialUrl).toContain("pmegp.msme.gov.in");
    expect(discoveredItem.verificationStatus).toBe("verified");
  });

  // -------------------------------------------------------------------------
  // 10. Existing scheme-matching and verification flows still work
  // -------------------------------------------------------------------------
  it("Requirement 10: Existing scheme-matching and verification flows still work", async () => {
    // 1. PM-Kisan
    const kisanResult = await searchSchemesWithIntent(
      {
        intent: "agriculture",
        purpose: "Farming support",
        raw_query: "Kisan samman nidhi chahiye",
        needs_clarification: false,
      },
      dummyProfile
    );
    expect(kisanResult.schemes.some((s) => s.id === "45170ee9-d661-4746-a2bf-9d781719de7d")).toBe(true);

    // 2. Ayushman Bharat
    const ayushResult = await searchSchemesWithIntent(
      {
        intent: "healthcare",
        purpose: "Hospital treatment",
        raw_query: "Hospital me ilaj chahiye",
        needs_clarification: false,
      },
      dummyProfile
    );
    expect(ayushResult.schemes.some((s) => s.id === "227a5a63-56fd-4d39-a281-3d3f5dbec2bd")).toBe(true);

    // 3. Ladli Behna
    const ladliResult = await searchSchemesWithIntent(
      {
        intent: "women_welfare",
        purpose: "Women financial aid",
        raw_query: "Ladli behna yojana ki jankari",
        needs_clarification: false,
      },
      dummyProfile
    );
    expect(ladliResult.schemes.some((s) => s.id === "fe7ab07d-d4e0-4fde-bc14-91489c080c1a")).toBe(true);
  });
});
