import { cn } from '../lib/utils'

function CategoryTag({ category, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-3 py-1.5 border-2 border-black text-sm font-medium transition-all',
        isActive 
          ? 'shadow-brutal-sm' 
          : 'bg-white hover:shadow-brutal-sm hover:-translate-x-0.5 hover:-translate-y-0.5'
      )}
      style={{
        backgroundColor: isActive ? category.color : 'white',
      }}
    >
      {category.icon && <span className="mr-1">{category.icon}</span>}
      {category.name}
      <span className="ml-1.5 text-xs opacity-70">({category.tool_count})</span>
    </button>
  )
}

export default CategoryTag
