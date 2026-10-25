import { useEffect, useRef, useState, useCallback } from "react";
import * as pdfjsLib from "pdfjs-dist";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  Lock,
  Sparkles,
  HelpCircle,
  Maximize2,
  Languages,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Lang } from "@/components/SiteHeader";
import type { Profile } from "@/lib/welfare-demo";
import {
  getSchemePdfGuidance,
  type PdfFieldGuidance,
  type SchemePdfGuideInfo,
} from "@/services/pdfGuidanceService";

// Configure local PDF.js worker
if (typeof window !== "undefined" && "Worker" in window) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
}

/**
 * Retained for backward-compatibility with placement test suites.
 */
export function getPopoverPlacement(
  marker: PdfFieldGuidance,
  pageWidth: number,
  pageHeight: number,
  tooltipWidth: number = 320
): {
  side: "right" | "left" | "bottom";
  vAlign: "top" | "center" | "bottom";
  popoverStyle: React.CSSProperties;
  caretStyle: React.CSSProperties;
} {
  const markerPixelX = (marker.left_pct / 100) * pageWidth;
  const markerPixelY = (marker.top_pct / 100) * pageHeight;

  const spaceRight = pageWidth - markerPixelX - 28;
  const spaceLeft = markerPixelX - 28;

  let side: "right" | "left" | "bottom" = "right";
  if (spaceRight >= tooltipWidth) {
    side = "right";
  } else if (spaceLeft >= tooltipWidth) {
    side = "left";
  } else {
    side = "bottom";
  }

  let vAlign: "top" | "center" | "bottom" = "center";
  if (marker.top_pct < 16) {
    vAlign = "top";
  } else if (marker.top_pct > 72) {
    vAlign = "bottom";
  }

  const popoverStyle: React.CSSProperties = {
    position: "absolute",
    zIndex: 60,
    width: `${tooltipWidth}px`,
    maxWidth: "88vw",
  };

  const caretStyle: React.CSSProperties = {
    position: "absolute",
    width: "12px",
    height: "12px",
    backgroundColor: "var(--card, #ffffff)",
  };

  if (side === "right") {
    popoverStyle.left = "calc(100% + 14px)";
    if (vAlign === "top") {
      popoverStyle.top = "-8px";
      caretStyle.left = "-7px";
      caretStyle.top = "18px";
      caretStyle.transform = "rotate(45deg)";
    } else if (vAlign === "bottom") {
      popoverStyle.bottom = "-8px";
      caretStyle.left = "-7px";
      caretStyle.bottom = "18px";
      caretStyle.transform = "rotate(45deg)";
    } else {
      popoverStyle.top = "50%";
      popoverStyle.transform = "translateY(-50%)";
      caretStyle.left = "-7px";
      caretStyle.top = "50%";
      caretStyle.transform = "translateY(-50%) rotate(45deg)";
    }
  } else if (side === "left") {
    popoverStyle.right = "calc(100% + 14px)";
    if (vAlign === "top") {
      popoverStyle.top = "-8px";
      caretStyle.right = "-7px";
      caretStyle.top = "18px";
      caretStyle.transform = "rotate(45deg)";
    } else if (vAlign === "bottom") {
      popoverStyle.bottom = "-8px";
      caretStyle.right = "-7px";
      caretStyle.bottom = "18px";
      caretStyle.transform = "rotate(45deg)";
    } else {
      popoverStyle.top = "50%";
      popoverStyle.transform = "translateY(-50%)";
      caretStyle.right = "-7px";
      caretStyle.top = "50%";
      caretStyle.transform = "translateY(-50%) rotate(45deg)";
    }
  } else {
    popoverStyle.top = "calc(100% + 12px)";
    if (marker.left_pct < 30) {
      popoverStyle.left = "0";
      caretStyle.top = "-7px";
      caretStyle.left = "18px";
      caretStyle.transform = "rotate(45deg)";
    } else if (marker.left_pct > 70) {
      popoverStyle.right = "0";
      caretStyle.top = "-7px";
      caretStyle.right = "18px";
      caretStyle.transform = "rotate(45deg)";
    } else {
      popoverStyle.left = "50%";
      popoverStyle.transform = "translateX(-50%)";
      caretStyle.top = "-7px";
      caretStyle.left = "50%";
      caretStyle.transform = "translateX(-50%) rotate(45deg)";
    }
  }

  return { side, vAlign, popoverStyle, caretStyle };
}

interface InteractiveGuidedPdfViewerProps {
  schemeId: string;
  schemeName: string;
  profile: Profile;
  lang: Lang;
  onOpenPortalBridge?: () => void;
  onBackToEligibility?: () => void;
}

export function InteractiveGuidedPdfViewer({
  schemeId,
  schemeName,
  profile,
  lang,
  onOpenPortalBridge,
  onBackToEligibility,
}: InteractiveGuidedPdfViewerProps) {
  const guideInfo: SchemePdfGuideInfo = getSchemePdfGuidance(schemeId);

  // Language management: support English, Hindi, and Bilingual ("both")
  // Initialized from the parent app language
  const [displayLang, setDisplayLang] = useState<"en" | "hi" | "both">(
    lang === "hi" ? "hi" : "en"
  );

  // Synchronize when the global site header language changes,
  // without resetting current page, zoom level, or scroll position.
  useEffect(() => {
    setDisplayLang(lang === "hi" ? "hi" : "en");
  }, [lang]);

  const en = displayLang === "en";
  const t = (english: string, hindi: string) => (displayLang === "hi" ? hindi : english);

  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(guideInfo.total_pages || 1);
  const [zoomScale, setZoomScale] = useState(1.2);
  const [showGuidance, setShowGuidance] = useState(true);
  const [activeFilter, setActiveFilter] = useState<"all" | "sensitive">("all");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [pageDimensions, setPageDimensions] = useState<{ width: number; height: number }>({
    width: 800,
    height: 1100,
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const renderTaskRef = useRef<any>(null);
  const pdfContainerRef = useRef<HTMLDivElement | null>(null);

  // ---------------------------------------------------------------------------
  // 1. Load PDF Document from Supabase Storage
  // ---------------------------------------------------------------------------
  useEffect(() => {
    let isCancelled = false;

    if (!guideInfo.is_available || !guideInfo.public_pdf_url) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setLoadError(null);
    setCurrentPage(1);

    const loadingTask = pdfjsLib.getDocument({
      url: guideInfo.public_pdf_url,
      cMapUrl: "https://cdn.jsdelivr.net/npm/pdfjs-dist@6.4.299/cmaps/",
      cMapPacked: true,
    });

    loadingTask.promise
      .then((doc) => {
        if (!isCancelled) {
          setPdfDoc(doc);
          setTotalPages(doc.numPages);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          console.error("Failed to load PDF:", err);
          setLoadError(
            err?.message ||
              t(
                "Unable to load official PDF document.",
                "आधिकारिक PDF दस्तावेज़ लोड करने में असमर्थ।"
              )
          );
          setIsLoading(false);
        }
      });

    return () => {
      isCancelled = true;
      loadingTask.destroy?.();
    };
  }, [guideInfo.public_pdf_url, guideInfo.is_available]);

  // ---------------------------------------------------------------------------
  // 2. Render Current Page to Canvas
  // ---------------------------------------------------------------------------
  const renderPage = useCallback(
    async (pageNum: number, scale: number) => {
      if (!pdfDoc || !canvasRef.current) return;

      try {
        if (renderTaskRef.current) {
          renderTaskRef.current.cancel();
        }

        const page = await pdfDoc.getPage(pageNum);
        const viewport = page.getViewport({ scale });
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d", { alpha: false });

        if (!ctx) return;

        canvas.width = viewport.width;
        canvas.height = viewport.height;
        setPageDimensions({ width: viewport.width, height: viewport.height });

        const renderContext = {
          canvasContext: ctx,
          viewport: viewport,
        };

        const task = page.render(renderContext);
        renderTaskRef.current = task;
        await task.promise;
      } catch (err: any) {
        if (err?.name !== "RenderingCancelledException") {
          console.error("Error rendering PDF page:", err);
        }
      }
    },
    [pdfDoc]
  );

  useEffect(() => {
    if (pdfDoc) {
      renderPage(currentPage, zoomScale);
    }
  }, [pdfDoc, currentPage, zoomScale, renderPage]);

  // ---------------------------------------------------------------------------
  // 3. Zoom Controls
  // ---------------------------------------------------------------------------
  function handleZoomIn() {
    setZoomScale((prev) => Math.min(2.2, +(prev + 0.15).toFixed(2)));
  }

  function handleZoomOut() {
    setZoomScale((prev) => Math.max(0.65, +(prev - 0.15).toFixed(2)));
  }

  function handleResetZoom() {
    setZoomScale(1.2);
  }

  function handleFitWidth() {
    if (pdfContainerRef.current) {
      const containerWidth = pdfContainerRef.current.clientWidth - 48;
      const naturalWidth = pageDimensions.width / zoomScale;
      if (naturalWidth > 0 && containerWidth > 0) {
        const fitScale = +(containerWidth / naturalWidth).toFixed(2);
        setZoomScale(Math.min(1.8, Math.max(0.7, fitScale)));
      }
    }
  }

  // ---------------------------------------------------------------------------
  // 4. In-Field Guidance for Current Page
  // ---------------------------------------------------------------------------
  const allPageFields = guideInfo.markers.filter((m) => m.page_number === currentPage);
  const visibleFields = allPageFields.filter((m) => {
    if (activeFilter === "sensitive") return m.is_sensitive_id;
    return true;
  });

  // ---------------------------------------------------------------------------
  // 5. Handling 5th Scheme (UP Shramik Pension / Unavailable Forms)
  // ---------------------------------------------------------------------------
  if (!guideInfo.is_available || !guideInfo.public_pdf_url) {
    return (
      <div className="space-y-6">
        {onBackToEligibility && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onBackToEligibility}
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="size-4" />
            <span>{t("Back to Eligibility Result", "पात्रता परिणाम पर वापस")}</span>
          </Button>
        )}

        <div className="rounded-2xl border-2 border-dashed border-amber-500/40 bg-amber-50/40 dark:bg-amber-950/20 p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-sm">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-400 mb-4">
            <HelpCircle className="size-8" />
          </div>

          <span className="rounded-full bg-amber-500/20 px-3.5 py-1 text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
            {t("Application form guide is not available yet", "आवेदन प्रपत्र मार्गदर्शिका अभी उपलब्ध नहीं है")}
          </span>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground mt-3">
            {t("Guided Form Coming Soon", "मार्गदर्शित फॉर्म शीघ्र उपलब्ध होगा")}
          </h2>

          <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed max-w-lg mx-auto">
            {t(
              "The official blank application form PDF for this scheme has not been published to our repository yet. You can still proceed directly to the verified official government portal to check procedures or submit an online application.",
              "इस योजना के लिए आधिकारिक खाली आवेदन पत्र PDF अभी हमारे रिपॉजिटरी में अपलोड नहीं हुआ है। आप प्रक्रिया देखने या ऑनलाइन आवेदन करने के लिए सीधे सत्यापित सरकारी पोर्टल पर जा सकते हैं।"
            )}
          </p>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            {onOpenPortalBridge && (
              <Button
                onClick={onOpenPortalBridge}
                className="gap-2 font-bold shadow-md bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <span>{t("Proceed to Official Portal", "सरकारी पोर्टल पर जाएं")}</span>
                <ExternalLink className="size-4" />
              </Button>
            )}

            {onBackToEligibility && (
              <Button variant="outline" onClick={onBackToEligibility}>
                {t("Review Eligibility Rules", "पात्रता नियम देखें")}
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // 6. Main Interactive PDF Canvas with Direct In-Field Guidance
  // ---------------------------------------------------------------------------
  return (
    <div className="space-y-4">
      {/* -------------------------------------------------------------
          TOP TOOLBAR: Navigation, Zoom, Language Switcher, Direct Download
          ------------------------------------------------------------- */}
      <div className="rounded-2xl border border-border bg-card p-3 sm:p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
        {/* Left: Page Navigation */}
        <div className="flex items-center gap-1 sm:gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1 || isLoading}
            className="h-8 px-2.5"
            aria-label="Previous Page"
          >
            <ChevronLeft className="size-4" />
            <span className="hidden sm:inline text-xs font-semibold">{t("Prev", "पिछला")}</span>
          </Button>

          <span className="px-2 text-xs sm:text-sm font-bold text-foreground">
            {t("Page", "पृष्ठ")} <span className="text-primary">{currentPage}</span> / {totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages || isLoading}
            className="h-8 px-2.5"
            aria-label="Next Page"
          >
            <span className="hidden sm:inline text-xs font-semibold">{t("Next", "अगला")}</span>
            <ChevronRight className="size-4" />
          </Button>
        </div>

        {/* Center: Zoom Controls */}
        <div className="flex items-center gap-1 sm:gap-1.5 bg-muted/40 rounded-xl p-1 border border-border">
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={isLoading || zoomScale <= 0.65}
            className="p-1.5 rounded-lg hover:bg-card text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
            title={t("Zoom Out", "छोटा करें")}
            aria-label="Zoom Out"
          >
            <ZoomOut className="size-3.5" />
          </button>

          <span className="px-2 text-xs font-mono font-bold text-foreground min-w-[50px] text-center">
            {Math.round(zoomScale * 100)}%
          </span>

          <button
            type="button"
            onClick={handleZoomIn}
            disabled={isLoading || zoomScale >= 2.2}
            className="p-1.5 rounded-lg hover:bg-card text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
            title={t("Zoom In", "बड़ा करें")}
            aria-label="Zoom In"
          >
            <ZoomIn className="size-3.5" />
          </button>

          <button
            type="button"
            onClick={handleResetZoom}
            disabled={isLoading}
            className="p-1.5 rounded-lg hover:bg-card text-muted-foreground hover:text-foreground transition-colors"
            title={t("Reset Zoom (100%)", "सामान्य आकार")}
            aria-label="Reset Zoom"
          >
            <RotateCcw className="size-3.5" />
          </button>

          <button
            type="button"
            onClick={handleFitWidth}
            disabled={isLoading}
            className="hidden sm:inline-flex px-2 py-1 text-[11px] font-bold rounded-lg hover:bg-card text-muted-foreground hover:text-foreground transition-colors"
            title={t("Fit Width", "चौड़ाई अनुसार")}
          >
            <Maximize2 className="size-3 mr-1" />
            {t("Fit", "फिट")}
          </button>
        </div>

        {/* Right: Language Toggle, Guidance Toggle & Download Clean Blank PDF */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* In-Viewer Language Switcher (Requirement 2: English, Hindi, Bilingual) */}
          <div className="flex items-center bg-muted/40 rounded-xl p-1 border border-border text-xs">
            <Languages className="size-3.5 text-muted-foreground ml-1.5 mr-1" />
            <button
              type="button"
              onClick={() => setDisplayLang("en")}
              className={cn(
                "px-2 py-1 rounded-lg font-bold text-[11px] transition-colors",
                displayLang === "en"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Show guidance in English"
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setDisplayLang("hi")}
              className={cn(
                "px-2 py-1 rounded-lg font-bold text-[11px] transition-colors font-sans",
                displayLang === "hi"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="हिंदी में निर्देश देखें"
            >
              हिंदी
            </button>
            <button
              type="button"
              onClick={() => setDisplayLang("both")}
              className={cn(
                "px-2 py-1 rounded-lg font-bold text-[11px] transition-colors",
                displayLang === "both"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Show both English and Hindi"
            >
              Both
            </button>
          </div>

          {/* Toggle Guidance Overlay On/Off */}
          <button
            type="button"
            onClick={() => setShowGuidance((v) => !v)}
            className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-colors",
              showGuidance
                ? "bg-blue-50 dark:bg-blue-950/60 text-blue-900 dark:text-blue-100 border-blue-300 dark:border-blue-700"
                : "bg-muted/40 text-muted-foreground border-border hover:text-foreground"
            )}
            title={showGuidance ? "Hide in-field guidance" : "Show in-field guidance"}
          >
            {showGuidance ? <Eye className="size-3.5 text-primary" /> : <EyeOff className="size-3.5" />}
            <span className="hidden md:inline">
              {showGuidance ? t("Hints On", "निर्देश सक्रिय") : t("Hints Off", "निर्देश बंद")}
            </span>
          </button>

          {/* Download Clean Blank PDF (Requirement 5) */}
          {guideInfo.public_pdf_url && (
            <a
              href={guideInfo.public_pdf_url}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-2.5 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-accent transition-colors shadow-xs"
              title={t("Download Official Blank PDF", "आधिकारिक खाली PDF डाउनलोड करें")}
            >
              <Download className="size-3.5 text-primary" />
              <span className="hidden sm:inline">{t("Blank PDF", "खाली PDF")}</span>
            </a>
          )}
        </div>
      </div>

      {/* -------------------------------------------------------------
          INSTRUCTION BANNER & LEGEND
          Direct in-field guidance notice; sensitive identity instructions
          ------------------------------------------------------------- */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-2.5 text-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-foreground/90">
          <Sparkles className="size-4 text-primary shrink-0" />
          <span className="font-medium">
            {displayLang === "hi"
              ? "दस्तावेज़ की खाली रेखाओं और खानों पर सीधे निर्देश दिए गए हैं। आधिकारिक आवेदन पत्र में तदनुसार भरें।"
              : "Instructions are placed directly inside or beside the blank fields on the official form. Fill accordingly."}
          </span>
        </div>

        <div className="flex items-center gap-3 text-[11px] font-semibold">
          <span className="flex items-center gap-1.5 text-blue-800 dark:text-blue-300">
            <span className="inline-block w-3.5 h-2.5 rounded-xs border border-dashed border-blue-500 bg-blue-100 dark:bg-blue-900/50" />
            {displayLang === "hi" ? "फ़ील्ड निर्देश" : "In-Field Guidance"}
          </span>
          <span className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300">
            <span className="inline-flex items-center justify-center size-3.5 rounded-xs border border-dashed border-amber-500 bg-amber-100 dark:bg-amber-900/50 text-[9px]">
              <Lock className="size-2 text-amber-700 dark:text-amber-300" />
            </span>
            {displayLang === "hi"
              ? "गोपनीय पहचान (सीधे पोर्टल पर भरें)"
              : "Sensitive ID (Fill on portal only)"}
          </span>
        </div>
      </div>

      {/* -------------------------------------------------------------
          FULL-WIDTH PDF VIEWPORT WITH DIRECT IN-FIELD GUIDANCE OVERLAY
          (No numbered markers, no popovers, no right-side panel!)
          ------------------------------------------------------------- */}
      <div
        ref={pdfContainerRef}
        className="w-full rounded-2xl border-2 border-border bg-muted/20 p-2 sm:p-6 overflow-auto max-h-[850px] shadow-inner relative flex justify-center"
      >
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="size-12 animate-spin rounded-full border-4 border-primary border-t-transparent mb-4" />
            <p className="text-sm font-bold text-foreground">
              {t("Rendering official application form...", "आधिकारिक आवेदन प्रपत्र लोड हो रहा है...")}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {t(
                "Fetching verified blank layout from Supabase Storage.",
                "सुपाबेस स्टोरेज से सत्यापित खाली प्रपत्र प्राप्त हो रहा है।"
              )}
            </p>
          </div>
        )}

        {loadError && (
          <div className="p-8 text-center max-w-md my-12">
            <HelpCircle className="size-10 text-destructive mx-auto mb-3" />
            <h3 className="text-base font-bold text-destructive">
              {t("Unable to display document", "दस्तावेज़ प्रदर्शित करने में असमर्थ")}
            </h3>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{loadError}</p>
            <div className="mt-4 flex justify-center gap-2">
              <Button size="sm" variant="outline" onClick={() => window.location.reload()}>
                {t("Retry", "पुनः प्रयास")}
              </Button>
              {guideInfo.public_pdf_url && (
                <a
                  href={guideInfo.public_pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground shadow"
                >
                  <span>{t("Open PDF directly", "सीधे PDF खोलें")}</span>
                  <ExternalLink className="size-3.5" />
                </a>
              )}
            </div>
          </div>
        )}

        {/* Canvas + In-Field Guidance Layer */}
        <div
          className={`relative transition-all duration-150 ${
            isLoading || loadError ? "hidden" : "block"
          }`}
          style={{
            width: `${pageDimensions.width}px`,
            height: `${pageDimensions.height}px`,
            minWidth: `${pageDimensions.width}px`,
          }}
        >
          {/* 1. The Document Canvas (Preserves clean original PDF layout) */}
          <canvas
            ref={canvasRef}
            className="rounded-lg shadow-lg border border-border/80 bg-white block"
            style={{
              width: `${pageDimensions.width}px`,
              height: `${pageDimensions.height}px`,
            }}
          />

          {/* 2. Direct In-Field Guidance Overlay (Non-destructive, attached to fields) */}
          {showGuidance && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                width: `${pageDimensions.width}px`,
                height: `${pageDimensions.height}px`,
              }}
            >
              {visibleFields.map((field) => {
                const hint =
                  displayLang === "hi"
                    ? field.hint_text.hi
                    : displayLang === "both"
                    ? `${field.hint_text.en} — ${field.hint_text.hi}`
                    : field.hint_text.en;

                return (
                  <div
                    key={field.id}
                    style={{
                      position: "absolute",
                      top: `${field.top_pct}%`,
                      left: `${field.left_pct}%`,
                      transform: "translate(0, -50%)",
                    }}
                    className="pointer-events-none select-none z-20 max-w-[85%]"
                  >
                    <span
                      className={cn(
                        "inline-flex items-center text-[10px] sm:text-[11.5px] font-semibold tracking-tight px-1.5 py-0.5 rounded shadow-xs whitespace-nowrap backdrop-blur-xs transition-colors",
                        field.is_sensitive_id
                          ? "bg-amber-100/95 dark:bg-amber-950/95 text-amber-950 dark:text-amber-100 border border-dashed border-amber-500 shadow-amber-900/10"
                          : "bg-blue-50/95 dark:bg-blue-950/95 text-blue-950 dark:text-blue-100 border border-dashed border-blue-400 dark:border-blue-500 shadow-blue-900/10"
                      )}
                      style={{
                        fontFamily:
                          displayLang === "hi"
                            ? "'Noto Sans Devanagari', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                            : "inherit",
                      }}
                    >
                      {field.is_sensitive_id && (
                        <Lock className="size-2.5 sm:size-3 mr-1 shrink-0 text-amber-700 dark:text-amber-300" />
                      )}
                      {hint}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* -------------------------------------------------------------
          BOTTOM ACTION: Quick Portal Link & Back Navigation
          ------------------------------------------------------------- */}
      <div className="flex items-center justify-between pt-2">
        {onBackToEligibility ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={onBackToEligibility}
            className="text-xs font-medium text-muted-foreground hover:text-foreground gap-1.5"
          >
            <ChevronLeft className="size-3.5" />
            <span>{t("Back to Eligibility Result", "पात्रता परिणाम पर वापस")}</span>
          </Button>
        ) : (
          <div />
        )}

        {onOpenPortalBridge && (
          <Button
            size="sm"
            onClick={onOpenPortalBridge}
            className="text-xs font-bold bg-primary text-primary-foreground gap-1.5 shadow"
          >
            <span>{t("Proceed to Official Portal", "सरकारी पोर्टल पर जाएं")}</span>
            <ExternalLink className="size-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}
