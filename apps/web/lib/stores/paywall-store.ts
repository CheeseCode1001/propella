import { create } from 'zustand'

interface PaywallState {
  isOpen: boolean
  feature?: string
  message?: string
  openPaywall: (feature?: string, message?: string) => void
  closePaywall: () => void
}

export const usePaywallStore = create<PaywallState>((set) => ({
  isOpen: false,
  feature: undefined,
  message: undefined,
  openPaywall: (feature, message) => set({ isOpen: true, feature, message }),
  closePaywall: () => set({ isOpen: false, feature: undefined, message: undefined }),
}))
