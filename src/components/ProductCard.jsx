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
  } catch (error) {
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
            ) : (
              <div className="relative">
                <svg 
                  width="120" 
                  height="120" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  className="text-kristal-500"
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
            )}
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
              ) : (
                <div className="relative">
                  <svg 
                    width="40" 
                    height="40" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    className="text-kristal-500"
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
              )}
              
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
                  <p className="text-xs text-gray-400">Kod: {productCode}</p>
                </div>
                
                <div className="flex-shrink-0">
                  <Badge variant={stockCount > 0 ? 'success' : 'danger'}>
                    {stockCount > 0 ? 'Stokta' : 'Stok Yok'}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-lg font-bold text-kristal-600">
                  {formattedPrice}
                </div>

                <div className="flex items-center space-x-2">
                  <div className="inline-flex items-center rounded-lg border border-gray-300 bg-white hover:border-kristal-400 transition-colors">
                    <button 
                      onClick={handleDecrement}
                      disabled={quantity <= 1}
                      className="px-3 py-2 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors rounded-l-lg"
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
                      className="w-24 text-center py-2 text-sm font-medium border-0 focus:outline-none focus:ring-1 focus:ring-kristal-400"
                    />
                    <button 
                      onClick={handleIncrement}
                      disabled={quantity >= 9999999}
                      className="px-3 py-2 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors rounded-r-lg"
                    >
                      <PlusIcon className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>

                  <button
                    onClick={onFavoriteToggle}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
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
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        
        {/* Product Image with Zoom */}
        <div 
          className="relative h-56 bg-gray-100 flex items-center justify-center overflow-hidden cursor-pointer group"
          onClick={() => setShowImageModal(true)}
        >
          {product.imageUrl ? (
            <img 
              src={product.imageUrl} 
              alt={productName}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
          ) : (
            <div className="relative">
              <svg 
                width="48" 
                height="48" 
                viewBox="0 0 24 24" 
                fill="none" 
                className="text-kristal-500"
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
          )}
          
          {/* Zoom Icon Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
            <div className="flex flex-col items-center">
              <MagnifyingGlassIcon className="w-10 h-10 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity mt-2">
                Büyütmek için tıklayın
              </span>
            </div>
          </div>
          
          <button
            onClick={(e) => {
              e.stopPropagation()
              onFavoriteToggle()
            }}
            className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full shadow-md hover:shadow-lg transition-all flex items-center justify-center z-10"
          >
            {isFavorite ? (
              <HeartSolidIcon className="w-4 h-4 text-red-500" />
            ) : (
              <HeartIcon className="w-4 h-4 text-gray-400 hover:text-red-500" />
            )}
          </button>

          <div className="absolute top-2 left-2">
            <Badge variant={stockCount > 0 ? 'success' : 'danger'}>
              {stockCount > 0 ? 'Stokta' : 'Stok Yok'}
            </Badge>
          </div>
        </div>

        {/* Product Content */}
        <div className="p-4 flex flex-col h-[calc(100%-14rem)]">
          <div className="mb-3 min-h-[4.5rem]">
            <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-1 leading-tight h-10">
              {productName}
            </h3>
            <p className="text-xs text-gray-500">{productGroup}</p>
            <p className="text-xs text-gray-400">Kod: {productCode}</p>
          </div>

          <div className="mb-3 h-7 flex items-center">
            <div className="text-lg font-bold text-kristal-600">
              {formattedPrice}
            </div>
          </div>

          <div className="flex-1"></div>

          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-700">Adet:</span>
            <div className="inline-flex items-center rounded-lg border border-gray-300 bg-white hover:border-kristal-400 transition-colors">
              <button 
                onClick={handleDecrement}
                disabled={quantity <= 1}
                className="px-2.5 py-1.5 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors rounded-l-lg"
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
                className="w-24 text-center py-1.5 text-sm font-medium border-0 focus:outline-none focus:ring-1 focus:ring-kristal-400"
              />
              <button 
                onClick={handleIncrement}
                disabled={quantity >= 9999999}
                className="px-2.5 py-1.5 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors rounded-r-lg"
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