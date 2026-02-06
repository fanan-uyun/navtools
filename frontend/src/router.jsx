import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'

// Public pages
import Home from './pages/public/Home'
import ToolDetail from './pages/public/ToolDetail'
import DevToolPage from './pages/public/DevToolPage'

// Admin pages
import AdminLayout from './pages/admin/AdminLayout'
import AdminLogin from './pages/admin/Login'
import Dashboard from './pages/admin/Dashboard'
import ToolsManage from './pages/admin/ToolsManage'
import CategoriesManage from './pages/admin/CategoriesManage'
import AdminsManage from './pages/admin/AdminsManage'
import SiteConfig from './pages/admin/SiteConfig'
import IconsManage from './pages/admin/IconsManage'
import AuditLogs from './pages/admin/AuditLogs'

// Protected route component
function ProtectedRoute({ children, requireSuper = false }) {
  const { isAuthenticated, isSuperuser, isLoading } = useAuth()
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brutal-black">
        <div className="text-brutal-yellow text-xl font-mono">Loading...</div>
      </div>
    )
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />
  }
  
  if (requireSuper && !isSuperuser) {
    return <Navigate to="/admin" replace />
  }
  
  return children
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/tool/:slug" element={<ToolDetail />} />
      <Route path="/dev/:slug" element={<DevToolPage />} />
      
      {/* Admin Routes */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={
        <ProtectedRoute>
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="tools" element={<ToolsManage />} />
        <Route path="categories" element={<CategoriesManage />} />
        <Route path="icons" element={<IconsManage />} />
        <Route path="config" element={<SiteConfig />} />
        <Route path="logs" element={
          <ProtectedRoute requireSuper>
            <AuditLogs />
          </ProtectedRoute>
        } />
        <Route path="admins" element={
          <ProtectedRoute requireSuper>
            <AdminsManage />
          </ProtectedRoute>
        } />
      </Route>
      
      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default AppRoutes
