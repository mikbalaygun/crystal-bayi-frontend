import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore, useCartStore } from './stores'
import { Layout } from './components/layout'
import ToastContainer from './components/ui/Toast'

// Pages
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import Orders from './pages/Orders'
import Login from './pages/Login'
import Contact from './pages/Contact'
import Extract from './pages/Extract'

// Protected Route Component
function ProtectedRoute({ children }) {
  const { isLogged } = useAuthStore()
  const { syncWithServer, loadLocalCart, isSyncing } = useCartStore()

  // Kullanıcı login olduğunda hybrid sync yap
  useEffect(() => {
    if (isLogged) {
      // Online'sa server ile sync et, offline'sa local cart'ı yükle
      if (navigator.onLine) {
        syncWithServer()
      } else {
        loadLocalCart()
      }
    }
  }, [isLogged, syncWithServer, loadLocalCart])

  // Online/offline durumu değiştiğinde sync et
  useEffect(() => {
    const handleOnline = () => {
      if (isLogged) {
        syncWithServer()
      }
    }

    const handleOffline = () => {
      console.log('Offline mode: Using local cart')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [isLogged, syncWithServer])

  if (!isLogged) {
    return <Navigate to="/login" replace />
  }

  return (
    <Layout>
      {children}
      {/* Sync indicator */}
      {isSyncing && (
        <div className="fixed bottom-4 right-4 bg-blue-500 text-white px-3 py-2 rounded-lg shadow-lg text-sm">
          Sepet senkronize ediliyor...
        </div>
      )}
    </Layout>
  )
}

// Public Route Component
function PublicRoute({ children }) {
  const { isLogged } = useAuthStore()

  if (isLogged) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />

        {/* Protected Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />

        <Route path="/products" element={
          <ProtectedRoute>
            <Products />
          </ProtectedRoute>
        } />

        <Route path="/orders" element={
          <ProtectedRoute>
            <Orders />
          </ProtectedRoute>
        } />

        <Route path="/contact" element={
          <ProtectedRoute>
            <Contact />
          </ProtectedRoute>
        } />

        <Route path="/extract" element={
          <ProtectedRoute>
            <Extract />
          </ProtectedRoute>
        } />

        {/* Redirect root to dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* 404 fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>

      {/* Toast Container - Global olarak tüm sayfalarda kullanılabilir */}
      <ToastContainer />
    </Router>
  )
}

export default App