import { useEffect, useState } from 'react'
import { Plus, Search, Edit2, Trash2, X, Shield, User } from 'lucide-react'
import { api } from '../../contexts/AuthContext.jsx'
import { formatDate } from '../../lib/utils.js'

function AdminsManage() {
  const [admins, setAdmins] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [editingAdmin, setEditingAdmin] = useState(null)
  const [currentAdminId, setCurrentAdminId] = useState(null)

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    is_superuser: false,
    is_active: true,
  })

  const [passwordData, setPasswordData] = useState({
    new_password: '',
    confirm_password: '',
  })

  useEffect(() => {
    fetchAdmins()
    fetchCurrentAdmin()
  }, [])

  const fetchAdmins = async () => {
    try {
      const response = await api.get('/admin/users?page_size=100')
      setAdmins(response.data.data.items)
    } catch (error) {
      console.error('Failed to fetch admins:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCurrentAdmin = async () => {
    try {
      const response = await api.get('/auth/me')
      setCurrentAdminId(response.data.id)
    } catch (error) {
      console.error('Failed to fetch current admin:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingAdmin) {
        await api.put(`/admin/users/${editingAdmin.id}`, {
          username: formData.username,
          email: formData.email,
          is_active: formData.is_active,
        })
      } else {
        await api.post('/admin/users', formData)
      }

      setShowModal(false)
      setEditingAdmin(null)
      resetForm()
      fetchAdmins()
    } catch (error) {
      alert(error.response?.data?.message || '操作失败')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('确定要删除这个管理员吗？')) return
    try {
      await api.delete(`/admin/users/${id}`)
      fetchAdmins()
    } catch (error) {
      alert(error.response?.data?.message || '删除失败')
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    if (passwordData.new_password !== passwordData.confirm_password) {
      alert('两次输入的密码不一致')
      return
    }
    try {
      await api.post(`/admin/users/${editingAdmin.id}/reset-password`, {
        new_password: passwordData.new_password,
      })
      setShowPasswordModal(false)
      setPasswordData({ new_password: '', confirm_password: '' })
      alert('密码重置成功')
    } catch (error) {
      alert('密码重置失败')
    }
  }

  const openEditModal = (admin) => {
    setEditingAdmin(admin)
    setFormData({
      username: admin.username,
      email: admin.email,
      password: '',
      is_superuser: admin.is_superuser,
      is_active: admin.is_active,
    })
    setShowModal(true)
  }

  const openCreateModal = () => {
    setEditingAdmin(null)
    resetForm()
    setShowModal(true)
  }

  const openPasswordModal = (admin) => {
    setEditingAdmin(admin)
    setPasswordData({ new_password: '', confirm_password: '' })
    setShowPasswordModal(true)
  }

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      is_superuser: false,
      is_active: true,
    })
  }

  const filteredAdmins = admins.filter(a =>
    a.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">管理员管理</h1>
        <button
          onClick={openCreateModal}
          className="btn-brutal flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          添加管理员
        </button>
      </div>

      {/* Search */}
      <div className="bg-white border-2 border-black p-4 mb-4 shadow-brutal">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜索管理员..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-brutal-yellow"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border-2 border-black shadow-brutal overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100 border-b-2 border-black">
            <tr>
              <th className="p-3 text-left">管理员</th>
              <th className="p-3 text-left">角色</th>
              <th className="p-3 text-left">状态</th>
              <th className="p-3 text-left">最后登录</th>
              <th className="p-3 text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="p-8 text-center">加载中...</td>
              </tr>
            ) : filteredAdmins.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500">暂无管理员</td>
              </tr>
            ) : (
              filteredAdmins.map(admin => (
                <tr key={admin.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-brutal-yellow border-2 border-black flex items-center justify-center">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium flex items-center gap-2">
                          {admin.username}
                          {admin.id === currentAdminId && (
                            <span className="text-xs px-1.5 py-0.5 bg-blue-100 border border-blue-300">我</span>
                          )}
                        </p>
                        <p className="text-sm text-gray-500">{admin.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    {admin.is_superuser ? (
                      <span className="px-2 py-1 bg-brutal-yellow border-2 border-black text-xs font-medium">
                        <Shield className="w-3 h-3 inline mr-1" />
                        超级管理员
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-100 border border-gray-300 text-xs">普通管理员</span>
                    )}
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-1 text-xs border-2 border-black ${admin.is_active ? 'bg-green-100' : 'bg-red-100'}`}>
                      {admin.is_active ? '启用' : '禁用'}
                    </span>
                  </td>
                  <td className="p-3 text-sm text-gray-500">
                    {formatDate(admin.last_login)}
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openPasswordModal(admin)}
                        className="px-2 py-1 text-xs border-2 border-black hover:bg-gray-100"
                      >
                        重置密码
                      </button>
                      <button
                        onClick={() => openEditModal(admin)}
                        className="p-2 hover:bg-gray-100 border-2 border-transparent hover:border-black"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {admin.id !== currentAdminId && (
                        <button
                          onClick={() => handleDelete(admin.id)}
                          className="p-2 hover:bg-red-100 border-2 border-transparent hover:border-red-500"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white border-4 border-black shadow-brutal-lg w-full max-w-md">
            <div className="p-4 border-b-4 border-black flex items-center justify-between bg-brutal-yellow">
              <h2 className="text-xl font-bold">
                {editingAdmin ? '编辑管理员' : '添加管理员'}
              </h2>
              <button onClick={() => setShowModal(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block font-bold mb-2">用户名 *</label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-brutal-yellow"
                />
              </div>

              <div>
                <label className="block font-bold mb-2">邮箱 *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-brutal-yellow"
                />
              </div>

              {!editingAdmin && (
                <div>
                  <label className="block font-bold mb-2">密码 *</label>
                  <input
                    type="password"
                    required={!editingAdmin}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-brutal-yellow"
                  />
                </div>
              )}

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_superuser}
                    onChange={(e) => setFormData({ ...formData, is_superuser: e.target.checked })}
                    disabled={editingAdmin?.id === currentAdminId}
                    className="w-5 h-5 border-2 border-black"
                  />
                  <span className="font-medium">超级管理员</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    disabled={editingAdmin?.id === currentAdminId}
                    className="w-5 h-5 border-2 border-black"
                  />
                  <span className="font-medium">启用</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t-2 border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-brutal-secondary"
                >
                  取消
                </button>
                <button type="submit" className="btn-brutal">
                  {editingAdmin ? '保存' : '创建'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white border-4 border-black shadow-brutal-lg w-full max-w-sm">
            <div className="p-4 border-b-4 border-black flex items-center justify-between bg-brutal-yellow">
              <h2 className="text-xl font-bold">重置密码</h2>
              <button onClick={() => setShowPasswordModal(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleResetPassword} className="p-6 space-y-4">
              <p className="text-sm text-gray-600">
                正在为 <strong>{editingAdmin?.username}</strong> 重置密码
              </p>

              <div>
                <label className="block font-bold mb-2">新密码 *</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={passwordData.new_password}
                  onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-brutal-yellow"
                />
              </div>

              <div>
                <label className="block font-bold mb-2">确认密码 *</label>
                <input
                  type="password"
                  required
                  value={passwordData.confirm_password}
                  onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-brutal-yellow"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t-2 border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="btn-brutal-secondary"
                >
                  取消
                </button>
                <button type="submit" className="btn-brutal">
                  重置
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminsManage
