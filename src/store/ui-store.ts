import { create } from 'zustand';

export type CursorType = 'default' | 'view' | 'add' | 'spin' | 'drag' | string;

export interface UiState {
  isLoading: boolean;
  isMenuOpen: boolean;
  isMobile: boolean;
  cursorType: CursorType;
  cursorVisible: boolean;
  hasInteractedWith3D: boolean;
  activeColorway: string;
  activeSize: string;
  isConfettiActive: boolean;
  toastMessage: string | null;
  setLoading: (isLoading: boolean) => void;
  setMenuOpen: (isMenuOpen: boolean) => void;
  setIsMenuOpen: (isMenuOpen: boolean) => void;
  setMobile: (isMobile: boolean) => void;
  setCursorType: (cursorType: CursorType) => void;
  setCursorVisible: (cursorVisible: boolean) => void;
  setHasInteractedWith3D: (hasInteractedWith3D: boolean) => void;
  setActiveColorway: (activeColorway: string) => void;
  setActiveSize: (activeSize: string) => void;
  triggerConfetti: () => void;
  showToast: (message: string) => void;
  hideToast: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  isLoading: true,
  isMenuOpen: false,
  isMobile: false,
  cursorType: 'default',
  cursorVisible: true,
  hasInteractedWith3D: false,
  activeColorway: '',
  activeSize: '',
  isConfettiActive: false,
  toastMessage: null,

  setLoading: (isLoading) => set({ isLoading }),
  setMenuOpen: (isMenuOpen) => set({ isMenuOpen }),
  setIsMenuOpen: (isMenuOpen) => set({ isMenuOpen }),
  setMobile: (isMobile) => set({ isMobile }),
  setCursorType: (cursorType) => set({ cursorType }),
  setCursorVisible: (cursorVisible) => set({ cursorVisible }),
  setHasInteractedWith3D: (hasInteractedWith3D) => set({ hasInteractedWith3D }),
  setActiveColorway: (activeColorway) => set({ activeColorway }),
  setActiveSize: (activeSize) => set({ activeSize }),
  triggerConfetti: () => {
    set({ isConfettiActive: true });
    setTimeout(() => set({ isConfettiActive: false }), 4000);
  },
  showToast: (message) => {
    set({ toastMessage: message });
    setTimeout(() => set({ toastMessage: null }), 3500);
  },
  hideToast: () => set({ toastMessage: null }),
}));

export const useUIStore = useUiStore;
