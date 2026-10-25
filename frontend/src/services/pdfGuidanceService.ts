/**
 * Module 6: In-Field PDF Instructional Guidance Service
 * Stores verified page-relative coordinates, real blank field positions,
 * concise English and Hindi instructional hints directly placed on the blank fields,
 * and sensitive ID protections for all 4 blank application forms in Supabase Storage.
 */

export interface PdfFieldGuidance {
  id: string;
  scheme_id: string;
  field_label: {
    en: string;
    hi: string;
  };
  page_number: number;
  top_pct: number; // 0 to 100% from top of page container
  left_pct: number; // 0 to 100% from left of page container
  display_number: number;
  required: boolean;
  hint_text: {
    en: string; // Short bracketed instruction, e.g. [Enter your full name here]
    hi: string; // Short Hindi instruction, e.g. [यहाँ अपना पूरा नाम लिखें]
  };
  guidance_text: {
    en: string;
    hi: string;
  };
  example?: {
    en: string;
    hi: string;
  };
  is_sensitive_id: boolean;
  sensitive_notice?: {
    en: string;
    hi: string;
  };
}

export interface SchemePdfGuideInfo {
  scheme_id: string;
  scheme_name: string;
  pdf_storage_path: string | null;
  public_pdf_url: string | null;
  total_pages: number;
  is_available: boolean;
  markers: PdfFieldGuidance[];
}

export const SCHEME_PDF_GUIDANCE_MAP: Record<string, SchemePdfGuideInfo> = {
  // =========================================================================
  // SCHEME 1: Post-Matric Scholarship
  // PDF: Scheme_Forms/PostMatric_ScholarShip_Application .pdf
  // =========================================================================
  "36fa81fa-f5cc-4f72-8c0e-9adfb4f84559": {
    scheme_id: "36fa81fa-f5cc-4f72-8c0e-9adfb4f84559",
    scheme_name: "Post-Matric Scholarship",
    pdf_storage_path: "PostMatric_ScholarShip_Application .pdf",
    public_pdf_url:
      "https://tgsdyuzkwlxsmudydddt.supabase.co/storage/v1/object/public/Scheme_Forms/PostMatric_ScholarShip_Application%20.pdf",
    total_pages: 2,
    is_available: true,
    markers: [
      {
        id: "nsp-g1",
        scheme_id: "36fa81fa-f5cc-4f72-8c0e-9adfb4f84559",
        display_number: 1,
        page_number: 1,
        top_pct: 10.6,
        left_pct: 53.0,
        field_label: {
          en: "Application Type & Entitlement Card No",
          hi: "आवेदन प्रकार एवं कार्ड संख्या",
        },
        required: true,
        hint_text: {
          en: "[Card No. if renewal, else 'NEW']",
          hi: "[कार्ड सं. (नवीनीकरण) अथवा 'NEW']",
        },
        guidance_text: {
          en: "Indicate whether this is a NEW application or a RENEWAL, and enter your Entitlement Card No if renewal.",
          hi: "चुनें कि यह नया आवेदन (NEW) है या नवीनीकरण (RENEWAL), और नवीनीकरण होने पर कार्ड संख्या भरें।",
        },
        example: { en: "e.g. NEW", hi: "उदा. NEW" },
        is_sensitive_id: false,
      },
      {
        id: "nsp-g2",
        scheme_id: "36fa81fa-f5cc-4f72-8c0e-9adfb4f84559",
        display_number: 2,
        page_number: 1,
        top_pct: 12.8,
        left_pct: 38.0,
        field_label: {
          en: "1. Full Name of Applicant (In Block letters)",
          hi: "1. छात्र का पूरा नाम (बड़े अक्षरों में)",
        },
        required: true,
        hint_text: {
          en: "[Enter your full name here in BLOCK letters]",
          hi: "[यहाँ अपना पूरा नाम बड़े अक्षरों में लिखें]",
        },
        guidance_text: {
          en: "Write student's full name in BLOCK capital letters matching Matriculation / Class 10 certificate.",
          hi: "मैट्रिक / हाई स्कूल प्रमाण पत्र के अनुसार अपना पूरा नाम अंग्रेजी के बड़े अक्षरों में लिखें।",
        },
        example: { en: "e.g. AMITAVA SARKAR", hi: "उदा. अमिताव सरकार" },
        is_sensitive_id: false,
      },
      {
        id: "nsp-g3",
        scheme_id: "36fa81fa-f5cc-4f72-8c0e-9adfb4f84559",
        display_number: 3,
        page_number: 1,
        top_pct: 15.4,
        left_pct: 32.0,
        field_label: {
          en: "2. Name of Father/Husband",
          hi: "2. पिता / पति का नाम",
        },
        required: true,
        hint_text: {
          en: "[Enter father's or husband's full name]",
          hi: "[यहाँ पिता या पति का नाम लिखें]",
        },
        guidance_text: {
          en: "Write father's or husband's full name matching educational records.",
          hi: "शैक्षणिक अभिलेखों के अनुसार पिता या पति का पूरा नाम लिखें।",
        },
        example: { en: "e.g. Bimal Sarkar", hi: "उदा. बिमल सरकार" },
        is_sensitive_id: false,
      },
      {
        id: "nsp-g3-sex",
        scheme_id: "36fa81fa-f5cc-4f72-8c0e-9adfb4f84559",
        display_number: 4,
        page_number: 1,
        top_pct: 15.4,
        left_pct: 76.0,
        field_label: { en: "2. Sex", hi: "2. लिंग" },
        required: true,
        hint_text: {
          en: "[Male / Female / Other]",
          hi: "[पुरुष / महिला / अन्य]",
        },
        guidance_text: {
          en: "Write applicant's gender (Male / Female / Other).",
          hi: "आवेदक का लिंग (पुरुष / महिला / अन्य) लिखें।",
        },
        example: { en: "e.g. Male", hi: "उदा. पुरुष" },
        is_sensitive_id: false,
      },
      {
        id: "nsp-g4",
        scheme_id: "36fa81fa-f5cc-4f72-8c0e-9adfb4f84559",
        display_number: 5,
        page_number: 1,
        top_pct: 17.4,
        left_pct: 20.0,
        field_label: {
          en: "3. Date of Birth",
          hi: "3. जन्म तिथि",
        },
        required: true,
        hint_text: {
          en: "[Enter your date of birth (DD/MM/YYYY)]",
          hi: "[यहाँ अपनी जन्म तिथि लिखें (दिन/माह/वर्ष)]",
        },
        guidance_text: {
          en: "Date of birth as per Class 10th admit card or birth certificate.",
          hi: "10वीं के एडमिट कार्ड अथवा जन्म प्रमाण पत्र के अनुसार जन्मतिथि भरें।",
        },
        example: { en: "e.g. 12/08/2004", hi: "उदा. 12/08/2004" },
        is_sensitive_id: false,
      },
      {
        id: "nsp-g4-marital",
        scheme_id: "36fa81fa-f5cc-4f72-8c0e-9adfb4f84559",
        display_number: 6,
        page_number: 1,
        top_pct: 17.4,
        left_pct: 57.0,
        field_label: {
          en: "4. Marital status",
          hi: "4. वैवाहिक स्थिति",
        },
        required: true,
        hint_text: {
          en: "[Unmarried / Married]",
          hi: "[अविवाहित / विवाहित]",
        },
        guidance_text: {
          en: "State whether unmarried or married.",
          hi: "वैवाहिक स्थिति (अविवाहित अथवा विवाहित) भरें।",
        },
        example: { en: "e.g. Unmarried", hi: "उदा. अविवाहित" },
        is_sensitive_id: false,
      },
      {
        id: "nsp-g5",
        scheme_id: "36fa81fa-f5cc-4f72-8c0e-9adfb4f84559",
        display_number: 7,
        page_number: 1,
        top_pct: 21.4,
        left_pct: 26.0,
        field_label: {
          en: "8. a) Caste: (SC/ST/OBC)",
          hi: "8. क) जाति (SC/ST/OBC)",
        },
        required: true,
        hint_text: {
          en: "[Write SC, ST, or OBC]",
          hi: "[SC / ST / OBC दर्ज करें]",
        },
        guidance_text: {
          en: "Specify SC, ST, or OBC matching digital caste certificate.",
          hi: "जाति प्रमाण पत्र के अनुसार आरक्षित श्रेणी (SC/ST/OBC) चुनें।",
        },
        example: { en: "e.g. SC", hi: "उदा. SC" },
        is_sensitive_id: false,
      },
      {
        id: "nsp-g5-sub",
        scheme_id: "36fa81fa-f5cc-4f72-8c0e-9adfb4f84559",
        display_number: 8,
        page_number: 1,
        top_pct: 21.4,
        left_pct: 60.0,
        field_label: {
          en: "8. b) Sub-Caste",
          hi: "8. ख) उप-जाति",
        },
        required: true,
        hint_text: {
          en: "[Enter sub-caste name]",
          hi: "[यहाँ उप-जाति का नाम लिखें]",
        },
        guidance_text: {
          en: "Write sub-caste name matching official caste certificate.",
          hi: "जाति प्रमाण पत्र में अंकित उप-जाति का नाम लिखें।",
        },
        example: { en: "e.g. Rajbanshi", hi: "उदा. राजबंशी" },
        is_sensitive_id: false,
      },
      {
        id: "nsp-g6-state",
        scheme_id: "36fa81fa-f5cc-4f72-8c0e-9adfb4f84559",
        display_number: 9,
        page_number: 1,
        top_pct: 23.4,
        left_pct: 45.0,
        field_label: {
          en: "9. a) State to which applicant belongs",
          hi: "9. क) मूल निवास राज्य",
        },
        required: true,
        hint_text: {
          en: "[Enter your domicile state]",
          hi: "[अपने गृह राज्य का नाम लिखें]",
        },
        guidance_text: {
          en: "Enter the State where applicant permanently resides and holds domicile.",
          hi: "उस राज्य का नाम भरें जहाँ का स्थायी निवास प्रमाण पत्र आपके पास है।",
        },
        example: { en: "e.g. West Bengal", hi: "उदा. पश्चिम बंगाल" },
        is_sensitive_id: false,
      },
      {
        id: "nsp-g6",
        scheme_id: "36fa81fa-f5cc-4f72-8c0e-9adfb4f84559",
        display_number: 10,
        page_number: 1,
        top_pct: 25.4,
        left_pct: 28.0,
        field_label: {
          en: "9. b) Permanent Address",
          hi: "9. ख) स्थायी पता",
        },
        required: true,
        hint_text: {
          en: "[Enter village / town & house address]",
          hi: "[ग्राम / नगर एवं मकान का पता लिखें]",
        },
        guidance_text: {
          en: "Enter complete permanent street address, village/town name.",
          hi: "ग्राम/नगर एवं मकान संख्या सहित पूरा स्थायी पता भरें।",
        },
        example: { en: "e.g. Village Shivnagar", hi: "उदा. ग्राम शिवनगर" },
        is_sensitive_id: false,
      },
      {
        id: "nsp-g6-po",
        scheme_id: "36fa81fa-f5cc-4f72-8c0e-9adfb4f84559",
        display_number: 11,
        page_number: 1,
        top_pct: 25.4,
        left_pct: 71.0,
        field_label: { en: "Post Office (P.O.)", hi: "डाकघर (P.O.)" },
        required: true,
        hint_text: {
          en: "[Post Office name]",
          hi: "[डाकघर का नाम]",
        },
        guidance_text: {
          en: "Enter your local postal delivery office name.",
          hi: "अपने डाकघर का नाम लिखें।",
        },
        example: { en: "e.g. Ranaghat", hi: "उदा. राणाघाट" },
        is_sensitive_id: false,
      },
      {
        id: "nsp-g6-ps",
        scheme_id: "36fa81fa-f5cc-4f72-8c0e-9adfb4f84559",
        display_number: 12,
        page_number: 1,
        top_pct: 27.4,
        left_pct: 14.0,
        field_label: { en: "Police Station (P.S.)", hi: "थाना (P.S.)" },
        required: true,
        hint_text: {
          en: "[Police Station]",
          hi: "[थाने का नाम]",
        },
        guidance_text: {
          en: "Enter local police jurisdiction station name.",
          hi: "अपने संबंधित थाने का नाम लिखें।",
        },
        example: { en: "e.g. Taherpur", hi: "उदा. ताहिरपुर" },
        is_sensitive_id: false,
      },
      {
        id: "nsp-g6-dist",
        scheme_id: "36fa81fa-f5cc-4f72-8c0e-9adfb4f84559",
        display_number: 13,
        page_number: 1,
        top_pct: 27.4,
        left_pct: 42.0,
        field_label: { en: "District", hi: "जिला" },
        required: true,
        hint_text: {
          en: "[District name]",
          hi: "[जिले का नाम]",
        },
        guidance_text: {
          en: "Enter administrative district name.",
          hi: "जिले का नाम लिखें।",
        },
        example: { en: "e.g. Nadia", hi: "उदा. नदिया" },
        is_sensitive_id: false,
      },
      {
        id: "nsp-g7",
        scheme_id: "36fa81fa-f5cc-4f72-8c0e-9adfb4f84559",
        display_number: 14,
        page_number: 1,
        top_pct: 35.4,
        left_pct: 18.0,
        field_label: {
          en: "11. Guardian Name & Occupation",
          hi: "11. अभिभावक का विवरण एवं व्यवसाय",
        },
        required: true,
        hint_text: {
          en: "[Enter parent or guardian's full name]",
          hi: "[अभिभावक का पूरा नाम लिखें]",
        },
        guidance_text: {
          en: "Name, occupation, address of father/guardian who supports studies.",
          hi: "अभिभावक का नाम एवं व्यवसाय भरें।",
        },
        example: { en: "e.g. Bimal Sarkar", hi: "उदा. बिमल सरकार" },
        is_sensitive_id: false,
      },
      {
        id: "nsp-g8-bank",
        scheme_id: "36fa81fa-f5cc-4f72-8c0e-9adfb4f84559",
        display_number: 15,
        page_number: 1,
        top_pct: 41.3,
        left_pct: 30.0,
        field_label: { en: "12. a) Bank Name", hi: "12. क) बैंक का नाम" },
        required: true,
        hint_text: {
          en: "[Enter Bank Name (e.g. SBI)]",
          hi: "[बैंक का नाम लिखें (उदा. SBI)]",
        },
        guidance_text: {
          en: "Enter Core Banking Bank name.",
          hi: "बैंक का नाम लिखें।",
        },
        example: { en: "e.g. State Bank of India", hi: "उदा. स्टेट बैंक ऑफ इंडिया" },
        is_sensitive_id: false,
      },
      {
        id: "nsp-g8-branch",
        scheme_id: "36fa81fa-f5cc-4f72-8c0e-9adfb4f84559",
        display_number: 16,
        page_number: 1,
        top_pct: 41.3,
        left_pct: 68.0,
        field_label: { en: "12. b) Branch", hi: "12. ख) बैंक शाखा" },
        required: true,
        hint_text: {
          en: "[Enter Branch Name]",
          hi: "[शाखा का नाम लिखें]",
        },
        guidance_text: {
          en: "Enter home branch name of account.",
          hi: "बैंक शाखा का नाम लिखें।",
        },
        example: { en: "e.g. Ranaghat Branch", hi: "उदा. राणाघाट शाखा" },
        is_sensitive_id: false,
      },
      {
        id: "nsp-g8",
        scheme_id: "36fa81fa-f5cc-4f72-8c0e-9adfb4f84559",
        display_number: 17,
        page_number: 1,
        top_pct: 43.3,
        left_pct: 20.0,
        field_label: {
          en: "12. c) S.B A/C No.",
          hi: "12. ग) बचत खाता संख्या",
        },
        required: true,
        hint_text: {
          en: "[Enter student's DBT Savings Account No.]",
          hi: "[छात्र का आधार लिंक बचत खाता नंबर भरें]",
        },
        guidance_text: {
          en: "Enter student's own active Savings Account number directly on the official form. SchemeSetu does not collect bank accounts.",
          hi: "छात्रवृत्ति राशि सीधे खाते में पाने हेतु अपना बैंक खाता संख्या सीधे सरकारी फॉर्म पर भरें। योजनासेतु बैंक खाता नंबर एकत्र नहीं करता।",
        },
        is_sensitive_id: true,
        sensitive_notice: {
          en: "Must be student's own individual active savings account seeded with Aadhaar for PFMS/DBT transfer.",
          hi: "पीएफएमएस डीबीटी भुगतान के लिए खाता छात्र के नाम पर और आधार लिंक होना चाहिए।",
        },
      },
      {
        id: "nsp-g8-ifsc",
        scheme_id: "36fa81fa-f5cc-4f72-8c0e-9adfb4f84559",
        display_number: 18,
        page_number: 1,
        top_pct: 43.3,
        left_pct: 61.0,
        field_label: { en: "12. d) IFSC Code", hi: "12. घ) आईएफएससी कोड" },
        required: true,
        hint_text: {
          en: "[11-character Bank IFSC Code]",
          hi: "[11 अंकों का बैंक IFSC कोड भरें]",
        },
        guidance_text: {
          en: "Enter 11-digit IFSC printed on passbook.",
          hi: "पासबुक में मुद्रित 11 अंकों का आईएफएससी कोड भरें।",
        },
        example: { en: "e.g. SBIN0000123", hi: "उदा. SBIN0000123" },
        is_sensitive_id: true,
      },
      {
        id: "nsp-g9-inst",
        scheme_id: "36fa81fa-f5cc-4f72-8c0e-9adfb4f84559",
        display_number: 19,
        page_number: 1,
        top_pct: 47.3,
        left_pct: 12.0,
        field_label: {
          en: "13. a) Name & Address of Institution",
          hi: "13. क) शिक्षण संस्थान का नाम व पता",
        },
        required: true,
        hint_text: {
          en: "[Enter College / School Name & Full Address]",
          hi: "[कॉलेज / स्कूल का नाम एवं पूरा पता लिखें]",
        },
        guidance_text: {
          en: "Write registered name and complete address of College or School.",
          hi: "अपने कॉलेज अथवा विद्यालय का नाम एवं पूरा पता लिखें।",
        },
        example: { en: "e.g. Ranaghat College, Dist Nadia, West Bengal", hi: "उदा. राणाघाट कॉलेज, नदिया" },
        is_sensitive_id: false,
      },
      {
        id: "nsp-g9-course",
        scheme_id: "36fa81fa-f5cc-4f72-8c0e-9adfb4f84559",
        display_number: 20,
        page_number: 1,
        top_pct: 51.3,
        left_pct: 32.0,
        field_label: {
          en: "13. b) Class & Course of Study",
          hi: "13. ख) कक्षा व पाठ्यक्रम",
        },
        required: true,
        hint_text: {
          en: "[Class / Course (e.g. B.Tech / B.A / Class 11)]",
          hi: "[कक्षा व पाठ्यक्रम (उदा. 11वीं / बी.ए. प्रथम वर्ष)]",
        },
        guidance_text: {
          en: "Current class or enrolled degree/diploma course name.",
          hi: "वर्तमान कक्षा अथवा पाठ्यक्रम का नाम लिखें।",
        },
        example: { en: "e.g. B.A. History (Honours) 1st Year", hi: "उदा. बी.ए. प्रथम वर्ष" },
        is_sensitive_id: false,
      },
      {
        id: "nsp-g10",
        scheme_id: "36fa81fa-f5cc-4f72-8c0e-9adfb4f84559",
        display_number: 21,
        page_number: 1,
        top_pct: 88.3,
        left_pct: 45.0,
        field_label: {
          en: "18. Annual Gross Family Income",
          hi: "18. कुल वार्षिक पारिवारिक आय",
        },
        required: true,
        hint_text: {
          en: "[Enter annual family income as per certificate]",
          hi: "[प्रमाण पत्र के अनुसार वार्षिक पारिवारिक आय लिखें]",
        },
        guidance_text: {
          en: "Enter total family gross annual income from all sources in rupees matching revenue income certificate.",
          hi: "आय प्रमाण पत्र के अनुसार सभी स्रोतों से कुल वार्षिक पारिवारिक आय रुपये में लिखें।",
        },
        example: { en: "e.g. 1,20,000", hi: "उदा. 1,20,000" },
        is_sensitive_id: false,
      },
      // Page 2 fields
      {
        id: "nsp-g11",
        scheme_id: "36fa81fa-f5cc-4f72-8c0e-9adfb4f84559",
        display_number: 22,
        page_number: 2,
        top_pct: 7.0,
        left_pct: 40.0,
        field_label: {
          en: "Hostel / Day Scholar Details",
          hi: "छात्रावास / डे-स्कॉलर विवरण",
        },
        required: true,
        hint_text: {
          en: "[Hostel name or write 'Day Scholar']",
          hi: "[छात्रावास का नाम अथवा 'Day Scholar' लिखें]",
        },
        guidance_text: {
          en: "If staying in hostel, enter hostel name and date of admission, else write Day Scholar.",
          hi: "यदि छात्रावास में रहते हैं तो नाम लिखें अथवा 'Day Scholar' लिखें।",
        },
        example: { en: "e.g. Day Scholar", hi: "उदा. डे-स्कॉलर" },
        is_sensitive_id: false,
      },
      {
        id: "nsp-g12",
        scheme_id: "36fa81fa-f5cc-4f72-8c0e-9adfb4f84559",
        display_number: 23,
        page_number: 2,
        top_pct: 53.4,
        left_pct: 35.0,
        field_label: {
          en: "Verification by Head of Institution",
          hi: "संस्था प्रमुख का सत्यापन एवं मुहर",
        },
        required: true,
        hint_text: {
          en: "[Principal Signature & Official Seal]",
          hi: "[प्राचार्य के हस्ताक्षर व आधिकारिक मुहर]",
        },
        guidance_text: {
          en: "College Principal or Head of Institution verifies student enrollment with signature and seal.",
          hi: "कॉलेज के प्राचार्य / संस्था प्रमुख के सत्यापन हस्ताक्षर व मुहर।",
        },
        is_sensitive_id: false,
      },
      {
        id: "nsp-g13",
        scheme_id: "36fa81fa-f5cc-4f72-8c0e-9adfb4f84559",
        display_number: 24,
        page_number: 2,
        top_pct: 70.8,
        left_pct: 65.0,
        field_label: {
          en: "DECLARATION OF INCOME (By Parent / Guardian)",
          hi: "आय की घोषणा (अभिभावक द्वारा)",
        },
        required: true,
        hint_text: {
          en: "[Enter annual income (in figures & words)]",
          hi: "[अभिभावक द्वारा वार्षिक आय (अंकों व शब्दों में)]",
        },
        guidance_text: {
          en: "Parent or guardian affirms gross annual income and signs declaration.",
          hi: "माता-पिता अथवा अभिभावक द्वारा वार्षिक आय की पुष्टि करते हुए हस्ताक्षर।",
        },
        example: { en: "e.g. Rs. 1,20,000/-", hi: "उदा. ₹1,20,000/-" },
        is_sensitive_id: false,
      },
    ],
  },

  // =========================================================================
  // SCHEME 2: PM-Kisan Samman Nidhi
  // PDF: Scheme_Forms/SammanNidhi.pdf
  // =========================================================================
  "45170ee9-d661-4746-a2bf-9d781719de7d": {
    scheme_id: "45170ee9-d661-4746-a2bf-9d781719de7d",
    scheme_name: "PM-Kisan Samman Nidhi",
    pdf_storage_path: "SammanNidhi.pdf",
    public_pdf_url:
      "https://tgsdyuzkwlxsmudydddt.supabase.co/storage/v1/object/public/Scheme_Forms/SammanNidhi.pdf",
    total_pages: 3,
    is_available: true,
    markers: [
      {
        id: "pmk-g1",
        scheme_id: "45170ee9-d661-4746-a2bf-9d781719de7d",
        display_number: 1,
        page_number: 1,
        top_pct: 17.9,
        left_pct: 18.5,
        field_label: { en: "1. District", hi: "1. जिला" },
        required: true,
        hint_text: {
          en: "[Enter revenue district name]",
          hi: "[यहाँ जिले का नाम लिखें]",
        },
        guidance_text: {
          en: "Enter the revenue district where your agricultural land is located.",
          hi: "उस जिले का नाम लिखें जहाँ आपकी कृषि भूमि स्थित है।",
        },
        example: { en: "e.g. Varanasi", hi: "उदा. वाराणसी" },
        is_sensitive_id: false,
      },
      {
        id: "pmk-g2",
        scheme_id: "45170ee9-d661-4746-a2bf-9d781719de7d",
        display_number: 2,
        page_number: 1,
        top_pct: 17.9,
        left_pct: 58.0,
        field_label: { en: "2. Sub-Division", hi: "2. उप-मंडल" },
        required: true,
        hint_text: {
          en: "[Enter sub-division name]",
          hi: "[यहाँ उप-मंडल का नाम लिखें]",
        },
        guidance_text: {
          en: "Enter the administrative sub-division under which your Tehsil falls.",
          hi: "अपने जिले के उप-मंडल का नाम दर्ज करें।",
        },
        example: { en: "e.g. Pindra", hi: "उदा. पिंडरा" },
        is_sensitive_id: false,
      },
      {
        id: "pmk-g3",
        scheme_id: "45170ee9-d661-4746-a2bf-9d781719de7d",
        display_number: 3,
        page_number: 1,
        top_pct: 19.7,
        left_pct: 28.5,
        field_label: { en: "3. Circle/Tehsil Block", hi: "3. तहसील / सर्किल" },
        required: true,
        hint_text: {
          en: "[Enter Tehsil / Circle name]",
          hi: "[यहाँ तहसील का नाम लिखें]",
        },
        guidance_text: {
          en: "Enter your revenue Tehsil circle office name.",
          hi: "अपनी तहसील का नाम दर्ज करें।",
        },
        example: { en: "e.g. Sadar", hi: "उदा. सदर" },
        is_sensitive_id: false,
      },
      {
        id: "pmk-g4",
        scheme_id: "45170ee9-d661-4746-a2bf-9d781719de7d",
        display_number: 4,
        page_number: 1,
        top_pct: 19.7,
        left_pct: 54.0,
        field_label: { en: "4. Block", hi: "4. ब्लॉक" },
        required: true,
        hint_text: {
          en: "[Enter development block]",
          hi: "[यहाँ विकास खंड का नाम लिखें]",
        },
        guidance_text: {
          en: "Enter your community development block.",
          hi: "अपने विकास खंड का नाम दर्ज करें।",
        },
        example: { en: "e.g. Kashi Vidyapeeth", hi: "उदा. काशी विद्यापीठ" },
        is_sensitive_id: false,
      },
      {
        id: "pmk-g5",
        scheme_id: "45170ee9-d661-4746-a2bf-9d781719de7d",
        display_number: 5,
        page_number: 1,
        top_pct: 21.6,
        left_pct: 50.0,
        field_label: {
          en: "5. Municipality / Village",
          hi: "5. गाँव / ग्राम पंचायत",
        },
        required: true,
        hint_text: {
          en: "[Enter village or Gram Panchayat]",
          hi: "[यहाँ गाँव या ग्राम पंचायत लिखें]",
        },
        guidance_text: {
          en: "Enter your revenue village name as inscribed in Land Khatauni.",
          hi: "खतौनी के अनुसार अपने राजस्व गाँव या ग्राम पंचायत का नाम लिखें।",
        },
        example: { en: "e.g. Shivpur", hi: "उदा. शिवपुर" },
        is_sensitive_id: false,
      },
      {
        id: "pmk-g6",
        scheme_id: "45170ee9-d661-4746-a2bf-9d781719de7d",
        display_number: 6,
        page_number: 1,
        top_pct: 23.3,
        left_pct: 32.0,
        field_label: { en: "6. Full Name of the Farmer", hi: "6. किसान का पूरा नाम" },
        required: true,
        hint_text: {
          en: "[Enter farmer's full name as in Aadhaar]",
          hi: "[यहाँ आधार अनुसार किसान का पूरा नाम लिखें]",
        },
        guidance_text: {
          en: "Write farmer's full name in CAPITAL letters exactly as in Aadhaar.",
          hi: "आधार और खतौनी के अनुसार किसान का पूरा नाम बड़े अक्षरों में लिखें।",
        },
        example: { en: "e.g. RAMESH KUMAR", hi: "उदा. रमेश कुमार" },
        is_sensitive_id: false,
      },
      {
        id: "pmk-g7",
        scheme_id: "45170ee9-d661-4746-a2bf-9d781719de7d",
        display_number: 7,
        page_number: 1,
        top_pct: 26.8,
        left_pct: 24.0,
        field_label: { en: "7. Date of Birth", hi: "7. जन्म तिथि" },
        required: true,
        hint_text: {
          en: "[DD / MM / YYYY]",
          hi: "[दिन / माह / वर्ष]",
        },
        guidance_text: {
          en: "Date of birth in DD/MM/YYYY format matching Aadhaar card.",
          hi: "आधार कार्ड के अनुसार जन्म तिथि (दिन/माह/वर्ष) भरें।",
        },
        example: { en: "e.g. 15/06/1982", hi: "उदा. 15/06/1982" },
        is_sensitive_id: false,
      },
      {
        id: "pmk-g8",
        scheme_id: "45170ee9-d661-4746-a2bf-9d781719de7d",
        display_number: 8,
        page_number: 1,
        top_pct: 28.5,
        left_pct: 22.0,
        field_label: { en: "8. Gender / Marital Status", hi: "8. लिंग एवं वैवाहिक स्थिति" },
        required: true,
        hint_text: {
          en: "[Male / Female / Other]",
          hi: "[पुरुष / महिला / अन्य]",
        },
        guidance_text: {
          en: "Indicate Gender (Male / Female) and Marital Status.",
          hi: "अपना लिंग (पुरुष / महिला) एवं वैवाहिक स्थिति भरें।",
        },
        example: { en: "e.g. Male, Married", hi: "उदा. पुरुष, विवाहित" },
        is_sensitive_id: false,
      },
      {
        id: "pmk-g9",
        scheme_id: "45170ee9-d661-4746-a2bf-9d781719de7d",
        display_number: 9,
        page_number: 1,
        top_pct: 30.2,
        left_pct: 34.0,
        field_label: { en: "9. Father’s/Husband’s Name", hi: "9. पिता अथवा पति का नाम" },
        required: true,
        hint_text: {
          en: "[Enter father's or husband's name]",
          hi: "[यहाँ पिता या पति का नाम लिखें]",
        },
        guidance_text: {
          en: "Write father's or husband's full name in capital letters.",
          hi: "आधार एवं खतौनी के अनुसार पिता या पति का पूरा नाम लिखें।",
        },
        example: { en: "e.g. RAMESHWAR PRASAD", hi: "उदा. रामेश्वर प्रसाद" },
        is_sensitive_id: false,
      },
      {
        id: "pmk-g10",
        scheme_id: "45170ee9-d661-4746-a2bf-9d781719de7d",
        display_number: 10,
        page_number: 1,
        top_pct: 31.9,
        left_pct: 26.0,
        field_label: { en: "10. Mobile Number", hi: "10. मोबाइल नंबर" },
        required: true,
        hint_text: {
          en: "[10-digit mobile number]",
          hi: "[10 अंकों का मोबाइल नंबर लिखें]",
        },
        guidance_text: {
          en: "Enter 10-digit Aadhaar-linked active mobile number.",
          hi: "आधार से जुड़ा हुआ 10 अंकों का चालू मोबाइल नंबर दर्ज करें।",
        },
        example: { en: "e.g. 9876543210", hi: "उदा. 9876543210" },
        is_sensitive_id: false,
      },
      {
        id: "pmk-g11",
        scheme_id: "45170ee9-d661-4746-a2bf-9d781719de7d",
        display_number: 11,
        page_number: 1,
        top_pct: 33.6,
        left_pct: 63.0,
        field_label: { en: "12. Aadhaar No.", hi: "12. आधार संख्या" },
        required: true,
        hint_text: {
          en: "[Enter 12-digit Aadhaar directly on official form]",
          hi: "[यहाँ 12 अंकों का आधार नंबर भरें]",
        },
        guidance_text: {
          en: "Enter your 12-digit Aadhaar number directly on the official application form. SchemeSetu does not collect or store your Aadhaar number.",
          hi: "अपना 12 अंकों का आधार नंबर सीधे इस सरकारी फॉर्म पर ही दर्ज करें। योजनासेतु आपका आधार नंबर एकत्र या संग्रहीत नहीं करता है।",
        },
        is_sensitive_id: true,
        sensitive_notice: {
          en: "Keep original Aadhaar card ready with linked phone for OTP e-KYC authentication.",
          hi: "ओटीपी ई-केवाईसी सत्यापन के लिए आधार कार्ड और लिंक फोन पास रखें।",
        },
      },
      {
        id: "pmk-g12",
        scheme_id: "45170ee9-d661-4746-a2bf-9d781719de7d",
        display_number: 12,
        page_number: 1,
        top_pct: 35.4,
        left_pct: 45.0,
        field_label: { en: "15. Residential Address", hi: "15. आवासीय पता" },
        required: true,
        hint_text: {
          en: "[Village, Post & PIN code]",
          hi: "[गाँव, डाकघर एवं पिन कोड लिखें]",
        },
        guidance_text: {
          en: "Write your complete permanent residential address in BLOCK letters with postal PIN code.",
          hi: "पिन कोड सहित अपना स्थायी निवास पता बड़े अक्षरों में लिखें।",
        },
        example: { en: "e.g. Village Shivpur, PIN 221001", hi: "उदा. ग्राम शिवपुर, पिन 221001" },
        is_sensitive_id: false,
      },
      {
        id: "pmk-g13",
        scheme_id: "45170ee9-d661-4746-a2bf-9d781719de7d",
        display_number: 13,
        page_number: 1,
        top_pct: 41.4,
        left_pct: 32.0,
        field_label: { en: "16. Category", hi: "16. जाति वर्ग" },
        required: true,
        hint_text: {
          en: "[Gen / SC / ST / OBC]",
          hi: "[सामान्य / अ.जा. / अ.ज.जा. / ओ.बी.सी.]",
        },
        guidance_text: {
          en: "Tick your category: General, SC, ST, or OBC.",
          hi: "अपनी सामाजिक श्रेणी (सामान्य, अ.जा., अ.ज.जा., या अन्य पिछड़ा वर्ग) चुनें।",
        },
        example: { en: "e.g. OBC", hi: "उदा. अन्य पिछड़ा वर्ग (OBC)" },
        is_sensitive_id: false,
      },
      {
        id: "pmk-g14",
        scheme_id: "45170ee9-d661-4746-a2bf-9d781719de7d",
        display_number: 14,
        page_number: 1,
        top_pct: 67.5,
        left_pct: 20.0,
        field_label: {
          en: "18. Land Holding Details (Dag/Patta/Area)",
          hi: "18. भूमि स्वामित्व विवरण (दाग/पट्टा/क्षेत्रफल)",
        },
        required: true,
        hint_text: {
          en: "[Dag No., Patta No. & Area in Ha]",
          hi: "[दाग सं., पट्टा सं. एवं क्षेत्रफल हेक्टेयर में लिखें]",
        },
        guidance_text: {
          en: "Enter revenue village, Dag No, Patta No, and cultivable land area in Hectares matching Khatauni.",
          hi: "खतौनी के अनुसार दाग नंबर, पट्टा नंबर और भूमि का कुल क्षेत्रफल हेक्टेयर में दर्ज करें।",
        },
        example: { en: "e.g. Dag 142, Patta 85, Area 0.75 Ha", hi: "उदा. दाग 142, पट्टा 85, 0.75 हेक्टेयर" },
        is_sensitive_id: false,
      },
      // Page 2
      {
        id: "pmk-g15",
        scheme_id: "45170ee9-d661-4746-a2bf-9d781719de7d",
        display_number: 15,
        page_number: 2,
        top_pct: 8.8,
        left_pct: 38.0,
        field_label: {
          en: "19. Bank Branch Name",
          hi: "19. बैंक व शाखा का नाम",
        },
        required: true,
        hint_text: {
          en: "[Enter Bank Name & Branch]",
          hi: "[यहाँ बैंक व शाखा का नाम लिखें]",
        },
        guidance_text: {
          en: "Enter Bank and Branch name where farmer holds active savings account.",
          hi: "बैंक का नाम एवं शाखा का नाम दर्ज करें।",
        },
        example: { en: "e.g. State Bank of India, Pindra Branch", hi: "उदा. एसबीआई, पिंडरा शाखा" },
        is_sensitive_id: false,
      },
      {
        id: "pmk-g15-holder",
        scheme_id: "45170ee9-d661-4746-a2bf-9d781719de7d",
        display_number: 16,
        page_number: 2,
        top_pct: 10.5,
        left_pct: 38.0,
        field_label: { en: "19. ii. Name of Account Holder", hi: "19. खाताधारक का नाम" },
        required: true,
        hint_text: {
          en: "[Farmer's name as in passbook]",
          hi: "[पासबुक अनुसार किसान का नाम लिखें]",
        },
        guidance_text: {
          en: "Farmer's name exactly as printed in bank passbook.",
          hi: "बैंक पासबुक में मुद्रित किसान का पूरा नाम भरें।",
        },
        example: { en: "e.g. RAMESH KUMAR", hi: "उदा. रमेश कुमार" },
        is_sensitive_id: false,
      },
      {
        id: "pmk-g15-ifsc",
        scheme_id: "45170ee9-d661-4746-a2bf-9d781719de7d",
        display_number: 17,
        page_number: 2,
        top_pct: 12.2,
        left_pct: 30.0,
        field_label: { en: "19. iii. IFSC Code", hi: "19. आईएफएससी कोड" },
        required: true,
        hint_text: {
          en: "[11-character Bank IFSC]",
          hi: "[11 अंकों का IFSC कोड भरें]",
        },
        guidance_text: {
          en: "11-digit IFSC code printed on passbook.",
          hi: "पासबुक में मुद्रित 11 अंकों का आईएफएससी कोड भरें।",
        },
        example: { en: "e.g. SBIN0001234", hi: "उदा. SBIN0001234" },
        is_sensitive_id: true,
      },
      {
        id: "pmk-g15-acc",
        scheme_id: "45170ee9-d661-4746-a2bf-9d781719de7d",
        display_number: 18,
        page_number: 2,
        top_pct: 13.9,
        left_pct: 32.0,
        field_label: { en: "19. iv. Account number", hi: "19. बैंक खाता संख्या" },
        required: true,
        hint_text: {
          en: "[DBT-enabled Bank Account No.]",
          hi: "[डीबीटी सक्रिय बैंक खाता संख्या भरें]",
        },
        guidance_text: {
          en: "Enter DBT-enabled Bank Account number directly on the official form. SchemeSetu does not collect bank details.",
          hi: "आधार डीबीटी सक्रिय बचत खाता संख्या सीधे सरकारी फॉर्म पर भरें। योजनासेतु बैंक खाता एकत्र नहीं करता।",
        },
        is_sensitive_id: true,
        sensitive_notice: {
          en: "Account must be seeded with Aadhaar for DBT transfer.",
          hi: "खाता आधार से डीबीटी हेतु जुड़ा होना अनिवार्य है।",
        },
      },
      {
        id: "pmk-g16",
        scheme_id: "45170ee9-d661-4746-a2bf-9d781719de7d",
        display_number: 19,
        page_number: 2,
        top_pct: 17.5,
        left_pct: 82.0,
        field_label: { en: "20. Exclusion Criteria", hi: "20. अपात्रता शर्तें" },
        required: true,
        hint_text: {
          en: "[Tick 'No' for all exclusions]",
          hi: "[सभी अपात्रता शर्तों पर 'नहीं' चुनें]",
        },
        guidance_text: {
          en: "Tick 'No' to confirm that no family member is a constitutional post holder, government employee, pensioner above ₹10,000/month, or tax payer.",
          hi: "घोषणा करें कि आप संवैधानिक पद, सरकारी नौकरी, ₹10,000 से अधिक पेंशन या आयकर दाता की अपात्रता श्रेणी में नहीं आते हैं।",
        },
        example: { en: "All answers must be 'No'", hi: "सभी उत्तर 'नहीं' (No) होने चाहिए" },
        is_sensitive_id: false,
      },
      {
        id: "pmk-g17",
        scheme_id: "45170ee9-d661-4746-a2bf-9d781719de7d",
        display_number: 20,
        page_number: 2,
        top_pct: 67.3,
        left_pct: 55.0,
        field_label: { en: "DECLARATION (Signature)", hi: "स्व-घोषणा (हस्ताक्षर)" },
        required: true,
        hint_text: {
          en: "[Farmer's Signature / Thumb]",
          hi: "[किसान के हस्ताक्षर / अंगूठे का निशान]",
        },
        guidance_text: {
          en: "Farmer puts signature or thumb impression affirming ownership of less than 2 hectares land.",
          hi: "किसान द्वारा 2 हेक्टेयर से कम भूमि होने की पुष्टि करते हुए हस्ताक्षर।",
        },
        is_sensitive_id: false,
      },
    ],
  },

  // =========================================================================
  // SCHEME 3: Ayushman Bharat (PM-JAY)
  // PDF: Scheme_Forms/AyushmanBharat_form_HealthCard.pdf
  // =========================================================================
  "227a5a63-56fd-4d39-a281-3d3f5dbec2bd": {
    scheme_id: "227a5a63-56fd-4d39-a281-3d3f5dbec2bd",
    scheme_name: "Ayushman Bharat (PM-JAY)",
    pdf_storage_path: "AyushmanBharat_form_HealthCard.pdf",
    public_pdf_url:
      "https://tgsdyuzkwlxsmudydddt.supabase.co/storage/v1/object/public/Scheme_Forms/AyushmanBharat_form_HealthCard.pdf",
    total_pages: 1,
    is_available: true,
    markers: [
      {
        id: "pmj-g1",
        scheme_id: "227a5a63-56fd-4d39-a281-3d3f5dbec2bd",
        display_number: 1,
        page_number: 1,
        top_pct: 13.0,
        left_pct: 36.0,
        field_label: { en: "Name of Head of the Family", hi: "परिवार के मुखिया का नाम" },
        required: true,
        hint_text: {
          en: "[Enter full name of family head as in Ration/Aadhaar]",
          hi: "[राशन कार्ड / आधार अनुसार परिवार के मुखिया का नाम]",
        },
        guidance_text: {
          en: "Write the full name of the head of the family as recorded in the NFSA ration card or SECC list.",
          hi: "राशन कार्ड या एसईसीसी सूची में दर्ज परिवार के मुखिया का पूरा नाम लिखें।",
        },
        example: { en: "e.g. Ramesh Kumar", hi: "उदा. रमेश कुमार" },
        is_sensitive_id: false,
      },
      {
        id: "pmj-g2",
        scheme_id: "227a5a63-56fd-4d39-a281-3d3f5dbec2bd",
        display_number: 2,
        page_number: 1,
        top_pct: 15.0,
        left_pct: 24.0,
        field_label: { en: "Address", hi: "पता" },
        required: true,
        hint_text: {
          en: "[Enter complete residential address]",
          hi: "[यहाँ निवास का पूरा पता लिखें]",
        },
        guidance_text: {
          en: "Enter complete current residential address in Dadra and Nagar Haveli / Daman and Diu.",
          hi: "वर्तमान निवास का पूरा पता दर्ज करें।",
        },
        example: { en: "e.g. House 45, Near Main Market", hi: "उदा. मकान नं 45, मुख्य बाजार" },
        is_sensitive_id: false,
      },
      {
        id: "pmj-g3-pada",
        scheme_id: "227a5a63-56fd-4d39-a281-3d3f5dbec2bd",
        display_number: 3,
        page_number: 1,
        top_pct: 17.0,
        left_pct: 24.0,
        field_label: { en: "Pada Name", hi: "पाड़ा का नाम" },
        required: true,
        hint_text: {
          en: "[Enter Pada / Mohalla]",
          hi: "[पाड़ा या मोहल्ले का नाम]",
        },
        guidance_text: {
          en: "Enter the local Pada / hamlet name within the revenue village.",
          hi: "अपने स्थानीय पाड़ा / फलिया का नाम लिखें।",
        },
        example: { en: "e.g. Patel Pada", hi: "उदा. पटेल पाड़ा" },
        is_sensitive_id: false,
      },
      {
        id: "pmj-g3-vil",
        scheme_id: "227a5a63-56fd-4d39-a281-3d3f5dbec2bd",
        display_number: 4,
        page_number: 1,
        top_pct: 17.0,
        left_pct: 58.0,
        field_label: { en: "Village Name", hi: "गाँव का नाम" },
        required: true,
        hint_text: {
          en: "[Enter Village / Town]",
          hi: "[गाँव या शहर का नाम लिखें]",
        },
        guidance_text: {
          en: "Enter the revenue village or municipal town name.",
          hi: "राजस्व गाँव अथवा कस्बे का नाम लिखें।",
        },
        example: { en: "e.g. Silvassa", hi: "उदा. सिलवासा" },
        is_sensitive_id: false,
      },
      {
        id: "pmj-g4",
        scheme_id: "227a5a63-56fd-4d39-a281-3d3f5dbec2bd",
        display_number: 5,
        page_number: 1,
        top_pct: 18.3,
        left_pct: 55.0,
        field_label: { en: "Family HH ID No (SECC)", hi: "परिवार HH ID संख्या (SECC)" },
        required: false,
        hint_text: {
          en: "[Enter 24-digit HH ID if in SECC, else leave blank]",
          hi: "[एसईसीसी सूची अनुसार परिवार HH ID (यदि हो)]",
        },
        guidance_text: {
          en: "If your family is in SECC 2011 list, enter your 24-digit HH ID, otherwise tick 'No' and leave blank.",
          hi: "यदि एसईसीसी 2011 सूची में नाम है तो 24 अंकों का HH ID नंबर भरें।",
        },
        example: { en: "e.g. 241500300100000000001234", hi: "उदा. 241500300100000000001234" },
        is_sensitive_id: false,
      },
      {
        id: "pmj-g5-ssby",
        scheme_id: "227a5a63-56fd-4d39-a281-3d3f5dbec2bd",
        display_number: 6,
        page_number: 1,
        top_pct: 20.3,
        left_pct: 25.0,
        field_label: { en: "SSBY Card No", hi: "एसएसबीवाई कार्ड संख्या" },
        required: false,
        hint_text: {
          en: "[Enter SSBY Card No. if available]",
          hi: "[राज्य स्वास्थ्य कार्ड सं. (यदि उपलब्ध हो)]",
        },
        guidance_text: {
          en: "If family already holds a State Swasthya Bima Yojana (SSBY) card, write the printed number.",
          hi: "यदि परिवार के पास पूर्व से राज्य स्वास्थ्य सुरक्षा कार्ड है तो उसका नंबर लिखें।",
        },
        is_sensitive_id: false,
      },
      {
        id: "pmj-g5",
        scheme_id: "227a5a63-56fd-4d39-a281-3d3f5dbec2bd",
        display_number: 7,
        page_number: 1,
        top_pct: 23.5,
        left_pct: 28.0,
        field_label: { en: "Ration Card No", hi: "राशन कार्ड संख्या" },
        required: true,
        hint_text: {
          en: "[Enter NFSA Ration Card number directly]",
          hi: "[यहाँ राशन कार्ड नंबर भरें]",
        },
        guidance_text: {
          en: "Enter your NFSA Ration Card booklet number directly on this official form. SchemeSetu does not collect ration card numbers.",
          hi: "अपना राशन कार्ड नंबर सीधे इस सरकारी फॉर्म में दर्ज करें। योजनासेतु राशन कार्ड नंबर एकत्र नहीं करता है।",
        },
        is_sensitive_id: true,
        sensitive_notice: {
          en: "Keep your NFSA Ration Card booklet or digital e-Ration slip ready.",
          hi: "राशन कार्ड पुस्तिका या ई-राशन पर्ची साथ रखें।",
        },
      },
      {
        id: "pmj-g6",
        scheme_id: "227a5a63-56fd-4d39-a281-3d3f5dbec2bd",
        display_number: 8,
        page_number: 1,
        top_pct: 26.8,
        left_pct: 58.0,
        field_label: {
          en: "Registration Category (Income below or above Rs. 1 lakh)",
          hi: "पंजीकरण श्रेणी (आय ₹1 लाख से कम या अधिक)",
        },
        required: true,
        hint_text: {
          en: "[Tick: Cat-1 (< ₹1 Lakh) or Cat-2 (> ₹1 Lakh)]",
          hi: "[श्रेणी चुनें: 1 (< ₹1 लाख) अथवा 2 (> ₹1 लाख)]",
        },
        guidance_text: {
          en: "If not in SECC list, tick Category 1 if annual income is below ₹1 Lakh, or Category 2 if above ₹1 Lakh.",
          hi: "आय श्रेणी चुनें: 1. वार्षिक आय ₹1 लाख से कम, अथवा 2. वार्षिक आय ₹1 लाख से अधिक।",
        },
        example: { en: "Category 1 (< ₹1 Lakh)", hi: "श्रेणी 1 (< ₹1 लाख)" },
        is_sensitive_id: false,
      },
      {
        id: "pmj-g7",
        scheme_id: "227a5a63-56fd-4d39-a281-3d3f5dbec2bd",
        display_number: 9,
        page_number: 1,
        top_pct: 38.0,
        left_pct: 16.0,
        field_label: { en: "Family Members Details", hi: "परिवार के सदस्यों का विवरण" },
        required: true,
        hint_text: {
          en: "[Name, Age, Gender & Relation to Head]",
          hi: "[सदस्य का नाम, उम्र, लिंग व मुखिया से संबंध]",
        },
        guidance_text: {
          en: "Fill table row for each family member: Full Name, Age, Gender, and Relationship to Head of Family.",
          hi: "कार्ड के लिए परिवार के सभी सदस्यों के नाम, उम्र, लिंग और संबंध भरें।",
        },
        is_sensitive_id: false,
      },
      {
        id: "pmj-g8",
        scheme_id: "227a5a63-56fd-4d39-a281-3d3f5dbec2bd",
        display_number: 10,
        page_number: 1,
        top_pct: 38.0,
        left_pct: 49.0,
        field_label: { en: "Aadhaar Card No. of Members", hi: "सदस्यों की आधार संख्या" },
        required: true,
        hint_text: {
          en: "[Enter 12-digit Aadhaar directly on form]",
          hi: "[प्रत्येक सदस्य का 12 अंकों का आधार नंबर भरें]",
        },
        guidance_text: {
          en: "Enter Aadhaar numbers directly on this official form. SchemeSetu never stores Aadhaar numbers.",
          hi: "प्रत्येक सदस्य का 12 अंकों का आधार नंबर सीधे इस सरकारी प्रपत्र में भरें। योजनासेतु आधार नंबर संग्रहीत नहीं करता।",
        },
        is_sensitive_id: true,
        sensitive_notice: {
          en: "Ensure Aadhaar cards of each member are verified with mobile OTP or biometric scanner.",
          hi: "प्रत्येक सदस्य का आधार ई-केवाईसी द्वारा सत्यापित होना अनिवार्य है।",
        },
      },
      {
        id: "pmj-g8-mob",
        scheme_id: "227a5a63-56fd-4d39-a281-3d3f5dbec2bd",
        display_number: 11,
        page_number: 1,
        top_pct: 38.0,
        left_pct: 63.0,
        field_label: { en: "Mobile No. of Members", hi: "सदस्यों का मोबाइल नंबर" },
        required: true,
        hint_text: {
          en: "[Active mobile number for OTP]",
          hi: "[ओटीपी सत्यापन हेतु मोबाइल नंबर]",
        },
        guidance_text: {
          en: "Enter 10-digit mobile number for each member.",
          hi: "प्रत्येक सदस्य का चालू मोबाइल नंबर दर्ज करें।",
        },
        example: { en: "e.g. 9876543210", hi: "उदा. 9876543210" },
        is_sensitive_id: false,
      },
      {
        id: "pmj-g9",
        scheme_id: "227a5a63-56fd-4d39-a281-3d3f5dbec2bd",
        display_number: 12,
        page_number: 1,
        top_pct: 74.0,
        left_pct: 20.0,
        field_label: {
          en: "Consent to MoHFW for Aadhaar Authentication",
          hi: "स्वास्थ्य मंत्रालय को आधार प्रमाणीकरण सहमति",
        },
        required: true,
        hint_text: {
          en: "[Head of Family Signature for Aadhaar consent]",
          hi: "[आधार सत्यापन सहमति हेतु परिवार मुखिया के हस्ताक्षर]",
        },
        guidance_text: {
          en: "Sign and date consent allowing Ministry of Health to authenticate identity under AB-PMJAY.",
          hi: "पहचान सत्यापन हेतु स्वास्थ्य मंत्रालय को सहमति देकर परिवार मुखिया के हस्ताक्षर।",
        },
        is_sensitive_id: false,
      },
    ],
  },

  // =========================================================================
  // SCHEME 4: Mukhyamantri Ladli Behna Yojna
  // PDF: Scheme_Forms/ladli-behna-yojana-form-2026-513.pdf
  // =========================================================================
  "fe7ab07d-d4e0-4fde-bc14-91489c080c1a": {
    scheme_id: "fe7ab07d-d4e0-4fde-bc14-91489c080c1a",
    scheme_name: "Mukhyamantri Ladli Behna Yojna",
    pdf_storage_path: "ladli-behna-yojana-form-2026-513.pdf",
    public_pdf_url:
      "https://tgsdyuzkwlxsmudydddt.supabase.co/storage/v1/object/public/Scheme_Forms/ladli-behna-yojana-form-2026-513.pdf",
    total_pages: 1,
    is_available: true,
    markers: [
      {
        id: "lb-g1",
        scheme_id: "fe7ab07d-d4e0-4fde-bc14-91489c080c1a",
        display_number: 1,
        page_number: 1,
        top_pct: 12.2,
        left_pct: 30.0,
        field_label: {
          en: "1. Samagra Member ID (9 digits) / आवेदिका की समग्र आई.डी.",
          hi: "1. आवेदिका की समग्र आई.डी. (9 अंक)",
        },
        required: true,
        hint_text: {
          en: "[Enter applicant woman's 9-digit Samagra ID]",
          hi: "[आवेदिका की 9 अंकों की समग्र सदस्य आईडी लिखें]",
        },
        guidance_text: {
          en: "Enter the applicant woman's 9-digit personal Samagra Member ID directly on the official form. SchemeSetu does not collect Samagra IDs.",
          hi: "आवेदिका की 9 अंकों की समग्र सदस्य आईडी सीधे आधिकारिक फॉर्म में दर्ज करें। योजनासेतु समग्र आईडी एकत्र नहीं करता।",
        },
        is_sensitive_id: true,
        sensitive_notice: {
          en: "Check your 9-digit Sadasya ID on your Samagra Parivar Card.",
          hi: "समग्र परिवार कार्ड पर अपनी 9 अंकों की सदस्य आईडी देखें।",
        },
      },
      {
        id: "lb-g2",
        scheme_id: "fe7ab07d-d4e0-4fde-bc14-91489c080c1a",
        display_number: 2,
        page_number: 1,
        top_pct: 14.1,
        left_pct: 22.0,
        field_label: {
          en: "2. Aadhaar Number (12 digits) / आधार नंबर",
          hi: "2. आधार नंबर (12 अंक)",
        },
        required: true,
        hint_text: {
          en: "[Enter 12-digit Aadhaar number directly here]",
          hi: "[यहाँ 12 अंकों का आधार नंबर दर्ज करें]",
        },
        guidance_text: {
          en: "Enter 12-digit Aadhaar number directly on the official form. SchemeSetu never collects or stores Aadhaar numbers.",
          hi: "अपना 12 अंकों का आधार नंबर सीधे सरकारी फॉर्म पर भरें। योजनासेतु आधार नंबर एकत्र नहीं करता।",
        },
        is_sensitive_id: true,
        sensitive_notice: {
          en: "Aadhaar must have e-KYC completed in the Samagra portal.",
          hi: "आधार का समग्र पोर्टल पर ई-केवाईसी पूर्ण होना आवश्यक है।",
        },
      },
      {
        id: "lb-g3",
        scheme_id: "fe7ab07d-d4e0-4fde-bc14-91489c080c1a",
        display_number: 3,
        page_number: 1,
        top_pct: 16.1,
        left_pct: 28.0,
        field_label: {
          en: "3. आवेदिका का नाम (Applicant Woman's Name)",
          hi: "3. आवेदिका का नाम",
        },
        required: true,
        hint_text: {
          en: "[Enter applicant woman's full name matching Aadhaar]",
          hi: "[आधार अनुसार महिला का पूरा नाम लिखें]",
        },
        guidance_text: {
          en: "Write applicant woman's full name exactly as inscribed in Samagra and Aadhaar records.",
          hi: "समग्र और आधार कार्ड में दर्ज नाम के अनुसार आवेदिका का पूरा नाम लिखें।",
        },
        example: { en: "e.g. सुनीता बाई / Sunita Bai", hi: "उदा. सुनीता बाई" },
        is_sensitive_id: false,
      },
      {
        id: "lb-g4",
        scheme_id: "fe7ab07d-d4e0-4fde-bc14-91489c080c1a",
        display_number: 4,
        page_number: 1,
        top_pct: 18.0,
        left_pct: 35.0,
        field_label: {
          en: "4. आवेदिका के पति / पिता का नाम",
          hi: "4. आवेदिका के पति / पिता का नाम",
        },
        required: true,
        hint_text: {
          en: "[Enter Husband's name (or Father's name)]",
          hi: "[पति का नाम (अथवा पिता का नाम) लिखें]",
        },
        guidance_text: {
          en: "Husband's name for married woman; father's name for unmarried/dependent applicant.",
          hi: "विवाहित महिला हेतु पति का नाम अथवा अन्य हेतु पिता का नाम भरें।",
        },
        example: { en: "e.g. राजेश कुमार", hi: "उदा. राजेश कुमार" },
        is_sensitive_id: false,
      },
      {
        id: "lb-g5",
        scheme_id: "fe7ab07d-d4e0-4fde-bc14-91489c080c1a",
        display_number: 5,
        page_number: 1,
        top_pct: 19.9,
        left_pct: 24.0,
        field_label: { en: "5. जन्मतिथि (Date of Birth)", hi: "5. जन्मतिथि" },
        required: true,
        hint_text: {
          en: "[Day: DD | Month: MM | Year: YYYY]",
          hi: "[दिन: DD | माह: MM | वर्ष: YYYY]",
        },
        guidance_text: {
          en: "Enter Date of Birth (Day, Month, Year) matching Aadhaar / Samagra record.",
          hi: "समग्र व आधार के अनुसार जन्मतिथि (दिन, माह, वर्ष) भरें।",
        },
        example: { en: "e.g. 15 / 07 / 1995", hi: "उदा. 15 / 07 / 1995" },
        is_sensitive_id: false,
      },
      {
        id: "lb-g6",
        scheme_id: "fe7ab07d-d4e0-4fde-bc14-91489c080c1a",
        display_number: 6,
        page_number: 1,
        top_pct: 21.9,
        left_pct: 28.0,
        field_label: { en: "6. आवेदिका का पता (Address)", hi: "6. आवेदिका का पता" },
        required: true,
        hint_text: {
          en: "[Enter house address & street]",
          hi: "[मकान नंबर व मोहल्ले का पता लिखें]",
        },
        guidance_text: {
          en: "Residential house address within Madhya Pradesh.",
          hi: "मध्य प्रदेश में निवास का मकान नंबर व गली का पता लिखें।",
        },
        example: { en: "e.g. वार्ड 4, ग्राम पिपरिया", hi: "उदा. वार्ड 4, ग्राम पिपरिया" },
        is_sensitive_id: false,
      },
      {
        id: "lb-g6-ward",
        scheme_id: "fe7ab07d-d4e0-4fde-bc14-91489c080c1a",
        display_number: 7,
        page_number: 1,
        top_pct: 23.8,
        left_pct: 28.0,
        field_label: { en: "ग्राम / शहर (वार्ड)", hi: "ग्राम / शहर (वार्ड)" },
        required: true,
        hint_text: {
          en: "[Village or City Ward Number]",
          hi: "[गाँव का नाम या शहर का वार्ड नंबर]",
        },
        guidance_text: {
          en: "Village name or municipal ward number.",
          hi: "गाँव का नाम अथवा नगर पालिका वार्ड संख्या लिखें।",
        },
        example: { en: "e.g. वार्ड 12, भोपाल", hi: "उदा. वार्ड 12, भोपाल" },
        is_sensitive_id: false,
      },
      {
        id: "lb-g7",
        scheme_id: "fe7ab07d-d4e0-4fde-bc14-91489c080c1a",
        display_number: 8,
        page_number: 1,
        top_pct: 25.8,
        left_pct: 28.0,
        field_label: { en: "7. आवेदिका का मोबाइल नं.", hi: "7. आवेदिका का मोबाइल नं." },
        required: true,
        hint_text: {
          en: "[10-digit Samagra-linked mobile number]",
          hi: "[समग्र लिंक 10 अंकों का मोबाइल नंबर]",
        },
        guidance_text: {
          en: "Active 10-digit mobile number linked to woman's Samagra ID and bank account.",
          hi: "समग्र व बैंक खाते से जुड़ा 10 अंकों का चालू मोबाइल नंबर दर्ज करें।",
        },
        example: { en: "e.g. 9876543210", hi: "उदा. 9876543210" },
        is_sensitive_id: false,
      },
      {
        id: "lb-g8",
        scheme_id: "fe7ab07d-d4e0-4fde-bc14-91489c080c1a",
        display_number: 9,
        page_number: 1,
        top_pct: 27.7,
        left_pct: 28.0,
        field_label: { en: "8. वर्ग (Category)", hi: "8. वर्ग (सामान्य/SC/ST/OBC)" },
        required: true,
        hint_text: {
          en: "[Tick (✓): General / SC / ST / OBC]",
          hi: "[निशान लगाएं (✓): सामान्य / अ.जा. / अ.ज.जा. / ओ.बी.सी.]",
        },
        guidance_text: {
          en: "Tick (✓) one: General (सामान्य), SC (अ-जा), ST (अ-ज-जा), or OBC (अ-पि-व).",
          hi: "अपनी सामाजिक श्रेणी (सामान्य, अ-जा, अ-ज-जा, या अ-पि-व) पर टिक का निशान लगाएं।",
        },
        example: { en: "e.g. OBC (अ-पि-व)", hi: "उदा. अ-पि-व" },
        is_sensitive_id: false,
      },
      {
        id: "lb-g9",
        scheme_id: "fe7ab07d-d4e0-4fde-bc14-91489c080c1a",
        display_number: 10,
        page_number: 1,
        top_pct: 29.6,
        left_pct: 68.0,
        field_label: { en: "9. क्या शासन से पेंशन प्राप्त कर रहे हैं?", hi: "9. पेंशन स्थिति" },
        required: true,
        hint_text: {
          en: "[Tick: 'Yes' (if getting pension) or 'No']",
          hi: "[पेंशन मिल रही है तो 'हाँ' अन्यथा 'नहीं' चुनें]",
        },
        guidance_text: {
          en: "Tick 'Yes' (हाँ) if already receiving widow/disabled/old-age pension, or 'No' (नहीं).",
          hi: "यदि पहले से सामाजिक सुरक्षा या विधवा पेंशन मिल रही है तो 'हाँ' पर टिक करें, अन्यथा 'नहीं' चुनें।",
        },
        example: { en: "e.g. नहीं (No)", hi: "उदा. नहीं" },
        is_sensitive_id: false,
      },
      {
        id: "lb-g10",
        scheme_id: "fe7ab07d-d4e0-4fde-bc14-91489c080c1a",
        display_number: 11,
        page_number: 1,
        top_pct: 31.6,
        left_pct: 35.0,
        field_label: { en: "10. विवाह की स्थिति (Marital Status)", hi: "10. विवाह की स्थिति" },
        required: true,
        hint_text: {
          en: "[Tick: Married / Divorced / Widow / Abandoned]",
          hi: "[विवाहित / तलाकशुदा / विधवा / परित्यक्ता पर टिक करें]",
        },
        guidance_text: {
          en: "Tick (✓): Married (विवाहित), Divorced (तलाकशुदा), Widow (विधवा), or Abandoned (परित्यक्ता).",
          hi: "वैवाहिक स्थिति पर सही (✓) का निशान लगाएं।",
        },
        example: { en: "e.g. विवाहित (Married)", hi: "उदा. विवाहित" },
        is_sensitive_id: false,
      },
      {
        id: "lb-g11",
        scheme_id: "fe7ab07d-d4e0-4fde-bc14-91489c080c1a",
        display_number: 12,
        page_number: 1,
        top_pct: 36.1,
        left_pct: 35.0,
        field_label: { en: "आवेदिका द्वारा घोषणा (Self-Declaration)", hi: "आवेदिका द्वारा घोषणा" },
        required: true,
        hint_text: {
          en: "[Tick (✓) to confirm income < ₹2.5 Lakh & no govt job]",
          hi: "[घोषणा पर टिक (✓) करें: आय ₹2.5 लाख से कम व गैर-करदाता]",
        },
        guidance_text: {
          en: "Tick all declaration boxes confirming annual family income is below ₹2.5 Lakh, not paying income tax, and not in govt service.",
          hi: "घोषणा करें कि पारिवारिक वार्षिक आय ₹2.5 लाख से कम है, आयकर दाता नहीं हैं, और सरकारी नौकरी में नहीं हैं।",
        },
        is_sensitive_id: false,
      },
      {
        id: "lb-g12",
        scheme_id: "fe7ab07d-d4e0-4fde-bc14-91489c080c1a",
        display_number: 13,
        page_number: 1,
        top_pct: 48.0,
        left_pct: 65.0,
        field_label: { en: "आवेदिका के हस्ताक्षर (Signature)", hi: "आवेदिका के हस्ताक्षर" },
        required: true,
        hint_text: {
          en: "[Applicant Woman's Signature / Thumb]",
          hi: "[आवेदिका के हस्ताक्षर या अंगूठे का निशान]",
        },
        guidance_text: {
          en: "Applicant woman signs or places thumb impression.",
          hi: "आवेदिका महिला के हस्ताक्षर अथवा अंगूठे का निशान।",
        },
        is_sensitive_id: false,
      },
    ],
  },

  // =========================================================================
  // SCHEME 5: UP Shramik Pension Yojna (Old-Age / Construction Pension)
  // Status: NO PDF uploaded in bucket yet -> Clear message required
  // =========================================================================
  "e3cb111a-cbe3-41f4-9eae-c056e79ecfe7": {
    scheme_id: "e3cb111a-cbe3-41f4-9eae-c056e79ecfe7",
    scheme_name: "UP Shramik Pension Yojna",
    pdf_storage_path: null,
    public_pdf_url: null,
    total_pages: 0,
    is_available: false, // Pending
    markers: [],
  },
};

/**
 * Retrieve guidance definition for a given scheme ID
 */
export function getSchemePdfGuidance(schemeId: string): SchemePdfGuideInfo {
  if (SCHEME_PDF_GUIDANCE_MAP[schemeId]) {
    return SCHEME_PDF_GUIDANCE_MAP[schemeId]!;
  }

  // Check normalized
  const normalized = schemeId.toLowerCase().replace(/[^a-z0-9]/g, "");
  for (const [key, info] of Object.entries(SCHEME_PDF_GUIDANCE_MAP)) {
    if (key.toLowerCase().replace(/[^a-z0-9]/g, "") === normalized) {
      return info;
    }
  }

  return {
    scheme_id: schemeId,
    scheme_name: "Selected Scheme",
    pdf_storage_path: null,
    public_pdf_url: null,
    total_pages: 0,
    is_available: false,
    markers: [],
  };
}
