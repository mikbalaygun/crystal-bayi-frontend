import { Fragment, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react'
import { 
  XMarkIcon,
  HeartIcon,
  ShoppingCartIcon,
  TrashIcon,
  PlusIcon,
  MinusIcon,
  CubeIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'
import { useFavoriteProducts, useRemoveFromFavorites } from '../hooks/useApi'
import { useCartStore } from '../stores'
import { Button, Badge, Skeleton } from './ui'

// Para birimi formatlaması fonksiyonu
const formatPrice = (price, currency = 'TRY') => {
  if (!price || isNaN(price)) return '₺0,00'
  
  try {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price)
  } catch {
    // Fallback for unsupported currencies
    const symbols = { USD: '$', EUR: '€', TRY: '₺', TL: '₺' }
    const symbol = symbols[currency] || '₺'
    return `${symbol}${price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`
  }
}

function FavoriteItemSkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
      <div className="flex gap-3">
        <Skeleton className="h-20 w-20 flex-shrink-0 rounded-lg" />
        <div className="min-w-0 flex-1">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="flex-1">
              <Skeleton className="mb-2 h-4 w-11/12" />
              <Skeleton className="mb-2 h-4 w-7/12" />
              <Skeleton className="h-5 w-24" />
            </div>
            <Skeleton className="h-7 w-7 rounded-lg" />
          </div>
          <div className="flex items-end justify-between gap-3">
            <div>
              <Skeleton className="mb-2 h-5 w-28" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-8 w-32" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function FavoritesPanel({ isOpen, setIsOpen }) {
  const { data: favoriteProducts = [], isLoading } = useFavoriteProducts() // Default değer eklendi
  const removeFromFavoritesMutation = useRemoveFromFavorites()
  const { addItem } = useCartStore()
  const navigate = useNavigate()
  const [quantities, setQuantities] = useState({})

  const inStockProducts = useMemo(
    () => favoriteProducts.filter(product => product.bakiye > 0),
    [favoriteProducts]
  )

  const outOfStockProducts = useMemo(
    () => favoriteProducts.filter(product => product.bakiye <= 0),
    [favoriteProducts]
  )

  const getQuantity = (stkno) => quantities[stkno] ?? 1

  const setProductQuantity = (stkno, value) => {
    if (value === '' || (/^\d+$/.test(value) && value.length <= 7)) {
      setQuantities(prev => ({ ...prev, [stkno]: value }))
    }
  }

  const normalizeQuantity = (stkno) => {
    const value = quantities[stkno]
    let nextValue = parseInt(value, 10) || 1
    if (nextValue < 1) nextValue = 1
    if (nextValue > 9999999) nextValue = 9999999
    setQuantities(prev => ({ ...prev, [stkno]: nextValue }))
    return nextValue
  }

  const incrementQuantity = (stkno) => {
    const nextValue = Math.min(9999999, Number(getQuantity(stkno)) + 1)
    setQuantities(prev => ({ ...prev, [stkno]: nextValue }))
  }

  const decrementQuantity = (stkno) => {
    const nextValue = Math.max(1, Number(getQuantity(stkno)) - 1)
    setQuantities(prev => ({ ...prev, [stkno]: nextValue }))
  }

  const renderProductImage = (product) => (
    <div className="flex h-full w-full items-center justify-center bg-gray-50">
      {product.imageUrl ? (
        <img
          src={product.imageUrl}
          alt={product.stokadi}
          loading="lazy"
          className="h-full w-full object-cover"
        />
      ) : (
        <CubeIcon className="h-7 w-7 text-kristal-300" />
      )}
    </div>
  )

  const handleAddToCart = (product) => {
    const quantity = normalizeQuantity(product.stkno)
    addItem({
      stkno: product.stkno,
      stokadi: product.stokadi,
      fiyat: product.fiyat,
      cinsi: product.cinsi || 'TRY',
      birim: product.birim,
      adet: quantity,
      quantity
    }, quantity)
    
    setIsOpen(false)
    if (window.showToast) {
      window.showToast({
        type: 'success',
        title: 'Sepete Eklendi',
        message: `${product.stokadi} (${quantity} adet) sepetinize eklendi.`,
        duration: 2500,
      })
    }
  }

  const handleRemoveFavorite = async (stkno) => {
    try {
      await removeFromFavoritesMutation.mutateAsync({ stkno })
    } catch (error) {
      console.error('Favorilerden çıkarılırken hata:', error)
    }
  }

  const handleAddAllToCart = () => {
    inStockProducts.forEach(product => {
      const quantity = normalizeQuantity(product.stkno)
      addItem({
        stkno: product.stkno,
        stokadi: product.stokadi,
        fiyat: product.fiyat,
        cinsi: product.cinsi || 'TRY',
        birim: product.birim,
        adet: quantity,
        quantity
      }, quantity)
    })
    setIsOpen(false)
    if (window.showToast) {
      window.showToast({
        type: 'success',
        title: 'Sepete Eklendi',
        message: `${inStockProducts.length} ürün sepetinize eklendi.`,
        duration: 2500,
      })
    }
    navigate('/cart')
  }

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={setIsOpen}>
        <TransitionChild
          as={Fragment}
          enter="ease-in-out duration-500"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-500"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-0 sm:pl-10">
              <TransitionChild
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <DialogPanel className="pointer-events-auto w-screen max-w-lg">
                  <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                    
                    {/* Header */}
                    <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                      <div className="flex items-start justify-between">
                        <DialogTitle className="text-lg font-medium text-gray-900">
                          <div className="flex items-center">
                            <HeartSolidIcon className="w-6 h-6 mr-2 text-red-500" />
                            Favorilerim
                            {favoriteProducts?.length > 0 && (
                              <Badge className="ml-2 bg-red-100 text-red-800">
                                {favoriteProducts.length}
                              </Badge>
                            )}
                          </div>
                        </DialogTitle>
                        <div className="ml-3 flex h-7 items-center">
                          <button
                            type="button"
                            className="relative -m-2 p-2 text-gray-400 transition hover:text-gray-500 active:scale-95"
                            onClick={() => setIsOpen(false)}
                          >
                            <XMarkIcon className="h-6 w-6" />
                          </button>
                        </div>
                      </div>

                      {favoriteProducts?.length > 0 && (
                        <div className="mt-5 grid grid-cols-3 gap-2">
                          <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                            <p className="text-[11px] font-medium text-gray-500">Toplam</p>
                            <p className="text-lg font-bold text-gray-900">{favoriteProducts.length}</p>
                          </div>
                          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2">
                            <p className="text-[11px] font-medium text-emerald-700">Stokta</p>
                            <p className="text-lg font-bold text-emerald-700">{inStockProducts.length}</p>
                          </div>
                          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2">
                            <p className="text-[11px] font-medium text-red-700">Stok Yok</p>
                            <p className="text-lg font-bold text-red-700">{outOfStockProducts.length}</p>
                          </div>
                        </div>
                      )}

                      {inStockProducts.length > 0 && (
                        <div className="mt-4 rounded-xl border border-kristal-100 bg-kristal-50/70 p-4">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-gray-900">Stoktaki favorileri sepete al</p>
                              <p className="mt-1 text-xs text-gray-500">{inStockProducts.length} ürün hazır</p>
                            </div>
                            <Button size="sm" onClick={handleAddAllToCart}>
                              <ShoppingCartIcon className="mr-1.5 h-4 w-4" />
                              Sepete Ekle
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Favorite Items */}
                      <div className="mt-6">
                        <div className="flow-root">
                          {isLoading ? (
                            <div className="space-y-3">
                              {Array.from({ length: 4 }).map((_, index) => (
                                <FavoriteItemSkeleton key={index} />
                              ))}
                            </div>
                          ) : favoriteProducts?.length === 0 ? (
                            // Empty Favorites State
                            <div className="rounded-2xl border border-gray-200 bg-gray-50 px-5 py-10 text-center">
                              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-red-100 bg-white text-red-500 shadow-sm">
                                <HeartIcon className="h-7 w-7" />
                              </div>
                              <h3 className="text-base font-semibold text-gray-900">
                                Favori ürününüz yok
                              </h3>
                              <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-gray-500">
                                Sık sipariş verdiğiniz ürünleri favorilere ekleyerek buradan hızlıca sepete alabilirsiniz.
                              </p>
                              <Button
                                className="mt-6"
                                onClick={() => {
                                  setIsOpen(false)
                                  navigate('/products')
                                }}
                              >
                                Ürünlere Git
                              </Button>
                            </div>
                          ) : (
                            <div className="space-y-6">
                              {inStockProducts.length > 0 && (
                                <div>
                                  <div className="mb-3 flex items-center justify-between">
                                    <h3 className="text-sm font-semibold text-gray-900">Stokta Olanlar</h3>
                                    <span className="text-xs font-medium text-emerald-700">{inStockProducts.length} ürün</span>
                                  </div>
                                  <ul className="space-y-3">
                                    {inStockProducts.map((product) => (
                                      <li key={product.stkno} className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
                                  
                                  {/* Product Image */}
                                        <div className="flex gap-3">
                                          <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200">
                                            {renderProductImage(product)}
                                          </div>

                                          {/* Product Details */}
                                          <div className="min-w-0 flex-1">
                                            <div className="flex items-start justify-between gap-3">
                                              <div className="min-w-0">
                                                <h3 className="line-clamp-2 text-sm font-semibold text-gray-900">
                                                  {product.stokadi}
                                                </h3>
                                                <p className="mt-1 truncate text-xs text-gray-500">
                                                  {product.grupadi}
                                                </p>
                                                <p className="mt-1 inline-flex rounded-md bg-gray-50 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-gray-500">
                                                  Kod: {product.stkno}
                                                </p>
                                              </div>
                                              <button
                                                type="button"
                                                onClick={() => handleRemoveFavorite(product.stkno)}
                                                disabled={removeFromFavoritesMutation.isPending}
                                                className="rounded-lg p-1.5 text-red-500 transition hover:bg-red-50 hover:text-red-700 active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                                                title="Favorilerden çıkar"
                                              >
                                                <TrashIcon className="h-4 w-4" />
                                              </button>
                                            </div>

                                            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                                              <div className="min-w-0">
                                                <p className="break-words text-base font-bold leading-tight text-kristal-600">
                                                  {formatPrice(product.fiyat, product.cinsi)}
                                                </p>
                                                <span className="mt-1 inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                                                  Stokta
                                                </span>
                                              </div>

                                              <div className="flex shrink-0 items-center gap-2 self-end sm:self-auto">
                                                <div className="inline-grid grid-cols-[26px_72px_26px] items-center overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm focus-within:border-kristal-400 focus-within:ring-2 focus-within:ring-kristal-100">
                                                  <button
                                                    type="button"
                                                    onClick={() => decrementQuantity(product.stkno)}
                                                    className="flex h-8 items-center justify-center text-gray-600 transition hover:bg-gray-50 active:scale-95"
                                                  >
                                                    <MinusIcon className="h-3.5 w-3.5" />
                                                  </button>
                                                  <input
                                                    type="text"
                                                    inputMode="numeric"
                                                    value={getQuantity(product.stkno)}
                                                    onChange={(event) => setProductQuantity(product.stkno, event.target.value)}
                                                    onBlur={() => normalizeQuantity(product.stkno)}
                                                    className="h-8 border-x border-gray-100 bg-gray-50 px-1 text-center font-mono text-xs font-semibold tabular-nums text-gray-800 focus:outline-none focus:ring-0"
                                                  />
                                                  <button
                                                    type="button"
                                                    onClick={() => incrementQuantity(product.stkno)}
                                                    className="flex h-8 items-center justify-center text-gray-600 transition hover:bg-gray-50 active:scale-95"
                                                  >
                                                    <PlusIcon className="h-3.5 w-3.5" />
                                                  </button>
                                                </div>

                                                <Button
                                                  size="sm"
                                                  onClick={() => handleAddToCart(product)}
                                                  className="h-8 px-2.5 text-xs"
                                                >
                                                  <ShoppingCartIcon className="mr-1 h-3.5 w-3.5" />
                                                  Ekle
                                                </Button>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {outOfStockProducts.length > 0 && (
                                <div>
                                  <div className="mb-3 flex items-center justify-between">
                                    <h3 className="text-sm font-semibold text-gray-900">Stokta Olmayanlar</h3>
                                    <span className="text-xs font-medium text-red-700">{outOfStockProducts.length} ürün</span>
                                  </div>
                                  <ul className="space-y-3">
                                    {outOfStockProducts.map((product) => (
                                      <li key={product.stkno} className="rounded-xl border border-gray-200 bg-gray-50/70 p-3">
                                        <div className="flex gap-3 opacity-80">
                                          <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200">
                                            {renderProductImage(product)}
                                          </div>
                                          <div className="min-w-0 flex-1">
                                            <div className="flex items-start justify-between gap-3">
                                              <div className="min-w-0">
                                                <h3 className="line-clamp-2 text-sm font-semibold text-gray-800">
                                                  {product.stokadi}
                                                </h3>
                                                <p className="mt-1 truncate text-xs text-gray-500">{product.grupadi}</p>
                                                <p className="mt-1 inline-flex rounded-md bg-white px-1.5 py-0.5 font-mono text-[11px] font-semibold text-gray-500">
                                                  Kod: {product.stkno}
                                                </p>
                                              </div>
                                              <button
                                                type="button"
                                                onClick={() => handleRemoveFavorite(product.stkno)}
                                                disabled={removeFromFavoritesMutation.isPending}
                                                className="rounded-lg p-1.5 text-red-500 transition hover:bg-red-50 hover:text-red-700 active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                                                title="Favorilerden çıkar"
                                              >
                                                <TrashIcon className="h-4 w-4" />
                                              </button>
                                            </div>
                                            <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                              <p className="break-words text-sm font-bold leading-tight text-kristal-600">
                                                {formatPrice(product.fiyat, product.cinsi)}
                                              </p>
                                              <span className="inline-flex w-fit rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-700">
                                                Stok Yok
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                                    </div>
                          )}
                        </div>
                      </div>
                    </div>

                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
