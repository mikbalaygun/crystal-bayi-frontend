import TopNavbar from './TopNavbar'
import ShoppingCart from '../ShoppingCart'
import Footer from './Footer'
import { LoadingOverlay } from '../ui'
import { useGlobalStore } from '../../stores'

export default function Layout({ children }) {
  const { loading } = useGlobalStore()

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      
      {/* Top Navigation */}
      <TopNavbar />

      {/* Main Content Area */}
      <main className="flex-1">
        <LoadingOverlay loading={loading}>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </div>
        </LoadingOverlay>
      </main>

      {/* Footer */}
      <Footer />

      {/* Shopping Cart Sidebar */}
      <ShoppingCart />
    </div>
  )
}