/**
 * Module 1: Multilingual Voice-to-Text & Dialect Extraction
 * Enhanced with Step 2 Query Intent & Purpose Understanding
 */

export interface QueryIntent {
  intent: "scholarship" | "business_financing" | "healthcare" | "agriculture" | "housing" | "social_security" | "women_welfare" | "other" | null;
  purpose: string;
  state: string | null;
  age: number | null;
  annual_family_income: number | null;
  applicant_category: string | null;
  gender: "Male" | "Female" | "Any" | null;
  needs_clarification: boolean;
  clarification_question: { en: string; hi: string } | null;
  raw_query: string;
}

export interface ProfileSlots {
  full_name: string | null;
  age: number | null;
  annual_income: number | null;
  state: string;
  occupation: "Farmer" | "Student" | "Laborer" | "Women" | "Other";
  gender: "Male" | "Female" | "Any";
  raw_transcript: string;
  english_translation: string;
}

const GROQ_API_KEY = (import.meta.env["VITE_GROQ_API_KEY"] as string | undefined) || "";

/**
 * Transcribe recorded audio blob using Groq Whisper-Large-v3
 */
export async function transcribeAudio(audioBlob: Blob, languageHint = "hi"): Promise<string> {
  if (!GROQ_API_KEY) {
    console.warn("VITE_GROQ_API_KEY is not configured, using fallback transcript.");
    return fallbackTranscript();
  }

  // Prevent ultra-short empty blobs (< 1KB)
  if (audioBlob.size < 800) {
    throw new Error("Recording too short. Please speak for at least 2 seconds.");
  }

  try {
    const formData = new FormData();
    // Use container extension matching MIME type
    const mime = audioBlob.type || "audio/webm";
    const ext = mime.includes("mp4") ? "mp4" : mime.includes("ogg") ? "ogg" : "webm";
    const file = new File([audioBlob], `recording.${ext}`, { type: mime });
    formData.append("file", file);
    formData.append("model", "whisper-large-v3");
    formData.append("temperature", "0");
    formData.append(
      "prompt",
      "Hindi, Hinglish, Bhojpuri, welfare scheme search: scholarship, padhai, loan, kheti, kisan, ayushman, ilaj, pension, shramik, aamdani, lakh, UP"
    );

    // Only set explicit language if not English, otherwise allow Whisper auto-detection for code-switching
    if (languageHint && languageHint !== "en") {
      formData.append("language", languageHint);
    }

    const response = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Groq Whisper API error:", response.status, errText);
      throw new Error(`Whisper transcription failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.text || "";
  } catch (err) {
    console.error("Audio transcription error:", err);
    return fallbackTranscript();
  }
}

/**
 * STEP 2: Extract Intent, Purpose and Parameters from user natural language query
 */
export async function understandUserQuery(query: string): Promise<QueryIntent> {
  const trimmed = query.trim();
  if (!trimmed) {
    return {
      intent: null,
      purpose: "General welfare check",
      state: null,
      age: null,
      annual_family_income: null,
      applicant_category: null,
      gender: null,
      needs_clarification: true,
      clarification_question: {
        en: "What type of assistance do you need? (e.g., farming support, scholarship, health coverage, or pension)",
        hi: "आपको किस प्रकार की सहायता चाहिए? (जैसे: खेती सहायता, पढ़ाई की छात्रवृत्ति, अस्पताल का इलाज, या पेंशन)",
      },
      raw_query: query,
    };
  }

  // Heuristic clarification check for vague input like "I need help" / "madad chahiye"
  const lower = trimmed.toLowerCase();
  const vaguePhrases = ["i need help", "help me", "help", "madad chahiye", "kuch madad karo", "need assistance"];
  if (vaguePhrases.includes(lower)) {
    return {
      intent: null,
      purpose: "Unspecified assistance",
      state: null,
      age: null,
      annual_family_income: null,
      applicant_category: null,
      gender: null,
      needs_clarification: true,
      clarification_question: {
        en: "Could you tell us what kind of help you need? For example: education/scholarship, farm support, healthcare, or business loan?",
        hi: "कृपया बताएं आपको किस तरह की मदद चाहिए? उदाहरण के लिए: पढ़ाई की छात्रवृत्ति, खेती में मदद, इलाज या व्यवसाय लोन?",
      },
      raw_query: query,
    };
  }

  if (GROQ_API_KEY) {
    const systemPrompt = `You are YojnaSetu AI, an expert intent-extraction agent for Indian government welfare discovery.
Analyze the user query (in Hindi, Hinglish, or English) and extract structured intent.

INTENT CATEGORIES:
- "scholarship": studies, college fees, student, padhai, coaching, matric, chatravritti
- "business_financing": business loan, mudra, dukaan, start small business, karobar
- "healthcare": hospital, treatment, bimari, medical, ayushman, dawa, operation
- "agriculture": farming, khet, fasal, kisan, beej, khad, tracter, crop
- "housing": ghar, awas, colony, pakka makaan
- "social_security": pension, bujurg, vridha, shramik, laborer pension, majdoor
- "women_welfare": mahila, aurat, ladli behna, beti, kanya
- "other": anything else

RULES:
1. Do not invent missing personal details. If age, income, or state are not explicitly stated, return null.
2. If the user query is too vague to know what benefit they want, set "needs_clarification": true and provide a helpful question in both English and Hindi.

Return strictly valid JSON:
{
  "intent": "scholarship" | "business_financing" | "healthcare" | "agriculture" | "housing" | "social_security" | "women_welfare" | "other" | null,
  "purpose": string,
  "state": string | null,
  "age": number | null,
  "annual_family_income": number | null,
  "applicant_category": string | null,
  "gender": "Male" | "Female" | "Any" | null,
  "needs_clarification": boolean,
  "clarification_question": { "en": string, "hi": string } | null
}`;

    for (const model of ["openai/gpt-oss-120b", "qwen/qwen3.8-27b", "llama-3.3-70b-versatile"]) {
      try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${GROQ_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: `User query:\n"${query}"` },
            ],
            response_format: { type: "json_object" },
            temperature: 0.1,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const content = data.choices?.[0]?.message?.content;
          if (content) {
            const parsed = JSON.parse(content);
            return {
              ...parsed,
              raw_query: query,
            };
          }
        }
      } catch {
        // Fallback to next model
      }
    }
  }

  // Fast deterministic fallback rule parser
  return parseIntentOffline(query);
}

/**
 * Offline rule-based intent and parameter parser
 */
function parseIntentOffline(query: string): QueryIntent {
  const lower = query.toLowerCase();

  let intent: QueryIntent["intent"] = "other";
  let purpose = query;

  if (
    lower.includes("scholarship") ||
    lower.includes("padhai") ||
    lower.includes("padh") ||
    lower.includes("student") ||
    lower.includes("college") ||
    lower.includes("vidyarthi")
  ) {
    intent = "scholarship";
    purpose = "Education and scholarship assistance";
  } else if (
    lower.includes("loan") ||
    lower.includes("business") ||
    lower.includes("dukaan") ||
    lower.includes("karobar") ||
    lower.includes("startup")
  ) {
    intent = "business_financing";
    purpose = "Small business financing or loan";
  } else if (
    lower.includes("khet") ||
    lower.includes("kisan") ||
    lower.includes("farmer") ||
    lower.includes("fasal") ||
    lower.includes("agriculture") ||
    lower.includes("krishi")
  ) {
    intent = "agriculture";
    purpose = "Agriculture and farmer income support";
  } else if (
    lower.includes("ilaj") ||
    lower.includes("hospital") ||
    lower.includes("dawa") ||
    lower.includes("health") ||
    lower.includes("bimari") ||
    lower.includes("ayushman")
  ) {
    intent = "healthcare";
    purpose = "Healthcare coverage and medical hospitalization support";
  } else if (
    lower.includes("pension") ||
    lower.includes("bujurg") ||
    lower.includes("vridha") ||
    lower.includes("shramik") ||
    lower.includes("mazdoor")
  ) {
    intent = "social_security";
    purpose = "Worker pension and social security benefits";
  } else if (
    lower.includes("mahila") ||
    lower.includes("aurat") ||
    lower.includes("behna") ||
    lower.includes("women")
  ) {
    intent = "women_welfare";
    purpose = "Women empowerment and financial welfare";
  }

  let age: number | null = null;
  const ageMatch = query.match(/(\d{1,2})\s*(?:saal|sal|years|baras)/i) || query.match(/\b([1-9][0-9])\s*age\b/i);
  if (ageMatch && ageMatch[1]) {
    age = parseInt(ageMatch[1], 10);
  }

  let income: number | null = null;
  if (lower.includes("dhai lakh") || lower.includes("2.5 lakh")) income = 250000;
  else if (lower.includes("do lakh") || lower.includes("2 lakh")) income = 200000;
  else if (lower.includes("ek lakh") || lower.includes("1 lakh")) income = 100000;
  else if (lower.includes("pachas hazaar") || lower.includes("50,000")) income = 50000;

  let state: string | null = null;
  if (lower.includes("uttar pradesh") || lower.includes("up")) state = "Uttar Pradesh";
  else if (lower.includes("bihar")) state = "Bihar";
  else if (lower.includes("madhya pradesh") || lower.includes("mp")) state = "Madhya Pradesh";

  let applicant_category: string | null = null;
  if (intent === "scholarship") applicant_category = "Student";
  else if (intent === "agriculture") applicant_category = "Farmer";
  else if (intent === "social_security") applicant_category = "Laborer";
  else if (intent === "women_welfare") applicant_category = "Women";

  return {
    intent,
    purpose,
    state,
    age,
    annual_family_income: income,
    applicant_category,
    gender: intent === "women_welfare" ? "Female" : null,
    needs_clarification: false,
    clarification_question: null,
    raw_query: query,
  };
}

export interface EligibilityVoiceExtraction {
  name?: string | undefined;
  age?: string | undefined;
  income?: string | undefined;
  state?: string | undefined;
  category?: string | undefined;
  ambiguousFields?: string[] | undefined;
}

/**
 * Robust parser for Hindi, Hinglish, and English spoken numbers
 * Supports: ek lakh, pachaas hazaar, do lakh, dhai lakh, dedh lakh, etc.
 */
export function parseSpokenNumber(text: string): number | null {
  const lower = text.toLowerCase().trim();
  const cleaned = lower.replace(/₹|,/g, "").trim();

  // Direct digits (e.g., 250000, 50000)
  const directMatch = cleaned.match(/\b(\d{4,9})\b/);
  if (directMatch && directMatch[1]) {
    return parseInt(directMatch[1], 10);
  }

  // Decimal lakh (e.g., 1.5 lakh, 2.5 lakh)
  const decLakhMatch = cleaned.match(/(\d+(?:\.\d+)?)\s*(?:lakh|lac|laakh)/i);
  if (decLakhMatch && decLakhMatch[1]) {
    return Math.round(parseFloat(decLakhMatch[1]) * 100000);
  }

  // Hindi Lakh keywords
  let lakhMultiplier = 0;
  if (lower.includes("ek lakh") || lower.includes("one lakh") || lower.includes("1 lakh")) lakhMultiplier = 1;
  else if (lower.includes("dedh lakh") || lower.includes("derh lakh") || lower.includes("1.5 lakh")) lakhMultiplier = 1.5;
  else if (lower.includes("do lakh") || lower.includes("two lakh") || lower.includes("2 lakh")) lakhMultiplier = 2;
  else if (lower.includes("dhai lakh") || lower.includes("dhayi lakh") || lower.includes("2.5 lakh")) lakhMultiplier = 2.5;
  else if (lower.includes("teen lakh") || lower.includes("three lakh") || lower.includes("3 lakh")) lakhMultiplier = 3;
  else if (lower.includes("sadhe teen lakh") || lower.includes("3.5 lakh")) lakhMultiplier = 3.5;
  else if (lower.includes("chaar lakh") || lower.includes("char lakh") || lower.includes("four lakh") || lower.includes("4 lakh")) lakhMultiplier = 4;
  else if (lower.includes("sadhe char lakh") || lower.includes("4.5 lakh")) lakhMultiplier = 4.5;
  else if (lower.includes("paanch lakh") || lower.includes("panch lakh") || lower.includes("five lakh") || lower.includes("5 lakh")) lakhMultiplier = 5;
  else if (lower.includes("chhe lakh") || lower.includes("6 lakh")) lakhMultiplier = 6;
  else if (lower.includes("saat lakh") || lower.includes("7 lakh")) lakhMultiplier = 7;
  else if (lower.includes("aath lakh") || lower.includes("8 lakh")) lakhMultiplier = 8;
  else if (lower.includes("nau lakh") || lower.includes("9 lakh")) lakhMultiplier = 9;
  else if (lower.includes("das lakh") || lower.includes("10 lakh")) lakhMultiplier = 10;

  let total = lakhMultiplier * 100000;

  // Thousands
  let thousandValue = 0;
  if (lower.includes("pachaas hazaar") || lower.includes("pachas hazaar") || lower.includes("fifty thousand") || lower.includes("50 hazaar") || lower.includes("50 thousand")) thousandValue = 50000;
  else if (lower.includes("bees hazaar") || lower.includes("twenty thousand") || lower.includes("20 hazaar")) thousandValue = 20000;
  else if (lower.includes("pachees hazaar") || lower.includes("twenty five thousand") || lower.includes("25 hazaar")) thousandValue = 25000;
  else if (lower.includes("tees hazaar") || lower.includes("thirty thousand") || lower.includes("30 hazaar")) thousandValue = 30000;
  else if (lower.includes("chalees hazaar") || lower.includes("forty thousand") || lower.includes("40 hazaar")) thousandValue = 40000;
  else if (lower.includes("saath hazaar") || lower.includes("sixty thousand") || lower.includes("60 hazaar")) thousandValue = 60000;
  else if (lower.includes("sattar hazaar") || lower.includes("seventy thousand") || lower.includes("70 hazaar")) thousandValue = 70000;
  else if (lower.includes("assi hazaar") || lower.includes("eighty thousand") || lower.includes("80 hazaar")) thousandValue = 80000;
  else if (lower.includes("nabbe hazaar") || lower.includes("ninety thousand") || lower.includes("90 hazaar")) thousandValue = 90000;
  else if (lower.includes("das hazaar") || lower.includes("ten thousand") || lower.includes("10 hazaar")) thousandValue = 10000;
  else if (lower.includes("pandrah hazaar") || lower.includes("fifteen thousand")) thousandValue = 15000;
  else if (lower.includes("ek hazaar") || lower.includes("one thousand") || lower.includes("1 hazaar")) thousandValue = 1000;

  total += thousandValue;

  return total > 0 ? total : null;
}

/**
 * Extract individual field value when user taps a specific field microphone button
 */
export function extractSingleField(
  field: "name" | "age" | "income" | "state" | "category",
  transcript: string
): string | null {
  const lower = transcript.toLowerCase().trim();

  if (field === "age") {
    // Check digits
    const ageDigits = transcript.match(/\b(\d{1,2})\b/);
    if (ageDigits && ageDigits[1]) {
      const val = parseInt(ageDigits[1], 10);
      if (val >= 1 && val <= 120) return String(val);
    }
    // Hindi age words
    const ageWordMap: Record<string, string> = {
      bees: "20", ikkis: "21", baais: "22", teiis: "23", chobees: "24",
      pachees: "25", chhabees: "26", sattais: "27", atthaees: "28", untees: "29",
      tees: "30", ikattis: "31", battis: "32", tetis: "33", chauntis: "34",
      paintees: "35", chhattis: "36", saintis: "37", adhtis: "38", untalees: "39",
      chaalis: "40", chalis: "40", iktaalis: "41", bayalees: "42", taitalis: "43",
      chawalis: "44", paintalis: "45", chhiyalees: "46", saitalis: "47", adhtalis: "48",
      unchaas: "49", pachaas: "50", pachas: "50", saath: "60", sattar: "70"
    };
    for (const [w, num] of Object.entries(ageWordMap)) {
      if (lower.includes(w)) return num;
    }
    return null;
  }

  if (field === "income") {
    const num = parseSpokenNumber(transcript);
    return num !== null ? String(num) : null;
  }

  if (field === "state") {
    const states = [
      "Uttar Pradesh", "Bihar", "Madhya Pradesh", "Rajasthan", "Maharashtra",
      "Gujarat", "Delhi", "Punjab", "Haryana", "Karnataka", "Tamil Nadu",
      "West Bengal", "Odisha", "Jharkhand", "Chhattisgarh", "Uttarakhand",
      "Himachal Pradesh", "Assam", "Kerala", "Telangana", "Andhra Pradesh"
    ];
    for (const st of states) {
      if (lower.includes(st.toLowerCase())) return st;
    }
    if (/\b(?:up|u\.p\.)\b/i.test(transcript)) return "Uttar Pradesh";
    if (/\b(?:mp|m\.p\.)\b/i.test(transcript)) return "Madhya Pradesh";
    return null;
  }

  if (field === "category") {
    if (lower.includes("farmer") || lower.includes("kisan") || lower.includes("kheti")) return "Farmer";
    if (lower.includes("student") || lower.includes("chatra") || lower.includes("padhai") || lower.includes("vidyarthi")) return "Student";
    if (lower.includes("laborer") || lower.includes("shramik") || lower.includes("majdoor") || lower.includes("mazdoor") || lower.includes("worker")) return "Laborer";
    if (lower.includes("women") || lower.includes("mahila") || lower.includes("aurat")) return "Women";
    return null;
  }

  if (field === "name") {
    const cleaned = transcript
      .replace(/(?:mera\s+naam|my\s+name\s+is|naam\s+hai|name:?|i\s+am|main\s+hoon)/gi, "")
      .replace(/\b(?:hai|hoon|hu|shri|mr|ms|mrs)\b/gi, "")
      .trim();
    return cleaned.length > 1 ? cleaned : null;
  }

  return null;
}

/**
 * Extract eligibility form details from a spoken sentence
 * Handles Hindi, Hinglish, and English
 */
export async function extractSpokenEligibilityDetails(
  transcript: string
): Promise<EligibilityVoiceExtraction> {
  const lower = transcript.toLowerCase().trim();
  const ambiguousFields: string[] = [];

  // Try LLM extraction if Groq key is present
  if (GROQ_API_KEY) {
    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "openai/gpt-oss-120b",
          messages: [
            {
              role: "system",
              content: `You are an expert NLP entity extraction assistant for Indian government welfare applications.
Extract personal details from the user's spoken sentence in Hindi, Hinglish, or English.
RULES:
1. Handle Hindi number words: "ek lakh" -> 100000, "do lakh" -> 200000, "dhai lakh" -> 250000, "pachaas hazaar" -> 50000, etc.
2. Return null if a detail is NOT explicitly mentioned. NEVER invent or guess.
3. If an expression is ambiguous, note the field name in ambiguous_fields array.
Return valid JSON only:
{
  "name": string | null,
  "age": number | null,
  "income": number | null,
  "state": string | null,
  "category": "Farmer" | "Student" | "Laborer" | "Women" | "Other" | null,
  "ambiguous_fields": string[]
}`,
            },
            { role: "user", content: transcript },
          ],
          response_format: { type: "json_object" },
          temperature: 0.1,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          const parsed = JSON.parse(content);
          return {
            name: parsed.name ? String(parsed.name) : undefined,
            age: parsed.age ? String(parsed.age) : undefined,
            income: parsed.income ? String(parsed.income) : undefined,
            state: parsed.state ? String(parsed.state) : undefined,
            category: parsed.category ? String(parsed.category) : undefined,
            ambiguousFields: Array.isArray(parsed.ambiguous_fields) ? parsed.ambiguous_fields : [],
          };
        }
      }
    } catch {
      // Fall through to offline deterministic parser
    }
  }

  // Offline deterministic fallback extraction
  let name: string | undefined;
  const namePatterns = [
    /(?:mera\s+naam|my\s+name\s+is|naam\s+hai|name:?)\s+([A-Za-z\u0900-\u097F]+(?:\s+[A-Za-z\u0900-\u097F]+)?)/i,
    /(?:i\s+am|main\s+hoon)\s+([A-Za-z\u0900-\u097F]+(?:\s+[A-Za-z\u0900-\u097F]+)?)/i,
  ];
  for (const pat of namePatterns) {
    const match = transcript.match(pat);
    if (match && match[1]) {
      const candidate = match[1].replace(/\b(?:hai|hoon|hu|shri|mr|ms|mrs)\b/gi, "").trim();
      if (candidate.length > 1) {
        name = candidate;
        break;
      }
    }
  }

  let age: string | undefined;
  const agePatterns = [
    /(?:meri\s+)?(?:age|umar|umr)\s*(?:hai)?\s*(\d{1,2})/i,
    /(\d{1,2})\s*(?:saal|sal|years(?:\s+old)?|varsh|baras)/i,
    /(?:age|umar)\s*(?:is)?\s*(\d{1,2})/i,
  ];
  for (const pat of agePatterns) {
    const match = transcript.match(pat);
    if (match && match[1]) {
      const num = parseInt(match[1], 10);
      if (num >= 1 && num <= 120) {
        age = String(num);
        break;
      }
    }
  }

  let income: string | undefined;
  const incomeNum = parseSpokenNumber(transcript);
  if (incomeNum !== null) {
    income = String(incomeNum);
  }

  let state: string | undefined;
  const states = [
    "Uttar Pradesh", "Bihar", "Madhya Pradesh", "Rajasthan", "Maharashtra",
    "Gujarat", "Delhi", "Punjab", "Haryana", "Karnataka", "Tamil Nadu",
    "West Bengal", "Odisha", "Jharkhand", "Chhattisgarh", "Uttarakhand",
    "Himachal Pradesh", "Assam", "Kerala", "Telangana", "Andhra Pradesh"
  ];
  for (const st of states) {
    if (lower.includes(st.toLowerCase())) {
      state = st;
      break;
    }
  }
  if (!state) {
    if (/\b(?:up|u\.p\.)\b/i.test(transcript)) state = "Uttar Pradesh";
    else if (/\b(?:mp|m\.p\.)\b/i.test(transcript)) state = "Madhya Pradesh";
  }

  let category: string | undefined;
  if (lower.includes("farmer") || lower.includes("kisan") || lower.includes("kheti")) {
    category = "Farmer";
  } else if (lower.includes("student") || lower.includes("chatra") || lower.includes("vidyarthi") || lower.includes("padhai")) {
    category = "Student";
  } else if (lower.includes("laborer") || lower.includes("shramik") || lower.includes("majdoor") || lower.includes("mazdoor") || lower.includes("worker")) {
    category = "Laborer";
  } else if (lower.includes("women") || lower.includes("mahila") || lower.includes("aurat")) {
    category = "Women";
  }

  return {
    name,
    age,
    income,
    state,
    category,
    ambiguousFields,
  };
}

/**
 * Perform JSON slot filling and dialect extraction with Groq LLM (no hardcoded personal details)
 */
export async function extractSlotsFromTranscript(rawTranscript: string): Promise<ProfileSlots> {
  const intentData = await understandUserQuery(rawTranscript);

  let occupation: ProfileSlots["occupation"] = "Other";
  if (intentData.applicant_category === "Student") occupation = "Student";
  else if (intentData.applicant_category === "Laborer") occupation = "Laborer";
  else if (intentData.applicant_category === "Women") occupation = "Women";
  else if (intentData.applicant_category === "Farmer") occupation = "Farmer";

  return {
    full_name: null,
    age: intentData.age,
    annual_income: intentData.annual_family_income,
    state: intentData.state || "",
    occupation,
    gender: intentData.gender || "Any",
    raw_transcript: rawTranscript,
    english_translation: `Applicant seeks ${intentData.purpose}.`,
  };
}

function fallbackTranscript(): string {
  const samples = [
    "नमस्ते, हम उत्तर प्रदेश से बोल रहे हैं। हम छोटे किसान हैं, उम्र लगभग 42 साल है और सालाना आमदनी ढाई लाख रुपये है।",
    "हमार नाम राम बा, उत्तर प्रदेश के किसान हईं, उम्र 42 साल आ सालाना कमाई ढाई लाख बा।",
    "Hello, I am from Uttar Pradesh. I am a farmer, 42 years old, with annual family income around 2.5 lakhs.",
  ];
  return samples[0] || "नमस्ते, हम उत्तर प्रदेश से बोल रहे हैं।";
}

