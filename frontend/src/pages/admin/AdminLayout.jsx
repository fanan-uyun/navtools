import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Wrench, 
  FolderOpen, 
  Image, 
  Settings, 
  Users, 
  FileText,
  LogOut,
  Home
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

function AdminLayout() {
  const { user, isSuperuser, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/admin/login')
  }

  const navItems = [
    { to: '/admin', icon: LayoutDashboard, label: '仪表盘', exact: true },
    { to: '/admin/tools', icon: Wrench, label: '工具管理' },
    { to: '/admin/categories', icon: FolderOpen, label: '分类管理' },
    { to: '/admin/icons', icon: Image, label: '图标管理' },
    { to: '/admin/config', icon: Settings, label: '网站配置' },
  ]

  const superNavItems = [
    { to: '/admin/admins', icon: Users, label: '管理员' },
    { to: '/admin/logs', icon: FileText, label: '审计日志' },
  ]

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-brutal-black text-white flex flex-col border-r-4 border-brutal-yellow">
        {/* Logo */}
        <div className="p-6 border-b-2 border-gray-800">
          <h1 className="text-xl font-bold text-brutal-yellow">NavTools</h1>
          <p className="text-sm text-gray-400">管理后台</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-none border-2 transition-all ${
                  isActive
                    ? 'bg-brutal-yellow text-black border-brutal-yellow'
                    : 'text-gray-300 border-transparent hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}

          {isSuperuser && (
            <>
              <div className="pt-4 mt-4 border-t-2 border-gray-800">
                <p className="px-4 text-xs text-gray-500 uppercase mb-2">系统管理</p>
              </div>
              {superNavItems.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-none border-2 transition-all ${
                      isActive
                        ? 'bg-brutal-yellow text-black border-brutal-yellow'
                        : 'text-gray-300 border-transparent hover:bg-gray-800 hover:text-white'
                    }`
                  }
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </>
          )}
        </nav>

        {/* User */}
        <div className="p-4 border-t-2 border-gray-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-brutal-yellow border-2 border-black flex items-center justify-center">
              <span className="text-black font-bold">
                {user?.username?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="font-medium text-sm">{user?.username}</p>
              <p className="text-xs text-gray-400">
                {isSuperuser ? '超级管理员' : '管理员'}
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <a
              href="/"
              target="_blank"
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 
                       bg-gray-800 text-white text-sm border border-gray-700
                       hover:bg-gray-700 transition-colors"
            >
              <Home className="w-4 h-4" />
              前台
            </a>
            <button
              onClick={handleLogout}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 
                       bg-red-900 text-white text-sm border border-red-800
                       hover:bg-red-800 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              退出
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default AdminLayout
