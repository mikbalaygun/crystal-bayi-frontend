import { useState, useMemo, useEffect } from 'react'
import { 
  MagnifyingGlassIcon, 
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon,
} from '@heroicons/react/24/outline'
import { Card, Button, Spinner } from '../components/ui'
import { useQuery } from '@tanstack/react-query'
import { useFavoriteProducts, useAddToFavorites, useRemoveFromFavorites, useProductGroups, useProducts } from '../hooks/useApi'
import { useCartStore } from '../stores'
import ProductCard from '../components/ProductCard'
import ProductFilters from '../components/ProductFilters'
import productService from '../services/productService' // ProductService

export default function Products() {
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedSubCategory, setSelectedSubCategory] = useState('')
  const [viewMode, setViewMode] = useState('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState('name')
  const [currentPage, setCurrentPage] = useState(1)
  const PAGE_SIZE = 24

  const { addItem } = useCartStore()

  // debounce
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(searchQuery.trim()), 300)
    return () => clearTimeout(t)
  }, [searchQuery])

  const isSearching = debouncedQuery.length >= 2

  // Kategoriler (SOAP veya Mongo fark etmez)
  const { data: categories = [] } = useProductGroups()

  // FAVORİ
  const { data: favoriteProducts = [] } = useFavoriteProducts()
  const addToFavoritesMutation = useAddToFavorites()
  const removeFromFavoritesMutation = useRemoveFromFavorites()
  const isFavorite = (stkno) => favoriteProducts?.some(f => f.stkno === stkno) || false

  // LISTE (Mongo)
  const {
    data: listResp,
    isLoading: listLoading
  } = useProducts(
    {
      fgrp: selectedCategory,
      fagrp: selectedSubCategory,
      page: currentPage,
      limit: PAGE_SIZE,
    },
    { enabled: !isSearching } // <- arama aktifken listeyi çağırma
  )

  // ARAMA (Mongo /products/search)
  const {
    data: searchResp,
    isLoading: searchLoading
  } = useQuery({
    queryKey: ['products-search', debouncedQuery, selectedCategory, selectedSubCategory, currentPage, PAGE_SIZE],
    queryFn: async () => {
      const res = await productService.searchProducts(debouncedQuery, {
        page: currentPage,
        limit: PAGE_SIZE,
        fgrp: selectedCategory || undefined,
        fagrp: selectedSubCategory || undefined,
      })
      if (!res.success) throw new Error(res.error || 'Arama başarısız')
      return res.data // { products, totalMatched, pagination, q }
    },
    enabled: isSearching
  })

  // ETKİN KAYNAK
  const effectiveLoading = isSearching ? searchLoading : listLoading
  const effectiveProducts = useMemo(() => {
    if (isSearching) {
      return searchResp?.products || []
    }
    return listResp?.products || []
  }, [isSearching, searchResp, listResp])

  const effectivePagination = useMemo(() => {
    if (isSearching) {
      return searchResp?.pagination || { currentPage: 1, totalPages: 1, limit: PAGE_SIZE }
    }
    return listResp?.pagination || { currentPage: 1, totalPages: 1, limit: PAGE_SIZE, totalProducts: effectiveProducts.length }
  }, [isSearching, searchResp, listResp, effectiveProducts.length])

  const totalCountLabel = isSearching
    ? (searchResp?.totalMatched ?? effectiveProducts.length)
    : (effectivePagination?.totalProducts ?? effectiveProducts.length)

  // Liste modunda (arama yokken) client-side sort; aramada skor order korunur
  const sortedProducts = useMemo(() => {
    if (isSearching) return effectiveProducts
    const copy = [...effectiveProducts]
    switch (sortBy) {
      case 'price':
        return copy.sort((a, b) => (a.fiyat ?? 0) - (b.fiyat ?? 0))
      case 'stock':
        return copy.sort((a, b) => (b.bakiye ?? 0) - (a.bakiye ?? 0))
      case 'name':
      default:
        return copy.sort((a, b) => (a.stokadi || '').localeCompare(b.stokadi || ''))
    }
  }, [isSearching, effectiveProducts, sortBy])

  // Handlers
  const handleCategoryChange = (val) => {
    setSelectedCategory(val)
    setSelectedSubCategory('')
    setCurrentPage(1)
  }
  const handleSubCategoryChange = (val) => {
    setSelectedSubCategory(val)
    setCurrentPage(1)
  }
  const handleSearchChange = (val) => {
    setSearchQuery(val)
    setCurrentPage(1)
  }
  const handleFavoriteToggle = async (product) => {
    if (isFavorite(product.stkno)) {
      await removeFromFavoritesMutation.mutateAsync(product)
    } else {
      await addToFavoritesMutation.mutateAsync(product)
    }
  }
  const handleAddToCart = (product, quantity = 1) => addItem(product, quantity)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ürünler</h1>
          <p className="mt-1 text-sm text-gray-500">
            {totalCountLabel} ürün bulundu
          </p>
        </div>
        <div className="flex items-center space-x-2 mt-4 md:mt-0">
          <Button
            variant={viewMode === 'grid' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Squares2X2Icon className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <ListBulletIcon className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Search & Filters */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Ürün adı veya kodu ile ara..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-kristal-500 focus:border-kristal-500 transition-all text-base"
              />
              {isSearching && (
                <div className="mt-2 text-xs text-gray-500">
                  {debouncedQuery} için arama yapılıyor…
                </div>
              )}
            </div>
          </div>

          {/* Category */}
          <div className="w-full lg:w-64">
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full py-3 px-4 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-kristal-500 focus:border-kristal-500"
            >
              <option value="">Tüm Kategoriler</option>
              {Array.isArray(categories) && categories.map((c) => (
                <option key={c.grpkod} value={c.grpkod}>{c.grpadi}</option>
              ))}
            </select>
          </div>

          {/* Sort (arama yokken anlamlı) */}
          <div className="w-full lg:w-48">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full py-3 px-4 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-kristal-500 focus:border-kristal-500"
              disabled={isSearching}
              title={isSearching ? 'Aramada skor sırasını koruyoruz' : ''}
            >
              <option value="name">A-Z Sırala</option>
              <option value="price">Fiyata Göre</option>
              <option value="stock">Stoka Göre</option>
            </select>
          </div>

          <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
            <FunnelIcon className="w-5 h-5 mr-2" />
            Filtreler
          </Button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <ProductFilters
              selectedCategory={selectedCategory}
              selectedSubCategory={selectedSubCategory}
              onSubCategoryChange={handleSubCategoryChange}
            />
          </div>
        )}
      </Card>

      {/* Products */}
      {effectiveLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" text="Ürünler yükleniyor..." />
        </div>
      ) : (
        <div className={viewMode === 'grid'
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
          : 'space-y-4'}>
          {Array.isArray(sortedProducts) && sortedProducts.map((p) => (
            <ProductCard
              key={p.stkno}
              product={p}
              viewMode={viewMode}
              isFavorite={isFavorite(p.stkno)}
              onFavoriteToggle={() => handleFavoriteToggle(p)}
              onAddToCart={(q) => addItem(p, q)}
            />
          ))}
        </div>
      )}

      {/* Empty */}
      {!effectiveLoading && (!Array.isArray(sortedProducts) || sortedProducts.length === 0) && (
        <Card className="p-12 text-center">
          <div className="text-gray-500">
            <MagnifyingGlassIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Ürün bulunamadı
            </h3>
            <p>Arama veya filtre kriterlerini değiştirerek tekrar deneyin.</p>
          </div>
        </Card>
      )}

      {/* Pagination */}
      {effectivePagination?.totalPages > 1 && (
        <Card className="p-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-600">
              Sayfa {effectivePagination.currentPage} / {effectivePagination.totalPages}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={effectivePagination.currentPage === 1}
                onClick={() => setCurrentPage(1)}
              >
                İlk
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={effectivePagination.currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              >
                Önceki
              </Button>

              {/* 5 butonluk pencere */}
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, effectivePagination.totalPages) }, (_, i) => {
                  const base = Math.max(1, Math.min(
                    effectivePagination.totalPages - 4,
                    (effectivePagination.currentPage || 1) - 2
                  ))
                  const pageNum = base + i
                  if (pageNum > effectivePagination.totalPages) return null
                  return (
                    <Button
                      key={pageNum}
                      variant={pageNum === effectivePagination.currentPage ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className="w-10"
                    >
                      {pageNum}
                    </Button>
                  )
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                disabled={effectivePagination.currentPage >= effectivePagination.totalPages}
                onClick={() => setCurrentPage(p => Math.min(effectivePagination.totalPages, p + 1))}
              >
                Sonraki
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={effectivePagination.currentPage >= effectivePagination.totalPages}
                onClick={() => setCurrentPage(effectivePagination.totalPages)}
              >
                Son
              </Button>
            </div>

            <div className="text-sm text-gray-500">
              {effectiveProducts.length} ürün gösteriliyor
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
