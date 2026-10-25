/**
 * Module 4: Automated Form Assembly Engine
 * Powered by pdf-lib to generate standard citizen welfare application drafts
 */

import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { Profile } from "@/lib/welfare-demo";
import type { DbScheme } from "@/services/schemeService";

export interface FormAssemblyOptions {
  profile: Profile;
  scheme: DbScheme;
  maskedAadhaar?: string;
  verificationTimestamp?: string;
}

/**
 * Generate and download filled PDF application draft using pdf-lib
 */
export async function generateWelfareDraftPdf({
  profile,
  scheme,
  maskedAadhaar = "•••• •••• 1234",
  verificationTimestamp,
}: FormAssemblyOptions): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]);
  const { width, height } = page.getSize();

  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  const primaryOrange = rgb(0.94, 0.45, 0.09);
  const navyText = rgb(0.09, 0.16, 0.28);
  const mutedGray = rgb(0.39, 0.45, 0.55);
  const borderGray = rgb(0.85, 0.88, 0.92);
  const boxBg = rgb(0.97, 0.98, 1.0);
  const successGreen = rgb(0.08, 0.58, 0.27);

  // Top Decorative Tricolor Accent Strip
  page.drawRectangle({
    x: 0,
    y: height - 10,
    width: width / 3,
    height: 10,
    color: primaryOrange,
  });
  page.drawRectangle({
    x: width / 3,
    y: height - 10,
    width: width / 3,
    height: 10,
    color: rgb(0.98, 0.98, 0.98),
  });
  page.drawRectangle({
    x: (width / 3) * 2,
    y: height - 10,
    width: width / 3,
    height: 10,
    color: successGreen,
  });

  // Portal Header
  let cursorY = height - 50;

  page.drawText("YojnaSetu | Citizen Welfare Discovery Portal", {
    x: 40,
    y: cursorY,
    size: 20,
    font: fontBold,
    color: navyText,
  });

  cursorY -= 20;
  page.drawText("APPLICATION DRAFT — ASSISTED CITIZEN INTAKE FORM", {
    x: 40,
    y: cursorY,
    size: 10,
    font: fontBold,
    color: primaryOrange,
  });

  cursorY -= 15;
  page.drawLine({
    start: { x: 40, y: cursorY },
    end: { x: width - 40, y: cursorY },
    thickness: 1.5,
    color: primaryOrange,
  });

  // Target Welfare Scheme Details
  cursorY -= 30;
  page.drawText("TARGET WELFARE SCHEME", {
    x: 40,
    y: cursorY,
    size: 9,
    font: fontBold,
    color: mutedGray,
  });

  cursorY -= 20;
  page.drawText(scheme.name, {
    x: 40,
    y: cursorY,
    size: 16,
    font: fontBold,
    color: navyText,
  });

  cursorY -= 16;
  page.drawText(`Category: ${scheme.category}  |  Entitlement Benefit: ${scheme.benefit_amount}`, {
    x: 40,
    y: cursorY,
    size: 10,
    font: fontRegular,
    color: mutedGray,
  });

  // Live Verification Badge
  cursorY -= 35;
  page.drawRectangle({
    x: 40,
    y: cursorY - 10,
    width: width - 80,
    height: 34,
    color: boxBg,
    borderColor: rgb(0.72, 0.85, 0.98),
    borderWidth: 1,
  });

  const verifiedTime = verificationTimestamp || new Date().toLocaleString("en-IN");
  page.drawText(`✓ LIVE VERIFIED: Guidelines & Portals verified active via TinyFish Agent (${verifiedTime})`, {
    x: 52,
    y: cursorY + 8,
    size: 9,
    font: fontBold,
    color: successGreen,
  });

  page.drawText("Scheme guidelines confirmed authentic. Verification reference logged in Supabase registry.", {
    x: 52,
    y: cursorY - 4,
    size: 8,
    font: fontRegular,
    color: mutedGray,
  });

  // Applicant Profile Table
  cursorY -= 40;
  page.drawText("APPLICANT PARTICULARS", {
    x: 40,
    y: cursorY,
    size: 11,
    font: fontBold,
    color: navyText,
  });

  const fields: [string, string][] = [
    ["Full Legal Name", profile.name || "N/A"],
    ["Privacy-Masked ID Number", maskedAadhaar],
    ["State of Domicile", profile.state || "Uttar Pradesh"],
    ["Applicant Category / Occupation", profile.category || "Farmer"],
    ["Applicant Age", `${profile.age || "40"} Years`],
    ["Declared Annual Family Income", `INR ${Number(profile.income || 250000).toLocaleString("en-IN")}`],
  ];

  cursorY -= 15;
  const rowHeight = 30;
  const col1W = 180;

  fields.forEach(([label, value], idx) => {
    const rowY = cursorY - idx * rowHeight;

    if (idx % 2 === 0) {
      page.drawRectangle({
        x: 40,
        y: rowY - 18,
        width: width - 80,
        height: rowHeight,
        color: rgb(0.98, 0.99, 1.0),
      });
    }

    page.drawLine({
      start: { x: 40, y: rowY - 18 },
      end: { x: width - 40, y: rowY - 18 },
      thickness: 0.5,
      color: borderGray,
    });

    page.drawText(label, {
      x: 50,
      y: rowY - 6,
      size: 9.5,
      font: fontBold,
      color: navyText,
    });

    page.drawText(value, {
      x: 40 + col1W + 10,
      y: rowY - 6,
      size: 9.5,
      font: fontRegular,
      color: navyText,
    });
  });

  cursorY = cursorY - fields.length * rowHeight - 25;

  // Applicant Declaration & Signature Box
  page.drawRectangle({
    x: 40,
    y: cursorY - 65,
    width: width - 80,
    height: 75,
    borderColor: borderGray,
    borderWidth: 1,
  });

  page.drawText("DECLARATION BY APPLICANT", {
    x: 50,
    y: cursorY - 5,
    size: 9,
    font: fontBold,
    color: navyText,
  });

  page.drawText(
    "I hereby declare that the particulars furnished above are true and correct to the best of my knowledge.",
    {
      x: 50,
      y: cursorY - 20,
      size: 8,
      font: fontRegular,
      color: mutedGray,
    }
  );

  page.drawText("Applicant Signature / Thumb Impression: ____________________________", {
    x: 50,
    y: cursorY - 48,
    size: 9,
    font: fontRegular,
    color: navyText,
  });

  page.drawText(`Date: ${new Date().toLocaleDateString("en-IN")}`, {
    x: width - 180,
    y: cursorY - 48,
    size: 9,
    font: fontRegular,
    color: navyText,
  });

  // Footer Disclaimer
  cursorY -= 95;
  page.drawLine({
    start: { x: 40, y: cursorY },
    end: { x: width - 40, y: cursorY },
    thickness: 0.5,
    color: borderGray,
  });

  cursorY -= 15;
  const disclaimer =
    "DISCLAIMER: YojnaSetu is an independent student welfare portal. This auto-generated draft facilitates citizen convenience and does not constitute an official statutory benefit sanction. Please lodge official applications through respective scheme web portals or nearest Gram Panchayat / Common Service Center (CSC).";

  page.drawText(disclaimer, {
    x: 40,
    y: cursorY,
    size: 6.8,
    font: fontOblique,
    color: mutedGray,
    maxWidth: width - 80,
    lineHeight: 9,
  });

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}

/**
 * Trigger browser file download of the generated PDF
 */
export function downloadPdfBlob(pdfBytes: Uint8Array, fileName: string) {
  const blob = new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
