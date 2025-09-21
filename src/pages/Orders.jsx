import { useState } from 'react'
import { 
  ClipboardDocumentListIcon,
  EyeIcon,
  CalendarDaysIcon 
} from '@heroicons/react/24/outline'
import { Card, Badge, Spinner, Button, Input } from '../components/ui'
import { useOrders } from '../hooks/useApi'
import { useAuthStore } from '../stores'

export default function Orders() {
  const { user } = useAuthStore()
  const { data: ordersData, isLoading, error } = useOrders()
  const [dateFilter, setDateFilter] = useState({
    start: '',
    end: ''
  })

  // Extract orders array from nested data
  const orders = ordersData?.orders || []

  // Group orders by order number
  const groupedOrders = Array.isArray(orders) ? orders.reduce((acc, order) => {
    const orderNo = order.sipno
    if (!acc[orderNo]) {
      acc[orderNo] = {
        sipno: order.sipno,
        tarih: order.tarih,
        termin: order.termin,
        items: [],
        totalAmount: 0
      }
    }
    acc[orderNo].items.push(order)
    acc[orderNo].totalAmount += order.siptut || 0
    return acc
  }, {}) : {}

  const ordersList = Object.values(groupedOrders)

  const getStatusColor = (order) => {
    // Bu backend'den gelecek status bilgisine göre değişecek
    return 'bg-orange-100 text-orange-800' // Bekleyen durumu için
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    try {
      // Backend'den DD-MM-YYYY formatında geliyor
      const parts = dateString.split(/[-\/]/)
      if (parts.length === 3) {
        const date = new Date(parts[2], parts[1] - 1, parts[0])
        return date.toLocaleDateString('tr-TR')
      }
      return dateString
    } catch (e) {
      return dateString || '-'
    }
  }

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bekleyen Siparişler</h1>
          <p className="mt-1 text-sm text-gray-500">
            {ordersList.length} sipariş bulundu
          </p>
        </div>
      </div>

      {/* Date Filters */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Başlangıç Tarihi
            </label>
            <Input
              type="date"
              value={dateFilter.start}
              onChange={(e) => setDateFilter(prev => ({ ...prev, start: e.target.value }))}
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bitiş Tarihi
            </label>
            <Input
              type="date"
              value={dateFilter.end}
              onChange={(e) => setDateFilter(prev => ({ ...prev, end: e.target.value }))}
            />
          </div>
          <Button variant="outline">
            <CalendarDaysIcon className="w-5 h-5 mr-2" />
            Filtrele
          </Button>
        </div>
      </Card>

      {/* Orders List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" text="Siparişler yükleniyor..." />
        </div>
      ) : ordersList.length === 0 ? (
        <Card className="p-12 text-center">
          <ClipboardDocumentListIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Bekleyen sipariş bulunamadı
          </h3>
          <p className="text-gray-500">
            Henüz bekleyen siparişiniz bulunmuyor.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {ordersList.map((order) => (
            <Card key={order.sipno} className="overflow-hidden">
              <div className="p-6">
                
                {/* Order Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Sipariş #{order.sipno}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Tarih: {formatDate(order.tarih)}
                      </p>
                    </div>
                    <Badge className={getStatusColor(order)}>
                      Bekleyen
                    </Badge>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-lg font-bold text-kristal-600">
                      ₺{order.totalAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-sm text-gray-500">
                      {order.items.length} ürün
                    </p>
                  </div>
                </div>

                {/* Order Items */}
                <div className="border-t border-gray-200 pt-4">
                  <div className="space-y-3">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{item.mlzadi}</h4>
                          <p className="text-sm text-gray-500">
                            Adet: {item.sipbak} • Birim Fiyat: ₺{parseFloat(item.sipfyt || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                          </p>
                          {item.termin && (
                            <p className="text-xs text-gray-400">
                              Termin: {formatDate(item.termin)}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            ₺{parseFloat(item.siptut || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Actions */}
                <div className="flex justify-end mt-4 pt-4 border-t border-gray-200">
                  <Button variant="outline" size="sm">
                    <EyeIcon className="w-4 h-4 mr-2" />
                    Detayları Görüntüle
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}