/**
 * Module 5: Official Scheme-Specific Form Template Service
 * Provides verified blank application form structures, official field labels,
 * user-facing instructions, document checklists, and sensitive ID protections.
 * Linked to verified PDFs in Supabase Storage bucket 'Scheme_Forms'.
 */

import { supabase } from "@/lib/supabase";
import type { Profile } from "@/lib/welfare-demo";

export type FieldType = "text" | "number" | "date" | "select" | "upload" | "declaration";
export type VerificationStatus = "verified" | "pending";

export interface OfficialFormField {
  id: string;
  field_label: {
    en: string;
    hi: string;
  };
  section_name: {
    en: string;
    hi: string;
  };
  field_type: FieldType;
  required_status: boolean;
  display_order: number;
  field_instruction: {
    en: string;
    hi: string;
  };
  source_note: string; // Exact field or line from verified PDF
  is_sensitive_id: boolean;
  sensitive_help?: {
    en: string;
    hi: string;
    documentNeeded: string;
  };
  accepted_format?: string;
  common_mistake?: {
    en: string;
    hi: string;
  };
  options?: {
    value: string;
    label_en: string;
    label_hi: string;
  }[];
}

export interface OfficialFormTemplate {
  id: string;
  scheme_id: string;
  scheme_name: string;
  official_form_title: string;
  published_authority: string;
  source_url: string;
  blank_pdf_url: string | null;
  storage_path?: string | null;
  verification_status: VerificationStatus;
  general_steps: {
    en: string;
    hi: string;
  }[];
  key_documents_needed: {
    en: string;
    hi: string;
  }[];
  fields: OfficialFormField[];
}

export const VERIFIED_FORM_TEMPLATES: Record<string, OfficialFormTemplate> = {
  // =========================================================================
  // SCHEME 1: PM-Kisan Samman Nidhi
  // PDF: Scheme_Forms/SammanNidhi.pdf
  // =========================================================================
  "45170ee9-d661-4746-a2bf-9d781719de7d": {
    id: "template-pmkisan-01",
    scheme_id: "45170ee9-d661-4746-a2bf-9d781719de7d",
    scheme_name: "PM-Kisan Samman Nidhi",
    official_form_title: "PRADHAN MANTRI KISAN SAMMAN NIDHI (PM-KISAN) (REGISTRATION FORM)",
    published_authority: "Ministry of Agriculture & Farmers Welfare, Government of India",
    source_url: "https://pmkisan.gov.in/RegistrationFormupdated.aspx",
    blank_pdf_url: "https://tgsdyuzkwlxsmudydddt.supabase.co/storage/v1/object/public/Scheme_Forms/SammanNidhi.pdf",
    storage_path: "SammanNidhi.pdf",
    verification_status: "verified",
    general_steps: [
      {
        en: "Fill District, Sub-Division, Tehsil, and Village matching revenue land records.",
        hi: "राजस्व भूमि अभिलेखों के अनुसार जिला, उप-मंडल, तहसील और गाँव का विवरण भरें।",
      },
      {
        en: "Enter Farmer's Full Name in capital letters exactly as inscribed in Aadhaar and Khatauni.",
        hi: "आधार और खतौनी के अनुसार किसान का पूरा नाम बड़े अक्षरों (CAPITAL) में लिखें।",
      },
      {
        en: "Enter Aadhaar Number and Bank Account details directly on the official application form.",
        hi: "आधार नंबर और बैंक खाता विवरण सीधे आधिकारिक फॉर्म या पोर्टल पर ही भरें।",
      },
      {
        en: "Fill collective land holdings table (Dag No, Patta No, Area in Hectares) and submit with self-declaration.",
        hi: "भूमि स्वामित्व तालिका (दाग सं, पट्टा सं, क्षेत्रफल हेक्टेयर में) भरें और स्व-घोषणा के साथ जमा करें।",
      },
    ],
    key_documents_needed: [
      { en: "Aadhaar Card of farmer and family members", hi: "किसान एवं परिवार के सदस्यों का आधार कार्ड" },
      { en: "Land Records / Jamabandi / ROR showing Dag & Patta No.", hi: "दाग और पट्टा नंबर दर्शाने वाले भूमि अभिलेख (जमाबंदी / खतौनी)" },
      { en: "Aadhaar-seeded DBT Bank Passbook (IFSC & Account No)", hi: "आधार से जुड़ी बैंक पासबुक (आईएफएससी व खाता नंबर)" },
      { en: "Passport Size Photograph (Self-attested)", hi: "स्व-प्रमाणित पासपोर्ट आकार का फोटो" },
    ],
    fields: [
      {
        id: "pmk-01",
        field_label: { en: "1. District", hi: "1. जिला" },
        section_name: { en: "Administrative Location Details", hi: "प्रशासनिक स्थान विवरण" },
        field_type: "text",
        required_status: true,
        display_order: 1,
        source_note: "SammanNidhi.pdf, Page 1, Item 1",
        is_sensitive_id: false,
        field_instruction: {
          en: "Enter the revenue district where your agricultural land is situated.",
          hi: "उस जिले का नाम लिखें जहाँ आपकी कृषि भूमि स्थित है।",
        },
      },
      {
        id: "pmk-02",
        field_label: { en: "2. Sub-Division", hi: "2. उप-मंडल (Sub-Division)" },
        section_name: { en: "Administrative Location Details", hi: "प्रशासनिक स्थान विवरण" },
        field_type: "text",
        required_status: true,
        display_order: 2,
        source_note: "SammanNidhi.pdf, Page 1, Item 2",
        is_sensitive_id: false,
        field_instruction: {
          en: "Enter administrative sub-division of your district.",
          hi: "अपने जिले के उप-मंडल का नाम दर्ज करें।",
        },
      },
      {
        id: "pmk-03",
        field_label: { en: "3. Circle / Tehsil Block & 4. Block", hi: "3. तहसील / सर्किल एवं 4. विकास खंड (Block)" },
        section_name: { en: "Administrative Location Details", hi: "प्रशासनिक स्थान विवरण" },
        field_type: "text",
        required_status: true,
        display_order: 3,
        source_note: "SammanNidhi.pdf, Page 1, Items 3 & 4",
        is_sensitive_id: false,
        field_instruction: {
          en: "Enter your revenue Tehsil circle and community development Block name.",
          hi: "अपनी तहसील और ब्लॉक का नाम लिखें।",
        },
      },
      {
        id: "pmk-04",
        field_label: { en: "5. Name of Municipality / Gram Panchayat / Village", hi: "5. नगर पालिका / ग्राम पंचायत / गाँव का नाम" },
        section_name: { en: "Administrative Location Details", hi: "प्रशासनिक स्थान विवरण" },
        field_type: "text",
        required_status: true,
        display_order: 4,
        source_note: "SammanNidhi.pdf, Page 1, Item 5",
        is_sensitive_id: false,
        field_instruction: {
          en: "Enter name of your Gram Panchayat or revenue village as per land record.",
          hi: "राजस्व रिकॉर्ड के अनुसार अपनी ग्राम पंचायत या राजस्व गाँव का नाम दर्ज करें।",
        },
      },
      {
        id: "pmk-05",
        field_label: { en: "6. Full Name of the Farmer (in Capital)", hi: "6. किसान का पूरा नाम (बड़े अक्षरों में)" },
        section_name: { en: "Farmer Identification Details", hi: "किसान पहचान विवरण" },
        field_type: "text",
        required_status: true,
        display_order: 5,
        source_note: "SammanNidhi.pdf, Page 1, Item 6",
        is_sensitive_id: false,
        field_instruction: {
          en: "Enter your full name in CAPITAL block letters exactly matching both your Aadhaar card and land records.",
          hi: "आधार कार्ड और जमीन के कागजात के अनुसार अपना पूरा नाम अंग्रेजी के बड़े अक्षरों में लिखें।",
        },
      },
      {
        id: "pmk-06",
        field_label: { en: "7. Date of Birth (DD/MM/YYYY)", hi: "7. जन्म तिथि (DD/MM/YYYY)" },
        section_name: { en: "Farmer Identification Details", hi: "किसान पहचान विवरण" },
        field_type: "date",
        required_status: true,
        display_order: 6,
        source_note: "SammanNidhi.pdf, Page 1, Item 7",
        is_sensitive_id: false,
        field_instruction: {
          en: "Enter date of birth in Day(DD)/Month(MM)/Year(YYYY) format.",
          hi: "दिन/माह/वर्ष प्रारूप में अपनी जन्म तिथि दर्ज करें।",
        },
      },
      {
        id: "pmk-07",
        field_label: { en: "8. Gender & 9. Marital Status", hi: "8. लिंग एवं 9. वैवाहिक स्थिति" },
        section_name: { en: "Farmer Identification Details", hi: "किसान पहचान विवरण" },
        field_type: "select",
        required_status: true,
        display_order: 7,
        source_note: "SammanNidhi.pdf, Page 1, Items 8 & 9",
        is_sensitive_id: false,
        field_instruction: {
          en: "Indicate Gender (Male / Female / Transgender) and Marital Status (Married / Unmarried).",
          hi: "लिंग (पुरुष / महिला / ट्रांसजेंडर) और वैवाहिक स्थिति (विवाहित / अविवाहित) का चयन करें।",
        },
      },
      {
        id: "pmk-08",
        field_label: { en: "10. Father's / Husband's Name", hi: "10. पिता / पति का नाम" },
        section_name: { en: "Farmer Identification Details", hi: "किसान पहचान विवरण" },
        field_type: "text",
        required_status: true,
        display_order: 8,
        source_note: "SammanNidhi.pdf, Page 1, Item 10",
        is_sensitive_id: false,
        field_instruction: {
          en: "Enter name of father (or husband if married female farmer) as in official ID.",
          hi: "पहचान पत्र के अनुसार पिता या पति का नाम लिखें।",
        },
      },
      {
        id: "pmk-09",
        field_label: { en: "11. Mobile Number", hi: "11. मोबाइल नंबर" },
        section_name: { en: "Farmer Identification Details", hi: "किसान पहचान विवरण" },
        field_type: "text",
        required_status: true,
        display_order: 9,
        source_note: "SammanNidhi.pdf, Page 1, Item 11",
        is_sensitive_id: false,
        field_instruction: {
          en: "Enter active 10-digit mobile number linked to Aadhaar to receive installment SMS notifications.",
          hi: "किस्त और ओटीपी की जानकारी प्राप्त करने हेतु आधार से जुड़ा 10 अंकों का मोबाइल नंबर भरें।",
        },
      },
      {
        id: "pmk-10",
        field_label: { en: "12. Aadhaar No.", hi: "12. आधार संख्या" },
        section_name: { en: "Sensitive Government Identification", hi: "संवेदनशील सरकारी पहचान" },
        field_type: "text",
        required_status: true,
        display_order: 10,
        source_note: "SammanNidhi.pdf, Page 1, Item 12",
        is_sensitive_id: true,
        sensitive_help: {
          en: "Enter directly on the official application form / pmkisan.gov.in portal. SchemeSetu does not collect or store your Aadhaar number.",
          hi: "सीधे आधिकारिक आवेदन फॉर्म या सरकारी पोर्टल पर ही भरें। योजनासेतु आपका आधार नंबर एकत्र या संग्रहीत नहीं करता है।",
          documentNeeded: "Original 12-digit Aadhaar Card",
        },
        field_instruction: {
          en: "Enter your 12-digit Aadhaar number directly on the official form. SchemeSetu never collects this number.",
          hi: "अपना 12 अंकों का आधार नंबर सीधे सरकारी फॉर्म पर दर्ज करें। योजनासेतु इसे कभी नहीं मांगता।",
        },
      },
      {
        id: "pmk-11",
        field_label: { en: "15. Residential Address & Pin Code", hi: "15. आवासीय पता एवं पिन कोड" },
        section_name: { en: "Farmer Identification Details", hi: "किसान पहचान विवरण" },
        field_type: "text",
        required_status: true,
        display_order: 11,
        source_note: "SammanNidhi.pdf, Page 1, Item 15",
        is_sensitive_id: false,
        field_instruction: {
          en: "Enter permanent residential address in BLOCK letters with 6-digit postal PIN code.",
          hi: "पिन कोड सहित अपना स्थायी निवास पता बड़े अक्षरों में लिखें।",
        },
      },
      {
        id: "pmk-12",
        field_label: { en: "16. Category (SC / ST / OBC / GENERAL)", hi: "16. श्रेणी (SC / ST / OBC / सामान्य)" },
        section_name: { en: "Farmer Identification Details", hi: "किसान पहचान विवरण" },
        field_type: "select",
        required_status: true,
        display_order: 12,
        source_note: "SammanNidhi.pdf, Page 1, Item 16",
        is_sensitive_id: false,
        field_instruction: {
          en: "Select your social category: SC, ST, OBC, or GENERAL.",
          hi: "अपनी सामाजिक श्रेणी चुनें: अनुसूचित जाति (SC), जनजाति (ST), अन्य पिछड़ा वर्ग (OBC), या सामान्य।",
        },
      },
      {
        id: "pmk-13",
        field_label: { en: "17. Details of Family Members (Table)", hi: "17. परिवार के सदस्यों का विवरण (तालिका)" },
        section_name: { en: "Family & Land Particulars", hi: "परिवार एवं भूमि विवरण" },
        field_type: "text",
        required_status: true,
        display_order: 13,
        source_note: "SammanNidhi.pdf, Page 1, Item 17",
        is_sensitive_id: false,
        field_instruction: {
          en: "List spouse and minor children: Name, Date of Birth, Relationship, and whether any land is held in their name.",
          hi: "परिवार के सदस्यों (पति/पत्नी एवं नाबालिग बच्चे) का नाम, जन्मतिथि, संबंध व भूमि विवरण भरें।",
        },
      },
      {
        id: "pmk-14",
        field_label: { en: "18. Collective Land Holdings (Dag No, Patta No, Area in Ha)", hi: "18. भूमि स्वामित्व विवरण (दाग संख्या, पट्टा संख्या, क्षेत्रफल)" },
        section_name: { en: "Family & Land Particulars", hi: "परिवार एवं भूमि विवरण" },
        field_type: "text",
        required_status: true,
        display_order: 14,
        source_note: "SammanNidhi.pdf, Page 1, Item 18",
        is_sensitive_id: false,
        field_instruction: {
          en: "Record Revenue Village, CS DAG No., Patta No., and net cultivable area in Hectares (must total under 2.0 Ha).",
          hi: "खतौनी/जमाबंदी के अनुसार राजस्व गाँव, खसरा/दाग संख्या, पट्टा संख्या और हेक्टेयर में क्षेत्रफल भरें (कुल 2 हेक्टेयर से कम)।",
        },
      },
      {
        id: "pmk-15",
        field_label: { en: "19. Bank Details (Branch, Account Holder, IFSC, Account No)", hi: "19. बैंक विवरण (शाखा, खाताधारक, आईएफएससी, खाता संख्या)" },
        section_name: { en: "Sensitive Government Identification", hi: "संवेदनशील सरकारी पहचान" },
        field_type: "text",
        required_status: true,
        display_order: 15,
        source_note: "SammanNidhi.pdf, Page 2, Item 19",
        is_sensitive_id: true,
        sensitive_help: {
          en: "Enter directly on the official application form / portal. SchemeSetu does not collect your bank details. The account must be in farmer's name, active, and Aadhaar-seeded for DBT.",
          hi: "सीधे आधिकारिक फॉर्म या पोर्टल पर ही भरें। योजनासेतु बैंक खाता एकत्र नहीं करता। खाता किसान के नाम पर, सक्रिय और आधार डीबीटी सक्षम होना चाहिए।",
          documentNeeded: "Bank passbook with printed IFSC code and account number",
        },
        field_instruction: {
          en: "Enter your bank account number and IFSC directly on the official form. SchemeSetu does not collect bank details.",
          hi: "अपना बैंक खाता नंबर और आईएफएससी सीधे सरकारी फॉर्म पर भरें। योजनासेतु बैंक विवरण नहीं मांगता।",
        },
      },
      {
        id: "pmk-16",
        field_label: { en: "20. Exclusion Criteria Self-Declaration", hi: "20. अपात्रता शर्तें स्व-घोषणा (Exclusion Criteria)" },
        section_name: { en: "Declarations & Verification", hi: "घोषणा एवं सत्यापन" },
        field_type: "declaration",
        required_status: true,
        display_order: 16,
        source_note: "SammanNidhi.pdf, Page 2, Exclusion Criteria & Self-Declaration",
        is_sensitive_id: false,
        field_instruction: {
          en: "Confirm you do not hold constitutional posts, are not a serving/retired government employee, pensioner above ₹10,000/month, income tax payee, or professional (Doctor/Engineer/Lawyer/CA).",
          hi: "घोषणा करें कि आप संवैधानिक पद, सरकारी सेवा, ₹10,000 से अधिक पेंशन, आयकर दाता अथवा पेशेवर व्यवसाय (डॉक्टर/वकील/सीए) की अपात्रता श्रेणी में नहीं आते हैं।",
        },
      },
    ],
  },

  // =========================================================================
  // SCHEME 2: Ayushman Bharat (PM-JAY)
  // PDF: Scheme_Forms/AyushmanBharat_form_HealthCard.pdf
  // =========================================================================
  "227a5a63-56fd-4d39-a281-3d3f5dbec2bd": {
    id: "template-pmjay-02",
    scheme_id: "227a5a63-56fd-4d39-a281-3d3f5dbec2bd",
    scheme_name: "Ayushman Bharat (PM-JAY)",
    official_form_title: "Ayushman Bharat - National Health Protection Mission (Registration form)",
    published_authority: "National Health Authority (NHA) & Ministry of Health and Family Welfare (MoHFW)",
    source_url: "https://beneficiary.nha.gov.in",
    blank_pdf_url: "https://tgsdyuzkwlxsmudydddt.supabase.co/storage/v1/object/public/Scheme_Forms/AyushmanBharat_form_HealthCard.pdf",
    storage_path: "AyushmanBharat_form_HealthCard.pdf",
    verification_status: "verified",
    general_steps: [
      {
        en: "Enter Name of Head of Family (HOF), residential address, pada, and village.",
        hi: "परिवार के मुखिया (HOF) का नाम, आवासीय पता, पाड़ा और गाँव का नाम लिखें।",
      },
      {
        en: "Check SECC list status: If in list, write Family HH ID No; otherwise specify registration category (income below or above ₹1 Lakh).",
        hi: "यदि 2011 एसईसीसी सूची में नाम है तो फैमिली HH ID लिखें; अन्यथा आय श्रेणी (₹1 लाख से कम या अधिक) चुनें।",
      },
      {
        en: "List all family members with Name, Age, Sex, Relationship, and E-arogya registration details.",
        hi: "आयुष्मान कार्ड में शामिल किए जाने वाले सभी सदस्यों के नाम, आयु, लिंग, संबंध और ई-आरोग्य विवरण भरें।",
      },
      {
        en: "Fill Aadhaar numbers directly on official form and complete the MoHFW identity authentication consent.",
        hi: "आधार नंबर सीधे फॉर्म पर भरें और स्वास्थ्य मंत्रालय की पहचान प्रमाणीकरण सहमति पर हस्ताक्षर करें।",
      },
    ],
    key_documents_needed: [
      { en: "NFSA Ration Card (PHH / Antyodaya) or State Family ID", hi: "राष्ट्रीय खाद्य सुरक्षा राशन कार्ड या राज्य परिवार पहचान पत्र" },
      { en: "Aadhaar Card for all family members requesting cards", hi: "कार्ड बनवाने वाले सभी सदस्यों का आधार कार्ड" },
      { en: "SSBY / Mukhyamantri Amrutum health card (if applicable)", hi: "मुख्यमंत्री अमृतम / एसएसबीवाई स्वास्थ्य कार्ड (यदि उपलब्ध हो)" },
      { en: "Active mobile phone for e-KYC SMS OTP", hi: "ई-केवाईसी ओटीपी हेतु सक्रिय मोबाइल फोन" },
    ],
    fields: [
      {
        id: "pmj-01",
        field_label: { en: "Name of Head of the Family", hi: "परिवार के मुखिया का नाम (HOF)" },
        section_name: { en: "Family & Residential Information", hi: "पारिवारिक एवं आवासीय विवरण" },
        field_type: "text",
        required_status: true,
        display_order: 1,
        source_note: "AyushmanBharat_form_HealthCard.pdf, Page 1, Header",
        is_sensitive_id: false,
        field_instruction: {
          en: "Enter the full name of the head of the household matching the ration card or SECC survey.",
          hi: "राशन कार्ड या एसईसीसी सर्वेक्षण के अनुसार परिवार के मुखिया का पूरा नाम लिखें।",
        },
      },
      {
        id: "pmj-02",
        field_label: { en: "Address, Pada Name & Village Name", hi: "आवासीय पता, पाड़ा का नाम एवं गाँव का नाम" },
        section_name: { en: "Family & Residential Information", hi: "पारिवारिक एवं आवासीय विवरण" },
        field_type: "text",
        required_status: true,
        display_order: 2,
        source_note: "AyushmanBharat_form_HealthCard.pdf, Page 1, Address Block",
        is_sensitive_id: false,
        field_instruction: {
          en: "Enter your complete locality address including hamlet (Pada) and revenue village.",
          hi: "पाड़ा (टोला) और राजस्व गाँव सहित अपना पूरा आवासीय पता दर्ज करें।",
        },
      },
      {
        id: "pmj-03",
        field_label: { en: "In AB-NHPM SECC Beneficiary List (Yes/No) & HH ID No", hi: "एसईसीसी 2011 सूची में नाम (हाँ/नहीं) एवं HH ID संख्या" },
        section_name: { en: "Beneficiary Enumeration", hi: "लाभार्थी गणना स्थिति" },
        field_type: "select",
        required_status: true,
        display_order: 3,
        source_note: "AyushmanBharat_form_HealthCard.pdf, Page 1, Line 4",
        is_sensitive_id: false,
        field_instruction: {
          en: "Select 'Yes' if your family was enumerated in the 2011 Socio-Economic Caste Census and write your Family HH ID; otherwise select 'No'.",
          hi: "यदि 2011 एसईसीसी जनगणना सूची में नाम है तो 'हाँ' चुनकर अपनी फैमिली HH ID भरें; अन्यथा 'नहीं' चुनें।",
        },
      },
      {
        id: "pmj-04",
        field_label: { en: "SSBY Card No (if applicable)", hi: "एसएसबीवाई कार्ड संख्या (यदि उपलब्ध हो)" },
        section_name: { en: "Beneficiary Enumeration", hi: "लाभार्थी गणना स्थिति" },
        field_type: "text",
        required_status: false,
        display_order: 4,
        source_note: "AyushmanBharat_form_HealthCard.pdf, Page 1, Line 5",
        is_sensitive_id: false,
        field_instruction: {
          en: "If your family possesses state health assurance cards (e.g. SSBY / Mukhyamantri Amrutum), enter card number(s).",
          hi: "यदि परिवार के पास पूर्व से राज्य स्वास्थ्य सुरक्षा कार्ड है तो उसका नंबर लिखें।",
        },
      },
      {
        id: "pmj-05",
        field_label: { en: "Ration Card No", hi: "राशन कार्ड संख्या" },
        section_name: { en: "Sensitive Identification", hi: "संवेदनशील पहचान विवरण" },
        field_type: "text",
        required_status: true,
        display_order: 5,
        source_note: "AyushmanBharat_form_HealthCard.pdf, Page 1, Line 6",
        is_sensitive_id: true,
        sensitive_help: {
          en: "Enter directly on the official registration form / beneficiary.nha.gov.in portal. SchemeSetu does not collect your ration card number.",
          hi: "सीधे आधिकारिक आवेदन फॉर्म या सरकारी पोर्टल पर ही भरें। योजनासेतु राशन कार्ड नंबर एकत्र नहीं करता।",
          documentNeeded: "NFSA Ration Card booklet or digital e-Ration slip",
        },
        field_instruction: {
          en: "Enter your NFSA Ration Card booklet number directly on the official form. SchemeSetu never collects this number.",
          hi: "अपना राशन कार्ड नंबर सीधे सरकारी फॉर्म में दर्ज करें। योजनासेतु इसे कभी संग्रहीत नहीं करता।",
        },
      },
      {
        id: "pmj-06",
        field_label: { en: "Enrollment Category (If Not in SECC list)", hi: "पंजीकरण श्रेणी (यदि एसईसीसी सूची में नाम न हो)" },
        section_name: { en: "Beneficiary Enumeration", hi: "लाभार्थी गणना स्थिति" },
        field_type: "select",
        required_status: true,
        display_order: 6,
        source_note: "AyushmanBharat_form_HealthCard.pdf, Page 1, Options 1 & 2",
        is_sensitive_id: false,
        field_instruction: {
          en: "Select 1: 'Resident Family having annual income below Rs. 1 lakh' or 2: 'All the family having annual income above Rs. 1 lakh'.",
          hi: "चुनें: 1. 'वार्षिक आय ₹1 लाख से कम वाला परिवार' अथवा 2. 'वार्षिक आय ₹1 लाख से अधिक वाला परिवार'।",
        },
      },
      {
        id: "pmj-07",
        field_label: { en: "Family Members to be Covered (Name, Age, Sex, Relationship, Mobile)", hi: "शामिल किए जाने वाले सदस्यों का विवरण (नाम, उम्र, लिंग, संबंध, मोबाइल)" },
        section_name: { en: "Family Member Roster", hi: "परिवार सदस्य तालिका" },
        field_type: "text",
        required_status: true,
        display_order: 7,
        source_note: "AyushmanBharat_form_HealthCard.pdf, Page 1, Table",
        is_sensitive_id: false,
        field_instruction: {
          en: "Fill table with all family members: Name, Age, Sex, Relationship with Head of Family, and Mobile Number.",
          hi: "कार्ड के लिए परिवार के सभी सदस्यों के नाम, उम्र, लिंग, मुखिया से संबंध और मोबाइल नंबर भरें।",
        },
      },
      {
        id: "pmj-08",
        field_label: { en: "Aadhaar Card Numbers of Family Members", hi: "सदस्यों की आधार कार्ड संख्या" },
        section_name: { en: "Sensitive Identification", hi: "संवेदनशील पहचान विवरण" },
        field_type: "text",
        required_status: true,
        display_order: 8,
        source_note: "AyushmanBharat_form_HealthCard.pdf, Page 1, Table Column 6",
        is_sensitive_id: true,
        sensitive_help: {
          en: "Enter directly on the official registration form / portal. SchemeSetu does not collect Aadhaar numbers.",
          hi: "सीधे सरकारी फॉर्म पर दर्ज करें। योजनासेतु आधार नंबर एकत्र नहीं करता।",
          documentNeeded: "Aadhaar Card for each member to be verified via e-KYC",
        },
        field_instruction: {
          en: "Fill Aadhaar numbers directly on the official form. SchemeSetu never stores Aadhaar numbers.",
          hi: "प्रत्येक सदस्य का आधार नंबर सीधे सरकारी प्रपत्र में भरें।",
        },
      },
      {
        id: "pmj-09",
        field_label: { en: "Consent to MoHFW for Aadhaar Authentication", hi: "स्वास्थ्य मंत्रालय को आधार प्रमाणीकरण सहमति" },
        section_name: { en: "Consent & Verification", hi: "सहमति एवं सत्यापन" },
        field_type: "declaration",
        required_status: true,
        display_order: 9,
        source_note: "AyushmanBharat_form_HealthCard.pdf, Page 1, Bottom Consent Paragraph",
        is_sensitive_id: false,
        field_instruction: {
          en: "Sign and date consent allowing Ministry of Health and Family Welfare (MoHFW) to authenticate identity under AB-NHPM.",
          hi: "आयुष्मान भारत योजना के अंतर्गत पहचान सत्यापन हेतु स्वास्थ्य मंत्रालय को सहमति देकर हस्ताक्षर करें।",
        },
      },
    ],
  },

  // =========================================================================
  // SCHEME 3: UP Shramik Pension Yojna (Old-Age / Construction Pension)
  // Status: NO PDF uploaded in bucket yet -> Clear message required
  // =========================================================================
  "e3cb111a-cbe3-41f4-9eae-c056e79ecfe7": {
    id: "template-shramik-03",
    scheme_id: "e3cb111a-cbe3-41f4-9eae-c056e79ecfe7",
    scheme_name: "UP Shramik Pension Yojna",
    official_form_title: "Application form guide is not available yet",
    published_authority: "UP Building & Other Construction Workers Welfare Board (UPBOCW)",
    source_url: "https://upbocw.in",
    blank_pdf_url: null, // STRICT: No PDF linked for this scheme
    storage_path: null,
    verification_status: "pending",
    general_steps: [
      {
        en: "Application form guide is not available yet for this scheme.",
        hi: "इस योजना के लिए आवेदन प्रपत्र मार्गदर्शिका अभी उपलब्ध नहीं है।",
      },
      {
        en: "Official application form PDF has not been uploaded to the scheme repository yet.",
        hi: "इस योजना का आधिकारिक खाली फॉर्म अभी रिपॉजिटरी में उपलब्ध नहीं कराया गया है।",
      },
      {
        en: "You can visit the UPBOCW portal at upbocw.in or your nearest Labour Welfare Office / CSC for physical forms.",
        hi: "आप upbocw.in पोर्टल पर जा सकते हैं अथवा निकटतम श्रम कल्याण कार्यालय / जनसेवा केंद्र से फॉर्म प्राप्त कर सकते हैं।",
      },
    ],
    key_documents_needed: [
      { en: "UPBOCW Shramik Labour Card (at least 1 year old)", hi: "कम से कम 1 वर्ष पुराना सक्रिय लेबर कार्ड" },
      { en: "90 days construction work certificate", hi: "90 दिन के निर्माण कार्य का प्रमाण पत्र" },
      { en: "Proof of age showing 60 years or above", hi: "60 वर्ष या अधिक उम्र का प्रमाण पत्र" },
    ],
    fields: [], // STRICT: No fake fields displayed when guide is pending
  },

  // =========================================================================
  // SCHEME 4: Mukhyamantri Ladli Behna Yojna
  // PDF: Scheme_Forms/ladli-behna-yojana-form-2026-513.pdf
  // =========================================================================
  "fe7ab07d-d4e0-4fde-bc14-91489c080c1a": {
    id: "template-ladli-04",
    scheme_id: "fe7ab07d-d4e0-4fde-bc14-91489c080c1a",
    scheme_name: "Ladli Behna Yojna",
    official_form_title: "मुख्यमंत्री लाड़ली बहना योजना - 2023 (आवेदन हेतु आवश्यक जानकारी का पत्रक)",
    published_authority: "महिला एवं बाल विकास विभाग, मध्य प्रदेश शासन (WCD MP)",
    source_url: "https://cmladlibahna.mp.gov.in",
    blank_pdf_url: "https://tgsdyuzkwlxsmudydddt.supabase.co/storage/v1/object/public/Scheme_Forms/ladli-behna-yojana-form-2026-513.pdf",
    storage_path: "ladli-behna-yojana-form-2026-513.pdf",
    verification_status: "verified",
    general_steps: [
      {
        en: "Enter applicant woman's 9-digit Samagra Member ID and 12-digit Aadhaar Number.",
        hi: "आवेदिका की 9 अंकों की समग्र सदस्य आईडी और 12 अंकों का आधार नंबर दर्ज करें।",
      },
      {
        en: "Fill applicant name, husband/father name, date of birth (21-60 years), and village/ward address.",
        hi: "आवेदिका का नाम, पति/पिता का नाम, जन्मतिथि (21 से 60 वर्ष) और ग्राम/वार्ड का पता भरें।",
      },
      {
        en: "Tick category (General / SC / ST / OBC), pension receipt status, and marital status.",
        hi: "वर्ग (सामान्य / अ.जा. / अ.ज.जा. / अ.पि.व.), पेंशन प्राप्ति स्थिति और विवाह की स्थिति पर टिक लगाएं।",
      },
      {
        en: "Sign mandatory self-declarations regarding family income under ₹2.5L, land under 5 acres, and DBT-active bank account.",
        hi: "₹2.5 लाख से कम आय, 5 एकड़ से कम जमीन और आधार-डीबीटी सक्रिय बैंक खाते की अनिवार्य स्व-घोषणा पर हस्ताक्षर करें।",
      },
    ],
    key_documents_needed: [
      { en: "Samagra Member ID (9 digits) & Family ID (8 digits)", hi: "समग्र सदस्य आईडी (9 अंक) एवं समग्र परिवार आईडी (8 अंक)" },
      { en: "Aadhaar Card with e-KYC completed in Samagra portal", hi: "समग्र पोर्टल पर ई-केवाईसी सत्यापित आधार कार्ड" },
      { en: "Individual bank savings account (Aadhaar linked & DBT active)", hi: "स्वयं का आधार लिंक और डीबीटी सक्रिय बैंक खाता" },
      { en: "Mobile phone linked with Samagra e-KYC", hi: "समग्र ई-केवाईसी में पंजीकृत मोबाइल फोन" },
    ],
    fields: [
      {
        id: "lb-01",
        field_label: { en: "1. आवेदिका की समग्र आई.डी. (Samagra Member ID - 9 अंक)", hi: "1. आवेदिका की समग्र आई.डी. (9 अंक)" },
        section_name: { en: "Sensitive Government Identification", hi: "संवेदनशील सरकारी पहचान" },
        field_type: "number",
        required_status: true,
        display_order: 1,
        source_note: "ladli-behna-yojana-form-2026-513.pdf, Item 1",
        is_sensitive_id: true,
        sensitive_help: {
          en: "Enter directly on the official application form / MP portal. SchemeSetu does not collect your Samagra ID.",
          hi: "सीधे सरकारी फॉर्म या मध्य प्रदेश पोर्टल पर भरें। योजनासेतु समग्र आईडी एकत्र नहीं करता।",
          documentNeeded: "Applicant woman's 9-digit Samagra Sadasya ID card / slip",
        },
        field_instruction: {
          en: "Enter the applicant woman's personal 9-digit Samagra Member ID directly on the official form.",
          hi: "आवेदिका की 9 अंकों की समग्र सदस्य आईडी सीधे आधिकारिक फॉर्म में दर्ज करें।",
        },
      },
      {
        id: "lb-02",
        field_label: { en: "2. आधार नंबर (12 अंक)", hi: "2. आधार नंबर (12 अंक)" },
        section_name: { en: "Sensitive Government Identification", hi: "संवेदनशील सरकारी पहचान" },
        field_type: "text",
        required_status: true,
        display_order: 2,
        source_note: "ladli-behna-yojana-form-2026-513.pdf, Item 2",
        is_sensitive_id: true,
        sensitive_help: {
          en: "Enter directly on the official application form / MP portal. SchemeSetu never collects or stores Aadhaar numbers.",
          hi: "सीधे सरकारी फॉर्म पर भरें। योजनासेतु आधार नंबर एकत्र नहीं करता।",
          documentNeeded: "Original 12-digit Aadhaar Card with active biometric/OTP e-KYC",
        },
        field_instruction: {
          en: "Enter your 12-digit Aadhaar directly on the official form. SchemeSetu does not collect Aadhaar.",
          hi: "अपना 12 अंकों का आधार नंबर सीधे सरकारी फॉर्म पर भरें।",
        },
      },
      {
        id: "lb-03",
        field_label: { en: "3. आवेदिका का नाम (Applicant Woman's Name)", hi: "3. आवेदिका का नाम" },
        section_name: { en: "Applicant Personal Details", hi: "आवेदिका व्यक्तिगत विवरण" },
        field_type: "text",
        required_status: true,
        display_order: 3,
        source_note: "ladli-behna-yojana-form-2026-513.pdf, Item 3",
        is_sensitive_id: false,
        field_instruction: {
          en: "Enter full name of the woman applicant exactly as printed in Samagra and Aadhaar records.",
          hi: "समग्र और आधार कार्ड में दर्ज नाम के अनुसार आवेदिका का पूरा नाम लिखें।",
        },
      },
      {
        id: "lb-04",
        field_label: { en: "4. आवेदिका के पति / पिता का नाम", hi: "4. आवेदिका के पति / पिता का नाम" },
        section_name: { en: "Applicant Personal Details", hi: "आवेदिका व्यक्तिगत विवरण" },
        field_type: "text",
        required_status: true,
        display_order: 4,
        source_note: "ladli-behna-yojana-form-2026-513.pdf, Item 4",
        is_sensitive_id: false,
        field_instruction: {
          en: "Enter husband's name for married woman; father's name for unmarried/dependent applicant.",
          hi: "विवाहित महिला हेतु पति का नाम अथवा अविवाहित हेतु पिता का नाम भरें।",
        },
      },
      {
        id: "lb-05",
        field_label: { en: "5. जन्मतिथि (DD/MM/YYYY)", hi: "5. जन्मतिथि (DD/MM/YYYY)" },
        section_name: { en: "Applicant Personal Details", hi: "आवेदिका व्यक्तिगत विवरण" },
        field_type: "date",
        required_status: true,
        display_order: 5,
        source_note: "ladli-behna-yojana-form-2026-513.pdf, Item 5",
        is_sensitive_id: false,
        field_instruction: {
          en: "Applicant must have completed 21 years and not exceeded 60 years on 1st January of the application year.",
          hi: "आवेदिका की उम्र कैलेंडर वर्ष की 1 जनवरी को 21 वर्ष से 60 वर्ष के बीच होनी चाहिए।",
        },
      },
      {
        id: "lb-06",
        field_label: { en: "6. आवेदिका का पता (ग्राम/शहर वार्ड, जिला, पिनकोड)", hi: "6. आवेदिका का पता (ग्राम/शहर वार्ड, जिला, पिनकोड)" },
        section_name: { en: "Applicant Personal Details", hi: "आवेदिका व्यक्तिगत विवरण" },
        field_type: "text",
        required_status: true,
        display_order: 6,
        source_note: "ladli-behna-yojana-form-2026-513.pdf, Item 6",
        is_sensitive_id: false,
        field_instruction: {
          en: "Enter local Gram / Ward name, District, and PIN Code in Madhya Pradesh.",
          hi: "मध्य प्रदेश में अपने गाँव/वार्ड का नाम, जिला और पिनकोड दर्ज करें।",
        },
      },
      {
        id: "lb-07",
        field_label: { en: "7. आवेदिका का मोबाइल नं.", hi: "7. आवेदिका का मोबाइल नं." },
        section_name: { en: "Applicant Personal Details", hi: "आवेदिका व्यक्तिगत विवरण" },
        field_type: "text",
        required_status: true,
        display_order: 7,
        source_note: "ladli-behna-yojana-form-2026-513.pdf, Item 7",
        is_sensitive_id: false,
        field_instruction: {
          en: "Active mobile phone number registered in Samagra e-KYC to receive approval and monthly ₹1,250 SMS.",
          hi: "मासिक ₹1,250 सहायता राशि का संदेश प्राप्त करने हेतु समग्र में दर्ज मोबाइल नंबर भरें।",
        },
      },
      {
        id: "lb-08",
        field_label: { en: "8. वर्ग (सामान्य / अ.जा. / अ.ज.जा. / अ.पि.व.)", hi: "8. वर्ग (सामान्य / अ.जा. / अ.ज.जा. / अ.पि.व.)" },
        section_name: { en: "Social Status & Pension", hi: "सामाजिक स्थिति एवं पेंशन" },
        field_type: "select",
        required_status: true,
        display_order: 8,
        source_note: "ladli-behna-yojana-form-2026-513.pdf, Item 8",
        is_sensitive_id: false,
        field_instruction: {
          en: "Tick social reservation category: सामान्य (General), अ.जा. (SC), अ.ज.जा. (ST), or अ.पि.व. (OBC).",
          hi: "अपनी सामाजिक श्रेणी पर टिक लगाएं: सामान्य, अनुसूचित जाति, अनुसूचित जनजाति, या पिछड़ा वर्ग।",
        },
      },
      {
        id: "lb-09",
        field_label: { en: "9. क्या शासन से विधवा / निःशक्त इत्यादि पेंशन प्राप्त कर रहे हैं (हाँ / नहीं)", hi: "9. क्या शासन से विधवा / निःशक्त इत्यादि पेंशन प्राप्त कर रहे हैं" },
        section_name: { en: "Social Status & Pension", hi: "सामाजिक स्थिति एवं पेंशन" },
        field_type: "select",
        required_status: true,
        display_order: 9,
        source_note: "ladli-behna-yojana-form-2026-513.pdf, Item 9",
        is_sensitive_id: false,
        field_instruction: {
          en: "Tick हाँ (Yes) or नहीं (No) indicating if already receiving government widow or disability pension.",
          hi: "टिक लगाएं: क्या आप पहले से शासन से कोई विधवा या दिव्यांग पेंशन प्राप्त कर रहे हैं।",
        },
      },
      {
        id: "lb-10",
        field_label: { en: "10. विवाह की स्थिति (विवाहित / तलाकशुदा / विधवा / परित्यक्ता)", hi: "10. विवाह की स्थिति (विवाहित / तलाकशुदा / विधवा / परित्यक्ता)" },
        section_name: { en: "Social Status & Pension", hi: "सामाजिक स्थिति एवं पेंशन" },
        field_type: "select",
        required_status: true,
        display_order: 10,
        source_note: "ladli-behna-yojana-form-2026-513.pdf, Item 10",
        is_sensitive_id: false,
        field_instruction: {
          en: "Tick: विवाहित (Married), तलाकशुदा (Divorced), विधवा (Widow), or परित्यक्ता (Abandoned).",
          hi: "अपनी वैवाहिक स्थिति पर टिक लगाएं: विवाहित, तलाकशुदा, विधवा, या परित्यक्ता।",
        },
      },
      {
        id: "lb-11",
        field_label: { en: "आवेदिका द्वारा की गई स्व-घोषणा (Mandatory Self-Declarations)", hi: "आवेदिका द्वारा की गई स्व-घोषणा" },
        section_name: { en: "Mandatory Self-Declarations", hi: "अनिवार्य स्व-घोषणाएं" },
        field_type: "declaration",
        required_status: true,
        display_order: 11,
        source_note: "ladli-behna-yojana-form-2026-513.pdf, Bottom Declaration Block",
        is_sensitive_id: false,
        field_instruction: {
          en: "Sign confirmation that: 1. Combined family income is under ₹2.50 Lakh, 2. No family member is income tax payer, 3. No member in government service/pension, 4. Joint land holding under 5 acres, 5. Possess individual Aadhaar-linked DBT active bank account.",
          hi: "हस्ताक्षर सहित पुष्टि: परिवार की आय ₹2.5 लाख से कम है, कोई आयकरदाता नहीं है, कोई सरकारी नौकरी में नहीं है, 5 एकड़ से कम जमीन है और स्वयं का डीबीटी सक्रिय बैंक खाता है।",
        },
      },
    ],
  },

  // =========================================================================
  // SCHEME 5: Post-Matric Scholarship Scheme
  // PDF: Scheme_Forms/PostMatric_ScholarShip_Application .pdf
  // =========================================================================
  "36fa81fa-f5cc-4f72-8c0e-9adfb4f84559": {
    id: "template-scholarship-05",
    scheme_id: "36fa81fa-f5cc-4f72-8c0e-9adfb4f84559",
    scheme_name: "Post-Matric Scholarship Scheme",
    official_form_title: "APPLICATION FOR POST-MATRIC SCHOLARSHIP TO SC/ST/OBC STUDENTS (Government of West Bengal)",
    published_authority: "Backward Classes Welfare Department, Government of West Bengal",
    source_url: "https://scholarships.gov.in",
    blank_pdf_url: "https://tgsdyuzkwlxsmudydddt.supabase.co/storage/v1/object/public/Scheme_Forms/PostMatric_ScholarShip_Application%20.pdf",
    storage_path: "PostMatric_ScholarShip_Application .pdf",
    verification_status: "verified",
    general_steps: [
      {
        en: "Select Application Type (NEW / RENEWAL) and enter Entitlement Card No if applicable.",
        hi: "आवेदन प्रकार (NEW / RENEWAL) चुनें और यदि पूर्व लाभार्थी हैं तो कार्ड नंबर भरें।",
      },
      {
        en: "Fill applicant's full name in block letters, father/husband name, date of birth, caste, and permanent address.",
        hi: "बड़े अक्षरों में छात्र का नाम, पिता का नाम, जन्मतिथि, जाति (SC/ST/OBC) और स्थायी पता लिखें।",
      },
      {
        en: "Provide guardian's annual family income certificate from employer/competent revenue authority.",
        hi: "अभिभावक का नियोक्ता या सक्षम राजस्व प्राधिकारी द्वारा जारी पारिवारिक वार्षिक आय प्रमाण पत्र संलग्न करें।",
      },
      {
        en: "Fill academic examination record, current course/roll number, student bank account, and get verified by Head of Institution.",
        hi: "पिछली परीक्षाओं का रिकॉर्ड, वर्तमान पाठ्यक्रम, छात्र का बैंक खाता भरें और संस्था प्रमुख से सत्यापित कराएं।",
      },
    ],
    key_documents_needed: [
      { en: "Attested copy of Caste / Community Certificate (SC / ST / OBC)", hi: "सत्यापित जाति प्रमाण पत्र (SC / ST / OBC)" },
      { en: "Income Certificate issued by employer or competent revenue authority", hi: "सक्षम प्राधिकारी या नियोक्ता द्वारा जारी आय प्रमाण पत्र" },
      { en: "Mark sheets of all examinations passed from Matriculation onwards", hi: "मैट्रिक के बाद की सभी उत्तीर्ण परीक्षाओं की अंकतालिकाएं" },
      { en: "Student's Bank Passbook copy (Account Number & IFSC Code)", hi: "छात्र के स्वयं के बैंक खाते की पासबुक प्रति (आईएफएससी सहित)" },
      { en: "Hostel Superintendent certificate (if resident hosteller)", hi: "छात्रावास अधीक्षक का प्रमाण पत्र (छात्रावासी होने की स्थिति में)" },
    ],
    fields: [
      {
        id: "nsp-01",
        field_label: { en: "Application Type (NEW / RENEWAL) & Entitlement Card No", hi: "आवेदन प्रकार (NEW / RENEWAL) एवं कार्ड संख्या" },
        section_name: { en: "Application Header", hi: "आवेदन शीर्ष" },
        field_type: "select",
        required_status: true,
        display_order: 1,
        source_note: "PostMatric_ScholarShip_Application .pdf, Page 1, Header",
        is_sensitive_id: false,
        field_instruction: {
          en: "Indicate whether this is a NEW application or a RENEWAL, and enter your Entitlement Card No if renewal.",
          hi: "चुनें कि यह नया आवेदन (NEW) है या नवीनीकरण (RENEWAL), और नवीनीकरण होने पर कार्ड संख्या भरें।",
        },
      },
      {
        id: "nsp-02",
        field_label: { en: "1. Full Name of Applicant (In Block letters)", hi: "1. छात्र का पूरा नाम (बड़े अक्षरों में)" },
        section_name: { en: "Student Personal Details", hi: "छात्र व्यक्तिगत विवरण" },
        field_type: "text",
        required_status: true,
        display_order: 2,
        source_note: "PostMatric_ScholarShip_Application .pdf, Page 1, Item 1",
        is_sensitive_id: false,
        field_instruction: {
          en: "Enter full name in BLOCK capital letters exactly as in your Matriculation / School Final certificate.",
          hi: "मैट्रिक / हाई स्कूल प्रमाण पत्र के अनुसार अपना पूरा नाम अंग्रेजी के बड़े अक्षरों में लिखें।",
        },
      },
      {
        id: "nsp-03",
        field_label: { en: "2. Name of Father / Husband & Sex", hi: "2. पिता / पति का नाम एवं लिंग" },
        section_name: { en: "Student Personal Details", hi: "छात्र व्यक्तिगत विवरण" },
        field_type: "text",
        required_status: true,
        display_order: 3,
        source_note: "PostMatric_ScholarShip_Application .pdf, Page 1, Item 2",
        is_sensitive_id: false,
        field_instruction: {
          en: "Enter father's or husband's full name, and indicate gender (Male / Female).",
          hi: "पिता या पति का नाम लिखें और लिंग (पुरुष / महिला) का उल्लेख करें।",
        },
      },
      {
        id: "nsp-04",
        field_label: { en: "3. Date of Birth & 4. Marital Status", hi: "3. जन्म तिथि एवं 4. वैवाहिक स्थिति" },
        section_name: { en: "Student Personal Details", hi: "छात्र व्यक्तिगत विवरण" },
        field_type: "date",
        required_status: true,
        display_order: 4,
        source_note: "PostMatric_ScholarShip_Application .pdf, Page 1, Items 3 & 4",
        is_sensitive_id: false,
        field_instruction: {
          en: "Date of birth as per Class 10th admit card and marital status (Unmarried / Married).",
          hi: "10वीं के एडमिट कार्ड के अनुसार जन्मतिथि और वैवाहिक स्थिति भरें।",
        },
      },
      {
        id: "nsp-05",
        field_label: { en: "5. Telephone No., 6. Nationality & 7. Religion", hi: "5. फोन नंबर, 6. राष्ट्रीयता एवं 7. धर्म" },
        section_name: { en: "Student Personal Details", hi: "छात्र व्यक्तिगत विवरण" },
        field_type: "text",
        required_status: true,
        display_order: 5,
        source_note: "PostMatric_ScholarShip_Application .pdf, Page 1, Items 5, 6, 7",
        is_sensitive_id: false,
        field_instruction: {
          en: "Enter active contact phone number, Indian nationality, and religion.",
          hi: "संपर्क नंबर, राष्ट्रीयता (Indian) और धर्म दर्ज करें।",
        },
      },
      {
        id: "nsp-06",
        field_label: { en: "8. a) Caste (SC/ST/OBC) & b) Sub-Caste", hi: "8. जाति (SC/ST/OBC) एवं उप-जाति" },
        section_name: { en: "Social Status & Domicile", hi: "सामाजिक श्रेणी एवं निवास" },
        field_type: "select",
        required_status: true,
        display_order: 6,
        source_note: "PostMatric_ScholarShip_Application .pdf, Page 1, Item 8",
        is_sensitive_id: false,
        field_instruction: {
          en: "Select reservation category (SC / ST / OBC) and specify sub-caste matching official digital caste certificate.",
          hi: "आरक्षित श्रेणी (SC/ST/OBC) चुनें और जाति प्रमाण पत्र के अनुसार उप-जाति लिखें।",
        },
      },
      {
        id: "nsp-07",
        field_label: { en: "9. State of Domicile & Permanent Address (P.O., P.S., Dist., State)", hi: "9. मूल राज्य एवं स्थायी पता (डाकघर, थाना, जिला, राज्य)" },
        section_name: { en: "Social Status & Domicile", hi: "सामाजिक श्रेणी एवं निवास" },
        field_type: "text",
        required_status: true,
        display_order: 7,
        source_note: "PostMatric_ScholarShip_Application .pdf, Page 1, Item 9",
        is_sensitive_id: false,
        field_instruction: {
          en: "Enter domicile state and complete permanent address including Post Office (P.O.) and Police Station (P.S.).",
          hi: "मूल निवास राज्य और डाकघर (P.O.) व थाना (P.S.) सहित स्थायी पता भरें।",
        },
      },
      {
        id: "nsp-08",
        field_label: { en: "10. Whether in Full-Time Employment (YES / NO)", hi: "10. क्या पूर्णकालिक रोजगार में हैं (हाँ / नहीं)" },
        section_name: { en: "Social Status & Domicile", hi: "सामाजिक श्रेणी एवं निवास" },
        field_type: "select",
        required_status: true,
        display_order: 8,
        source_note: "PostMatric_ScholarShip_Application .pdf, Page 1, Item 10",
        is_sensitive_id: false,
        field_instruction: {
          en: "Select 'NO' if regular student. Employed applicants must provide employer NOC and leave sanction.",
          hi: "नियमित छात्र होने पर 'NO' चुनें।",
        },
      },
      {
        id: "nsp-09",
        field_label: { en: "11. Guardian Supporting Studies & Total Family Annual Income", hi: "11. अभिभावक का विवरण एवं कुल वार्षिक पारिवारिक आय" },
        section_name: { en: "Family Income Particulars", hi: "पारिवारिक आय विवरण" },
        field_type: "number",
        required_status: true,
        display_order: 9,
        source_note: "PostMatric_ScholarShip_Application .pdf, Page 1, Item 11",
        is_sensitive_id: false,
        field_instruction: {
          en: "Name, occupation, address of father/guardian and exact annual family income from all sources (supported by income certificate).",
          hi: "अभिभावक का नाम, व्यवसाय और आय प्रमाण पत्र के अनुसार कुल वार्षिक पारिवारिक आय (₹ में) भरें।",
        },
      },
      {
        id: "nsp-10",
        field_label: { en: "12. Particulars of All Examinations Passed", hi: "12. पूर्व में उत्तीर्ण सभी परीक्षाओं का विवरण" },
        section_name: { en: "Academic Record", hi: "शैक्षणिक योग्यता" },
        field_type: "text",
        required_status: true,
        display_order: 10,
        source_note: "PostMatric_ScholarShip_Application .pdf, Page 1, Item 12 Table",
        is_sensitive_id: false,
        field_instruction: {
          en: "School/College name, exam passed, passing year, division/class, total marks scored, and percentage of marks.",
          hi: "मैट्रिक के बाद की सभी उत्तीर्ण परीक्षाओं के संस्थान का नाम, वर्ष, श्रेणी, प्राप्तांक और प्रतिशत दर्ज करें।",
        },
      },
      {
        id: "nsp-11",
        field_label: { en: "13. Details of Course Currently Studying", hi: "13. वर्तमान में अध्ययनरत पाठ्यक्रम का विवरण" },
        section_name: { en: "Academic Record", hi: "शैक्षणिक योग्यता" },
        field_type: "text",
        required_status: true,
        display_order: 11,
        source_note: "PostMatric_ScholarShip_Application .pdf, Page 2, Item 13",
        is_sensitive_id: false,
        field_instruction: {
          en: "Institution name, Course/Degree name, current Class Year, and institutional student Roll Number.",
          hi: "वर्तमान कॉलेज/संस्थान का नाम, पाठ्यक्रम, कक्षा वर्ष और छात्र रोल नंबर भरें।",
        },
      },
      {
        id: "nsp-12",
        field_label: { en: "14. Student Bank Account Details (Bank, Branch, Account No, IFSC)", hi: "14. छात्र का बैंक खाता विवरण (बैंक, शाखा, खाता संख्या, आईएफएससी)" },
        section_name: { en: "Sensitive Banking Identification", hi: "संवेदनशील बैंक पहचान" },
        field_type: "text",
        required_status: true,
        display_order: 12,
        source_note: "PostMatric_ScholarShip_Application .pdf, Page 2, Item 14",
        is_sensitive_id: true,
        sensitive_help: {
          en: "Enter directly on the official application form / scholarship portal. Must be student's own individual active savings account. SchemeSetu does not collect bank details.",
          hi: "सीधे आधिकारिक आवेदन फॉर्म पर भरें। खाता छात्र के स्वयं के नाम पर और आधार से लिंक होना चाहिए। योजनासेतु बैंक खाता विवरण नहीं मांगता।",
          documentNeeded: "Student's Bank Passbook with branch IFSC",
        },
        field_instruction: {
          en: "Enter your individual bank account number and IFSC directly on the official form. SchemeSetu does not collect bank accounts.",
          hi: "छात्रवृत्ति राशि सीधे खाते में पाने हेतु अपना बैंक खाता विवरण सीधे सरकारी फॉर्म में भरें।",
        },
      },
      {
        id: "nsp-13",
        field_label: { en: "15. Hostel Details (if Hosteller)", hi: "15. छात्रावास विवरण (यदि छात्रावासी हैं)" },
        section_name: { en: "Hostel Particulars", hi: "छात्रावास विवरण" },
        field_type: "text",
        required_status: false,
        display_order: 13,
        source_note: "PostMatric_ScholarShip_Application .pdf, Page 2, Item 19",
        is_sensitive_id: false,
        field_instruction: {
          en: "For hostellers only: Hostel name, address, joining date, and monthly charges payable (certified by Hostel Superintendent).",
          hi: "छात्रावासी छात्र हेतु: छात्रावास का नाम, प्रवेश तिथि और अधीक्षक द्वारा प्रमाणित मासिक शुल्क।",
        },
      },
      {
        id: "nsp-14",
        field_label: { en: "16. Applicant Undertaking & Verification by Head of Institution", hi: "16. छात्र वचनबद्धता एवं संस्था प्रमुख का सत्यापन" },
        section_name: { en: "Declarations & Institutional Verification", hi: "सत्यापन एवं मुहर" },
        field_type: "declaration",
        required_status: true,
        display_order: 14,
        source_note: "PostMatric_ScholarShip_Application .pdf, Page 2, Verification Seal",
        is_sensitive_id: false,
        field_instruction: {
          en: "Applicant signature affirming accuracy of statements, followed by institutional seal and signature of the College Principal / Head of Institution.",
          hi: "छात्र के हस्ताक्षर और कॉलेज के प्राचार्य / संस्था प्रमुख की आधिकारिक मुहर व हस्ताक्षर।",
        },
      },
    ],
  },
};

/**
 * Fetch official form template for a scheme.
 * Attempts Supabase first, falls back gracefully to verified in-code templates.
 * If scheme has no verified template, returns a pending template object.
 */
export async function getOfficialFormTemplate(schemeId: string, schemeName?: string): Promise<OfficialFormTemplate> {
  // Check in-code verified templates first
  if (VERIFIED_FORM_TEMPLATES[schemeId]) {
    return VERIFIED_FORM_TEMPLATES[schemeId]!;
  }

  // Check by normalized slug
  const normalizedId = schemeId.toLowerCase().replace(/[^a-z0-9]/g, "");
  for (const [key, template] of Object.entries(VERIFIED_FORM_TEMPLATES)) {
    if (key.toLowerCase().replace(/[^a-z0-9]/g, "") === normalizedId) {
      return template;
    }
  }

  // Attempt Supabase query if configured
  try {
    const { data: templateData, error: templateError } = await supabase
      .from("form_templates")
      .select("*")
      .eq("scheme_id", schemeId)
      .maybeSingle();

    if (!templateError && templateData) {
      const { data: fieldsData } = await supabase
        .from("form_template_fields")
        .select("*")
        .eq("template_id", templateData.id)
        .order("display_order", { ascending: true });

      return {
        id: templateData.id,
        scheme_id: templateData.scheme_id,
        scheme_name: schemeName || templateData.official_form_title,
        official_form_title: templateData.official_form_title,
        published_authority: templateData.published_authority,
        source_url: templateData.source_url,
        blank_pdf_url: templateData.blank_pdf_url,
        verification_status: templateData.verification_status,
        general_steps: templateData.general_steps || [],
        key_documents_needed: [],
        fields: (fieldsData as OfficialFormField[]) || [],
      };
    }
  } catch (err) {
    console.warn("Supabase form template fetch skipped or table unmigrated:", err);
  }

  // Graceful Pending Verification fallback (Do NOT invent fake fields)
  return {
    id: `pending-${schemeId}`,
    scheme_id: schemeId,
    scheme_name: schemeName || "Selected Government Scheme",
    official_form_title: "Application form guide is not available yet",
    published_authority: "Concerned Government Department",
    source_url: "https://india.gov.in",
    blank_pdf_url: null,
    verification_status: "pending",
    general_steps: [
      {
        en: "Application form guide is not available yet for this scheme.",
        hi: "इस योजना के लिए आवेदन प्रपत्र मार्गदर्शिका अभी उपलब्ध नहीं है।",
      },
      {
        en: "Official application form PDF has not been uploaded to the scheme repository yet.",
        hi: "इस योजना का आधिकारिक खाली फॉर्म अभी रिपॉजिटरी में उपलब्ध नहीं कराया गया है।",
      },
      {
        en: "You can apply through the official government portal or visit your nearest Common Service Centre (CSC).",
        hi: "आप आधिकारिक सरकारी पोर्टल के माध्यम से या निकटतम जनसेवा केंद्र (CSC) पर जाकर आवेदन कर सकते हैं।",
      },
    ],
    key_documents_needed: [
      { en: "Identity Proof (Aadhaar / Voter ID)", hi: "पहचान प्रमाण (आधार / मतदाता पहचान पत्र)" },
      { en: "State Domicile Certificate", hi: "मूल निवास प्रमाण पत्र" },
      { en: "Bank Passbook with active DBT status", hi: "डीबीटी सक्रिय बैंक पासबुक" },
    ],
    fields: [], // Strictly no fabricated fields
  };
}

/**
 * Maps previously confirmed user details from Step 2 as helper reference notes
 * WITHOUT collecting or storing sensitive IDs like Aadhaar or bank numbers.
 */
export function getConfirmedHelperReference(
  fieldOrLabel: OfficialFormField | { field_label?: { en: string; hi?: string }; is_sensitive_id?: boolean } | string,
  profile: Profile
): { label: { en: string; hi: string }; value: string } | null {
  if (!fieldOrLabel) return null;

  let labelEn = "";
  if (typeof fieldOrLabel === "string") {
    labelEn = fieldOrLabel.toLowerCase();
  } else {
    // STRICT SECURITY CHECK: Never map helper values to sensitive IDs
    if (fieldOrLabel.is_sensitive_id) {
      return null;
    }
    labelEn = fieldOrLabel.field_label?.en?.toLowerCase() || "";
  }

  // Name check
  if (labelEn.includes("name") && !labelEn.includes("father") && !labelEn.includes("husband") && profile.name.trim()) {
    return {
      label: { en: "Your confirmed name:", hi: "आपका पुष्ट नाम:" },
      value: profile.name.trim(),
    };
  }

  // Age check
  if (labelEn.includes("age") || labelEn.includes("birth")) {
    if (profile.age.trim()) {
      return {
        label: { en: "Your confirmed age:", hi: "आपकी पुष्ट आयु:" },
        value: `${profile.age.trim()} years`,
      };
    }
  }

  // State check
  if (labelEn.includes("state") && profile.state.trim() && profile.state !== "All States") {
    return {
      label: { en: "Your confirmed state:", hi: "आपका पुष्ट राज्य:" },
      value: profile.state.trim(),
    };
  }

  // Income check
  if (labelEn.includes("income") && profile.income.trim()) {
    const num = Number(profile.income);
    const formatted = !isNaN(num) ? `₹${num.toLocaleString("en-IN")}` : `₹${profile.income}`;
    return {
      label: { en: "Your confirmed family income:", hi: "आपकी पुष्ट वार्षिक आय:" },
      value: formatted,
    };
  }

  // Category check
  if ((labelEn.includes("category") || labelEn.includes("caste") || labelEn.includes("वर्ग")) && profile.category.trim()) {
    return {
      label: { en: "Your confirmed category:", hi: "आपकी पुष्ट श्रेणी:" },
      value: profile.category.trim(),
    };
  }

  return null;
}
