"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useIsAdmin, useRequireStaff } from "../utils/requireStaff";
import { CODE_CHARS, CODE_BODY_LEN, WRISTBAND_PREFIX } from "../utils/wristbandCode";

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

  if (!ready) return null;

  // ✅ admin-only
  if (!isAdmin) {
    return (
      <div className="container">
        <main className="card" style={{ width: "min(640px, 100%)" }}>
          <h1 className="h1">Generate Wristband Codes</h1>
          <div className="sub">
            This page is <b>admin-only</b>.
          </div>

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
      <main className="card" style={{ width: "min(760px, 100%)" }}>
        <h1 className="h1">Generate Wristband Codes</h1>
        <div className="sub">
          One click → generate <b>WC-XXXXXXXX</b> codes. Export as CSV for printing / production.
        </div>

        <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
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
              onClick={() => setCodes([])}
              style={{ textAlign: "center" }}
              disabled={codes.length === 0}
            >
              Clear
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
          Notes: CSV contains <b>code</b> and <b>backup URL</b> (page /b/...). You can print QR from codes later.
        </div>
      </main>
    </div>
  );
}
