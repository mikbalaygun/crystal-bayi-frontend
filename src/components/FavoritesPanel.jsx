import { Fragment } from 'react'
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react'
import { 
  XMarkIcon,
  HeartIcon,
  ShoppingCartIcon,
  TrashIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'
import { useFavoriteProducts, useRemoveFromFavorites } from '../hooks/useApi'
import { useCartStore } from '../stores'
import { Button, Badge, Spinner } from './ui'

export default function FavoritesPanel({ isOpen, setIsOpen }) {
  const { data: favoriteProducts, isLoading } = useFavoriteProducts()
  const removeFromFavoritesMutation = useRemoveFromFavorites()
  const { addItem, setIsOpen: setCartOpen } = useCartStore()

  const handleAddToCart = (product) => {
    addItem({
      stkno: product.stkno,
      stokadi: product.stokadi,
      fiyat: product.fiyat,
      birim: product.birim,
      adet: 1,
      quantity: 1
    })
    
    // Favoriler kapan, sepet açıl
    setIsOpen(false)
    setCartOpen(true)
  }

  const handleRemoveFavorite = async (stkno) => {
    try {
      await removeFromFavoritesMutation.mutateAsync({ stkno })
    } catch (error) {
      console.error('Favorilerden çıkarılırken hata:', error)
    }
  }

  const handleAddAllToCart = () => {
    favoriteProducts
      .filter(product => product.bakiye > 0)
      .forEach(product => {
        addItem({
          stkno: product.stkno,
          stokadi: product.stokadi,
          fiyat: product.fiyat,
          birim: product.birim,
          adet: 1,
          quantity: 1
        })
      })
    // Favoriler kapan, sepet açıl
    setIsOpen(false)
    setCartOpen(true)
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
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <TransitionChild
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <DialogPanel className="pointer-events-auto w-screen max-w-md">
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
                            className="relative -m-2 p-2 text-gray-400 hover:text-gray-500"
                            onClick={() => setIsOpen(false)}
                          >
                            <XMarkIcon className="h-6 w-6" />
                          </button>
                        </div>
                      </div>

                      {/* Favorite Items */}
                      <div className="mt-8">
                        <div className="flow-root">
                          {isLoading ? (
                            <div className="flex justify-center py-12">
                              <Spinner text="Favoriler yükleniyor..." />
                            </div>
                          ) : favoriteProducts?.length === 0 ? (
                            // Empty Favorites State
                            <div className="text-center py-12">
                              <HeartIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                              <h3 className="text-sm font-medium text-gray-900 mb-2">
                                Favori ürününüz yok
                              </h3>
                              <p className="text-sm text-gray-500">
                                Ürünler sayfasından ürünleri favorilere ekleyebilirsiniz.
                              </p>
                            </div>
                          ) : (
                            <ul className="-my-6 divide-y divide-gray-200">
                              {favoriteProducts.map((product) => (
                                <li key={product.stkno} className="flex py-6">
                                  
                                  {/* Product Image */}
                                  <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                                    <div className="h-full w-full bg-gray-100 flex items-center justify-center">
                                      <span className="text-2xl">📦</span>
                                    </div>
                                  </div>

                                  {/* Product Details */}
                                  <div className="ml-4 flex flex-1 flex-col">
                                    <div>
                                      <div className="flex justify-between text-base font-medium text-gray-900">
                                        <h3 className="line-clamp-2 flex-1 mr-2">
                                          {product.stokadi}
                                        </h3>
                                        <div className="flex items-center space-x-2">
                                          <p className="font-semibold text-kristal-600">
                                            ₺{product.fiyat?.toLocaleString()}
                                          </p>
                                        </div>
                                      </div>
                                      <p className="mt-1 text-sm text-gray-500">
                                        {product.grupadi}
                                      </p>
                                      <p className="text-xs text-gray-400">
                                        Kod: {product.stkno}
                                      </p>
                                    </div>
                                    
                                    {/* Stock Status */}
                                    <div className="mt-2">
                                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                        product.bakiye > 0 
                                          ? 'bg-green-100 text-green-800' 
                                          : 'bg-red-100 text-red-800'
                                      }`}>
                                        {product.bakiye > 0 ? 'Stokta' : 'Stok Yok'}
                                      </span>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-1 items-end justify-between text-sm mt-3">
                                      <Button
                                        size="sm"
                                        onClick={() => handleAddToCart(product)}
                                        disabled={product.bakiye <= 0}
                                        className="flex items-center"
                                      >
                                        <ShoppingCartIcon className="w-4 h-4 mr-1" />
                                        Sepete Ekle
                                      </Button>

                                      <button
                                        type="button"
                                        onClick={() => handleRemoveFavorite(product.stkno)}
                                        disabled={removeFromFavoritesMutation.isPending}
                                        className="text-red-500 hover:text-red-700 p-1 disabled:opacity-50"
                                        title="Favorilerden çıkar"
                                      >
                                        <TrashIcon className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    {favoriteProducts?.length > 0 && (
                      <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
                        {/* Summary */}
                        <div className="flex justify-between text-base font-medium text-gray-900 mb-4">
                          <p>Toplam Favori</p>
                          <p className="text-xl font-bold text-red-500">
                            {favoriteProducts.length} ürün
                          </p>
                        </div>
                        
                        {/* Quick Actions */}
                        <div className="space-y-3">
                          <Button
                            variant="outline"
                            fullWidth
                            onClick={handleAddAllToCart}
                            disabled={favoriteProducts.every(product => product.bakiye <= 0)}
                          >
                            <ShoppingCartIcon className="w-4 h-4 mr-2" />
                            Stokta Olanları Sepete Ekle
                          </Button>
                        </div>
                        
                        <p className="mt-4 text-center text-sm text-gray-500">
                          Favori ürünleriniz burada listelenir.
                        </p>
                      </div>
                    )}
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