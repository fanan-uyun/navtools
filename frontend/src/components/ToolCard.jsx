import { Wrench, ExternalLink } from 'lucide-react'
import { cn } from '../lib/utils'

function ToolCard({ tool, featured = false }) {
  const handleClick = () => {
    if (tool.is_self_developed && tool.api_endpoint) {
      window.location.href = `/dev/${tool.slug}`
    } else {
      window.open(tool.url, '_blank')
    }
  }

  return (
    <div
      onClick={handleClick}
      className={cn(
        'group cursor-pointer bg-white border-2 border-black transition-all duration-200',
        'hover:shadow-brutal-hover hover:-translate-x-0.5 hover:-translate-y-0.5',
        featured ? 'p-4' : 'p-3'
      )}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div 
          className="flex-shrink-0 w-12 h-12 flex items-center justify-center border-2 border-black"
          style={{ backgroundColor: tool.category?.color || '#FFD700' }}
        >
          {tool.icon ? (
            <span className="text-2xl">{tool.icon}</span>
          ) : (
            <Wrench className="w-6 h-6 text-black" />
          )}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className={cn(
              'font-bold truncate',
              featured ? 'text-lg' : 'text-base'
            )}>
              {tool.name}
            </h3>
            {tool.is_self_developed && (
              <span className="px-1.5 py-0.5 bg-brutal-yellow border border-black text-xs font-medium">
                自研
              </span>
            )}
          </div>
          
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
            {tool.short_description || '暂无描述'}
          </p>
          
          <div className="flex items-center gap-2 mt-2">
            <span 
              className="text-xs px-2 py-0.5 border border-black"
              style={{ 
                backgroundColor: tool.category?.color + '20' || '#FFD70020',
                borderColor: tool.category?.color || '#FFD700'
              }}
            >
              {tool.category?.name || '未分类'}
            </span>
            
            {!tool.is_self_developed && (
              <ExternalLink className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ToolCard
