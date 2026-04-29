import apiClient from './api'

class AuthService {
  async login(credentials) {
    try {
      const response = await apiClient.post('/auth/login', credentials)
      
      return {
        success: true,
        data: response.data
      }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Giriş yapılamadı'
      }
    }
  }

  async logout() {
    try {
      await apiClient.post('/auth/logout')
      return { success: true }
    } catch (error) {
      return { success: true }
    }
  }
}

export default new AuthService()