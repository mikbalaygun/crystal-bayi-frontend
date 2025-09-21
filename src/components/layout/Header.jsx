import { Fragment, useState } from 'react'
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react'
import { 
  Bars3Icon, 
  HeartIcon,
  ShoppingCartIcon,
  ChevronDownIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline'
import { useAuthStore, useGlobalStore, useCartStore } from '../../stores'
import { useFavoriteProducts } from '../../hooks/useApi'
import FavoritesPanel from '../FavoritesPanel'

export default function Header() {
  const { user, logout } = useAuthStore()
  const { sidebarOpen, toggleSidebar } = useGlobalStore()
  const { items, setIsOpen, getTotalItems } = useCartStore()
  const { data: favoriteProducts } = useFavoriteProducts()
  const [favoritesOpen, setFavoritesOpen] = useState(false)

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
        <div className="flex items-center justify-between h-20 px-6 lg:ml-80">
          
          {/* Left Side - Mobile Menu */}
          <div className="flex items-center space-x-4">
            {/* Mobile Hamburger */}
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
          </div>

          {/* Right Side - Icons + User Dropdown */}
          <div className="flex items-center space-x-4">
            
            {/* Favorites Button */}
            <button 
              onClick={() => setFavoritesOpen(true)}
              className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <HeartIcon className="h-6 w-6" />
              {favoriteProducts?.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                  {favoriteProducts.length}
                </span>
              )}
            </button>

            {/* Shopping Cart */}
            <button 
              onClick={() => setIsOpen(true)}
              className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ShoppingCartIcon className="h-6 w-6" />
              {getTotalItems() > 0 && (
                <span className="absolute -top-1 -right-1 bg-kristal-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                  {getTotalItems()}
                </span>
              )}
            </button>

            {/* User Dropdown */}
            <Menu as="div" className="relative">
              <MenuButton className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="hidden md:block text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.company || 'Kullanıcı'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user?.type === 'admin' ? 'Yönetici' : 'Bayi'}
                  </p>
                </div>
                <div className="w-12 h-12 bg-kristal-500 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white text-lg font-bold">
                    {user?.company?.charAt(0) || 'U'}
                  </span>
                </div>
                <ChevronDownIcon className="h-4 w-4 text-gray-400" />
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
                <MenuItems className="absolute right-0 mt-2 w-56 origin-top-right bg-white rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                  <div className="p-3">
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg mb-2">
                      <div className="w-10 h-10 bg-kristal-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">
                          {user?.company?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {user?.company || 'Kullanıcı'}
                        </p>
                        <p className="text-xs text-gray-500">
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
                          } group flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors`}
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
          </div>
        </div>
      </header>

      {/* Favorites Panel */}
      <FavoritesPanel isOpen={favoritesOpen} setIsOpen={setFavoritesOpen} />
    </>
  )
}