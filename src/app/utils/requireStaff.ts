"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

const STAFF_KEY = "staff_ok";          // boolean "1"
const STAFF_UNTIL_KEY = "staff_until"; // number (ms)

// nastrojki
const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 chasov
const IDLE_TIMEOUT_MS = 10 * 60 * 1000;    // 10 minut bez dejstvij
const HIDDEN_LOCK_MS = 30 * 1000;          // esli stranicu spryatali na 30s -> lock

function clearStaff() {
  try {
    localStorage.removeItem(STAFF_KEY);
    localStorage.removeItem(STAFF_UNTIL_KEY);
  } catch {}
}

function isStaffValid() {
  try {
    const ok = localStorage.getItem(STAFF_KEY) === "1";
    const untilRaw = localStorage.getItem(STAFF_UNTIL_KEY);
    const until = untilRaw ? Number(untilRaw) : 0;
    return ok && Number.isFinite(until) && until > Date.now();
  } catch {
    return false;
  }
}

export function useRequireStaff() {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const goLogin = () => {
      setReady(false);
      router.replace(`/login?next=${encodeURIComponent(pathname || "/")}`);
    };

    // 1) pervichnaja proverka
    if (!isStaffValid()) {
      clearStaff();
      goLogin();
      return;
    }
    setReady(true);

    // 2) idle logout
    let idleTimer: ReturnType<typeof setTimeout> | null = null;
    const resetIdle = () => {
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        clearStaff();
        goLogin();
      }, IDLE_TIMEOUT_MS);
    };

    // 3) lock kogda app "spryatali" (telefon lock / sverнули)
    let hiddenTimer: ReturnType<typeof setTimeout> | null = null;
    const onVis = () => {
      if (document.hidden) {
        if (hiddenTimer) clearTimeout(hiddenTimer);
        hiddenTimer = setTimeout(() => {
          clearStaff();
          goLogin();
        }, HIDDEN_LOCK_MS);
      } else {
        if (hiddenTimer) clearTimeout(hiddenTimer);
        resetIdle();
        // esli session uzhe prosrochena poka app byla svernutа
        if (!isStaffValid()) {
          clearStaff();
          goLogin();
        }
      }
    };

    // sobytija aktivnosti
    const events = ["mousemove", "keydown", "click", "touchstart", "scroll"];
    const onActivity = () => resetIdle();

    events.forEach((e) => window.addEventListener(e, onActivity, { passive: true }));
    document.addEventListener("visibilitychange", onVis);

    // start timers
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
  localStorage.setItem(STAFF_KEY, "1");
  localStorage.setItem(STAFF_UNTIL_KEY, String(until));
}
