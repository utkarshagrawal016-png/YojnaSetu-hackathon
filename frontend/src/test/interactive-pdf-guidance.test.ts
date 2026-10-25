import { describe, it, expect } from "vitest";
import {
  getSchemePdfGuidance,
  SCHEME_PDF_GUIDANCE_MAP,
} from "@/services/pdfGuidanceService";
import { getConfirmedHelperReference } from "@/services/formTemplateService";
import type { Profile } from "@/lib/welfare-demo";

describe("Module 6: Interactive PDF Guidance & Field Marker Verification", () => {
  // Test Scheme IDs
  const PM_KISAN_ID = "45170ee9-d661-4746-a2bf-9d781719de7d";
  const AYUSHMAN_ID = "227a5a63-56fd-4d39-a281-3d3f5dbec2bd";
  const LADLI_BEHNA_ID = "fe7ab07d-d4e0-4fde-bc14-91489c080c1a";
  const SCHOLARSHIP_ID = "36fa81fa-f5cc-4f72-8c0e-9adfb4f84559";
  const PENSION_UP_ID = "e3cb111a-cbe3-41f4-9eae-c056e79ecfe7";

  // -------------------------------------------------------------------------
  // 1. Storage PDF Mapping & Availability
  // -------------------------------------------------------------------------
  it("Scenario 1: Verified mapping to Supabase Storage PDFs for the 4 available schemes", () => {
    // 1. PM-Kisan
    const pmk = getSchemePdfGuidance(PM_KISAN_ID);
    expect(pmk.is_available).toBe(true);
    expect(pmk.pdf_storage_path).toBe("SammanNidhi.pdf");
    expect(pmk.public_pdf_url).toContain("Scheme_Forms/SammanNidhi.pdf");
    expect(pmk.total_pages).toBe(3);
    expect(pmk.markers.length).toBeGreaterThanOrEqual(15);

    // 2. Ayushman Bharat
    const ayush = getSchemePdfGuidance(AYUSHMAN_ID);
    expect(ayush.is_available).toBe(true);
    expect(ayush.pdf_storage_path).toBe("AyushmanBharat_form_HealthCard.pdf");
    expect(ayush.public_pdf_url).toContain("Scheme_Forms/AyushmanBharat_form_HealthCard.pdf");
    expect(ayush.total_pages).toBe(1);
    expect(ayush.markers.length).toBeGreaterThanOrEqual(8);

    // 3. Ladli Behna Yojana
    const ladli = getSchemePdfGuidance(LADLI_BEHNA_ID);
    expect(ladli.is_available).toBe(true);
    expect(ladli.pdf_storage_path).toBe("ladli-behna-yojana-form-2026-513.pdf");
    expect(ladli.public_pdf_url).toContain("Scheme_Forms/ladli-behna-yojana-form-2026-513.pdf");
    expect(ladli.total_pages).toBe(1);
    expect(ladli.markers.length).toBeGreaterThanOrEqual(10);

    // 4. Post-Matric Scholarship (must preserve trailing space in filename)
    const sch = getSchemePdfGuidance(SCHOLARSHIP_ID);
    expect(sch.is_available).toBe(true);
    expect(sch.pdf_storage_path).toBe("PostMatric_ScholarShip_Application .pdf");
    expect(sch.public_pdf_url).toContain("PostMatric_ScholarShip_Application%20.pdf");
    expect(sch.total_pages).toBe(2);
    expect(sch.markers.length).toBeGreaterThanOrEqual(12);
  });

  // -------------------------------------------------------------------------
  // 2. 5th Scheme (UP Shramik Pension) - Guided form coming soon
  // -------------------------------------------------------------------------
  it("Scenario 2: UP Shramik Pension shows clear pending state without fabricated fake form", () => {
    const pension = getSchemePdfGuidance(PENSION_UP_ID);
    expect(pension.is_available).toBe(false);
    expect(pension.public_pdf_url).toBeNull();
    expect(pension.pdf_storage_path).toBeNull();
    expect(pension.markers.length).toBe(0);
  });

  // -------------------------------------------------------------------------
  // 3. Multi-page support (PM-Kisan has 3 pages, Scholarship has 2 pages)
  // -------------------------------------------------------------------------
  it("Scenario 3: Multi-page schemes have correctly segregated markers per page", () => {
    // PM-Kisan
    const pmk = getSchemePdfGuidance(PM_KISAN_ID);
    const pmkP1 = pmk.markers.filter((m) => m.page_number === 1);
    const pmkP2 = pmk.markers.filter((m) => m.page_number === 2);
    expect(pmkP1.length).toBe(14);
    expect(pmkP2.length).toBe(6);

    // Scholarship
    const sch = getSchemePdfGuidance(SCHOLARSHIP_ID);
    const schP1 = sch.markers.filter((m) => m.page_number === 1);
    const schP2 = sch.markers.filter((m) => m.page_number === 2);
    expect(schP1.length).toBe(21);
    expect(schP2.length).toBe(3);
  });

  // -------------------------------------------------------------------------
  // 4. Coordinate Validity and Range Checks
  // -------------------------------------------------------------------------
  it("Scenario 4: All guidance markers have valid percentage coordinates bounded between 0 and 100", () => {
    for (const [schemeId, info] of Object.entries(SCHEME_PDF_GUIDANCE_MAP)) {
      if (!info.is_available) continue;

      info.markers.forEach((marker) => {
        expect(marker.scheme_id).toBe(schemeId);
        expect(marker.top_pct).toBeGreaterThan(0);
        expect(marker.top_pct).toBeLessThan(100);
        expect(marker.left_pct).toBeGreaterThan(0);
        expect(marker.left_pct).toBeLessThan(100);
        expect(marker.page_number).toBeGreaterThanOrEqual(1);
        expect(marker.page_number).toBeLessThanOrEqual(info.total_pages);
        expect(marker.display_number).toBeGreaterThanOrEqual(1);

        // Bilingual requirements
        expect(marker.field_label.en.trim().length).toBeGreaterThan(0);
        expect(marker.field_label.hi.trim().length).toBeGreaterThan(0);
        expect(marker.guidance_text.en.trim().length).toBeGreaterThan(0);
        expect(marker.guidance_text.hi.trim().length).toBeGreaterThan(0);
      });
    }
  });

  // -------------------------------------------------------------------------
  // 5. Sensitive Government ID Protections
  // -------------------------------------------------------------------------
  it("Scenario 5: Sensitive credentials (Aadhaar, Bank, Samagra) are flagged with is_sensitive_id: true", () => {
    // PM-Kisan Aadhaar and Bank Account
    const pmk = getSchemePdfGuidance(PM_KISAN_ID);
    const pmkAadhaar = pmk.markers.find((m) => m.field_label.en.includes("Aadhaar"));
    const pmkBank = pmk.markers.find((m) => m.field_label.en.includes("Account number"));
    expect(pmkAadhaar?.is_sensitive_id).toBe(true);
    expect(pmkAadhaar?.guidance_text?.en).toContain("SchemeSetu does not collect or store your Aadhaar");
    expect(pmkAadhaar?.sensitive_notice?.en).toBeDefined();
    expect(pmkBank?.is_sensitive_id).toBe(true);

    // Ladli Behna Samagra and Aadhaar
    const ladli = getSchemePdfGuidance(LADLI_BEHNA_ID);
    const ladliSamagra = ladli.markers.find((m) => m.field_label.en.includes("Samagra"));
    const ladliAadhaar = ladli.markers.find((m) => m.field_label.en.includes("Aadhaar"));
    expect(ladliSamagra?.is_sensitive_id).toBe(true);
    expect(ladliAadhaar?.is_sensitive_id).toBe(true);

    // Ayushman Bharat Aadhaar & Ration Card
    const ayush = getSchemePdfGuidance(AYUSHMAN_ID);
    const ayushAadhaar = ayush.markers.find((m) => m.field_label.en.includes("Aadhaar Card No"));
    const ayushRation = ayush.markers.find((m) => m.field_label.en.toLowerCase().includes("ration"));
    expect(ayushAadhaar?.is_sensitive_id).toBe(true);
    expect(ayushRation?.is_sensitive_id).toBe(true);
  });

  // -------------------------------------------------------------------------
  // 6. Confirmed Intake Details Integration (Non-sensitive helper)
  // -------------------------------------------------------------------------
  it("Scenario 6: Non-sensitive confirmed intake details can assist form filling without fabricating info", () => {
    const userProfile: Profile = {
      name: "Ramesh Kumar",
      age: "42",
      income: "85000",
      state: "Uttar Pradesh",
      category: "OBC",
    };

    // Name field match
    const nameHelper = getConfirmedHelperReference("6. Name of the Farmer", userProfile);
    expect(nameHelper).not.toBeNull();
    expect(nameHelper?.value).toBe("Ramesh Kumar");

    // Income field match
    const incomeHelper = getConfirmedHelperReference("10. Annual Family Income", userProfile);
    expect(incomeHelper).not.toBeNull();
    expect(incomeHelper?.value).toBe("₹85,000");

    // Empty profile should never fabricate values
    const emptyProfile: Profile = {
      name: "",
      age: "",
      income: "",
      state: "",
      category: "",
    };
    const emptyHelper = getConfirmedHelperReference("6. Name of the Farmer", emptyProfile);
    expect(emptyHelper).toBeNull();
  });

  // -------------------------------------------------------------------------
  // 7. Post-Matric Scholarship: Name of Applicant Field Guidance Verification
  // -------------------------------------------------------------------------
  it("Scenario 7: Post-Matric Scholarship 'Name of Applicant' displays required field title, clear guidance, and example", () => {
    const sch = getSchemePdfGuidance(SCHOLARSHIP_ID);
    const nameMarker = sch.markers.find(
      (m) => m.field_label.en.toLowerCase().includes("name of applicant") || m.id === "nsp-g2"
    );

    expect(nameMarker).toBeDefined();
    expect(nameMarker?.display_number).toBe(2);
    expect(nameMarker?.page_number).toBe(1);
    expect(nameMarker?.field_label.en).toContain("Full Name of Applicant");
    expect(nameMarker?.field_label.hi).toContain("छात्र का पूरा नाम");
    expect(nameMarker?.required).toBe(true);
    expect(nameMarker?.guidance_text.en).toContain("BLOCK capital letters");
    expect(nameMarker?.example?.en).toContain("AMITAVA SARKAR");
    expect(nameMarker?.is_sensitive_id).toBe(false);
  });

  // -------------------------------------------------------------------------
  // 8. Intelligent In-PDF Popover Placement
  // -------------------------------------------------------------------------
  it("Scenario 8: Popover placement intelligently positions tooltips beside fields and prevents clipping", async () => {
    const { getPopoverPlacement } = await import("@/components/InteractiveGuidedPdfViewer");
    const sch = getSchemePdfGuidance(SCHOLARSHIP_ID);
    const nameMarker = sch.markers.find((m) => m.id === "nsp-g2")!;

    // 1. Left side marker (8.5% left) with standard 800px page -> places to the right
    const placementRight = getPopoverPlacement(nameMarker, 800, 1100, 320);
    expect(placementRight.side).toBe("right");
    expect(placementRight.vAlign).toBe("top"); // top_pct is 12.5% (< 16%), so top-aligned to avoid top clipping
    expect(placementRight.popoverStyle.left).toBe("calc(100% + 14px)");

    // 2. Right side marker (75% left) -> places to the left
    const rightSideMarker = {
      ...nameMarker,
      left_pct: 75,
      top_pct: 45,
    };
    const placementLeft = getPopoverPlacement(rightSideMarker, 800, 1100, 320);
    expect(placementLeft.side).toBe("left");
    expect(placementLeft.vAlign).toBe("center");
    expect(placementLeft.popoverStyle.right).toBe("calc(100% + 14px)");

    // 3. Narrow container (400px width) with centered marker -> places below (bottom)
    const centerMarker = { ...nameMarker, left_pct: 50 };
    const placementBottom = getPopoverPlacement(centerMarker, 400, 1100, 320);
    expect(placementBottom.side).toBe("bottom");
    expect(placementBottom.popoverStyle.top).toBe("calc(100% + 12px)");

    // 4. Bottom marker (88% top) -> bottom-anchored vertical alignment
    const bottomMarker = sch.markers.find((m) => m.id === "nsp-g10")!;
    const placementBottomAnchor = getPopoverPlacement(bottomMarker, 800, 1100, 320);
    expect(placementBottomAnchor.vAlign).toBe("bottom");
  });

  // -------------------------------------------------------------------------
  // 9. Direct In-Field Instructional Hint Text (English & Hindi)
  // -------------------------------------------------------------------------
  it("Scenario 9: All fields across all 4 schemes have clean bracketed in-field hint text in both English and Hindi", () => {
    for (const [schemeId, info] of Object.entries(SCHEME_PDF_GUIDANCE_MAP)) {
      if (!info.is_available) continue;

      info.markers.forEach((marker) => {
        expect(marker.hint_text).toBeDefined();
        expect(marker.hint_text.en).toBeDefined();
        expect(marker.hint_text.hi).toBeDefined();

        expect(marker.hint_text.en.startsWith("[")).toBe(true);
        expect(marker.hint_text.en.endsWith("]")).toBe(true);
        expect(marker.hint_text.hi.startsWith("[")).toBe(true);
        expect(marker.hint_text.hi.endsWith("]")).toBe(true);

        // Devanagari script characters check for Hindi hint
        const hasDevanagari = /[\u0900-\u097F]/.test(marker.hint_text.hi);
        expect(hasDevanagari).toBe(true);
      });
    }
  });

  // -------------------------------------------------------------------------
  // 10. Required Field Examples & Sensitive ID Protection
  // -------------------------------------------------------------------------
  it("Scenario 10: In-field hints for Applicant Name, Date of Birth, and Sensitive IDs follow exact guidance requirements", () => {
    // 1. Post-Matric Scholarship Name & DOB
    const sch = getSchemePdfGuidance(SCHOLARSHIP_ID);
    const nameField = sch.markers.find((m) => m.id === "nsp-g2")!;
    expect(nameField.hint_text.en).toContain("BLOCK letters");
    expect(nameField.hint_text.hi).toContain("यहाँ अपना पूरा नाम");

    const dobField = sch.markers.find((m) => m.id === "nsp-g4")!;
    expect(dobField.hint_text.en).toContain("DD/MM/YYYY");
    expect(dobField.hint_text.hi).toContain("यहाँ अपनी जन्म तिथि लिखें");

    // 2. Sensitive ID Fields (PM-Kisan Aadhaar & Scholarship Bank Account)
    const pmkSensitive = getSchemePdfGuidance(PM_KISAN_ID);
    const pmkAadhaarField = pmkSensitive.markers.find((m) => m.field_label.en.includes("Aadhaar"))!;
    expect(pmkAadhaarField.is_sensitive_id).toBe(true);
    expect(pmkAadhaarField.hint_text.en).toContain("Aadhaar");
    expect(pmkAadhaarField.hint_text.hi).toContain("आधार नंबर");

    const schBankField = sch.markers.find((m) => m.id === "nsp-g8")!;
    expect(schBankField.is_sensitive_id).toBe(true);
    expect(schBankField.hint_text.en).toContain("Savings Account");
    expect(schBankField.hint_text.hi).toContain("बचत खाता");

    // 3. PM-Kisan Farmer Name & District
    const pmk = getSchemePdfGuidance(PM_KISAN_ID);
    const pmkFarmerName = pmk.markers.find((m) => m.id === "pmk-g6")!;
    expect(pmkFarmerName.hint_text.en).toContain("farmer's full name");
    expect(pmkFarmerName.hint_text.hi).toContain("किसान का पूरा नाम");

    // 4. Ladli Behna Samagra & Woman Name
    const ladli = getSchemePdfGuidance(LADLI_BEHNA_ID);
    const lbSamagra = ladli.markers.find((m) => m.id === "lb-g1")!;
    expect(lbSamagra.is_sensitive_id).toBe(true);
    expect(lbSamagra.hint_text.en).toContain("Samagra");
    expect(lbSamagra.hint_text.hi).toContain("समग्र");
  });

  // -------------------------------------------------------------------------
  // 11. Coordinate Alignment onto Blank Writing Lines
  // -------------------------------------------------------------------------
  it("Scenario 11: Field coordinates are positioned directly onto blank writing lines rather than overlying form labels", () => {
    const sch = getSchemePdfGuidance(SCHOLARSHIP_ID);
    const nameField = sch.markers.find((m) => m.id === "nsp-g2")!;
    // Label ends at ~36% left; field begins on the underline at 38%
    expect(nameField.left_pct).toBe(38.0);
    expect(nameField.top_pct).toBe(12.8);

    const dobField = sch.markers.find((m) => m.id === "nsp-g4")!;
    // Label ends at ~19% left; field begins on the underline at 20%
    expect(dobField.left_pct).toBe(20.0);
    expect(dobField.top_pct).toBe(17.4);

    const pmk = getSchemePdfGuidance(PM_KISAN_ID);
    const districtField = pmk.markers.find((m) => m.id === "pmk-g1")!;
    // Label ends at ~17.5% left; field begins on underline at 18.5%
    expect(districtField.left_pct).toBe(18.5);
    expect(districtField.top_pct).toBe(17.9);
  });
});

