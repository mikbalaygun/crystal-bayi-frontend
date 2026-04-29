import { create } from 'zustand'

const useGlobalStore = create((set) => ({
  // UI State
  sidebarOpen: false,
  darkMode: false,
  loading: false,
  
  // Modals
  modals: {},

  // Actions
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  
  setDarkMode: (darkMode) => set({ darkMode }),
  toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
  
  setLoading: (loading) => set({ loading }),
  
  openModal: (modalId) => set((state) => ({ 
    modals: { ...state.modals, [modalId]: true } 
  })),
  
  closeModal: (modalId) => set((state) => ({ 
    modals: { ...state.modals, [modalId]: false } 
  })),
  
  toggleModal: (modalId) => set((state) => ({ 
    modals: { ...state.modals, [modalId]: !state.modals[modalId] } 
  })),
}))

export default useGlobalStore