"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

const STAFF_KEY = "staff_ok"; // boolean "1"
const STAFF_UNTIL_KEY = "staff_until"; // number (ms)

// nastroyki
const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 chasov
const IDLE_TIMEOUT_MS = 10 * 60 * 1000; // 10 minut bez dejstvij
const HIDDEN_LOCK_MS = 30 * 1000; // esli stranicu spryatali na 30s -> lock

function removeKeys(storage: Storage) {
  try {
    storage.removeItem(STAFF_KEY);
    storage.removeItem(STAFF_UNTIL_KEY);
  } catch {}
}

function clearStaffEverywhere() {
  // 🔥 ochishaem i sessionStorage i localStorage (na всякий)
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
    return { ok, until };
  } catch {
    return { ok: false, until: 0 };
  }
}

function isStaffValid() {
  // ✅ glavnaja izmenenie: chitaem iz sessionStorage,
  // znachit posle zakrytiya vkladki login budet zanovo
  const s = readSession(sessionStorage);
  return s.ok && Number.isFinite(s.until) && s.until > Date.now();
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

    // 1) pervichnaja proverka
    if (!isStaffValid()) {
      goLogin();
      return;
    }
    setReady(true);

    // 2) idle logout
    let idleTimer: ReturnType<typeof setTimeout> | null = null;
    const resetIdle = () => {
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        goLogin();
      }, IDLE_TIMEOUT_MS);
    };

    // 3) lock kogda app spryatali
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

        if (!isStaffValid()) {
          goLogin();
        }
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
export function setStaffSession() {
  const until = Date.now() + SESSION_TTL_MS;

  // ✅ pishem v sessionStorage (ne v localStorage)
  sessionStorage.setItem(STAFF_KEY, "1");
  sessionStorage.setItem(STAFF_UNTIL_KEY, String(until));

  // na всякий: ubiraem starye localStorage klyuchi, chtoby ne putalis'
  try {
    localStorage.removeItem(STAFF_KEY);
    localStorage.removeItem(STAFF_UNTIL_KEY);
  } catch {}
}

/**
 * optional: udobnyj logout helper
 */
export function staffLogout() {
  clearStaffEverywhere();
}
