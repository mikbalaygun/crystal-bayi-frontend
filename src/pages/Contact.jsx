import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useAuthStore } from '../stores'
import apiClient from '../services/api'

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

  // API mutation for sending contact form
  const contactMutation = useMutation({
    mutationFn: async (data) => {
      const response = await apiClient.post('/contact/info', data)
      return response.data
    },
    onSuccess: (data) => {
      setSuccessMessage(data.message || 'Talebiniz başarıyla iletildi.')
      setFormData({ subject: '', title: '', description: '' })
    },
    onError: (error) => {
      console.error('Contact form error:', error)
    }
  })

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (successMessage) setSuccessMessage('') // Clear success message when user starts typing again
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.subject || !formData.title || !formData.description) {
      return
    }

    contactMutation.mutate(formData)
  }

  return (
    <div className="space-y-6">
      {/* Sayfa başlığı */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Bize Ulaşın</h1>
        <p className="mt-1 text-sm text-gray-500">
          Sorularınızı ve taleplerinizi bu formdan iletebilirsiniz.
        </p>
      </div>

      {/* İki kolon düzeni */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Firma Bilgileri (read-only) */}
        <section className="bg-white border border-gray-200 rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Firma Bilgileri
          </h2>

          <div className="space-y-4">
            <LabeledReadonly label="Ünvan" value={user?.company || "—"} />
            <LabeledReadonly label="Kullanıcı Adı" value={user?.username || "—"} />
            <LabeledReadonly label="E-posta" value={user?.email || "—"} />
            <LabeledReadonly label="Telefon" value={user?.phone || "—"} />
            <LabeledReadonly label="Adres" value={user?.adres || "—"} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <LabeledReadonly label="Şehir" value={user?.sehir || "—"} />
              <LabeledReadonly label="Ülke" value={user?.ulke || "—"} />
            </div>
            <LabeledReadonly label="Hesap Bakiyesi" value={formatCurrency(user?.bakiye)} />
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
                  'Gönder'
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