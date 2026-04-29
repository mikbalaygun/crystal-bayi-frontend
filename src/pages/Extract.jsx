import { useMemo, useRef, useState } from 'react'
import { 
  DocumentTextIcon,
  CalendarDaysIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'
import { Card, Button, Input, Badge, Skeleton } from '../components/ui'
import { useQuery } from '@tanstack/react-query'
import apiClient from '../services/api'
import moment from 'moment'

function ExtractTableSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {['Tarih', 'İşlem', 'Açıklama', 'Belge', 'Vade', 'Borç', 'Alacak', 'Bakiye', ''].map((label) => (
                <th key={label} className="px-2 py-3 text-left text-xs font-medium uppercase text-gray-500">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {Array.from({ length: 8 }).map((_, rowIndex) => (
              <tr key={rowIndex}>
                <td className="px-2 py-3"><Skeleton className="h-4 w-20" /></td>
                <td className="px-2 py-3"><Skeleton className="h-5 w-16 rounded-full" /></td>
                <td className="px-2 py-3"><Skeleton className="h-4 w-36" /></td>
                <td className="px-2 py-3"><Skeleton className="h-4 w-20" /></td>
                <td className="px-2 py-3"><Skeleton className="h-4 w-20" /></td>
                <td className="px-2 py-3"><Skeleton className="ml-auto h-4 w-16" /></td>
                <td className="px-2 py-3"><Skeleton className="ml-auto h-4 w-16" /></td>
                <td className="px-2 py-3"><Skeleton className="ml-auto h-4 w-20" /></td>
                <td className="px-2 py-3"><Skeleton className="mx-auto h-7 w-7 rounded-lg" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

/** Detay verisini çeken küçük hook (JS sürüm) */
const useExtractDetail = (fkn) => {
  return useQuery({
    queryKey: ['extract-detail', fkn],
    enabled: !!fkn,
    queryFn: async () => {
      const { data } = await apiClient.get(`/extract/${fkn}`)
      const rows = data?.success ? data.data : []
      return Array.isArray(rows) ? rows : rows ? [rows] : []
    },
  })
}

/** Güvenli lowercase */
const sl = (v) => (v ?? '').toString().toLowerCase()

export default function Extract() {
  const [dateFilter, setDateFilter] = useState({ start: '', end: '' })
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedExtract, setSelectedExtract] = useState(null)
  const [currentView, setCurrentView] = useState('list')
  const [transactionFilter, setTransactionFilter] = useState('all')
  const [detailFkn, setDetailFkn] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const tableRef = useRef(null)
  const PAGE_SIZE = 25

  const {
    data: detailRows = [],
    isLoading: detailLoading,
    error: detailError,
  } = useExtractDetail(detailFkn)

  const { data: extractResponse, isLoading, refetch } = useQuery({
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

  const totalPages = Math.max(1, Math.ceil(filteredData.length / PAGE_SIZE))
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const paginatedData = useMemo(() => {
    const start = (safeCurrentPage - 1) * PAGE_SIZE
    return filteredData.slice(start, start + PAGE_SIZE)
  }, [filteredData, safeCurrentPage])

  const paginationStart = filteredData.length === 0 ? 0 : (safeCurrentPage - 1) * PAGE_SIZE + 1
  const paginationEnd = Math.min(safeCurrentPage * PAGE_SIZE, filteredData.length)

  const goToDetail = (item) => {
    setSelectedExtract(item)
    setCurrentView('detail')
    setDetailFkn(item?.wfkn || item?.fkn || item?.wFkn || null)
  }

  const changePage = (nextPage) => {
    setCurrentPage(Math.min(Math.max(nextPage, 1), totalPages))
    requestAnimationFrame(() => {
      tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  const handleFilter = () => {
    setCurrentPage(1)
    refetch()
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
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => {
                setCurrentView('list')
                setDetailFkn(null)
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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hesap Ekstresi</h1>
          <p className="text-sm text-gray-500">{filteredData.length.toLocaleString()} kayıt</p>
        </div>
      </div>

      <Card className="p-4">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Belge, açıklama ara..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
                className="pl-10 pr-4 py-2.5 w-full border border-gray-300 rounded-lg bg-gray-50 focus:bg-white focus:ring-2 focus:ring-kristal-500 focus:border-kristal-500 transition-all text-sm"
              />
            </div>
          </div>

          <div className="w-full lg:w-48">
            <select
              value={transactionFilter}
              onChange={(e) => {
                setTransactionFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full py-2.5 px-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-kristal-500 focus:border-kristal-500 text-sm"
            >
              <option value="all">Tüm İşlemler</option>
              <option value="sales">Satış</option>
              <option value="payment">Tahsilat</option>
              <option value="return">İade</option>
            </select>
          </div>

          <div className="w-full lg:w-44">
            <Input
              type="date"
              value={dateFilter.start}
              onChange={(e) => {
                setDateFilter(prev => ({ ...prev, start: e.target.value }))
                setCurrentPage(1)
              }}
              className="w-full py-2.5 px-3 rounded-lg border-gray-300 focus:ring-kristal-500 focus:border-kristal-500 text-sm"
              placeholder="Başlangıç"
            />
          </div>

          <div className="w-full lg:w-44">
            <Input
              type="date"
              value={dateFilter.end}
              onChange={(e) => {
                setDateFilter(prev => ({ ...prev, end: e.target.value }))
                setCurrentPage(1)
              }}
              className="w-full py-2.5 px-3 rounded-lg border-gray-300 focus:ring-kristal-500 focus:border-kristal-500 text-sm"
              placeholder="Bitiş"
            />
          </div>

          <Button onClick={handleFilter} size="sm" className="px-4">
            <CalendarDaysIcon className="w-4 h-4 mr-1" />
            Filtrele
          </Button>
        </div>
      </Card>

      {isLoading ? (
        <ExtractTableSkeleton />
      ) : (
        <Card ref={tableRef} className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tarih</th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase">İşlem</th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase">Açıklama</th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase">Belge</th>
                  <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vade</th>
                  <th className="px-2 py-3 text-right text-xs font-medium text-gray-500 uppercase">Borç</th>
                  <th className="px-2 py-3 text-right text-xs font-medium text-gray-500 uppercase">Alacak</th>
                  <th className="px-2 py-3 text-right text-xs font-medium text-gray-500 uppercase">Bakiye</th>
                  <th className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase w-16"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedData.map((item, index) => {
                  const typeInfo = getTransactionTypeInfo(item.wisad)

                  return (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">
                        {formatDate(item.wtarih)}
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap">
                        <Badge className={`${typeInfo.color} px-2 py-0.5 rounded text-xs`}>
                          {typeInfo.label}
                        </Badge>
                      </td>
                      <td className="px-2 py-2 text-xs text-gray-700 max-w-[150px] truncate" title={item.wacik}>
                        {item.wacik || '-'}
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-xs font-mono text-gray-600">
                        {item.wbelge || '-'}
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-600">
                        {formatDate(item.wvade)}
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-xs font-bold text-right text-red-600">
                        {parseFloat(item.wborc) > 0 ? `-${formatCurrency(item.wborc)}` : '-'}
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-xs font-bold text-right text-green-600">
                        {parseFloat(item.walacak) > 0 ? `+${formatCurrency(item.walacak)}` : '-'}
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-xs font-bold text-right">
                        <span className={parseFloat(item.wbakiye) >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {formatCurrency(Math.abs(parseFloat(item.wbakiye) || 0))}
                        </span>
                      </td>
                      <td className="px-2 py-2 whitespace-nowrap text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => goToDetail(item)}
                          className="p-1"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {filteredData.length > PAGE_SIZE && (
            <div className="flex flex-col gap-3 border-t border-gray-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-xs text-gray-500">
                {paginationStart}-{paginationEnd} / {filteredData.length} kayıt
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={safeCurrentPage === 1}
                  onClick={() => changePage(1)}
                  className="h-8 px-2 text-xs"
                >
                  İlk
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={safeCurrentPage === 1}
                  onClick={() => changePage(safeCurrentPage - 1)}
                  className="h-8 px-2 text-xs"
                >
                  Önceki
                </Button>
                <span className="min-w-20 px-2 text-center text-xs font-semibold text-gray-600">
                  {safeCurrentPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={safeCurrentPage === totalPages}
                  onClick={() => changePage(safeCurrentPage + 1)}
                  className="h-8 px-2 text-xs"
                >
                  Sonraki
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={safeCurrentPage === totalPages}
                  onClick={() => changePage(totalPages)}
                  className="h-8 px-2 text-xs"
                >
                  Son
                </Button>
              </div>
            </div>
          )}

          {filteredData.length === 0 && !isLoading && (
            <div className="mx-auto flex max-w-xl flex-col items-center px-6 py-12 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-kristal-100 bg-kristal-50 text-kristal-600">
                <DocumentTextIcon className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Kayıt bulunamadı</h3>
              <p className="mt-2 text-sm leading-6 text-gray-500">
                Seçilen tarih, işlem tipi veya arama kriterlerine uygun ekstre hareketi bulunmuyor.
              </p>
              <div className="mt-6">
                <Button 
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('')
                    setTransactionFilter('all')
                    setDateFilter({ start: '', end: '' })
                    setCurrentPage(1)
                  }}
                >
                  Filtreleri Temizle
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
