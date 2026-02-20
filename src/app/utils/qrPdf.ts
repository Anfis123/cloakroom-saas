// ✅ FILE: src/app/utils/qrPdf.ts

import jsPDF from "jspdf";
import QRCode from "qrcode";

/**
 * Generates PRINT-READY PDF with wristband tiles.
 * Layout: A4 portrait
 * Each tile contains:
 * - Event name
 * - Code text
 * - QR image
 */

export async function downloadQrPdf(
  codes: string[],
  eventName: string,
  origin: string
) {
  if (!codes.length) return;

  // A4 mm
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const PAGE_W = 210;
  const PAGE_H = 297;

  // 👇 tile size (approx paper wristband visual block)
  const TILE_W = 90;
  const TILE_H = 40;

  const MARGIN_X = 15;
  const MARGIN_Y = 15;

  const GAP_X = 10;
  const GAP_Y = 10;

  const COLS = 2;
  const ROWS = 6;

  let index = 0;

  for (let i = 0; i < codes.length; i++) {
    if (i !== 0 && i % (COLS * ROWS) === 0) {
      pdf.addPage();
    }

    const pageIndex = i % (COLS * ROWS);

    const col = pageIndex % COLS;
    const row = Math.floor(pageIndex / COLS);

    const x = MARGIN_X + col * (TILE_W + GAP_X);
    const y = MARGIN_Y + row * (TILE_H + GAP_Y);

    const code = codes[i];
    const url = `${origin}/b/${encodeURIComponent(code)}`;

    // 🔥 generate QR image
    const qrData = await QRCode.toDataURL(url, {
      margin: 1,
      width: 512,
    });

    // tile border (optional)
    pdf.setDrawColor(220);
    pdf.rect(x, y, TILE_W, TILE_H);

    // event title
    pdf.setFontSize(10);
    pdf.text(eventName || "Event", x + 4, y + 6);

    // code text
    pdf.setFontSize(12);
    pdf.text(code, x + 4, y + 14);

    // QR image
    pdf.addImage(qrData, "PNG", x + TILE_W - 32, y + 4, 28, 28);
  }

  pdf.save(`wristbands_${codes.length}.pdf`);
}