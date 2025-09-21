import { useState } from 'react'
import { 
  HeartIcon, 
  ShoppingCartIcon, 
  EyeIcon,
  PlusIcon,
  MinusIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'
import { Button, Badge } from './ui'

export default function ProductCard({ 
  product, 
  viewMode = 'grid', 
  isFavorite = false,
  onFavoriteToggle,
  onAddToCart 
}) {
  const [quantity, setQuantity] = useState(1)
  const [showDetails, setShowDetails] = useState(false)

  const handleQuantityChange = (delta) => {
    const newQuantity = Math.max(1, quantity + delta)
    setQuantity(newQuantity)
  }

  const handleAddToCart = () => {
    onAddToCart(quantity)
    setQuantity(1) // Reset quantity after adding
  }

  if (viewMode === 'list') {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-center space-x-6">
          
          {/* Product Image Placeholder */}
          <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
            <span className="text-2xl text-gray-400">📦</span>
          </div>

          {/* Product Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {product.stokadi}
                </h3>
                <p className="text-sm text-gray-500 mt-1">{product.grupadi}</p>
                <p className="text-xs text-gray-400 mt-1">Kod: {product.stkno}</p>
              </div>
              
              {/* Stock Badge */}
              <Badge 
                variant={product.bakiye > 0 ? 'success' : 'danger'}
                className="ml-4"
              >
                {product.bakiye > 0 ? 'Stokta' : 'Stok Yok'}
              </Badge>
            </div>

            {/* Price and Actions */}
            <div className="flex items-center justify-between mt-4">
              <div className="text-2xl font-bold text-kristal-600">
                ₺{product.fiyat?.toLocaleString()}
                {product.cinsi && product.cinsi !== 'TL' && (
                  <span className="text-sm text-gray-500 ml-1">{product.cinsi}</span>
                )}
              </div>

              <div className="flex items-center space-x-2">
                {/* Quantity Selector */}
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button 
                    onClick={() => handleQuantityChange(-1)}
                    className="p-2 hover:bg-gray-100 transition-colors"
                  >
                    <MinusIcon className="w-4 h-4" />
                  </button>
                  <span className="px-3 py-1 font-medium">{quantity}</span>
                  <button 
                    onClick={() => handleQuantityChange(1)}
                    className="p-2 hover:bg-gray-100 transition-colors"
                  >
                    <PlusIcon className="w-4 h-4" />
                  </button>
                </div>

                {/* Actions */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onFavoriteToggle}
                >
                  {isFavorite ? (
                    <HeartSolidIcon className="w-5 h-5 text-red-500" />
                  ) : (
                    <HeartIcon className="w-5 h-5" />
                  )}
                </Button>

                <Button
                  onClick={handleAddToCart}
                  disabled={product.bakiye <= 0}
                  size="sm"
                >
                  <ShoppingCartIcon className="w-5 h-5 mr-2" />
                  Sepete Ekle
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      
      {/* Product Image */}
      <div className="relative h-48 bg-gray-100 flex items-center justify-center">
        <span className="text-6xl text-gray-300">📦</span>
        
        {/* Favorite Button */}
        <button
          onClick={onFavoriteToggle}
          className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-all"
        >
          {isFavorite ? (
            <HeartSolidIcon className="w-5 h-5 text-red-500" />
          ) : (
            <HeartIcon className="w-5 h-5 text-gray-400 hover:text-red-500" />
          )}
        </button>

        {/* Stock Badge */}
        <div className="absolute top-3 left-3">
          <Badge variant={product.bakiye > 0 ? 'success' : 'danger'}>
            {product.bakiye > 0 ? 'Stokta' : 'Stok Yok'}
          </Badge>
        </div>
      </div>

      {/* Product Content */}
      <div className="p-6">
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 mb-2">
            {product.stokadi}
          </h3>
          <p className="text-sm text-gray-500">{product.grupadi}</p>
          <p className="text-xs text-gray-400 mt-1">Kod: {product.stkno}</p>
        </div>

        {/* Price */}
        <div className="mb-4">
          <div className="text-2xl font-bold text-kristal-600">
            ₺{product.fiyat?.toLocaleString()}
            {product.cinsi && product.cinsi !== 'TL' && (
              <span className="text-sm text-gray-500 ml-1">{product.cinsi}</span>
            )}
          </div>
        </div>

        {/* Quantity Selector */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-gray-700">Adet:</span>
          <div className="flex items-center border border-gray-300 rounded-lg">
            <button 
              onClick={() => handleQuantityChange(-1)}
              className="p-1 hover:bg-gray-100 transition-colors"
            >
              <MinusIcon className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 font-medium min-w-[3rem] text-center">{quantity}</span>
            <button 
              onClick={() => handleQuantityChange(1)}
              className="p-1 hover:bg-gray-100 transition-colors"
            >
              <PlusIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Add to Cart Button */}
        <Button
          onClick={handleAddToCart}
          disabled={product.bakiye <= 0}
          fullWidth
        >
          <ShoppingCartIcon className="w-5 h-5 mr-2" />
          Sepete Ekle
        </Button>
      </div>
    </div>
  )
}