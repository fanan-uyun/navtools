import { useState, useEffect } from 'react'
import { Search, Wrench, Grid3X3, Star, TrendingUp } from 'lucide-react'
import { api } from '../contexts/AuthContext'
import ToolCard from '../components/ToolCard'
import CategoryTag from '../components/CategoryTag'
import ThemeToggle from '../components/ThemeToggle'
import { cn } from '../lib/utils'

function Home() {
  const [siteConfig, setSiteConfig] = useState(null)
  const [categories, setCategories] = useState([])
  const [featuredTools, setFeaturedTools] = useState([])
  const [recentTools, setRecentTools] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchHomeData()
  }, [])

  const fetchHomeData = async () => {
    try {
      const response = await api.get('/api/home')
      const { site_config, categories, featured_tools, recent_tools } = response.data.data
      
      setSiteConfig(site_config)
      setCategories(categories)
      setFeaturedTools(featured_tools)
      setRecentTools(recent_tools)
    } catch (error) {
      console.error('Failed to fetch home data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredTools = selectedCategory
    ? recentTools.filter(t => t.category.slug === selectedCategory)
    : recentTools

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-2xl font-mono font-bold">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b-4 border-black bg-brutal-yellow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wrench className="w-8 h-8" />
            <span className="text-2xl font-bold">{siteConfig?.site_name || 'NavTools'}</span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-brutal-black text-white py-20 overflow-hidden">
        {/* Grid Background */}
        <div className="absolute inset-0 bg-grid opacity-20" />
        
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            {siteConfig?.site_name || 'NavTools'}
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            {siteConfig?.site_description || '实用工具集合网站'}
          </p>
          
          {/* Search Box */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="搜索工具..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-6 py-4 bg-white text-black text-lg border-4 border-brutal-yellow 
                         focus:outline-none focus:ring-4 focus:ring-brutal-yellow/50"
              />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-black" />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Tools */}
      {featuredTools.length > 0 && (
        <section className="py-12 bg-gray-50 border-b-4 border-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 mb-6">
              <Star className="w-6 h-6 text-brutal-yellow fill-brutal-yellow" />
              <h2 className="text-2xl font-bold">精选工具</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {featuredTools.map(tool => (
                <ToolCard key={tool.id} tool={tool} featured />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Categories */}
      <section className="py-8 border-b-4 border-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-4">
            <Grid3X3 className="w-5 h-5" />
            <h2 className="text-xl font-bold">分类浏览</h2>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={cn(
                'px-4 py-2 border-2 border-black font-medium transition-all',
                selectedCategory === null 
                  ? 'bg-brutal-yellow shadow-brutal-sm' 
                  : 'bg-white hover:shadow-brutal-sm'
              )}
            >
              全部
            </button>
            {categories.map(cat => (
              <CategoryTag
                key={cat.id}
                category={cat}
                isActive={selectedCategory === cat.slug}
                onClick={() => setSelectedCategory(cat.slug === selectedCategory ? null : cat.slug)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* All Tools */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5" />
            <h2 className="text-xl font-bold">
              {selectedCategory ? '分类工具' : '最近添加'}
            </h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredTools.map(tool => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
          
          {filteredTools.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              暂无工具
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-brutal-black text-white py-8 border-t-4 border-brutal-yellow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Wrench className="w-6 h-6 text-brutal-yellow" />
              <span className="font-bold">{siteConfig?.site_name || 'NavTools'}</span>
            </div>
            
            <div className="text-sm text-gray-400">
              {siteConfig?.icp_beian && (
                <span className="mr-4">{siteConfig.icp_beian}</span>
              )}
              {siteConfig?.gongan_beian && (
                <span>{siteConfig.gongan_beian}</span>
              )}
            </div>
            
            <div className="text-sm text-gray-400">
              © 2024 {siteConfig?.site_name || 'NavTools'}. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home
