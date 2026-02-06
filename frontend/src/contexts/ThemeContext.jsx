import { createContext, useContext, useState, useEffect } from 'react'

const themes = [
  { id: 'brutalism', name: '经典粗野', color: '#FFD700' },
  { id: 'dark', name: '现代深色', color: '#6366f1' },
  { id: 'minimal', name: '极简白色', color: '#171717' },
  { id: 'cyberpunk', name: '赛博朋克', color: '#00ff41' },
  { id: 'nature', name: '自然绿色', color: '#22c55e' },
  { id: 'ocean', name: '海洋蓝色', color: '#0ea5e9' },
  { id: 'sunset', name: '日落橙色', color: '#f97316' },
  { id: 'sakura', name: '樱花粉色', color: '#ec4899' },
]

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [currentTheme, setCurrentTheme] = useState('brutalism')
  const [themeEnabled, setThemeEnabled] = useState(true)

  useEffect(() => {
    // Load theme from localStorage
    const savedTheme = localStorage.getItem('navtools_theme')
    const savedEnabled = localStorage.getItem('navtools_theme_enabled')
    
    if (savedTheme) {
      setCurrentTheme(savedTheme)
    }
    if (savedEnabled !== null) {
      setThemeEnabled(savedEnabled === 'true')
    }
  }, [])

  useEffect(() => {
    // Apply theme class to document
    document.documentElement.setAttribute('data-theme', currentTheme)
    localStorage.setItem('navtools_theme', currentTheme)
  }, [currentTheme])

  const setTheme = (themeId) => {
    if (themes.find(t => t.id === themeId)) {
      setCurrentTheme(themeId)
    }
  }

  const toggleThemeEnabled = (enabled) => {
    setThemeEnabled(enabled)
    localStorage.setItem('navtools_theme_enabled', enabled.toString())
  }

  const value = {
    currentTheme,
    themes,
    themeEnabled,
    setTheme,
    toggleThemeEnabled,
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
