"use client";

import { create } from "zustand";

type CloakroomState = {
  items: string[];
  checkIn: (code: string) => void;
  checkOut: (code: string) => void;
};

export const useCloakroomStore = create<CloakroomState>((set) => ({
  items: [],

  checkIn: (code) =>
    set((state) => ({
      // добавляем в начало списка
      items: [code, ...state.items],
    })),

  checkOut: (code) =>
    set((state) => {
      // ✅ удаляем только ОДНО вхождение (первое найденное)
      const idx = state.items.indexOf(code);
      if (idx === -1) return state;

      const next = state.items.slice();
      next.splice(idx, 1);
      return { items: next };
    }),
}));
