import { create } from 'zustand';

type ThemeMode = 'dark' | 'light';

interface ThemeState {
  mode: ThemeMode;
  accent: string;
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  setAccent: (accentHex: string) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  mode: 'dark',
  accent: '#10B981', // Default emerald accent
  setMode: (mode) => set({ mode }),
  toggleTheme: () => set((state) => ({ mode: state.mode === 'dark' ? 'light' : 'dark' })),
  setAccent: (accent) => set({ accent }),
}));
