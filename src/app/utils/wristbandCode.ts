// src/app/utils/wristbandCode.ts

export const WRISTBAND_PREFIX = "WC-" as const;

// Bez 0/1/I/O + bez U
export const CODE_CHARS = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ" as const;
export const CODE_BODY_LEN = 8 as const;

const FULL_RE = new RegExp(`^${WRISTBAND_PREFIX}[${CODE_CHARS}]{${CODE_BODY_LEN}}$`);
const BODY_RE = new RegExp(`^[${CODE_CHARS}]{${CODE_BODY_LEN}}$`);

function extractPossibleCode(raw: string): string {
  if (!raw) return "";

  let s = raw.trim();

  // 1) esli eto polnyj URL — probuem rasparsit i vzjat pathname
  //    (napr: https://domain.com/b/WC-ABCDEFGH)
  try {
    if (/^https?:\/\//i.test(s)) {
      const u = new URL(s);
      s = u.pathname + (u.search || "");
    }
  } catch {
    // ignore
  }

  // 2) esli est /b/ — vyrezaem vse posle /b/
  //    (napr: /b/WC-ABCDEFGH  ili  /b/WC-ABCDEFGH?x=1)
  const idx = s.indexOf("/b/");
  if (idx !== -1) {
    s = s.slice(idx + 3); // posle "/b/"
  }

  // 3) obrezaem query/hash, i decode (na sluchaj %2D i t.p.)
  s = s.split("?")[0] || s;
  s = s.split("#")[0] || s;

  try {
    s = decodeURIComponent(s);
  } catch {
    // ignore
  }

  return s;
}

export function normalizeCode(raw: string): string {
  if (!raw) return "";

  // vynimaem kod iz ssylki, esli priletelo /b/...
  let s = extractPossibleCode(raw);

  // trim + uppercase
  s = s.trim().toUpperCase();

  // ubrat probely vnutri
  s = s.replace(/\s+/g, "");
  if (!s) return "";

  // esli vveli tolko telo XXXXXXXX -> dobavljaem WC-
  if (BODY_RE.test(s)) return `${WRISTBAND_PREFIX}${s}`;

  // esli vveli WCXXXXXXXX (bez defisa) -> vstavit defis
  if (s.startsWith("WC") && s.length === 2 + CODE_BODY_LEN) {
    const body = s.slice(2);
    if (BODY_RE.test(body)) return `${WRISTBAND_PREFIX}${body}`;
  }

  // esli vveli WC-XXXXXXXX
  if (FULL_RE.test(s)) return s;

  return s;
}

export function isValidCode(code: string): boolean {
  if (!code) return false;
  return FULL_RE.test(code);
}
