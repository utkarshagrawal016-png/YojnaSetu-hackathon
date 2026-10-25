import { describe, expect, it } from "vitest";
import {
  getOfficialPortalInfo,
  OFFICIAL_PORTALS,
  copyToClipboard,
} from "../services/officialPortalService";

describe("Official Portal Integration & Application Bridge Suite", () => {
  // Test 1: Selected Scheme 1 (PM-Kisan) has verified official URL and portal domain
  it("Scheme 1: PM-Kisan Samman Nidhi has verified application URL on pmkisan.gov.in", () => {
    const schemeId = "45170ee9-d661-4746-a2bf-9d781719de7d";
    const portal = getOfficialPortalInfo(schemeId, "PM-Kisan Samman Nidhi");

    expect(portal.domain).toBe("pmkisan.gov.in");
    expect(portal.portalUrl).toBe("https://pmkisan.gov.in");
    expect(portal.directApplicationUrl).toBe("https://pmkisan.gov.in/RegistrationFormupdated.aspx");
  });

  // Test 2: Automation feasibility assessment correctly flags security controls
  it("Technical Feasibility: Direct headless automation is safely flagged as not supported due to OTP & CAPTCHA", () => {
    const schemeId = "45170ee9-d661-4746-a2bf-9d781719de7d";
    const portal = getOfficialPortalInfo(schemeId, "PM-Kisan Samman Nidhi");

    expect(portal.isAutomatedFillingFeasible).toBe(false);
    expect(portal.securityControls).toContain("UIDAI Aadhaar e-KYC (SMS OTP)");
    expect(portal.securityControls).toContain("Graphic Image CAPTCHA (Captcha.aspx)");
    expect(portal.securityControls).toContain("Client-side AES-128 Data Encryption");
    expect(portal.feasibilityReason.en).toContain("government security controls");
  });

  // Test 3: Guidance steps exist to assist user on the official portal
  it("Guidance Steps: Step-by-step instructions provided for official portal entry", () => {
    const schemeId = "45170ee9-d661-4746-a2bf-9d781719de7d";
    const portal = getOfficialPortalInfo(schemeId, "PM-Kisan Samman Nidhi");

    expect(portal.guidanceSteps.length).toBeGreaterThanOrEqual(4);
    expect(portal.guidanceSteps[0]?.en).toContain("Farmer Registration");
  });

  // Test 4: Other schemes also map to their verified official domains
  it("Other Schemes: Ayushman Bharat, NSP, and UP BOCW map to verified government domains", () => {
    const ayushman = getOfficialPortalInfo("227a5a63-56fd-4d39-a281-3d3f5dbec2bd", "Ayushman Bharat");
    expect(ayushman.domain).toBe("beneficiary.nha.gov.in");

    const scholarship = getOfficialPortalInfo("36fa81fa-f5cc-4f72-8c0e-9adfb4f84559", "Post-Matric Scholarship");
    expect(scholarship.domain).toBe("scholarships.gov.in");

    const upPension = getOfficialPortalInfo("e3cb111a-cbe3-41f4-9eae-c056e79ecfe7", "UP Shramik Pension");
    expect(upPension.domain).toBe("upbocw.in");
  });

  // Test 5: Fallback for unknown scheme IDs resolves to india.gov.in safely
  it("Fallback Scheme: Unknown scheme IDs route safely to national india.gov.in portal", () => {
    const fallback = getOfficialPortalInfo("unknown-scheme-999", "New Regional Welfare Scheme");
    expect(fallback.domain).toBe("india.gov.in");
    expect(fallback.portalUrl).toBe("https://india.gov.in");
    expect(fallback.isAutomatedFillingFeasible).toBe(false);
  });
});
