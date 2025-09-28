import { Fragment, useEffect, useState } from 'react'
import { Transition } from '@headlessui/react'
import {
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

const toastTypes = {
  success: {
    icon: CheckCircleIcon,
    bgColor: 'bg-white',
    borderColor: 'border-l-4 border-l-green-500',
    iconColor: 'text-green-500',
    titleColor: 'text-gray-900',
    messageColor: 'text-gray-600',
    shadowColor: 'shadow-green-100'
  },
  error: {
    icon: XCircleIcon,
    bgColor: 'bg-white',
    borderColor: 'border-l-4 border-l-red-500',
    iconColor: 'text-red-500',
    titleColor: 'text-gray-900',
    messageColor: 'text-gray-600',
    shadowColor: 'shadow-red-100'
  },
  info: {
    icon: InformationCircleIcon,
    bgColor: 'bg-white',
    borderColor: 'border-l-4 border-l-blue-500',
    iconColor: 'text-blue-500',
    titleColor: 'text-gray-900',
    messageColor: 'text-gray-600',
    shadowColor: 'shadow-blue-100'
  }
}

// Tek toast komponenti
function ToastItem({
  show,
  type = 'success',
  title,
  message,
  onClose,
  autoClose = true,
  duration = 5000,
  position = 0
}) {
  const config = toastTypes[type]
  const Icon = config.icon

  useEffect(() => {
    if (show && autoClose) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [show, autoClose, duration, onClose])

  return (
    <div 
      className="fixed right-6 z-50" 
      style={{ top: `${24 + position * 110}px` }}
    >
      <Transition
        show={show}
        as={Fragment}
        enter="transform ease-out duration-300 transition"
        enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
        enterTo="translate-y-0 opacity-100 sm:translate-x-0"
        leave="transition ease-in duration-200"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className={`min-w-80 max-w-md ${config.bgColor} ${config.borderColor} ${config.shadowColor} rounded-xl shadow-2xl pointer-events-auto ring-1 ring-gray-200 overflow-hidden backdrop-blur-sm`}>
          <div className="p-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className={`w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center`}>
                  <Icon className={`h-7 w-7 ${config.iconColor}`} />
                </div>
              </div>
              <div className="ml-4 w-0 flex-1">
                {title && (
                  <p className={`text-lg font-semibold ${config.titleColor} leading-tight`}>
                    {title}
                  </p>
                )}
                {message && (
                  <p className={`text-sm ${config.messageColor} ${title ? 'mt-2' : ''} leading-relaxed`}>
                    {message}
                  </p>
                )}
              </div>
              <div className="ml-4 flex-shrink-0 flex">
                <button
                  className="bg-gray-100 rounded-full p-2 inline-flex text-gray-400 hover:text-gray-600 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                  onClick={onClose}
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Progress bar */}
          {autoClose && (
            <div className="h-1 bg-gray-100">
              <div 
                className={`h-full ${
                  type === 'success' ? 'bg-green-500' : 
                  type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                } transition-all ease-linear`}
                style={{
                  width: '100%',
                  animation: `shrink ${duration}ms linear forwards`
                }}
              />
            </div>
          )}
        </div>
      </Transition>
      
      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  )
}

// Toast yöneticisi
export default function ToastContainer() {
  const [toasts, setToasts] = useState([])

  const addToast = (toastData) => {
    const id = Date.now()
    const newToast = {
      id,
      show: true,
      type: 'success',
      autoClose: true,
      duration: 5000,
      ...toastData
    }
    
    setToasts(prev => [...prev, newToast])
  }

  const removeToast = (id) => {
    setToasts(prev => 
      prev.map(toast => 
        toast.id === id ? { ...toast, show: false } : toast
      )
    )
    
    // Animation bittikten sonra state'den tamamen kaldır
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id))
    }, 300)
  }

  // Global toast fonksiyonunu window'a ekle
  useEffect(() => {
    window.showToast = addToast
    return () => {
      delete window.showToast
    }
  }, [])

  return (
    <>
      {toasts.map((toast, index) => (
        <ToastItem
          key={toast.id}
          {...toast}
          position={index}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </>
  )
}

// Export hem tek toast hem de container'ı
export { ToastItem as Toast }