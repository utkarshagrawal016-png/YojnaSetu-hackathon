/**
 * Module 4: Official Government Portal Bridge & Guided Application Assistant
 * Provides verified official application URLs and security feasibility assessments
 */

export interface OfficialPortalInfo {
  schemeId: string;
  schemeName: string;
  domain: string;
  portalUrl: string;
  directApplicationUrl: string;
  isAutomatedFillingFeasible: boolean;
  feasibilityReason: { en: string; hi: string };
  securityControls: string[];
  guidanceSteps: { en: string; hi: string }[];
}

export const OFFICIAL_PORTALS: Record<string, OfficialPortalInfo> = {
  // Flagship Scheme 1: PM-Kisan Samman Nidhi
  "45170ee9-d661-4746-a2bf-9d781719de7d": {
    schemeId: "45170ee9-d661-4746-a2bf-9d781719de7d",
    schemeName: "PM-Kisan Samman Nidhi",
    domain: "pmkisan.gov.in",
    portalUrl: "https://pmkisan.gov.in",
    directApplicationUrl: "https://pmkisan.gov.in/RegistrationFormupdated.aspx",
    isAutomatedFillingFeasible: false,
    feasibilityReason: {
      en: "Direct headless browser automation is not supported due to mandatory government security controls: UIDAI Aadhaar SMS OTP verification, graphic CAPTCHA, and client-side AES-128 encryption with dynamic server tokens.",
      hi: "सरकारी सुरक्षा नियमों के कारण स्वचालित फॉर्म भरना समर्थित नहीं है: पोर्टल पर आधार ओटीपी, ग्राफिकल कैप्चा और सरकारी एईएस एन्क्रिप्शन अनिवार्य है।",
    },
    securityControls: [
      "UIDAI Aadhaar e-KYC (SMS OTP)",
      "Graphic Image CAPTCHA (Captcha.aspx)",
      "Client-side AES-128 Data Encryption",
      "ASP.NET ViewState & EventValidation Protection",
    ],
    guidanceSteps: [
      {
        en: "Choose 'Rural Farmer Registration' or 'Urban Farmer Registration'.",
        hi: "'ग्रामीण किसान पंजीकरण' या 'शहरी किसान पंजीकरण' चुनें।",
      },
      {
        en: "Enter your Aadhaar Number and active Mobile Number.",
        hi: "अपना आधार नंबर और मोबाइल नंबर दर्ज करें।",
      },
      {
        en: "Select your State and enter the graphic CAPTCHA code.",
        hi: "अपना राज्य चुनें और कैप्चा कोड भरें।",
      },
      {
        en: "Click 'Get OTP' to receive official verification code on your mobile.",
        hi: "'Get OTP' दबाएं और मोबाइल पर आया ओटीपी दर्ज करें।",
      },
      {
        en: "Use the copy buttons on this page to paste your confirmed details.",
        hi: "पुष्ट विवरणों को आधिकारिक पोर्टल में चिपकाने के लिए यहां कॉपी बटन का उपयोग करें।",
      },
    ],
  },
  "pm-kisan": {
    schemeId: "pm-kisan",
    schemeName: "PM-Kisan Samman Nidhi",
    domain: "pmkisan.gov.in",
    portalUrl: "https://pmkisan.gov.in",
    directApplicationUrl: "https://pmkisan.gov.in/RegistrationFormupdated.aspx",
    isAutomatedFillingFeasible: false,
    feasibilityReason: {
      en: "Direct headless browser automation is not supported due to mandatory government security controls: UIDAI Aadhaar SMS OTP verification, graphic CAPTCHA, and client-side AES-128 encryption.",
      hi: "सरकारी सुरक्षा नियमों के कारण स्वचालित फॉर्म भरना समर्थित नहीं है: पोर्टल पर आधार ओटीपी और कैप्चा अनिवार्य है।",
    },
    securityControls: [
      "UIDAI Aadhaar e-KYC (SMS OTP)",
      "Graphic Image CAPTCHA",
      "Client-side AES-128 Data Encryption",
    ],
    guidanceSteps: [
      {
        en: "Select Rural/Urban Farmer Registration on the official website.",
        hi: "आधिकारिक वेबसाइट पर ग्रामीण या शहरी किसान पंजीकरण चुनें।",
      },
      {
        en: "Enter your Aadhaar Number and Mobile Number.",
        hi: "अपना आधार नंबर और मोबाइल नंबर दर्ज करें।",
      },
      {
        en: "Enter the CAPTCHA and complete mobile OTP verification.",
        hi: "कैप्चा कोड भरें और मोबाइल ओटीपी पूरा करें।",
      },
    ],
  },

  // Scheme 2: Ayushman Bharat (PM-JAY)
  "227a5a63-56fd-4d39-a281-3d3f5dbec2bd": {
    schemeId: "227a5a63-56fd-4d39-a281-3d3f5dbec2bd",
    schemeName: "Ayushman Bharat (PM-JAY)",
    domain: "beneficiary.nha.gov.in",
    portalUrl: "https://beneficiary.nha.gov.in",
    directApplicationUrl: "https://beneficiary.nha.gov.in",
    isAutomatedFillingFeasible: false,
    feasibilityReason: {
      en: "Requires beneficiary mobile authentication, CAPTCHA, and biometric or OTP e-KYC on the National Health Authority portal.",
      hi: "राष्ट्रीय स्वास्थ्य प्राधिकरण पोर्टल पर मोबाइल प्रमाणीकरण और ओटीपी ई-केवाईसी आवश्यक है।",
    },
    securityControls: ["Mobile OTP Login", "Graphic CAPTCHA", "Aadhaar e-KYC"],
    guidanceSteps: [
      {
        en: "Select 'Beneficiary' login on the NHA portal.",
        hi: "एनएचए पोर्टल पर 'Beneficiary' लॉगिन चुनें।",
      },
      {
        en: "Enter your mobile number and authenticate via OTP.",
        hi: "मोबाइल नंबर दर्ज करें और ओटीपी से लॉगिन करें।",
      },
      {
        en: "Search by Ration Card, Aadhaar, or Family ID.",
        hi: "राशन कार्ड या आधार नंबर से अपनी पात्रता खोजें।",
      },
    ],
  },

  // Scheme 3: UP Shramik Pension
  "e3cb111a-cbe3-41f4-9eae-c056e79ecfe7": {
    schemeId: "e3cb111a-cbe3-41f4-9eae-c056e79ecfe7",
    schemeName: "UP Shramik Pension Yojna",
    domain: "upbocw.in",
    portalUrl: "https://upbocw.in",
    directApplicationUrl: "https://upbocw.in",
    isAutomatedFillingFeasible: false,
    feasibilityReason: {
      en: "Requires registration with UP BOCW board with certificate of 90 days construction labor and local CSC verification.",
      hi: "यूपी बीओसीडब्ल्यू बोर्ड पर 90 दिन के श्रमिक प्रमाण पत्र और सीएससी सत्यापन की आवश्यकता होती है।",
    },
    securityControls: ["BOCW Registration Number", "District Verification", "Aadhaar Seeding"],
    guidanceSteps: [
      {
        en: "Visit the UP BOCW portal and click on 'श्रमिक पंजीयन' (Worker Registration).",
        hi: "यूपी बीओसीडब्ल्यू पोर्टल पर 'श्रमिक पंजीयन' चुनें।",
      },
      {
        en: "Enter your Aadhaar number and registered mobile number.",
        hi: "अपना आधार और मोबाइल नंबर भरें।",
      },
    ],
  },

  // Scheme 4: Ladli Behna Yojna
  "fe7ab07d-d4e0-4fde-bc14-91489c080c1a": {
    schemeId: "fe7ab07d-d4e0-4fde-bc14-91489c080c1a",
    schemeName: "Ladli Behna Yojna",
    domain: "cmladlibahna.mp.gov.in",
    portalUrl: "https://cmladlibahna.mp.gov.in",
    directApplicationUrl: "https://cmladlibahna.mp.gov.in",
    isAutomatedFillingFeasible: false,
    feasibilityReason: {
      en: "Applications are submitted through authorized Gram Panchayat / Ward camps with live Samagra e-KYC.",
      hi: "आवेदन ग्राम पंचायत या वार्ड कैंप में समग्र ई-केवाईसी के माध्यम से किए जाते हैं।",
    },
    securityControls: ["Samagra ID Verification", "Aadhaar e-KYC", "In-person Camp Registration"],
    guidanceSteps: [
      {
        en: "Ensure Samagra e-KYC and Bank Aadhaar Link are completed.",
        hi: "समग्र ई-केवाईसी और बैंक आधार लिंक सुनिश्चित करें।",
      },
      {
        en: "Check eligibility status on the official portal.",
        hi: "आधिकारिक पोर्टल पर अपनी स्थिति जांचें।",
      },
    ],
  },

  // Scheme 5: Post-Matric Scholarship
  "36fa81fa-f5cc-4f72-8c0e-9adfb4f84559": {
    schemeId: "36fa81fa-f5cc-4f72-8c0e-9adfb4f84559",
    schemeName: "Post-Matric Scholarship Scheme",
    domain: "scholarships.gov.in",
    portalUrl: "https://scholarships.gov.in",
    directApplicationUrl: "https://scholarships.gov.in",
    isAutomatedFillingFeasible: false,
    feasibilityReason: {
      en: "National Scholarship Portal (NSP) requires One-Time Registration (OTR) with face-authentication or Aadhaar biometric OTP.",
      hi: "राष्ट्रीय छात्रवृत्ति पोर्टल पर वन-टाइम रजिस्ट्रेशन (OTR) और आधार फेस या ओटीपी प्रमाणीकरण आवश्यक है।",
    },
    securityControls: ["NSP One-Time Registration (OTR)", "Aadhaar Face Auth / OTP", "Institute Verification"],
    guidanceSteps: [
      {
        en: "Go to scholarships.gov.in and click 'New Student? Register'.",
        hi: "scholarships.gov.in पर जाएं और 'New Student? Register' पर क्लिक करें।",
      },
      {
        en: "Complete the OTR (One Time Registration) using your Aadhaar or UIDAI FaceRD.",
        hi: "आधार का उपयोग करके ओटीआर (वन टाइम रजिस्ट्रेशन) पूरा करें।",
      },
      {
        en: "Paste your applicant details prepared in SchemeSetu into the application form.",
        hi: "योजनासेतु में तैयार विवरण को छात्रवृत्ति आवेदन में भरें।",
      },
    ],
  },
};

export function getOfficialPortalInfo(
  schemeId: string,
  schemeName: string,
  officialUrl?: string
): OfficialPortalInfo {
  const found = OFFICIAL_PORTALS[schemeId];
  if (found) {
    return found;
  }

  // Resilient support for discovered or unlisted official portals
  const portalUrl = officialUrl || "https://india.gov.in";
  let domain = "india.gov.in";
  try {
    domain = portalUrl.split("//")[-1]?.split("/")[0]?.toLowerCase() || "india.gov.in";
  } catch {
    domain = "india.gov.in";
  }

  return {
    schemeId,
    schemeName,
    domain,
    portalUrl,
    directApplicationUrl: portalUrl,
    isAutomatedFillingFeasible: false,
    feasibilityReason: {
      en: "Official government portals require direct applicant verification (Aadhaar OTP, CAPTCHA). Use SchemeSetu's copy helper to transfer your details safely.",
      hi: "सरकारी पोर्टलों पर आधार ओटीपी व कैप्चा आवश्यक होता है। विवरण सुरक्षित दर्ज करने के लिए योजनासेतु कॉपी सहायक का उपयोग करें।",
    },
    securityControls: ["Citizen Direct Authentication", "Official Portal Security", "UIDAI Aadhaar Verification"],
    guidanceSteps: [
      {
        en: `Visit ${domain} to view active application windows for ${schemeName}.`,
        hi: `${schemeName} के लिए आधिकारिक पोर्टल (${domain}) पर आवेदन प्रक्रिया देखें।`,
      },
      {
        en: "Use YojnaSetu's copy helper to transfer your verified details without typos.",
        hi: "पुष्ट विवरणों को आधिकारिक पोर्टल में चिपकाने के लिए यहां कॉपी बटन का उपयोग करें।",
      },
    ],
  };
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    // Fallback for older browsers
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    const success = document.execCommand("copy");
    document.body.removeChild(textarea);
    return success;
  } catch {
    return false;
  }
}
