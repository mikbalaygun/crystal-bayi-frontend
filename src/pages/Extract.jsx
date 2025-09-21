import { useState, useRef } from 'react'
import { 
  DocumentTextIcon,
  CalendarDaysIcon,
  PrinterIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ArrowLeftIcon,
  FunnelIcon
} from '@heroicons/react/24/outline'
import { Card, Button, Input, Badge, Spinner } from '../components/ui'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '../stores'
import apiClient from '../services/api'
import moment from 'moment'

/** Detay verisini çeken küçük hook (JS sürüm) */
const useExtractDetail = (fkn) => {
  return useQuery({
    queryKey: ['extract-detail', fkn],
    enabled: !!fkn, // sadece fkn varsa fetch et
    queryFn: async () => {
      const { data } = await apiClient.get(`/extract/${fkn}`)
      const rows = data?.success ? data.data : []
      return Array.isArray(rows) ? rows : rows ? [rows] : []
    },
  })
}

/** Güvenli lowercase */
const sl = (v) => (v ?? '').toString().toLowerCase()

/** (Opsiyonel) Sadece belirli işleme detay göster */
const canShowDetail = (t) => {
  const x = sl(t)
  return x.includes('satış faturası') || x.includes('alış faturası') || x.includes('iade')
  // her satıra detay istersen: return true
}

export default function Extract() {
  const { user } = useAuthStore()
  const [dateFilter, setDateFilter] = useState({ start: '', end: '' })
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedExtract, setSelectedExtract] = useState(null)
  const [currentView, setCurrentView] = useState('list') // 'list' | 'detail'
  const [showFilters, setShowFilters] = useState(false)
  const [transactionFilter, setTransactionFilter] = useState('all') // 'all'|'sales'|'payment'|'return'
  const [detailFkn, setDetailFkn] = useState(null) // << ekstre detay fkn
  const printRef = useRef(null)

  // Detay verisini her render'da aynı sırada çağır (enabled ile kontrol)
  const {
    data: detailRows = [],
    isLoading: detailLoading,
    error: detailError,
  } = useExtractDetail(detailFkn)

  // Liste API çağrısı
  const { data: extractResponse, isLoading, error, refetch } = useQuery({
    queryKey: ['extract', dateFilter.start, dateFilter.end],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (dateFilter.start && dateFilter.end) {
        params.append('start', moment(dateFilter.start).format('DD-MM-YYYY'))
        params.append('end', moment(dateFilter.end).format('DD-MM-YYYY'))
      }
      const response = await apiClient.get(`/extract${params.toString() ? `?${params}` : ''}`)
      return response.data
    },
    select: (data) => (data && data.success ? data.data : [])
  })

  const extractData = extractResponse || []

  // Filtreleme + sıralama
  const filteredData = extractData
    .filter((item) => {
      if (searchQuery) {
        const q = sl(searchQuery)
        const matchesSearch =
          sl(item.wisad).includes(q) ||
          sl(item.wbelge).includes(q) ||
          sl(item.wacik).includes(q)
        if (!matchesSearch) return false
      }

      if (transactionFilter !== 'all') {
        if (transactionFilter === 'sales' && !sl(item.wisad).includes('satış')) return false
        if (transactionFilter === 'payment' && !(sl(item.wisad).includes('tahsilat') || sl(item.wisad).includes('dekont'))) return false
        if (transactionFilter === 'return' && !sl(item.wisad).includes('iade')) return false
      }

      return true
    })
    .sort((a, b) => {
      const dateA = moment(a.wtarih, 'YYYY/MM/DD')
      const dateB = moment(b.wtarih, 'YYYY/MM/DD')
      return dateA.isAfter(dateB) ? 1 : -1
    })

  const handleFilter = () => refetch()
  const handlePrint = () => window.print()

  const handleExport = async () => {
    try {
      const params = new URLSearchParams()
      if (dateFilter.start) params.append('start', moment(dateFilter.start).format('DD-MM-YYYY'))
      if (dateFilter.end) params.append('end', moment(dateFilter.end).format('DD-MM-YYYY'))
      const response = await apiClient.get(`/excel/extract?${params}`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `ekstre-${moment().format('YYYY-MM-DD')}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      console.error('Export failed:', error)
      alert('Excel export işlemi başarısız')
    }
  }

  const formatCurrency = (amount) => {
    const numAmount = parseFloat(amount) || 0
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2
    }).format(numAmount)
  }

  const formatDate = (dateStr) => {
    if (!dateStr || dateStr.length === 0) return '-'
    return moment(dateStr, 'YYYY/MM/DD').format('DD.MM.YYYY')
  }

  const getTransactionTypeInfo = (type) => {
    switch (sl(type)) {
      case 'satış faturası':
        return { color: 'bg-red-100 text-red-800', icon: ArrowTrendingDownIcon, label: 'Satış' }
      case 'kredi kartı tahsilat':
      case 'tahsilat':
        return { color: 'bg-green-100 text-green-800', icon: ArrowTrendingUpIcon, label: 'Tahsilat' }
      case 'iade girişi':
        return { color: 'bg-blue-100 text-blue-800', icon: ArrowLeftIcon, label: 'İade' }
      case 'dekont':
        return { color: 'bg-gray-100 text-gray-800', icon: DocumentTextIcon, label: 'Dekont' }
      default:
        return { color: 'bg-gray-100 text-gray-800', icon: DocumentTextIcon, label: type || 'Bilinmeyen' }
    }
  }

  /** DETAY GÖRÜNÜMÜ */
  if (currentView === 'detail' && selectedExtract) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => {
                setCurrentView('list')
                setDetailFkn(null) // hook sırası sabit, data fetch durur
              }}
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Geri Dön
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Ekstre Detayı</h1>
              <p className="text-sm text-gray-500 mt-1">
                {getTransactionTypeInfo(selectedExtract.wisad).label} • {formatDate(selectedExtract.wtarih)}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={handlePrint}>
              <PrinterIcon className="w-4 h-4 mr-2" />
              Yazdır
            </Button>
          </div>
        </div>

        {/* Sol: Genel Bilgiler  |  Sağ: Hareket Kalemleri */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* SOL */}
          <Card className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 bg-blue-100 rounded-xl">
                <DocumentTextIcon className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Genel Bilgiler</h3>
            </div>
            <dl className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <dt className="text-gray-600 font-medium">Tarih:</dt>
                <dd className="font-semibold text-gray-900">{formatDate(selectedExtract.wtarih)}</dd>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <dt className="text-gray-600 font-medium">İşlem Türü:</dt>
                <dd>
                  <Badge className={`${getTransactionTypeInfo(selectedExtract.wisad).color} px-3 py-1 rounded-full font-medium`}>
                    {getTransactionTypeInfo(selectedExtract.wisad).label}
                  </Badge>
                </dd>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <dt className="text-gray-600 font-medium">Belge No:</dt>
                <dd className="font-mono text-gray-900">{selectedExtract.wbelge || '-'}</dd>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <dt className="text-gray-600 font-medium">Vade:</dt>
                <dd className="font-semibold text-gray-900">{formatDate(selectedExtract.wvade)}</dd>
              </div>
              <div className="py-3">
                <dt className="text-gray-600 font-medium mb-2">Açıklama:</dt>
                <dd className="text-gray-900 bg-gray-50 p-3 rounded-lg border">
                  {selectedExtract.wacik || 'Açıklama bulunmuyor'}
                </dd>
              </div>
            </dl>
          </Card>

          {/* SAĞ: Hareket Kalemleri */}
          <Card className="p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-3 bg-purple-100 rounded-xl">
                <ChartBarIcon className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Hareket Kalemleri</h3>
            </div>

            {detailLoading && <div className="py-8 text-gray-500">Detaylar yükleniyor…</div>}
            {detailError && <div className="py-8 text-red-600">Detay alınamadı.</div>}
            {!detailLoading && detailRows.length === 0 && <div className="py-8 text-gray-500">Bu belge için kalem bulunamadı.</div>}

            {detailRows.length > 0 && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Stok No</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Ürün</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Birim</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Miktar</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Birim Fiyat</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">KDV %</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Tutar</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {detailRows.map((r, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-sm font-mono">{r.stkno ?? '-'}</td>
                        <td className="px-4 py-2 text-sm">{r.mlzadi ?? r.wstokadi ?? r.wacik ?? '-'}</td>
                        <td className="px-4 py-2 text-sm text-right">{r.mlzbrm ?? '-'}</td>
                        <td className="px-4 py-2 text-sm text-right">
                          {new Intl.NumberFormat('tr-TR').format(r.hmik ?? r.wmiktar ?? 0)}
                        </td>
                        <td className="px-4 py-2 text-sm text-right">
                          {formatCurrency(r.hfyt ?? r.wfiyat ?? 0)}
                        </td>
                        <td className="px-4 py-2 text-sm text-right">{(r.hkdv ?? 0).toString()}</td>
                        <td className="px-4 py-2 text-sm text-right">
                          {formatCurrency(r.htutar ?? r.wtutar ?? 0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </div>
    )
  }

  /** LİSTE GÖRÜNÜMÜ */
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Hesap Ekstresi</h1>
          <p className="mt-1 text-sm text-gray-500">Hesap hareketlerinizi görüntüleyin ve takip edin</p>
        </div>
        <div className="flex items-center space-x-2 mt-4 md:mt-0">
          <Button variant="outline" onClick={handlePrint}>
            <PrinterIcon className="w-5 h-5 mr-2" />
            Yazdır
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex items-center">
            <Button 
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={showFilters ? 'bg-kristal-50 border-kristal-200 text-kristal-700' : ''}
            >
              <FunnelIcon className="w-5 h-5 mr-2" />
              Filtreler
            </Button>
          </div>

          {showFilters && (
            <div className="flex flex-col lg:flex-row gap-4 w-full">
              {/* Arama */}
              <div className="flex-1">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Belge, açıklama ile ara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-kristal-500 focus:border-kristal-500 transition-all"
                  />
                </div>
              </div>

              {/* İşlem Türü */}
              <div className="w-48">
                <select
                  value={transactionFilter}
                  onChange={(e) => setTransactionFilter(e.target.value)}
                  className="w-full py-3 px-4 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-kristal-500 focus:border-kristal-500"
                >
                  <option value="all">Tüm İşlemler</option>
                  <option value="sales">Satış</option>
                  <option value="payment">Tahsilat</option>
                  <option value="return">İade</option>
                </select>
              </div>

              {/* Başlangıç Tarihi */}
              <div className="w-48">
                <Input
                  type="date"
                  value={dateFilter.start}
                  onChange={(e) => setDateFilter(prev => ({ ...prev, start: e.target.value }))}
                  className="w-full py-3 px-4 rounded-xl border-gray-300 focus:ring-kristal-500 focus:border-kristal-500"
                  placeholder="Başlangıç"
                />
              </div>

              {/* Bitiş Tarihi */}
              <div className="w-48">
                <Input
                  type="date"
                  value={dateFilter.end}
                  onChange={(e) => setDateFilter(prev => ({ ...prev, end: e.target.value }))}
                  className="w-full py-3 px-4 rounded-xl border-gray-300 focus:ring-kristal-500 focus:border-kristal-500"
                  placeholder="Bitiş"
                />
              </div>

              {/* Filtrele Butonu */}
              <div className="w-32">
                <Button onClick={handleFilter} className="w-full bg-kristal-600 hover:bg-kristal-700 text-white py-3">
                  <CalendarDaysIcon className="w-5 h-5 mr-2" />
                  Filtrele
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Extract Table */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" text="Ekstre yükleniyor..." />
        </div>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto" ref={printRef}>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlem Türü</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Açıklama</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Belge No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vade</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Borç</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Alacak</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Bakiye</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.map((item, index) => {
                  const typeInfo = getTransactionTypeInfo(item.wisad)
                  const IconComponent = typeInfo.icon
                  const showDetail = true // veya canShowDetail(item.wisad)

                  return (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatDate(item.wtarih)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center space-x-3">
                          <IconComponent className="w-5 h-5 text-gray-400" />
                          <Badge className={`${typeInfo.color} px-3 py-1 rounded-full font-medium text-xs`}>
                            {typeInfo.label}
                          </Badge>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate">{item.wacik || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600">{item.wbelge || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatDate(item.wvade)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-right text-red-600">
                        {parseFloat(item.wborc) > 0 ? formatCurrency(item.wborc) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-right text-green-600">
                        {parseFloat(item.walacak) > 0 ? formatCurrency(item.walacak) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-right">
                        <span className={parseFloat(item.wbakiye) >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {formatCurrency(Math.abs(parseFloat(item.wbakiye) || 0))}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {showDetail && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedExtract(item)
                              setCurrentView('detail')
                              setDetailFkn(item?.wfkn || item?.fkn || item?.wFkn || null) // << önemli
                            }}
                          >
                            <EyeIcon className="w-4 h-4 mr-2" />
                            Detay
                          </Button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {filteredData.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <DocumentTextIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Kayıt bulunamadı</h3>
              <p className="text-gray-500 mb-4">Seçilen kriterlere uygun işlem bulunmuyor.</p>
              <Button 
                variant="outline"
                onClick={() => {
                  setSearchQuery('')
                  setTransactionFilter('all')
                  setDateFilter({ start: '', end: '' })
                }}
              >
                Filtreleri Temizle
              </Button>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}