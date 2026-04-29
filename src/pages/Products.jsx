import { useState, useMemo, useEffect } from 'react'
import {
  MagnifyingGlassIcon,
  Squares2X2Icon,
  ListBulletIcon,
} from '@heroicons/react/24/outline'
import { Card, Button, Skeleton } from '../components/ui'
import { useQuery } from '@tanstack/react-query'
import { useFavoriteProducts, useAddToFavorites, useRemoveFromFavorites, useProductGroups, useProducts } from '../hooks/useApi'
import { useCartStore } from '../stores'
import ProductCard from '../components/ProductCard'
import productService from '../services/productService'

function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <Skeleton className="h-56 rounded-none" />
      <div className="p-4">
        <Skeleton className="mb-2 h-4 w-11/12" />
        <Skeleton className="mb-3 h-4 w-7/12" />
        <Skeleton className="mb-3 h-5 w-24" />
        <Skeleton className="mb-4 h-7 w-32" />
        <div className="mb-3 flex items-center justify-between">
          <Skeleton className="h-4 w-10" />
          <Skeleton className="h-8 w-36" />
        </div>
        <Skeleton className="h-9 w-full" />
      </div>
    </div>
  )
}

export default function Products() {
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [isProductCodeSearch, setIsProductCodeSearch] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedSubCategory, setSelectedSubCategory] = useState('')
  const [viewMode, setViewMode] = useState('grid')
  const [sortBy, setSortBy] = useState('name')
  const [currentPage, setCurrentPage] = useState(1)
  const PAGE_SIZE = 24

  const { addItem } = useCartStore()

  const detectProductCode = (query) => {
    const trimmed = query.trim()
    const isNumeric = /^\d+$/.test(trimmed)
    const isValidLength = trimmed.length >= 3 && trimmed.length <= 8
    const startsWithZero = trimmed.startsWith('0')
    return isNumeric && (isValidLength || startsWithZero)
  }

  useEffect(() => {
    const t = setTimeout(() => {
      const trimmed = searchQuery.trim()
      setDebouncedQuery(trimmed)
      setIsProductCodeSearch(detectProductCode(trimmed))
    }, detectProductCode(searchQuery.trim()) ? 200 : 300)
    return () => clearTimeout(t)
  }, [searchQuery])

  // Sayfa değiştiğinde en üste kaydır
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentPage])

  const isSearching = debouncedQuery.length >= 2

  const { data: categories = [] } = useProductGroups()

  // Alt kategoriler - ana kategori seçildiğinde yüklenir
  const { data: subCategoriesResp } = useQuery({
    queryKey: ['sub-categories', selectedCategory],
    queryFn: () => selectedCategory ? productService.getSubGroups(selectedCategory) : Promise.resolve({ success: true, data: [] }),
    enabled: !!selectedCategory,
  })

  const subCategories = subCategoriesResp?.success ? subCategoriesResp.data : []

  const { data: favoriteProducts = [] } = useFavoriteProducts()
  const addToFavoritesMutation = useAddToFavorites()
  const removeFromFavoritesMutation = useRemoveFromFavorites()
  const isFavorite = (stkno) => favoriteProducts?.some(f => f.stkno === stkno) || false

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
    { enabled: !isSearching }
  )

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
      return res.data
    },
    enabled: isSearching
  })

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

  const sortedProducts = useMemo(() => {
    if (isSearching) return effectiveProducts
    const copy = [...effectiveProducts]
    switch (sortBy) {
      case 'price':
        return copy.sort((a, b) => (a.fiyat ?? 0) - (b.fiyat ?? 0))
      case 'stock':
        return copy.sort((a, b) => ((b.bakiye ?? 0) - (a.bakiye ?? 0)))
      case 'name':
      default:
        return copy.sort((a, b) => (a.stokadi || '').localeCompare(b.stokadi || ''))
    }
  }, [isSearching, effectiveProducts, sortBy])

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

  const handleAddToCart = (product, quantity) => {
    addItem(product, quantity)
    if (window.showToast) {
      window.showToast({
        type: 'success',
        title: 'Sepete Eklendi',
        message: `${product.stokadi} (${quantity} adet) sepetinize eklendi.`,
        duration: 2500,
      })
    }
  }

  const getGridClasses = () => {
    if (viewMode === 'grid') {
      return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
    }
    return 'grid grid-cols-1 lg:grid-cols-2 gap-4'
  }

  return (
    <div className="space-y-4">
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ürünler</h1>
          <p className="text-sm text-gray-500">{totalCountLabel.toLocaleString()} ürün</p>
        </div>
        
        <div className="flex items-center space-x-3 mt-3 sm:mt-0">
          <div className="hidden lg:flex items-center bg-blue-50 text-blue-700 px-3 py-2 rounded-lg border border-blue-200">
            <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs font-medium">
              Sayfa görünümünü yandan değiştirebilirsiniz
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
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
      </div>

      <Card className="p-4">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1">
            <div className="relative flex items-center">
              <MagnifyingGlassIcon className="absolute left-3 h-5 w-5 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder={isProductCodeSearch ? "Ürün kodu: " + debouncedQuery + " ..." : "Ürün adı veya kodu ara..."}
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className={`pl-10 pr-4 py-3 w-full border rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-kristal-500 transition-all text-sm ${
                  isProductCodeSearch 
                    ? 'border-blue-300 bg-blue-50 focus:bg-blue-50' 
                    : 'border-gray-300'
                }`}
              />
            </div>
            
            {isSearching && (
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  {isProductCodeSearch ? (
                    <span className="text-blue-600 font-medium flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                      </svg>
                      Ürün kodu aranıyor: {debouncedQuery}
                    </span>
                  ) : (
                    `"${debouncedQuery}" aranıyor...`
                  )}
                </span>
                {isProductCodeSearch && (
                  <span className="text-xs text-blue-500 bg-blue-100 px-2 py-1 rounded">
                    Kod Araması
                  </span>
                )}
              </div>
            )}
            
            {!isSearching && (
              <div className="mt-2 text-xs text-gray-500">
                💡 İpucu: Ürün kodunu (örn: 00643, 12345) doğrudan yazabilirsiniz
              </div>
            )}
          </div>

          <div className="w-full lg:w-56">
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full py-3 px-4 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 focus:ring-2 focus:ring-kristal-500 focus:border-kristal-500 focus:bg-white text-sm font-medium text-gray-700 transition-colors cursor-pointer"
            >
              <option value="" className="font-normal">Tüm Kategoriler</option>
              {Array.isArray(categories) && categories.map((c) => (
                <option key={c.grpkod} value={c.grpkod} className="font-normal">
                  {c.grpadi}
                </option>
              ))}
            </select>
          </div>

          {/* Alt Kategori - Sadece ana kategori seçiliyken göster */}
          {selectedCategory && subCategories && subCategories.length > 0 && (
            <div className="w-full lg:w-56">
              <select
                value={selectedSubCategory}
                onChange={(e) => handleSubCategoryChange(e.target.value)}
                className="w-full py-3 px-4 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 focus:ring-2 focus:ring-kristal-500 focus:border-kristal-500 focus:bg-white text-sm font-medium text-gray-700 transition-colors cursor-pointer"
              >
                <option value="" className="font-normal">Tüm Alt Kategoriler</option>
                {subCategories.map((subCat) => (
                  <option key={subCat.grpkod} value={subCat.grpkod} className="font-normal">
                    {subCat.grpadi}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="w-full lg:w-44">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full py-2.5 px-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-kristal-500 focus:border-kristal-500 text-sm"
              disabled={isSearching}
              title={isSearching ? 'Aramada skor sırasını koruyoruz' : ''}
            >
              <option value="name">A-Z Sırala</option>
              <option value="price">Fiyata Göre</option>
              <option value="stock">Stoka Göre</option>
            </select>
          </div>
        </div>
      </Card>

      {effectiveLoading ? (
        <div className={getGridClasses()}>
          {Array.from({ length: viewMode === 'grid' ? 8 : 4 }).map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </div>
      ) : (
        <div className={getGridClasses()}>
          {Array.isArray(sortedProducts) && sortedProducts.map((p) => (
            <ProductCard
              key={p.stkno}
              product={p}
              viewMode={viewMode}
              isFavorite={isFavorite(p.stkno)}
              onFavoriteToggle={() => handleFavoriteToggle(p)}
              onAddToCart={(q) => handleAddToCart(p, q)}
            />
          ))}
        </div>
      )}

      {!effectiveLoading && (!Array.isArray(sortedProducts) || sortedProducts.length === 0) && (
        <Card className="overflow-hidden border-gray-200 bg-white">
          <div className="mx-auto flex max-w-xl flex-col items-center px-6 py-12 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-kristal-100 bg-kristal-50 text-kristal-600">
              <MagnifyingGlassIcon className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              {isProductCodeSearch ? 'Ürün kodu bulunamadı' : 'Ürün bulunamadı'}
            </h3>
            <p className="mt-2 text-sm leading-6 text-gray-500">
              {isProductCodeSearch 
                ? `"${debouncedQuery}" kodlu ürün bulunamadı. Kodu kontrol edip tekrar deneyin.`
                : 'Arama veya filtre kriterlerini değiştirerek tekrar deneyin.'
              }
            </p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('')
                  setDebouncedQuery('')
                  setSelectedCategory('')
                  setSelectedSubCategory('')
                  setCurrentPage(1)
                }}
              >
                Filtreleri Temizle
              </Button>
              <Button onClick={() => setViewMode('grid')}>
                Ürünleri Göster
              </Button>
            </div>
          </div>
        </Card>
      )}

      {effectivePagination?.totalPages > 1 && (
        <Card className="p-3">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="text-xs text-gray-600">
              Sayfa {effectivePagination.currentPage} / {effectivePagination.totalPages}
              {isProductCodeSearch && (
                <span className="ml-2 text-blue-600">
                  (Kod araması: {debouncedQuery})
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={effectivePagination.currentPage === 1}
                onClick={() => setCurrentPage(1)}
                className="text-xs px-2"
              >
                İlk
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={effectivePagination.currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="text-xs px-2"
              >
                ‹
              </Button>

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
                      className="w-8 h-8 text-xs p-0"
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
                className="text-xs px-2"
              >
                ›
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={effectivePagination.currentPage >= effectivePagination.totalPages}
                onClick={() => setCurrentPage(effectivePagination.totalPages)}
                className="text-xs px-2"
              >
                Son
              </Button>
            </div>

            <div className="text-xs text-gray-500">
              {effectiveProducts.length} ürün
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
