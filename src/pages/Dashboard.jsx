import { useState } from 'react'
import { Card, Spinner } from '../components/ui'
import { useAuthStore, useCartStore } from '../stores'
import { useDashboardStats, useFavoriteProducts } from '../hooks/useApi'
import { 
  CreditCardIcon, 
  ClockIcon, 
  CurrencyDollarIcon,
  HeartIcon,
  ShoppingCartIcon,
  PlusIcon,
  MinusIcon
} from '@heroicons/react/24/outline'

const formatPrice = (price, currency = 'TRY') => {
  if (!price || isNaN(price)) return '₺0,00'
  
  try {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price)
  } catch (error) {
    const symbols = { USD: '$', EUR: '€', TRY: '₺', TL: '₺' }
    const symbol = symbols[currency] || '₺'
    return `${symbol}${price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`
  }
}

export default function Dashboard() {
  const { user } = useAuthStore()
  const { addItem, setIsOpen: setCartOpen } = useCartStore()
  const { data: stats, isLoading: statsLoading } = useDashboardStats()
  const { data: favoriteProducts, isLoading: favoritesLoading } = useFavoriteProducts()
  
  const [quantities, setQuantities] = useState({})
  const [expandedProduct, setExpandedProduct] = useState(null)

  const statCards = [
    {
      title: 'Güncel Bakiye',
      value: user?.bakiye ? `₺${user.bakiye.toLocaleString()}` : '₺0',
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
      value: stats?.waitingOrdersPrice ? `₺${stats.waitingOrdersPrice.toLocaleString()}` : '₺0',
      subtitle: 'Toplam değer',
      icon: CurrencyDollarIcon,
      gradient: 'from-green-500 to-green-600',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600'
    }
  ]

  const handleQuickAdd = (product) => {
    const quantity = quantities[product.stkno] || 1
    
    addItem({
      stkno: product.stkno,
      stokadi: product.stokadi,
      fiyat: product.fiyat,
      cinsi: product.cinsi || 'TRY',
      birim: product.birim || 'ADET',
      grupadi: product.grupadi,
      kdv: product.kdv,
      imageUrl: product.imageUrl,
      adet: quantity
    })
    
    setQuantities(prev => ({ ...prev, [product.stkno]: 1 }))
    setExpandedProduct(null)
    setCartOpen(true)
  }

  const handleQuantityChange = (stkno, value) => {
    const numValue = parseInt(value) || 1
    const clampedValue = Math.min(999999, Math.max(1, numValue))
    setQuantities(prev => ({ ...prev, [stkno]: clampedValue }))
  }

  const getQuantity = (stkno) => quantities[stkno] || 1

  return (
    <div className="space-y-8">
      
      <div className="text-left mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Hoş geldiniz,
        </h1>
        <p className="text-2xl text-kristal-600 font-semibold">
          {user?.company}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statsLoading ? (
          <div className="col-span-3 flex justify-center py-16">
            <Spinner size="lg" text="İstatistikler yükleniyor..." />
          </div>
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

      <Card className="border-0 shadow-lg">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">Favori Ürünler</h2>
            <HeartIcon className="w-6 h-6 text-red-500" />
          </div>
          
          {favoritesLoading ? (
            <div className="flex justify-center py-12">
              <Spinner text="Favori ürünler yükleniyor..." />
            </div>
          ) : favoriteProducts?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteProducts.slice(0, 6).map((product) => {
                const isExpanded = expandedProduct === product.stkno
                const quantity = getQuantity(product.stkno)
                
                return (
                  <div 
                    key={product.stkno}
                    className="group bg-gradient-to-br from-gray-50 to-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                    onMouseLeave={() => setExpandedProduct(null)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-gray-900 text-lg leading-tight group-hover:text-kristal-600 transition-colors line-clamp-2 flex-1 mr-2">
                        {product.stokadi}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                        product.bakiye > 0 
                          ? 'bg-green-100 text-green-800 border border-green-200' 
                          : 'bg-red-100 text-red-800 border border-red-200'
                      }`}>
                        {product.bakiye > 0 ? 'Stokta' : 'Stok Yok'}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-1">{product.grupadi}</p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-bold bg-gradient-to-r from-kristal-600 to-kristal-700 bg-clip-text text-transparent">
                        {formatPrice(product.fiyat, product.cinsi)}
                      </span>
                      <div className="w-8 h-8 bg-kristal-100 rounded-full flex items-center justify-center group-hover:bg-kristal-200 transition-colors">
                        <HeartIcon className="w-4 h-4 text-kristal-600" />
                      </div>
                    </div>

                    {/* Modern Hover Expand Add to Cart */}
                    <div className="pt-4 border-t border-gray-200">
                      <div className="relative flex items-center gap-2">
                        {/* Sepete Ekle Butonu */}
                        <button
                          onClick={() => {
                            if (isExpanded) {
                              handleQuickAdd(product)
                            } else {
                              setExpandedProduct(product.stkno)
                            }
                          }}
                          disabled={product.bakiye <= 0}
                          className={`flex items-center justify-center gap-2 px-4 py-2.5 bg-kristal-600 text-white rounded-lg hover:bg-kristal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 ${
                            isExpanded ? 'flex-shrink-0' : 'flex-1'
                          }`}
                        >
                          <ShoppingCartIcon className="w-5 h-5" />
                          <span className="font-medium">
                            {isExpanded ? 'Ekle' : 'Sepete Ekle'}
                          </span>
                        </button>

                        {/* Adet Seçici - Hover'da Genişler */}
                        <div 
                          className={`flex items-center border-2 border-kristal-200 rounded-lg overflow-hidden bg-white transition-all duration-300 ${
                            isExpanded ? 'w-auto opacity-100' : 'w-0 opacity-0'
                          }`}
                        >
                          <button
                            onClick={() => handleQuantityChange(product.stkno, quantity - 1)}
                            disabled={quantity <= 1}
                            className="px-3 py-2 hover:bg-kristal-50 text-kristal-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <MinusIcon className="w-4 h-4" />
                          </button>
                          <input
                            type="number"
                            min="1"
                            max="999999"
                            value={quantity}
                            onChange={(e) => handleQuantityChange(product.stkno, e.target.value)}
                            className="w-16 px-2 py-2 text-center text-sm font-semibold border-0 focus:outline-none focus:ring-0 text-kristal-700"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <button
                            onClick={() => handleQuantityChange(product.stkno, quantity + 1)}
                            disabled={quantity >= 999999}
                            className="px-3 py-2 hover:bg-kristal-50 text-kristal-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <PlusIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Miktar Göstergesi */}
                      {isExpanded && (
                        <div className="mt-2 text-center">
                          <span className="text-xs text-gray-500">
                            Miktar: <span className="font-semibold text-kristal-600">{quantity} {product.birim || 'ADET'}</span>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl">
              <HeartIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium mb-2">
                Henüz favori ürününüz bulunmuyor
              </p>
              <p className="text-gray-400 text-sm">
                Ürünler sayfasından favori ürünlerinizi ekleyebilirsiniz
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}