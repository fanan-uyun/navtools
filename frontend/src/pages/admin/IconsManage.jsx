import { useEffect, useState } from 'react'
import { Plus, Search, Edit2, Trash2, X } from 'lucide-react'
import { api } from '../../contexts/AuthContext'
import { cn } from '../../lib/utils'

function IconsManage() {
  const [icons, setIcons] = useState([])
  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingIcon, setEditingIcon] = useState(null)

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    icon_type: 'lucide',
    content: '',
    category: '',
  })

  useEffect(() => {
    fetchIcons()
    fetchCategories()
  }, [])

  const fetchIcons = async () => {
    try {
      const response = await api.get('/admin/icons?page_size=100')
      setIcons(response.data.data.items)
    } catch (error) {
      console.error('Failed to fetch icons:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await api.get('/admin/icons/categories')
      setCategories(response.data.data)
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingIcon) {
        await api.put(`/admin/icons/${editingIcon.id}`, formData)
      } else {
        await api.post('/admin/icons', formData)
      }

      setShowModal(false)
      setEditingIcon(null)
      resetForm()
      fetchIcons()
    } catch (error) {
      alert(error.response?.data?.message || '操作失败')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('确定要删除这个图标吗？')) return
    try {
      await api.delete(`/admin/icons/${id}`)
      fetchIcons()
    } catch (error) {
      alert('删除失败')
    }
  }

  const openEditModal = (icon) => {
    setEditingIcon(icon)
    setFormData({
      name: icon.name,
      slug: icon.slug,
      icon_type: icon.icon_type,
      content: icon.content || '',
      category: icon.category || '',
    })
    setShowModal(true)
  }

  const openCreateModal = () => {
    setEditingIcon(null)
    resetForm()
    setShowModal(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      icon_type: 'lucide',
      content: '',
      category: '',
    })
  }

  const filteredIcons = icons.filter(icon => {
    const matchesSearch = icon.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = !selectedCategory || icon.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Group by category
  const groupedIcons = filteredIcons.reduce((acc, icon) => {
    const cat = icon.category || '未分类'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(icon)
    return acc
  }, {})

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">图标管理</h1>
        <button
          onClick={openCreateModal}
          className="btn-brutal flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          添加图标
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white border-2 border-black p-4 mb-4 shadow-brutal flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索图标..."
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
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Icons Grid */}
      {isLoading ? (
        <div className="p-8 text-center">加载中...</div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedIcons).map(([category, catIcons]) => (
            <div key={category}>
              <h3 className="text-lg font-bold mb-3 px-2 border-l-4 border-brutal-yellow">
                {category}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                {catIcons.map(icon => (
                  <div
                    key={icon.id}
                    className={cn(
                      'bg-white border-2 border-black p-3 text-center cursor-pointer',
                      'hover:shadow-brutal-sm hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all',
                      icon.source === 'builtin' && 'bg-gray-50'
                    )}
                    onClick={() => openEditModal(icon)}
                  >
                    <div className="w-10 h-10 mx-auto mb-2 bg-gray-100 border border-black flex items-center justify-center">
                      {icon.icon_type === 'lucide' ? (
                        <span className="text-xs text-gray-500">{icon.content}</span>
                      ) : icon.icon_type === 'svg' ? (
                        <span className="text-xs">SVG</span>
                      ) : (
                        <img src={icon.content} alt="" className="w-6 h-6" />
                      )}
                    </div>
                    <p className="text-xs font-medium truncate">{icon.name}</p>
                    {icon.source === 'custom' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(icon.id)
                        }}
                        className="mt-2 p-1 hover:bg-red-100 text-red-500"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredIcons.length === 0 && !isLoading && (
        <div className="p-8 text-center text-gray-500">暂无图标</div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white border-4 border-black shadow-brutal-lg w-full max-w-md">
            <div className="p-4 border-b-4 border-black flex items-center justify-between bg-brutal-yellow">
              <h2 className="text-xl font-bold">
                {editingIcon ? '编辑图标' : '添加图标'}
              </h2>
              <button onClick={() => setShowModal(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
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

              <div>
                <label className="block font-bold mb-2">类型</label>
                <select
                  value={formData.icon_type}
                  onChange={(e) => setFormData({ ...formData, icon_type: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-black bg-white focus:outline-none focus:ring-2 focus:ring-brutal-yellow"
                >
                  <option value="lucide">Lucide</option>
                  <option value="svg">SVG</option>
                  <option value="url">URL</option>
                </select>
              </div>

              <div>
                <label className="block font-bold mb-2">
                  内容 * 
                  {formData.icon_type === 'lucide' && <span className="text-gray-500 font-normal">(图标名称)</span>}
                  {formData.icon_type === 'svg' && <span className="text-gray-500 font-normal">(SVG代码)</span>}
                  {formData.icon_type === 'url' && <span className="text-gray-500 font-normal">(图片URL)</span>}
                </label>
                {formData.icon_type === 'svg' ? (
                  <textarea
                    rows={3}
                    required
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-brutal-yellow text-xs font-mono"
                  />
                ) : (
                  <input
                    type="text"
                    required
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-brutal-yellow"
                  />
                )}
              </div>

              <div>
                <label className="block font-bold mb-2">分类</label>
                <input
                  type="text"
                  list="icon-categories"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-brutal-yellow"
                />
                <datalist id="icon-categories">
                  {categories.map(cat => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
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
                  {editingIcon ? '保存' : '创建'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default IconsManage
