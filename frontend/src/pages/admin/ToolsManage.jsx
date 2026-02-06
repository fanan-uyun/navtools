import { useEffect, useState } from 'react'
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Star, 
  Eye,
  X,
  Check,
  MoreHorizontal
} from 'lucide-react'
import { api } from '../../contexts/AuthContext'
import { cn, truncate } from '../../lib/utils'

function ToolsManage() {
  const [tools, setTools] = useState([])
  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [editingTool, setEditingTool] = useState(null)
  const [selectedTools, setSelectedTools] = useState([])

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    short_description: '',
    description: '',
    url: '',
    category_id: '',
    icon: '',
    tags: '',
    is_featured: false,
    is_self_developed: false,
    api_endpoint: '',
    sort_order: 0,
  })

  useEffect(() => {
    fetchTools()
    fetchCategories()
  }, [currentPage, searchQuery, selectedCategory])

  const fetchTools = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage,
        page_size: 20,
      })
      if (searchQuery) params.append('search', searchQuery)
      if (selectedCategory) params.append('category_id', selectedCategory)

      const response = await api.get(`/admin/tools?${params}`)
      setTools(response.data.data.items)
      setTotalPages(Math.ceil(response.data.data.total / 20))
    } catch (error) {
      console.error('Failed to fetch tools:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await api.get('/admin/categories?page_size=100')
      setCategories(response.data.data.items)
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const data = {
        ...formData,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : [],
        category_id: parseInt(formData.category_id),
        sort_order: parseInt(formData.sort_order) || 0,
      }

      if (editingTool) {
        await api.put(`/admin/tools/${editingTool.id}`, data)
      } else {
        await api.post('/admin/tools', data)
      }

      setShowModal(false)
      setEditingTool(null)
      resetForm()
      fetchTools()
    } catch (error) {
      alert(error.response?.data?.message || '操作失败')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('确定要删除这个工具吗？')) return
    try {
      await api.delete(`/admin/tools/${id}`)
      fetchTools()
    } catch (error) {
      alert('删除失败')
    }
  }

  const handleToggleFeatured = async (id) => {
    try {
      await api.post(`/admin/tools/${id}/toggle-featured`)
      fetchTools()
    } catch (error) {
      alert('操作失败')
    }
  }

  const handleBatchDelete = async () => {
    if (!confirm(`确定要删除选中的 ${selectedTools.length} 个工具吗？`)) return
    try {
      await api.post('/admin/tools/batch-delete', selectedTools)
      setSelectedTools([])
      fetchTools()
    } catch (error) {
      alert('批量删除失败')
    }
  }

  const openEditModal = (tool) => {
    setEditingTool(tool)
    setFormData({
      name: tool.name,
      slug: tool.slug,
      short_description: tool.short_description || '',
      description: tool.description || '',
      url: tool.url,
      category_id: tool.category_id.toString(),
      icon: tool.icon || '',
      tags: Array.isArray(tool.tags) ? tool.tags.join(', ') : tool.tags || '',
      is_featured: tool.is_featured,
      is_self_developed: tool.is_self_developed,
      api_endpoint: tool.api_endpoint || '',
      sort_order: tool.sort_order,
    })
    setShowModal(true)
  }

  const openCreateModal = () => {
    setEditingTool(null)
    resetForm()
    setShowModal(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      short_description: '',
      description: '',
      url: '',
      category_id: '',
      icon: '',
      tags: '',
      is_featured: false,
      is_self_developed: false,
      api_endpoint: '',
      sort_order: 0,
    })
  }

  const toggleSelection = (id) => {
    setSelectedTools(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id)
        : [...prev, id]
    )
  }

  const toggleAll = () => {
    if (selectedTools.length === tools.length) {
      setSelectedTools([])
    } else {
      setSelectedTools(tools.map(t => t.id))
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">工具管理</h1>
        <button
          onClick={openCreateModal}
          className="btn-brutal flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          添加工具
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white border-2 border-black p-4 mb-4 shadow-brutal flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索工具..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-brutal-yellow"
            />
          </div>
        </div>
        
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border-2 border-black bg-white focus:outline-none focus:ring-2 focus:ring-brutal-yellow"
        >
          <option value="">所有分类</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* Batch Actions */}
      {selectedTools.length > 0 && (
        <div className="bg-brutal-yellow border-2 border-black p-3 mb-4 flex items-center gap-4">
          <span className="font-medium">已选择 {selectedTools.length} 项</span>
          <button
            onClick={handleBatchDelete}
            className="px-3 py-1 bg-red-500 text-white border-2 border-black text-sm"
          >
            批量删除
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white border-2 border-black shadow-brutal overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100 border-b-2 border-black">
            <tr>
              <th className="p-3 w-10">
                <input
                  type="checkbox"
                  checked={selectedTools.length === tools.length && tools.length > 0}
                  onChange={toggleAll}
                  className="w-4 h-4"
                />
              </th>
              <th className="p-3 text-left">工具</th>
              <th className="p-3 text-left">分类</th>
              <th className="p-3 text-left">浏览</th>
              <th className="p-3 text-center">精选</th>
              <th className="p-3 text-center">状态</th>
              <th className="p-3 text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7} className="p-8 text-center">加载中...</td>
              </tr>
            ) : tools.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-500">暂无工具</td>
              </tr>
            ) : (
              tools.map(tool => (
                <tr key={tool.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={selectedTools.includes(tool.id)}
                      onChange={() => toggleSelection(tool.id)}
                      className="w-4 h-4"
                    />
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      {tool.icon && <span className="text-xl">{tool.icon}</span>}
                      <div>
                        <p className="font-medium">{tool.name}</p>
                        <p className="text-xs text-gray-500">{truncate(tool.short_description, 30)}</p>
                      </div>
                      {tool.is_self_developed && (
                        <span className="px-1.5 py-0.5 bg-brutal-yellow border border-black text-xs">
                          自研
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-3">
                    <span 
                      className="px-2 py-1 text-xs border border-black"
                      style={{ backgroundColor: tool.category?.color + '30' || '#FFD70030' }}
                    >
                      {tool.category?.name}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Eye className="w-4 h-4" />
                      {tool.view_count}
                    </div>
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => handleToggleFeatured(tool.id)}
                      className={cn(
                        'p-1 border-2 border-black transition-colors',
                        tool.is_featured ? 'bg-brutal-yellow' : 'bg-white hover:bg-gray-100'
                      )}
                    >
                      <Star className={cn('w-4 h-4', tool.is_featured && 'fill-current')} />
                    </button>
                  </td>
                  <td className="p-3 text-center">
                    <span className={cn(
                      'px-2 py-1 text-xs border-2 border-black',
                      tool.is_active ? 'bg-green-100' : 'bg-gray-100'
                    )}>
                      {tool.is_active ? '启用' : '禁用'}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(tool)}
                        className="p-2 hover:bg-gray-100 border-2 border-transparent hover:border-black transition-all"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(tool.id)}
                        className="p-2 hover:bg-red-100 border-2 border-transparent hover:border-red-500 transition-all"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={cn(
                'w-10 h-10 border-2 border-black font-medium transition-all',
                currentPage === page 
                  ? 'bg-brutal-yellow shadow-brutal-sm' 
                  : 'bg-white hover:shadow-brutal-sm'
              )}
            >
              {page}
            </button>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white border-4 border-black shadow-brutal-lg w-full max-w-2xl max-h-[90vh] overflow-auto">
            <div className="p-4 border-b-4 border-black flex items-center justify-between bg-brutal-yellow">
              <h2 className="text-xl font-bold">
                {editingTool ? '编辑工具' : '添加工具'}
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
                  <label className="block font-bold mb-2">标识 (slug) *</label>
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
                <label className="block font-bold mb-2">简短描述</label>
                <input
                  type="text"
                  value={formData.short_description}
                  onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-brutal-yellow"
                />
              </div>

              <div>
                <label className="block font-bold mb-2">详细描述</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-brutal-yellow"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold mb-2">链接 URL *</label>
                  <input
                    type="url"
                    required
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-brutal-yellow"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-2">分类 *</label>
                  <select
                    required
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-black bg-white focus:outline-none focus:ring-2 focus:ring-brutal-yellow"
                  >
                    <option value="">选择分类</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold mb-2">图标 (emoji)</label>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-brutal-yellow"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-2">标签 (逗号分隔)</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="tool, utility, online"
                    className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-brutal-yellow"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold mb-2">排序</label>
                  <input
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({ ...formData, sort_order: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-brutal-yellow"
                  />
                </div>
                <div className="flex items-center gap-4 pt-8">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_featured}
                      onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                      className="w-5 h-5 border-2 border-black"
                    />
                    <span className="font-medium">精选</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_self_developed}
                      onChange={(e) => setFormData({ ...formData, is_self_developed: e.target.checked })}
                      className="w-5 h-5 border-2 border-black"
                    />
                    <span className="font-medium">自研工具</span>
                  </label>
                </div>
              </div>

              {formData.is_self_developed && (
                <div>
                  <label className="block font-bold mb-2">API 端点</label>
                  <input
                    type="text"
                    value={formData.api_endpoint}
                    onChange={(e) => setFormData({ ...formData, api_endpoint: e.target.value })}
                    placeholder="/api/tools/xxx"
                    className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-brutal-yellow"
                  />
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t-2 border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-brutal-secondary"
                >
                  取消
                </button>
                <button type="submit" className="btn-brutal">
                  {editingTool ? '保存' : '创建'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ToolsManage
