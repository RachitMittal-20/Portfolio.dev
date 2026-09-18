// Global menu-overlay open state, so the header's menu button and the
// overlay itself (mounted separately in the root layout) can agree on it.
import { create } from "zustand";

interface MenuState {
  open: boolean;
  toggle: () => void;
  close: () => void;
}

export const useMenuStore = create<MenuState>((set, get) => ({
  open: false,
  toggle: () => set({ open: !get().open }),
  close: () => set({ open: false }),
}));
