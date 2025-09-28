// Sidebar.jsx
import { NavLink, useLocation } from 'react-router-dom'
import {
  HomeIcon,
  CubeIcon,
  ClipboardDocumentListIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline'
import { useAuthStore, useGlobalStore } from '../../stores'

const navigation = [
  { name: 'Anasayfa', href: '/dashboard', icon: HomeIcon, adminOnly: false },
  { name: 'Ürünler', href: '/products', icon: CubeIcon, adminOnly: false },
  { name: 'Bekleyen Siparişler', href: '/orders', icon: ClipboardDocumentListIcon, adminOnly: false },
  { name: 'Ekstre', href: '/extract', icon: DocumentTextIcon, adminOnly: false },
  { name: 'İletişim', href: '/contact', icon: ChatBubbleLeftRightIcon, adminOnly: false },
]

export default function Sidebar() {
  const location = useLocation()
  const { user, isAdmin, logout } = useAuthStore()
  const { sidebarOpen, setSidebarOpen } = useGlobalStore()

  const filteredNavigation = navigation.filter(item => !item.adminOnly || isAdmin())

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 z-50 h-screen w-80 bg-white shadow-xl border-r border-gray-200
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:inset-0`}
      >
        {/* Tam yükseklik + dikey flex yerleşim */}
        <div className="h-full flex flex-col">

          {/* Logo Section (scroll'dan bağımsız) */}
          <div className="shrink-0 flex items-center justify-center h-24 px-6 bg-white border-b border-gray-100">
            <div className="flex items-center space-x-4">
              <img
                src="/crystal-logo-small.png"
                alt="Kristal Logo"
                className="w-21 h-16 object-contain"
              />
            </div>
          </div>

          {/* Navigation Menu (sadece burası scroll olur) */}
          <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
            {filteredNavigation.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`group flex items-center px-6 py-4 text-base font-medium rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-kristal-500 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-kristal-50 hover:text-kristal-700'
                  }`}
                >
                  <item.icon
                    className={`mr-4 h-6 w-6 transition-colors ${
                      isActive ? 'text-white' : 'text-gray-400 group-hover:text-kristal-500'
                    }`}
                  />
                  {item.name}
                </NavLink>
              )
            })}
          </nav>

          {/* User Profile Section — EN ALTA sabit */}
          <div className="shrink-0 mt-auto p-4 border-t border-gray-200 bg-gray-50">
            <div className="space-y-3">
              {/* Üst kısım: Avatar + İsim */}
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-kristal-500 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-white text-sm font-bold">
                    {user?.company?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p 
                    className="text-sm font-medium text-gray-900 truncate" 
                    title={user?.company}
                  >
                    {user?.company || 'Kullanıcı'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user?.type === 'admin' ? 'Yönetici' : 'Bayi'}
                  </p>
                </div>
              </div>
              
              {/* Alt kısım: Çıkış butonu */}
              <button
                onClick={logout}
                className="w-full flex items-center justify-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
              >
                <ArrowRightOnRectangleIcon className="w-4 h-4 mr-2" />
                Çıkış Yap
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}