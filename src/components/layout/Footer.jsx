import React from 'react'
import { 
  MapPinIcon, 
  PhoneIcon, 
  EnvelopeIcon 
} from '@heroicons/react/24/outline'

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-kristal-600 to-kristal-800 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Şirket Logosu ve Bilgileri - Sol Taraf */}
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              {/* Büyük Logo */}
              <div className="h-20 w-20 bg-white rounded-xl flex items-center justify-center flex-shrink-0">
                <img 
                  src="/crystal-logo-small.png" 
                  alt="Kristal Aksesuar Logo" 
                  className="h-16 w-16 object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none'
                    e.target.nextSibling.style.display = 'block'
                  }}
                />
                <div 
                  className="h-16 w-16 bg-kristal-600 rounded-lg flex items-center justify-center hidden"
                  style={{ display: 'none' }}
                >
                  <span className="text-white font-bold text-2xl">K</span>
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold">Kristal Aksesuar</h3>
                <p className="text-kristal-100 text-lg">Bayi Paneli</p>
              </div>
            </div>
            <p className="text-kristal-100 text-base leading-relaxed">
              Mobilya aksesuar sektöründe kaliteli ürünler ve güvenilir hizmet anlayışı ile bayilerimize özel çözümler sunuyoruz.
            </p>
          </div>

          {/* İletişim Bilgileri - Sağ Taraf */}
          <div className="space-y-4">
            <h4 className="text-xl font-semibold mb-6">İletişim Bilgileri</h4>
            
            <div className="flex items-start space-x-3">
              <MapPinIcon className="w-6 h-6 text-kristal-200 mt-0.5 flex-shrink-0" />
              <div className="text-base text-kristal-100">
                <p>Mahmudiye Mahallesi, Tandoğan Cad</p>
                <p>16. Sk, No:4/B, 16400 İnegöl/Bursa</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <PhoneIcon className="w-6 h-6 text-kristal-200 flex-shrink-0" />
              <a 
                href="tel:+902247770072" 
                className="text-base text-kristal-100 hover:text-white transition-colors"
              >
                0 (224) 777 00 72
              </a>
            </div>

            <div className="flex items-center space-x-3">
              <EnvelopeIcon className="w-6 h-6 text-kristal-200 flex-shrink-0" />
              <a 
                href="mailto:info@kristal.com.tr" 
                className="text-base text-kristal-100 hover:text-white transition-colors"
              >
                info@kristal.com.tr
              </a>
            </div>
          </div>
        </div>

        {/* Alt Bölüm - Copyright ve Geliştirici */}
        <div className="mt-8 pt-6 border-t border-kristal-500">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            
            {/* Copyright */}
            <div className="text-sm text-kristal-100 text-center md:text-left">
              <p>© 2025 Kristal Aksesuar. Tüm hakları saklıdır.</p>
            </div>

            {/* Geliştirici Bilgisi */}
            <div className="flex items-center space-x-2 text-kristal-200">
              <span className="text-sm">Developed by</span>
              <img 
                src="/logo-gradient.png" 
                alt="Developer Logo" 
                className="h-6 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity"
              />
              <span className="text-sm font-medium">2025</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}