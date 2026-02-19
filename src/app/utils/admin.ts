// ✅ FILE: src/app/utils/admin.ts
"use client";

const ADMIN_KEY = "admin_ok"; // boolean "1"

// prosto proverka
export function isAdmin(): boolean {
  try {
    return sessionStorage.getItem(ADMIN_KEY) === "1";
  } catch {
    return false;
  }
}

// stavim admin flag (posle vernog ADMIN PIN)
export function setAdminSession() {
  try {
    sessionStorage.setItem(ADMIN_KEY, "1");
  } catch {}
}

// snimaem admin flag (logout)
export function clearAdminSession() {
  try {
    sessionStorage.removeItem(ADMIN_KEY);
  } catch {}
}
