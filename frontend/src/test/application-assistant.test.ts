import { describe, it, expect, vi } from "vitest";
import type { Profile } from "@/lib/welfare-demo";
import type { DbScheme } from "@/services/schemeService";
import {
  getDefaultDocumentChecklist,
  initializeIntakeFromProfile,
  validateIntakeData,
  evaluatePortalAssistanceViaBackend,
  type ApplicationIntakeData,
} from "@/services/applicationAssistantService";

describe("Application Assistance & Form Preparation Workflow", () => {
  const dummyProfile: Profile = {
    name: "Aarav Sharma",
    age: "29",
    income: "180000",
    state: "Uttar Pradesh",
    category: "General",
  };

  const discoveredLoanScheme: DbScheme = {
    id: "discovered-pmegp-test",
    name: "Prime Minister Employment Generation Programme (PMEGP)",
    hindi_name: "प्रधानमंत्री रोजगार सृजन कार्यक्रम",
    category: "Business & Self-Employment",
    benefit_amount: "Up to ₹50 Lakh with 15%–35% Subsidy",
    benefit_summary: "Credit-linked subsidy programme to generate self-employment micro-enterprises.",
    eligibility_criteria: "18+ years, minimum VIII pass for manufacturing above ₹10L.",
    requiredDocuments: ["Aadhaar Card", "Detailed Project Report", "Bank Passbook"],
    officialUrl: "https://pmegp.msme.gov.in/",
    sourceTitle: "PMEGP Official Portal",
    lastVerifiedAt: "2026-10-25T05:30:00Z",
    verificationStatus: "verified",
    isDiscovered: true,
    isPermanentRecord: false,
  };

  const dbFarmingScheme: DbScheme = {
    id: "45170ee9-d661-4746-a2bf-9d781719de7d",
    name: "PM-Kisan Samman Nidhi",
    hindi_name: "पीएम-किसान सम्मान निधि",
    category: "Agriculture",
    benefit_amount: "₹6,000 / Year",
    benefit_summary: "Direct income support for cultivating farmer families.",
    officialUrl: "https://pmkisan.gov.in",
    sourceTitle: "PM-Kisan Portal",
    lastVerifiedAt: "2026-10-25T05:30:00Z",
    verificationStatus: "verified",
    isDiscovered: false,
    isPermanentRecord: true,
  };

  // -------------------------------------------------------------------------
  // 1. Document Checklist Generation & Scheme-Specific Additions
  // -------------------------------------------------------------------------
  it("Requirement 1 & 5: Generates document checklist and marks scheme-specific requirements", () => {
    // Agriculture Scheme checklist
    const agriDocs = getDefaultDocumentChecklist(dbFarmingScheme);
    expect(agriDocs.length).toBeGreaterThanOrEqual(4);
    expect(agriDocs.some((d) => d.id === "doc-aadhaar")).toBe(true);
    expect(agriDocs.some((d) => d.id === "doc-bank")).toBe(true);
    expect(agriDocs.some((d) => d.id === "doc-land")).toBe(true); // Land Khatauni mandatory for farming

    // Business Loan Scheme checklist
    const loanDocs = getDefaultDocumentChecklist(discoveredLoanScheme);
    expect(loanDocs.some((d) => d.id === "doc-project")).toBe(true); // Project proposal for loan
  });

  // -------------------------------------------------------------------------
  // 2. Profile Reuse & Intake Initialization
  // -------------------------------------------------------------------------
  it("Requirement 4: Reuses confirmed profile information and asks only for missing fields", () => {
    const intake = initializeIntakeFromProfile(dummyProfile);

    // Profile fields should be seamlessly prefilled
    expect(intake.name).toBe("Aarav Sharma");
    expect(intake.age).toBe("29");
    expect(intake.income).toBe("180000");
    expect(intake.state).toBe("Uttar Pradesh");
    expect(intake.category).toBe("General");

    // Missing fields should be empty and ready for intake
    expect(intake.gender).toBe("");
    expect(intake.mobile).toBe("");
    expect(intake.fatherOrSpouseName).toBe("");
  });

  // -------------------------------------------------------------------------
  // 3. Validation with User-Friendly Messages
  // -------------------------------------------------------------------------
  it("Requirement 7: Validates required intake fields with clear error messages in English and Hindi", () => {
    const invalidData: ApplicationIntakeData = {
      name: "",
      age: "999",
      income: "invalid_income",
      state: "All States",
      category: "",
      gender: "",
      mobile: "12345", // Invalid mobile (not 10 digits)
      fatherOrSpouseName: "",
      schemeSpecificFields: {},
    };

    const enValidation = validateIntakeData(invalidData, "en");
    expect(enValidation.isValid).toBe(false);
    expect(enValidation.errors.name).toContain("full name");
    expect(enValidation.errors.age).toContain("between 1 and 120");
    expect(enValidation.errors.income).toContain("valid annual family income");
    expect(enValidation.errors.state).toContain("state of domicile");
    expect(enValidation.errors.category).toContain("category");
    expect(enValidation.errors.mobile).toContain("10 digits");

    const hiValidation = validateIntakeData(invalidData, "hi");
    expect(hiValidation.isValid).toBe(false);
    expect(hiValidation.errors.name).toContain("पूरा नाम");
    expect(hiValidation.errors.age).toContain("सही आयु");
  });

  // -------------------------------------------------------------------------
  // 4. Portal Feasibility Evaluation & No False Automation Claims
  // -------------------------------------------------------------------------
  it("Requirement 9 & 10: Honestly reports portal security controls without falsely claiming automated filling", async () => {
    const validIntake: ApplicationIntakeData = {
      ...initializeIntakeFromProfile(dummyProfile),
      gender: "Male",
      mobile: "9876543210",
      fatherOrSpouseName: "Devendra Sharma",
    };

    const result = await evaluatePortalAssistanceViaBackend(discoveredLoanScheme, validIntake);

    // Official government portal has strict security controls (Aadhaar OTP, CAPTCHA)
    expect(result.domain).toBe("pmegp.msme.gov.in");
    expect(result.is_automated_filling_feasible).toBe(false);
    expect(result.feasibility_reason.en).toContain("Aadhaar");
    expect(result.security_controls.length).toBeGreaterThan(0);
    expect(result.security_controls.some((c) => c.includes("Aadhaar"))).toBe(true);
    expect(result.security_controls.some((c) => c.includes("CAPTCHA"))).toBe(true);
  });

  // -------------------------------------------------------------------------
  // 5. Zero-Storage Privacy Policy for Sensitive Government IDs
  // -------------------------------------------------------------------------
  it("Requirement 6 & 12: Maps form fields accurately and strictly refuses to fabricate or store sensitive IDs", async () => {
    const validIntake: ApplicationIntakeData = {
      ...initializeIntakeFromProfile(dummyProfile),
      gender: "Male",
      mobile: "9876543210",
      fatherOrSpouseName: "Devendra Sharma",
    };

    const result = await evaluatePortalAssistanceViaBackend(discoveredLoanScheme, validIntake);

    // Non-sensitive fields are mapped
    const nameField = result.field_mappings.find((f) => f.field_id === "full_name");
    expect(nameField?.mapped_value).toBe("Aarav Sharma");
    expect(nameField?.status).toBe("ready");

    const incomeField = result.field_mappings.find((f) => f.field_id === "annual_income");
    expect(incomeField?.mapped_value).toBeDefined();

    // Sensitive IDs (Aadhaar number, Bank account number) must NOT be fabricated or populated
    const aadhaarField = result.field_mappings.find((f) => f.field_id === "aadhaar_number");
    expect(aadhaarField?.is_sensitive).toBe(true);
    expect(aadhaarField?.mapped_value).toBeNull();
    expect(aadhaarField?.status).toBe("user_enters_on_portal");

    const bankField = result.field_mappings.find((f) => f.field_id === "bank_account");
    expect(bankField?.is_sensitive).toBe(true);
    expect(bankField?.mapped_value).toBeNull();
    expect(bankField?.status).toBe("user_enters_on_portal");
  });

  // -------------------------------------------------------------------------
  // 6. Citizen-Controlled Final Submission Notice
  // -------------------------------------------------------------------------
  it("Requirement 8 & 11: Guarantees citizen control and provides clear submission instructions", async () => {
    const validIntake: ApplicationIntakeData = {
      ...initializeIntakeFromProfile(dummyProfile),
      gender: "Male",
      mobile: "9876543210",
    };

    const result = await evaluatePortalAssistanceViaBackend(dbFarmingScheme, validIntake);

    // Instructions must outline step-by-step portal progression
    expect(result.submission_instructions.length).toBeGreaterThanOrEqual(4);
    expect(result.user_submission_notice.en).toContain("never automatically submit");
    expect(result.user_submission_notice.hi).toContain("स्वचालित रूप से सबमिट नहीं");
  });

  // -------------------------------------------------------------------------
  // 7. Resilient Fallback When Backend is Offline
  // -------------------------------------------------------------------------
  it("Requirement 10: Safely falls back to local evaluation logic if backend request fails", async () => {
    // Mock network failure
    const originalFetch = globalThis.fetch;
    globalThis.fetch = vi.fn().mockRejectedValueOnce(new Error("Network connection dropped"));

    try {
      const validIntake = initializeIntakeFromProfile(dummyProfile);
      const fallbackResult = await evaluatePortalAssistanceViaBackend(discoveredLoanScheme, validIntake);

      expect(fallbackResult).toBeDefined();
      expect(fallbackResult.domain).toBe("pmegp.msme.gov.in");
      expect(fallbackResult.is_automated_filling_feasible).toBe(false);
      expect(fallbackResult.field_mappings.length).toBeGreaterThan(0);
      expect(fallbackResult.submission_instructions.length).toBeGreaterThan(0);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
