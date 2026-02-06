import { useState } from 'react'
import { Palette, X } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
import { cn } from '../lib/utils'

function ThemeToggle() {
  const [isOpen, setIsOpen] = useState(false)
  const { currentTheme, themes, themeEnabled, setTheme, toggleThemeEnabled } = useTheme()

  if (!themeEnabled) return null

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white border-2 border-black 
                   shadow-brutal-sm hover:shadow-brutal transition-all"
      >
        <Palette className="w-5 h-5" />
        <span className="hidden sm:inline text-sm font-medium">主题</span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 w-48 bg-white border-2 border-black 
                          shadow-brutal-lg z-50 animate-fade-in">
            <div className="flex items-center justify-between p-3 border-b-2 border-black">
              <span className="font-bold text-sm">选择主题</span>
              <button onClick={() => setIsOpen(false)}>
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-2 space-y-1">
              {themes.map(theme => (
                <button
                  key={theme.id}
                  onClick={() => {
                    setTheme(theme.id)
                    setIsOpen(false)
                  }}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2 text-left text-sm 
                     border-2 border-transparent hover:border-black transition-all',
                    currentTheme === theme.id 
                      ? 'bg-gray-100 border-black shadow-brutal-sm' 
                      : 'hover:bg-gray-50'
                  )}
                >
                  <span 
                    className="w-4 h-4 border border-black"
                    style={{ backgroundColor: theme.color }}
                  />
                  <span>{theme.name}</span>
                  {currentTheme === theme.id && (
                    <span className="ml-auto text-xs">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default ThemeToggle
