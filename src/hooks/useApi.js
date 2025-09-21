import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import productService from '../services/productService'
import orderService from '../services/orderService'

/**
 * LISTE: Mongo'dan sayfalı liste
 * usage: useProducts({ fgrp, fagrp, page, limit }, { enabled: !isSearching })
 */
export const useProducts = (filters = {}, options = {}) => {
  const { enabled = true, keepPreviousData = true } = options
  return useQuery({
    queryKey: ['products', filters],
    queryFn: async () => {
      const res = await productService.getProducts(filters)
      if (!res.success) throw new Error(res.error || 'Ürünler getirilemedi')
      // backend: { success, data: { products, pagination, filters } }
      return res.data
    },
    enabled,
    keepPreviousData,
  })
}

/**
 * ARAMA: Mongo full-text/prefix + sayfalı
 * usage: useSearchProducts(q, { page, limit, fgrp, fagrp }, { enabled: isSearching })
 */
export const useSearchProducts = (q, params = {}, options = {}) => {
  const {
    page = 1,
    limit = 24,
    fgrp,
    fagrp,
  } = params
  const { enabled = true, keepPreviousData = true } = options

  return useQuery({
    queryKey: ['products-search', q, page, limit, fgrp, fagrp],
    queryFn: async () => {
      const res = await productService.searchProducts(q, { page, limit, fgrp, fagrp })
      if (!res.success) throw new Error(res.error || 'Ürün arama başarısız')
      // backend: { success, data: { products, totalMatched, pagination, q } }
      return res.data
    },
    enabled,
    keepPreviousData,
  })
}

/** KATEGORİLER */
export const useProductGroups = () => {
  return useQuery({
    queryKey: ['product-groups'],
    queryFn: async () => {
      const res = await productService.getProductGroups()
      if (!res.success) throw new Error(res.error || 'Ürün grupları getirilemedi')
      return res.data
    },
    staleTime: 5 * 60 * 1000,
  })
}

/** FAVORİLER */
export const useFavoriteProducts = () => {
  return useQuery({
    queryKey: ['favorite-products'],
    queryFn: async () => {
      const res = await productService.getFavoriteProducts()
      if (!res.success) throw new Error(res.error || 'Favori ürünler getirilemedi')
      return res.data
    },
  })
}

/** SİPARİŞLER & DASHBOARD */
export const useOrders = () => {
  return useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const res = await orderService.getOrders()
      if (!res.success) throw new Error(res.error || 'Siparişler getirilemedi')
      return res.data
    },
  })
}

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const res = await orderService.getDashboardStats()
      if (!res.success) throw new Error(res.error || 'İstatistikler getirilemedi')
      return res.data
    },
  })
}

/** MUTATIONS */
export const useCreateOrder = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (products) => orderService.createOrder(products),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
    },
  })
}

export const useAddToFavorites = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (product) => productService.addToFavorites(product),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorite-products'] })
    },
  })
}

export const useRemoveFromFavorites = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (product) => productService.removeFromFavorites(product),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorite-products'] })
    },
  })
}

/**
 * TOGGLE FAVORİ - Yeni eklenen
 * Ürün favorideyse çıkarır, değilse ekler
 */
export const useToggleFavorite = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (stkno) => {
      // Önce mevcut favorileri kontrol et
      const currentFavorites = queryClient.getQueryData(['favorite-products']) || []
      const isFavorite = currentFavorites.some(fav => fav.stkno === stkno)
      
      if (isFavorite) {
        // Favorilerden çıkar
        const res = await productService.removeFromFavorites({ stkno })
        if (!res.success) throw new Error(res.error || 'Favorilerden çıkarılamadı')
        return { action: 'removed', ...res }
      } else {
        // Favorilere ekle
        const res = await productService.addToFavorites({ stkno })
        if (!res.success) throw new Error(res.error || 'Favorilere eklenemedi')
        return { action: 'added', ...res }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorite-products'] })
    },
  })
}