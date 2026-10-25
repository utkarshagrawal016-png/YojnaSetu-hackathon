import { describe, expect, it } from "vitest";
import { understandUserQuery } from "../services/voiceEngine";
import { searchSchemesWithIntent, evaluateSchemeEligibility } from "../services/schemeService";
import type { Profile } from "../lib/welfare-demo";

describe("Query Understanding & Scheme Matching Engine", () => {
  const baseProfile: Profile = {
    name: "Ram Kumar",
    state: "Uttar Pradesh",
    category: "Farmer",
    age: "42",
    income: "250000",
  };

  it("Test 1: 'Mujhe padhai ke liye scholarship chahiye.' matches scholarship intent and education scheme", async () => {
    const query = "Mujhe padhai ke liye scholarship chahiye.";
    const intent = await understandUserQuery(query);

    expect(intent.intent).toBe("scholarship");
    expect(intent.needs_clarification).toBe(false);

    const studentProfile: Profile = {
      ...baseProfile,
      category: "Student",
      age: "20",
    };

    const res = await searchSchemesWithIntent(intent, studentProfile);
    expect(res.noResults).toBe(false);
    expect(res.schemes.length).toBeGreaterThanOrEqual(1);

    const postMatric = res.schemes.find((s) => s.name.includes("Post-Matric Scholarship"));
    expect(postMatric).toBeDefined();
    expect(postMatric?.category).toBe("Education");
    expect(postMatric?.eligibilityStatus).toBe("eligible");
  });

  it("Test 2: 'I want a loan to start a small business.' identifies business_financing and returns no-results explanation", async () => {
    const query = "I want a loan to start a small business.";
    const intent = await understandUserQuery(query);

    expect(intent.intent).toBe("business_financing");
    expect(intent.needs_clarification).toBe(false);

    // When checking database only (discovery disabled), returns no-results explanation
    const res = await searchSchemesWithIntent(intent, baseProfile, false);
    expect(res.noResults).toBe(true);
    expect(res.schemes.length).toBe(0);
    expect(res.unmetNeedExplanation?.en).toContain("small business financing");

    // With web discovery enabled, discovers official schemes (e.g., PMEGP / Mudra)
    const discoveryRes = await searchSchemesWithIntent(intent, baseProfile, true);
    expect(discoveryRes.schemes.length).toBeGreaterThanOrEqual(1);
    expect(discoveryRes.schemes.some((s) => s.name.includes("PMEGP") || s.name.includes("Mudra") || s.category.includes("Business"))).toBe(true);
  });

  it("Test 3: 'Mere khet ke liye sarkari madad chahiye.' identifies agriculture and matches PM-Kisan", async () => {
    const query = "Mere khet ke liye sarkari madad chahiye.";
    const intent = await understandUserQuery(query);

    expect(intent.intent).toBe("agriculture");
    expect(intent.needs_clarification).toBe(false);

    const res = await searchSchemesWithIntent(intent, baseProfile);
    expect(res.noResults).toBe(false);
    expect(res.schemes.length).toBeGreaterThanOrEqual(1);

    const pmKisan = res.schemes.find((s) => s.name.includes("PM-Kisan"));
    expect(pmKisan).toBeDefined();
    expect(pmKisan?.category).toBe("Agriculture");
    expect(pmKisan?.eligibilityStatus).toBe("eligible");
  });

  it("Test 4: 'I need help' triggers clarification question", async () => {
    const query = "I need help";
    const intent = await understandUserQuery(query);

    expect(intent.needs_clarification).toBe(true);
    expect(intent.clarification_question).toBeDefined();
    expect(intent.clarification_question?.en).toBeDefined();
    expect(intent.clarification_question?.hi).toBeDefined();

    const res = await searchSchemesWithIntent(intent, baseProfile);
    expect(res.needsClarification).toBe(true);
    expect(res.schemes.length).toBe(0);
  });

  it("Test 5: Query for which no relevant scheme exists returns helpful no-results guidance", async () => {
    const query = "Mujhe luxury sports car khareedne ke liye paise chahiye";
    const intent = await understandUserQuery(query);

    // Testing database-level matching without discovery
    const res = await searchSchemesWithIntent(intent, baseProfile, false);
    expect(res.noResults).toBe(true);
    expect(res.schemes.length).toBe(0);
    expect(res.unmetNeedExplanation).toBeDefined();
  });

  it("Eligibility Engine accurately distinguishes between eligible, not eligible (unmet mandatory rule), and insufficient info", () => {
    const rule = {
      id: "rule-test",
      scheme_id: "scheme-test",
      min_age: 18,
      max_age: 60,
      max_income: 300000,
      required_state: "Uttar Pradesh",
      required_gender: "Any",
      required_occupation: "Farmer",
    };

    // 1. Eligible applicant
    const eligibleProfile: Profile = {
      name: "Ram",
      state: "Uttar Pradesh",
      category: "Farmer",
      age: "35",
      income: "200000",
    };
    const res1 = evaluateSchemeEligibility(rule, eligibleProfile);
    expect(res1.status).toBe("eligible");

    // 2. Not eligible due to age exceeding max_age
    const overAgeProfile: Profile = {
      ...eligibleProfile,
      age: "65",
    };
    const res2 = evaluateSchemeEligibility(rule, overAgeProfile);
    expect(res2.status).toBe("not_eligible");
    expect(res2.reason.en).toContain("Age must be between");

    // 3. Not eligible due to income exceeding limit
    const highIncomeProfile: Profile = {
      ...eligibleProfile,
      income: "500000",
    };
    const res3 = evaluateSchemeEligibility(rule, highIncomeProfile);
    expect(res3.status).toBe("not_eligible");
    expect(res3.reason.en).toContain("income exceeds");

    // 4. Insufficient info when age or income is missing
    const missingInfoProfile: Profile = {
      name: "Ram",
      state: "Uttar Pradesh",
      category: "Farmer",
      age: "",
      income: "",
    };
    const res4 = evaluateSchemeEligibility(rule, missingInfoProfile);
    expect(res4.status).toBe("insufficient_info");
  });
});
