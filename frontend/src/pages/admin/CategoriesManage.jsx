import { useEffect, useState } from 'react'
import { Plus, Search, Edit2, Trash2, X, Palette } from 'lucide-react'
import { api } from '../../contexts/AuthContext.jsx'

function CategoriesManage() {
  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    icon: '',
    color: '#FFD700',
    sort_order: 0,
    is_active: true,
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await api.get('/admin/categories?page_size=100')
      setCategories(response.data.data.items)
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const data = {
        ...formData,
        sort_order: parseInt(formData.sort_order) || 0,
      }

      if (editingCategory) {
        await api.put(`/admin/categories/${editingCategory.id}`, data)
      } else {
        await api.post('/admin/categories', data)
      }

      setShowModal(false)
      setEditingCategory(null)
      resetForm()
      fetchCategories()
    } catch (error) {
      alert(error.response?.data?.message || '操作失败')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('确定要删除这个分类吗？')) return
    try {
      await api.delete(`/admin/categories/${id}`)
      fetchCategories()
    } catch (error) {
      alert(error.response?.data?.message || '删除失败')
    }
  }

  const openEditModal = (category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      icon: category.icon || '',
      color: category.color,
      sort_order: category.sort_order,
      is_active: category.is_active,
    })
    setShowModal(true)
  }

  const openCreateModal = () => {
    setEditingCategory(null)
    resetForm()
    setShowModal(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      icon: '',
      color: '#FFD700',
      sort_order: 0,
      is_active: true,
    })
  }

  const filteredCategories = categories.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">分类管理</h1>
        <button
          onClick={openCreateModal}
          className="btn-brutal flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          添加分类
        </button>
      </div>

      {/* Search */}
      <div className="bg-white border-2 border-black p-4 mb-4 shadow-brutal">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜索分类..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-brutal-yellow"
          />
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full p-8 text-center">加载中...</div>
        ) : filteredCategories.length === 0 ? (
          <div className="col-span-full p-8 text-center text-gray-500">暂无分类</div>
        ) : (
          filteredCategories.map(cat => (
            <div
              key={cat.id}
              className="bg-white border-2 border-black p-4 shadow-brutal hover:shadow-brutal-hover 
                       hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 border-2 border-black flex items-center justify-center"
                    style={{ backgroundColor: cat.color }}
                  >
                    {cat.icon ? (
                      <span className="text-2xl">{cat.icon}</span>
                    ) : (
                      <Palette className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold">{cat.name}</h3>
                    <p className="text-sm text-gray-500">{cat.slug}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {cat.tool_count} 个工具
                    </p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => openEditModal(cat)}
                    className="p-2 hover:bg-gray-100 border-2 border-transparent hover:border-black"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    className="p-2 hover:bg-red-100 border-2 border-transparent hover:border-red-500"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
              {cat.description && (
                <p className="mt-3 text-sm text-gray-600 line-clamp-2">
                  {cat.description}
                </p>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white border-4 border-black shadow-brutal-lg w-full max-w-md">
            <div className="p-4 border-b-4 border-black flex items-center justify-between bg-brutal-yellow">
              <h2 className="text-xl font-bold">
                {editingCategory ? '编辑分类' : '添加分类'}
              </h2>
              <button onClick={() => setShowModal(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold mb-2">名称 *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-brutal-yellow"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-2">标识 *</label>
                  <input
                    type="text"
                    required
                    pattern="[a-z0-9-]+"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-brutal-yellow"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-2">描述</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-brutal-yellow"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold mb-2">图标</label>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    placeholder="emoji"
                    className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-brutal-yellow"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-2">排序</label>
                  <input
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({ ...formData, sort_order: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-brutal-yellow"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-2">颜色</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-12 h-10 border-2 border-black p-1"
                  />
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    pattern="^#[0-9A-Fa-f]{6}$"
                    className="flex-1 px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-brutal-yellow"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-5 h-5 border-2 border-black"
                />
                <label htmlFor="is_active" className="font-medium">启用</label>
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
                  {editingCategory ? '保存' : '创建'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default CategoriesManage
