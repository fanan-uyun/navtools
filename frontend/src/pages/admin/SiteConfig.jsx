import { useEffect, useState } from 'react'
import { Save, Globe, Mail, Shield, Image as ImageIcon, FileText } from 'lucide-react'
import { api } from '../../contexts/AuthContext'

function SiteConfig() {
  const [config, setConfig] = useState({
    site_name: '',
    site_description: '',
    site_keywords: '',
    icp_beian: '',
    gongan_beian: '',
    contact_email: '',
    theme_enabled: true,
    logo_url: '',
    favicon_url: '',
    footer_text: '',
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    try {
      const response = await api.get('/admin/site-config')
      setConfig(response.data)
    } catch (error) {
      console.error('Failed to fetch config:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSaving(true)
    setMessage('')

    try {
      await api.put('/admin/site-config', config)
      setMessage('保存成功')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setMessage('保存失败: ' + (error.response?.data?.message || '未知错误'))
    } finally {
      setIsSaving(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setConfig(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  if (isLoading) {
    return <div className="p-8 text-center">加载中...</div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">网站配置</h1>
        {message && (
          <div className={`px-4 py-2 border-2 ${message.includes('成功') ? 'bg-green-100 border-green-500 text-green-700' : 'bg-red-100 border-red-500 text-red-700'}`}>
            {message}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl">
        {/* Basic Info */}
        <div className="bg-white border-2 border-black p-6 mb-6 shadow-brutal">
          <div className="flex items-center gap-2 mb-4 border-b-2 border-gray-200 pb-2">
            <Globe className="w-5 h-5" />
            <h2 className="text-lg font-bold">基本信息</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block font-bold mb-2">网站名称</label>
              <input
                type="text"
                name="site_name"
                value={config.site_name}
                onChange={handleChange}
                className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-brutal-yellow"
              />
            </div>

            <div>
              <label className="block font-bold mb-2">网站描述</label>
              <textarea
                name="site_description"
                rows={2}
                value={config.site_description}
                onChange={handleChange}
                className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-brutal-yellow"
              />
            </div>

            <div>
              <label className="block font-bold mb-2">关键词 (逗号分隔)</label>
              <input
                type="text"
                name="site_keywords"
                value={config.site_keywords}
                onChange={handleChange}
                className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-brutal-yellow"
              />
            </div>
          </div>
        </div>

        {/* Branding */}
        <div className="bg-white border-2 border-black p-6 mb-6 shadow-brutal">
          <div className="flex items-center gap-2 mb-4 border-b-2 border-gray-200 pb-2">
            <ImageIcon className="w-5 h-5" />
            <h2 className="text-lg font-bold">品牌标识</h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-bold mb-2">Logo URL</label>
              <input
                type="url"
                name="logo_url"
                value={config.logo_url || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-brutal-yellow"
              />
            </div>
            <div>
              <label className="block font-bold mb-2">Favicon URL</label>
              <input
                type="url"
                name="favicon_url"
                value={config.favicon_url || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-brutal-yellow"
              />
            </div>
          </div>
        </div>

        {/* Contact & Legal */}
        <div className="bg-white border-2 border-black p-6 mb-6 shadow-brutal">
          <div className="flex items-center gap-2 mb-4 border-b-2 border-gray-200 pb-2">
            <Shield className="w-5 h-5" />
            <h2 className="text-lg font-bold">联系与备案</h2>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold mb-2">联系邮箱</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    name="contact_email"
                    value={config.contact_email || ''}
                    onChange={handleChange}
                    className="w-full pl-9 pr-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-brutal-yellow"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold mb-2">ICP备案号</label>
                <input
                  type="text"
                  name="icp_beian"
                  value={config.icp_beian || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-brutal-yellow"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold mb-2">公安备案号</label>
              <input
                type="text"
                name="gongan_beian"
                value={config.gongan_beian || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-brutal-yellow"
              />
            </div>

            <div>
              <label className="block font-bold mb-2">页脚文本</label>
              <textarea
                name="footer_text"
                rows={3}
                value={config.footer_text || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-brutal-yellow"
              />
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="bg-white border-2 border-black p-6 mb-6 shadow-brutal">
          <div className="flex items-center gap-2 mb-4 border-b-2 border-gray-200 pb-2">
            <FileText className="w-5 h-5" />
            <h2 className="text-lg font-bold">功能设置</h2>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="theme_enabled"
              name="theme_enabled"
              checked={config.theme_enabled}
              onChange={handleChange}
              className="w-5 h-5 border-2 border-black"
            />
            <label htmlFor="theme_enabled" className="font-medium">
              启用主题切换功能
            </label>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="btn-brutal flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {isSaving ? '保存中...' : '保存配置'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default SiteConfig
