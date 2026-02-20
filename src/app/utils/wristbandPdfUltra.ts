// ✅ FILE: src/app/utils/wristbandPdfUltra.ts

import jsPDF from "jspdf";
import QRCode from "qrcode";

type UltraPdfOptions = {
  codes: string[];
  eventName: string;
  origin: string;

  // optional logo as DataURL (png/jpg)
  logoDataUrl?: string | null;

  // print settings
  bandsPerPage?: number; // default 5
  bleedMm?: number; // default 2
  showCutMarks?: boolean; // default true
  showPerforation?: boolean; // default true
};

/**
 * ULTRA PRO A4 PDF:
 * - Wristband size: 19 x 250 mm
 * - Layout on A4: 5 vertical bands per page
 * - Each band has: logo (optional), event, code, QR (to /b/<code>)
 * - Includes: bleed + cut marks + perforation line
 */
export async function downloadUltraWristbandPdf(opts: UltraPdfOptions) {
  const {
    codes,
    eventName,
    origin,
    logoDataUrl = null,
    bandsPerPage = 5,
    bleedMm = 2,
    showCutMarks = true,
    showPerforation = true,
  } = opts;

  if (!codes?.length) return;

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // A4 mm
  const PAGE_W = 210;
  const PAGE_H = 297;

  // Wristband physical size
  const BAND_W = 19; // mm
  const BAND_H = 250; // mm

  // Layout settings
  const MARGIN_X = 10;
  const MARGIN_Y = 15;
  const GAP_X = 6;

  const cols = Math.min(bandsPerPage, 7);
  const totalW = cols * BAND_W + (cols - 1) * GAP_X;
  const startX = Math.max(MARGIN_X, (PAGE_W - totalW) / 2);
  const startY = MARGIN_Y;

  const drawCropMarks = (x: number, y: number, w: number, h: number) => {
    const L = 4;
    const O = 1.2;
    pdf.setDrawColor(40);
    pdf.setLineWidth(0.3);

    // top-left
    pdf.line(x - O, y, x - O + L, y);
    pdf.line(x, y - O, x, y - O + L);

    // top-right
    pdf.line(x + w + O, y, x + w + O - L, y);
    pdf.line(x + w, y - O, x + w, y - O + L);

    // bottom-left
    pdf.line(x - O, y + h, x - O + L, y + h);
    pdf.line(x, y + h + O, x, y + h + O - L);

    // bottom-right
    pdf.line(x + w + O, y + h, x + w + O - L, y + h);
    pdf.line(x + w, y + h + O, x + w, y + h + O - L);
  };

  const drawPerforation = (x: number, y: number, w: number) => {
    const perfY = y + 35;

    pdf.setDrawColor(120);
    pdf.setLineWidth(0.25);

    // dashed (supported widely)
    // @ts-ignore
    pdf.setLineDashPattern([1.2, 1.0], 0);
    pdf.line(x + 1.2, perfY, x + w - 1.2, perfY);
    // @ts-ignore
    pdf.setLineDashPattern([], 0);

    pdf.setTextColor(120);
    pdf.setFontSize(7);
    pdf.text("TEAR / PERFORATION", x + 2, perfY - 1.5);
  };

  const drawBand = async (x: number, y: number, code: string) => {
    const url = `${origin}/b/${encodeURIComponent(code)}`;

    // bleed rectangle area
    const bx = x - bleedMm;
    const by = y - bleedMm;
    const bw = BAND_W + bleedMm * 2;
    const bh = BAND_H + bleedMm * 2;

    // background
    pdf.setFillColor(255, 255, 255);
    pdf.setDrawColor(60);
    pdf.setLineWidth(0.25);
    pdf.rect(bx, by, bw, bh, "F");

    // inner cut line
    pdf.setDrawColor(0);
    pdf.setLineWidth(0.2);
    pdf.rect(x, y, BAND_W, BAND_H);

    if (showCutMarks) drawCropMarks(x, y, BAND_W, BAND_H);
    if (showPerforation) drawPerforation(x, y, BAND_W);

    // QR near bottom
    const qrSize = 16;
    const qrX = x + (BAND_W - qrSize) / 2;
    const qrY = y + BAND_H - qrSize - 12;

    const qrData = await QRCode.toDataURL(url, {
      margin: 1,
      width: 512,
    });

    pdf.addImage(qrData, "PNG", qrX, qrY, qrSize, qrSize);

    pdf.setTextColor(0);
    pdf.setFontSize(6);
    pdf.text("SCAN", x + 5, qrY + qrSize + 5);

    // ✅ ROTATED TEXT WITHOUT pdf.rotate()
    // We rotate text using jsPDF text option { angle: 90 }
    // Place text in "normal" coordinates and jsPDF rotates around that point.
    pdf.setTextColor(0);
    pdf.setFont("helvetica", "bold");

    // We want text along band length, so angle=90 and we anchor near top area.
    // (xText,yText) is rotation pivot point.
    const xText = x + 5; // inside band
    const yText = y + 60; // down from top (tuned)

    pdf.setFontSize(9);
    pdf.text((eventName || "EVENT").slice(0, 28), xText, yText, { angle: 90 });

    pdf.setFontSize(12);
    pdf.text(code, xText, yText + 8, { angle: 90 });

    // Optional logo at top end (upright)
    if (logoDataUrl) {
      const logoW = BAND_W - 4;
      const logoH = 10;
      const lx = x + 2;
      const ly = y + 6;

      try {
        pdf.addImage(logoDataUrl, "PNG", lx, ly, logoW, logoH);
      } catch {
        try {
          pdf.addImage(logoDataUrl, "JPEG", lx, ly, logoW, logoH);
        } catch {}
      }
    }

    // Footer micro text
    pdf.setTextColor(80);
    pdf.setFontSize(6);
    pdf.setFont("helvetica", "normal");
    pdf.text("Wristband Cloakroom", x + 2, y + BAND_H - 4);
  };

  const perPage = cols;

  for (let i = 0; i < codes.length; i++) {
    if (i !== 0 && i % perPage === 0) pdf.addPage();

    const idx = i % perPage;
    const x = startX + idx * (BAND_W + GAP_X);
    const y = startY;

    await drawBand(x, y, codes[i]);
  }

  pdf.save(`wristbands_ULTRA_${codes.length}.pdf`);
}