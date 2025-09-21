import axios from 'axios'
import { useAuthStore } from '../stores'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3300/api'

// Axios instance oluştur
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - her request'e token ekle
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token
    if (token) {
      config.headers.Authorization = token
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const { logout } = useAuthStore.getState()
    
    // 401 - Unauthorized
    if (error.response?.status === 401) {
      logout()
      window.location.href = '/login'
    }
    
    // 403 - Forbidden
    if (error.response?.status === 403) {
      logout()
      window.location.href = '/login'
    }
    
    return Promise.reject(error)
  }
)

export default apiClient