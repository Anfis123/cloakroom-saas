import { create } from "zustand";

export type CloakroomStatus = "IN" | "OUT";

export type CloakroomEvent = {
  type: CloakroomStatus; // IN / OUT
  at: number;            // Date.now()
  staff?: string;        // optional: staff name/id
};

export type CloakroomItem = {
  code: string;
  status: CloakroomStatus;
  createdAt: number;     // when first seen
  updatedAt: number;     // last change
  events: CloakroomEvent[];
};

type CheckResult =
  | { ok: true }
  | { ok: false; reason: "NOT_FOUND" | "ALREADY_IN" | "ALREADY_OUT" };

type CloakroomState = {
  items: CloakroomItem[];

  // derived helpers (optional convenience)
  getActive: () => CloakroomItem[];
  getHistory: () => CloakroomItem[];

  checkIn: (code: string) => CheckResult;
  checkOut: (code: string) => CheckResult;

  // optional: clean old OUT items from history (does NOT touch active)
  clearHistoryOlderThan: (ms: number) => void;
};

function now() {
  return Date.now();
}

function readStaffLabel(): string | undefined {
  // если захочешь: на login странице сохрани localStorage.setItem("staff_name", "Anfisa")
  try {
    const s = localStorage.getItem("staff_name");
    return s && s.trim() ? s.trim() : undefined;
  } catch {
    return undefined;
  }
}

export const useCloakroomStore = create<CloakroomState>((set, get) => ({
  items: [],

  getActive: () => get().items.filter((it) => it.status === "IN"),
  getHistory: () => get().items.filter((it) => it.status === "OUT"),

  checkIn: (raw: string) => {
    const code = raw.trim();
    if (!code) return { ok: false, reason: "NOT_FOUND" };

    const staff = readStaffLabel();
    const t = now();

    let result: CheckResult = { ok: true };

    set((state) => {
      const idx = state.items.findIndex((it) => it.code === code);

      // новый item
      if (idx === -1) {
        const item: CloakroomItem = {
          code,
          status: "IN",
          createdAt: t,
          updatedAt: t,
          events: [{ type: "IN", at: t, staff }],
        };
        return { items: [item, ...state.items] };
      }

      const item = state.items[idx];

      // уже IN -> не дублируем
      if (item.status === "IN") {
        result = { ok: false, reason: "ALREADY_IN" };
        return state;
      }

      // был OUT -> снова IN (это нормально, пишем новый event)
      const updated: CloakroomItem = {
        ...item,
        status: "IN",
        updatedAt: t,
        events: [...item.events, { type: "IN", at: t, staff }],
      };

      const items = state.items.slice();
      items[idx] = updated;

      // поднимем вверх список (удобнее)
      items.sort((a, b) => b.updatedAt - a.updatedAt);

      return { items };
    });

    return result;
  },

  checkOut: (raw: string) => {
    const code = raw.trim();
    if (!code) return { ok: false, reason: "NOT_FOUND" };

    const staff = readStaffLabel();
    const t = now();

    let result: CheckResult = { ok: true };

    set((state) => {
      const idx = state.items.findIndex((it) => it.code === code);
      if (idx === -1) {
        result = { ok: false, reason: "NOT_FOUND" };
        return state;
      }

      const item = state.items[idx];

      // уже OUT -> второй раз не снимаем
      if (item.status === "OUT") {
        result = { ok: false, reason: "ALREADY_OUT" };
        return state;
      }

      const updated: CloakroomItem = {
        ...item,
        status: "OUT",
        updatedAt: t,
        events: [...item.events, { type: "OUT", at: t, staff }],
      };

      const items = state.items.slice();
      items[idx] = updated;

      // сортировка по последнему действию
      items.sort((a, b) => b.updatedAt - a.updatedAt);

      return { items };
    });

    return result;
  },

  clearHistoryOlderThan: (ms: number) => {
    const cutoff = now() - ms;
    set((state) => ({
      items: state.items.filter((it) => !(it.status === "OUT" && it.updatedAt < cutoff)),
    }));
  },
}));
