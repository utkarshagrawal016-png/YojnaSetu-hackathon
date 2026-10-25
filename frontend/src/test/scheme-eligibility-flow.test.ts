import { describe, expect, it } from "vitest";
import { emptyProfile } from "../lib/welfare-demo";
import {
  parseSpokenNumber,
  extractSingleField,
  extractSpokenEligibilityDetails,
} from "../services/voiceEngine";
import {
  evaluateDetailedEligibility,
  type DbScheme,
  FALLBACK_SCHEMES,
  FALLBACK_RULES,
} from "../services/schemeService";

describe("SchemeSetu Flow & Eligibility Checking Test Suite (Scenarios 1-9)", () => {
  const pmKisanScheme: DbScheme = {
    ...FALLBACK_SCHEMES[0]!,
    rule: FALLBACK_RULES[FALLBACK_SCHEMES[0]!.id]!,
  };

  const postMatricScheme: DbScheme = {
    ...FALLBACK_SCHEMES[4]!,
    rule: FALLBACK_RULES[FALLBACK_SCHEMES[4]!.id]!,
  };

  // Scenario 1: User selects an agriculture scheme and is asked to check eligibility before reaching form preparation
  it("Scenario 1: Agriculture scheme requires checking eligibility before form preparation", () => {
    expect(pmKisanScheme.category).toBe("Agriculture");
    expect(pmKisanScheme.rule).toBeDefined();
    expect(pmKisanScheme.rule?.required_occupation).toBe("Farmer");
    // Scheme has clear rules and details, requiring an eligibility evaluation
    expect(pmKisanScheme.rule?.max_income).toBe(300000);
  });

  // Scenario 2: A user enters details manually and receives an eligibility result
  it("Scenario 2: User enters details manually and receives an eligibility result", () => {
    const manualDetails = {
      age: "35",
      income: "150000",
      state: "Uttar Pradesh",
      category: "Farmer",
    };

    const res = evaluateDetailedEligibility(pmKisanScheme, manualDetails);
    expect(res.verdict).toBe("LIKELY_ELIGIBLE");
    expect(res.satisfiedConditions.length).toBeGreaterThanOrEqual(2);
    expect(res.failedConditions.length).toBe(0);
  });

  // Scenario 3: A user speaks their name, age, and income in Hindi and reviews extracted fields
  it("Scenario 3: User speaks in Hindi with number expressions ('ek lakh')", async () => {
    const hindiSpokenText = "Mera naam Rahul hai, meri age 22 saal hai, aur meri family ki annual income ek lakh rupaye hai.";
    const extracted = await extractSpokenEligibilityDetails(hindiSpokenText);

    expect(extracted.name).toBe("Rahul");
    expect(extracted.age).toBe("22");
    expect(extracted.income).toBe("100000");

    // Also test common Hindi number variations
    expect(parseSpokenNumber("pachaas hazaar")).toBe(50000);
    expect(parseSpokenNumber("do lakh")).toBe(200000);
    expect(parseSpokenNumber("dhai lakh")).toBe(250000);
  });

  // Scenario 4: A user speaks in English
  it("Scenario 4: User speaks in English", async () => {
    const englishSpokenText = "My name is Priya, I am 24 years old, and my annual income is fifty thousand rupees from Uttar Pradesh.";
    const extracted = await extractSpokenEligibilityDetails(englishSpokenText);

    expect(extracted.name).toBe("Priya");
    expect(extracted.age).toBe("24");
    expect(extracted.income).toBe("50000");
    expect(extracted.state).toBe("Uttar Pradesh");
  });

  // Scenario 5: A user provides incomplete details and receives MORE_INFORMATION_REQUIRED
  it("Scenario 5: User provides incomplete details and receives MORE_INFORMATION_REQUIRED", () => {
    const incompleteDetails = {
      age: "",
      income: "",
      state: "Uttar Pradesh",
      category: "Farmer",
    };

    const res = evaluateDetailedEligibility(pmKisanScheme, incompleteDetails);
    expect(res.verdict).toBe("MORE_INFORMATION_REQUIRED");
    expect(res.missingFields.length).toBe(2);
    expect(res.missingFields.map((f) => f.field)).toContain("age");
    expect(res.missingFields.map((f) => f.field)).toContain("income");
  });

  // Scenario 6: A user fails a verified eligibility condition and receives NOT_ELIGIBLE with an explanation
  it("Scenario 6: User fails a verified condition and receives NOT_ELIGIBLE with explanation", () => {
    // Post-Matric Scholarship has max_age: 28, max_income: 250000, required_occupation: Student
    const failingDetails = {
      age: "35", // Exceeds 28
      income: "200000",
      state: "Uttar Pradesh",
      category: "Student",
    };

    const res = evaluateDetailedEligibility(postMatricScheme, failingDetails);
    expect(res.verdict).toBe("NOT_ELIGIBLE");
    expect(res.failedConditions.length).toBeGreaterThanOrEqual(1);
    expect(res.failedConditions[0]?.en).toContain("Age must be between 15 and 28 years");

    // Also test income failure
    const overIncomeDetails = {
      age: "20",
      income: "400000", // Exceeds 250000
      state: "Uttar Pradesh",
      category: "Student",
    };
    const res2 = evaluateDetailedEligibility(postMatricScheme, overIncomeDetails);
    expect(res2.verdict).toBe("NOT_ELIGIBLE");
    expect(res2.failedConditions[0]?.en).toContain("exceeds ₹2,50,000");
  });

  // Scenario 7: A new user opens the form and sees empty fields instead of predefined details
  it("Scenario 7: New user opens form and sees empty fields by default", () => {
    expect(emptyProfile.name).toBe("");
    expect(emptyProfile.age).toBe("");
    expect(emptyProfile.income).toBe("");
    expect(emptyProfile.state).toBe("");
    expect(emptyProfile.category).toBe("");

    // None of the fields should contain "Ram Kumar" or 42 or 250000
    expect(emptyProfile.name).not.toBe("Ram Kumar");
    expect(emptyProfile.age).not.toBe("42");
    expect(emptyProfile.income).not.toBe("250000");
  });

  // Scenario 8: Single field extraction and manual fallback when microphone is denied
  it("Scenario 8: Single field voice parsing functions for individual mic inputs", () => {
    expect(extractSingleField("age", "25 saal")).toBe("25");
    expect(extractSingleField("income", "ek lakh")).toBe("100000");
    expect(extractSingleField("income", "pachaas hazaar")).toBe("50000");
    expect(extractSingleField("category", "kisan")).toBe("Farmer");
    expect(extractSingleField("state", "Uttar Pradesh")).toBe("Uttar Pradesh");
    expect(extractSingleField("name", "mera naam Rahul")).toBe("Rahul");
  });

  // Scenario 9: A scheme with incomplete eligibility rules does not produce a falsely confident eligibility verdict
  it("Scenario 9: Scheme with incomplete eligibility rules returns MORE_INFORMATION_REQUIRED", () => {
    const incompleteScheme: DbScheme = {
      id: "incomplete-scheme",
      name: "Experimental Scheme Without Recorded Rules",
      hindi_name: "प्रायोगिक योजना",
      category: "General",
      benefit_amount: "Variable",
      benefit_summary: "A newly announced scheme with rules pending gazette notification.",
      rule: undefined, // No recorded rules in database
    };

    const userDetails = {
      age: "25",
      income: "100000",
      state: "Uttar Pradesh",
      category: "Farmer",
    };

    const res = evaluateDetailedEligibility(incompleteScheme, userDetails);
    expect(res.verdict).toBe("MORE_INFORMATION_REQUIRED");
    expect(res.isPreliminary).toBe(true);
    expect(res.summary.en).toContain("not fully documented");
  });
});
