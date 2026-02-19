import { create } from "zustand";
import { persist } from "zustand/middleware";
import { isValidCode, normalizeCode } from "../utils/wristbandCode";

export type ActiveItem = {
  code: string;
  status: "IN";
  checkedInAt: number; // ms
  staff?: string;
};

export type HistoryEvent = {
  id: string;
  code: string;
  action: "IN" | "OUT";
  at: number; // ms
  staff?: string;
};

type CloakroomState = {
  items: ActiveItem[]; // tol'ko aktivnye (IN)
  history: HistoryEvent[]; // log sobytij (90 dnej)
  checkIn: (code: string) => void;
  checkOut: (code: string) => void;

  clearActiveItems: () => void; // ✅ admin-only knopka na UI
  clearAllData: () => void;     // ✅ na vsyakij (admin-only)

  clearHistory: () => void;
  cleanupHistory: () => void;
};

const HISTORY_RETENTION_MS = 90 * 24 * 60 * 60 * 1000; // 90 dnej
const MAX_HISTORY_EVENTS = 5000;

function now() {
  return Date.now();
}

function getStaffName(): string {
  try {
    const n = localStorage.getItem("staff_name");
    return (n && n.trim()) || "staff";
  } catch {
    return "staff";
  }
}

function makeId() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function cleanup(events: HistoryEvent[]) {
  const minTs = now() - HISTORY_RETENTION_MS;
  const filtered = events.filter((e) => e.at >= minTs);
  filtered.sort((a, b) => b.at - a.at);
  return filtered.slice(0, MAX_HISTORY_EVENTS);
}

export const useCloakroomStore = create<CloakroomState>()(
  persist(
    (set) => ({
      items: [],
      history: [],

      cleanupHistory: () => {
        set((state) => ({ history: cleanup(state.history) }));
      },

      clearHistory: () => set({ history: [] }),

      clearActiveItems: () => set({ items: [] }),

      clearAllData: () => set({ items: [], history: [] }),

      checkIn: (rawCode: string) => {
        const code = normalizeCode(rawCode);
        if (!code) return;
        if (!isValidCode(code)) return;

        const staff = getStaffName();

        set((state) => {
          if (state.items.some((it) => it.code === code)) {
            return { history: cleanup(state.history) };
          }

          const event: HistoryEvent = {
            id: makeId(),
            code,
            action: "IN",
            at: now(),
            staff,
          };

          const item: ActiveItem = {
            code,
            status: "IN",
            checkedInAt: event.at,
            staff,
          };

          return {
            items: [item, ...state.items],
            history: cleanup([event, ...state.history]),
          };
        });
      },

      checkOut: (rawCode: string) => {
        const code = normalizeCode(rawCode);
        if (!code) return;
        if (!isValidCode(code)) return;

        const staff = getStaffName();

        set((state) => {
          const exists = state.items.some((it) => it.code === code);
          if (!exists) {
            return { history: cleanup(state.history) };
          }

          const event: HistoryEvent = {
            id: makeId(),
            code,
            action: "OUT",
            at: now(),
            staff,
          };

          return {
            items: state.items.filter((it) => it.code !== code),
            history: cleanup([event, ...state.history]),
          };
        });
      },
    }),
    {
      name: "cloakroom-store-v1",
      partialize: (s) => ({
        items: s.items,
        history: s.history,
      }),
    }
  )
);
