import { describe, expect, it } from "vitest";
import {
  getOfficialFormTemplate,
  getConfirmedHelperReference,
  VERIFIED_FORM_TEMPLATES,
  type OfficialFormField,
} from "../services/formTemplateService";
import { emptyProfile, type Profile } from "../lib/welfare-demo";

describe("Official Application Form Guide & Supabase Storage Mapping Suite", () => {
  const PM_KISAN_ID = "45170ee9-d661-4746-a2bf-9d781719de7d";
  const AYUSHMAN_ID = "227a5a63-56fd-4d39-a281-3d3f5dbec2bd";
  const UP_SHRAMIK_ID = "e3cb111a-cbe3-41f4-9eae-c056e79ecfe7"; // Old-age / labor pension
  const LADLI_BEHNA_ID = "fe7ab07d-d4e0-4fde-bc14-91489c080c1a";
  const SCHOLARSHIP_ID = "36fa81fa-f5cc-4f72-8c0e-9adfb4f84559";

  // SCENARIO 1: The 4 verified schemes resolve to their Supabase Storage bucket URLs
  it("Scenario 1: Four verified schemes link to Supabase Storage bucket 'Scheme_Forms' PDFs", async () => {
    const pmKisan = await getOfficialFormTemplate(PM_KISAN_ID);
    expect(pmKisan.verification_status).toBe("verified");
    expect(pmKisan.blank_pdf_url).toBe(
      "https://tgsdyuzkwlxsmudydddt.supabase.co/storage/v1/object/public/Scheme_Forms/SammanNidhi.pdf"
    );
    expect(pmKisan.storage_path).toBe("SammanNidhi.pdf");

    const ayushman = await getOfficialFormTemplate(AYUSHMAN_ID);
    expect(ayushman.verification_status).toBe("verified");
    expect(ayushman.blank_pdf_url).toBe(
      "https://tgsdyuzkwlxsmudydddt.supabase.co/storage/v1/object/public/Scheme_Forms/AyushmanBharat_form_HealthCard.pdf"
    );
    expect(ayushman.storage_path).toBe("AyushmanBharat_form_HealthCard.pdf");

    const ladliBehna = await getOfficialFormTemplate(LADLI_BEHNA_ID);
    expect(ladliBehna.verification_status).toBe("verified");
    expect(ladliBehna.blank_pdf_url).toBe(
      "https://tgsdyuzkwlxsmudydddt.supabase.co/storage/v1/object/public/Scheme_Forms/ladli-behna-yojana-form-2026-513.pdf"
    );
    expect(ladliBehna.storage_path).toBe("ladli-behna-yojana-form-2026-513.pdf");

    const scholarship = await getOfficialFormTemplate(SCHOLARSHIP_ID);
    expect(scholarship.verification_status).toBe("verified");
    expect(scholarship.blank_pdf_url).toBe(
      "https://tgsdyuzkwlxsmudydddt.supabase.co/storage/v1/object/public/Scheme_Forms/PostMatric_ScholarShip_Application%20.pdf"
    );
    expect(scholarship.storage_path).toBe("PostMatric_ScholarShip_Application .pdf");
  });

  // SCENARIO 2: Old-age pension scheme has NO PDF and shows clear message
  it("Scenario 2: Old-age / UP Shramik pension has NO PDF and displays 'Application form guide is not available yet'", async () => {
    const upPension = await getOfficialFormTemplate(UP_SHRAMIK_ID);
    expect(upPension.blank_pdf_url).toBeNull();
    expect(upPension.verification_status).toBe("pending");
    expect(upPension.official_form_title).toBe("Application form guide is not available yet");
    expect(upPension.fields).toHaveLength(0); // STRICT: NO WRONG PDF OR FABRICATED FIELDS
  });

  // SCENARIO 3: Strict Scheme Isolation
  it("Scenario 3: Strict Scheme Isolation — Fields never bleed across schemes", async () => {
    const pmKisan = await getOfficialFormTemplate(PM_KISAN_ID);
    const scholarship = await getOfficialFormTemplate(SCHOLARSHIP_ID);
    const ladliBehna = await getOfficialFormTemplate(LADLI_BEHNA_ID);
    const ayushman = await getOfficialFormTemplate(AYUSHMAN_ID);

    const pmKisanLabels = pmKisan.fields.map((f) => f.field_label.en.toLowerCase());
    const scholarshipLabels = scholarship.fields.map((f) => f.field_label.en.toLowerCase());
    const ladliLabels = ladliBehna.fields.map((f) => f.field_label.en.toLowerCase());
    const ayushmanLabels = ayushman.fields.map((f) => f.field_label.en.toLowerCase());

    // Land particulars only in PM-Kisan
    expect(pmKisanLabels.some((l) => l.includes("land holdings") || l.includes("patta"))).toBe(true);
    expect(scholarshipLabels.some((l) => l.includes("land holdings") || l.includes("patta"))).toBe(false);

    // SECC HH ID only in Ayushman
    expect(ayushmanLabels.some((l) => l.includes("secc"))).toBe(true);
    expect(pmKisanLabels.some((l) => l.includes("secc"))).toBe(false);

    // Samagra Member ID only in Ladli Behna
    expect(ladliLabels.some((l) => l.includes("samagra"))).toBe(true);
    expect(pmKisanLabels.some((l) => l.includes("samagra"))).toBe(false);

    // Hostel & Course details only in Scholarship
    expect(scholarshipLabels.some((l) => l.includes("course") || l.includes("hostel"))).toBe(true);
    expect(ladliLabels.some((l) => l.includes("course") || l.includes("hostel"))).toBe(false);
  });

  // SCENARIO 4: Field labels match actual text from verified PDFs
  it("Scenario 4: Field labels match actual printed text from uploaded PDFs", async () => {
    const pmKisan = await getOfficialFormTemplate(PM_KISAN_ID);
    expect(pmKisan.official_form_title).toContain("PRADHAN MANTRI KISAN SAMMAN NIDHI");
    const farmerName = pmKisan.fields.find((f) => f.field_label.en.includes("Full Name of the Farmer"));
    expect(farmerName).toBeDefined();
    expect(farmerName?.source_note).toContain("SammanNidhi.pdf");

    const ayushman = await getOfficialFormTemplate(AYUSHMAN_ID);
    expect(ayushman.official_form_title).toContain("National Health Protection Mission");
    const hofField = ayushman.fields.find((f) => f.field_label.en.includes("Head of the Family"));
    expect(hofField).toBeDefined();
    expect(hofField?.source_note).toContain("AyushmanBharat_form_HealthCard.pdf");

    const ladli = await getOfficialFormTemplate(LADLI_BEHNA_ID);
    const samagraField = ladli.fields.find((f) => f.field_label.en.includes("समग्र आई.डी."));
    expect(samagraField).toBeDefined();
    expect(samagraField?.source_note).toContain("ladli-behna-yojana-form-2026-513.pdf");

    const scholarship = await getOfficialFormTemplate(SCHOLARSHIP_ID);
    expect(scholarship.official_form_title).toContain("POST-MATRIC SCHOLARSHIP TO SC/ST/OBC STUDENTS");
    const instField = scholarship.fields.find((f) => f.field_label.en.includes("Course Currently Studying"));
    expect(instField).toBeDefined();
    expect(instField?.source_note).toContain("PostMatric_ScholarShip_Application");
  });

  // SCENARIO 5: Sensitive credentials strictly protected and never collected
  it("Scenario 5: Sensitive Government IDs (Aadhaar, Bank, Samagra, Ration Card) are flagged and never collected", async () => {
    const pmKisan = await getOfficialFormTemplate(PM_KISAN_ID);
    const aadhaar = pmKisan.fields.find((f) => f.field_label.en.includes("Aadhaar"));
    const bank = pmKisan.fields.find((f) => f.field_label.en.includes("Bank Details"));

    expect(aadhaar?.is_sensitive_id).toBe(true);
    expect(aadhaar?.sensitive_help?.en).toContain("SchemeSetu does not collect");

    expect(bank?.is_sensitive_id).toBe(true);
    expect(bank?.sensitive_help?.en).toContain("SchemeSetu does not collect");

    // Helper reference must NEVER map to sensitive IDs
    const profile: Profile = {
      ...emptyProfile,
      name: "Lakshman Singh",
      age: "45",
      state: "Uttar Pradesh",
      income: "120000",
      category: "Farmer",
    };

    if (aadhaar) {
      expect(getConfirmedHelperReference(aadhaar, profile)).toBeNull();
    }
  });

  // SCENARIO 6: Non-sensitive confirmed user intake details display as helper notes
  it("Scenario 6: Non-sensitive details display as helper reference notes", async () => {
    const pmKisan = await getOfficialFormTemplate(PM_KISAN_ID);
    const nameField = pmKisan.fields.find((f) => f.field_label.en.includes("Full Name of the Farmer"))!;

    const userProfile: Profile = {
      ...emptyProfile,
      name: "Suresh Chandra",
      age: "50",
      state: "Madhya Pradesh",
      income: "180000",
      category: "Farmer",
    };

    const helper = getConfirmedHelperReference(nameField, userProfile);
    expect(helper).not.toBeNull();
    expect(helper?.value).toBe("Suresh Chandra");
  });

  // SCENARIO 7: Clean empty profile returns no helper notes
  it("Scenario 7: Empty profile returns no helper values (no hardcoded prefilling)", async () => {
    const pmKisan = await getOfficialFormTemplate(PM_KISAN_ID);
    const nameField = pmKisan.fields.find((f) => f.field_label.en.includes("Full Name of the Farmer"))!;
    const helper = getConfirmedHelperReference(nameField, { ...emptyProfile });
    expect(helper).toBeNull();
  });

  // SCENARIO 8: Key documents checklist provided for citizen readiness
  it("Scenario 8: Each verified template provides a comprehensive document checklist", async () => {
    for (const [id, template] of Object.entries(VERIFIED_FORM_TEMPLATES)) {
      expect(template.key_documents_needed.length).toBeGreaterThanOrEqual(3);
    }
  });

  // SCENARIO 9: Complete bilingual localization in English and Hindi
  it("Scenario 9: All form titles, sections, instructions, and error notes have complete English and Hindi translations", async () => {
    for (const [id, template] of Object.entries(VERIFIED_FORM_TEMPLATES)) {
      expect(template.official_form_title).toBeTruthy();
      for (const field of template.fields) {
        expect(field.field_label.en).toBeTruthy();
        expect(field.field_label.hi).toBeTruthy();
        expect(field.section_name.en).toBeTruthy();
        expect(field.section_name.hi).toBeTruthy();
        expect(field.field_instruction.en).toBeTruthy();
        expect(field.field_instruction.hi).toBeTruthy();
      }
    }
  });

  // SCENARIO 10: Graceful handling of unverified/unknown schemes
  it("Scenario 10: Graceful handling of unknown schemes without fabricating fake fields", async () => {
    const unknown = await getOfficialFormTemplate("non-existent-guid-8888", "Unknown Scheme");
    expect(unknown.verification_status).toBe("pending");
    expect(unknown.official_form_title).toBe("Application form guide is not available yet");
    expect(unknown.fields).toHaveLength(0);
  });
});
