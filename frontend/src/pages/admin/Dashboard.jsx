import { useEffect, useState } from 'react'
import { 
  Wrench, 
  FolderOpen, 
  Eye, 
  Star,
  TrendingUp,
  Clock
} from 'lucide-react'
import { api } from '../../contexts/AuthContext.jsx'
import { formatDate } from '../../lib/utils.js'

function Dashboard() {
  const [stats, setStats] = useState({
    total_tools: 0,
    total_categories: 0,
    total_views: 0,
    featured_tools: 0,
  })
  const [recentTools, setRecentTools] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Get tools for stats
      const toolsRes = await api.get('/admin/tools?page_size=1000')
      const tools = toolsRes.data.data.items
      
      // Get categories
      const catsRes = await api.get('/admin/categories?page_size=1000')
      const categories = catsRes.data.data.items
      
      // Calculate stats
      const totalViews = tools.reduce((sum, t) => sum + t.view_count, 0)
      const featuredCount = tools.filter(t => t.is_featured).length
      
      setStats({
        total_tools: tools.length,
        total_categories: categories.length,
        total_views: totalViews,
        featured_tools: featuredCount,
      })
      
      setRecentTools(tools.slice(0, 5))
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const statCards = [
    { 
      title: '工具总数', 
      value: stats.total_tools, 
      icon: Wrench, 
      color: 'bg-blue-500',
      link: '/admin/tools'
    },
    { 
      title: '分类总数', 
      value: stats.total_categories, 
      icon: FolderOpen, 
      color: 'bg-green-500',
      link: '/admin/categories'
    },
    { 
      title: '总浏览量', 
      value: stats.total_views.toLocaleString(), 
      icon: Eye, 
      color: 'bg-purple-500',
      link: '/admin/tools'
    },
    { 
      title: '精选工具', 
      value: stats.featured_tools, 
      icon: Star, 
      color: 'bg-yellow-500',
      link: '/admin/tools'
    },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">仪表盘</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(card => (
          <div 
            key={card.title}
            className="bg-white border-2 border-black p-4 shadow-brutal hover:shadow-brutal-hover 
                     hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all cursor-pointer"
            onClick={() => window.location.href = card.link}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">{card.title}</p>
                <p className="text-2xl font-bold">{card.value}</p>
              </div>
              <div className={`w-12 h-12 ${card.color} border-2 border-black flex items-center justify-center`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tools */}
        <div className="bg-white border-2 border-black shadow-brutal">
          <div className="p-4 border-b-2 border-black flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <h2 className="font-bold">最近添加</h2>
            </div>
            <a href="/admin/tools" className="text-sm text-blue-600 hover:underline">
              查看全部
            </a>
          </div>
          <div className="divide-y divide-gray-200">
            {recentTools.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                暂无工具
              </div>
            ) : (
              recentTools.map(tool => (
                <div key={tool.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                  <div>
                    <p className="font-medium">{tool.name}</p>
                    <p className="text-sm text-gray-500">{tool.category?.name}</p>
                  </div>
                  <span className="text-sm text-gray-400">
                    {formatDate(tool.created_at)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white border-2 border-black shadow-brutal">
          <div className="p-4 border-b-2 border-black">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              <h2 className="font-bold">快捷操作</h2>
            </div>
          </div>
          <div className="p-4 grid grid-cols-2 gap-3">
            <a 
              href="/admin/tools"
              className="p-4 bg-gray-50 border-2 border-black text-center
                       hover:bg-brutal-yellow hover:shadow-brutal-sm transition-all"
            >
              <Wrench className="w-6 h-6 mx-auto mb-2" />
              <span className="font-medium">添加工具</span>
            </a>
            <a 
              href="/admin/categories"
              className="p-4 bg-gray-50 border-2 border-black text-center
                       hover:bg-brutal-yellow hover:shadow-brutal-sm transition-all"
            >
              <FolderOpen className="w-6 h-6 mx-auto mb-2" />
              <span className="font-medium">添加分类</span>
            </a>
            <a 
              href="/admin/config"
              className="p-4 bg-gray-50 border-2 border-black text-center
                       hover:bg-brutal-yellow hover:shadow-brutal-sm transition-all"
            >
              <Settings className="w-6 h-6 mx-auto mb-2" />
              <span className="font-medium">网站配置</span>
            </a>
            <a 
              href="/"
              target="_blank"
              className="p-4 bg-gray-50 border-2 border-black text-center
                       hover:bg-brutal-yellow hover:shadow-brutal-sm transition-all"
            >
              <Eye className="w-6 h-6 mx-auto mb-2" />
              <span className="font-medium">查看前台</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
