import { useState } from 'react'
import { 
  HeartIcon, 
  ShoppingCartIcon, 
  PlusIcon,
  MinusIcon,
  XMarkIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'
import { Button, Badge } from './ui'

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

export default function ProductCard({ 
  product, 
  viewMode = 'grid', 
  isFavorite = false,
  onFavoriteToggle,
  onAddToCart 
}) {
  const [quantity, setQuantity] = useState(1)
  const [inputValue, setInputValue] = useState('1')
  const [showImageModal, setShowImageModal] = useState(false)

  const handleIncrement = () => {
    const newQuantity = Math.min(9999999, quantity + 1)
    setQuantity(newQuantity)
    setInputValue(String(newQuantity))
  }

  const handleDecrement = () => {
    const newQuantity = Math.max(1, quantity - 1)
    setQuantity(newQuantity)
    setInputValue(String(newQuantity))
  }

  const handleInputChange = (e) => {
    const value = e.target.value
    if (value === '' || (/^\d+$/.test(value) && value.length <= 7)) {
      setInputValue(value)
    }
  }

  const handleInputBlur = () => {
    let numValue = parseInt(inputValue) || 1
    if (numValue < 1) numValue = 1
    if (numValue > 9999999) numValue = 9999999
    setQuantity(numValue)
    setInputValue(String(numValue))
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.target.blur()
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      handleIncrement()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      handleDecrement()
    }
  }

  const handleAddToCart = () => {
    onAddToCart(quantity)
    setQuantity(1)
    setInputValue('1')
  }

  const stockCount = product?.bakiye ?? 0
  const productPrice = product?.fiyat ?? 0
  const productName = product?.stokadi ?? 'Ürün Adı'
  const productGroup = product?.grupadi ?? product?.grpadi ?? 'Kategori'
  const productCode = product?.stkno ?? 'N/A'
  const productCurrency = product?.cinsi ?? 'TRY'
  const formattedPrice = formatPrice(productPrice, productCurrency)
  const stockLabel = stockCount > 0 ? 'Stokta' : 'Stok Yok'
  const stockBadgeClass = stockCount > 0
    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
    : 'border-red-200 bg-red-50 text-red-700'
  const crystalFallback = (size = 48, className = 'text-kristal-500/80') => (
    <div className="relative">
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={className}
      >
        <path
          d="M6 3h12l4 6-10 12L2 9l4-6z"
          fill="currentColor"
          opacity="0.8"
        />
        <path
          d="M6 3h12l4 6-10 12L2 9l4-6z"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
        />
      </svg>
    </div>
  )

  // Image Modal Component
  const ImageModal = () => {
    if (!showImageModal) return null
    
    return (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4"
        onClick={() => setShowImageModal(false)}
      >
        <button
          onClick={() => setShowImageModal(false)}
          className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center bg-white rounded-full hover:bg-gray-100 transition-colors"
        >
          <XMarkIcon className="w-6 h-6 text-gray-700" />
        </button>
        
        <div className="max-w-4xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl">
          <div className="relative bg-gray-100 flex items-center justify-center" style={{ minHeight: '500px' }}>
            {product.imageUrl ? (
              <img 
                src={product.imageUrl} 
                alt={productName}
                loading='lazy'
                className="max-w-full max-h-[80vh] object-contain"
                onClick={(e) => e.stopPropagation()}
              />
            ) : crystalFallback(120, 'text-kristal-500')}
          </div>
          
          <div className="p-6 border-t border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-2">{productName}</h3>
            <p className="text-sm text-gray-600 mb-1">{productGroup}</p>
            <p className="text-sm text-gray-500">Ürün Kodu: {productCode}</p>
            <div className="mt-4 text-2xl font-bold text-kristal-600">{formattedPrice}</div>
          </div>
        </div>
      </div>
    )
  }

  if (viewMode === 'list') {
    return (
      <>
        <ImageModal />
        <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-shadow">
          <div className="flex items-center space-x-4">
            
            {/* Product Image with Zoom */}
            <div 
              className="relative w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden cursor-pointer group"
              onClick={() => setShowImageModal(true)}
            >
              {product.imageUrl ? (
                <img 
                  src={product.imageUrl} 
                  alt={productName}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
              ) : crystalFallback(40, 'text-kristal-500')}
              
              {/* Zoom Icon Overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                <MagnifyingGlassIcon className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>

            {/* Product Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0 pr-4">
                  <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-1">
                    {productName}
                  </h3>
                  <p className="text-xs text-gray-500">{productGroup}</p>
                  <p className="mt-1 inline-flex items-center rounded-md border border-gray-200 bg-gray-50 px-2 py-1 font-mono text-xs font-semibold text-gray-700">
                    Kod: {productCode}
                  </p>
                </div>
                
                <div className="flex-shrink-0">
                  <Badge variant={stockCount > 0 ? 'success' : 'danger'}>
                    {stockLabel}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-lg font-bold text-kristal-600">
                  {formattedPrice}
                </div>

                <div className="flex items-center space-x-2">
                  <div className="inline-flex items-center rounded-lg border border-gray-200 bg-white shadow-sm transition-colors hover:border-kristal-300 focus-within:border-kristal-400 focus-within:ring-2 focus-within:ring-kristal-100">
                    <button 
                      onClick={handleDecrement}
                      disabled={quantity <= 1}
                      className="rounded-l-lg px-3 py-2 transition hover:bg-gray-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100"
                    >
                      <MinusIcon className="w-4 h-4 text-gray-600" />
                    </button>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={inputValue}
                      onChange={handleInputChange}
                      onBlur={handleInputBlur}
                      onKeyDown={handleKeyDown}
                      className="w-24 border-0 py-2 text-center text-sm font-semibold tabular-nums text-gray-800 focus:outline-none focus:ring-0"
                    />
                    <button 
                      onClick={handleIncrement}
                      disabled={quantity >= 9999999}
                      className="rounded-r-lg px-3 py-2 transition hover:bg-gray-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100"
                    >
                      <PlusIcon className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>

                  <button
                    onClick={onFavoriteToggle}
                    className="flex h-8 w-8 items-center justify-center rounded-lg transition hover:bg-gray-100 active:scale-95"
                  >
                    {isFavorite ? (
                      <HeartSolidIcon className="w-4 h-4 text-red-500" />
                    ) : (
                      <HeartIcon className="w-4 h-4 text-gray-400" />
                    )}
                  </button>

                  <Button
                    onClick={handleAddToCart}
                    disabled={stockCount <= 0}
                    size="sm"
                    className="px-3 py-1.5 text-xs font-medium min-w-[90px]"
                  >
                    <ShoppingCartIcon className="w-3 h-3 mr-1" />
                    Sepete Ekle
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <ImageModal />
      <div className="group overflow-hidden rounded-xl border border-gray-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
        
        {/* Product Image with Zoom */}
        <div 
          className="relative flex h-56 cursor-pointer items-center justify-center overflow-hidden bg-gray-100"
          onClick={() => setShowImageModal(true)}
        >
          {product.imageUrl ? (
            <img 
              src={product.imageUrl} 
              alt={productName}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
          ) : crystalFallback(48, 'text-kristal-500/80')}
          
          {/* Zoom Icon Overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-300 group-hover:bg-black/20">
            <div className="flex flex-col items-center">
              <MagnifyingGlassIcon className="h-9 w-9 text-white opacity-0 transition-opacity group-hover:opacity-100" />
              <span className="mt-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">
                Büyütmek için tıklayın
              </span>
            </div>
          </div>
          
          <button
            onClick={(e) => {
              e.stopPropagation()
              onFavoriteToggle()
            }}
            className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-md transition-all hover:shadow-lg active:scale-95"
          >
            {isFavorite ? (
              <HeartSolidIcon className="w-4 h-4 text-red-500" />
            ) : (
              <HeartIcon className="w-4 h-4 text-gray-400 hover:text-red-500" />
            )}
          </button>

          <div className="absolute left-2 top-2">
            <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold shadow-sm ${stockBadgeClass}`}>
              {stockLabel}
            </span>
          </div>
        </div>

        {/* Product Content */}
        <div className="flex h-[calc(100%-14rem)] flex-col p-4">
          <div className="mb-3 min-h-[4.5rem]">
            <h3 className="mb-1 h-10 line-clamp-2 text-sm font-semibold leading-tight text-gray-900">
              {productName}
            </h3>
            <p className="text-xs text-gray-500">{productGroup}</p>
            <p className="mt-1 inline-flex items-center rounded-md border border-gray-200 bg-gray-50 px-2 py-1 font-mono text-xs font-semibold text-gray-700">
              Kod: {productCode}
            </p>
          </div>

          <div className="mb-3 flex h-7 items-center">
            <div className="text-lg font-bold text-kristal-600">
              {formattedPrice}
            </div>
          </div>

          <div className="flex-1" />

          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-medium text-gray-700">Adet:</span>
            <div className="inline-grid grid-cols-[32px_104px_32px] items-center overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-colors hover:border-kristal-300 focus-within:border-kristal-400 focus-within:ring-2 focus-within:ring-kristal-100">
              <button 
                onClick={handleDecrement}
                disabled={quantity <= 1}
                className="flex h-8 items-center justify-center rounded-l-lg transition hover:bg-gray-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100"
              >
                <MinusIcon className="w-3.5 h-3.5 text-gray-600" />
              </button>
              <input
                type="text"
                inputMode="numeric"
                value={inputValue}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                onKeyDown={handleKeyDown}
                className="h-8 w-full border-x border-gray-100 bg-gray-50 px-2 text-center font-mono text-sm font-semibold tabular-nums text-gray-800 focus:outline-none focus:ring-0"
              />
              <button 
                onClick={handleIncrement}
                disabled={quantity >= 9999999}
                className="flex h-8 items-center justify-center rounded-r-lg transition hover:bg-gray-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100"
              >
                <PlusIcon className="w-3.5 h-3.5 text-gray-600" />
              </button>
            </div>
          </div>

          <Button
            onClick={handleAddToCart}
            disabled={stockCount <= 0}
            fullWidth
            className="py-2 text-xs font-medium"
          >
            <ShoppingCartIcon className="w-4 h-4 mr-2" />
            Sepete Ekle
          </Button>
        </div>
      </div>
    </>
  )
}
