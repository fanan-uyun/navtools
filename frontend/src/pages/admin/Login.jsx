import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, User, AlertCircle } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext.jsx'

function AdminLogin() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await login(username, password)
      navigate('/admin')
    } catch (err) {
      setError(err.response?.data?.detail || '登录失败')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-brutal-black">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="bg-brutal-yellow border-4 border-black p-6 mb-1">
          <h1 className="text-2xl font-bold text-center">管理后台登录</h1>
        </div>
        
        {/* Form */}
        <div className="bg-white border-4 border-black p-6 shadow-brutal-lg">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border-2 border-red-500 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-2">用户名</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border-2 border-black 
                           focus:outline-none focus:ring-2 focus:ring-brutal-yellow"
                  placeholder="输入用户名"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">密码</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border-2 border-black 
                           focus:outline-none focus:ring-2 focus:ring-brutal-yellow"
                  placeholder="输入密码"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-brutal-yellow border-2 border-black font-bold
                       shadow-brutal hover:shadow-brutal-hover 
                       hover:-translate-x-0.5 hover:-translate-y-0.5
                       active:shadow-none active:translate-x-0.5 active:translate-y-0.5
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition-all duration-150"
            >
              {isLoading ? '登录中...' : '登录'}
            </button>
          </form>

          <div className="mt-4 text-center text-sm text-gray-500">
            默认账号: admin / Admin@123
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin
