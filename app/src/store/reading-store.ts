import { create } from 'zustand';
import { DrawnCard, SpreadType } from '@/lib/tarot/types';

interface ReadingState {
  spreadType: SpreadType | null;
  question: string;
  drawnCards: DrawnCard[];
  revealedIndices: Set<number>;
  interpretation: string;
  readingId: string | null;
  isDrawing: boolean;
  isInterpreting: boolean;

  setSpreadType: (type: SpreadType) => void;
  setQuestion: (q: string) => void;
  setDrawnCards: (cards: DrawnCard[]) => void;
  revealCard: (index: number) => void;
  revealAll: () => void;
  setInterpretation: (text: string) => void;
  setReadingId: (id: string) => void;
  setIsDrawing: (v: boolean) => void;
  setIsInterpreting: (v: boolean) => void;
  reset: () => void;
}

const initialState = {
  spreadType: null as SpreadType | null,
  question: '',
  drawnCards: [] as DrawnCard[],
  revealedIndices: new Set<number>(),
  interpretation: '',
  readingId: null as string | null,
  isDrawing: false,
  isInterpreting: false,
};

export const useReadingStore = create<ReadingState>((set) => ({
  ...initialState,

  setSpreadType: (type) => set({ spreadType: type }),
  setQuestion: (q) => set({ question: q }),
  setDrawnCards: (cards) => set({ drawnCards: cards }),

  revealCard: (index) =>
    set((state) => ({
      revealedIndices: new Set([...Array.from(state.revealedIndices), index]),
    })),

  revealAll: () =>
    set((state) => ({
      revealedIndices: new Set(state.drawnCards.map((_, i) => i)),
    })),

  setInterpretation: (text) => set({ interpretation: text }),
  setReadingId: (id) => set({ readingId: id }),
  setIsDrawing: (v) => set({ isDrawing: v }),
  setIsInterpreting: (v) => set({ isInterpreting: v }),

  reset: () => set({ ...initialState, revealedIndices: new Set() }),
}));
