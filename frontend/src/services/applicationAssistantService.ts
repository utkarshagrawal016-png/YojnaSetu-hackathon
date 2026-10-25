/**
 * Application Assistance Service
 * Coordinates document readiness, profile reuse, missing fields intake,
 * validation, official portal feasibility evaluation, and safe field mapping.
 */

import type { Profile } from "@/lib/welfare-demo";
import type { DbScheme } from "@/services/schemeService";

export interface ApplicationIntakeData {
  name: string;
  age: string;
  income: string;
  state: string;
  category: string;
  gender: string;
  mobile: string;
  fatherOrSpouseName: string;
  schemeSpecificFields: Record<string, string>;
}

export interface DocumentChecklistItem {
  id: string;
  name: { en: string; hi: string };
  description: { en: string; hi: string };
  isMandatory: boolean;
  isAvailable: boolean;
}

export interface FieldMapping {
  field_id: string;
  official_label_en: string;
  official_label_hi: string;
  mapped_value: string | null;
  source: string;
  is_sensitive: boolean;
  status: "ready" | "missing" | "optional" | "user_enters_on_portal";
  instruction: string;
}

export interface SubmissionInstruction {
  step: number;
  title_en: string;
  title_hi: string;
  desc_en: string;
  desc_hi: string;
}

export interface PortalEvaluationResult {
  scheme_id: string;
  scheme_name: string;
  portal_url: string;
  domain: string;
  is_automated_filling_feasible: boolean;
  feasibility_reason: { en: string; hi: string };
  security_controls: string[];
  field_mappings: FieldMapping[];
  submission_instructions: SubmissionInstruction[];
  user_submission_notice: { en: string; hi: string };
}

const BACKEND_URL = (import.meta.env["VITE_BACKEND_URL"] as string | undefined) || "http://127.0.0.1:8001";

/**
 * Generates an initial document checklist from scheme metadata
 */
export function getDefaultDocumentChecklist(scheme: DbScheme): DocumentChecklistItem[] {
  const docs: DocumentChecklistItem[] = [
    {
      id: "doc-aadhaar",
      name: { en: "Aadhaar Card", hi: "आधार कार्ड" },
      description: {
        en: "Primary identity document with active mobile link for e-KYC OTP verification.",
        hi: "e-KYC ओटीपी सत्यापन हेतु आधार कार्ड मोबाइल से लिंक होना आवश्यक है।",
      },
      isMandatory: true,
      isAvailable: false,
    },
    {
      id: "doc-bank",
      name: { en: "Bank Passbook / Cancelled Cheque", hi: "बैंक पासबुक / चेक" },
      description: {
        en: "Active bank savings account linked with Aadhaar for Direct Benefit Transfer (DBT).",
        hi: "प्रत्यक्ष लाभ हस्तांतरण (DBT) के लिए आधार से जुड़ा सक्रिय बैंक खाता।",
      },
      isMandatory: true,
      isAvailable: false,
    },
    {
      id: "doc-income",
      name: { en: "Income Certificate / Self-Declaration", hi: "आय प्रमाण पत्र / स्व-घोषणा" },
      description: {
        en: "Certified by competent revenue authority (Tehsildar / SDO) or declared in application.",
        hi: "सक्षम राजस्व अधिकारी द्वारा जारी या आवेदन में घोषित वार्षिक आय प्रमाण।",
      },
      isMandatory: true,
      isAvailable: false,
    },
    {
      id: "doc-domicile",
      name: { en: "Residence / Domicile Certificate", hi: "मूल निवास प्रमाण पत्र" },
      description: {
        en: "Proof of residence in the scheme's eligible state or locality.",
        hi: "योजना के पात्र राज्य अथवा क्षेत्र का स्थानीय निवास प्रमाण।",
      },
      isMandatory: false,
      isAvailable: false,
    },
  ];

  // Additional scheme-specific document items
  const cat = (scheme.category || "").toLowerCase();
  const name = (scheme.name || "").toLowerCase();

  if (cat.includes("agri") || name.includes("kisan")) {
    docs.push({
      id: "doc-land",
      name: { en: "Land Ownership Record (Khatauni / Khasra)", hi: "भूमि स्वामित्व अभिलेख (खतौनी / खसरा)" },
      description: {
        en: "Updated land revenue record certifying agricultural land holding.",
        hi: "कृषि भूमि का अद्यतन राजस्व अभिलेख।",
      },
      isMandatory: true,
      isAvailable: false,
    });
  } else if (cat.includes("business") || name.includes("loan") || name.includes("mudra") || name.includes("pmegp")) {
    docs.push({
      id: "doc-project",
      name: { en: "Business Project Profile / Proposal", hi: "परियोजना विवरण / व्यापार प्रस्ताव" },
      description: {
        en: "Basic summary of the micro-enterprise, shop, or trade you plan to establish.",
        hi: "शुरू किए जाने वाले व्यवसाय, दुकान या सूक्ष्म उद्योग का सामान्य विवरण।",
      },
      isMandatory: false,
      isAvailable: false,
    });
  } else if (cat.includes("edu") || name.includes("scholarship")) {
    docs.push({
      id: "doc-education",
      name: { en: "Fee Receipt / Marksheet / College ID", hi: "फीस रसीद / अंकतालिका / कॉलेज पहचान पत्र" },
      description: {
        en: "Proof of current admission in an approved educational institution.",
        hi: "मान्यता प्राप्त शिक्षण संस्थान में वर्तमान प्रवेश का प्रमाण।",
      },
      isMandatory: true,
      isAvailable: false,
    });
  } else if (cat.includes("women") || name.includes("ladli")) {
    docs.push({
      id: "doc-samagra",
      name: { en: "Family ID / Samagra ID (if applicable)", hi: "समग्र आईडी / परिवार पहचान पत्र" },
      description: {
        en: "State family register identity for women welfare programs.",
        hi: "महिला कल्याण योजनाओं के लिए राज्य परिवार रजिस्टर पहचान।",
      },
      isMandatory: false,
      isAvailable: false,
    });
  }

  return docs;
}

/**
 * Initializes intake data reusing confirmed values from user profile
 */
export function initializeIntakeFromProfile(profile: Profile): ApplicationIntakeData {
  return {
    name: profile.name || "",
    age: profile.age || "",
    income: profile.income || "",
    state: profile.state || "",
    category: profile.category || "",
    gender: "",
    mobile: "",
    fatherOrSpouseName: "",
    schemeSpecificFields: {},
  };
}

/**
 * Validates intake fields with user-friendly error messages
 */
export function validateIntakeData(
  data: ApplicationIntakeData,
  lang: "en" | "hi" = "en"
): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  const isEn = lang === "en";

  if (!data.name.trim()) {
    errors.name = isEn ? "Please enter your full name as per Aadhaar." : "कृपया आधार कार्ड के अनुसार अपना पूरा नाम लिखें।";
  }

  const ageNum = parseInt(data.age, 10);
  if (!data.age.trim() || isNaN(ageNum) || ageNum <= 0 || ageNum > 120) {
    errors.age = isEn ? "Please enter a valid age between 1 and 120 years." : "कृपया 1 से 120 वर्ष के बीच सही आयु दर्ज करें।";
  }

  const cleanIncome = data.income.replace(/[^\d.]/g, "");
  const incomeNum = parseFloat(cleanIncome);
  if (!data.income.trim() || isNaN(incomeNum) || incomeNum < 0) {
    errors.income = isEn ? "Please enter a valid annual family income." : "कृपया सही वार्षिक पारिवारिक आय दर्ज करें।";
  }

  if (!data.state.trim() || data.state === "All States") {
    errors.state = isEn ? "Please select your state of domicile." : "कृपया अपना मूल निवास राज्य चुनें।";
  }

  if (!data.category.trim()) {
    errors.category = isEn ? "Please select your category / occupation." : "कृपया अपनी श्रेणी या पेशा चुनें।";
  }

  if (data.mobile.trim()) {
    const cleanMobile = data.mobile.replace(/\D/g, "");
    if (cleanMobile.length !== 10) {
      errors.mobile = isEn ? "Mobile number must be exactly 10 digits." : "मोबाइल नंबर ठीक 10 अंकों का होना चाहिए।";
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Evaluates official portal security controls and retrieves field mappings
 */
export async function evaluatePortalAssistanceViaBackend(
  scheme: DbScheme,
  intakeData: ApplicationIntakeData
): Promise<PortalEvaluationResult> {
  const portalUrl = scheme.officialUrl || "https://india.gov.in";

  try {
    const res = await fetch(`${BACKEND_URL}/api/portal-assistant/evaluate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        scheme_id: scheme.id,
        scheme_name: scheme.name,
        official_url: portalUrl,
        category: scheme.category,
        user_data: {
          name: intakeData.name,
          age: intakeData.age,
          income: intakeData.income,
          state: intakeData.state,
          category: intakeData.category,
          gender: intakeData.gender,
          mobile: intakeData.mobile,
          father_or_spouse_name: intakeData.fatherOrSpouseName,
          ...intakeData.schemeSpecificFields,
        },
      }),
    });

    if (res.ok) {
      return (await res.json()) as PortalEvaluationResult;
    }
  } catch (err) {
    console.warn("Backend portal assistant evaluation failed, using local safety logic:", err);
  }

  // Resilient fallback logic maintaining strict safety rules
  const domain = portalUrl.replace(/^https?:\/\//, "").split("/")[0]?.toLowerCase() || "india.gov.in";

  return {
    scheme_id: scheme.id,
    scheme_name: scheme.name,
    portal_url: portalUrl,
    domain,
    is_automated_filling_feasible: false,
    feasibility_reason: {
      en: "Direct automated browser filling is blocked by mandatory government security controls: UIDAI Aadhaar e-KYC (SMS OTP), graphic CAPTCHA, and applicant self-declaration.",
      hi: "सरकारी पोर्टल सुरक्षा नियमों के कारण पूर्णतः स्वचालित सबमिशन समर्थित नहीं है: पोर्टल पर आधार ओटीपी, ग्राफिकल कैप्चा और आवेदक स्व-घोषणा अनिवार्य है।",
    },
    security_controls: [
      "UIDAI Aadhaar e-KYC (SMS OTP Authentication)",
      "Graphic Image CAPTCHA Verification",
      "Dynamic Session CSRF Token Protection",
      "Citizen Legal Self-Declaration under IT Act 2000",
    ],
    field_mappings: [
      {
        field_id: "full_name",
        official_label_en: "Applicant Full Name",
        official_label_hi: "आवेदक का पूरा नाम",
        mapped_value: intakeData.name || null,
        source: "Profile (Name)",
        is_sensitive: false,
        status: intakeData.name ? "ready" : "missing",
        instruction: "Enter full legal name matching Aadhaar card.",
      },
      {
        field_id: "age",
        official_label_en: "Age (Years)",
        official_label_hi: "आयु (वर्ष)",
        mapped_value: intakeData.age ? `${intakeData.age} years` : null,
        source: "Profile (Age)",
        is_sensitive: false,
        status: intakeData.age ? "ready" : "missing",
        instruction: "Enter verified age in completed years.",
      },
      {
        field_id: "annual_income",
        official_label_en: "Annual Family Income (₹)",
        official_label_hi: "वार्षिक पारिवारिक आय (₹)",
        mapped_value: intakeData.income ? `₹${intakeData.income}` : null,
        source: "Profile (Income)",
        is_sensitive: false,
        status: intakeData.income ? "ready" : "missing",
        instruction: "Enter total annual family income as certified in revenue income certificate.",
      },
      {
        field_id: "state",
        official_label_en: "State of Domicile",
        official_label_hi: "मूल निवास राज्य",
        mapped_value: intakeData.state && intakeData.state !== "All States" ? intakeData.state : null,
        source: "Profile (State)",
        is_sensitive: false,
        status: intakeData.state && intakeData.state !== "All States" ? "ready" : "missing",
        instruction: "Select your state of permanent domicile.",
      },
      {
        field_id: "category",
        official_label_en: "Social Category / Occupation",
        official_label_hi: "सामाजिक श्रेणी / व्यवसाय",
        mapped_value: intakeData.category || null,
        source: "Profile (Category)",
        is_sensitive: false,
        status: intakeData.category ? "ready" : "missing",
        instruction: "Select reservation/social category.",
      },
      {
        field_id: "gender",
        official_label_en: "Gender",
        official_label_hi: "लिंग",
        mapped_value: intakeData.gender || null,
        source: "Intake (Gender)",
        is_sensitive: false,
        status: intakeData.gender ? "ready" : "missing",
        instruction: "Select gender as printed on government identity proof.",
      },
      {
        field_id: "mobile",
        official_label_en: "Aadhaar-Linked Mobile Number",
        official_label_hi: "आधार लिंक मोबाइल नंबर",
        mapped_value: intakeData.mobile || null,
        source: "Intake (Mobile)",
        is_sensitive: false,
        status: intakeData.mobile ? "ready" : "missing",
        instruction: "10-digit mobile number registered with UIDAI to receive OTP.",
      },
      {
        field_id: "aadhaar_number",
        official_label_en: "12-Digit Aadhaar Number",
        official_label_hi: "12 अंकों का आधार नंबर",
        mapped_value: null,
        source: "Direct Citizen Entry",
        is_sensitive: true,
        status: "user_enters_on_portal",
        instruction: "For citizen privacy, YojnaSetu never collects or stores Aadhaar numbers. Type directly on the official portal.",
      },
      {
        field_id: "bank_account",
        official_label_en: "Bank Account Number & IFSC",
        official_label_hi: "बैंक खाता संख्या एवं IFSC",
        mapped_value: null,
        source: "Direct Citizen Entry",
        is_sensitive: true,
        status: "user_enters_on_portal",
        instruction: "Enter your active DBT-enabled bank account number directly on the official portal.",
      },
    ],
    submission_instructions: [
      {
        step: 1,
        title_en: "Open Official Scheme Portal",
        title_hi: "आधिकारिक सरकारी पोर्टल खोलें",
        desc_en: `Click 'Proceed to Official Portal' to securely open ${domain} in a new tab.`,
        desc_hi: `नए टैब में ${domain} सुरक्षित रूप से खोलने के लिए 'सरकारी पोर्टल पर जाएं' बटन दबाएं।`,
      },
      {
        step: 2,
        title_en: "Complete Citizen Authentication (e-KYC)",
        title_hi: "नागरिक सत्यापन (e-KYC) पूरा करें",
        desc_en: "Enter your Aadhaar number and solve the graphic CAPTCHA to receive your secure mobile OTP.",
        desc_hi: "अपना आधार नंबर और स्क्रीन पर दिख रहा कैप्चा दर्ज करें तथा मोबाइल पर आया ओटीपी भरें।",
      },
      {
        step: 3,
        title_en: "Paste Prepared Information",
        title_hi: "तैयार किए गए विवरण पेस्ट करें",
        desc_en: "Use YojnaSetu's 1-click Copy buttons to easily transfer your verified details without typos.",
        desc_hi: "योजनासेतु के 1-क्लिक कॉपी बटन का उपयोग करके बिना किसी त्रुटि के अपने विवरण फॉर्म में पेस्ट करें।",
      },
      {
        step: 4,
        title_en: "Upload Required Documents",
        title_hi: "आवश्यक दस्तावेज अपलोड करें",
        desc_en: "Attach your verified identity, residence, and income certificates as requested by the portal.",
        desc_hi: "पोर्टल के निर्देशानुसार अपने पहचान पत्र, निवास प्रमाण व आय प्रमाण पत्र की फाइल अपलोड करें।",
      },
      {
        step: 5,
        title_en: "Review & Final Submission",
        title_hi: "समीक्षा एवं अंतिम सबमिशन",
        desc_en: "Carefully review all pre-filled entries, check the declaration box, and click Submit. Save the Application Reference Number.",
        desc_hi: "सभी भरे गए विवरणों की पुनः जांच करें, घोषणा पत्र स्वीकार करें और सबमिट करें। आवेदन संदर्भ संख्या अवश्य नोट करें।",
      },
    ],
    user_submission_notice: {
      en: "YojnaSetu will never automatically submit a government application on your behalf. Final review and submission remains entirely under your direct control.",
      hi: "योजनासेतु कभी भी आपकी ओर से सरकारी आवेदन स्वचालित रूप से सबमिट नहीं करता है। अंतिम समीक्षा और सबमिशन पूरी तरह से आपके नियंत्रण में रहता है।",
    },
  };
}
