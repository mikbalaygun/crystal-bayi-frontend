import { useState } from 'react'
import { useAuthStore } from '../stores'
import { useCustomerRepresentative, useSendContactForm } from '../hooks/useApi'

export default function Contact() {
  const { user } = useAuthStore()
  const [formData, setFormData] = useState({
    subject: '',
    title: '',
    description: ''
  })
  const [successMessage, setSuccessMessage] = useState('')

  const typeOptions = [
    { value: "siparis", label: "Sipariş" },
    { value: "urun", label: "Ürün" },
    { value: "fatura", label: "Fatura / Ekstre" },
    { value: "teknik", label: "Teknik Destek" },
    { value: "diger", label: "Diğer" },
  ]

  // Müşteri temsilcisi bilgisini çek
  const { data: representativeData, isLoading: isLoadingRep } = useCustomerRepresentative()

  // İletişim formu mutation
  const contactMutation = useSendContactForm()

  // Helper function to format currency properly
  const formatCurrency = (amount) => {
    if (!amount) return "—"
    
    // Türkçe format string'i sayıya çevir
    let numAmount = amount
    if (typeof amount === 'string') {
      // "1.451,85" -> 1451.85
      numAmount = parseFloat(amount.replace(/\./g, '').replace(',', '.'))
    }
    
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(numAmount)
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (successMessage) setSuccessMessage('') // Clear success message when user starts typing again
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.subject || !formData.title || !formData.description) {
      return
    }

    try {
      const result = await contactMutation.mutateAsync(formData)
      setSuccessMessage(result.message || 'Talebiniz başarıyla iletildi.')
      setFormData({ subject: '', title: '', description: '' })
      
      // Debug: Backend'den gelen response'u göster
      console.log('Contact form response:', {
        message: result.message,
        customerRepresentative: result.customerRepresentative,
        sentTo: result.sentTo
      })
    } catch (error) {
      // Error handling zaten mutation'da var
    }
  }

  // Müşteri temsilcisi bilgisi
  const representative = representativeData?.data
  const hasRepresentative = representative?.hasRepresentative

  return (
    <div className="space-y-6">
      {/* Sayfa başlığı */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Bize Ulaşın</h1>
        <p className="mt-1 text-sm text-gray-500">
          Sorularınızı ve taleplerinizi bu formdan iletebilirsiniz.
        </p>
      </div>

      {/* Müşteri Temsilcisi Bilgi Kartı */}
      {hasRepresentative && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Müşteri Temsilciniz
              </h3>
              <div className="mt-1 text-sm text-blue-700">
                <p><strong>{representative?.representative}</strong></p>
                <p className="text-xs text-blue-600 mt-1">
                  Talebiniz doğrudan müşteri temsilcinize iletilecektir.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading state for representative */}
      {isLoadingRep && (
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-sm text-gray-600">Müşteri temsilcisi bilgisi yükleniyor...</span>
          </div>
        </div>
      )}

      {/* İki kolon düzeni */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Firma Bilgileri (read-only) */}
        <section className="bg-white border border-gray-200 rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Firma Bilgileri
          </h2>

          <div className="space-y-4">
            <LabeledReadonly label="Ünvan" value={user?.company || "—"} />
            <LabeledReadonly label="Hesap Kodu" value={user?.hesap || "—"} />
            <LabeledReadonly label="Kullanıcı Adı" value={user?.username || "—"} />
            <LabeledReadonly label="E-posta" value={user?.email || "—"} />
            <LabeledReadonly label="Telefon" value={user?.phone || "—"} />
            <LabeledReadonly label="Adres" value={user?.adres || "—"} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <LabeledReadonly label="Şehir" value={user?.sehir || "—"} />
              <LabeledReadonly label="Ülke" value={user?.ulke || "—"} />
            </div>
            <LabeledReadonly label="Hesap Bakiyesi" value={formatCurrency(user?.bakiye)} />
            
            {/* Müşteri Temsilcisi Bilgisi */}
            {hasRepresentative && (
              <LabeledReadonly 
                label="Müşteri Temsilcisi" 
                value={representative?.representative || "—"} 
              />
            )}
          </div>
        </section>

        {/* Talep Formu */}
        <section className="bg-white border border-gray-200 rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Talep Formu
          </h2>

          {/* Success Message */}
          {successMessage && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">
                    {successMessage}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {contactMutation.isError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">
                    {contactMutation.error?.response?.data?.message || contactMutation.error?.message || 'Bir hata oluştu'}
                  </p>
                </div>
              </div>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Konu */}
            <div>
              <label
                htmlFor="subject"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Konu *
              </label>
              <select
                id="subject"
                value={formData.subject}
                onChange={(e) => handleInputChange('subject', e.target.value)}
                className="w-full py-2.5 px-3 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-kristal-500 focus:border-kristal-500"
                required
              >
                <option value="">Seçiniz…</option>
                {typeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Başlık */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Başlık *
              </label>
              <input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Başlık"
                className="w-full py-2.5 px-3 border border-gray-300 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-kristal-500 focus:border-kristal-500"
                required
              />
            </div>

            {/* Açıklama */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Açıklama *
              </label>
              <textarea
                id="description"
                rows={6}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Açıklama..."
                className="w-full px-3 py-2 border border-gray-300 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-kristal-500 focus:border-kristal-500"
                required
              />
            </div>

            {/* Bilgilendirme Mesajı */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
              <p className="text-sm text-blue-700">
                {hasRepresentative 
                  ? `Talebiniz müşteri temsilciniz ${representative?.representative}'e iletilecektir.`
                  : 'Talebiniz müşteri hizmetleri ekibimize iletilecektir.'
                }
              </p>
            </div>

            {/* Gönder butonu */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={contactMutation.isPending || !formData.subject || !formData.title || !formData.description}
                className="w-full py-3 rounded-xl bg-kristal-500 hover:bg-kristal-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium transition-colors"
              >
                {contactMutation.isPending ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Gönderiliyor...
                  </div>
                ) : (
                  hasRepresentative ? 'Temsilcime Gönder' : 'Gönder'
                )}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  )
}

/** Küçük yardımcı: etiket + read-only input */
function LabeledReadonly({ label, value }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        type="text"
        value={value}
        readOnly
        aria-readonly="true"
        className="w-full py-2.5 px-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-900"
      />
    </div>
  )
}