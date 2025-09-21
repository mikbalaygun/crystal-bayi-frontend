import apiClient from './api'

class OrderService {
  async getOrders() {
    try {
      const response = await apiClient.get('/orders')
      
      return {
        success: true,
        data: response.data.data
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Siparişler getirilemedi'
      }
    }
  }

  async createOrder(products) {
    try {
      const response = await apiClient.post('/orders', { products })
      
      return {
        success: true,
        data: response.data.data
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Sipariş oluşturulamadı'
      }
    }
  }

  async getDashboardStats() {
    try {
      const response = await apiClient.get('/dashboard/stats')
      
      return {
        success: true,
        data: response.data.data
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'İstatistikler getirilemedi'
      }
    }
  }
}

export default new OrderService()