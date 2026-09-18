// Sound UI state: whether audio has been unlocked by a user gesture yet
// ("enabled") and whether the visitor has muted it ("muted"). The actual
// Howler playback lives in src/lib/audio/sound.ts — this store is just the
// switch <SoundButton/> reads and flips.
import { create } from "zustand";

interface SoundState {
  enabled: boolean;
  muted: boolean;
  setEnabled: (enabled: boolean) => void;
  setMuted: (muted: boolean) => void;
  toggleMuted: () => void;
}

export const useSoundStore = create<SoundState>((set, get) => ({
  enabled: false,
  muted: false,
  setEnabled: (enabled) => set({ enabled }),
  setMuted: (muted) => set({ muted }),
  toggleMuted: () => set({ muted: !get().muted }),
}));
