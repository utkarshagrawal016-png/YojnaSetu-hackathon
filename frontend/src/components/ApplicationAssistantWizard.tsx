import { useState, useEffect } from "react";
import {
  FileCheck2,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  ExternalLink,
  Copy,
  Check,
  Lock,
  FileText,
  UserCheck,
  Sparkles,
  Info,
  X,
  LoaderCircle,
  HelpCircle,
  Building2,
  Calendar,
  IndianRupee,
  MapPin,
  Tag,
  Phone,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Lang } from "@/components/SiteHeader";
import type { Profile } from "@/lib/welfare-demo";
import type { DbScheme } from "@/services/schemeService";
import {
  type ApplicationIntakeData,
  type DocumentChecklistItem,
  type FieldMapping,
  type PortalEvaluationResult,
  getDefaultDocumentChecklist,
  initializeIntakeFromProfile,
  validateIntakeData,
  evaluatePortalAssistanceViaBackend,
} from "@/services/applicationAssistantService";
import { copyToClipboard } from "@/services/officialPortalService";

interface ApplicationAssistantWizardProps {
  scheme: DbScheme;
  profile: Profile;
  lang: Lang;
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdate?: (updatedProfile: Profile) => void;
}

type WizardStep = "overview_docs" | "intake_fields" | "mapping_feasibility" | "review" | "portal_bridge";

export function ApplicationAssistantWizard({
  scheme,
  profile,
  lang,
  isOpen,
  onClose,
  onProfileUpdate,
}: ApplicationAssistantWizardProps) {
  const en = lang === "en";
  const t = (english: string, hindi: string) => (en ? english : hindi);

  // Wizard state
  const [currentStep, setCurrentStep] = useState<WizardStep>("overview_docs");
  const [documents, setDocuments] = useState<DocumentChecklistItem[]>([]);
  const [intakeData, setIntakeData] = useState<ApplicationIntakeData>(() =>
    initializeIntakeFromProfile(profile)
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [evaluationResult, setEvaluationResult] = useState<PortalEvaluationResult | null>(null);
  const [copiedFieldId, setCopiedFieldId] = useState<string | null>(null);

  // Reset or initialize on open or scheme change
  useEffect(() => {
    if (isOpen) {
      setDocuments(getDefaultDocumentChecklist(scheme));
      setIntakeData(initializeIntakeFromProfile(profile));
      setErrors({});
      setCurrentStep("overview_docs");
      setEvaluationResult(null);
    }
  }, [isOpen, scheme, profile]);

  if (!isOpen) return null;

  // Toggle document checklist availability
  const toggleDocument = (id: string) => {
    setDocuments((prev) =>
      prev.map((doc) => (doc.id === id ? { ...doc, isAvailable: !doc.isAvailable } : doc))
    );
  };

  const availableCount = documents.filter((d) => d.isAvailable).length;
  const mandatoryDocs = documents.filter((d) => d.isMandatory);
  const allMandatoryReady = mandatoryDocs.every((d) => d.isAvailable);

  // Step 2 -> Step 3 transition: Validate intake & trigger backend feasibility evaluation
  const handleProceedToMapping = async () => {
    const validation = validateIntakeData(intakeData, lang);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }
    setErrors({});
    setIsEvaluating(true);
    setCurrentStep("mapping_feasibility");

    try {
      const result = await evaluatePortalAssistanceViaBackend(scheme, intakeData);
      setEvaluationResult(result);
      if (onProfileUpdate) {
        onProfileUpdate({
          ...profile,
          name: intakeData.name,
          age: intakeData.age,
          income: intakeData.income,
          state: intakeData.state,
          category: intakeData.category,
        });
      }
    } catch (err) {
      console.error("Portal assistance evaluation error:", err);
    } finally {
      setIsEvaluating(false);
    }
  };

  // Clipboard copy handler
  const handleCopy = async (fieldId: string, value: string) => {
    if (!value) return;
    const ok = await copyToClipboard(value);
    if (ok) {
      setCopiedFieldId(fieldId);
      setTimeout(() => setCopiedFieldId(null), 2000);
    }
  };

  const stepsList: { id: WizardStep; labelEn: string; labelHi: string; num: number }[] = [
    { id: "overview_docs", labelEn: "1. Documents", labelHi: "1. दस्तावेज", num: 1 },
    { id: "intake_fields", labelEn: "2. Your Info", labelHi: "2. विवरण", num: 2 },
    { id: "mapping_feasibility", labelEn: "3. Form Map", labelHi: "3. फॉर्म मैपिंग", num: 3 },
    { id: "review", labelEn: "4. Review", labelHi: "4. समीक्षा", num: 4 },
    { id: "portal_bridge", labelEn: "5. Apply", labelHi: "5. आवेदन", num: 5 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative flex max-h-[92vh] w-full max-w-4xl flex-col rounded-2xl border-2 border-border bg-card shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border bg-muted/30 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Sparkles className="size-5 text-secondary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-secondary">
                  {t("YojnaSetu Application Assistant", "योजनासेतु आवेदन सहायता")}
                </span>
                {scheme.isDiscovered ? (
                  <span className="rounded bg-blue-500/15 text-blue-700 dark:text-blue-300 text-[10px] font-bold px-2 py-0.5">
                    {t("Discovered Online", "ऑनलाइन खोजी गई")}
                  </span>
                ) : (
                  <span className="rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold px-2 py-0.5">
                    {t("Verified Record", "सत्यापित योजना")}
                  </span>
                )}
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-primary line-clamp-1">
                {en ? scheme.name : scheme.hindi_name || scheme.name}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            aria-label="Close Assistant"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="bg-background border-b border-border px-5 py-2.5 overflow-x-auto">
          <div className="flex items-center justify-between min-w-[500px] gap-2">
            {stepsList.map((st, idx) => {
              const isCurrent = currentStep === st.id;
              const isCompleted =
                stepsList.findIndex((s) => s.id === currentStep) > idx;

              return (
                <div key={st.id} className="flex items-center gap-2">
                  <div
                    className={`flex size-6 items-center justify-center rounded-full text-xs font-bold ${
                      isCurrent
                        ? "bg-secondary text-secondary-foreground"
                        : isCompleted
                        ? "bg-success text-success-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isCompleted ? <Check className="size-3.5" /> : st.num}
                  </div>
                  <span
                    className={`text-xs font-semibold whitespace-nowrap ${
                      isCurrent
                        ? "text-primary font-bold"
                        : isCompleted
                        ? "text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {t(st.labelEn, st.labelHi)}
                  </span>
                  {idx < stepsList.length - 1 && (
                    <div className="h-0.5 w-6 bg-border mx-1 shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* =========================================================================
              STEP 1: SCHEME OVERVIEW & REQUIRED DOCUMENTS CHECKLIST
              ========================================================================= */}
          {currentStep === "overview_docs" && (
            <div className="space-y-6">
              {/* Detailed Scheme Card Header */}
              <div className="rounded-xl border border-border bg-muted/20 p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="rounded-md bg-secondary/15 px-2.5 py-1 text-xs font-bold text-secondary uppercase">
                    {scheme.category}
                  </span>
                  <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                    <Building2 className="size-3.5 text-primary" />
                    <span>{scheme.sourceTitle || scheme.officialUrl || "Official Portal"}</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-extrabold text-primary">
                    {en ? scheme.name : scheme.hindi_name || scheme.name}
                  </h3>
                  <p className="text-sm text-foreground/90 mt-1 leading-relaxed">
                    {scheme.benefit_summary}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-border/60 text-xs">
                  <div className="rounded-lg bg-card p-3 border border-border">
                    <span className="font-semibold text-muted-foreground uppercase">{t("Assistance / Benefit", "सहायता राशि / लाभ")}</span>
                    <p className="text-base font-extrabold text-success mt-0.5">{scheme.benefit_amount}</p>
                  </div>
                  <div className="rounded-lg bg-card p-3 border border-border">
                    <span className="font-semibold text-muted-foreground uppercase">{t("Eligibility Target", "लक्षित पात्रता")}</span>
                    <p className="text-xs font-medium text-foreground line-clamp-2 mt-0.5">
                      {scheme.eligibilityCriteria || t("Open to eligible citizens meeting scheme criteria.", "पात्र नागरिक आवेदन कर सकते हैं।")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Document Readiness Checklist (Requirement 5) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-base font-bold text-primary flex items-center gap-2">
                      <FileCheck2 className="size-5 text-secondary" />
                      {t("Required Documents Checklist", "आवश्यक दस्तावेज चेकलिस्ट")}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {t(
                        "Check off the documents you currently have available before applying.",
                        "आवेदन शुरू करने से पहले अपने पास उपलब्ध दस्तावेजों पर सही का निशान लगाएं।"
                      )}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      allMandatoryReady
                        ? "bg-success/15 text-success"
                        : "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                    }`}
                  >
                    {availableCount}/{documents.length} {t("Ready", "तैयार")}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {documents.map((doc) => (
                    <label
                      key={doc.id}
                      className={`flex items-start gap-3 rounded-xl border p-3.5 cursor-pointer transition-colors ${
                        doc.isAvailable
                          ? "border-success/50 bg-success/5"
                          : "border-border bg-card hover:bg-muted/40"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={doc.isAvailable}
                        onChange={() => toggleDocument(doc.id)}
                        className="size-4 rounded border-input text-primary focus:ring-primary mt-1 shrink-0"
                      />
                      <div className="flex-1 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-foreground">
                            {en ? doc.name.en : doc.name.hi}
                          </span>
                          {doc.isMandatory ? (
                            <span className="text-[10px] font-bold text-destructive bg-destructive/10 px-1.5 py-0.5 rounded">
                              {t("Mandatory", "अनिवार्य")}
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                              {t("Optional / If Applicable", "ऐच्छिक")}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {en ? doc.description.en : doc.description.hi}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>

                {!allMandatoryReady && (
                  <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-3 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
                    <Info className="size-4 shrink-0" />
                    <span>
                      {t(
                        "You can still proceed with preparing your application, but you will need your mandatory documents ready when submitting on the official portal.",
                        "आप आवेदन की तैयारी जारी रख सकते हैं, लेकिन आधिकारिक पोर्टल पर सबमिट करते समय अनिवार्य दस्तावेज तैयार रखने होंगे।"
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =========================================================================
              STEP 2: PROFILE REUSE & INTAKE OF MISSING REQUIRED FIELDS
              ========================================================================= */}
          {currentStep === "intake_fields" && (
            <div className="space-y-6">
              <div className="rounded-xl border border-secondary/30 bg-secondary/5 p-4 text-xs text-foreground flex items-center gap-2.5">
                <UserCheck className="size-4 text-secondary shrink-0" />
                <span>
                  {t(
                    "Details from your profile have been pre-filled below. Please fill in the few additional details required by this scheme.",
                    "आपकी प्रोफ़ाइल से पहले से ज्ञात विवरण नीचे स्वतः भर दिए गए हैं। कृपया शेष आवश्यक विवरण दर्ज करें।"
                  )}
                </span>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-primary">
                      {t("Applicant Full Name", "पूरा नाम")} <span className="text-secondary">*</span>
                    </label>
                    {profile.name && (
                      <span className="text-[10px] font-semibold text-success flex items-center gap-1">
                        <Check className="size-3" /> {t("Reused from profile", "प्रोफ़ाइल से लिया")}
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={intakeData.name}
                    onChange={(e) => setIntakeData({ ...intakeData, name: e.target.value })}
                    placeholder={t("As written on Aadhaar Card", "आधार कार्ड के अनुसार नाम")}
                    className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
                </div>

                {/* Age */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-primary">
                      {t("Age in Years", "आयु (वर्ष)")} <span className="text-secondary">*</span>
                    </label>
                    {profile.age && (
                      <span className="text-[10px] font-semibold text-success flex items-center gap-1">
                        <Check className="size-3" /> {t("Reused", "पुष्ट")}
                      </span>
                    )}
                  </div>
                  <input
                    type="number"
                    min={1}
                    max={120}
                    value={intakeData.age}
                    onChange={(e) => setIntakeData({ ...intakeData, age: e.target.value })}
                    placeholder="e.g. 28"
                    className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  {errors.age && <p className="text-xs text-destructive mt-1">{errors.age}</p>}
                </div>

                {/* Annual Income */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-primary">
                      {t("Annual Family Income (₹)", "पारिवारिक वार्षिक आय (₹)")} <span className="text-secondary">*</span>
                    </label>
                    {profile.income && (
                      <span className="text-[10px] font-semibold text-success flex items-center gap-1">
                        <Check className="size-3" /> {t("Reused", "पुष्ट")}
                      </span>
                    )}
                  </div>
                  <input
                    type="number"
                    value={intakeData.income}
                    onChange={(e) => setIntakeData({ ...intakeData, income: e.target.value })}
                    placeholder="e.g. 150000"
                    className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  {errors.income && <p className="text-xs text-destructive mt-1">{errors.income}</p>}
                </div>

                {/* State */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-primary">
                      {t("State of Residence", "मूल निवास राज्य")} <span className="text-secondary">*</span>
                    </label>
                    {profile.state && profile.state !== "All States" && (
                      <span className="text-[10px] font-semibold text-success flex items-center gap-1">
                        <Check className="size-3" /> {t("Reused", "पुष्ट")}
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={intakeData.state}
                    onChange={(e) => setIntakeData({ ...intakeData, state: e.target.value })}
                    placeholder="e.g. Uttar Pradesh, Bihar, Maharashtra"
                    className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  {errors.state && <p className="text-xs text-destructive mt-1">{errors.state}</p>}
                </div>

                {/* Category */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-primary">
                      {t("Category / Occupation", "श्रेणी / पेशा")} <span className="text-secondary">*</span>
                    </label>
                    {profile.category && (
                      <span className="text-[10px] font-semibold text-success flex items-center gap-1">
                        <Check className="size-3" /> {t("Reused", "पुष्ट")}
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={intakeData.category}
                    onChange={(e) => setIntakeData({ ...intakeData, category: e.target.value })}
                    placeholder="e.g. Farmer, Student, General, OBC, SC, ST"
                    className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  {errors.category && <p className="text-xs text-destructive mt-1">{errors.category}</p>}
                </div>

                {/* Additional Scheme-Relevant Field: Gender */}
                <div>
                  <label className="text-xs font-bold text-primary block mb-1">
                    {t("Gender", "लिंग")}
                  </label>
                  <select
                    value={intakeData.gender}
                    onChange={(e) => setIntakeData({ ...intakeData, gender: e.target.value })}
                    className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">{t("-- Select Gender --", "-- लिंग चुनें --")}</option>
                    <option value="Male">{t("Male", "पुरुष")}</option>
                    <option value="Female">{t("Female", "महिला")}</option>
                    <option value="Other">{t("Other", "अन्य")}</option>
                  </select>
                </div>

                {/* Additional Scheme-Relevant Field: Mobile */}
                <div>
                  <label className="text-xs font-bold text-primary block mb-1">
                    {t("Aadhaar-Linked Mobile Number", "आधार लिंक मोबाइल नंबर")}
                  </label>
                  <input
                    type="tel"
                    maxLength={10}
                    value={intakeData.mobile}
                    onChange={(e) => setIntakeData({ ...intakeData, mobile: e.target.value })}
                    placeholder="10-digit mobile number"
                    className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  {errors.mobile && <p className="text-xs text-destructive mt-1">{errors.mobile}</p>}
                </div>

                {/* Additional Scheme-Relevant Field: Father / Spouse */}
                <div>
                  <label className="text-xs font-bold text-primary block mb-1">
                    {t("Father / Spouse Name", "पिता अथवा पति का नाम")}
                  </label>
                  <input
                    type="text"
                    value={intakeData.fatherOrSpouseName}
                    onChange={(e) => setIntakeData({ ...intakeData, fatherOrSpouseName: e.target.value })}
                    placeholder={t("Legal name for official record", "आधिकारिक रिकॉर्ड हेतु नाम")}
                    className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Sensitive Government IDs Protection Notice */}
              <div className="rounded-xl border border-border bg-muted/40 p-4 text-xs text-muted-foreground flex items-start gap-3">
                <Lock className="size-4 text-secondary shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-foreground">
                    {t("Zero-Storage Privacy Policy for Sensitive Government IDs", "गोपनीय सरकारी आईडी के लिए शून्य-संग्रहण नीति")}
                  </p>
                  <p className="mt-0.5 leading-relaxed">
                    {t(
                      "YojnaSetu will never ask for or store your full 12-digit Aadhaar number, PAN card number, or bank account credentials. You will enter these securely and directly on the official government portal.",
                      "योजनासेतु कभी भी आपका 12 अंकों का आधार नंबर, पैन नंबर या बैंक पासवर्ड नहीं मांगता है। आप इन्हें सीधे आधिकारिक सरकारी पोर्टल पर सुरक्षित रूप से भरेंगे।"
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              STEP 3: OFFICIAL FORM MAPPING & SECURITY FEASIBILITY EVALUATION
              ========================================================================= */}
          {currentStep === "mapping_feasibility" && (
            <div className="space-y-6">
              {isEvaluating ? (
                <div className="flex flex-col items-center justify-center p-12 text-center">
                  <LoaderCircle className="size-10 animate-spin text-primary mb-3" />
                  <p className="text-sm font-bold text-foreground">
                    {t("Evaluating official portal security & mapping fields...", "सरकारी पोर्टल सुरक्षा व फॉर्म मैपिंग का मूल्यांकन हो रहा है...")}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("Checking portal authentication, CAPTCHA, and field schema...", "पोर्टल प्रमाणीकरण और फॉर्म संरचना जांची जा रही है...")}
                  </p>
                </div>
              ) : evaluationResult ? (
                <>
                  {/* Security Feasibility Assessment Box (Requirement 9 & 10) */}
                  <div className="rounded-xl border-2 border-border bg-card p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {evaluationResult.is_automated_filling_feasible ? (
                          <span className="flex size-7 items-center justify-center rounded-full bg-success/15 text-success">
                            <CheckCircle2 className="size-4" />
                          </span>
                        ) : (
                          <span className="flex size-7 items-center justify-center rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400">
                            <ShieldAlert className="size-4" />
                          </span>
                        )}
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            {t("Portal Feasibility Evaluation", "पोर्टल सुरक्षा मूल्यांकन")}
                          </span>
                          <h4 className="text-base font-bold text-primary">
                            {evaluationResult.is_automated_filling_feasible
                              ? t("Automated Integration Supported", "स्वचालित एकीकरण समर्थित")
                              : t("Citizen-Present Assisted Filling (No Blind Automation)", "नागरिक-उपस्थिति सहायता (सत्यापित सुरक्षा)")}
                          </h4>
                        </div>
                      </div>

                      <span className="rounded bg-muted px-2.5 py-1 text-xs font-mono font-semibold text-muted-foreground">
                        {evaluationResult.domain}
                      </span>
                    </div>

                    <p className="text-xs text-foreground/90 leading-relaxed bg-muted/40 p-3 rounded-lg border border-border/60">
                      {en ? evaluationResult.feasibility_reason.en : evaluationResult.feasibility_reason.hi}
                    </p>

                    {/* Government Security Controls List */}
                    <div>
                      <span className="text-[11px] font-bold uppercase text-muted-foreground">
                        {t("Active Portal Security Controls:", "सक्रिय सरकारी सुरक्षा नियंत्रण:")}
                      </span>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {evaluationResult.security_controls.map((ctrl, i) => (
                          <span
                            key={i}
                            className="rounded-md bg-secondary/10 text-secondary border border-secondary/20 px-2 py-0.5 text-xs font-medium"
                          >
                            {ctrl}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Official Form Field Mapping Table (Requirement 6) */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-base font-bold text-primary flex items-center gap-2">
                        <FileText className="size-4 text-secondary" />
                        {t("Official Field Mapping Table", "आधिकारिक फॉर्म फ़ील्ड मैपिंग")}
                      </h4>
                      <span className="text-xs text-muted-foreground">
                        {evaluationResult.field_mappings.filter((f) => f.status === "ready").length}/
                        {evaluationResult.field_mappings.length} {t("Fields Prepared", "फ़ील्ड तैयार")}
                      </span>
                    </div>

                    <div className="rounded-xl border border-border overflow-hidden">
                      <div className="grid grid-cols-12 bg-muted/50 p-2.5 text-xs font-bold text-primary border-b border-border">
                        <div className="col-span-5">{t("Official Portal Field", "सरकारी फॉर्म का फ़ील्ड")}</div>
                        <div className="col-span-4">{t("Your Prepared Value", "आपका तैयार विवरण")}</div>
                        <div className="col-span-3 text-right">{t("Status / Source", "स्थिति / स्रोत")}</div>
                      </div>

                      <div className="divide-y divide-border text-xs">
                        {evaluationResult.field_mappings.map((fm) => (
                          <div key={fm.field_id} className="grid grid-cols-12 p-3 items-center gap-2">
                            <div className="col-span-5">
                              <span className="font-semibold text-foreground">
                                {en ? fm.official_label_en : fm.official_label_hi}
                              </span>
                              <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                                {fm.instruction}
                              </p>
                            </div>

                            <div className="col-span-4 font-mono font-medium">
                              {fm.is_sensitive ? (
                                <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400 font-sans font-semibold text-[11px]">
                                  <Lock className="size-3" />
                                  {t("Enter on official portal", "पोर्टल पर भरें")}
                                </span>
                              ) : fm.mapped_value ? (
                                <span className="text-foreground">{fm.mapped_value}</span>
                              ) : (
                                <span className="text-muted-foreground italic font-sans">
                                  {t("Not provided (Optional)", "खाली (ऐच्छिक)")}
                                </span>
                              )}
                            </div>

                            <div className="col-span-3 text-right">
                              {fm.is_sensitive ? (
                                <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                                  {t("Security Protected", "सुरक्षा संरक्षित")}
                                </span>
                              ) : fm.status === "ready" ? (
                                <span className="rounded bg-success/15 px-2 py-0.5 text-[10px] font-bold text-success">
                                  {t("Ready to Paste", "पेस्ट हेतु तैयार")}
                                </span>
                              ) : (
                                <span className="rounded bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-400">
                                  {t("Optional", "ऐच्छिक")}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          )}

          {/* =========================================================================
              STEP 4: FINAL COMPREHENSIVE REVIEW SCREEN (Requirement 8 & 11)
              ========================================================================= */}
          {currentStep === "review" && (
            <div className="space-y-6">
              <div className="rounded-xl border border-border bg-card p-5 space-y-4">
                <div className="border-b border-border pb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-secondary">
                    {t("Step 4: Final Pre-Submission Review", "चरण 4: अंतिम पूर्व-सबमिशन समीक्षा")}
                  </span>
                  <h3 className="text-xl font-bold text-primary mt-1">
                    {en ? scheme.name : scheme.hindi_name || scheme.name}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {t(
                      "Carefully verify all values below before proceeding to the official portal.",
                      "सरकारी पोर्टल पर जाने से पहले कृपया नीचे दिए गए सभी विवरणों की पुनः पुष्टि करें।"
                    )}
                  </p>
                </div>

                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="rounded-lg bg-muted/30 p-3 border border-border/60">
                    <dt className="text-muted-foreground font-semibold">{t("Full Legal Name", "पूरा नाम")}</dt>
                    <dd className="text-sm font-bold text-primary mt-0.5">{intakeData.name || "—"}</dd>
                  </div>

                  <div className="rounded-lg bg-muted/30 p-3 border border-border/60">
                    <dt className="text-muted-foreground font-semibold">{t("Age in Years", "उम्र")}</dt>
                    <dd className="text-sm font-bold text-primary mt-0.5">{intakeData.age ? `${intakeData.age} years` : "—"}</dd>
                  </div>

                  <div className="rounded-lg bg-muted/30 p-3 border border-border/60">
                    <dt className="text-muted-foreground font-semibold">{t("Annual Family Income", "वार्षिक आय")}</dt>
                    <dd className="text-sm font-bold text-success mt-0.5">₹{Number(intakeData.income || 0).toLocaleString("en-IN")}</dd>
                  </div>

                  <div className="rounded-lg bg-muted/30 p-3 border border-border/60">
                    <dt className="text-muted-foreground font-semibold">{t("State of Domicile", "राज्य")}</dt>
                    <dd className="text-sm font-bold text-primary mt-0.5">{intakeData.state || "—"}</dd>
                  </div>

                  <div className="rounded-lg bg-muted/30 p-3 border border-border/60">
                    <dt className="text-muted-foreground font-semibold">{t("Category / Occupation", "श्रेणी")}</dt>
                    <dd className="text-sm font-bold text-primary mt-0.5">{intakeData.category || "—"}</dd>
                  </div>

                  <div className="rounded-lg bg-muted/30 p-3 border border-border/60">
                    <dt className="text-muted-foreground font-semibold">{t("Gender", "लिंग")}</dt>
                    <dd className="text-sm font-bold text-primary mt-0.5">{intakeData.gender || t("Not specified", "अनिर्दिष्ट")}</dd>
                  </div>

                  <div className="rounded-lg bg-muted/30 p-3 border border-border/60">
                    <dt className="text-muted-foreground font-semibold">{t("Aadhaar-Linked Mobile", "मोबाइल")}</dt>
                    <dd className="text-sm font-bold text-primary mt-0.5">{intakeData.mobile || t("Not provided", "उपलब्ध नहीं")}</dd>
                  </div>

                  <div className="rounded-lg bg-muted/30 p-3 border border-border/60">
                    <dt className="text-muted-foreground font-semibold">{t("Father / Spouse Name", "पिता / पति का नाम")}</dt>
                    <dd className="text-sm font-bold text-primary mt-0.5">{intakeData.fatherOrSpouseName || t("Not specified", "अनिर्दिष्ट")}</dd>
                  </div>
                </dl>

                {/* Explicit Legal / User Control Notice (Requirement 11) */}
                <div className="rounded-xl border-2 border-primary/20 bg-primary/5 p-4 text-xs text-foreground flex items-start gap-3">
                  <ShieldCheck className="size-5 text-secondary shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-primary text-sm">
                      {t("Citizen Controlled Final Submission", "नागरिक द्वारा स्वयं अंतिम सबमिशन")}
                    </h5>
                    <p className="mt-1 text-muted-foreground leading-relaxed">
                      {en
                        ? evaluationResult?.user_submission_notice?.en ||
                          "YojnaSetu will never automatically submit a government application on your behalf. Final review and submission remains entirely under your direct control."
                        : evaluationResult?.user_submission_notice?.hi ||
                          "योजनासेतु कभी भी आपकी ओर से सरकारी आवेदन स्वचालित रूप से सबमिट नहीं करता है। अंतिम समीक्षा और सबमिशन पूरी तरह से आपके नियंत्रण में रहता है।"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              STEP 5: ASSISTED PORTAL SUBMISSION BRIDGE (Requirement 9 & 10)
              ========================================================================= */}
          {currentStep === "portal_bridge" && (
            <div className="space-y-6">
              {/* Header Box with Direct Launch Button */}
              <div className="rounded-xl border-2 border-primary/30 bg-primary/5 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold uppercase text-secondary">
                    {t("Official Government Application Portal", "आधिकारिक सरकारी आवेदन पोर्टल")}
                  </span>
                  <h3 className="text-xl font-extrabold text-primary mt-0.5">
                    {scheme.officialUrl ? scheme.officialUrl.replace(/^https?:\/\//, "").split("/")[0] : "Official Portal"}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t(
                      "Click below to open the official application portal in a secure new tab.",
                      "सुरक्षित नए टैब में आधिकारिक आवेदन पोर्टल खोलने के लिए नीचे क्लिक करें।"
                    )}
                  </p>
                </div>

                <a
                  href={scheme.officialUrl || "https://india.gov.in"}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-md hover:bg-primary/90 transition-all shrink-0"
                >
                  <span>{t("Launch Official Portal", "सरकारी पोर्टल खोलें")}</span>
                  <ExternalLink className="size-4" />
                </a>
              </div>

              {/* 1-Click Clipboard Field Transfer Helper */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-bold text-primary flex items-center gap-2">
                    <Copy className="size-4 text-secondary" />
                    {t("1-Click Copy Transfer Helper", "1-क्लिक कॉपी सहायक")}
                  </h4>
                  <span className="text-xs text-muted-foreground">
                    {t("Click 'Copy' to paste without typos", "टाइपिंग त्रुटि से बचने हेतु कॉपी करें")}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    { id: "copy-name", label: t("Full Name", "पूरा नाम"), value: intakeData.name },
                    { id: "copy-age", label: t("Age", "उम्र"), value: intakeData.age },
                    { id: "copy-income", label: t("Income", "वार्षिक आय"), value: intakeData.income },
                    { id: "copy-state", label: t("State", "राज्य"), value: intakeData.state },
                    { id: "copy-category", label: t("Category", "श्रेणी"), value: intakeData.category },
                    { id: "copy-mobile", label: t("Mobile", "मोबाइल नंबर"), value: intakeData.mobile },
                    { id: "copy-father", label: t("Father/Spouse", "पिता/पति का नाम"), value: intakeData.fatherOrSpouseName },
                  ]
                    .filter((item) => item.value && item.value.trim().length > 0)
                    .map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between rounded-xl border border-border bg-card p-3 text-xs"
                      >
                        <div className="truncate mr-2">
                          <span className="text-muted-foreground block text-[10px] font-semibold uppercase">{item.label}</span>
                          <span className="font-bold text-foreground text-sm truncate block">{item.value}</span>
                        </div>
                        <Button
                          size="sm"
                          variant={copiedFieldId === item.id ? "secondary" : "outline"}
                          onClick={() => handleCopy(item.id, item.value)}
                          className="h-8 px-3 text-xs font-bold gap-1.5 shrink-0"
                        >
                          {copiedFieldId === item.id ? (
                            <>
                              <Check className="size-3 text-success" />
                              <span>{t("Copied!", "कॉपी हुआ!")}</span>
                            </>
                          ) : (
                            <>
                              <Copy className="size-3" />
                              <span>{t("Copy", "कॉपी")}</span>
                            </>
                          )}
                        </Button>
                      </div>
                    ))}
                </div>
              </div>

              {/* Step-by-Step Portal Navigation Guide */}
              {evaluationResult?.submission_instructions && (
                <div className="space-y-3 pt-2">
                  <h4 className="text-base font-bold text-primary">
                    {t("Official Application Submission Steps", "आधिकारिक पोर्टल पर आवेदन के चरण")}
                  </h4>

                  <div className="space-y-2.5">
                    {evaluationResult.submission_instructions.map((ins) => (
                      <div
                        key={ins.step}
                        className="flex items-start gap-3 rounded-xl border border-border/80 bg-muted/20 p-3.5 text-xs"
                      >
                        <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-secondary/20 text-secondary font-bold">
                          {ins.step}
                        </div>
                        <div>
                          <p className="font-bold text-primary text-sm">
                            {en ? ins.title_en : ins.title_hi}
                          </p>
                          <p className="text-muted-foreground mt-0.5 leading-relaxed">
                            {en ? ins.desc_en : ins.desc_hi}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="flex items-center justify-between border-t border-border bg-muted/30 px-5 py-4">
          {currentStep === "overview_docs" ? (
            <Button variant="ghost" onClick={onClose} className="text-sm font-semibold">
              {t("Cancel", "रद्द करें")}
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={() => {
                const prevMap: Record<WizardStep, WizardStep> = {
                  overview_docs: "overview_docs",
                  intake_fields: "overview_docs",
                  mapping_feasibility: "intake_fields",
                  review: "mapping_feasibility",
                  portal_bridge: "review",
                };
                setCurrentStep(prevMap[currentStep]);
              }}
              className="gap-1.5 text-sm font-semibold"
            >
              <ArrowLeft className="size-4" />
              <span>{t("Previous", "पिछला")}</span>
            </Button>
          )}

          <div className="flex items-center gap-2">
            {currentStep === "overview_docs" && (
              <Button
                onClick={() => setCurrentStep("intake_fields")}
                className="gap-2 font-bold shadow-md bg-primary text-primary-foreground"
              >
                <span>{t("Continue to Intake", "विवरण भरें")}</span>
                <ArrowRight className="size-4" />
              </Button>
            )}

            {currentStep === "intake_fields" && (
              <Button
                onClick={handleProceedToMapping}
                className="gap-2 font-bold shadow-md bg-primary text-primary-foreground"
              >
                <span>{t("Map Official Form Fields", "फॉर्म मैपिंग देखें")}</span>
                <ArrowRight className="size-4" />
              </Button>
            )}

            {currentStep === "mapping_feasibility" && (
              <Button
                onClick={() => setCurrentStep("review")}
                className="gap-2 font-bold shadow-md bg-primary text-primary-foreground"
              >
                <span>{t("Proceed to Review", "समीक्षा पर जाएं")}</span>
                <ArrowRight className="size-4" />
              </Button>
            )}

            {currentStep === "review" && (
              <Button
                onClick={() => setCurrentStep("portal_bridge")}
                className="gap-2 font-bold shadow-md bg-primary text-primary-foreground"
              >
                <span>{t("Continue to Portal Assistant", "पोर्टल सहायक पर जाएं")}</span>
                <ArrowRight className="size-4" />
              </Button>
            )}

            {currentStep === "portal_bridge" && (
              <Button
                variant="outline"
                onClick={onClose}
                className="font-bold text-sm"
              >
                {t("Finish & Close", "पूर्ण एवं बंद करें")}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
