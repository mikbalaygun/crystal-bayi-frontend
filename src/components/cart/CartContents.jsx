import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  MinusIcon,
  PlusIcon,
  ShoppingBagIcon,
  TrashIcon,
} from '@heroicons/react/24/outline'
import { Button, Badge, Card } from '../ui'
import { useCartStore } from '../../stores'
import { useCreateOrder } from '../../hooks/useApi'

const formatPrice = (price, currency = 'TRY') => {
  if (!price || Number.isNaN(price)) return '₺0,00'

  try {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price)
  } catch {
    const symbols = { USD: '$', EUR: '€', TRY: '₺', TL: '₺' }
    const symbol = symbols[currency] || '₺'
    return `${symbol}${price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`
  }
}

const getOrderErrorMessage = (result) => {
  if (!result) return 'Sipariş oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.'
  return result.error || result.message || 'Sipariş oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.'
}

/* ─── Editable Quantity Input ─── */
function QuantityInput({ value, onChange, compact = false }) {
  const [inputValue, setInputValue] = useState(String(value))

  // Sync external value changes
  const handleInputChange = (e) => {
    const val = e.target.value
    if (val === '' || (/^\d+$/.test(val) && val.length <= 7)) {
      setInputValue(val)
    }
  }

  const handleBlur = () => {
    let numValue = parseInt(inputValue) || 1
    if (numValue < 1) numValue = 1
    if (numValue > 9999999) numValue = 9999999
    setInputValue(String(numValue))
    onChange(numValue)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.target.blur()
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      const next = Math.min(9999999, value + 1)
      setInputValue(String(next))
      onChange(next)
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      const next = Math.max(1, value - 1)
      setInputValue(String(next))
      onChange(next)
    }
  }

  const handleIncrement = () => {
    const next = Math.min(9999999, value + 1)
    setInputValue(String(next))
    onChange(next)
  }

  const handleDecrement = () => {
    if (value <= 1) return
    const next = value - 1
    setInputValue(String(next))
    onChange(next)
  }

  const btnCls = compact
    ? 'p-1.5 text-gray-500 transition hover:bg-gray-50'
    : 'flex h-9 w-9 items-center justify-center hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors'

  const inputCls = compact
    ? 'w-12 text-center text-xs font-medium border-0 focus:outline-none focus:ring-1 focus:ring-kristal-400 bg-transparent'
    : 'h-9 w-28 text-center font-mono text-sm font-semibold tabular-nums border-0 focus:outline-none focus:ring-1 focus:ring-kristal-400 bg-white'

  return (
    <div className={`inline-flex items-center overflow-hidden rounded-lg border border-gray-200 bg-white ${compact ? '' : 'hover:border-kristal-400 transition-colors'}`}>
      <button
        onClick={handleDecrement}
        disabled={value <= 1}
        className={`${btnCls} rounded-l-lg`}
      >
        <MinusIcon className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
      </button>
      <input
        type="text"
        inputMode="numeric"
        data-qty-input="true"
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={inputCls}
      />
      <button
        onClick={handleIncrement}
        disabled={value >= 9999999}
        className={`${btnCls} rounded-r-lg`}
      >
        <PlusIcon className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
      </button>
    </div>
  )
}

export default function CartContents({ mode = 'page', onClose }) {
  const navigate = useNavigate()
  const {
    items,
    removeItem,
    updateQuantity,
    clearCart,
    getTotalItems,
  } = useCartStore()
  const createOrderMutation = useCreateOrder()

  const isPreview = mode === 'preview'

  const totalsByCurrency = useMemo(() => {
    return items.reduce((acc, item) => {
      const currency = item.cinsi || 'TRY'
      const itemTotal = (item.fiyat || 0) * (item.adet || 0)

      acc[currency] = (acc[currency] || 0) + itemTotal
      return acc
    }, {})
  }, [items])

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeItem(productId)
      return
    }
    updateQuantity(productId, newQuantity)
  }

  const handleGoToCart = () => {
    onClose?.()
    navigate('/cart')
  }

  const handleContinueShopping = () => {
    onClose?.()
    navigate('/products')
  }

  const handleCheckout = async () => {
    if (items.length === 0) return

    try {
      const orderProducts = items.map((item) => ({
        cinsi: item.cinsi || 'TRY',
        stkno: item.stkno,
        adet: item.adet,
        fiyat: item.fiyat,
      }))

      const result = await createOrderMutation.mutateAsync(orderProducts)

      if (!result?.success) {
        throw new Error(getOrderErrorMessage(result))
      }

      await clearCart()
      onClose?.()

      if (window.showToast) {
        window.showToast({
          type: 'success',
          title: 'Sipariş Başarılı',
          message: 'Siparişiniz başarıyla oluşturuldu ve işleme alındı.',
          duration: 5000,
        })
      }

      if (!isPreview) {
        navigate('/orders')
      }
    } catch (error) {
      if (window.showToast) {
        window.showToast({
          type: 'error',
          title: 'Sipariş Hatası',
          message: error.message || 'Sipariş oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.',
          duration: 5000,
        })
      }
    }
  }

  const emptyState = (
    <Card className="overflow-hidden border-gray-200 bg-white">
      <div className="mx-auto flex max-w-xl flex-col items-center px-6 py-14 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-kristal-100 bg-kristal-50 text-kristal-600">
          <ShoppingBagIcon className="h-8 w-8" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900">Sepetiniz şu an boş</h2>
        <p className="mt-2 text-sm leading-6 text-gray-500">
          Ürünleri sepetinize ekledikten sonra adetleri kontrol edip siparişinizi buradan onaylayabilirsiniz.
        </p>
        <div className="mt-6">
        <Button onClick={handleContinueShopping}>
          Ürünlere Dön
        </Button>
        </div>
      </div>
    </Card>
  )

  if (!items.length) {
    return emptyState
  }

  /* ─────────── PREVIEW MODE (Sidebar) ─────────── */
  if (isPreview) {
    return (
      <div className="flex h-full flex-col">
        {/* Ürün listesi */}
        <div className="flex-1 overflow-y-auto">
          <ul className="divide-y divide-gray-100">
            {items.map((product) => (
              <li key={product.stkno} className="px-5 py-4">
                <div className="flex gap-3">
                  {/* Thumbnail */}
                  <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.stokadi}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gray-50 text-kristal-300">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                          <path d="M6 3h12l4 6-10 12L2 9l4-6z" fill="currentColor" opacity="0.6" />
                          <path d="M6 3h12l4 6-10 12L2 9l4-6z" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.8" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h4 className="truncate text-sm font-medium text-gray-900">
                          {product.stokadi}
                        </h4>
                        <p className="mt-0.5 text-xs text-gray-400">
                          {product.stkno} · {formatPrice(product.fiyat, product.cinsi)}
                        </p>
                      </div>
                      <span className="flex-shrink-0 text-sm font-semibold text-gray-900">
                        {formatPrice((product.fiyat || 0) * (product.adet || 0), product.cinsi)}
                      </span>
                    </div>

                    {/* Quantity + Remove */}
                    <div className="mt-2.5 flex items-center justify-between">
                      <QuantityInput
                        compact
                        value={product.adet}
                        onChange={(val) => handleQuantityChange(product.stkno, val)}
                      />

                      <button
                        type="button"
                        onClick={() => removeItem(product.stkno)}
                        className="rounded-md p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-500"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Alt kısım — Toplam ve Butonlar (sadece Sepete Git + Temizle) */}
        <div className="border-t border-gray-100 bg-gray-50/60 px-5 py-4">
          {/* Toplam */}
          {Object.entries(totalsByCurrency).map(([currency, total]) => (
            <div
              key={currency}
              className="mb-3 flex items-center justify-between"
            >
              <span className="text-sm text-gray-500">Toplam ({currency})</span>
              <span className="text-lg font-bold text-gray-900">
                {formatPrice(total, currency)}
              </span>
            </div>
          ))}

          {/* Butonlar — sadece Sepete Git ve Temizle */}
          <div className="mt-1 space-y-2">
            <Button onClick={handleGoToCart} fullWidth size="lg">
              Sepete Git
              <ArrowRightIcon className="ml-2 h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              onClick={clearCart}
              fullWidth
              className="text-sm text-gray-500 hover:text-red-500"
            >
              Sepeti Temizle
            </Button>
          </div>
        </div>
      </div>
    )
  }

  /* ─────────── PAGE MODE (Full Cart) ─────────── */
  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white px-5 py-5 shadow-sm sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-kristal-50 text-kristal-600">
                <ShoppingBagIcon className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-gray-900">Sepetim</h1>
                  <Badge>{getTotalItems()}</Badge>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Siparişinizi gözden geçirin, adetleri düzenleyin ve onaylamadan önce toplamları kontrol edin.
                </p>
              </div>
          </div>
        </div>

        <Button variant="ghost" onClick={handleContinueShopping}>
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Ürünlere Dön
        </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_380px]">
        <Card className="overflow-hidden p-0">
          <div className="border-b border-gray-100 bg-gray-50/70 px-4 py-4 sm:px-6">
            <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBagIcon className="h-5 w-5 text-gray-700" />
              <h2 className="text-lg font-semibold text-gray-900">Ürünler</h2>
            </div>
              <span className="rounded-full bg-white px-3 py-1 text-sm font-medium text-gray-500 ring-1 ring-gray-100">
                {items.length} kalem
              </span>
            </div>
          </div>

          <ul className="divide-y divide-gray-100 px-4 sm:px-6">
            {items.map((product) => (
              <li
                key={product.stkno}
                className="py-5 first:pt-5 last:pb-5"
              >
                <div className="grid gap-4 sm:grid-cols-[112px_minmax(0,1fr)]">
                  <div className="aspect-[4/3] w-full overflow-hidden rounded-lg border border-gray-200 bg-white p-2 shadow-sm">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.stokadi}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center rounded-md bg-gray-50 text-kristal-300">
                      <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                        <path d="M6 3h12l4 6-10 12L2 9l4-6z" fill="currentColor" opacity="0.6" />
                        <path d="M6 3h12l4 6-10 12L2 9l4-6z" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.8" />
                      </svg>
                    </div>
                  )}
                </div>

                  <div className="min-w-0">
                    <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                    <div className="min-w-0">
                      <h3 className="break-words text-sm font-semibold text-gray-900 sm:text-base">
                        {product.stokadi}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">{product.grupadi}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                          <span className="rounded-md bg-gray-50 px-2 py-1 font-mono">
                            {product.stkno}
                          </span>
                          <span>Birim: {formatPrice(product.fiyat, product.cinsi)}</span>
                        </div>
                    </div>

                      <div className="text-left xl:ml-4 xl:text-right">
                        <p className="text-lg font-bold text-gray-950">
                        {formatPrice((product.fiyat || 0) * (product.adet || 0), product.cinsi)}
                      </p>
                        <p className="mt-0.5 text-xs font-medium text-gray-400">{product.cinsi || 'TRY'}</p>
                    </div>
                  </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-gray-50/80 px-3 py-3">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold text-gray-500">Adet</span>
                    <QuantityInput
                      value={product.adet}
                      onChange={(val) => handleQuantityChange(product.stkno, val)}
                    />
                      </div>

                    <button
                      type="button"
                      onClick={() => removeItem(product.stkno)}
                        className="inline-flex items-center rounded-lg px-3 py-2 text-sm font-medium text-red-500 transition hover:bg-red-50 hover:text-red-600"
                      aria-label={`${product.stokadi} sepetten çıkar`}
                    >
                        <TrashIcon className="mr-1.5 h-4 w-4" />
                        Çıkar
                    </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="h-fit p-4 sm:p-6 lg:sticky lg:top-24">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Sipariş Özeti</h2>
              <p className="mt-0.5 text-sm text-gray-500">{items.length} kalem</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-kristal-50 text-kristal-600">
              <ShoppingBagIcon className="h-5 w-5" />
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {Object.entries(totalsByCurrency).map(([currency, total]) => (
              <div
                key={currency}
                className="flex items-end justify-between rounded-lg bg-gray-50 px-4 py-3 ring-1 ring-gray-100"
              >
                <span className="text-sm font-medium text-gray-600">Toplam ({currency})</span>
                <span className="text-xl font-bold text-gray-950">
                  {formatPrice(total, currency)}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-3">
            <Button
              onClick={handleCheckout}
              loading={createOrderMutation.isPending}
              fullWidth
              size="lg"
            >
              Siparişi Onayla
            </Button>

            <Button variant="outline" onClick={clearCart} fullWidth>
              Sepeti Temizle
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
