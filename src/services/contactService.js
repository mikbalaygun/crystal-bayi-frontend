// services/contactService.js
import apiClient from './api'

const contactService = {
  // Müşteri temsilcisi bilgisini getir
  getCustomerRepresentative: async () => {
    try {
      const response = await apiClient.get('/contact/representative')
      return response.data
    } catch (error) {
      console.error('Error fetching customer representative:', error)
      throw error
    }
  },

  // İletişim formu gönder
  sendContactForm: async (formData) => {
    try {
      const response = await apiClient.post('/contact/info', formData)
      return response.data
    } catch (error) {
      console.error('Error sending contact form:', error)
      throw error
    }
  },

  // Müşteri temsilcisi bilgisini kontrol et (cache'li)
  checkRepresentative: async () => {
    try {
      const response = await apiClient.get('/contact/representative')
      return {
        hasRepresentative: response.data?.data?.hasRepresentative || false,
        representative: response.data?.data?.representative || null,
        email: response.data?.data?.email || null
      }
    } catch (error) {
      // Hata durumunda false döndür
      console.warn('Could not fetch representative info:', error.message)
      return {
        hasRepresentative: false,
        representative: null,
        email: null
      }
    }
  }
}

export default contactService