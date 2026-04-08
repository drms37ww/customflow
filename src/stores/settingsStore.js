import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useSettingsStore = create(
  persist(
    (set) => ({
      theme: 'system',
      language: null, // null = auto-detect
      weekStart: 1, // 0=Sun, 1=Mon
      dayNameFormat: 'short', // 'full' | 'short'
      calendarDefaultView: 'month',
      fsrsRequestRetention: 0.9,
      fsrsMaximumInterval: 36500,
      fsrsEnableFuzz: true,
      pushEnabled: true,
      emailEnabled: true,

      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
      setWeekStart: (weekStart) => set({ weekStart }),
      setDayNameFormat: (dayNameFormat) => set({ dayNameFormat }),
      setCalendarDefaultView: (calendarDefaultView) => set({ calendarDefaultView }),
      setFsrsRequestRetention: (v) => set({ fsrsRequestRetention: v }),
      setFsrsMaximumInterval: (v) => set({ fsrsMaximumInterval: v }),
      setFsrsEnableFuzz: (v) => set({ fsrsEnableFuzz: v }),
      setPushEnabled: (v) => set({ pushEnabled: v }),
      setEmailEnabled: (v) => set({ emailEnabled: v }),
    }),
    {
      name: 'customflow-settings',
    }
  )
);
