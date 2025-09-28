import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// API endpoints
const cartAPI = {
  getCart: () => fetch('/api/cart', {
    headers: { 'Authorization': `Bearer ${getToken()}` }
  }).then(res => res.json()),
  
  addItem: (item) => fetch('/api/cart/items', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`
    },
    body: JSON.stringify(item)
  }).then(res => res.json()),
  
  updateQuantity: (stkno, adet) => fetch(`/api/cart/items/${stkno}`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`
    },
    body: JSON.stringify({ adet })
  }).then(res => res.json()),
  
  removeItem: (stkno) => fetch(`/api/cart/items/${stkno}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${getToken()}` }
  }).then(res => res.json()),
  
  clearCart: () => fetch('/api/cart', {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${getToken()}` }
  }).then(res => res.json()),
  
  syncCart: (items) => fetch('/api/cart/sync', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`
    },
    body: JSON.stringify({ items })
  }).then(res => res.json())
}

// Helper functions
const getCurrentUser = () => {
  try {
    const authData = JSON.parse(sessionStorage.getItem('auth-storage') || '{}')
    return authData?.state?.user?.username || null
  } catch {
    return null
  }
}

const getToken = () => {
  try {
    const authData = JSON.parse(sessionStorage.getItem('auth-storage') || '{}')
    const token = authData?.state?.token || null
    
    // Eğer token zaten "Bearer " ile başlıyorsa, sadece token'ı döndür
    if (token && token.startsWith('Bearer ')) {
      return token.substring(7) // "Bearer " kısmını çıkar
    }
    
    return token
  } catch {
    return null
  }
}

const getStorageKey = (username) => {
  return `cart-storage-${username || 'guest'}`
}

// Local storage operations
const loadLocalCart = (username) => {
  try {
    const storageKey = getStorageKey(username)
    const savedData = localStorage.getItem(storageKey)
    
    if (savedData) {
      const parsedData = JSON.parse(savedData)
      return {
        items: parsedData.state?.items || [],
        userId: username,
        lastSyncedAt: parsedData.state?.lastSyncedAt || null
      }
    }
  } catch (error) {
    console.log('Error loading local cart:', error)
  }
  
  return {
    items: [],
    userId: username,
    lastSyncedAt: null
  }
}

const saveLocalCart = (username, items, lastSyncedAt = new Date()) => {
  try {
    const storageKey = getStorageKey(username)
    const dataToSave = {
      state: {
        items: items,
        userId: username,
        lastSyncedAt: lastSyncedAt
      },
      version: 0
    }
    localStorage.setItem(storageKey, JSON.stringify(dataToSave))
  } catch (error) {
    console.log('Error saving local cart:', error)
  }
}

const useCartStore = create(
  persist(
    (set, get) => ({
      // State
      items: [],
      isOpen: false,
      userId: getCurrentUser(),
      lastSyncedAt: null,
      isLoading: false,
      isSyncing: false,

      // Actions
      addItem: async (product, quantity = 1) => {
        const currentUser = getCurrentUser()
        const token = getToken()
        
        if (get().userId !== currentUser) {
          set({ userId: currentUser })
        }

        const items = get().items
        const existingItem = items.find(item => item.stkno === product.stkno)
        
        let newItems
        if (existingItem) {
          newItems = items.map(item =>
            item.stkno === product.stkno
              ? { ...item, adet: item.adet + quantity }
              : item
          )
        } else {
          newItems = [...items, { ...product, adet: quantity }]
        }
        
        // Önce local'da güncelle (instant feedback)
        set({ items: newItems })
        saveLocalCart(currentUser, newItems)
        
        // Sonra server'a gönder (background)
        if (token) {
          try {
            const response = await cartAPI.addItem({
              ...product,
              adet: quantity
            })
            
            if (response.success) {
              // Server response ile sync et
              set({ 
                items: response.data.items,
                lastSyncedAt: response.data.lastSyncedAt
              })
              saveLocalCart(currentUser, response.data.items, response.data.lastSyncedAt)
            }
          } catch (error) {
            console.log('Server sync failed, keeping local changes:', error)
            // Local değişiklik korunur, sonra sync'te denenir
          }
        }
      },

      removeItem: async (productId) => {
        const currentUser = getCurrentUser()
        const token = getToken()
        const newItems = get().items.filter(item => item.stkno !== productId)
        
        // Önce local'da güncelle
        set({ items: newItems })
        saveLocalCart(currentUser, newItems)
        
        // Server'a gönder
        if (token) {
          try {
            const response = await cartAPI.removeItem(productId)
            if (response.success) {
              set({ 
                items: response.data.items,
                lastSyncedAt: response.data.lastSyncedAt
              })
              saveLocalCart(currentUser, response.data.items, response.data.lastSyncedAt)
            }
          } catch (error) {
            console.log('Server sync failed for remove:', error)
          }
        }
      },

      updateQuantity: async (productId, quantity) => {
        const currentUser = getCurrentUser()
        const token = getToken()
        
        if (quantity <= 0) {
          get().removeItem(productId)
          return
        }
        
        const newItems = get().items.map(item =>
          item.stkno === productId
            ? { ...item, adet: quantity }
            : item
        )
        
        // Önce local'da güncelle
        set({ items: newItems })
        saveLocalCart(currentUser, newItems)
        
        // Server'a gönder
        if (token) {
          try {
            const response = await cartAPI.updateQuantity(productId, quantity)
            if (response.success) {
              set({ 
                items: response.data.items,
                lastSyncedAt: response.data.lastSyncedAt
              })
              saveLocalCart(currentUser, response.data.items, response.data.lastSyncedAt)
            }
          } catch (error) {
            console.log('Server sync failed for update:', error)
          }
        }
      },

      clearCart: async () => {
        const currentUser = getCurrentUser()
        const token = getToken()
        
        // Önce local'da temizle
        set({ items: [] })
        saveLocalCart(currentUser, [])
        
        // Server'da temizle
        if (token) {
          try {
            const response = await cartAPI.clearCart()
            if (response.success) {
              set({ lastSyncedAt: response.data.lastSyncedAt })
              saveLocalCart(currentUser, [], response.data.lastSyncedAt)
            }
          } catch (error) {
            console.log('Server sync failed for clear:', error)
          }
        }
      },

      setIsOpen: (isOpen) => set({ isOpen }),

      // Login olduğunda server ile sync yap
      syncWithServer: async () => {
        const currentUser = getCurrentUser()
        const token = getToken()
        
        if (!token || !currentUser) {
          console.log('No token or user, skipping sync')
          return
        }
        
        set({ isSyncing: true })
        
        try {
          // Local cart'ı yükle
          const localData = loadLocalCart(currentUser)
          
          // Server'dan cart'ı çek
          const serverResponse = await cartAPI.getCart()
          
          if (serverResponse.success) {
            const serverItems = serverResponse.data.items || []
            const serverLastSync = serverResponse.data.lastSyncedAt
            
            // Eğer local'da item varsa ve server'da yoksa, sync et
            if (localData.items.length > 0 && serverItems.length === 0) {
              const syncResponse = await cartAPI.syncCart(localData.items)
              if (syncResponse.success) {
                set({ 
                  items: syncResponse.data.items,
                  userId: currentUser,
                  lastSyncedAt: syncResponse.data.lastSyncedAt
                })
                saveLocalCart(currentUser, syncResponse.data.items, syncResponse.data.lastSyncedAt)
              }
            } else {
              // Server'daki veriyi kullan
              set({ 
                items: serverItems,
                userId: currentUser,
                lastSyncedAt: serverLastSync
              })
              saveLocalCart(currentUser, serverItems, serverLastSync)
            }
          }
        } catch (error) {
          console.log('Sync failed, using local cart:', error)
          // Sync başarısız olursa local cart'ı yükle
          const localData = loadLocalCart(currentUser)
          set({ 
            items: localData.items,
            userId: localData.userId,
            lastSyncedAt: localData.lastSyncedAt
          })
        } finally {
          set({ isSyncing: false })
        }
      },

      // Local cart'ı yükle (offline mode)
      loadLocalCart: () => {
        const currentUser = getCurrentUser()
        const localData = loadLocalCart(currentUser)
        
        set({
          items: localData.items,
          userId: localData.userId,
          lastSyncedAt: localData.lastSyncedAt
        })
        
        console.log('Local cart loaded for user:', currentUser, 'Items:', localData.items.length)
      },

      // Backward compatibility
      updateUserId: () => {
        get().loadLocalCart()
      },
      
      checkUserAndClearIfNeeded: () => {
        get().loadLocalCart()
      },

      handleLogout: () => {
        set({ isOpen: false })
      },

      // Getters
      getTotalItems: () => get().items.reduce((sum, item) => sum + item.adet, 0),
      getTotalPrice: () => get().items.reduce((sum, item) => sum + (item.fiyat * item.adet), 0),
      getItemCount: () => get().items.length,
    }),
    {
      name: 'cart-storage-temp', // Temp key
      partialize: () => ({}), // Manuel storage kullanıyoruz
    }
  )
)

export default useCartStore