"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

const STAFF_KEY = "staff_ok"; // "1"
const STAFF_UNTIL_KEY = "staff_until"; // ms
const ROLE_KEY = "staff_role"; // "staff" | "admin"

// nastroyki
const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 chasov
const IDLE_TIMEOUT_MS = 10 * 60 * 1000; // 10 minut bez dejstvij
const HIDDEN_LOCK_MS = 30 * 1000; // esli stranicu spryatali na 30s -> lock

type StaffRole = "staff" | "admin";

function removeKeys(storage: Storage) {
  try {
    storage.removeItem(STAFF_KEY);
    storage.removeItem(STAFF_UNTIL_KEY);
    storage.removeItem(ROLE_KEY);
  } catch {}
}

function clearStaffEverywhere() {
  try {
    removeKeys(sessionStorage);
  } catch {}
  try {
    removeKeys(localStorage);
  } catch {}
}

function readSession(storage: Storage) {
  try {
    const ok = storage.getItem(STAFF_KEY) === "1";
    const untilRaw = storage.getItem(STAFF_UNTIL_KEY);
    const until = untilRaw ? Number(untilRaw) : 0;
    const role = (storage.getItem(ROLE_KEY) as StaffRole | null) || "staff";
    return { ok, until, role };
  } catch {
    return { ok: false, until: 0, role: "staff" as StaffRole };
  }
}

function isStaffValid() {
  const s = readSession(sessionStorage);
  return s.ok && Number.isFinite(s.until) && s.until > Date.now();
}

export function getStaffRole(): StaffRole {
  const s = readSession(sessionStorage);
  return s.role || "staff";
}

export function isAdmin(): boolean {
  return getStaffRole() === "admin";
}

export function useIsAdmin() {
  const [admin, setAdmin] = useState(false);

  useEffect(() => {
    setAdmin(isAdmin());
    const onFocus = () => setAdmin(isAdmin());
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  return admin;
}

export function useRequireStaff() {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const goLogin = () => {
      setReady(false);
      clearStaffEverywhere();
      const next = pathname && pathname.startsWith("/") ? pathname : "/";
      router.replace(`/login?next=${encodeURIComponent(next)}`);
    };

    if (!isStaffValid()) {
      goLogin();
      return;
    }
    setReady(true);

    let idleTimer: ReturnType<typeof setTimeout> | null = null;
    const resetIdle = () => {
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        goLogin();
      }, IDLE_TIMEOUT_MS);
    };

    let hiddenTimer: ReturnType<typeof setTimeout> | null = null;
    const onVis = () => {
      if (document.hidden) {
        if (hiddenTimer) clearTimeout(hiddenTimer);
        hiddenTimer = setTimeout(() => {
          goLogin();
        }, HIDDEN_LOCK_MS);
      } else {
        if (hiddenTimer) clearTimeout(hiddenTimer);
        resetIdle();
        if (!isStaffValid()) goLogin();
      }
    };

    const events = ["mousemove", "keydown", "click", "touchstart", "scroll"] as const;
    const onActivity = () => resetIdle();

    events.forEach((e) => window.addEventListener(e, onActivity, { passive: true }));
    document.addEventListener("visibilitychange", onVis);

    resetIdle();

    return () => {
      if (idleTimer) clearTimeout(idleTimer);
      if (hiddenTimer) clearTimeout(hiddenTimer);
      events.forEach((e) => window.removeEventListener(e, onActivity as any));
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [router, pathname]);

  return ready;
}

/**
 * helper dlya login page:
 * vyzyvaj posle vernoj proverki PIN
 */
export function setStaffSession(role: StaffRole = "staff") {
  const until = Date.now() + SESSION_TTL_MS;

  sessionStorage.setItem(STAFF_KEY, "1");
  sessionStorage.setItem(STAFF_UNTIL_KEY, String(until));
  sessionStorage.setItem(ROLE_KEY, role);

  try {
    localStorage.removeItem(STAFF_KEY);
    localStorage.removeItem(STAFF_UNTIL_KEY);
    localStorage.removeItem(ROLE_KEY);
  } catch {}
}

/**
 * udobnyj logout helper
 */
export function staffLogout() {
  clearStaffEverywhere();
}
