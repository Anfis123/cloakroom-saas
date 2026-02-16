"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

const STAFF_KEY = "staff_ok"; // boolean "1"
const STAFF_UNTIL_KEY = "staff_until"; // number (ms)

// настройки
const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 часов
const IDLE_TIMEOUT_MS = 10 * 60 * 1000; // 10 минут без действий
const HIDDEN_LOCK_MS = 30 * 1000; // если страницу спрятали на 30s -> lock

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
    // удобная функция редиректа на логин (с возвратом назад)
    const goLogin = () => {
      setReady(false);
      clearStaff();
      router.replace(`/login?next=${encodeURIComponent(pathname || "/")}`);
    };

    // 1) первичная проверка
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

    // 3) lock когда app "спрятали" (телефон lock / свернули)
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

        // если сессия уже просрочена пока приложение было свернуто
        if (!isStaffValid()) {
          goLogin();
        }
      }
    };

    // события активности
    const events = ["mousemove", "keydown", "click", "touchstart", "scroll"] as const;
    const onActivity = () => resetIdle();

    events.forEach((e) => window.addEventListener(e, onActivity, { passive: true }));
    document.addEventListener("visibilitychange", onVis);

    // стартуем таймеры
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
 * helper для login page:
 * вызывай после верной проверки PIN
 */
export function setStaffSession() {
  const until = Date.now() + SESSION_TTL_MS;
  localStorage.setItem(STAFF_KEY, "1");
  localStorage.setItem(STAFF_UNTIL_KEY, String(until));
}
