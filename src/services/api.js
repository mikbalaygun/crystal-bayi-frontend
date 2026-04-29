import axios from 'axios'

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3005/api').trim()

const getStoredToken = () => {
  try {
    const authData = JSON.parse(sessionStorage.getItem('auth-storage') || '{}')
    return authData?.state?.token || null
  } catch {
    return null
  }
}

const formatAuthHeader = (token) => {
  if (!token) return null
  return token.startsWith('Bearer ') ? token : `Bearer ${token}`
}

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
    const authHeader = formatAuthHeader(getStoredToken())
    if (authHeader) {
      config.headers.Authorization = authHeader
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
    // 401 - Unauthorized
    if (error.response?.status === 401) {
      sessionStorage.removeItem('auth-storage')
      window.location.href = '/login'
    }
    
    // 403 - Forbidden
    if (error.response?.status === 403) {
      sessionStorage.removeItem('auth-storage')
      window.location.href = '/login'
    }
    
    return Promise.reject(error)
  }
)

export default apiClient
