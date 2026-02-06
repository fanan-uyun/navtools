import { useEffect, useState } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  ExternalLink, 
  Wrench, 
  Eye, 
  Folder,
  Star,
  Share2
} from 'lucide-react'
import { api } from '../../contexts/AuthContext'
import ThemeToggle from '../../components/ThemeToggle'

function ToolDetail() {
  const { slug } = useParams()
  const [tool, setTool] = useState(null)
  const [relatedTools, setRelatedTools] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchToolDetail()
  }, [slug])

  const fetchToolDetail = async () => {
    try {
      const response = await api.get(`/api/tools/${slug}`)
      if (response.data.code === 200) {
        setTool(response.data.data)
        // Fetch related tools from same category
        const relatedRes = await api.get(`/api/tools?category=${response.data.data.category.slug}&page_size=5`)
        setRelatedTools(relatedRes.data.data.items.filter(t => t.slug !== slug).slice(0, 4))
      }
    } catch (error) {
      console.error('Failed to fetch tool:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleVisit = () => {
    if (tool) {
      if (tool.is_self_developed && tool.api_endpoint) {
        window.location.href = `/dev/${tool.slug}`
      } else {
        window.open(tool.url, '_blank')
      }
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl font-bold">加载中...</div>
      </div>
    )
  }

  if (!tool) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-brutal-yellow border-b-4 border-black">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a 
              href="/" 
              className="p-2 bg-white border-2 border-black shadow-brutal-sm hover:shadow-brutal transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </a>
            <h1 className="text-xl font-bold">{tool.name}</h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Tool Info Card */}
            <div className="bg-white border-4 border-black shadow-brutal-lg p-6 mb-6">
              <div className="flex items-start gap-6">
                <div
                  className="w-20 h-20 border-4 border-black flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: tool.category?.color || '#FFD700' }}
                >
                  {tool.icon ? (
                    <span className="text-4xl">{tool.icon}</span>
                  ) : (
                    <Wrench className="w-10 h-10" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold">{tool.name}</h2>
                    {tool.is_featured && (
                      <span className="px-2 py-1 bg-brutal-yellow border-2 border-black text-sm font-medium">
                        <Star className="w-4 h-4 inline mr-1" />
                        精选
                      </span>
                    )}
                    {tool.is_self_developed && (
                      <span className="px-2 py-1 bg-green-100 border-2 border-black text-sm font-medium">
                        自研工具
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-600 mb-4">{tool.short_description}</p>
                  
                  <div className="flex items-center gap-4 flex-wrap">
                    <span 
                      className="px-3 py-1.5 border-2 border-black text-sm"
                      style={{ 
                        backgroundColor: (tool.category?.color || '#FFD700') + '30',
                        borderColor: tool.category?.color || '#FFD700'
                      }}
                    >
                      <Folder className="w-4 h-4 inline mr-1" />
                      {tool.category?.name}
                    </span>
                    
                    <span className="flex items-center gap-1 text-gray-500 text-sm">
                      <Eye className="w-4 h-4" />
                      {tool.view_count.toLocaleString()} 次浏览
                    </span>

                    {tool.tags && tool.tags.length > 0 && (
                      <div className="flex gap-2">
                        {tool.tags.map((tag, i) => (
                          <span 
                            key={i}
                            className="px-2 py-1 bg-gray-100 border border-gray-300 text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t-2 border-gray-200">
                <button
                  onClick={handleVisit}
                  className="w-full sm:w-auto px-8 py-4 bg-brutal-black text-white border-4 border-black 
                           font-bold text-lg shadow-brutal hover:shadow-brutal-hover 
                           hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all
                           flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-5 h-5" />
                  {tool.is_self_developed ? '打开工具' : '访问网站'}
                </button>
              </div>
            </div>

            {/* Description */}
            {tool.description && (
              <div className="bg-white border-2 border-black shadow-brutal p-6">
                <h3 className="text-lg font-bold mb-4">工具介绍</h3>
                <div className="prose max-w-none">
                  {tool.description.split('\n').map((paragraph, i) => (
                    <p key={i} className="mb-4 text-gray-700">{paragraph}</p>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Share */}
            <div className="bg-white border-2 border-black shadow-brutal p-4">
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                分享
              </h3>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href)
                  alert('链接已复制')
                }}
                className="w-full py-2 bg-gray-100 border-2 border-black font-medium
                         hover:bg-brutal-yellow transition-colors"
              >
                复制链接
              </button>
            </div>

            {/* Related Tools */}
            {relatedTools.length > 0 && (
              <div className="bg-white border-2 border-black shadow-brutal p-4">
                <h3 className="font-bold mb-3">相关工具</h3>
                <div className="space-y-3">
                  {relatedTools.map(related => (
                    <a
                      key={related.id}
                      href={`/tool/${related.slug}`}
                      className="flex items-center gap-3 p-2 border-2 border-transparent 
                               hover:border-black hover:shadow-brutal-sm transition-all"
                    >
                      <div
                        className="w-10 h-10 border-2 border-black flex items-center justify-center"
                        style={{ backgroundColor: related.category?.color || '#FFD700' }}
                      >
                        {related.icon ? (
                          <span className="text-lg">{related.icon}</span>
                        ) : (
                          <Wrench className="w-5 h-5" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{related.name}</p>
                        <p className="text-xs text-gray-500 truncate">
                          {related.short_description}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default ToolDetail
