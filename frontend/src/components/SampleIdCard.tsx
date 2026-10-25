import { ShieldCheck, UserRound, Lock } from "lucide-react";
import portrait from "@/assets/sample-portrait.jpg";
import { maskAadhaar } from "@/lib/welfare-demo";

export interface SampleIdCardProps {
  customPreviewUrl?: string | null | undefined;
  maskedAadhaar?: string | undefined;
  extractedName?: string | undefined;
  extractedAge?: string | undefined;
  extractedState?: string | undefined;
  isRealScan?: boolean | undefined;
}

export function SampleIdCard({
  customPreviewUrl,
  maskedAadhaar: customMasked,
  extractedName,
  extractedAge,
  extractedState,
  isRealScan,
}: SampleIdCardProps) {
  const displayAadhaar = customMasked || maskAadhaar("000000001234");

  return (
    <div className="scan-viewport mx-auto w-full max-w-lg p-5 sm:p-8">
      <span className="scan-corner top-left" />
      <span className="scan-corner top-right" />
      <span className="scan-corner bottom-left" />
      <span className="scan-corner bottom-right" />
      <div className="sample-id relative overflow-hidden rounded-lg border border-border bg-card text-foreground shadow-sm">
        <div className="tricolor h-1.5" />
        <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
          <span className="font-bold text-primary flex items-center gap-1.5">
            <Lock className="size-3.5 text-secondary" />
            {isRealScan ? "सत्यापित पहचान / Verified ID" : "पहचान / Identity"}
          </span>
          <span className="text-xs font-bold text-secondary">
            {isRealScan ? "100% CLIENT PRIVACY MASKED" : "SAMPLE · NOT VALID"}
          </span>
        </div>

        {customPreviewUrl ? (
          <div className="p-4 flex flex-col items-center">
            <div className="relative max-h-56 w-full overflow-hidden rounded-md border border-border bg-slate-900 flex justify-center items-center">
              <img
                src={customPreviewUrl}
                alt="Privacy Masked ID Card"
                className="max-h-56 w-auto object-contain rounded"
              />
            </div>
            <div className="mt-3 w-full text-left text-sm leading-relaxed px-1">
              <p className="text-lg font-bold text-primary">
                {extractedName || "Ram Kumar"}
              </p>
              <p className="text-muted-foreground">
                उम्र / Age: <span className="font-semibold text-foreground">{extractedAge || "42"}</span> · राज्य / State: <span className="font-semibold text-foreground">{extractedState || "Uttar Pradesh"}</span>
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4 px-4 py-5">
            <img
              src={portrait}
              alt="Fictional sample applicant Ram Kumar"
              width={512}
              height={512}
              className="h-24 w-20 shrink-0 rounded-sm object-cover"
            />
            <div className="min-w-0 text-sm leading-relaxed">
              <p className="text-lg font-bold">{extractedName || "राम कुमार / Ram Kumar"}</p>
              <p>Age / उम्र: {extractedAge || "42"}</p>
              <p>{extractedState || "Uttar Pradesh"}</p>
              <p className="text-muted-foreground">Sample card / नमूना कार्ड</p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-center gap-3 border-t border-border px-3 py-4">
          <UserRound className="size-5 text-primary" />
          <span
            className="aadhaar-mask rounded bg-mask px-4 py-2 font-mono text-xl font-bold text-mask-foreground tracking-wider"
            aria-label="First eight digits masked"
          >
            {displayAadhaar}
          </span>
        </div>
      </div>
      <div className="mt-5 flex items-center justify-center gap-2 text-center text-base font-bold text-success">
        <ShieldCheck className="size-5 shrink-0" />
        <span>
          Your Aadhaar number is hidden & never uploaded
          <br />
          आपका आधार नंबर सुरक्षित है और कहीं भेजा नहीं जाता
        </span>
      </div>
    </div>
  );
}