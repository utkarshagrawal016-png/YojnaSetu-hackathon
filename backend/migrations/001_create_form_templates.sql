-- ============================================================================
-- Migration: 001_create_form_templates.sql
-- YojnaSetu (योजनासेतु) Official Form Templates & Guidance Engine
-- ============================================================================

-- 1. Create table for Official Scheme Application Form Templates
CREATE TABLE IF NOT EXISTS public.form_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scheme_id UUID NOT NULL REFERENCES public.schemes(id) ON DELETE CASCADE,
    official_form_title TEXT NOT NULL,
    published_authority TEXT NOT NULL,
    source_url TEXT NOT NULL,
    blank_pdf_url TEXT,
    verification_status TEXT NOT NULL CHECK (verification_status IN ('verified', 'pending')),
    general_steps JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index on scheme_id for instant retrieval
CREATE INDEX IF NOT EXISTS idx_form_templates_scheme_id ON public.form_templates(scheme_id);

-- 2. Create table for Individual Official Form Fields
CREATE TABLE IF NOT EXISTS public.form_template_fields (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES public.form_templates(id) ON DELETE CASCADE,
    field_label JSONB NOT NULL,            -- {"en": "...", "hi": "..."}
    section_name JSONB NOT NULL,           -- {"en": "...", "hi": "..."}
    field_type TEXT NOT NULL CHECK (field_type IN ('text', 'number', 'date', 'select', 'upload', 'declaration')),
    required_status BOOLEAN NOT NULL DEFAULT true,
    display_order INTEGER NOT NULL,
    field_instruction JSONB NOT NULL,       -- {"en": "...", "hi": "..."}
    source_note TEXT,                      -- e.g. "Section A, Page 1 of Annexure-I"
    is_sensitive_id BOOLEAN NOT NULL DEFAULT false,
    sensitive_help JSONB,                  -- {"en": "...", "hi": "..."}
    options JSONB,                         -- [{"value": "...", "label_en": "...", "label_hi": "..."}]
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index on template_id and display_order
CREATE INDEX IF NOT EXISTS idx_form_template_fields_template_order ON public.form_template_fields(template_id, display_order);

-- 3. Seed Verified Templates and Fields for the 5 Supabase Schemes
-- (Note: If schemes table already has the 5 IDs, this seeds the official form guides)

DO $$
DECLARE
    v_pmkisan_id UUID := '45170ee9-d661-4746-a2bf-9d781719de7d';
    v_ayushman_id UUID := '227a5a63-56fd-4d39-a281-3d3f5dbec2bd';
    v_shramik_id UUID := 'e3cb111a-cbe3-41f4-9eae-c056e79ecfe7';
    v_ladli_id UUID := 'fe7ab07d-d4e0-4fde-bc14-91489c080c1a';
    v_scholarship_id UUID := '36fa81fa-f5cc-4f72-8c0e-9adfb4f84559';
    v_temp_id UUID;
BEGIN
    -- Only seed if scheme exists in schemes table
    -- 1. PM-KISAN
    IF EXISTS (SELECT 1 FROM public.schemes WHERE id = v_pmkisan_id) THEN
        INSERT INTO public.form_templates (id, scheme_id, official_form_title, published_authority, source_url, blank_pdf_url, verification_status, general_steps)
        VALUES (
            'a1111111-1111-1111-1111-111111111111',
            v_pmkisan_id,
            'PM-Kisan Farmer Registration Application Form (Annexure-I)',
            'Ministry of Agriculture & Farmers Welfare, Government of India',
            'https://pmkisan.gov.in/RegistrationFormupdated.aspx',
            'https://pmkisan.gov.in/Documents/PM-Kisan_Guidelines_English.pdf',
            'verified',
            '[
                {"en": "Keep Aadhaar card, bank passbook, and land ownership records (Khatauni) ready.", "hi": "आधार कार्ड, बैंक पासबुक और खतौनी (जमीन के कागजात) तैयार रखें।"},
                {"en": "Choose Rural or Urban farmer registration based on village demarcation.", "hi": "ग्राम पंचायत सीमा के अनुसार ग्रामीण या शहरी किसान विकल्प चुनें।"},
                {"en": "Authenticate Aadhaar via mobile OTP on the official portal.", "hi": "आधिकारिक पोर्टल पर मोबाइल ओटीपी द्वारा आधार प्रमाणित करें।"},
                {"en": "Fill land survey numbers and bank account details accurately.", "hi": "खसरा/खाता नंबर और बैंक खाता विवरण सावधानीपूर्वक भरें।"}
            ]'::jsonb
        ) ON CONFLICT (id) DO NOTHING;
    END IF;

    -- 2. AYUSHMAN BHARAT (PM-JAY)
    IF EXISTS (SELECT 1 FROM public.schemes WHERE id = v_ayushman_id) THEN
        INSERT INTO public.form_templates (id, scheme_id, official_form_title, published_authority, source_url, blank_pdf_url, verification_status, general_steps)
        VALUES (
            'a2222222-2222-2222-2222-222222222222',
            v_ayushman_id,
            'NHA PM-JAY Beneficiary Identification System (BIS) e-KYC Verification Form',
            'National Health Authority (NHA), Ministry of Health & Family Welfare',
            'https://beneficiary.nha.gov.in',
            'https://pmjay.gov.in/sites/default/files/2019-03/BIS-Guidelines.pdf',
            'verified',
            '[
                {"en": "Visit beneficiary.nha.gov.in and select Beneficiary login.", "hi": "beneficiary.nha.gov.in पर जाएं और Beneficiary लॉगिन चुनें।"},
                {"en": "Search family eligibility using Ration Card, Aadhaar, or Family ID.", "hi": "राशन कार्ड, आधार या परिवार आईडी द्वारा पात्रता खोजें।"},
                {"en": "Complete Aadhaar biometric/OTP e-KYC to generate Ayushman Golden Card.", "hi": "आयुष्मान गोल्डन कार्ड बनाने के लिए आधार ई-केवाईसी पूर्ण करें।"}
            ]'::jsonb
        ) ON CONFLICT (id) DO NOTHING;
    END IF;

    -- 3. UP SHRAMIK PENSION YOJNA
    IF EXISTS (SELECT 1 FROM public.schemes WHERE id = v_shramik_id) THEN
        INSERT INTO public.form_templates (id, scheme_id, official_form_title, published_authority, source_url, blank_pdf_url, verification_status, general_steps)
        VALUES (
            'a3333333-3333-3333-3333-333333333333',
            v_shramik_id,
            'उत्तर प्रदेश भवन एवं अन्य सन्निर्माण कर्मकार कल्याण बोर्ड - पेंशन सहायता योजना आवेदन प्रपत्र',
            'UP Building & Other Construction Workers Welfare Board (UPBOCW)',
            'https://upbocw.in',
            'https://upbocw.in/static/PENSION_SCHEME_GUIDELINES.pdf',
            'verified',
            '[
                {"en": "Ensure UPBOCW registration is active and registered for at least 1 year.", "hi": "सुनिश्चित करें कि श्रमिक पंजीयन कम से कम 1 वर्ष पुराना और सक्रिय हो।"},
                {"en": "Obtain 90 days construction labor certificate from employer or Gram Pradhan.", "hi": "नियोजक या ग्राम प्रधान द्वारा 90 दिन के कार्य का प्रमाण पत्र प्राप्त करें।"},
                {"en": "Apply through UPBOCW portal or nearest CSC with bank passbook copy.", "hi": "यूपी बीओसीडब्ल्यू पोर्टल या जनसेवा केंद्र पर बैंक पासबुक के साथ आवेदन जमा करें।"}
            ]'::jsonb
        ) ON CONFLICT (id) DO NOTHING;
    END IF;

    -- 4. LADLI BEHNA YOJNA
    IF EXISTS (SELECT 1 FROM public.schemes WHERE id = v_ladli_id) THEN
        INSERT INTO public.form_templates (id, scheme_id, official_form_title, published_authority, source_url, blank_pdf_url, verification_status, general_steps)
        VALUES (
            'a4444444-4444-4444-4444-444444444444',
            v_ladli_id,
            'मुख्यमंत्री लाड़ली बहना योजना - 2023 आधिकारिक आवेदन प्रपत्र',
            'महिला एवं बाल विकास विभाग, मध्य प्रदेश शासन (WCD MP)',
            'https://cmladlibahna.mp.gov.in',
            'https://cmladlibahna.mp.gov.in/Files/ApplicationForm.pdf',
            'verified',
            '[
                {"en": "Keep Samagra Family ID and Member ID ready with Aadhaar e-KYC completed.", "hi": "समग्र परिवार व सदस्य आईडी में आधार ई-केवाईसी पूर्ण रखें।"},
                {"en": "Ensure bank account is individual, Aadhaar linked, and DBT enabled.", "hi": "बैंक खाता स्वयं का, आधार लिंक और डीबीटी सक्रिय होना चाहिए।"},
                {"en": "Submit application at Gram Panchayat / Ward camp with live photo capture.", "hi": "ग्राम पंचायत / वार्ड शिविर में लाइव फोटो के साथ आवेदन जमा करें।"}
            ]'::jsonb
        ) ON CONFLICT (id) DO NOTHING;
    END IF;

    -- 5. POST-MATRIC SCHOLARSHIP SCHEME
    IF EXISTS (SELECT 1 FROM public.schemes WHERE id = v_scholarship_id) THEN
        INSERT INTO public.form_templates (id, scheme_id, official_form_title, published_authority, source_url, blank_pdf_url, verification_status, general_steps)
        VALUES (
            'a5555555-5555-5555-5555-555555555555',
            v_scholarship_id,
            'National Scholarship Portal (NSP) Common Application Form for Post-Matric Scholarships',
            'Ministry of Electronics and Information Technology & Ministry of Social Justice and Empowerment, GoI',
            'https://scholarships.gov.in',
            'https://scholarships.gov.in/public/FAQ/NSP_Application_User_Manual.pdf',
            'verified',
            '[
                {"en": "Register on NSP portal to obtain your One-Time Registration (OTR) ID.", "hi": "एनएसपी पोर्टल पर वन-टाइम रजिस्ट्रेशन (OTR) आईडी प्राप्त करें।"},
                {"en": "Select Post-Matric scholarship scheme matching your domicile state and category.", "hi": "अपने राज्य व श्रेणी के अनुसार पोस्ट-मैट्रिक छात्रवृत्ति योजना चुनें।"},
                {"en": "Upload digital caste certificate, income certificate, and previous year marksheet.", "hi": "जाति प्रमाण पत्र, आय प्रमाण पत्र और पिछली परीक्षा की अंकसूची अपलोड करें।"},
                {"en": "Submit form online and hand over hard copy to college nodal officer for verification.", "hi": "ऑनलाइन फॉर्म जमा करने के बाद कॉलेज नोडल अधिकारी से सत्यापन कराएं।"}
            ]'::jsonb
        ) ON CONFLICT (id) DO NOTHING;
    END IF;
END $$;
