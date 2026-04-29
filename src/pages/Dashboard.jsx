import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Badge, Skeleton } from '../components/ui'
import { useAuthStore, useCartStore } from '../stores'
import { useDashboardStats, useFavoriteProducts } from '../hooks/useApi'
import { 
  CreditCardIcon, 
  ClockIcon, 
  CurrencyDollarIcon,
  HeartIcon,
  ShoppingCartIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowRightIcon,
  PlusIcon,
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'

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
    const symbols = { USD: '$', EUR: '€', TRY: '₺', TL: '₺' }
    const symbol = symbols[currency] || '₺'
    return `${symbol}${price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`
  }
}

const formatTry = (value) => {
  if (value === null || value === undefined || value === '') return '₺0,00'
  let number = value
  if (typeof value === 'string') {
    const cleaned = value.replace(/[^\d,.-]/g, '').trim()
    number = cleaned.includes(',')
      ? parseFloat(cleaned.replace(/\./g, '').replace(',', '.'))
      : parseFloat(cleaned)
  }
  if (!Number.isFinite(Number(number))) return '₺0,00'
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(number))
}

const statSkeletonStyles = [
  {
    tint: 'from-kristal-500 to-kristal-600',
    icon: 'bg-kristal-100',
    line: 'bg-kristal-200/80',
    value: 'bg-kristal-300/70',
  },
  {
    tint: 'from-orange-500 to-orange-600',
    icon: 'bg-orange-100',
    line: 'bg-orange-200/80',
    value: 'bg-orange-300/70',
  },
  {
    tint: 'from-green-500 to-green-600',
    icon: 'bg-green-100',
    line: 'bg-green-200/80',
    value: 'bg-green-300/70',
  },
]

function StatCardSkeleton({ index = 0 }) {
  const style = statSkeletonStyles[index] || statSkeletonStyles[0]

  return (
    <Card className="relative overflow-hidden border-0 bg-white">
      <div className={`absolute inset-0 bg-gradient-to-br ${style.tint} opacity-5`} />
      <div className="relative p-6">
        <Skeleton className={`mb-4 h-12 w-12 rounded-xl ${style.icon}`} />
        <Skeleton className={`mb-2 h-4 w-28 ${style.line}`} />
        <Skeleton className={`mb-2 h-8 w-36 ${style.value}`} />
        <Skeleton className={`h-3 w-24 ${style.line}`} />
      </div>
      <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br ${style.tint} opacity-5`} />
    </Card>
  )
}

function FavoriteCarouselSkeleton() {
  return (
    <div className="flex gap-4 overflow-hidden pb-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="w-[260px] flex-shrink-0 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <Skeleton className="h-44 rounded-none" />
          <div className="p-4">
            <Skeleton className="mb-2 h-3 w-24" />
            <Skeleton className="mb-2 h-4 w-11/12" />
            <Skeleton className="mb-3 h-4 w-8/12" />
            <Skeleton className="h-6 w-28" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuthStore()
  const { addItem } = useCartStore()
  const { data: stats, isLoading: statsLoading } = useDashboardStats()
  const { data: favoriteProducts, isLoading: favoritesLoading } = useFavoriteProducts()
  const navigate = useNavigate()
  
  // Carousel state
  const scrollRef = useRef(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const checkScroll = () => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 4)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4)
  }

  useEffect(() => {
    checkScroll()
    const el = scrollRef.current
    if (el) {
      el.addEventListener('scroll', checkScroll, { passive: true })
      window.addEventListener('resize', checkScroll)
      return () => {
        el.removeEventListener('scroll', checkScroll)
        window.removeEventListener('resize', checkScroll)
      }
    }
  }, [favoriteProducts])

  const scroll = (direction) => {
    const el = scrollRef.current
    if (!el) return
    const cardWidth = 280
    el.scrollBy({ left: direction * cardWidth * 2, behavior: 'smooth' })
  }

  const statCards = [
    {
      title: 'Güncel Bakiye',
      value: formatTry(user?.bakiye),
      subtitle: 'Hesap bakiyeniz',
      icon: CreditCardIcon,
      gradient: 'from-kristal-500 to-kristal-600',
      iconBg: 'bg-kristal-100',
      iconColor: 'text-kristal-600'
    },
    {
      title: 'Bekleyen Siparişler',
      value: stats?.waitingOrders || 0,
      subtitle: 'Hazırlanıyor',
      icon: ClockIcon,
      gradient: 'from-orange-500 to-orange-600',
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600'
    },
    {
      title: 'Bekleyen Sipariş Tutarı',
      value: formatTry(stats?.waitingOrdersPrice),
      subtitle: 'Toplam değer',
      icon: CurrencyDollarIcon,
      gradient: 'from-green-500 to-green-600',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600'
    }
  ]

  const handleQuickAdd = (product) => {
    addItem({
      stkno: product.stkno,
      stokadi: product.stokadi,
      fiyat: product.fiyat,
      cinsi: product.cinsi || 'TRY',
      birim: product.birim || 'ADET',
      grupadi: product.grupadi,
      kdv: product.kdv,
      imageUrl: product.imageUrl,
      adet: 1
    })
    
    if (window.showToast) {
      window.showToast({
        type: 'success',
        title: 'Sepete Eklendi',
        message: `${product.stokadi} sepetinize eklendi.`,
        duration: 2500,
      })
    }
  }

  return (
    <div className="space-y-8">
      
      {/* Welcome */}
      <div className="text-left mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Hoş geldiniz,
        </h1>
        <p className="text-2xl text-kristal-600 font-semibold">
          {user?.company}
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statsLoading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <StatCardSkeleton key={index} index={index} />
          ))
        ) : (
          statCards.map((stat, index) => (
            <Card key={index} className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-0 bg-white">
              <div className="p-6">
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}></div>
                
                <div className="relative">
                  <div className={`${stat.iconBg} w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                  </div>
                  
                  <h3 className="text-sm font-medium text-gray-600 mb-1">
                    {stat.title}
                  </h3>
                  
                  <p className="text-3xl font-bold text-gray-900 mb-1">
                    {stat.value}
                  </p>
                  
                  <p className="text-xs text-gray-500">
                    {stat.subtitle}
                  </p>
                </div>

                <div className={`absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br ${stat.gradient} opacity-5 rounded-full group-hover:scale-110 transition-transform duration-500`}></div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Favorite Products — Carousel */}
      <div>
        {/* Section Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50">
              <HeartSolidIcon className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Favori Ürünleriniz</h2>
              <p className="text-sm text-gray-500">Hızlıca sepete ekleyin</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Carousel Arrows */}
            {favoriteProducts?.length > 0 && (
              <>
                <button
                  onClick={() => scroll(-1)}
                  disabled={!canScrollLeft}
                  className="hidden sm:flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition-all hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700 disabled:cursor-default disabled:opacity-30"
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => scroll(1)}
                  disabled={!canScrollRight}
                  className="hidden sm:flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition-all hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700 disabled:cursor-default disabled:opacity-30"
                >
                  <ChevronRightIcon className="h-4 w-4" />
                </button>
              </>
            )}

            <button
              onClick={() => navigate('/products')}
              className="ml-1 flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-kristal-600 transition-colors hover:bg-kristal-50"
            >
              Tüm Ürünler
              <ArrowRightIcon className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Carousel Body */}
        {favoritesLoading ? (
          <FavoriteCarouselSkeleton />
        ) : favoriteProducts?.length > 0 ? (
          <div className="relative group/carousel">
            {/* Left fade */}
            {canScrollLeft && (
              <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-12 bg-gradient-to-r from-gray-50 to-transparent" />
            )}
            {/* Right fade */}
            {canScrollRight && (
              <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-12 bg-gradient-to-l from-gray-50 to-transparent" />
            )}

            <div
              ref={scrollRef}
              className="flex gap-4 overflow-x-auto scroll-smooth pb-2 -mx-1 px-1"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
            >
              {favoriteProducts.map((product) => (
                <div
                  key={product.stkno}
                  className="group flex-shrink-0 w-[260px] rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 overflow-hidden"
                >
                  {/* Product Image + Hover Overlay */}
                  <div className="relative h-44 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 flex items-center justify-center overflow-hidden">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.stokadi}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" className="text-kristal-300">
                          <path d="M6 3h12l4 6-10 12L2 9l4-6z" fill="currentColor" opacity="0.6" />
                          <path d="M6 3h12l4 6-10 12L2 9l4-6z" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.8" />
                        </svg>
                        <span className="text-[10px] font-medium text-gray-400 tracking-wide">{product.stkno}</span>
                      </div>
                    )}

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] opacity-0 transition-all duration-300 group-hover:opacity-100">
                      <button
                        onClick={() => handleQuickAdd(product)}
                        disabled={product.bakiye <= 0}
                        className="flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-gray-900 shadow-lg transition-all duration-200 translate-y-3 group-hover:translate-y-0 hover:bg-kristal-50 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ShoppingCartIcon className="h-4 w-4 text-kristal-600" />
                        Sepete Ekle
                      </button>
                    </div>

                    {/* Stok badge */}
                    <div className="absolute top-2.5 left-2.5 z-10">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium backdrop-blur-sm ${
                        product.bakiye > 0
                          ? 'bg-emerald-50/90 text-emerald-700 ring-1 ring-emerald-200/60'
                          : 'bg-red-50/90 text-red-700 ring-1 ring-red-200/60'
                      }`}>
                        {product.bakiye > 0 ? 'Stokta' : 'Stok Yok'}
                      </span>
                    </div>

                    {/* Favori kalp */}
                    <div className="absolute top-2.5 right-2.5 z-10">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow-sm">
                        <HeartSolidIcon className="h-4 w-4 text-red-500" />
                      </div>
                    </div>
                  </div>

                  {/* Content — sadece bilgi, buton yok */}
                  <div className="p-4">
                    <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-1">{product.grupadi}</p>
                    <h3 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2 min-h-[2.5rem]">
                      {product.stokadi}
                    </h3>
                    <div className="mt-2">
                       <span className="text-lg font-bold text-gray-900">
                         {formatPrice(product.fiyat, product.cinsi)}
                       </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-gray-200 bg-white px-6 py-14 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-red-100 bg-red-50 text-red-500">
              <HeartIcon className="h-8 w-8" />
            </div>
            <p className="mb-1 text-base font-semibold text-gray-900">
              Henüz favori ürününüz bulunmuyor
            </p>
            <p className="mx-auto mb-5 max-w-sm text-sm leading-6 text-gray-500">
              Ürünler sayfasından favori ürünlerinizi ekleyebilirsiniz
            </p>
            <button
              onClick={() => navigate('/products')}
              className="inline-flex items-center gap-2 rounded-lg bg-kristal-500 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-kristal-600 active:scale-[0.98]"
            >
              Ürünlere Göz At
              <ArrowRightIcon className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
