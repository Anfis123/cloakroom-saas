"use client";

import { create } from "zustand";

export type ItemStatus = "IN" | "OUT";

export type CloakroomItem = {
  code: string;
  status: ItemStatus;
  updatedAt: number;
};

type State = {
  items: CloakroomItem[];
  checkIn: (code: string) => void;
  checkOut: (code: string) => void;
  resetAll: () => void;
};

export const useCloakroomStore = create<State>((set, get) => ({
  items: [],

  // checkIn: ne dobavljaem dublikaty, a obnovljaem / vozvrashaem v IN
  checkIn: (raw) => {
    const code = raw.trim();
    if (!code) return;

    const now = Date.now();
    const items = get().items;

    const existing = items.find((it) => it.code === code);

    // esli uzhe IN — nichego ne delaem (net dublja)
    if (existing && existing.status === "IN") return;

    // esli byl OUT — vozvrashaem v IN
    if (existing) {
      set({
        items: items.map((it) =>
          it.code === code ? { ...it, status: "IN", updatedAt: now } : it
        ),
      });
      return;
    }

    // esli netu — dobavljaem novyj
    set({
      items: [{ code, status: "IN", updatedAt: now }, ...items],
    });
  },

  // checkOut: tolko esli etot kod sejchas IN
  checkOut: (raw) => {
    const code = raw.trim();
    if (!code) return;

    const now = Date.now();
    const items = get().items;

    const existing = items.find((it) => it.code === code);
    if (!existing) return;
    if (existing.status !== "IN") return;

    set({
      items: items.map((it) =>
        it.code === code ? { ...it, status: "OUT", updatedAt: now } : it
      ),
    });
  },

  resetAll: () => set({ items: [] }),
}));
