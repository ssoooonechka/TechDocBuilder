import { create } from 'zustand';

const useThemeStore = create((set) => ({
  darkMode: localStorage.getItem('darkMode') === 'true' || false,
  toggleTheme: () => set((state) => {
    const newMode = !state.darkMode;
    localStorage.setItem('darkMode', newMode);
    return { darkMode: newMode };
  }),
}));

export default useThemeStore;