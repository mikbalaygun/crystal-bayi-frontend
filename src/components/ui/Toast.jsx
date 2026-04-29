import { Fragment, useEffect, useState, useCallback } from 'react'
import { Transition } from '@headlessui/react'
import {
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
} from '@heroicons/react/24/solid'

const typeConfig = {
  success: {
    icon: CheckCircleIcon,
    colors: 'bg-emerald-50 text-emerald-800 ring-emerald-200/60',
    iconColor: 'text-emerald-500',
    bar: 'bg-emerald-500',
  },
  error: {
    icon: XCircleIcon,
    colors: 'bg-red-50 text-red-800 ring-red-200/60',
    iconColor: 'text-red-500',
    bar: 'bg-red-500',
  },
  info: {
    icon: InformationCircleIcon,
    colors: 'bg-blue-50 text-blue-800 ring-blue-200/60',
    iconColor: 'text-blue-500',
    bar: 'bg-blue-500',
  },
  warning: {
    icon: ExclamationTriangleIcon,
    colors: 'bg-amber-50 text-amber-800 ring-amber-200/60',
    iconColor: 'text-amber-500',
    bar: 'bg-amber-500',
  },
}

function ToastItem({ id, show, type = 'success', title, message, onClose, duration = 3000, position = 0 }) {
  const cfg = typeConfig[type] || typeConfig.success
  const Icon = cfg.icon

  useEffect(() => {
    if (!show) return
    const t = setTimeout(onClose, duration)
    return () => clearTimeout(t)
  }, [show, duration, onClose])

  return (
    <div
      className="pointer-events-none fixed left-4 right-4 z-[100] sm:left-auto sm:right-6"
      style={{ top: `${16 + position * 72}px`, transition: 'top 200ms ease' }}
    >
      <Transition
        show={show}
        as={Fragment}
        enter="transition ease-out duration-300"
        enterFrom="translate-x-full opacity-0"
        enterTo="translate-x-0 opacity-100"
        leave="transition ease-in duration-200"
        leaveFrom="translate-x-0 opacity-100"
        leaveTo="translate-x-full opacity-0"
      >
        <div
          className={`pointer-events-auto relative ml-auto flex w-full max-w-sm items-start gap-2.5 overflow-hidden rounded-xl px-4 py-3 shadow-lg ring-1 backdrop-blur-sm ${cfg.colors}`}
        >
          <Icon className={`mt-0.5 h-5 w-5 flex-shrink-0 ${cfg.iconColor}`} />

          <div className="min-w-0 flex-1">
            {title && <p className="text-sm font-semibold leading-tight">{title}</p>}
            {message && (
              <p className={`text-xs leading-snug opacity-80 ${title ? 'mt-0.5' : ''}`}>
                {message}
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            className="-mr-1 -mt-0.5 flex-shrink-0 rounded-md p-1 opacity-50 transition hover:opacity-100 active:scale-95"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
          <span className={`absolute bottom-0 left-0 h-0.5 w-full ${cfg.bar}`} />
        </div>
      </Transition>
    </div>
  )
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState([])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, show: false } : t)))
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 250)
  }, [])

  const addToast = useCallback((data) => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [
      ...prev.slice(-4), // max 5 toast at a time
      { id, show: true, duration: 3000, ...data },
    ])
  }, [])

  useEffect(() => {
    window.showToast = addToast
    return () => { delete window.showToast }
  }, [addToast])

  return (
    <>
      {toasts.map((toast, i) => (
        <ToastItem key={toast.id} {...toast} position={i} onClose={() => removeToast(toast.id)} />
      ))}
    </>
  )
}

export { ToastItem as Toast }
