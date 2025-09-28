import { Fragment } from 'react'
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react'
import { 
  XMarkIcon,
  ShoppingBagIcon,
  PlusIcon,
  MinusIcon,
  TrashIcon
} from '@heroicons/react/24/outline'
import { useCartStore } from '../stores'
import { Button, Badge } from './ui'
import { useCreateOrder } from '../hooks/useApi'

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
  } catch (error) {
    // Fallback for unsupported currencies
    const symbols = { USD: '$', EUR: '€', TRY: '₺', TL: '₺' }
    const symbol = symbols[currency] || '₺'
    return `${symbol}${price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`
  }
}

export default function ShoppingCart() {
  const { 
    items, 
    isOpen, 
    setIsOpen, 
    removeItem, 
    updateQuantity, 
    clearCart,
    getTotalItems,
    getTotalPrice 
  } = useCartStore()
  
  const createOrderMutation = useCreateOrder()

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeItem(productId)
    } else {
      updateQuantity(productId, newQuantity)
    }
  }

  const handleCheckout = async () => {
    if (items.length === 0) return
    
    try {
      const orderProducts = items.map(item => ({
        cinsi: item.cinsi || 'TRY',
        stkno: item.stkno,
        adet: item.adet,
        fiyat: item.fiyat
      }))
      
      await createOrderMutation.mutateAsync(orderProducts)
      clearCart()
      setIsOpen(false)
      
      // Toast bildirimi göster
      if (window.showToast) {
        window.showToast({
          type: 'success',
          title: 'Sipariş Başarılı!',
          message: 'Siparişiniz başarıyla oluşturuldu ve işleme alındı.',
          duration: 5000
        })
      }
    } catch (error) {
      // Hata toast'ı
      if (window.showToast) {
        window.showToast({
          type: 'error',
          title: 'Sipariş Hatası',
          message: 'Sipariş oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.',
          duration: 5000
        })
      }
    }
  }

  // Para birimlerine göre sepet toplamını hesapla
  const getFormattedTotalsByCategory = () => {
    const totalsByCurrency = {}
    
    items.forEach(item => {
      const currency = item.cinsi || 'TRY'
      const itemTotal = item.fiyat * item.adet
      
      if (!totalsByCurrency[currency]) {
        totalsByCurrency[currency] = 0
      }
      totalsByCurrency[currency] += itemTotal
    })
    
    return totalsByCurrency
  }

  const totalsByCategory = getFormattedTotalsByCategory()

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
                            <ShoppingBagIcon className="w-6 h-6 mr-2" />
                            Sepetim
                            {getTotalItems() > 0 && (
                              <Badge className="ml-2">{getTotalItems()}</Badge>
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

                      {/* Cart Items */}
                      <div className="mt-8">
                        <div className="flow-root">
                          {items.length === 0 ? (
                            // Empty Cart State
                            <div className="text-center py-12">
                              <ShoppingBagIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                              <h3 className="text-sm font-medium text-gray-900 mb-2">
                                Sepetiniz boş
                              </h3>
                              <p className="text-sm text-gray-500">
                                Ürünler sayfasından ürün ekleyebilirsiniz.
                              </p>
                            </div>
                          ) : (
                            <ul className="-my-6 divide-y divide-gray-200">
                              {items.map((product) => (
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
                                        <h3 className="line-clamp-2">{product.stokadi}</h3>
                                        <p className="ml-4 font-semibold">
                                          {formatPrice(product.fiyat * product.adet, product.cinsi)}
                                        </p>
                                      </div>
                                      <p className="mt-1 text-sm text-gray-500">
                                        {product.grupadi}
                                      </p>
                                      <p className="text-xs text-gray-400">
                                        Birim: {formatPrice(product.fiyat, product.cinsi)}
                                      </p>
                                    </div>
                                    
                                    {/* Quantity Controls */}
                                    <div className="flex flex-1 items-end justify-between text-sm">
                                      <div className="flex items-center space-x-2">
                                        <button
                                          onClick={() => handleQuantityChange(product.stkno, product.adet - 1)}
                                          className="p-1 hover:bg-gray-100 rounded"
                                        >
                                          <MinusIcon className="w-4 h-4" />
                                        </button>
                                        <span className="font-medium px-2">{product.adet}</span>
                                        <button
                                          onClick={() => handleQuantityChange(product.stkno, product.adet + 1)}
                                          className="p-1 hover:bg-gray-100 rounded"
                                        >
                                          <PlusIcon className="w-4 h-4" />
                                        </button>
                                      </div>

                                      <button
                                        type="button"
                                        onClick={() => removeItem(product.stkno)}
                                        className="text-red-500 hover:text-red-700 p-1"
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
                    {items.length > 0 && (
                      <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
                        {/* Total by Currency */}
                        <div className="mb-4">
                          {Object.entries(totalsByCategory).map(([currency, total]) => (
                            <div key={currency} className="flex justify-between text-base font-medium text-gray-900 mb-2">
                              <p>Toplam ({currency})</p>
                              <p className="text-lg font-bold text-kristal-600">
                                {formatPrice(total, currency)}
                              </p>
                            </div>
                          ))}
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="space-y-3">
                          <Button
                            onClick={handleCheckout}
                            loading={createOrderMutation.isPending}
                            fullWidth
                            size="lg"
                          >
                            Siparişi Onayla
                          </Button>
                          
                          <Button
                            variant="outline"
                            onClick={clearCart}
                            fullWidth
                          >
                            Sepeti Temizle
                          </Button>
                        </div>
                        
                        <p className="mt-4 text-center text-sm text-gray-500">
                          Siparişiniz onaylandıktan sonra işleme alınacaktır.
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