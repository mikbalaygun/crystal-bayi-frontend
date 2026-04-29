import { Fragment } from 'react'
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react'
import { 
  XMarkIcon,
  ShoppingBagIcon
} from '@heroicons/react/24/outline'
import { useCartStore } from '../stores'
import CartContents from './cart/CartContents'

export default function ShoppingCart() {
  const { isOpen, setIsOpen, getTotalItems } = useCartStore()

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={setIsOpen}>
        <TransitionChild
          as={Fragment}
          enter="ease-in-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <TransitionChild
                as={Fragment}
                enter="transform transition ease-in-out duration-400"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-300"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <DialogPanel className="pointer-events-auto w-screen max-w-md">
                  <div className="flex h-full flex-col bg-white shadow-2xl">
                    
                    {/* Header */}
                    <div className="border-b border-gray-100 bg-gray-50/80 px-5 py-4">
                      <div className="flex items-center justify-between">
                        <DialogTitle className="flex items-center gap-2.5">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-kristal-500/10">
                            <ShoppingBagIcon className="h-5 w-5 text-kristal-600" />
                          </div>
                          <div>
                            <h2 className="text-base font-semibold text-gray-900">Sepetim</h2>
                            {getTotalItems() > 0 && (
                              <p className="text-xs text-gray-500">{getTotalItems()} ürün</p>
                            )}
                          </div>
                        </DialogTitle>
                        <button
                          type="button"
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-200/60 hover:text-gray-600"
                          onClick={() => setIsOpen(false)}
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto">
                      <CartContents mode="preview" onClose={() => setIsOpen(false)} />
                    </div>
                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
