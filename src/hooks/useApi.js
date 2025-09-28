import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '../stores'
import productService from '../services/productService'
import orderService from '../services/orderService'
import { contactService } from '../services'

/**
 * LISTE: Mongo'dan sayfalı liste
 * usage: useProducts({ fgrp, fagrp, page, limit }, { enabled: !isSearching })
 */
export const useProducts = (filters = {}, options = {}) => {
  const { user } = useAuthStore()
  const { enabled = true, keepPreviousData = true } = options
  
  return useQuery({
    queryKey: ['products', user?.username, filters], // username kullan
    queryFn: async () => {
      const res = await productService.getProducts(filters)
      if (!res.success) throw new Error(res.error || 'Ürünler getirilemedi')
      return res.data
    },
    enabled: enabled && !!user?.username, // username kontrolü
    keepPreviousData,
  })
}

/**
 * ARAMA: Mongo full-text/prefix + sayfalı
 */
export const useSearchProducts = (q, params = {}, options = {}) => {
  const { user } = useAuthStore()
  const {
    page = 1,
    limit = 24,
    fgrp,
    fagrp,
  } = params
  const { enabled = true, keepPreviousData = true } = options

  return useQuery({
    queryKey: ['products-search', user?.username, q, page, limit, fgrp, fagrp], // username kullan
    queryFn: async () => {
      const res = await productService.searchProducts(q, { page, limit, fgrp, fagrp })
      if (!res.success) throw new Error(res.error || 'Ürün arama başarısız')
      return res.data
    },
    enabled: enabled && !!user?.username, // username kontrolü
    keepPreviousData,
  })
}

/** KATEGORİLER */
export const useProductGroups = () => {
  const { user } = useAuthStore()
  
  return useQuery({
    queryKey: ['product-groups', user?.username], // username kullan
    queryFn: async () => {
      const res = await productService.getProductGroups()
      if (!res.success) throw new Error(res.error || 'Ürün grupları getirilemedi')
      return res.data
    },
    enabled: !!user?.username, // username kontrolü
    staleTime: 5 * 60 * 1000,
  })
}

/** FAVORİLER */
export const useFavoriteProducts = () => {
  const { user } = useAuthStore()
  
  return useQuery({
    queryKey: ['favorite-products', user?.username], // username kullan
    queryFn: async () => {
      const res = await productService.getFavoriteProducts()
      if (!res.success) throw new Error(res.error || 'Favori ürünler getirilemedi')
      return res.data
    },
    enabled: !!user?.username, // username kontrolü
  })
}

/** SİPARİŞLER & DASHBOARD */
export const useOrders = () => {
  const { user } = useAuthStore()
  
  return useQuery({
    queryKey: ['orders', user?.username], // username kullan
    queryFn: async () => {
      const res = await orderService.getOrders()
      if (!res.success) throw new Error(res.error || 'Siparişler getirilemedi')
      return res.data
    },
    enabled: !!user?.username, // username kontrolü
  })
}

export const useDashboardStats = () => {
  const { user } = useAuthStore()
  
  return useQuery({
    queryKey: ['dashboard-stats', user?.username], // username kullan
    queryFn: async () => {
      const res = await orderService.getDashboardStats()
      if (!res.success) throw new Error(res.error || 'İstatistikler getirilemedi')
      return res.data
    },
    enabled: !!user?.username, // username kontrolü
  })
}

/** MUTATIONS */
export const useCreateOrder = () => {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (products) => orderService.createOrder(products),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders', user?.username] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats', user?.username] })
    },
  })
}

export const useAddToFavorites = () => {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (product) => productService.addToFavorites(product),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorite-products', user?.username] })
    },
  })
}

export const useRemoveFromFavorites = () => {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (product) => productService.removeFromFavorites(product),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorite-products', user?.username] })
    },
  })
}

/**
 * TOGGLE FAVORİ
 */
export const useToggleFavorite = () => {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (stkno) => {
      const currentFavorites = queryClient.getQueryData(['favorite-products', user?.username]) || []
      const isFavorite = currentFavorites.some(fav => fav.stkno === stkno)
      
      if (isFavorite) {
        const res = await productService.removeFromFavorites({ stkno })
        if (!res.success) throw new Error(res.error || 'Favorilerden çıkarılamadı')
        return { action: 'removed', ...res }
      } else {
        const res = await productService.addToFavorites({ stkno })
        if (!res.success) throw new Error(res.error || 'Favorilere eklenemedi')
        return { action: 'added', ...res }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorite-products', user?.username] })
    },
  })
}

/** CONTACT HOOKS */

// Müşteri temsilcisi bilgisini getir
export const useCustomerRepresentative = () => {
  const { user } = useAuthStore()
  
  return useQuery({
    queryKey: ['customerRepresentative', user?.username],
    queryFn: contactService.getCustomerRepresentative,
    enabled: !!user?.username && !!user?.hesap, // username ve hesap kodu varsa çalışsın
    staleTime: 5 * 60 * 1000, // 5 dakika cache
    cacheTime: 10 * 60 * 1000, // 10 dakika cache
    retry: 1, // Sadece 1 kez retry
    refetchOnWindowFocus: false,
  })
}

// İletişim formu gönderme
export const useSendContactForm = () => {
  const { user } = useAuthStore()
  
  return useMutation({
    mutationFn: contactService.sendContactForm,
    onSuccess: (data) => {
      console.log('Contact form sent successfully to representative')
    },
    onError: (error) => {
      console.error('Contact form send failed:', error)
    }
  })
}

// Müşteri temsilcisi kontrolü (lightweight)
export const useCheckRepresentative = () => {
  const { user } = useAuthStore()
  
  return useQuery({
    queryKey: ['representativeCheck', user?.username],
    queryFn: contactService.checkRepresentative,
    enabled: !!user?.username && !!user?.hesap,
    staleTime: 10 * 60 * 1000, // 10 dakika cache
    cacheTime: 15 * 60 * 1000, // 15 dakika cache
    retry: false, // Hata durumunda retry yapma
    refetchOnWindowFocus: false,
  })
}