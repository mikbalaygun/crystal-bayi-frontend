import { useState } from 'react'
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '../components/ui'
import { useAuthStore } from '../stores'

export default function Login() {
  const [credentials, setCredentials] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const { login, loading } = useAuthStore()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    const result = await login(credentials)
    if (!result.success) {
      setError(result.error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-kristal-50 via-kristal-100 to-secondary-50 flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-6">
          {/* Şirket Logosu */}
          <div className="flex justify-center">
            <img 
              src="/crystal-logo-small.png" 
              alt="Kristal Aksesuar Logo" 
              className="h-20 w-auto object-contain"
            />
          </div>
          
          <CardTitle className="text-2xl bg-gradient-to-r from-kristal-600 to-kristal-800 bg-clip-text text-transparent">
            Bayi Paneli
          </CardTitle>
          
          <p className="text-gray-600 text-sm">
            Bayilerimize özel ürün katalog ve sipariş sistemi
          </p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Kullanıcı Adı"
              value={credentials.username}
              onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
              required
              placeholder="Bayi kodunuzu giriniz"
            />
            
            <Input
              label="Şifre"
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
              required
              placeholder="Şifrenizi giriniz"
            />

            {error && (
              <div className="text-red-600 text-sm bg-red-50 border border-red-200 p-3 rounded-lg">
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              </div>
            )}
            
            <Button type="submit" fullWidth loading={loading} className="mt-6">
              {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </Button>
          </form>

          {/* Yardım Metni */}
          <div className="mt-6 text-center text-xs text-gray-500">
            <p>Giriş yapmakta sorun yaşıyorsanız</p>
            <p>destek ekibimizle iletişime geçiniz</p>
          </div>
        </CardContent>
      </Card>

      {/* Footer - Geliştirici Bilgisi */}
      <div className="mt-8 flex items-center justify-center space-x-2 text-gray-500">
        <span className="text-sm">by</span>
        <img 
          src="/logo-gradient.png" 
          alt="Developer Logo" 
          className="h-6 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity"
        />
        <span className="text-sm font-medium">2025</span>
      </div>

      {/* Copyright */}
      <div className="mt-2 text-xs text-gray-400 text-center">
        <p>© 2025 Kristal Aksesuar. Tüm hakları saklıdır.</p>
      </div>
    </div>
  )
}