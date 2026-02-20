// ✅ FILE: src/app/generate/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import QRCode from "qrcode";
import { useIsAdmin, useRequireStaff } from "../utils/requireStaff";
import { CODE_CHARS, CODE_BODY_LEN, WRISTBAND_PREFIX } from "../utils/wristbandCode";
import { downloadUltraWristbandPdf } from "../utils/wristbandPdfUltra";

function randChar() {
  const i = Math.floor(Math.random() * CODE_CHARS.length);
  return CODE_CHARS[i]!;
}

function makeBody(): string {
  let s = "";
  for (let i = 0; i < CODE_BODY_LEN; i++) s += randChar();
  return s;
}

function makeCode(): string {
  return `${WRISTBAND_PREFIX}${makeBody()}`;
}

function downloadText(filename: string, text: string, mime = "text/plain;charset=utf-8") {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();

  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

export default function GeneratePage() {
  const ready = useRequireStaff();
  const isAdmin = useIsAdmin();

  const [origin, setOrigin] = useState("");
  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const [eventName, setEventName] = useState("My Event");
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);

  const [count, setCount] = useState<number>(100);
  const [codes, setCodes] = useState<string[]>([]);
  const [err, setErr] = useState<string | null>(null);

  const generate = (n: number) => {
    setErr(null);

    if (!Number.isFinite(n) || n <= 0) {
      setErr("Count must be a positive number.");
      return;
    }
    if (n > 20000) {
      setErr("Too many. Max 20000 per batch (for browser stability).");
      return;
    }

    const setUniq = new Set<string>();
    const out: string[] = [];

    let guard = 0;
    while (out.length < n) {
      const c = makeCode();
      if (!setUniq.has(c)) {
        setUniq.add(c);
        out.push(c);
      }
      guard++;
      if (guard > n * 50) {
        setErr("Generation failed (too many collisions). Try again.");
        break;
      }
    }

    setCodes(out);
  };

  const csv = useMemo(() => {
    const lines = ["code,url"];
    for (const c of codes) {
      const url = origin ? `${origin}/b/${encodeURIComponent(c)}` : `/b/${encodeURIComponent(c)}`;
      lines.push(`${c},${url}`);
    }
    return lines.join("\n");
  }, [codes, origin]);

  const copyAll = async () => {
    try {
      await navigator.clipboard.writeText(codes.join("\n"));
    } catch {
      const ta = document.createElement("textarea");
      ta.value = codes.join("\n");
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
  };

  const downloadAllQR = async () => {
    if (!origin) return;

    // simple loop downloads (browser will download multiple files)
    for (const c of codes) {
      const url = `${origin}/b/${encodeURIComponent(c)}`;
      const data = await QRCode.toDataURL(url, { margin: 1, width: 900 });

      const a = document.createElement("a");
      a.href = data;
      a.download = `${c}.png`;
      a.click();
    }
  };

  const onLogoPick = (file: File | null) => {
    if (!file) {
      setLogoDataUrl(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const res = typeof reader.result === "string" ? reader.result : null;
      setLogoDataUrl(res);
    };
    reader.readAsDataURL(file);
  };

  if (!ready) return null;

  // ✅ admin-only
  if (!isAdmin) {
    return (
      <div className="container">
        <main className="card" style={{ width: "min(640px, 100%)" }}>
          <h1 className="h1">Generate Wristband Codes</h1>
          <div className="sub">This page is <b>admin-only</b>.</div>

          <div style={{ marginTop: 14 }} className="row">
            <Link href="/" className="btnSecondary" style={{ textAlign: "center" }}>
              ← Back to Home
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="container">
      <main className="card" style={{ width: "min(820px, 100%)" }}>
        <h1 className="h1">Generate Wristband Codes</h1>

        <div className="sub">
          ULTRA PRO print: <b>19×250mm wristbands</b> + crop marks + perforation + optional logo.
        </div>

        <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
          <input
            className="input"
            placeholder="Event name (printed on wristband)..."
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
          />

          <div className="row">
            <label className="btnSecondary" style={{ cursor: "pointer", textAlign: "center" }}>
              Upload logo (optional)
              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => onLogoPick(e.target.files?.[0] || null)}
              />
            </label>

            <button
              type="button"
              className="btnSecondary"
              onClick={() => setLogoDataUrl(null)}
              disabled={!logoDataUrl}
            >
              Remove logo
            </button>

            <div className="badge" style={{ alignSelf: "center" }}>
              {logoDataUrl ? "logo: ON" : "logo: OFF"}
            </div>
          </div>

          <div className="row">
            <button type="button" className="btnSecondary" onClick={() => setCount(100)}>
              100
            </button>
            <button type="button" className="btnSecondary" onClick={() => setCount(500)}>
              500
            </button>
            <button type="button" className="btnSecondary" onClick={() => setCount(1000)}>
              1000
            </button>

            <input
              className="input"
              style={{ flex: 1 }}
              inputMode="numeric"
              value={String(count)}
              onChange={(e) => setCount(Number(e.target.value || 0))}
              placeholder="Custom count..."
            />
          </div>

          {err && (
            <div style={{ fontSize: 13, fontWeight: 800, color: "#ff5a5a" }}>
              {err}
            </div>
          )}

          <button type="button" className="btn" onClick={() => generate(count)}>
            Generate
          </button>

          <div className="row">
            <button
              type="button"
              className="btnSecondary"
              onClick={() => copyAll()}
              style={{ textAlign: "center" }}
              disabled={codes.length === 0}
            >
              Copy all
            </button>

            <button
              type="button"
              className="btnSecondary"
              onClick={() =>
                downloadText(`wristband_codes_${codes.length}.csv`, csv, "text/csv;charset=utf-8")
              }
              style={{ textAlign: "center" }}
              disabled={codes.length === 0}
            >
              Download CSV
            </button>

            <button
              type="button"
              className="btnSecondary"
              onClick={() => downloadAllQR()}
              style={{ textAlign: "center" }}
              disabled={codes.length === 0 || !origin}
            >
              Download PNG QR
            </button>

            {/* ✅ ULTRA PRO PDF */}
            <button
              type="button"
              className="btnSecondary"
              onClick={() =>
                downloadUltraWristbandPdf({
                  codes,
                  eventName,
                  origin,
                  logoDataUrl,
                  bandsPerPage: 5,
                  bleedMm: 2,
                  showCutMarks: true,
                  showPerforation: true,
                })
              }
              style={{ textAlign: "center" }}
              disabled={codes.length === 0 || !origin}
            >
              Download ULTRA PRO PDF
            </button>
          </div>

          <div className="row" style={{ marginTop: 6 }}>
            <Link href="/" className="btnSecondary" style={{ textAlign: "center" }}>
              ← Back to Home
            </Link>
            <Link href="/checkin" className="btnSecondary" style={{ textAlign: "center" }}>
              Go to Check In →
            </Link>
            <Link href="/history" className="btnSecondary" style={{ textAlign: "center" }}>
              History →
            </Link>
          </div>
        </div>

        <div style={{ marginTop: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
            <div style={{ fontSize: 16, fontWeight: 800 }}>Generated codes</div>
            <div className="badge">{codes.length}</div>
          </div>

          {codes.length === 0 ? (
            <div style={{ marginTop: 10, opacity: 0.7 }}>
              No codes yet. Choose 100/500/1000 and press <b>Generate</b>.
            </div>
          ) : (
            <div className="list" style={{ marginTop: 10, maxHeight: 420, overflow: "auto" }}>
              {codes.map((c) => (
                <div key={c} className="listItem">
                  <div style={{ fontWeight: 900 }}>{c}</div>
                  <div style={{ opacity: 0.75, fontSize: 12 }}>
                    {origin ? `${origin}/b/${encodeURIComponent(c)}` : `/b/${encodeURIComponent(c)}`}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ marginTop: 12, fontSize: 12, opacity: 0.72 }}>
          Print tip: Use <b>ULTRA PRO PDF</b> for wristbands. It includes crop marks + bleed + perforation.
        </div>
      </main>
    </div>
  );
}