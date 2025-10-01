import { useState } from 'react'
import { 
  ClipboardDocumentListIcon,
  EyeIcon,
  CalendarDaysIcon,
  MagnifyingGlassIcon
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
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

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

  // Filtreleme
  const filteredOrders = ordersList.filter((order) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const matchesSearch = 
        order.sipno?.toString().includes(query) ||
        order.items.some(item => 
          item.mlzadi?.toLowerCase().includes(query)
        )
      if (!matchesSearch) return false
    }
    return true
  })

  const getStatusColor = (order) => {
    return 'bg-orange-100 text-orange-800'
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    
    try {
      const cleaned = String(dateString).trim()
      const parts = cleaned.replace(/[\.\/\-]/g, '.').split('.')
      
      if (parts.length === 3) {
        // Backend'den yıl.ay.gün formatında geliyor (2025.08.12)
        if (parts[0].length === 4) {
          const [year, month, day] = parts
          return `${day.padStart(2, '0')}.${month.padStart(2, '0')}.${year}`
        }
        // Gün.ay.yıl formatında gelirse direkt döndür
        const [day, month, year] = parts
        return `${day.padStart(2, '0')}.${month.padStart(2, '0')}.${year}`
      }
      
      return cleaned
    } catch (e) {
      return String(dateString)
    }
  }

  return (
    <div className="space-y-4">
      
      {/* Kompakt Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bekleyen Siparişler</h1>
          <p className="text-sm text-gray-500">{filteredOrders.length.toLocaleString()} sipariş</p>
        </div>
      </div>

      {/* Kompakt Filters */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Arama */}
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Sipariş no, ürün ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2.5 w-full border border-gray-300 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-kristal-500 focus:border-kristal-500 transition-all text-sm"
              />
            </div>
          </div>

          

          {/* Başlangıç Tarihi */}
          <div className="w-full lg:w-44">
            <Input
              type="date"
              value={dateFilter.start}
              onChange={(e) => setDateFilter(prev => ({ ...prev, start: e.target.value }))}
              className="w-full py-2.5 px-3 rounded-lg border-gray-300 focus:ring-kristal-500 focus:border-kristal-500 text-sm"
              placeholder="Başlangıç"
            />
          </div>

          {/* Bitiş Tarihi */}
          <div className="w-full lg:w-44">
            <Input
              type="date"
              value={dateFilter.end}
              onChange={(e) => setDateFilter(prev => ({ ...prev, end: e.target.value }))}
              className="w-full py-2.5 px-3 rounded-lg border-gray-300 focus:ring-kristal-500 focus:border-kristal-500 text-sm"
              placeholder="Bitiş"
            />
          </div>

          {/* Filtrele Butonu */}
          <Button size="sm" className="px-4">
            <CalendarDaysIcon className="w-4 h-4 mr-1" />
            Filtrele
          </Button>
        </div>
      </Card>

      {/* Orders List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" text="Siparişler yükleniyor..." />
        </div>
      ) : filteredOrders.length === 0 ? (
        <Card className="p-8 text-center">
          <ClipboardDocumentListIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            Bekleyen sipariş bulunamadı
          </h3>
          <p className="text-sm text-gray-500">
            Henüz bekleyen siparişiniz bulunmuyor.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <Card key={order.sipno} className="overflow-hidden">
              <div className="p-4">
                
                {/* Order Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
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
                <div className="border-t border-gray-200 pt-3">
                  <div className="space-y-2">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 text-sm">{item.mlzadi}</h4>
                          <p className="text-xs text-gray-500">
                            Adet: {item.sipbak} • Birim Fiyat: ₺{parseFloat(item.sipfyt || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                          </p>
                          {item.termin && (
                            <p className="text-xs text-gray-400">
                              Termin: {formatDate(item.termin)}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900 text-sm">
                            ₺{parseFloat(item.siptut || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}