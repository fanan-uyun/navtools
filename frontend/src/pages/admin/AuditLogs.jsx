import { useEffect, useState } from 'react'
import { Search, Filter, Calendar } from 'lucide-react'
import { api } from '../../contexts/AuthContext.jsx'
import { formatDate } from '../../lib/utils.js'

function AuditLogs() {
  const [logs, setLogs] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState({
    action: '',
    target_type: '',
    admin_id: '',
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [actionTypes, setActionTypes] = useState([])
  const [targetTypes, setTargetTypes] = useState([])

  useEffect(() => {
    fetchLogs()
    fetchFilterOptions()
  }, [currentPage, filters])

  const fetchLogs = async () => {
    try {
      const params = new URLSearchParams({ page: currentPage, page_size: 20 })
      if (filters.action) params.append('action', filters.action)
      if (filters.target_type) params.append('target_type', filters.target_type)

      const response = await api.get(`/admin/audit-logs?${params}`)
      setLogs(response.data.data.items)
      setTotalPages(Math.ceil(response.data.data.total / 20))
    } catch (error) {
      console.error('Failed to fetch logs:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchFilterOptions = async () => {
    try {
      const [actionsRes, targetsRes] = await Promise.all([
        api.get('/admin/audit-logs/actions'),
        api.get('/admin/audit-logs/target-types'),
      ])
      setActionTypes(actionsRes.data.data)
      setTargetTypes(targetsRes.data.data)
    } catch (error) {
      console.error('Failed to fetch filter options:', error)
    }
  }

  const getActionLabel = (action) => {
    const labels = {
      create: '创建',
      update: '更新',
      delete: '删除',
      login: '登录',
      logout: '登出',
    }
    return labels[action] || action
  }

  const getTargetLabel = (type) => {
    const labels = {
      tool: '工具',
      category: '分类',
      admin: '管理员',
      config: '配置',
    }
    return labels[type] || type
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">审计日志</h1>

      {/* Filters */}
      <div className="bg-white border-2 border-black p-4 mb-4 shadow-brutal flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4" />
          <span className="font-medium">操作:</span>
          <select
            value={filters.action}
            onChange={(e) => setFilters({ ...filters, action: e.target.value })}
            className="px-3 py-1.5 border-2 border-black bg-white"
          >
            <option value="">全部</option>
            {actionTypes.map(type => (
              <option key={type} value={type}>{getActionLabel(type)}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-medium">目标:</span>
          <select
            value={filters.target_type}
            onChange={(e) => setFilters({ ...filters, target_type: e.target.value })}
            className="px-3 py-1.5 border-2 border-black bg-white"
          >
            <option value="">全部</option>
            {targetTypes.map(type => (
              <option key={type} value={type}>{getTargetLabel(type)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border-2 border-black shadow-brutal overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100 border-b-2 border-black">
            <tr>
              <th className="p-3 text-left">时间</th>
              <th className="p-3 text-left">管理员</th>
              <th className="p-3 text-left">操作</th>
              <th className="p-3 text-left">目标</th>
              <th className="p-3 text-left">详情</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="p-8 text-center">加载中...</td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500">暂无日志</td>
              </tr>
            ) : (
              logs.map(log => (
                <tr key={log.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="p-3 text-sm">
                    {formatDate(log.created_at)}
                  </td>
                  <td className="p-3">
                    {log.admin_username || <span className="text-gray-400">-</span>}
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-1 text-xs border-2 border-black ${
                      log.action === 'delete' ? 'bg-red-100' :
                      log.action === 'create' ? 'bg-green-100' :
                      log.action === 'login' ? 'bg-blue-100' :
                      'bg-gray-100'
                    }`}>
                      {getActionLabel(log.action)}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className="text-sm">
                      {getTargetLabel(log.target_type)}
                      {log.target_id && <span className="text-gray-400"> #{log.target_id}</span>}
                    </span>
                  </td>
                  <td className="p-3 text-sm text-gray-600 max-w-md truncate">
                    {log.details || '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-10 h-10 border-2 border-black font-medium transition-all ${
                currentPage === page 
                  ? 'bg-brutal-yellow shadow-brutal-sm' 
                  : 'bg-white hover:shadow-brutal-sm'
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default AuditLogs
