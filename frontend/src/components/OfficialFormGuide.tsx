import { useEffect, useState } from "react";
import {
  FileText,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  AlertCircle,
  CheckCircle2,
  Lock,
  Download,
  Printer,
  ArrowLeft,
  Info,
  Layers,
  FileCheck,
  Sparkles,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Lang } from "@/components/SiteHeader";
import type { Profile } from "@/lib/welfare-demo";
import type { DbScheme } from "@/services/schemeService";
import { InteractiveGuidedPdfViewer } from "@/components/InteractiveGuidedPdfViewer";
import {
  getOfficialFormTemplate,
  getConfirmedHelperReference,
  type OfficialFormTemplate,
  type OfficialFormField,
} from "@/services/formTemplateService";

interface OfficialFormGuideProps {
  scheme: DbScheme;
  profile: Profile;
  lang: Lang;
  onBackToEligibility: () => void;
  onOpenPortalBridge: () => void;
  onSwitchToDraftView?: () => void;
}

export function OfficialFormGuide({
  scheme,
  profile,
  lang,
  onBackToEligibility,
  onOpenPortalBridge,
  onSwitchToDraftView,
}: OfficialFormGuideProps) {
  const [template, setTemplate] = useState<OfficialFormTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<"all" | "mandatory" | "sensitive" | "docs">("all");
  const [viewMode, setViewMode] = useState<"interactive_pdf" | "field_checklist">("interactive_pdf");

  const en = lang === "en";
  const t = (english: string, hindi: string) => (en ? english : hindi);

  useEffect(() => {
    let isMounted = true;
    async function loadTemplate() {
      setLoading(true);
      try {
        const data = await getOfficialFormTemplate(scheme.id, scheme.name);
        if (isMounted) setTemplate(data);
      } catch (err) {
        console.error("Failed to load official form template:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadTemplate();
    return () => {
      isMounted = false;
    };
  }, [scheme.id, scheme.name]);

  if (loading || !template) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <div className="size-10 animate-spin rounded-full border-4 border-primary border-t-transparent mb-4" />
        <p className="text-base font-semibold text-muted-foreground">
          {t("Loading official application form guide...", "आधिकारिक आवेदन प्रपत्र मार्गदर्शिका लोड हो रही है...")}
        </p>
      </div>
    );
  }

  const isVerified = template.verification_status === "verified";
  const fields = template.fields || [];

  const mandatoryFields = fields.filter((f) => f.required_status);
  const sensitiveFields = fields.filter((f) => f.is_sensitive_id);

  // Group fields by section name
  const filteredFields = fields.filter((field) => {
    if (activeFilter === "mandatory") return field.required_status;
    if (activeFilter === "sensitive") return field.is_sensitive_id;
    return true;
  });

  const sectionNames = Array.from(new Set(filteredFields.map((f) => en ? f.section_name.en : f.section_name.hi)));

  return (
    <div className="space-y-6">
      {/* -------------------------------------------------------------
          TOP BAR & NAVIGATION BREADCRUMB
          ------------------------------------------------------------- */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBackToEligibility}
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          <span>{t("Back to Eligibility Result", "पात्रता परिणाम पर वापस")}</span>
        </Button>

        <div className="flex items-center gap-2">
          {onSwitchToDraftView && (
            <Button
              variant="outline"
              size="sm"
              onClick={onSwitchToDraftView}
              className="gap-1.5 text-xs font-semibold"
            >
              <FileText className="size-3.5" />
              <span>{t("Switch to Offline PDF Draft", "ड्राफ्ट PDF देखें")}</span>
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="gap-1.5 text-xs font-semibold"
          >
            <Printer className="size-3.5" />
            <span>{t("Print Guide", "गाइड प्रिंट करें")}</span>
          </Button>

          <Button
            size="sm"
            onClick={onOpenPortalBridge}
            className="gap-1.5 text-xs font-bold bg-primary text-primary-foreground shadow"
          >
            <span>{t("Proceed to Official Portal", "सरकारी पोर्टल पर जाएं")}</span>
            <ExternalLink className="size-3.5" />
          </Button>
        </div>
      </div>

      {/* -------------------------------------------------------------
          OFFICIAL FORM HEADER CARD
          ------------------------------------------------------------- */}
      <header className="rounded-2xl border-2 border-primary/20 bg-card p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary uppercase tracking-wider">
                {t("Official Application Form Guide", "आधिकारिक आवेदन प्रपत्र मार्गदर्शिका")}
              </span>

              {isVerified ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="size-3.5" />
                  {t("Verified Official Form", "सत्यापित सरकारी प्रपत्र")}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 px-3 py-0.5 text-xs font-bold text-amber-700 dark:text-amber-400">
                  <AlertCircle className="size-3.5" />
                  {t("Form Guide Pending Verification", "सत्यापन प्रक्रियाधीन")}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-primary leading-tight">
              {en ? scheme.name : scheme.hindi_name || scheme.name}
            </h1>

            <p className="text-base sm:text-lg font-semibold text-foreground/90">
              {template.official_form_title}
            </p>

            <p className="text-xs sm:text-sm text-muted-foreground">
              <span className="font-semibold text-foreground/80">{t("Issuing Authority:", "जारीकर्ता प्राधिकारी:")}</span>{" "}
              {template.published_authority}
            </p>
          </div>

          {/* Blank Form Download / Interactive Form Action Box */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0 md:w-64">
            {template.blank_pdf_url ? (
              <>
                <Button
                  onClick={() => setViewMode("interactive_pdf")}
                  className={`gap-2 font-bold text-xs shadow-sm ${
                    viewMode === "interactive_pdf"
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "bg-accent hover:bg-accent/80 text-primary border border-primary/20"
                  }`}
                >
                  <FileText className="size-3.5 shrink-0" />
                  <span>{t("Open Interactive Guided Form", "इंटरएक्टिव फॉर्म गाइड खोलें")}</span>
                </Button>

                <a
                  href={template.blank_pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-card hover:bg-muted/60 px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors text-center"
                >
                  <Download className="size-3.5 shrink-0" />
                  <span>{t("Download Blank Form (PDF)", "मूल खाली फॉर्म (PDF)")}</span>
                </a>
              </>
            ) : (
              <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-center">
                <p className="text-xs font-bold text-amber-800 dark:text-amber-300">
                  {t("Application form guide is not available yet", "आवेदन प्रपत्र मार्गदर्शिका अभी उपलब्ध नहीं है")}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {t("Official blank PDF has not been uploaded yet.", "आधिकारिक खाली फॉर्म PDF अभी अपलोड नहीं हुआ है।")}
                </p>
              </div>
            )}

            <p className="text-[11px] text-center text-muted-foreground">
              {template.blank_pdf_url
                ? t("Official blank layout uploaded in Supabase Storage.", "सुपाबेस स्टोरेज में अपलोड किया गया आधिकारिक खाली फॉर्म।")
                : t("Awaiting official application form upload.", "आधिकारिक आवेदन फॉर्म अपलोड की प्रतीक्षा है।")}
            </p>
          </div>
        </div>

        {/* Source Reference Link */}
        <div className="mt-4 pt-4 border-t border-border flex flex-wrap items-center justify-between text-xs text-muted-foreground gap-2">
          <div className="flex items-center gap-1.5">
            <Info className="size-3.5 text-primary" />
            <span>{t("Verified Official Source:", "सत्यापित आधिकारिक स्रोत:")}</span>
            <a
              href={template.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-primary underline hover:text-primary/80 truncate max-w-xs sm:max-w-md"
            >
              {template.source_url}
            </a>
          </div>

          <span className="font-semibold text-foreground/80">
            {isVerified ? t(`${fields.length} Official Form Fields Documented`, `${fields.length} आधिकारिक फ़ील्ड प्रलेखित`) : t("Layout Under Verification", "प्रारूप सत्यापन प्रक्रियाधीन")}
          </span>
        </div>
      </header>

      {/* -------------------------------------------------------------
          VIEW MODE TOGGLE: Interactive Blank PDF (Primary) vs Checklist
          ------------------------------------------------------------- */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
        <div className="flex rounded-xl bg-muted/60 p-1 border border-border">
          <button
            type="button"
            onClick={() => setViewMode("interactive_pdf")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs sm:text-sm font-bold transition-all ${
              viewMode === "interactive_pdf"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <FileText className="size-4" />
            <span>{t("Interactive Blank PDF Guide", "इंटरएक्टिव खाली फॉर्म गाइड (PDF)")}</span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                viewMode === "interactive_pdf"
                  ? "bg-white/20 text-white"
                  : "bg-primary/10 text-primary"
              }`}
            >
              {t("Recommended", "अनुशंसित")}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode("field_checklist")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs sm:text-sm font-bold transition-all ${
              viewMode === "field_checklist"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Layers className="size-4" />
            <span>{t("Field-by-Field Checklist", "फ़ील्ड विवरण व चेकलिस्ट")}</span>
          </button>
        </div>

        <p className="text-xs text-muted-foreground">
          {viewMode === "interactive_pdf"
            ? t(
                "Guiding pins positioned beside fields on the actual blank document",
                "मूल रिक्त दस्तावेज़ के फ़ील्ड्स पर सीधे पिन किए गए निर्देश"
              )
            : t(
                "Complete field directory and document checklist",
                "संपूर्ण फ़ील्ड विवरण एवं दस्तावेज़ चेकलिस्ट"
              )}
        </p>
      </div>

      {viewMode === "interactive_pdf" ? (
        <InteractiveGuidedPdfViewer
          schemeId={scheme.id}
          schemeName={scheme.name}
          profile={profile}
          lang={lang}
          onOpenPortalBridge={onOpenPortalBridge}
          onBackToEligibility={onBackToEligibility}
        />
      ) : (
        <>
          {/* -------------------------------------------------------------
              CRITICAL PRIVACY GUARANTEE BANNER (Sensitive Government ID Protection)
              ------------------------------------------------------------- */}
          <section className="rounded-xl border-2 border-indigo-500/30 bg-indigo-50/50 dark:bg-indigo-950/20 p-4 sm:p-5 shadow-sm">
            <div className="flex items-start gap-3">
          <div className="rounded-full bg-indigo-500/15 p-2 text-indigo-700 dark:text-indigo-400 shrink-0 mt-0.5">
            <ShieldCheck className="size-5" />
          </div>
          <div className="space-y-1">
            <h2 className="text-sm sm:text-base font-bold text-indigo-900 dark:text-indigo-200">
              {t(
                "Privacy & Security Guarantee: SchemeSetu Never Collects Government ID Numbers",
                "गोपनीयता सुरक्षा गारंटी: योजनासेतु सरकारी पहचान संख्या एकत्र नहीं करता"
              )}
            </h2>
            <p className="text-xs sm:text-sm text-indigo-950/80 dark:text-indigo-200/80 leading-relaxed">
              {t(
                "The official government form will request sensitive credentials such as your Aadhaar Number, Bank Account Number, or Samagra ID. This guide explains what the form expects and what documents to have ready, but SchemeSetu will NEVER ask you to disclose or store these numbers here. Always enter them directly on the official government website.",
                "सरकारी आवेदन पत्र में आधार संख्या, बैंक खाता संख्या या समग्र आईडी की आवश्यकता होगी। यह मार्गदर्शिका बताती है कि फॉर्म में क्या आवश्यक है, परंतु योजनासेतु आपसे यह गोपनीय नंबर कभी नहीं मांगता। इन्हें सदैव केवल आधिकारिक सरकारी पोर्टल पर ही दर्ज करें।"
              )}
            </p>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------
          USER CONFIRMED DETAILS SUMMARY STRIP (Non-sensitive helper)
          ------------------------------------------------------------- */}
      {(profile.name || profile.age || profile.state || profile.income || profile.category) && (
        <div className="rounded-xl border border-border bg-card p-4 text-xs sm:text-sm">
          <div className="flex items-center gap-2 mb-2 font-bold text-primary">
            <Sparkles className="size-4 text-secondary" />
            <span>{t("Your Confirmed Intake Details (From Eligibility Check):", "आपकी पुष्ट जानकारी (पात्रता जांच से):")}</span>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            {profile.name && (
              <span className="rounded-lg bg-accent px-2.5 py-1 border border-border text-foreground font-medium">
                {t("Name:", "नाम:")} <strong className="text-primary">{profile.name}</strong>
              </span>
            )}
            {profile.age && (
              <span className="rounded-lg bg-accent px-2.5 py-1 border border-border text-foreground font-medium">
                {t("Age:", "उम्र:")} <strong className="text-primary">{profile.age} yrs</strong>
              </span>
            )}
            {profile.state && profile.state !== "All States" && (
              <span className="rounded-lg bg-accent px-2.5 py-1 border border-border text-foreground font-medium">
                {t("State:", "राज्य:")} <strong className="text-primary">{profile.state}</strong>
              </span>
            )}
            {profile.category && (
              <span className="rounded-lg bg-accent px-2.5 py-1 border border-border text-foreground font-medium">
                {t("Category:", "श्रेणी:")} <strong className="text-primary">{profile.category}</strong>
              </span>
            )}
            {profile.income && (
              <span className="rounded-lg bg-accent px-2.5 py-1 border border-border text-foreground font-medium">
                {t("Income:", "आय:")} <strong className="text-primary">₹{Number(profile.income).toLocaleString("en-IN")}</strong>
              </span>
            )}
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">
            {t(
              "These non-sensitive confirmed details are displayed as helper notes below so you know exactly which field on the official form they correspond to.",
              "ये गैर-संवेदनशील विवरण नीचे सहायक नोट्स के रूप में दिखाए गए हैं ताकि आप जान सकें कि आधिकारिक फॉर्म में इन्हें कहाँ भरना है।"
            )}
          </p>
        </div>
      )}

      {/* -------------------------------------------------------------
          KEY GENERAL STEPS ACCORDION
          ------------------------------------------------------------- */}
      {template.general_steps.length > 0 && (
        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-base font-bold text-primary mb-3 flex items-center gap-2">
            <Layers className="size-4 text-secondary" />
            <span>{t("How to Complete the Official Form (Step-by-Step)", "आधिकारिक फॉर्म भरने की प्रक्रिया (क्रमवार)")}</span>
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {template.general_steps.map((step, idx) => (
              <div key={idx} className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {idx + 1}
                </span>
                <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed">
                  {en ? step.en : step.hi}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* -------------------------------------------------------------
          FILTER TABS FOR OFFICIAL FIELDS
          ------------------------------------------------------------- */}
      {isVerified && fields.length > 0 ? (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setActiveFilter("all")}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all border ${
                  activeFilter === "all"
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-card text-muted-foreground border-border hover:bg-muted hover:text-foreground"
                }`}
              >
                {t("All Official Fields", "सभी फ़ील्ड")} ({fields.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveFilter("mandatory")}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all border ${
                  activeFilter === "mandatory"
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-card text-muted-foreground border-border hover:bg-muted hover:text-foreground"
                }`}
              >
                {t("Mandatory Only", "अनिवार्य फ़ील्ड")} ({mandatoryFields.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveFilter("sensitive")}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all border ${
                  activeFilter === "sensitive"
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                    : "bg-card text-muted-foreground border-border hover:bg-muted hover:text-foreground"
                }`}
              >
                <Lock className="inline-block size-3 mr-1" />
                {t("Identity & Banking (Direct)", "पहचान व बैंक (सीधे भरें)")} ({sensitiveFields.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveFilter("docs")}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all border ${
                  activeFilter === "docs"
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-card text-muted-foreground border-border hover:bg-muted hover:text-foreground"
                }`}
              >
                <FileCheck className="inline-block size-3 mr-1" />
                {t("Documents Needed", "आवश्यक दस्तावेज")} ({template.key_documents_needed.length})
              </button>
            </div>

            <span className="text-xs text-muted-foreground font-medium">
              {t("Organized by Official Form Layout", "आधिकारिक फॉर्म के अनुसार क्रमबद्ध")}
            </span>
          </div>

          {/* VIEW: DOCUMENTS CHECKLIST */}
          {activeFilter === "docs" && (
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                <FileCheck className="size-5 text-success" />
                <span>{t("Checklist: Documents to Keep Ready", "जांच सूची: आवश्यक दस्तावेज जो साथ रखने हैं")}</span>
              </h2>
              <div className="space-y-3">
                {template.key_documents_needed.map((doc, idx) => (
                  <div key={idx} className="flex items-start gap-3 rounded-lg border border-border bg-muted/40 p-3.5">
                    <CheckCircle2 className="size-5 text-success shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-foreground">{en ? doc.en : doc.hi}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {t("Required for biometric, online upload, or physical verification.", "बायोमेट्रिक, ऑनलाइन अपलोड या भौतिक सत्यापन हेतु आवश्यक।")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW: OFFICIAL FORM FIELDS */}
          {activeFilter !== "docs" && (
            <div className="space-y-8">
              {sectionNames.map((section) => {
                const sectionFields = filteredFields.filter((f) => (en ? f.section_name.en : f.section_name.hi) === section);
                if (sectionFields.length === 0) return null;

                return (
                  <div key={section} className="space-y-4">
                    {/* Section Header */}
                    <div className="flex items-center gap-3 border-b-2 border-primary/20 pb-2">
                      <div className="size-2 rounded-full bg-primary" />
                      <h2 className="text-lg font-bold text-primary tracking-wide">{section}</h2>
                      <span className="text-xs font-semibold text-muted-foreground">
                        ({sectionFields.length} {t("fields", "फ़ील्ड")})
                      </span>
                    </div>

                    {/* Field Cards */}
                    <div className="grid gap-4 sm:grid-cols-1">
                      {sectionFields.map((field) => {
                        const helper = getConfirmedHelperReference(field, profile);

                        return (
                          <div
                            key={field.id}
                            className={`rounded-xl border p-5 transition-all shadow-sm ${
                              field.is_sensitive_id
                                ? "border-indigo-500/40 bg-indigo-50/30 dark:bg-indigo-950/20"
                                : "border-border bg-card hover:border-primary/40"
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                              {/* Order & Official Label */}
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-bold text-muted-foreground">
                                  #{field.display_order}
                                </span>

                                <h3 className="text-base sm:text-lg font-bold text-foreground">
                                  {en ? field.field_label.en : field.field_label.hi}
                                </h3>

                                {field.required_status ? (
                                  <span className="rounded bg-destructive/15 text-destructive px-2 py-0.5 text-[10px] font-extrabold uppercase">
                                    {t("Mandatory", "अनिवार्य")}
                                  </span>
                                ) : (
                                  <span className="rounded bg-muted text-muted-foreground px-2 py-0.5 text-[10px] font-bold uppercase">
                                    {t("Optional", "वैकल्पिक")}
                                  </span>
                                )}

                                <span className="rounded bg-accent text-accent-foreground px-2 py-0.5 text-[10px] font-semibold uppercase">
                                  {field.field_type}
                                </span>
                              </div>

                              {/* Form location note */}
                              <span className="text-[11px] text-muted-foreground italic sm:text-right">
                                {field.source_note}
                              </span>
                            </div>

                            {/* User-facing instruction */}
                            <p className="text-sm text-foreground/90 leading-relaxed font-medium mt-1">
                              {en ? field.field_instruction.en : field.field_instruction.hi}
                            </p>

                            {/* Accepted format */}
                            {field.accepted_format && (
                              <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1.5">
                                <span className="font-semibold text-foreground/80">{t("Accepted Format:", "स्वीकृत प्रारूप:")}</span>
                                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-primary">
                                  {field.accepted_format}
                                </code>
                              </div>
                            )}

                            {/* Common mistake callout */}
                            {field.common_mistake && (
                              <div className="mt-2 rounded-lg bg-amber-500/10 border border-amber-500/20 p-2.5 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
                                <AlertCircle className="size-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                                <div>
                                  <span className="font-bold">{t("Common Mistake:", "सामान्य गलती:")} </span>
                                  <span>{en ? field.common_mistake.en : field.common_mistake.hi}</span>
                                </div>
                              </div>
                            )}

                            {/* Sensitive ID Security Notice */}
                            {field.is_sensitive_id && (
                              <div className="mt-3 rounded-lg border-2 border-indigo-400/40 bg-indigo-100/60 dark:bg-indigo-900/40 p-3 text-xs text-indigo-950 dark:text-indigo-100 space-y-1.5">
                                <div className="flex items-center gap-1.5 font-bold text-indigo-900 dark:text-indigo-200">
                                  <Lock className="size-3.5 text-indigo-700 dark:text-indigo-400" />
                                  <span>
                                    {t(
                                      "Enter this directly on the official portal. SchemeSetu does not collect or store your government ID numbers.",
                                      "इसे सीधे सरकारी पोर्टल पर भरें। योजनासेतु आपके सरकारी पहचान नंबर एकत्र या संग्रहीत नहीं करता।"
                                    )}
                                  </span>
                                </div>
                                {field.sensitive_help?.documentNeeded && (
                                  <p className="text-[11px] text-indigo-900/80 dark:text-indigo-200/80">
                                    <span className="font-semibold">{t("Document to have ready:", "साथ में तैयार रखने योग्य दस्तावेज:")}</span>{" "}
                                    {field.sensitive_help.documentNeeded}
                                  </p>
                                )}
                              </div>
                            )}

                            {/* Confirmed Value Reference Note (Non-sensitive only) */}
                            {helper && (
                              <div className="mt-3 inline-flex items-center gap-2 rounded-lg bg-success/10 border border-success/30 px-3 py-1.5 text-xs font-semibold text-success">
                                <Sparkles className="size-3.5 shrink-0" />
                                <span>{en ? helper.label.en : helper.label.hi}</span>
                                <strong className="underline underline-offset-2">{helper.value}</strong>
                                <span className="text-[11px] font-normal text-foreground/70">
                                  {t("— enter this in this field", "— इस फ़ील्ड में यह भरें")}
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* PENDING VERIFICATION NOTICE */
        <div className="rounded-2xl border-2 border-amber-500/40 bg-amber-500/5 p-8 text-center space-y-4">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-400">
            <HelpCircle className="size-7" />
          </div>
          <h2 className="text-xl font-bold text-amber-900 dark:text-amber-200">
            {t("Application form guide is not available yet", "आवेदन प्रपत्र मार्गदर्शिका अभी उपलब्ध नहीं है")}
          </h2>
          <p className="text-sm text-foreground/80 max-w-xl mx-auto leading-relaxed">
            {t(
              "The official blank application form for this scheme is not available in the repository yet. SchemeSetu strictly avoids displaying fabricated or unverified form fields.",
              "इस योजना का आधिकारिक खाली फॉर्म अभी रिपॉजिटरी में उपलब्ध नहीं है। योजनासेतु कभी भी काल्पनिक या असत्यापित फ़ील्ड प्रदर्शित नहीं करता।"
            )}
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <a
              href={template.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow"
            >
              <span>{t("Visit Official Department Portal", "विभागीय पोर्टल पर जाएं")}</span>
              <ExternalLink className="size-4" />
            </a>
          </div>
        </div>
      )}
        </>
      )}

      {/* -------------------------------------------------------------
          BOTTOM ACTION PANEL
          ------------------------------------------------------------- */}
      <footer className="rounded-2xl border border-border bg-card p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-primary">
            {t("Ready to submit your application?", "क्या आप आवेदन करने के लिए तैयार हैं?")}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t(
              "Open the official verified government portal or take this printed guide to your nearest Common Service Centre (CSC).",
              "आधिकारिक सरकारी पोर्टल खोलें या इस प्रिंटेड गाइड को लेकर नजदीकी जनसेवा केंद्र (CSC) पर जाएं।"
            )}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={onBackToEligibility}
            className="flex-1 sm:flex-none text-xs font-semibold"
          >
            <ArrowLeft className="size-3.5" />
            <span>{t("Back", "पीछे")}</span>
          </Button>

          <Button
            onClick={onOpenPortalBridge}
            className="flex-1 sm:flex-none text-xs font-bold bg-primary text-primary-foreground shadow gap-1.5"
          >
            <span>{t("Apply on Official Portal", "सरकारी पोर्टल पर आवेदन करें")}</span>
            <ExternalLink className="size-3.5" />
          </Button>
        </div>
      </footer>
    </div>
  );
}
