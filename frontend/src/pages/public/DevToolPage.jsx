import { useState } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  ExternalLink, 
  Wrench, 
  Copy, 
  Check,
  Download,
  RefreshCw
} from 'lucide-react'
import { api } from '../contexts/AuthContext.jsx'
import ThemeToggle from '../components/ThemeToggle.jsx'

// 公众号文章提取工具
function WeChatExtractor() {
  const [url, setUrl] = useState('')
  const [content, setContent] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleExtract = async () => {
    if (!url) return
    setIsLoading(true)
    try {
      const response = await api.post('/devtools/wechat-extract', { url })
      setContent(response.data.data.content)
    } catch (error) {
      alert('提取失败: ' + (error.response?.data?.message || '未知错误'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'article.md'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col">
      {/* Toolbar */}
      <div className="bg-white border-b-2 border-black p-4 flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[300px] flex gap-2">
          <input
            type="url"
            placeholder="粘贴公众号文章链接..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1 px-4 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-brutal-yellow"
          />
          <button
            onClick={handleExtract}
            disabled={isLoading || !url}
            className="btn-brutal flex items-center gap-2 disabled:opacity-50"
          >
            {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
            提取
          </button>
        </div>
        
        {content && (
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="btn-brutal-secondary flex items-center gap-2"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? '已复制' : '复制'}
            </button>
            <button
              onClick={handleDownload}
              className="btn-brutal-secondary flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              下载
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {content ? (
          <div className="h-full grid grid-cols-2 divide-x-2 divide-black">
            {/* Raw Markdown */}
            <div className="h-full overflow-auto p-4 bg-gray-50">
              <h3 className="text-sm font-bold text-gray-500 mb-2">Markdown</h3>
              <pre className="font-mono text-sm whitespace-pre-wrap">{content}</pre>
            </div>
            {/* Preview */}
            <div className="h-full overflow-auto p-4">
              <h3 className="text-sm font-bold text-gray-500 mb-2">预览</h3>
              <div 
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ 
                  __html: content
                    .replace(/# (.*)/, '<h1 class="text-3xl font-bold mb-4">$1</h1>')
                    .replace(/## (.*)/g, '<h2 class="text-2xl font-bold mt-6 mb-3">$1</h2>')
                    .replace(/### (.*)/g, '<h3 class="text-xl font-bold mt-4 mb-2">$1</h3>')
                    .replace(/\n\n/g, '</p><p class="mb-4">')
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em>$1</em>')
                }}
              />
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400">
            <div className="text-center">
              <Wrench className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>输入公众号文章链接，点击提取</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// JSON 格式化工具
function JsonFormatter() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState('format') // format, minify, escape
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const processJson = () => {
    setError('')
    if (!input.trim()) {
      setOutput('')
      return
    }

    try {
      let parsed = JSON.parse(input)
      let result = ''

      switch (mode) {
        case 'format':
          result = JSON.stringify(parsed, null, 2)
          break
        case 'minify':
          result = JSON.stringify(parsed)
          break
        case 'escape':
          result = JSON.stringify(JSON.stringify(parsed))
          break
        case 'unescape':
          if (typeof parsed === 'string') {
            result = JSON.parse(parsed)
            result = JSON.stringify(result, null, 2)
          } else {
            result = JSON.stringify(parsed, null, 2)
          }
          break
        default:
          result = JSON.stringify(parsed, null, 2)
      }

      setOutput(result)
    } catch (e) {
      setError('无效的 JSON: ' + e.message)
      setOutput('')
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      setInput(event.target.result)
    }
    reader.readAsText(file)
  }

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col">
      {/* Toolbar */}
      <div className="bg-white border-b-2 border-black p-4 flex flex-wrap items-center gap-4">
        <div className="flex gap-1">
          {[
            { id: 'format', label: '格式化' },
            { id: 'minify', label: '压缩' },
            { id: 'escape', label: '转义' },
            { id: 'unescape', label: '反转义' },
          ].map(m => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`px-3 py-1.5 border-2 border-black text-sm font-medium transition-all ${
                mode === m.id 
                  ? 'bg-brutal-yellow shadow-brutal-sm' 
                  : 'bg-white hover:shadow-brutal-sm'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2 ml-auto">
          <label className="btn-brutal-secondary cursor-pointer">
            <span>上传</span>
            <input
              type="file"
              accept=".json,.txt"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
          <button
            onClick={processJson}
            className="btn-brutal"
          >
            处理
          </button>
          {output && (
            <button
              onClick={handleCopy}
              className="btn-brutal-secondary flex items-center gap-2"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? '已复制' : '复制'}
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 grid grid-cols-2 divide-x-2 divide-black">
        <div className="h-full flex flex-col">
          <div className="bg-gray-100 px-4 py-2 border-b-2 border-black">
            <span className="font-bold text-sm">输入</span>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="在此粘贴 JSON..."
            className="flex-1 p-4 font-mono text-sm resize-none focus:outline-none"
          />
        </div>
        <div className="h-full flex flex-col">
          <div className="bg-gray-100 px-4 py-2 border-b-2 border-black flex items-center justify-between">
            <span className="font-bold text-sm">输出</span>
            {error && <span className="text-red-500 text-sm">{error}</span>}
          </div>
          <textarea
            value={output}
            readOnly
            placeholder="结果将显示在这里..."
            className="flex-1 p-4 font-mono text-sm resize-none focus:outline-none bg-gray-50"
          />
        </div>
      </div>
    </div>
  )
}

// 工具路由
const tools = {
  'wechat-extractor': { name: '公众号文章提取', component: WeChatExtractor },
  'json-formatter': { name: 'JSON 格式化', component: JsonFormatter },
}

function DevToolPage() {
  const { slug } = useParams()
  const tool = tools[slug]

  if (!tool) {
    return <Navigate to="/" replace />
  }

  const ToolComponent = tool.component

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
            <div>
              <h1 className="text-xl font-bold">{tool.name}</h1>
              <span className="text-sm text-gray-600">NavTools</span>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Tool Content */}
      <ToolComponent />
    </div>
  )
}

export default DevToolPage
