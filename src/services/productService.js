// src/services/productService.js
import apiClient from './api'

class ProductService {
  // LISTE: Mongo'dan sayfalı liste (NOT: search burada yok)
  async getProducts(filters = {}) {
    try {
      const params = new URLSearchParams()
      if (filters.fgrp) params.append('fgrp', filters.fgrp)
      if (filters.fagrp) params.append('fagrp', filters.fagrp)
      if (filters.fatgrp) params.append('fatgrp', filters.fatgrp)
      if (filters.page) params.append('page', filters.page)
      if (filters.limit) params.append('limit', filters.limit)

      const { data } = await apiClient.get(`/products?${params.toString()}`)
      // backend: { success, data: { products, pagination, filters } }
      return { success: true, data: data.data }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Ürünler getirilemedi' }
    }
  }

  // KATEGORİLER
  async getProductGroups() {
    try {
      const { data } = await apiClient.get('/products/groups')
      return { success: true, data: data.data }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Ürün grupları getirilemedi' }
    }
  }

  async getSubGroups(groupId) {
    try {
      const { data } = await apiClient.get(`/products/groups/${groupId}/subgroups`)
      return { success: true, data: data.data }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Alt gruplar getirilemedi' }
    }
  }

  async getSubGroups2(groupId) {
    try {
      const { data } = await apiClient.get(`/products/groups/${groupId}/subgroups2`)
      return { success: true, data: data.data }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Alt gruplar 2 getirilemedi' }
    }
  }

  // ARAMA: Mongo full-text/prefix, sayfalı
  async searchProducts(q, { page = 1, limit = 24, fgrp, fagrp } = {}) {
    try {
      const params = new URLSearchParams()
      params.append('q', q)
      params.append('page', page)
      params.append('limit', limit)
      if (fgrp) params.append('fgrp', fgrp)
      if (fagrp) params.append('fagrp', fagrp)

      const { data } = await apiClient.get(`/products/search?${params.toString()}`)
      // backend: { success, data: { products, totalMatched, pagination, q } }
      return { success: true, data: data.data }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Ürün arama başarısız' }
    }
  }

  // TEK ÜRÜN
  async getProduct(stockNo) {
    try {
      const { data } = await apiClient.get(`/products/${stockNo}`)
      return { success: true, data: data.data }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Ürün bulunamadı' }
    }
  }

  // FAVORİLER
  async getFavoriteProducts() {
    try {
      const { data } = await apiClient.get('/favorites')
      return { success: true, data: data.data }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Favori ürünler getirilemedi' }
    }
  }

  async addToFavorites(product) {
    try {
      const { data } = await apiClient.post('/favorites', {
        stkno: product.stkno,
        stokadi: product.stokadi,
        fiyat: product.fiyat || 0,
        birim: product.birim || 'ADET',
        grupadi: product.grupadi || '',
        kdv: product.kdv || 18,
        bakiye: product.bakiye || 0,
        uruntipi: product.uruntipi || ''
      })
      return { success: true, data: data.data }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Favorilere eklenemedi' }
    }
  }

  async removeFromFavorites(product) {
    try {
      const { data } = await apiClient.delete(`/favorites/${product.stkno}`)
      return { success: true, data: data.data }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Favorilerden çıkarılamadı' }
    }
  }

  async checkFavorites(stockNumbers) {
    try {
      const { data } = await apiClient.post('/favorites/check', { stknoList: stockNumbers })
      return { success: true, data: data.data }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Favori kontrolü başarısız' }
    }
  }

  async getFavoriteCount() {
    try {
      const { data } = await apiClient.get('/favorites/count')
      return { success: true, data: data.data }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Favori sayısı alınamadı' }
    }
  }
}

export default new ProductService()
