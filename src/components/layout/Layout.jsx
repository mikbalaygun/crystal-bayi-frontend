import { useEffect } from 'react'
import { useGlobalStore } from '../../stores'
import Sidebar from './Sidebar'
import Header from './Header'
import ShoppingCart from '../ShoppingCart'
import { LoadingOverlay } from '../ui'

export default function Layout({ children }) {
  const { sidebarOpen, setSidebarOpen, loading } = useGlobalStore()

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [setSidebarOpen])

  return (
    <div className="min-h-screen bg-gray-50 flex">
      
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        
        {/* Header */}
        <Header />
        
        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <LoadingOverlay loading={loading}>
            <div className="p-8">
              <div className="max-w-7xl mx-auto">
                {children}
              </div>
            </div>
          </LoadingOverlay>
        </main>
      </div>

      {/* Shopping Cart Sidebar */}
      <ShoppingCart />
    </div>
  )
}