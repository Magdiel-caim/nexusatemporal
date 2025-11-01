import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LGPDState {
  consent: boolean;
  hasInteracted: boolean;
  acceptCookies: () => void;
  openManage: () => void;
}

export const useLGPDStore = create<LGPDState>()(
  persist(
    (set) => ({
      consent: false,
      hasInteracted: false,
      acceptCookies: () =>
        set({
          consent: true,
          hasInteracted: true,
        }),
      openManage: () => {
        // Open cookie management modal
        // This will be implemented in the LGPD component
        console.log('Open cookie management');
      },
    }),
    {
      name: 'lgpd_consent',
    }
  )
);
