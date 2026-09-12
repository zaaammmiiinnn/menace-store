'use client';

import { create } from 'zustand';

export type CursorType = 'default' | 'view' | 'add' | 'spin' | 'drag';

interface CursorState {
  cursorType: CursorType;
  cursorVisible: boolean;
  cursorPosition: { x: number; y: number };
  setCursorType: (type: CursorType) => void;
  setCursorPosition: (position: { x: number; y: number }) => void;
  resetCursor: () => void;
  hideCursor: () => void;
  showCursor: () => void;
}

export const useCursorStore = create<CursorState>((set) => ({
  cursorType: 'default',
  cursorVisible: true,
  cursorPosition: { x: -100, y: -100 },
  setCursorType: (type) => set({ cursorType: type }),
  setCursorPosition: (position) => set({ cursorPosition: position }),
  resetCursor: () => set({ cursorType: 'default' }),
  hideCursor: () => set({ cursorVisible: false }),
  showCursor: () => set({ cursorVisible: true }),
}));

export function useCursor() {
  const cursorType = useCursorStore((state) => state.cursorType);
  const cursorVisible = useCursorStore((state) => state.cursorVisible);
  const cursorPosition = useCursorStore((state) => state.cursorPosition);
  const setCursorType = useCursorStore((state) => state.setCursorType);
  const setCursorPosition = useCursorStore((state) => state.setCursorPosition);
  const resetCursor = useCursorStore((state) => state.resetCursor);
  const hideCursor = useCursorStore((state) => state.hideCursor);
  const showCursor = useCursorStore((state) => state.showCursor);

  return {
    cursorType,
    cursorVisible,
    cursorPosition,
    setCursorType,
    setCursorPosition,
    resetCursor,
    hideCursor,
    showCursor,
  };
}
