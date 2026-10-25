import { useState } from "react";
import {
  ExternalLink,
  ShieldCheck,
  Copy,
  Check,
  AlertCircle,
  Lock,
  ArrowRight,
  Info,
  X,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DbScheme } from "@/services/schemeService";
import type { Profile } from "@/lib/welfare-demo";
import type { Lang } from "@/components/SiteHeader";
import {
  getOfficialPortalInfo,
  copyToClipboard,
} from "@/services/officialPortalService";

interface OfficialPortalBridgeProps {
  scheme: DbScheme;
  profile: Profile;
  lang: Lang;
  isOpen: boolean;
  onClose: () => void;
  onContinueToDraft?: () => void;
}

export function OfficialPortalBridge({
  scheme,
  profile,
  lang,
  isOpen,
  onClose,
  onContinueToDraft,
}: OfficialPortalBridgeProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const en = lang === "en";
  const t = (english: string, hindi: string) => (en ? english : hindi);

  if (!isOpen) return null;

  const portalInfo = getOfficialPortalInfo(scheme.id, scheme.name);

  async function handleCopy(fieldName: string, text: string) {
    if (!text) return;
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2200);
    }
  }

  const copyableFields: { id: string; labelEn: string; labelHi: string; value: string }[] = [
    {
      id: "name",
      labelEn: "Full Name",
      labelHi: "पूरा नाम",
      value: profile.name || "",
    },
    {
      id: "age",
      labelEn: "Age (Years)",
      labelHi: "उम्र (वर्ष)",
      value: profile.age || "",
    },
    {
      id: "income",
      labelEn: "Annual Family Income (₹)",
      labelHi: "वार्षिक पारिवारिक आय (₹)",
      value: profile.income ? `₹${Number(profile.income).toLocaleString("en-IN")}` : "",
    },
    {
      id: "state",
      labelEn: "State of Domicile",
      labelHi: "राज्य",
      value: profile.state || "",
    },
    {
      id: "category",
      labelEn: "Category / Occupation",
      labelHi: "श्रेणी / पेशा",
      value: profile.category || "",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl border-2 border-border bg-card shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border p-5 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Lock className="size-5 text-secondary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-secondary">
                  {t("Official Application Bridge", "आधिकारिक आवेदन सेतु")}
                </span>
                <span className="inline-flex items-center gap-1 rounded bg-success/15 px-2 py-0.5 text-[11px] font-bold text-success">
                  <ShieldCheck className="size-3" />
                  {portalInfo.domain}
                </span>
              </div>
              <h2 className="text-xl font-extrabold text-primary sm:text-2xl">
                {en ? scheme.name : scheme.hindi_name || scheme.name}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Important Exit Notice (Requirement 2) */}
          <div className="rounded-xl border border-secondary/40 bg-secondary/10 p-4 text-sm leading-relaxed">
            <div className="flex items-start gap-3">
              <Info className="size-5 text-secondary shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-secondary">
                  {t(
                    "You are now preparing to visit the official government portal",
                    "आप आधिकारिक सरकारी पोर्टल पर जाने की तैयारी कर रहे हैं"
                  )}
                </p>
                <p className="mt-1 text-xs text-foreground/90">
                  {t(
                    `SchemeSetu is an independent student guidance tool. Government applications must be submitted directly on the official portal (${portalInfo.domain}). Your confirmed details remain saved in SchemeSetu so you never have to re-enter them.`,
                    `योजनासेतु एक स्वतंत्र मार्गदर्शन उपकरण है। सरकारी योजनाओं का आवेदन आधिकारिक पोर्टल (${portalInfo.domain}) पर ही किया जाना चाहिए। आपके पुष्ट विवरण योजनासेतु में सुरक्षित रहेंगे।`
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Automated Filling Technical Feasibility Note (Requirement 3 & 4) */}
          <div className="rounded-xl border border-border bg-muted/40 p-4 text-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold uppercase tracking-wider text-muted-foreground">
                {t("Automation Feasibility Assessment", "स्वचालन व्यवहार्यता जांच")}
              </span>
              <span className="rounded bg-amber-500/15 text-amber-800 dark:text-amber-300 font-bold px-2 py-0.5">
                {t("Guided 1-Click Copy Assistant", "सहायता प्राप्त कॉपी-पेस्ट")}
              </span>
            </div>
            <p className="text-foreground/90 leading-relaxed">
              {en ? portalInfo.feasibilityReason.en : portalInfo.feasibilityReason.hi}
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {portalInfo.securityControls.map((sc, i) => (
                <span
                  key={i}
                  className="rounded bg-card border border-border/80 px-2 py-0.5 font-medium text-[11px] text-muted-foreground"
                >
                  🔒 {sc}
                </span>
              ))}
            </div>
          </div>

          {/* 1-Click Copy Preparation Panel (Requirement 4) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-primary">
                {t("Your Confirmed Details (1-Click Copy)", "आपके पुष्ट विवरण (1-क्लिक कॉपी)")}
              </h3>
              <span className="text-[11px] text-muted-foreground font-medium">
                {t("Click any field to copy to clipboard", "कॉपी करने के लिए क्लिक करें")}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {copyableFields.map(({ id, labelEn, labelHi, value }) => (
                <div
                  key={id}
                  className="flex items-center justify-between rounded-xl border border-border bg-card p-3 shadow-sm hover:border-primary/40 transition-colors"
                >
                  <div className="min-w-0 pr-2">
                    <p className="text-[11px] font-bold text-muted-foreground uppercase">{t(labelEn, labelHi)}</p>
                    <p className="truncate text-sm font-bold text-primary">
                      {value || <span className="italic text-muted-foreground font-normal">{t("Not provided", "उपलब्ध नहीं")}</span>}
                    </p>
                  </div>

                  <Button
                    type="button"
                    variant={copiedField === id ? "default" : "outline"}
                    size="sm"
                    disabled={!value}
                    onClick={() => handleCopy(id, value)}
                    className="h-8 shrink-0 px-2.5 text-xs font-semibold gap-1"
                  >
                    {copiedField === id ? (
                      <>
                        <Check className="size-3 text-success" />
                        <span className="text-success font-bold">{t("Copied!", "कॉपी हुआ!")}</span>
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

          {/* Official Portal Guidance Steps */}
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary mb-3">
              {t("Steps on Official Government Portal:", "आधिकारिक पोर्टल पर करने योग्य चरण:")}
            </h3>
            <ol className="space-y-2 text-xs text-foreground/90">
              {portalInfo.guidanceSteps.map((step, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-secondary/15 font-bold text-secondary text-[11px]">
                    {idx + 1}
                  </span>
                  <span className="mt-0.5 leading-relaxed">{en ? step.en : step.hi}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="border-t border-border p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 bg-muted/20 rounded-b-2xl">
          {onContinueToDraft && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onClose();
                onContinueToDraft();
              }}
              className="w-full sm:w-auto text-sm"
            >
              <FileText className="size-4" />
              {t("Prepare Offline PDF Draft Instead", "ऑफ़लाइन ड्राफ्ट PDF तैयार करें")}
            </Button>
          )}

          <div className="flex w-full sm:w-auto items-center gap-2 justify-end">
            <Button type="button" variant="ghost" onClick={onClose} className="text-sm">
              {t("Cancel", "रद्द करें")}
            </Button>

            <a
              href={portalInfo.directApplicationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full sm:w-auto"
            >
              <Button type="button" className="w-full h-auto min-h-12 px-5 text-base font-bold shadow-md gap-2">
                <span>{t(`Apply on ${portalInfo.domain}`, `${portalInfo.domain} पर आवेदन करें`)}</span>
                <ExternalLink className="size-4" />
              </Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
