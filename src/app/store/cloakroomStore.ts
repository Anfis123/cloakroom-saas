import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ItemStatus = "IN" | "OUT";

export type CloakroomItem = {
  code: string;
  status: ItemStatus;
  checkedInAt: number; // timestamp
  checkedOutAt?: number; // timestamp
};

type CloakroomState = {
  items: CloakroomItem[];

  checkIn: (code: string) => { ok: boolean; reason?: string };
  checkOut: (code: string) => { ok: boolean; reason?: string };
  resetAll: () => void;
};

export const useCloakroomStore = create<CloakroomState>()(
  persist(
    (set, get) => ({
      items: [],

      checkIn: (rawCode) => {
        const code = rawCode.trim();
        if (!code) return { ok: false, reason: "EMPTY_CODE" };

        const items = get().items;
        const existing = items.find((it) => it.code === code);

        // ✅ esli uzhe IN — ne dobavlyaem dublikat
        if (existing && existing.status === "IN") {
          return { ok: true, reason: "ALREADY_IN" };
        }

        // ✅ esli byl OUT — vozvraschaem v IN
        if (existing && existing.status === "OUT") {
          set({
            items: items.map((it) =>
              it.code === code
                ? { ...it, status: "IN", checkedInAt: Date.now(), checkedOutAt: undefined }
                : it
            ),
          });
          return { ok: true, reason: "REOPENED" };
        }

        // ✅ esli netu — dobavlyaem novyj
        set({
          items: [
            ...items,
            {
              code,
              status: "IN",
              checkedInAt: Date.now(),
            },
          ],
        });

        return { ok: true };
      },

      checkOut: (rawCode) => {
        const code = rawCode.trim();
        if (!code) return { ok: false, reason: "EMPTY_CODE" };

        const items = get().items;
        const existing = items.find((it) => it.code === code);

        if (!existing) return { ok: false, reason: "NOT_FOUND" };
        if (existing.status === "OUT") return { ok: false, reason: "ALREADY_OUT" };

        set({
          items: items.map((it) =>
            it.code === code ? { ...it, status: "OUT", checkedOutAt: Date.now() } : it
          ),
        });

        return { ok: true };
      },

      resetAll: () => set({ items: [] }),
    }),
    { name: "cloakroom-store-v1" }
  )
);
