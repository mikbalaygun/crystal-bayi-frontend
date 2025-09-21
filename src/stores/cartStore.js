import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useCartStore = create(
  persist(
    (set, get) => ({
      // State
      items: [],
      isOpen: false,

      // Actions
      addItem: (product, quantity = 1) => {
        const items = get().items
        const existingItem = items.find(item => item.stkno === product.stkno)
        
        if (existingItem) {
          set({
            items: items.map(item =>
              item.stkno === product.stkno
                ? { ...item, adet: item.adet + quantity }
                : item
            )
          })
        } else {
          set({
            items: [...items, { ...product, adet: quantity }]
          })
        }
      },

      removeItem: (productId) => {
        set({
          items: get().items.filter(item => item.stkno !== productId)
        })
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId)
          return
        }
        
        set({
          items: get().items.map(item =>
            item.stkno === productId
              ? { ...item, adet: quantity }
              : item
          )
        })
      },

      clearCart: () => set({ items: [] }),

      setIsOpen: (isOpen) => set({ isOpen }),

      // Getters
      getTotalItems: () => get().items.reduce((sum, item) => sum + item.adet, 0),
      getTotalPrice: () => get().items.reduce((sum, item) => sum + (item.fiyat * item.adet), 0),
      getItemCount: () => get().items.length,
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({
        items: state.items
      })
    }
  )
)

export default useCartStore