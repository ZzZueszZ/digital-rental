import { create } from 'zustand'

type LoadingStore = {
  requestCount: number
  startLoading: () => void
  stopLoading: () => void
  resetLoading: () => void
}

export const useLoadingStore = create<LoadingStore>((set) => ({
  requestCount: 0,
  startLoading: () => set((state) => ({ requestCount: state.requestCount + 1 })),
  stopLoading: () => set((state) => ({ requestCount: Math.max(0, state.requestCount - 1) })),
  resetLoading: () => set({ requestCount: 0 }),
}))
