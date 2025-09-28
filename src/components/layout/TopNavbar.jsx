import { Fragment, useState } from 'react'
import { Menu, MenuButton, MenuItem, MenuItems, Transition, Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react'
import { NavLink, useLocation } from 'react-router-dom'
import { 
  Bars3Icon, 
  XMarkIcon,
  HeartIcon,
  ShoppingCartIcon,
  ChevronDownIcon,
  ArrowRightOnRectangleIcon,
  HomeIcon,
  CubeIcon,
  ClipboardDocumentListIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline'
import { useAuthStore, useCartStore } from '../../stores'
import { useFavoriteProducts } from '../../hooks/useApi'
import FavoritesPanel from '../FavoritesPanel'

const navigation = [
  { name: 'Anasayfa', href: '/dashboard', icon: HomeIcon, adminOnly: false },
  { name: 'Ürünler', href: '/products', icon: CubeIcon, adminOnly: false },
  { name: 'Bekleyen Siparişler', href: '/orders', icon: ClipboardDocumentListIcon, adminOnly: false },
  { name: 'Ekstre', href: '/extract', icon: DocumentTextIcon, adminOnly: false },
  { name: 'İletişim', href: '/contact', icon: ChatBubbleLeftRightIcon, adminOnly: false },
]

export default function TopNavbar() {
  const location = useLocation()
  const { user, isAdmin, logout } = useAuthStore()
  const { getTotalItems, setIsOpen } = useCartStore()
  const { data: favoriteProducts } = useFavoriteProducts()
  const [favoritesOpen, setFavoritesOpen] = useState(false)

  const filteredNavigation = navigation.filter(item => !item.adminOnly || isAdmin())

  return (
    <>
      <Disclosure as="nav" className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        {({ open }) => (
          <>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex h-16 justify-between items-center">
                
                {/* Left side - Logo + Navigation */}
                <div className="flex items-center">
                  {/* Logo */}
                  <div className="flex flex-shrink-0 items-center">
                    <img
                      src="/crystal-logo-small.png"
                      alt="Kristal Logo"
                      className="h-10 w-auto"
                    />
                  </div>
                  
                  {/* Desktop Navigation */}
                  <div className="hidden md:ml-8 md:flex md:space-x-2">
                    {filteredNavigation.map((item) => {
                      const isActive = location.pathname === item.href
                      return (
                        <NavLink
                          key={item.name}
                          to={item.href}
                          className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                            isActive
                              ? 'bg-kristal-500 text-white shadow-md'
                              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                          }`}
                        >
                          <item.icon className={`mr-2 h-4 w-4 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                          {item.name}
                        </NavLink>
                      )
                    })}
                  </div>
                </div>

                {/* Right side - Actions + User */}
                <div className="flex items-center space-x-2">
                  
                  {/* Favorites Button */}
                  <button 
                    onClick={() => setFavoritesOpen(true)}
                    className="relative p-2.5 text-gray-500 hover:text-kristal-600 hover:bg-kristal-50 rounded-xl transition-all duration-300 group"
                  >
                    <HeartIcon className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                    {favoriteProducts?.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium shadow-lg shadow-red-500/25 animate-pulse">
                        {favoriteProducts.length}
                      </span>
                    )}
                  </button>

                  {/* Shopping Cart */}
                  <button 
                    onClick={() => setIsOpen(true)}
                    className="relative p-2.5 text-gray-500 hover:text-kristal-600 hover:bg-kristal-50 rounded-xl transition-all duration-300 group"
                  >
                    <ShoppingCartIcon className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                    {getTotalItems() > 0 && (
                      <span className="absolute -top-1 -right-1 bg-gradient-to-r from-kristal-500 to-kristal-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium shadow-lg shadow-kristal-500/25 animate-pulse">
                        {getTotalItems()}
                      </span>
                    )}
                  </button>

                  {/* User Dropdown */}
                  <Menu as="div" className="relative ml-2">
                    <MenuButton className="flex items-center space-x-3 p-2 rounded-xl hover:bg-gray-50 transition-all duration-300 group">
                      <div className="hidden sm:block text-right">
                        <p className="text-sm font-semibold text-gray-900 truncate max-w-32 group-hover:text-kristal-700 transition-colors">
                          {user?.company || 'Kullanıcı'}
                        </p>
                        <p className="text-xs text-gray-500 group-hover:text-kristal-500 transition-colors">
                          {user?.type === 'admin' ? 'Yönetici' : 'Bayi'}
                        </p>
                      </div>
                      <div className="relative">
                        <div className="w-9 h-9 bg-gradient-to-br from-kristal-500 to-kristal-600 rounded-xl flex items-center justify-center shadow-lg shadow-kristal-500/25 transition-all duration-300 group-hover:shadow-kristal-500/40 group-hover:scale-105">
                          <span className="text-white text-sm font-bold">
                            {user?.company?.charAt(0) || 'U'}
                          </span>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-br from-kristal-400 to-kristal-500 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                      </div>
                      <ChevronDownIcon className="h-4 w-4 text-gray-400 group-hover:text-kristal-500 transition-all duration-300 group-hover:rotate-180" />
                    </MenuButton>

                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <MenuItems className="absolute right-0 mt-2 w-80 origin-top-right bg-white rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                        <div className="p-4">
                          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg mb-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-kristal-500 to-kristal-600 rounded-xl flex items-center justify-center shadow-lg">
                              <span className="text-white text-lg font-bold">
                                {user?.company?.charAt(0) || 'U'}
                              </span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-base font-semibold text-gray-900 break-words">
                                {user?.company || 'Kullanıcı'}
                              </p>
                              <p className="text-sm text-gray-500">
                                {user?.type === 'admin' ? 'Yönetici' : 'Bayi'}
                              </p>
                            </div>
                          </div>
                          
                          <MenuItem>
                            {({ active }) => (
                              <button
                                onClick={logout}
                                className={`${
                                  active ? 'bg-red-50 text-red-700' : 'text-red-600'
                                } group flex w-full items-center rounded-lg px-4 py-3 text-sm font-medium transition-colors`}
                              >
                                <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5" />
                                Çıkış Yap
                              </button>
                            )}
                          </MenuItem>
                        </div>
                      </MenuItems>
                    </Transition>
                  </Menu>

                  {/* Mobile menu button */}
                  <DisclosureButton className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-kristal-500">
                    <span className="sr-only">Ana menüyü aç</span>
                    {open ? (
                      <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                    ) : (
                      <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                    )}
                  </DisclosureButton>
                </div>
              </div>
            </div>

            {/* Mobile Navigation Panel */}
            <DisclosurePanel className="md:hidden border-t border-gray-200 bg-white">
              <div className="space-y-2 px-4 pb-4 pt-3">
                {filteredNavigation.map((item) => {
                  const isActive = location.pathname === item.href
                  return (
                    <NavLink
                      key={item.name}
                      to={item.href}
                      className={`relative flex items-center px-4 py-3 text-base font-medium rounded-xl transition-all duration-300 ${
                        isActive
                          ? 'text-kristal-700 bg-gradient-to-r from-kristal-50 to-kristal-100 shadow-md'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-kristal-700'
                      }`}
                    >
                      {/* Active left border */}
                      {isActive && (
                        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-kristal-500 to-kristal-600 rounded-full"></div>
                      )}
                      
                      <item.icon className={`mr-4 h-5 w-5 transition-all duration-300 ${
                        isActive ? 'text-kristal-600' : 'text-gray-400'
                      }`} />
                      
                      <span className="relative z-10">{item.name}</span>
                    </NavLink>
                  )
                })}
              </div>
            </DisclosurePanel>
          </>
        )}
      </Disclosure>

      {/* Favorites Panel */}
      <FavoritesPanel isOpen={favoritesOpen} setIsOpen={setFavoritesOpen} />
    </>
  )
}