import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import authService from '../services/authService'

const authStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      isLogged: false,
      loading: false,

      // Actions
      login: async (credentials) => {
        set({ loading: true })
        
        try {
          // Önce eski cache'leri tamamen temizle
          if (window.queryClient) {
            window.queryClient.clear()
          }
          
          const result = await authService.login(credentials)
          
          if (result.success) {
            set({
              user: result.data.user,
              token: result.data.token,
              isLogged: true,
              loading: false
            })
            
            return { success: true }
          } else {
            set({ loading: false })
            return { success: false, error: result.error }
          }
        } catch (error) {
          set({ loading: false })
          return { success: false, error: 'Bir hata oluştu' }
        }
      },

      logout: async () => {
        try {
          // Backend'e logout isteği gönder
          await authService.logout()
        } catch (error) {
          console.log('Logout request failed:', error)
        }
        
        // Tüm cache'leri tamamen temizle
        if (window.queryClient) {
          window.queryClient.clear()
          console.log('Query cache cleared')
        }
        
        // Session storage'ı tamamen temizle
        sessionStorage.clear()
        
        // Local state'i temizle
        set({
          user: null,
          token: null,
          isLogged: false,
          loading: false
        })
        
        // İsteğe bağlı: Tam temizlik için sayfayı yenile
        setTimeout(() => {
          window.location.href = '/login'
        }, 100)
      },

      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      setLoading: (loading) => set({ loading }),

      // Getters
      getUserRole: () => get().user?.type || 'customer',
      isAdmin: () => get().user?.type === 'admin',
      getCompanyName: () => get().user?.company || '',
    }),
    {
      name: 'auth-storage',
      // SessionStorage kullan - sekme kapanınca siler
      storage: {
        getItem: (name) => {
          const item = sessionStorage.getItem(name)
          return item ? JSON.parse(item) : null
        },
        setItem: (name, value) => {
          sessionStorage.setItem(name, JSON.stringify(value))
        },
        removeItem: (name) => {
          sessionStorage.removeItem(name)
        },
      },
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isLogged: state.isLogged
      })
    }
  )
)

export default authStore