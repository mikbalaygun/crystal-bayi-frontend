import { Fragment, useState } from 'react'
import { Menu, MenuButton, MenuItem, MenuItems, Transition, Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react'
import { NavLink, useLocation, Link, useNavigate } from 'react-router-dom'
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
  ChatBubbleLeftRightIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline'
import { useAuthStore, useCartStore } from '../../stores'
import { useFavoriteProducts } from '../../hooks/useApi'
import FavoritesPanel from '../FavoritesPanel'

const navigation = [
  { name: 'Anasayfa', href: '/dashboard', icon: HomeIcon, adminOnly: false },
  { name: 'Ürünler', href: '/products', icon: CubeIcon, adminOnly: false },
  { name: 'Bekleyen Siparişler', href: '/orders', icon: ClipboardDocumentListIcon, adminOnly: false },
  { name: 'Ekstre', href: '/extract', icon: DocumentTextIcon, adminOnly: false },
  { name: 'Ödeme', href: 'https://kristal.tahsilat.com.tr/', icon: CreditCardIcon, adminOnly: false, external: true },
  { name: 'İletişim', href: '/contact', icon: ChatBubbleLeftRightIcon, adminOnly: false },
]

const formatCurrency = (value) => {
  if (value === null || value === undefined || value === '') {
    return '₺0,00'
  }

  let number = value
  if (typeof value === 'string') {
    const cleaned = value.replace(/[^\d,.-]/g, '').trim()
    number = cleaned.includes(',')
      ? parseFloat(cleaned.replace(/\./g, '').replace(',', '.'))
      : parseFloat(cleaned)
  }

  if (!Number.isFinite(Number(number))) {
    return '₺0,00'
  }

  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(number))
}

export default function TopNavbar() {
  const location = useLocation()
  const { user, isAdmin, logout } = useAuthStore()
  const { getTotalItems } = useCartStore()
  const { data: favoriteProducts } = useFavoriteProducts()
  const [favoritesOpen, setFavoritesOpen] = useState(false)
  const navigate = useNavigate()

  const filteredNavigation = navigation.filter(item => !item.adminOnly || isAdmin())
  const favoriteCount = favoriteProducts?.length || 0
  const cartCount = getTotalItems()

  return (
    <>
      <Disclosure as="nav" className="sticky top-0 z-40 border-b border-gray-200/80 bg-white/95 shadow-sm backdrop-blur">
        {({ open }) => (
          <>
            <div className="mx-auto max-w-full px-4 sm:px-6 lg:px-8">
              <div className="flex h-16 justify-between items-center">
                
                {/* Left side - Logo */}
                <div className="flex items-center flex-shrink-0">
                  <Link to="/dashboard" className="flex items-center group">
                    <img
                      src="/crystal-logo-small.png"
                      alt="Kristal Logo"
                      className="h-10 w-auto transition-transform duration-200 group-hover:scale-105"
                    />
                  </Link>
                </div>
                
                {/* Center - Desktop Navigation */}
                <div className="hidden lg:flex lg:items-center lg:space-x-1">
                  {filteredNavigation.map((item) => {
                    const isActive = location.pathname === item.href
                    
                    if (item.external) {
                      return (
                        <a
                          key={item.name}
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors duration-200 hover:bg-gray-50 hover:text-gray-950"
                        >
                          <item.icon className="mr-2 h-4 w-4 text-gray-400 transition-colors group-hover:text-gray-500" />
                          {item.name}
                        </a>
                      )
                    }
                    
                    return (
                      <NavLink
                        key={item.name}
                        to={item.href}
                        className={`relative inline-flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                          isActive
                            ? 'bg-kristal-50 text-kristal-700'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-950'
                        }`}
                      >
                        <item.icon className={`mr-2 h-4 w-4 ${isActive ? 'text-kristal-600' : 'text-gray-400'}`} />
                        {item.name}
                        {isActive && (
                          <span className="absolute inset-x-3 -bottom-[13px] h-0.5 rounded-full bg-kristal-500" />
                        )}
                      </NavLink>
                    )
                  })}
                </div>

                {/* Right side - Actions + User */}
                <div className="flex items-center space-x-2">
                  
                  {/* Favorites Button */}
                  <button 
                    onClick={() => setFavoritesOpen(true)}
                    className="group relative rounded-xl p-2.5 text-gray-500 transition-all duration-200 hover:bg-kristal-50 hover:text-kristal-600 active:scale-95"
                  >
                    <HeartIcon className="h-5 w-5 transition-transform duration-200 group-hover:scale-105" />
                    {favoriteCount > 0 && (
                      <span className="absolute -right-1 -top-1 flex h-5 min-w-5 animate-pulse items-center justify-center rounded-full border-2 border-white bg-red-500 px-1 text-[11px] font-semibold leading-none text-white shadow-sm">
                        {favoriteCount > 99 ? '99+' : favoriteCount}
                      </span>
                    )}
                  </button>

                  {/* Shopping Cart */}
                  <button 
                    onClick={() => navigate('/cart')}
                    className="group relative rounded-xl p-2.5 text-gray-500 transition-all duration-200 hover:bg-kristal-50 hover:text-kristal-600 active:scale-95"
                  >
                    <ShoppingCartIcon className="h-5 w-5 transition-transform duration-200 group-hover:scale-105" />
                    {cartCount > 0 && (
                      <span className="absolute -right-1 -top-1 flex h-5 min-w-5 animate-pulse items-center justify-center rounded-full border-2 border-white bg-kristal-600 px-1 text-[11px] font-semibold leading-none text-white shadow-sm">
                        {cartCount > 99 ? '99+' : cartCount}
                      </span>
                    )}
                  </button>

                  {/* User Dropdown */}
                  <Menu as="div" className="relative ml-2">
                    <MenuButton className="group flex items-center space-x-3 rounded-xl border border-transparent p-2 transition-all duration-200 hover:border-gray-200 hover:bg-gray-50 active:scale-[0.98]">
                      <div className="hidden sm:block text-right">
                        <p className="text-sm font-semibold text-gray-900 truncate max-w-32 group-hover:text-kristal-700 transition-colors">
                          {user?.company || 'Kullanıcı'}
                        </p>
                        <p className="text-xs text-gray-500 group-hover:text-kristal-500 transition-colors">
                          {user?.type === 'admin' ? 'Yönetici' : 'Bayi'}
                        </p>
                      </div>
                      <div className="relative">
                        <div className="w-9 h-9 bg-gradient-to-br from-kristal-500 to-kristal-600 rounded-xl flex items-center justify-center shadow-sm transition-transform duration-200 group-hover:scale-105">
                          <span className="text-white text-sm font-bold">
                            {user?.company?.charAt(0) || 'U'}
                          </span>
                        </div>
                      </div>
                      <ChevronDownIcon className="h-4 w-4 text-gray-400 transition-all duration-200 group-hover:text-kristal-500 group-data-[open]:rotate-180" />
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
                      <MenuItems className="absolute right-0 z-50 mt-2 w-80 origin-top-right rounded-xl bg-white shadow-xl ring-1 ring-black/5 focus:outline-none">
                        <div className="p-4">
                          <div className="mb-3 rounded-xl border border-gray-100 bg-gray-50 p-4">
                            <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-kristal-500 to-kristal-600 rounded-xl flex items-center justify-center shadow-sm">
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

                            <div className="mt-4 grid grid-cols-2 gap-2">
                              <div className="rounded-lg bg-white px-3 py-2 ring-1 ring-gray-100">
                                <p className="text-[11px] font-medium text-gray-500">Hesap Kodu</p>
                                <p className="mt-0.5 truncate font-mono text-sm font-semibold text-gray-900">
                                  {user?.hesap || user?.username || '-'}
                                </p>
                              </div>
                              <div className="rounded-lg bg-white px-3 py-2 ring-1 ring-gray-100">
                                <p className="text-[11px] font-medium text-gray-500">Bakiye</p>
                                <p className="mt-0.5 truncate text-sm font-semibold text-gray-900">
                                  {formatCurrency(user?.bakiye)}
                                </p>
                              </div>
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
                  <DisclosureButton className="lg:hidden inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-kristal-500">
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
            <DisclosurePanel className="lg:hidden border-t border-gray-200 bg-white">
              <div className="space-y-2 px-4 pb-4 pt-3">
                {filteredNavigation.map((item) => {
                  const isActive = location.pathname === item.href
                  
                  // Harici link kontrolü
                  if (item.external) {
                    return (
                      <a
                        key={item.name}
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative flex items-center px-4 py-3 text-base font-medium rounded-xl transition-all duration-300 text-gray-600 hover:bg-gray-50 hover:text-kristal-700"
                      >
                        <item.icon className="mr-4 h-5 w-5 transition-all duration-300 text-gray-400" />
                        <span className="relative z-10">{item.name}</span>
                      </a>
                    )
                  }
                  
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
