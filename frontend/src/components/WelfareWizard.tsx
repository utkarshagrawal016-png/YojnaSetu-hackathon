import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCheck,
  FileText,
  HeartPulse,
  Leaf,
  Mic,
  MicOff,
  ShieldCheck,
  Sparkles,
  Users,
  Volume2,
  LoaderCircle,
  ExternalLink,
  GraduationCap,
  Sparkle,
  Search,
  AlertTriangle,
  HelpCircle,
  XCircle,
  Info,
  Briefcase,
  Home,
  Globe,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormAssembly } from "@/components/FormAssembly";
import { OfficialFormGuide } from "@/components/OfficialFormGuide";
import { OfficialPortalBridge } from "@/components/OfficialPortalBridge";
import { ApplicationAssistantWizard } from "@/components/ApplicationAssistantWizard";
import { emptyProfile, type Profile } from "@/lib/welfare-demo";
import type { Lang } from "@/components/SiteHeader";
import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import {
  transcribeAudio,
  understandUserQuery,
  extractSpokenEligibilityDetails,
  extractSingleField,
  type QueryIntent,
} from "@/services/voiceEngine";
import {
  searchSchemesWithIntent,
  evaluateDetailedEligibility,
  type DbScheme,
  type SchemeSearchResponse,
  type DetailedEligibilityResult,
  FALLBACK_SCHEMES,
} from "@/services/schemeService";
import {
  verifySchemeWithTinyFish,
  type LiveSchemeVerification,
  SCHEME_PORTAL_URLS,
} from "@/services/tinyfishService";

const INDIAN_STATES = [
  "All States",
  "Uttar Pradesh",
  "Bihar",
  "Madhya Pradesh",
  "Rajasthan",
  "Maharashtra",
  "Gujarat",
  "Delhi",
  "Punjab",
  "Haryana",
  "Karnataka",
  "Tamil Nadu",
  "West Bengal",
  "Odisha",
  "Jharkhand",
  "Chhattisgarh",
  "Uttarakhand",
  "Himachal Pradesh",
  "Assam",
  "Kerala",
  "Telangana",
  "Andhra Pradesh",
];

const CATEGORIES = [
  { id: "Farmer", en: "Farmer", hi: "किसान" },
  { id: "Student", en: "Student", hi: "विद्यार्थी" },
  { id: "Laborer", en: "Laborer / Worker", hi: "श्रमिक / मजदूर" },
  { id: "Women", en: "Women Welfare", hi: "महिला कल्याण" },
  { id: "General", en: "General / Other", hi: "सामान्य / अन्य" },
];

export function WelfareWizard({ lang, audio }: { lang: Lang; audio: boolean }) {
  // Navigation Flow State
  // "SEARCH": Matching schemes list
  // "SCHEME_FLOW": Selected scheme journey (1. Details, 2. Your Details, 3. Result, 4. Form Preparation)
  const [journeyStage, setJourneyStage] = useState<"SEARCH" | "SCHEME_FLOW">("SEARCH");
  const [schemeStep, setSchemeStep] = useState<1 | 2 | 3 | 4>(1);
  const [formPreparationTab, setFormPreparationTab] = useState<"official_guide" | "assisted_draft">("official_guide");

  // Profile is empty by default in all production flows (No hardcoded values)
  const [profile, setProfile] = useState<Profile>({ ...emptyProfile });
  const [textQuery, setTextQuery] = useState("");
  const [queryIntent, setQueryIntent] = useState<QueryIntent | null>(null);

  // Search results state
  const [searchResult, setSearchResult] = useState<SchemeSearchResponse>({
    schemes: FALLBACK_SCHEMES,
    matchedIntent: null,
    purpose: "General discovery",
    noResults: false,
    needsClarification: false,
  });

  const [selectedScheme, setSelectedScheme] = useState<DbScheme>(FALLBACK_SCHEMES[0]!);
  const [eligibilityResult, setEligibilityResult] = useState<DetailedEligibilityResult | null>(null);
  const [isBridgeModalOpen, setIsBridgeModalOpen] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [assistantScheme, setAssistantScheme] = useState<DbScheme | null>(null);
  const [notice, setNotice] = useState("");

  const handleOpenApplicationAssistant = (schemeItem: DbScheme) => {
    setAssistantScheme(schemeItem);
    setIsAssistantOpen(true);
  };

  // Voice recording & transcription state
  const { isRecording, startRecording, stopRecording } = useAudioRecorder();
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const [activeVoiceTarget, setActiveVoiceTarget] = useState<
    "search" | "multi_field" | "age" | "income" | "state" | "category" | "name" | null
  >(null);
  const [recognizedVoiceText, setRecognizedVoiceText] = useState("");
  const [voiceNotice, setVoiceNotice] = useState("");

  // TinyFish verifications
  const [verifications, setVerifications] = useState<Record<string, LiveSchemeVerification>>({});

  const headingRef = useRef<HTMLHeadingElement>(null);
  const en = lang === "en";
  const t = (english: string, hindi: string) => (en ? english : hindi);

  // Scroll to top on step or journey changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    headingRef.current?.focus({ preventScroll: true });
  }, [journeyStage, schemeStep]);

  const [isSearching, setIsSearching] = useState(false);

  // Recalculate scheme search whenever queryIntent changes
  useEffect(() => {
    async function runSearch() {
      setIsSearching(true);
      try {
        const result = await searchSchemesWithIntent(queryIntent, profile);
        setSearchResult(result);
      } finally {
        setIsSearching(false);
      }
    }
    runSearch();
  }, [queryIntent]);

  // TinyFish verifications on search results mount (only for database schemes)
  useEffect(() => {
    const dbSchemesToVerify = searchResult.schemes.filter((s) => !s.isDiscovered);
    if (dbSchemesToVerify.length > 0) {
      Promise.all(
        dbSchemesToVerify.map((s) =>
          verifySchemeWithTinyFish(s.id, s.name).then((res) => ({ id: s.id, res }))
        )
      ).then((results) => {
        const map: Record<string, LiveSchemeVerification> = {};
        results.forEach(({ id, res }) => {
          map[id] = res;
        });
        setVerifications((prev) => ({ ...prev, ...map }));
      });
    }
  }, [searchResult.schemes]);

  function speak(text: string) {
    if (!window.speechSynthesis) {
      setNotice(t("Audio isn't available in this browser.", "इस ब्राउज़र में आवाज़ उपलब्ध नहीं है।"));
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = en ? "en-IN" : "hi-IN";
    window.speechSynthesis.speak(utterance);
  }

  // --- Voice Handling ---
  async function handleStartRecording(
    target: "search" | "multi_field" | "age" | "income" | "state" | "category" | "name"
  ) {
    setVoiceNotice("");
    setNotice("");
    try {
      setActiveVoiceTarget(target);
      await startRecording();
      if (audio) {
        speak(
          target === "search"
            ? t("Listening. Speak what help you need.", "सुन रहे हैं। बताएं आपको किस तरह की सहायता चाहिए।")
            : t("Listening. Speak your details.", "सुन रहे हैं। अपने विवरण बोलें।")
        );
      }
    } catch (err) {
      console.warn("Microphone access denied:", err);
      setActiveVoiceTarget(null);
      setVoiceNotice(
        t(
          "Microphone access was denied. You can type your details manually in the form fields.",
          "माइक की अनुमति नहीं मिली। आप अपने विवरण सीधे लिख सकते हैं।"
        )
      );
    }
  }

  async function handleStopRecording() {
    if (!isRecording) return;
    try {
      setIsProcessingVoice(true);
      const blob = await stopRecording();
      const transcript = await transcribeAudio(blob, en ? "en" : "hi");
      setRecognizedVoiceText(transcript);

      if (activeVoiceTarget === "search") {
        setTextQuery(transcript);
        const intentData = await understandUserQuery(transcript);
        setQueryIntent(intentData);
        if (audio) {
          speak(t(`Understood: ${intentData.purpose}. Searching schemes.`, `आपकी मांग: ${intentData.purpose}`));
        }
      } else if (activeVoiceTarget === "multi_field") {
        // Multi-field spoken sentence extraction (Requirement 4)
        const extracted = await extractSpokenEligibilityDetails(transcript);
        setProfile((prev) => ({
          ...prev,
          name: extracted.name || prev.name,
          age: extracted.age || prev.age,
          income: extracted.income || prev.income,
          state: extracted.state || prev.state,
          category: extracted.category || prev.category,
        }));
        if (audio) {
          speak(t("Details captured. Please review and edit before checking.", "विवरण दर्ज हो गए। कृपया जांच लें।"));
        }
      } else if (activeVoiceTarget) {
        // Single field voice input
        const extractedValue = extractSingleField(activeVoiceTarget, transcript);
        if (extractedValue) {
          setProfile((prev) => ({
            ...prev,
            [activeVoiceTarget]: extractedValue,
          }));
        } else {
          setVoiceNotice(
            t(
              `Could not clearly identify ${activeVoiceTarget}. Please type manually.`,
              `विवरण समझ नहीं आया। कृपया लिखकर भरें।`
            )
          );
        }
      }
    } catch (err) {
      console.error("Voice processing error:", err);
      setVoiceNotice(
        t(
          "Speech recognition could not process the audio. Please speak again or type manually.",
          "आवाज़ पहचानी नहीं जा सकी। कृपया दोबारा बोलें या लिखकर भरें।"
        )
      );
    } finally {
      setIsProcessingVoice(false);
      setActiveVoiceTarget(null);
    }
  }

  // --- Search Handling ---
  async function handleSearchSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!textQuery.trim()) return;

    setIsProcessingVoice(true);
    setVoiceNotice("");
    try {
      const intentData = await understandUserQuery(textQuery);
      setQueryIntent(intentData);
    } catch (err) {
      console.error("Search query understanding error:", err);
    } finally {
      setIsProcessingVoice(false);
    }
  }

  async function handleQuickQuery(q: string) {
    setTextQuery(q);
    setIsProcessingVoice(true);
    const intentData = await understandUserQuery(q);
    setQueryIntent(intentData);
    setIsProcessingVoice(false);
  }

  // --- Scheme Selection Flow ---
  function handleSelectScheme(scheme: DbScheme) {
    setSelectedScheme(scheme);
    setSchemeStep(1); // Step 1: Scheme Details first! NEVER opens form directly (Requirement 1)
    setEligibilityResult(null);
    setJourneyStage("SCHEME_FLOW");
  }

  function handleRunEligibilityCheck() {
    // Evaluate submitted details against selected scheme's actual database rules (Requirement 3)
    const result = evaluateDetailedEligibility(selectedScheme, profile);
    setEligibilityResult(result);
    setSchemeStep(3); // Move to Step 3: Eligibility Result

    if (audio) {
      if (result.verdict === "LIKELY_ELIGIBLE") {
        speak(t("Assessment: You appear likely eligible for this scheme.", "परिणाम: आप इस योजना के लिए पात्र प्रतीत होते हैं।"));
      } else if (result.verdict === "NOT_ELIGIBLE") {
        speak(t(`Assessment: Not eligible. ${result.summary.en}`, `परिणाम: अपात्र। ${result.summary.hi}`));
      } else {
        speak(t("Assessment: More information required to verify eligibility.", "परिणाम: पात्रता जांचने के लिए अतिरिक्त जानकारी आवश्यक है।"));
      }
    }
  }

  const schemeSteps = [
    { num: 1, en: "Scheme Details", hi: "योजना विवरण" },
    { num: 2, en: "Your Details", hi: "आपके विवरण" },
    { num: 3, en: "Eligibility Result", hi: "पात्रता परिणाम" },
    { num: 4, en: "Official Form Guide", hi: "आधिकारिक फॉर्म गाइड" },
  ];

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-16 pt-6 sm:px-6 sm:pt-8">
      {/* =========================================================================
          PHASE A: SCHEME SEARCH & MATCHING SCHEMES
          ========================================================================= */}
      {journeyStage === "SEARCH" && (
        <>
          <div className="mb-6 text-center">
            <h1
              ref={headingRef}
              tabIndex={-1}
              className="font-display text-3xl font-extrabold text-primary outline-none sm:text-4xl"
            >
              {t("Find Welfare Schemes for Your Need", "अपनी आवश्यकता के अनुसार सरकारी योजनाएं खोजें")}
            </h1>
            <p className="mt-2 text-base text-muted-foreground sm:text-lg">
              {t(
                "Type or speak in Hindi, English, or Hinglish. We match verified schemes from Supabase without storing your personal data.",
                "हिंदी, अंग्रेज़ी या हिंग्लिश में बोलें या लिखें। सुपाबेस डेटाबेस से आपकी आवश्यकता के अनुसार योजनाएं खोजी जाएंगी।"
              )}
            </p>
          </div>

          {/* Universal Search Bar */}
          <section className="mb-8 rounded-2xl border-2 border-primary/20 bg-card p-4 sm:p-6 shadow-sm">
            <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                <input
                  type="text"
                  value={textQuery}
                  onChange={(e) => setTextQuery(e.target.value)}
                  placeholder={t(
                    "Type what you need (e.g. 'Mujhe padhai ke liye scholarship chahiye' or 'Farm support')...",
                    "लिखें आपको क्या चाहिए (जैसे: 'मुझे पढ़ाई के लिए स्कॉलरशिप चाहिए' या 'खेती में मदद')..."
                  )}
                  className="w-full rounded-xl border border-input bg-background pl-12 pr-4 py-3 text-base sm:text-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={() =>
                    isRecording && activeVoiceTarget === "search"
                      ? handleStopRecording()
                      : handleStartRecording("search")
                  }
                  variant={isRecording && activeVoiceTarget === "search" ? "destructive" : "secondary"}
                  className={`h-auto min-h-12 px-4 text-base font-semibold ${
                    isRecording && activeVoiceTarget === "search" ? "animate-pulse" : ""
                  }`}
                  aria-label="Search with voice"
                >
                  {isProcessingVoice ? <LoaderCircle className="animate-spin size-5" /> : <Mic className="size-5" />}
                  <span>
                    {isRecording && activeVoiceTarget === "search"
                      ? t("Stop", "रोकें")
                      : t("Speak Query", "बोलकर खोजें")}
                  </span>
                </Button>

                <Button
                  type="submit"
                  disabled={isProcessingVoice || !textQuery.trim()}
                  className="h-auto min-h-12 px-6 text-base font-bold"
                >
                  {isProcessingVoice ? <LoaderCircle className="animate-spin" /> : <Search />}
                  {t("Search", "खोजें")}
                </Button>
              </div>
            </form>

            {/* Quick Query Suggestion Chips */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-muted-foreground uppercase">{t("Try Queries:", "आज़माएँ:")}</span>
              {[
                { label: "Scholarship", q: "Mujhe padhai ke liye scholarship chahiye." },
                { label: "Small Business Loan", q: "I want a loan to start a small business." },
                { label: "Farm Support", q: "Mere khet ke liye sarkari madad chahiye." },
                { label: "Healthcare", q: "Mujhe hospital ilaj ke liye madad chahiye." },
                { label: "General Help", q: "I need help" },
              ].map(({ label, q }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => handleQuickQuery(q)}
                  className="rounded-full bg-accent/70 hover:bg-accent px-3 py-1 text-xs font-semibold text-primary transition-colors border border-border"
                >
                  "{label}"
                </button>
              ))}
            </div>

            {/* Voice notice / status */}
            {voiceNotice && (
              <p className="mt-3 text-sm text-secondary font-medium flex items-center gap-1.5">
                <MicOff className="size-4" />
                {voiceNotice}
              </p>
            )}
          </section>

          {/* Understood Need Card */}
          <div className="mb-6 rounded-xl bg-card border border-border p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {t("Identified Need / Category:", "पहचानी गई आवश्यकता:")}
              </span>
              <p className="text-lg font-bold text-primary">
                {queryIntent?.purpose || t("All registered welfare schemes", "सभी पंजीकृत सरकारी योजनाएं")}
              </p>
            </div>
            {queryIntent?.intent && (
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary uppercase">
                {queryIntent.intent}
              </span>
            )}
          </div>

          {/* Condition 1: Clarification Prompt (e.g. "I need help") */}
          {searchResult.needsClarification && (
            <div className="rounded-2xl border-2 border-secondary/50 bg-secondary/5 p-6 sm:p-8 text-center max-w-2xl mx-auto shadow-sm mb-8">
              <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-secondary/15 text-secondary mb-3">
                <HelpCircle className="size-7" />
              </div>
              <h2 className="text-2xl font-bold text-primary">
                {t("We need a little more detail", "कृपया थोड़ी और जानकारी दें")}
              </h2>
              <p className="mt-2 text-base text-foreground/80 leading-relaxed">
                {searchResult.clarificationQuestion
                  ? t(searchResult.clarificationQuestion.en, searchResult.clarificationQuestion.hi)
                  : t("What specific support are you looking for?", "आप किस प्रकार की योजना की तलाश में हैं?")}
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                {[
                  { label: t("Education / Scholarship", "पढ़ाई / छात्रवृत्ति"), q: "Mujhe padhai ke liye scholarship chahiye." },
                  { label: t("Farming & Agriculture", "खेती व फसल सहायता"), q: "Mere khet ke liye sarkari madad chahiye." },
                  { label: t("Healthcare & Hospital", "अस्पताल में मुफ्त इलाज"), q: "Mujhe hospital ilaj ke liye madad chahiye." },
                  { label: t("Worker Pension", "मजदूर व श्रमिक पेंशन"), q: "Shramik pension yojna ki jankari chahiye." },
                ].map(({ label, q }) => (
                  <Button key={label} variant="outline" onClick={() => handleQuickQuery(q)} className="font-semibold">
                    {label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Condition 2: No Results Found (e.g. Small business loan) */}
          {searchResult.noResults && !searchResult.needsClarification && (
            <div className="rounded-2xl border-2 border-border bg-card p-6 sm:p-8 text-center max-w-2xl mx-auto shadow-sm mb-8">
              <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground mb-3">
                <XCircle className="size-7 text-secondary" />
              </div>
              <h2 className="text-2xl font-bold text-primary">
                {t("No Matching Schemes Found in Database", "डेटाबेस में कोई संबंधित योजना नहीं मिली")}
              </h2>
              <p className="mt-3 text-base text-muted-foreground leading-relaxed">
                {searchResult.unmetNeedExplanation
                  ? t(searchResult.unmetNeedExplanation.en, searchResult.unmetNeedExplanation.hi)
                  : t("No schemes currently match this request in our database.", "वर्तमान डेटाबेस में इस मांग से संबंधित योजना उपलब्ध नहीं है।")}
              </p>
              <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
                <Button variant="outline" onClick={() => setTextQuery("")}>
                  {t("Try Another Need", "दूसरी आवश्यकता खोजें")}
                </Button>
                <Button variant="secondary" onClick={() => handleQuickQuery("")}>
                  {t("View All Registered Schemes", "सभी उपलब्ध योजनाएं देखें")}
                </Button>
              </div>
            </div>
          )}

          {/* Search / Discovery Loading State (Requirement 10) */}
          {isSearching && (
            <div className="mb-6 rounded-2xl border border-primary/20 bg-primary/5 p-6 text-center shadow-xs animate-pulse">
              <LoaderCircle className="size-8 text-primary animate-spin mx-auto mb-2" />
              <p className="text-sm font-bold text-foreground">
                {t(
                  "Searching Supabase & Official Government Portals...",
                  "डेटाबेस व आधिकारिक सरकारी पोर्टल्स पर खोज जारी है..."
                )}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {t(
                  "Scanning verified state & national welfare schemes via TinyFish.",
                  "टाइनीफ़िश द्वारा सत्यापित राज्य एवं राष्ट्रीय योजनाओं की जांच की जा रही है।"
                )}
              </p>
            </div>
          )}

          {/* Discovery Active Banner (Requirement 10) */}
          {searchResult.isDiscoveryActive && !isSearching && (
            <div className="mb-6 rounded-xl border border-blue-300/60 bg-blue-50/60 dark:bg-blue-950/30 p-3 text-xs flex items-center justify-between gap-2 shadow-xs">
              <div className="flex items-center gap-2 text-blue-950 dark:text-blue-100">
                <Globe className="size-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <span className="font-medium">
                  {t(
                    `Live Web Discovery Active: Found ${
                      searchResult.discoveredCount ||
                      searchResult.schemes.filter((s) => s.isDiscovered).length
                    } additional scheme(s) from official government portals.`,
                    `लाइव वेब खोज सक्रिय: आधिकारिक सरकारी पोर्टल्स से अतिरिक्त योजनाएं खोजी गईं।`
                  )}
                </span>
              </div>
              <span className="rounded-full bg-blue-600/10 dark:bg-blue-400/20 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-blue-700 dark:text-blue-300 shrink-0">
                TinyFish Agent
              </span>
            </div>
          )}

          {/* Database Connection Alert (Requirement 6 & 11) */}
          {searchResult.databaseError && !isSearching && (
            <div className="mb-6 rounded-xl border border-amber-300/70 bg-amber-50/70 dark:bg-amber-950/30 p-3 text-xs flex items-center gap-2 text-amber-950 dark:text-amber-100 shadow-xs">
              <AlertTriangle className="size-4 text-amber-600 shrink-0" />
              <span>
                {t(
                  "Database notice: Supabase connection is currently offline. Serving verified offline repository and active web discovery.",
                  "सूचना: सुपाबेस कनेक्शन वर्तमान में अनुपलब्ध है। सत्यापित ऑफलाइन रिपॉजिटरी और लाइव वेब खोज दिखाई जा रही है।"
                )}
              </span>
            </div>
          )}

          {/* Condition 3: Schemes Found -> Render Matching Schemes Cards */}
          {!searchResult.noResults && !searchResult.needsClarification && searchResult.schemes.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {searchResult.schemes.map((item) => {
                const Icon =
                  item.icon === "farmer"
                    ? Leaf
                    : item.icon === "health"
                    ? HeartPulse
                    : item.icon === "women"
                    ? Users
                    : item.icon === "education"
                    ? GraduationCap
                    : item.icon === "business"
                    ? Briefcase
                    : item.icon === "housing"
                    ? Home
                    : Users;

                const verification = verifications[item.id];
                const portalUrl = item.officialUrl || SCHEME_PORTAL_URLS[item.id]?.url || "https://india.gov.in";

                return (
                  <article
                    key={item.id}
                    className="flex flex-col rounded-xl border-2 border-border bg-card p-6 shadow-sm hover:border-primary/40 transition-all"
                  >
                    <div className="mb-4 flex items-center justify-between gap-2 flex-wrap">
                      <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="size-6" />
                      </span>
                      <div className="flex items-center gap-1.5 flex-wrap justify-end">
                        <span className="rounded-full bg-secondary/15 px-3 py-1 text-xs font-bold text-secondary">
                          {item.category}
                        </span>
                        {item.isDiscovered ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 dark:bg-blue-950/80 px-2.5 py-0.5 text-[10px] font-extrabold text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-700">
                            <Globe className="size-3 text-blue-600 dark:text-blue-400" />
                            <span>{t("Discovered Online", "ऑनलाइन खोजी गई")}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                            <ShieldCheck className="size-3 text-emerald-600 dark:text-emerald-400" />
                            <span>{t("Verified Record", "सत्यापित रिकॉर्ड")}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <h2 className="text-xl font-bold text-primary">{en ? item.name : item.hindi_name || item.name}</h2>
                    <p className="mt-0.5 text-xs text-muted-foreground font-medium">
                      {en ? item.hindi_name : item.name}
                    </p>

                    <div className="my-4 rounded-lg bg-muted/40 p-3 border border-border/50">
                      <p className="text-2xl font-extrabold text-success">{item.benefit_amount}</p>
                      <p className="text-xs text-muted-foreground font-medium">{t("Estimated Benefit", "अनुमानित लाभ")}</p>
                    </div>

                    <p className="mb-4 text-sm text-foreground/90 leading-relaxed line-clamp-3">
                      {item.benefit_summary}
                    </p>

                    {/* TinyFish Verification / Discovery Card Block */}
                    {item.isDiscovered ? (
                      <div className="mb-5 mt-auto rounded-lg bg-blue-50/70 dark:bg-blue-950/40 p-3 text-xs border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="flex items-center gap-1 font-bold text-blue-800 dark:text-blue-300">
                            <Sparkle className="size-3 text-blue-600 fill-blue-600" />
                            {item.verificationStatus === "verified"
                              ? t("TinyFish Discovered", "टाइनीफ़िश खोजी गई")
                              : t("Curated Reference", "मानक संदर्भ")}
                          </span>
                          {item.lastVerifiedAt && (
                            <span className="text-[10px] text-muted-foreground">{item.lastVerifiedAt.slice(0, 10)}</span>
                          )}
                        </div>
                        <p className="text-muted-foreground line-clamp-2 leading-relaxed">
                          {item.sourceTitle || item.benefit_summary}
                        </p>
                        <div className="mt-2 flex items-center justify-between">
                          <a
                            href={portalUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline"
                          >
                            <span>{t("Official Source Link", "आधिकारिक स्रोत लिंक")}</span>
                            <ExternalLink className="size-2.5" />
                          </a>
                          <span className="text-[10px] font-medium text-amber-700 dark:text-amber-400">
                            {t("Online Candidate", "ऑनलाइन खोजी गई")}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="mb-5 mt-auto rounded-lg bg-slate-50 dark:bg-slate-900/60 p-3 text-xs border border-slate-200 dark:border-slate-800">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="flex items-center gap-1 font-bold text-success">
                            <Sparkle className="size-3 text-secondary fill-secondary" />
                            {verification?.status === "verified"
                              ? t("TinyFish Verified", "टाइनीफ़िश सत्यापित")
                              : t("Static Reference", "मानक संदर्भ")}
                          </span>
                          {verification?.lastVerifiedAt && (
                            <span className="text-[10px] text-muted-foreground">{verification.lastVerifiedAt}</span>
                          )}
                        </div>
                        <p className="text-muted-foreground line-clamp-2 leading-relaxed">
                          {verification?.latestNotice || "Official scheme guidelines confirmed."}
                        </p>
                        <a
                          href={portalUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
                        >
                          <span>{t("Official Portal", "आधिकारिक पोर्टल")}</span>
                          <ExternalLink className="size-2.5" />
                        </a>
                      </div>
                    )}

                    {/* Primary Application & Selection Flow (Requirement 1 & 2) */}
                    <div className="flex flex-col gap-2">
                      <Button
                        className="h-auto min-h-12 w-full text-base font-bold shadow bg-secondary hover:bg-secondary/90 text-secondary-foreground gap-2"
                        onClick={() => handleOpenApplicationAssistant(item)}
                      >
                        <Sparkles className="size-4" />
                        <span>{t("Apply with YojnaSetu", "योजनासेतु से आवेदन करें")}</span>
                      </Button>

                      <Button
                        variant="outline"
                        className="h-auto min-h-10 w-full text-sm font-semibold text-foreground hover:bg-muted"
                        onClick={() => handleSelectScheme(item)}
                      >
                        {t("View Details & Eligibility", "विवरण व पात्रता जांचें")}
                        <ArrowRight className="size-3.5" />
                      </Button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* =========================================================================
          PHASE B: FOCUSED 4-STEP SCHEME ELIGIBILITY JOURNEY
          1. Scheme Details -> 2. Your Details -> 3. Eligibility Result -> 4. Form Preparation
          ========================================================================= */}
      {journeyStage === "SCHEME_FLOW" && (
        <>
          {/* Breadcrumb Back Button */}
          <div className="mb-6 flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => {
                if (schemeStep === 1) {
                  setJourneyStage("SEARCH");
                } else {
                  setSchemeStep((prev) => (prev - 1) as 1 | 2 | 3 | 4);
                }
              }}
              className="text-base font-semibold"
            >
              <ArrowLeft />
              {schemeStep === 1
                ? t("Back to Scheme Search", "योजना खोज पर वापस")
                : t("Previous Step", "पिछला चरण")}
            </Button>

            <span className="text-sm font-semibold text-muted-foreground">
              {t("Scheme:", "योजना:")}{" "}
              <strong className="text-primary">{en ? selectedScheme.name : selectedScheme.hindi_name}</strong>
            </span>
          </div>

          {/* 4-Step Stepper Header (Requirement 6) */}
          <nav aria-label="Eligibility Progress" className="mx-auto mb-8 max-w-3xl">
            <ol className="grid grid-cols-4">
              {schemeSteps.map(({ num, en: label, hi }) => (
                <li
                  key={num}
                  aria-current={schemeStep === num ? "step" : undefined}
                  className="step-item relative flex flex-col items-center gap-2 text-center"
                >
                  <div
                    className={`relative z-10 flex size-10 sm:size-12 items-center justify-center rounded-full border-2 text-base sm:text-lg font-bold ${
                      schemeStep === num
                        ? "border-secondary bg-secondary text-secondary-foreground ring-4 ring-secondary/15"
                        : schemeStep > num
                        ? "border-success bg-success text-success-foreground"
                        : "border-border bg-background text-muted-foreground"
                    }`}
                  >
                    {schemeStep > num ? <Check className="size-5" /> : num}
                  </div>
                  <span
                    className={`text-xs sm:text-sm font-semibold ${
                      schemeStep === num ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {t(label, hi)}
                  </span>
                </li>
              ))}
            </ol>
          </nav>

          {/* -------------------------------------------------------------
              SCHEME STEP 1: SCHEME DETAILS
              ------------------------------------------------------------- */}
          {schemeStep === 1 && (
            <div className="max-w-3xl mx-auto rounded-2xl border-2 border-border bg-card p-6 sm:p-8 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-5 mb-6">
                <div>
                  <span className="rounded-full bg-secondary/15 px-3 py-1 text-xs font-bold text-secondary uppercase">
                    {selectedScheme.category}
                  </span>
                  <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-primary">
                    {en ? selectedScheme.name : selectedScheme.hindi_name || selectedScheme.name}
                  </h1>
                  <p className="text-sm text-muted-foreground font-medium">
                    {en ? selectedScheme.hindi_name : selectedScheme.name}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-muted-foreground uppercase font-bold">{t("Benefit", "लाभ")}</span>
                  <p className="text-2xl font-extrabold text-success">{selectedScheme.benefit_amount}</p>
                </div>
              </div>

              <div className="mb-6">
                <h2 className="text-base font-bold text-primary mb-1">{t("Scheme Summary", "योजना का विवरण")}</h2>
                <p className="text-muted-foreground leading-relaxed">{selectedScheme.benefit_summary}</p>
              </div>

              {/* Official Eligibility Rules Box */}
              <div className="mb-8 rounded-xl border border-border/80 bg-muted/40 p-5">
                <h2 className="text-base font-bold text-primary mb-3 flex items-center gap-2">
                  <ShieldCheck className="size-5 text-secondary" />
                  {t("Mandatory Scheme Eligibility Rules", "योजना की अनिवार्य पात्रता शर्तें")}
                </h2>

                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="rounded-lg bg-card p-3 border border-border/50">
                    <dt className="text-xs text-muted-foreground uppercase font-semibold">{t("Target Group / Occupation", "लक्षित वर्ग / पेशा")}</dt>
                    <dd className="mt-1 font-bold text-primary">{selectedScheme.rule?.required_occupation || "Any citizen"}</dd>
                  </div>

                  <div className="rounded-lg bg-card p-3 border border-border/50">
                    <dt className="text-xs text-muted-foreground uppercase font-semibold">{t("Eligible Age Range", "पात्र आयु सीमा")}</dt>
                    <dd className="mt-1 font-bold text-primary">
                      {selectedScheme.rule?.min_age !== undefined
                        ? `${selectedScheme.rule.min_age} to ${selectedScheme.rule.max_age} ${t("years", "वर्ष")}`
                        : t("Not specified", "निर्दिष्ट नहीं")}
                    </dd>
                  </div>

                  <div className="rounded-lg bg-card p-3 border border-border/50">
                    <dt className="text-xs text-muted-foreground uppercase font-semibold">{t("Annual Income Limit", "वार्षिक आय सीमा")}</dt>
                    <dd className="mt-1 font-bold text-primary">
                      {selectedScheme.rule?.max_income
                        ? `Up to ₹${selectedScheme.rule.max_income.toLocaleString("en-IN")}`
                        : t("Not specified", "निर्दिष्ट नहीं")}
                    </dd>
                  </div>

                  <div className="rounded-lg bg-card p-3 border border-border/50">
                    <dt className="text-xs text-muted-foreground uppercase font-semibold">{t("Required Domicile", "राज्य अधिवास")}</dt>
                    <dd className="mt-1 font-bold text-primary">{selectedScheme.rule?.required_state || "All States"}</dd>
                  </div>
                </dl>
              </div>

              {/* Prominent Action Button: Check Eligibility */}
              <Button
                size="lg"
                onClick={() => setSchemeStep(2)}
                className="h-auto min-h-14 w-full text-lg font-bold shadow-md"
              >
                {t("Check Your Eligibility", "अपनी पात्रता जांचें")}
                <ArrowRight />
              </Button>
            </div>
          )}

          {/* -------------------------------------------------------------
              SCHEME STEP 2: YOUR DETAILS (ELIGIBILITY CHECK INTAKE)
              ------------------------------------------------------------- */}
          {schemeStep === 2 && (
            <div className="max-w-3xl mx-auto rounded-2xl border-2 border-border bg-card p-6 sm:p-8 shadow-sm">
              <div className="mb-6 border-b border-border pb-4">
                <span className="text-xs font-bold uppercase text-secondary tracking-wider">
                  {t("Step 2: Enter Details", "चरण 2: विवरण दर्ज करें")}
                </span>
                <h1 className="text-2xl font-extrabold text-primary mt-1">
                  {t(`Check Eligibility for ${en ? selectedScheme.name : selectedScheme.hindi_name}`, `पात्रता जांच: ${selectedScheme.hindi_name || selectedScheme.name}`)}
                </h1>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  {t(
                    "All fields are empty by default. We only collect the minimal details needed for eligibility. Your name is not required for eligibility determination.",
                    "सभी फ़ील्ड खाली हैं। हम केवल पात्रता जांचने के लिए आवश्यक जानकारी ले रहे हैं। पात्रता जांचने के लिए नाम देना अनिवार्य नहीं है।"
                  )}
                </p>
              </div>

              {/* Multi-field Spoken Voice Button (Requirement 4) */}
              <div className="mb-8 rounded-xl border-2 border-secondary/40 bg-secondary/5 p-4 sm:p-5 text-center">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-left">
                    <h2 className="text-base font-bold text-primary flex items-center gap-2">
                      <Mic className="size-4 text-secondary" />
                      {t("Speak Your Details in One Sentence", "एक वाक्य में बोलकर सभी विवरण भरें")}
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {t(
                        "e.g., 'Meri age 22 saal hai aur annual income ek lakh rupaye hai' or English.",
                        "उदाहरण: 'मेरी उम्र 22 साल है और सालाना आमदनी एक लाख रुपये है'"
                      )}
                    </p>
                  </div>

                  <Button
                    type="button"
                    variant={isRecording && activeVoiceTarget === "multi_field" ? "destructive" : "secondary"}
                    onClick={() =>
                      isRecording && activeVoiceTarget === "multi_field"
                        ? handleStopRecording()
                        : handleStartRecording("multi_field")
                    }
                    className={`h-auto min-h-12 px-5 font-bold shrink-0 ${
                      isRecording && activeVoiceTarget === "multi_field" ? "animate-pulse" : ""
                    }`}
                  >
                    {isProcessingVoice ? (
                      <LoaderCircle className="animate-spin size-4" />
                    ) : (
                      <Mic className="size-4" />
                    )}
                    {isRecording && activeVoiceTarget === "multi_field"
                      ? t("Stop Recording", "रिकॉर्डिंग रोकें")
                      : t("Speak Your Details", "बोलकर भरें")}
                  </Button>
                </div>

                {/* Live Speech Recognition Transcript */}
                {recognizedVoiceText && (
                  <div className="mt-4 text-left rounded-lg bg-card p-3 border border-border text-xs">
                    <span className="font-bold text-muted-foreground uppercase">{t("Recognized Speech:", "पहचानी गई आवाज़:")}</span>
                    <p className="mt-1 italic text-foreground text-sm">"{recognizedVoiceText}"</p>
                  </div>
                )}

                {voiceNotice && (
                  <p className="mt-3 text-xs text-secondary font-semibold text-left">{voiceNotice}</p>
                )}
              </div>

              {/* Manual & Voice Input Form Fields */}
              <div className="space-y-5">
                {/* Age Field */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="field-age" className="text-sm font-bold text-primary">
                      {t("Age in Years", "आयु (वर्ष)")} <span className="text-secondary">*</span>
                    </label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        isRecording && activeVoiceTarget === "age"
                          ? handleStopRecording()
                          : handleStartRecording("age")
                      }
                      className={`h-8 px-2 text-xs font-semibold ${
                        isRecording && activeVoiceTarget === "age" ? "bg-red-500/15 text-red-600 animate-pulse" : ""
                      }`}
                    >
                      <Mic className="size-3.5" />
                      {isRecording && activeVoiceTarget === "age" ? t("Stop", "रोकें") : t("Speak Age", "बोलें")}
                    </Button>
                  </div>
                  <input
                    id="field-age"
                    type="number"
                    min={1}
                    max={120}
                    value={profile.age}
                    onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                    placeholder={t("Enter your age (e.g. 24)", "अपनी उम्र लिखें (जैसे 24)")}
                    className="w-full rounded-xl border border-input bg-background px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* Annual Income Field */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="field-income" className="text-sm font-bold text-primary">
                      {t("Annual Family Income (₹)", "वार्षिक पारिवारिक आय (₹)")} <span className="text-secondary">*</span>
                    </label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        isRecording && activeVoiceTarget === "income"
                          ? handleStopRecording()
                          : handleStartRecording("income")
                      }
                      className={`h-8 px-2 text-xs font-semibold ${
                        isRecording && activeVoiceTarget === "income" ? "bg-red-500/15 text-red-600 animate-pulse" : ""
                      }`}
                    >
                      <Mic className="size-3.5" />
                      {isRecording && activeVoiceTarget === "income" ? t("Stop", "रोकें") : t("Speak Income", "बोलें")}
                    </Button>
                  </div>
                  <input
                    id="field-income"
                    type="number"
                    min={0}
                    value={profile.income}
                    onChange={(e) => setProfile({ ...profile, income: e.target.value })}
                    placeholder={t("e.g. 100000 (speaks: 'ek lakh', 'pachaas hazaar')", "जैसे: 100000 (बोलें: 'एक लाख')")}
                    className="w-full rounded-xl border border-input bg-background px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* Category / Occupation Field */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-bold text-primary">
                      {t("Category / Occupation", "श्रेणी / व्यवसाय")}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        isRecording && activeVoiceTarget === "category"
                          ? handleStopRecording()
                          : handleStartRecording("category")
                      }
                      className={`h-8 px-2 text-xs font-semibold ${
                        isRecording && activeVoiceTarget === "category" ? "bg-red-500/15 text-red-600 animate-pulse" : ""
                      }`}
                    >
                      <Mic className="size-3.5" />
                      {isRecording && activeVoiceTarget === "category" ? t("Stop", "रोकें") : t("Speak Category", "बोलें")}
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map(({ id, en: label, hi }) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setProfile({ ...profile, category: id })}
                        className={`rounded-lg px-3.5 py-2 text-sm font-semibold border transition-all ${
                          profile.category === id
                            ? "border-primary bg-primary text-primary-foreground shadow-sm"
                            : "border-border bg-card text-foreground hover:bg-muted"
                        }`}
                      >
                        {t(label, hi)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* State Domicile Field */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="field-state" className="text-sm font-bold text-primary">
                      {t("State of Domicile", "राज्य")}
                    </label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        isRecording && activeVoiceTarget === "state"
                          ? handleStopRecording()
                          : handleStartRecording("state")
                      }
                      className={`h-8 px-2 text-xs font-semibold ${
                        isRecording && activeVoiceTarget === "state" ? "bg-red-500/15 text-red-600 animate-pulse" : ""
                      }`}
                    >
                      <Mic className="size-3.5" />
                      {isRecording && activeVoiceTarget === "state" ? t("Stop", "रोकें") : t("Speak State", "बोलें")}
                    </Button>
                  </div>
                  <select
                    id="field-state"
                    value={profile.state}
                    onChange={(e) => setProfile({ ...profile, state: e.target.value })}
                    className="w-full rounded-xl border border-input bg-background px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">{t("-- Select State --", "-- राज्य चुनें --")}</option>
                    {INDIAN_STATES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Submit Eligibility Button */}
              <div className="mt-8 pt-5 border-t border-border flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  onClick={() => setSchemeStep(1)}
                  className="h-auto min-h-12"
                >
                  <ArrowLeft />
                  {t("Back to Details", "विवरण पर वापस")}
                </Button>
                <Button
                  onClick={handleRunEligibilityCheck}
                  className="h-auto min-h-12 flex-1 text-base font-bold shadow-md"
                >
                  {t("Check Eligibility Now", "पात्रता परिणाम देखें")}
                  <ArrowRight />
                </Button>
              </div>
            </div>
          )}

          {/* -------------------------------------------------------------
              SCHEME STEP 3: ELIGIBILITY RESULT CARD (Requirement 3)
              ------------------------------------------------------------- */}
          {schemeStep === 3 && eligibilityResult && (
            <div className="max-w-3xl mx-auto rounded-2xl border-2 border-border bg-card p-6 sm:p-8 shadow-sm">
              <div className="mb-6 border-b border-border pb-4">
                <span className="text-xs font-bold uppercase text-secondary tracking-wider">
                  {t("Step 3: Verification Result", "चरण 3: पात्रता परिणाम")}
                </span>
                <h1 className="text-2xl font-extrabold text-primary mt-1">
                  {en ? selectedScheme.name : selectedScheme.hindi_name || selectedScheme.name}
                </h1>
              </div>

              {/* OUTCOME 1: LIKELY_ELIGIBLE */}
              {eligibilityResult.verdict === "LIKELY_ELIGIBLE" && (
                <div className="rounded-xl border-2 border-success/40 bg-success/5 p-6 mb-8 text-center sm:text-left">
                  <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
                    <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-success/15 text-success">
                      <CheckCheck className="size-8" />
                    </div>
                    <div>
                      <span className="rounded-full bg-success/20 px-3 py-0.5 text-xs font-bold text-success uppercase">
                        {t("Verified Against Scheme Rules", "शर्तों के अनुसार सत्यापित")}
                      </span>
                      <h2 className="text-2xl font-extrabold text-success mt-1">
                        {t("Likely Eligible", "पात्र होने की प्रबल संभावना")}
                      </h2>
                    </div>
                  </div>

                  <p className="text-foreground/90 font-medium leading-relaxed mb-4">
                    {t(
                      "Based on the information provided, you satisfy all mandatory criteria recorded in the database for this scheme.",
                      "आपके द्वारा दी गई जानकारी के आधार पर आप इस योजना की सभी अनिवार्य शर्तों को पूरा करते हैं।"
                    )}
                  </p>

                  {/* Satisfied criteria checkmarks */}
                  {eligibilityResult.satisfiedConditions.length > 0 && (
                    <div className="space-y-2 mt-4 pt-4 border-t border-success/20 text-sm">
                      {eligibilityResult.satisfiedConditions.map((cond, i) => (
                        <div key={i} className="flex items-center gap-2 text-foreground/80">
                          <Check className="size-4 text-success shrink-0" />
                          <span>{en ? cond.en : cond.hi}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* OUTCOME 2: NOT_ELIGIBLE */}
              {eligibilityResult.verdict === "NOT_ELIGIBLE" && (
                <div className="rounded-xl border-2 border-destructive/40 bg-destructive/5 p-6 mb-8 text-center sm:text-left">
                  <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
                    <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-destructive/15 text-destructive">
                      <AlertTriangle className="size-8" />
                    </div>
                    <div>
                      <span className="rounded-full bg-destructive/20 px-3 py-0.5 text-xs font-bold text-destructive uppercase">
                        {t("Mandatory Condition Unmet", "अनिवार्य शर्त अधूरी")}
                      </span>
                      <h2 className="text-2xl font-extrabold text-destructive mt-1">
                        {t("Not Eligible Based on Current Rules", "वर्तमान नियमों के अनुसार अपात्र")}
                      </h2>
                    </div>
                  </div>

                  <p className="text-foreground/90 font-medium leading-relaxed mb-4">
                    {en ? eligibilityResult.summary.en : eligibilityResult.summary.hi}
                  </p>

                  {/* Unmet conditions list */}
                  <div className="space-y-2 mt-4 pt-4 border-t border-destructive/20 text-sm">
                    {eligibilityResult.failedConditions.map((cond, i) => (
                      <div key={i} className="flex items-start gap-2 text-destructive font-medium">
                        <XCircle className="size-4 shrink-0 mt-0.5" />
                        <span>{en ? cond.en : cond.hi}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* OUTCOME 3: MORE_INFORMATION_REQUIRED */}
              {eligibilityResult.verdict === "MORE_INFORMATION_REQUIRED" && (
                <div className="rounded-xl border-2 border-amber-500/40 bg-amber-500/5 p-6 mb-8 text-center sm:text-left">
                  <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
                    <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400">
                      <HelpCircle className="size-8" />
                    </div>
                    <div>
                      <span className="rounded-full bg-amber-500/20 px-3 py-0.5 text-xs font-bold text-amber-800 dark:text-amber-300 uppercase">
                        {t("Additional Verification Required", "अतिरिक्त सत्यापन आवश्यक")}
                      </span>
                      <h2 className="text-2xl font-extrabold text-amber-800 dark:text-amber-300 mt-1">
                        {en ? eligibilityResult.headline.en : eligibilityResult.headline.hi}
                      </h2>
                    </div>
                  </div>

                  <p className="text-foreground/90 font-medium leading-relaxed mb-4">
                    {en ? eligibilityResult.summary.en : eligibilityResult.summary.hi}
                  </p>

                  {eligibilityResult.missingFields.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-amber-500/20 text-sm">
                      <p className="text-xs uppercase font-bold text-muted-foreground mb-2">
                        {t("Missing Information:", "अधूरी जानकारी:")}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {eligibilityResult.missingFields.map((f) => (
                          <span
                            key={f.field}
                            className="rounded bg-amber-500/15 text-amber-800 dark:text-amber-300 px-2.5 py-1 text-xs font-semibold"
                          >
                            {en ? f.en : f.hi}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {eligibilityResult.isPreliminary && (
                    <div className="mt-4 rounded-lg bg-card p-3 border border-border text-xs text-muted-foreground flex items-center gap-2">
                      <Info className="size-4 shrink-0 text-primary" />
                      <span>
                        {t(
                          "This is a preliminary check. Official verification must be completed at the scheme portal or local CSC.",
                          "यह प्रारंभिक जांच है। आधिकारिक सत्यापन सरकारी पोर्टल या सीएससी पर किया जाना चाहिए।"
                        )}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons: Offer "Apply on Official Website" and "Form Preparation Draft" (Requirement 2 & 4) */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  onClick={() => setSchemeStep(2)}
                  className="h-auto min-h-12 text-base font-semibold"
                >
                  <ArrowLeft />
                  {t("Edit Your Details", "विवरण सुधारें")}
                </Button>

                <Button
                  variant="ghost"
                  onClick={() => setJourneyStage("SEARCH")}
                  className="h-auto min-h-12 text-base"
                >
                  {t("Check Another Scheme", "अन्य योजना देखें")}
                </Button>

                {eligibilityResult.verdict !== "NOT_ELIGIBLE" && (
                  <>
                    <Button
                      onClick={() => handleOpenApplicationAssistant(selectedScheme)}
                      className="h-auto min-h-12 flex-1 text-base font-bold shadow-md bg-secondary hover:bg-secondary/90 text-secondary-foreground gap-2"
                    >
                      <Sparkles className="size-4" />
                      <span>{t("Apply with YojnaSetu", "योजनासेतु से आवेदन करें")}</span>
                      <ArrowRight className="size-4" />
                    </Button>

                    <Button
                      onClick={() => {
                        setFormPreparationTab("official_guide");
                        setSchemeStep(4);
                      }}
                      variant="outline"
                      className="h-auto min-h-12 text-base font-semibold gap-2"
                    >
                      <FileText className="size-4" />
                      <span>{t("View Official Form Guide", "सरकारी फॉर्म गाइड देखें")}</span>
                      <ArrowRight className="size-4" />
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => setIsBridgeModalOpen(true)}
                      className="h-auto min-h-12 text-base font-semibold gap-1.5"
                    >
                      <span>{t("Apply on Official Portal", "सरकारी पोर्टल")}</span>
                      <ExternalLink className="size-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      onClick={() => {
                        setFormPreparationTab("assisted_draft");
                        setSchemeStep(4);
                      }}
                      className="h-auto min-h-12 text-sm font-semibold gap-1.5 text-muted-foreground"
                    >
                      <span>{t("Offline Draft", "ड्राफ्ट")}</span>
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* -------------------------------------------------------------
              SCHEME STEP 4: OFFICIAL FORM GUIDE & ASSISTED PREPARATION
              ------------------------------------------------------------- */}
          {schemeStep === 4 && (
            <div className="space-y-6">
              {/* Tab Selector */}
              <div className="flex border-b border-border">
                <button
                  type="button"
                  onClick={() => setFormPreparationTab("official_guide")}
                  className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-bold transition-colors ${
                    formPreparationTab === "official_guide"
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <FileText className="size-4" />
                  <span>{t("Official Application Form Guide", "आधिकारिक आवेदन फॉर्म गाइड")}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormPreparationTab("assisted_draft")}
                  className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-bold transition-colors ${
                    formPreparationTab === "assisted_draft"
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Sparkles className="size-4" />
                  <span>{t("Assisted Offline PDF Draft", "सहायता प्राप्त PDF ड्राफ्ट")}</span>
                </button>
              </div>

              {formPreparationTab === "official_guide" ? (
                <OfficialFormGuide
                  key={selectedScheme.id}
                  scheme={selectedScheme}
                  profile={profile}
                  lang={lang}
                  onBackToEligibility={() => setSchemeStep(3)}
                  onOpenPortalBridge={() => setIsBridgeModalOpen(true)}
                  onSwitchToDraftView={() => setFormPreparationTab("assisted_draft")}
                />
              ) : (
                <>
                  {/* Disclaimer Banner: Form draft only, NOT an official submission */}
                  <div className="rounded-xl border border-secondary/40 bg-secondary/10 p-4 text-sm text-foreground flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <Info className="size-5 text-secondary shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-secondary">
                          {t(
                            "PREPARATION TOOL ONLY — NOT AN OFFICIAL GOVERNMENT SUBMISSION",
                            "केवल प्रारूप तैयारी उपकरण — आधिकारिक सरकारी आवेदन नहीं"
                          )}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
                          {t(
                            "This page helps you organize your details into a printable application draft. You must submit your official application through the scheme's official portal or at your nearest Common Service Centre (CSC) / Gram Panchayat.",
                            "यह पृष्ठ आपके विवरण को एक मुद्रण योग्य फ़ॉर्म प्रारूप में तैयार करता है। आधिकारिक आवेदन योजना के आधिकारिक पोर्टल या निकटतम सीएससी / ग्राम पंचायत में जमा करें।"
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setFormPreparationTab("official_guide")}
                        className="shrink-0 font-bold text-xs"
                      >
                        {t("View Official Guide", "आधिकारिक गाइड")}
                      </Button>
                      <Button
                        onClick={() => setIsBridgeModalOpen(true)}
                        className="shrink-0 font-bold text-xs gap-2 bg-primary shadow"
                      >
                        <span>{t("Apply on Official Portal", "सरकारी पोर्टल")}</span>
                        <ExternalLink className="size-3.5" />
                      </Button>
                    </div>
                  </div>

                  <FormAssembly
                    key={selectedScheme.id}
                    profile={profile}
                    setProfile={setProfile}
                    scheme={selectedScheme}
                    lang={lang}
                    speak={speak}
                    maskedAadhaar="•••• •••• 1234"
                  />
                </>
              )}
            </div>
          )}

          {/* Official Portal Bridge Modal (Requirements 1, 2, 4) */}
          <OfficialPortalBridge
            scheme={selectedScheme}
            profile={profile}
            lang={lang}
            isOpen={isBridgeModalOpen}
            onClose={() => setIsBridgeModalOpen(false)}
            onContinueToDraft={() => {
              setIsBridgeModalOpen(false);
              setSchemeStep(4);
            }}
          />
        </>
      )}

      {/* Application Assistant Wizard Modal (Workflow Requirements 1-12) */}
      {assistantScheme && (
        <ApplicationAssistantWizard
          scheme={assistantScheme}
          profile={profile}
          lang={lang}
          isOpen={isAssistantOpen}
          onClose={() => setIsAssistantOpen(false)}
          onProfileUpdate={(updated) => setProfile(updated)}
        />
      )}

      {/* Persistent Spoken Audio Dock */}
      <div className="audio-help-dock fixed bottom-0 right-0 z-30 flex justify-end p-3 sm:p-4">
        <Button
          className="h-auto min-h-14 max-w-full gap-2.5 whitespace-normal rounded-xl border border-primary-foreground/30 px-4 py-2.5 text-left shadow-2xl"
          onClick={() => {
            speak(
              journeyStage === "SEARCH"
                ? t(
                    "Speak or type what you need. We will match government schemes for you.",
                    "बोलकर या लिखकर बताएं आपको क्या चाहिए। हम आपके लिए योजनाएं खोजेंगे।"
                  )
                : t(
                    `Step ${schemeStep}. Follow the on-screen instructions to check your eligibility.`,
                    `चरण ${schemeStep}। पात्रता जांचने के लिए स्क्रीन पर दिए गए निर्देशों का पालन करें।`
                  )
            );
          }}
          aria-label="Need audio assistance? Tap to hear instructions"
        >
          <Volume2 className="size-5" />
          <span className="flex flex-col text-left">
            <span className="text-sm font-bold">{t("Need help?", "मदद चाहिए?")}</span>
            <span className="text-[11px] text-muted-foreground">{t("Hear instructions", "आवाज़ सुनें")}</span>
          </span>
        </Button>
      </div>
    </main>
  );
}