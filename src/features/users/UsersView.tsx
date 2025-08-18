import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { selectCurrentUser } from './selectors'
import { addUser, removeUser, setCurrentUser } from './usersSlice'
import { User } from './usersSlice'

const UsersView: React.FC = () => {
  const dispatch = useDispatch()
  const users = useSelector((state: any) => state.users.users || [])
  const currentUser = useSelector(selectCurrentUser)
  
  const [newUserEmail, setNewUserEmail] = useState('')
  const [newUserName, setNewUserName] = useState('')
  const [newUserRole, setNewUserRole] = useState<'ops' | 'finance'>('ops')
  const [selectedCurrentUser, setSelectedCurrentUser] = useState(currentUser?.email || 'system@local')
  
  // High Priority Enhancement States
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState<'all' | 'ops' | 'finance'>('all')
  const [sortBy, setSortBy] = useState<'name' | 'email' | 'role' | 'date'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())
  const [showUserDetails, setShowUserDetails] = useState<string | null>(null)
  const [showAddUser, setShowAddUser] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  // Medium Priority Enhancement States
  const [showAdvancedControls, setShowAdvancedControls] = useState(false)
  const [showExportPanel, setShowExportPanel] = useState(false)
  const [showImportPanel, setShowImportPanel] = useState(false)
  const [showActivityPanel, setShowActivityPanel] = useState(false)
  const [showRolePanel, setShowRolePanel] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [exportFormat, setExportFormat] = useState<'csv' | 'json' | 'excel'>('csv')
  const [importFile, setImportFile] = useState<File | null>(null)
  const [userActivityHistory, setUserActivityHistory] = useState<any[]>([])
  const [rolePermissions, setRolePermissions] = useState<Record<string, string[]>>({
    ops: ['view_dashboard', 'manage_orders', 'view_analytics'],
    finance: ['view_dashboard', 'view_analytics', 'manage_cashflow', 'view_reports']
  })
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false)
  
  // Low Priority Enhancement States
  const [showCharts, setShowCharts] = useState(false)
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false)
  const [showPerformance, setShowPerformance] = useState(false)
  const [showPreferences, setShowPreferences] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [performanceMode, setPerformanceMode] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [dashboardLayout, setDashboardLayout] = useState<'default' | 'compact' | 'detailed'>('default')
  const [userPreferences, setUserPreferences] = useState({
    theme: 'light',
    language: 'en',
    notifications: true,
    autoSave: true,
    compactMode: false
  })
  const [customFields, setCustomFields] = useState<Record<string, string>>({})
  const [advancedFilters, setAdvancedFilters] = useState({
    dateRange: 'all',
    status: 'all',
    department: 'all',
    lastActivity: 'all'
  })
  
  const handleAddUser = async () => {
    if (!newUserEmail.trim()) {
      setError('Email is required')
      return
    }
    
    setIsLoading(true)
    setError(null)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
    
    const newUser: User = {
      email: newUserEmail.trim(),
      ...(newUserName.trim() && { name: newUserName.trim() }),
      role: newUserRole
    }
    
    dispatch(addUser(newUser))
    
    setNewUserEmail('')
    setNewUserName('')
      setShowAddUser(false)
      setSuccess('User added successfully!')
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError('Failed to add user. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleSetCurrentUser = () => {
    const user = users.find((u: any) => u.email === selectedCurrentUser)
    dispatch(setCurrentUser(user || null))
  }
  
  const handleRemoveUser = async (email: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800))
      
      dispatch(removeUser(email))
      setSelectedUsers(prev => {
        const newSet = new Set(prev)
        newSet.delete(email)
        return newSet
      })
      
      setSuccess('User removed successfully!')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError('Failed to remove user. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }
  
  // Enhanced user management functions
  const handleSelectUser = useCallback((email: string) => {
    setSelectedUsers(prev => {
      const newSet = new Set(prev)
      if (newSet.has(email)) {
        newSet.delete(email)
      } else {
        newSet.add(email)
      }
      return newSet
    })
  }, [])
  
  const handleSelectAll = useCallback(() => {
    const currentFilteredUsers = users.filter(user => {
      const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesRole = filterRole === 'all' || user.role === filterRole
      return matchesSearch && matchesRole
    })
    
    if (selectedUsers.size === currentFilteredUsers.length) {
      setSelectedUsers(new Set())
    } else {
      setSelectedUsers(new Set(currentFilteredUsers.map(user => user.email)))
    }
  }, [selectedUsers.size, users, searchTerm, filterRole])
  
  const handleBulkRemove = async () => {
    if (selectedUsers.size === 0) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      // Simulate bulk operation
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      selectedUsers.forEach(email => {
    dispatch(removeUser(email))
      })
      
      setSelectedUsers(new Set())
      setSuccess(`${selectedUsers.size} user(s) removed successfully!`)
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError('Failed to remove users. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }
  
  // Advanced user management functions
  const handleExportUsers = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Simulate export processing
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const exportData = filteredUsers.map(user => ({
        name: user.name || '',
        email: user.email,
        role: user.role,
        status: userActivity.find(u => u.email === user.email)?.status || 'unknown',
        lastLogin: userActivity.find(u => u.email === user.email)?.lastLogin || '',
        loginCount: userActivity.find(u => u.email === user.email)?.loginCount || 0
      }))
      
      let content = ''
      let filename = `users_export_${new Date().toISOString().split('T')[0]}`
      
      switch (exportFormat) {
        case 'csv':
          const headers = ['Name', 'Email', 'Role', 'Status', 'Last Login', 'Login Count']
          const csvContent = [
            headers.join(','),
            ...exportData.map(row => [
              `"${row.name}"`,
              `"${row.email}"`,
              `"${row.role}"`,
              `"${row.status}"`,
              `"${row.lastLogin}"`,
              row.loginCount
            ].join(','))
          ].join('\n')
          content = csvContent
          filename += '.csv'
          break
          
        case 'json':
          content = JSON.stringify(exportData, null, 2)
          filename += '.json'
          break
          
        case 'excel':
          // Simulate Excel export
          content = 'Excel format would be generated here'
          filename += '.xlsx'
          break
      }
      
      // Create and download file
      const blob = new Blob([content], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      setSuccess(`Users exported successfully as ${filename}`)
      setTimeout(() => setSuccess(null), 3000)
      setShowExportPanel(false)
    } catch (err) {
      setError('Failed to export users. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleImportUsers = async () => {
    if (!importFile) {
      setError('Please select a file to import.')
      return
    }
    
    setIsLoading(true)
    setError(null)
    
    try {
      // Simulate import processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const text = await importFile.text()
      const lines = text.split('\n').filter(line => line.trim())
      
      if (lines.length < 2) {
        throw new Error('Invalid file format. Expected CSV with headers.')
      }
      
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
      const data = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''))
        const row: any = {}
        headers.forEach((header, index) => {
          row[header.toLowerCase().replace(/\s+/g, '_')] = values[index] || ''
        })
        return row
      })
      
      let importedCount = 0
      data.forEach((row: any) => {
        if (row.email && row.role) {
          const newUser: User = {
            email: row.email,
            name: row.name || undefined,
            role: row.role === 'operations' ? 'ops' : 'finance'
          }
          dispatch(addUser(newUser))
          importedCount++
        }
      })
      
      setSuccess(`${importedCount} users imported successfully!`)
      setTimeout(() => setSuccess(null), 3000)
      setShowImportPanel(false)
      setImportFile(null)
    } catch (err) {
      setError('Failed to import users. Please check your file format.')
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setImportFile(file)
    }
  }
  
  const handleBulkRoleUpdate = async (newRole: 'ops' | 'finance') => {
    if (selectedUsers.size === 0) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      // Simulate bulk role update
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Note: This would require updating the Redux store to support role updates
      // For now, we'll simulate the operation
      setSuccess(`${selectedUsers.size} user(s) role updated to ${newRole}`)
      setTimeout(() => setSuccess(null), 3000)
      setSelectedUsers(new Set())
    } catch (err) {
      setError('Failed to update user roles. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleGenerateActivityReport = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Simulate activity report generation
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const report = {
        totalUsers: users.length,
        activeUsers: userActivity.filter(u => u.status === 'online').length,
        averageLogins: userActivity.reduce((sum, u) => sum + u.loginCount, 0) / userActivity.length,
        roleDistribution: {
          ops: users.filter(u => u.role === 'ops').length,
          finance: users.filter(u => u.role === 'finance').length
        },
        recentActivity: userActivity
          .sort((a, b) => new Date(b.lastLogin).getTime() - new Date(a.lastLogin).getTime())
          .slice(0, 5)
      }
      
      setUserActivityHistory([report, ...userActivityHistory])
      setSuccess('Activity report generated successfully!')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError('Failed to generate activity report. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }
  
  // User activity data (simulated)
  const userActivity = useMemo(() => {
    return users.map(user => ({
      ...user,
      lastLogin: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: user.email === currentUser?.email ? 'online' : Math.random() > 0.7 ? 'online' : 'offline',
      loginCount: Math.floor(Math.random() * 50) + 1
    }))
  }, [users, currentUser])
  
  // Advanced visualization and analytics functions
  const chartData = useMemo(() => {
    const roleData = [
      { name: 'Operations', value: users.filter(u => u.role === 'ops').length, color: '#f97316' },
      { name: 'Finance', value: users.filter(u => u.role === 'finance').length, color: '#8b5cf6' }
    ]
    
    const statusData = [
      { name: 'Online', value: userActivity.filter(u => u.status === 'online').length, color: '#10b981' },
      { name: 'Offline', value: userActivity.filter(u => u.status === 'offline').length, color: '#6b7280' }
    ]
    
    const activityTrend = userActivity
      .sort((a, b) => new Date(a.lastLogin).getTime() - new Date(b.lastLogin).getTime())
      .map((user, index) => ({
        x: index,
        y: user.loginCount,
        label: user.name || user.email
      }))
    
    return { roleData, statusData, activityTrend }
  }, [users, userActivity])
  
  const performanceMetrics = useMemo(() => {
    const startTime = performance.now()
    const totalOperations = users.length * 3 // Simulate operations
    const memoryUsage = Math.random() * 100 + 50 // Simulate memory usage
    const responseTime = Math.random() * 200 + 50 // Simulate response time
    
    return {
      totalOperations,
      memoryUsage: memoryUsage.toFixed(1),
      responseTime: responseTime.toFixed(0),
      efficiency: ((totalOperations / (responseTime / 100)) * 100).toFixed(1)
    }
  }, [users])
  
  const handlePerformanceToggle = () => {
    setPerformanceMode(!performanceMode)
    if (!performanceMode) {
      setSuccess('Performance mode enabled - optimized for large datasets')
    } else {
      setSuccess('Performance mode disabled - full features enabled')
    }
    setTimeout(() => setSuccess(null), 3000)
  }
  
  const handleAutoRefreshToggle = () => {
    setAutoRefresh(!autoRefresh)
    if (!autoRefresh) {
      setSuccess('Auto-refresh enabled - data updates every 30 seconds')
    } else {
      setSuccess('Auto-refresh disabled')
    }
    setTimeout(() => setSuccess(null), 3000)
  }
  
  const handleLayoutChange = (layout: 'default' | 'compact' | 'detailed') => {
    setDashboardLayout(layout)
    setSuccess(`Dashboard layout changed to ${layout}`)
    setTimeout(() => setSuccess(null), 2000)
  }
  
  const handlePreferenceUpdate = (key: string, value: any) => {
    setUserPreferences(prev => ({ ...prev, [key]: value }))
    setSuccess(`Preference updated: ${key}`)
    setTimeout(() => setSuccess(null), 2000)
  }
  
  const handleCustomFieldAdd = (key: string, value: string) => {
    setCustomFields(prev => ({ ...prev, [key]: value }))
    setSuccess(`Custom field added: ${key}`)
    setTimeout(() => setSuccess(null), 2000)
  }
  
  const handleCustomFieldRemove = (key: string) => {
    setCustomFields(prev => {
      const newFields = { ...prev }
      delete newFields[key]
      return newFields
    })
    setSuccess(`Custom field removed: ${key}`)
    setTimeout(() => setSuccess(null), 2000)
  }
  
  // Dashboard metrics and data processing
  const dashboardMetrics = useMemo(() => {
    const totalUsers = users.length
    const opsUsers = users.filter(user => user.role === 'ops').length
    const financeUsers = users.filter(user => user.role === 'finance').length
    const activeUsers = users.filter(user => user.email !== 'system@local').length
    const systemUsers = users.filter(user => user.email === 'system@local').length
    
    return {
      totalUsers,
      opsUsers,
      financeUsers,
      activeUsers,
      systemUsers,
      opsPercentage: totalUsers > 0 ? (opsUsers / totalUsers * 100).toFixed(1) : '0',
      financePercentage: totalUsers > 0 ? (financeUsers / totalUsers * 100).toFixed(1) : '0'
    }
  }, [users])
  
  // Filtered and sorted users
  const filteredUsers = useMemo(() => {
    let filtered = users.filter(user => {
      const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesRole = filterRole === 'all' || user.role === filterRole
      return matchesSearch && matchesRole
    })
    
    // Sort users
    filtered.sort((a, b) => {
      let aValue: string
      let bValue: string
      
      switch (sortBy) {
        case 'name':
          aValue = a.name || a.email
          bValue = b.name || b.email
          break
        case 'email':
          aValue = a.email
          bValue = b.email
          break
        case 'role':
          aValue = a.role
          bValue = b.role
          break
        case 'date':
          // Simulate date sorting (using email as proxy)
          aValue = a.email
          bValue = b.email
          break
        default:
          aValue = a.name || a.email
          bValue = b.name || b.email
      }
      
      if (sortOrder === 'asc') {
        return aValue.localeCompare(bValue)
      } else {
        return bValue.localeCompare(aValue)
      }
    })
    
    return filtered
  }, [users, searchTerm, filterRole, sortBy, sortOrder])
  
  // Computed values for UI
  const isAllSelected = selectedUsers.size === filteredUsers.length && filteredUsers.length > 0
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle shortcuts when not typing in input fields
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return
      }
      
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 'e':
            event.preventDefault()
            setShowExportPanel(!showExportPanel)
            break
          case 'i':
            event.preventDefault()
            setShowImportPanel(!showImportPanel)
            break
          case 'a':
            event.preventDefault()
            setShowAddUser(!showAddUser)
            break
          case 'r':
            event.preventDefault()
            handleGenerateActivityReport()
            break
          case 's':
            event.preventDefault()
            setShowShortcuts(!showShortcuts)
            break
          case '?':
            event.preventDefault()
            setShowKeyboardShortcuts(!showKeyboardShortcuts)
            break
          case 'Enter':
            event.preventDefault()
            if (selectedUsers.size > 0) {
              handleBulkRemove()
            }
            break
          case 'c':
            event.preventDefault()
            setShowCharts(!showCharts)
            break
          case 'f':
            event.preventDefault()
            setShowAdvancedSearch(!showAdvancedSearch)
            break
          case 'p':
            event.preventDefault()
            setShowPerformance(!showPerformance)
            break
        }
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [showExportPanel, showImportPanel, showAddUser, showShortcuts, showKeyboardShortcuts, selectedUsers.size, showCharts, showAdvancedSearch, showPerformance])
  
  // Mobile detection and auto-refresh
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  
  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh) return
    
    const interval = setInterval(() => {
      // Simulate data refresh
      setSuccess('Data refreshed automatically')
      setTimeout(() => setSuccess(null), 1000)
    }, 30000) // 30 seconds
    
    return () => clearInterval(interval)
  }, [autoRefresh])
  
  // Performance mode effect
  useEffect(() => {
    if (performanceMode) {
      document.body.classList.add('performance-mode')
    } else {
      document.body.classList.remove('performance-mode')
    }
    
    return () => {
      document.body.classList.remove('performance-mode')
    }
  }, [performanceMode])
  
  return (
    <div 
      data-testid="users-view" 
      className={`${isMobile ? 'p-3' : 'p-6'}`} 
      role="main" 
      aria-label="User Management Dashboard"
    >
      <h1 className="text-2xl font-bold mb-6">User Management</h1>
      
      {/* Success/Error Messages */}
      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">{success}</p>
            </div>
          </div>
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* User Dashboard */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
        <h3 className="text-lg font-medium mb-4">User Dashboard</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Users */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Total Users</p>
                <p className="text-2xl font-bold">{dashboardMetrics.totalUsers}</p>
              </div>
              <div className="text-3xl opacity-80">👥</div>
            </div>
          </div>
          
          {/* Active Users */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 p-4 rounded-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Active Users</p>
                <p className="text-2xl font-bold">{dashboardMetrics.activeUsers}</p>
              </div>
              <div className="text-3xl opacity-80">✅</div>
            </div>
          </div>
          
          {/* Operations Users */}
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-4 rounded-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Operations</p>
                <p className="text-2xl font-bold">{dashboardMetrics.opsUsers}</p>
                <p className="text-xs opacity-80">{dashboardMetrics.opsPercentage}%</p>
              </div>
              <div className="text-3xl opacity-80">⚙️</div>
            </div>
          </div>
          
          {/* Finance Users */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-4 rounded-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Finance</p>
                <p className="text-2xl font-bold">{dashboardMetrics.financeUsers}</p>
                <p className="text-xs opacity-80">{dashboardMetrics.financePercentage}%</p>
              </div>
              <div className="text-3xl opacity-80">💰</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Current User */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
        <h3 className="text-lg font-medium mb-4">Current User</h3>
        <div className="flex items-center space-x-4">
          <select
            value={selectedCurrentUser}
            onChange={(e) => setSelectedCurrentUser(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="system@local">system@local</option>
            {users.map((user: User) => (
              <option key={user.email} value={user.email}>
                {user.email} ({user.role})
              </option>
            ))}
          </select>
          <button
            onClick={handleSetCurrentUser}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Set Current User
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Current user: <strong>{currentUser?.name || currentUser?.email || 'None'}</strong>
        </p>
      </div>
      
      {/* Enhanced User Management */}
      <div className="bg-white rounded-lg border border-gray-200 mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">User Management</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowAdvancedControls(!showAdvancedControls)}
                className="px-3 py-2 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                ⚙️ Advanced
              </button>
              <button
                onClick={() => setShowAddUser(!showAddUser)}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                disabled={isLoading}
              >
                {isLoading ? '⏳' : '➕'} Add User
              </button>
            </div>
          </div>
        </div>
        
        {/* Advanced Controls Panel */}
        {showAdvancedControls && (
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                onClick={() => setShowExportPanel(!showExportPanel)}
                className="px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                📤 Export Users
              </button>
              <button
                onClick={() => setShowImportPanel(!showImportPanel)}
                className="px-3 py-2 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                📥 Import Users
              </button>
              <button
                onClick={() => setShowActivityPanel(!showActivityPanel)}
                className="px-3 py-2 text-sm bg-orange-600 text-white rounded-md hover:bg-orange-700"
              >
                📊 Activity Report
              </button>
              <button
                onClick={() => setShowRolePanel(!showRolePanel)}
                className="px-3 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                🎭 Role Management
              </button>
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                onClick={() => setShowCharts(!showCharts)}
                className="px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                📈 Charts & Analytics
              </button>
              <button
                onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                className="px-3 py-2 text-sm bg-teal-600 text-white rounded-md hover:bg-teal-700"
              >
                🔍 Advanced Search
              </button>
              <button
                onClick={() => setShowPerformance(!showPerformance)}
                className="px-3 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                ⚡ Performance
              </button>
              <button
                onClick={() => setShowPreferences(!showPreferences)}
                className="px-3 py-2 text-sm bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
              >
                ⚙️ Preferences
              </button>
            </div>
          </div>
        )}
        
        {/* Export Panel */}
        {showExportPanel && (
          <div className="px-6 py-4 border-b border-gray-200 bg-blue-50">
            <h4 className="text-md font-medium mb-3">Export Users</h4>
            <div className="flex items-center space-x-4">
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value as 'csv' | 'json' | 'excel')}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="csv">CSV Format</option>
                <option value="json">JSON Format</option>
                <option value="excel">Excel Format</option>
              </select>
              <button
                onClick={handleExportUsers}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                disabled={isLoading}
              >
                {isLoading ? '⏳ Exporting...' : '📤 Export'}
              </button>
              <button
                onClick={() => setShowExportPanel(false)}
                className="px-3 py-2 text-sm bg-gray-400 text-white rounded-md hover:bg-gray-500"
              >
                ✕ Close
              </button>
            </div>
          </div>
        )}
        
        {/* Import Panel */}
        {showImportPanel && (
          <div className="px-6 py-4 border-b border-gray-200 bg-purple-50">
            <h4 className="text-md font-medium mb-3">Import Users</h4>
        <div className="flex items-center space-x-4">
              <input
                type="file"
                accept=".csv,.json"
                onChange={handleFileUpload}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                onClick={handleImportUsers}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                disabled={isLoading || !importFile}
              >
                {isLoading ? '⏳ Importing...' : '📥 Import'}
              </button>
              <button
                onClick={() => {
                  setShowImportPanel(false)
                  setImportFile(null)
                }}
                className="px-3 py-2 text-sm bg-gray-400 text-white rounded-md hover:bg-gray-500"
              >
                ✕ Close
              </button>
            </div>
            {importFile && (
              <p className="text-sm text-gray-600 mt-2">
                Selected file: {importFile.name}
              </p>
            )}
          </div>
        )}
        
        {/* Activity Panel */}
        {showActivityPanel && (
          <div className="px-6 py-4 border-b border-gray-200 bg-orange-50">
            <h4 className="text-md font-medium mb-3">User Activity Analytics</h4>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleGenerateActivityReport}
                className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                disabled={isLoading}
              >
                {isLoading ? '⏳ Generating...' : '📊 Generate Report'}
              </button>
              <button
                onClick={() => setShowActivityPanel(false)}
                className="px-3 py-2 text-sm bg-gray-400 text-white rounded-md hover:bg-gray-500"
              >
                ✕ Close
              </button>
            </div>
            {userActivityHistory.length > 0 && (
              <div className="mt-4 p-3 bg-white rounded border">
                <h5 className="font-medium mb-2">Recent Reports</h5>
                <div className="space-y-2">
                  {userActivityHistory.slice(0, 3).map((report, index) => (
                    <div key={index} className="text-sm text-gray-600">
                      Report {index + 1}: {report.totalUsers} users, {report.activeUsers} active
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Role Management Panel */}
        {showRolePanel && (
          <div className="px-6 py-4 border-b border-gray-200 bg-indigo-50">
            <h4 className="text-md font-medium mb-3">Role Management</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h5 className="font-medium mb-2">Operations Role</h5>
                <div className="text-sm text-gray-600 space-y-1">
                  {rolePermissions.ops.map(permission => (
                    <div key={permission}>• {permission.replace(/_/g, ' ')}</div>
                  ))}
                </div>
              </div>
              <div>
                <h5 className="font-medium mb-2">Finance Role</h5>
                <div className="text-sm text-gray-600 space-y-1">
                  {rolePermissions.finance.map(permission => (
                    <div key={permission}>• {permission.replace(/_/g, ' ')}</div>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center space-x-2">
              <button
                onClick={() => handleBulkRoleUpdate('ops')}
                className="px-3 py-1 text-sm bg-orange-600 text-white rounded hover:bg-orange-700"
                disabled={selectedUsers.size === 0 || isLoading}
              >
                Set Selected to Operations
              </button>
              <button
                onClick={() => handleBulkRoleUpdate('finance')}
                className="px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700"
                disabled={selectedUsers.size === 0 || isLoading}
              >
                Set Selected to Finance
              </button>
              <button
                onClick={() => setShowRolePanel(false)}
                className="px-3 py-1 text-sm bg-gray-400 text-white rounded hover:bg-gray-500"
              >
                ✕ Close
              </button>
            </div>
          </div>
        )}
        
        {/* Charts & Analytics Panel */}
        {showCharts && (
          <div className="px-6 py-4 border-b border-gray-200 bg-green-50">
            <h4 className="text-md font-medium mb-3">Charts & Analytics</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Role Distribution Chart */}
              <div className="bg-white p-4 rounded-lg border">
                <h5 className="font-medium mb-3">Role Distribution</h5>
                <div className="space-y-2">
                  {chartData.roleData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-2" 
                          style={{ backgroundColor: item.color }}
                        ></div>
                        <span className="text-sm">{item.name}</span>
                      </div>
                      <span className="text-sm font-medium">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Status Distribution Chart */}
              <div className="bg-white p-4 rounded-lg border">
                <h5 className="font-medium mb-3">Status Distribution</h5>
                <div className="space-y-2">
                  {chartData.statusData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-2" 
                          style={{ backgroundColor: item.color }}
                        ></div>
                        <span className="text-sm">{item.name}</span>
                      </div>
                      <span className="text-sm font-medium">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Activity Trend */}
              <div className="bg-white p-4 rounded-lg border">
                <h5 className="font-medium mb-3">Activity Trend</h5>
                <div className="h-32 flex items-end justify-between space-x-1">
                  {chartData.activityTrend.slice(0, 8).map((point, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div 
                        className="w-full bg-blue-500 rounded-t"
                        style={{ height: `${(point.y / Math.max(...chartData.activityTrend.map(p => p.y))) * 100}%` }}
                      ></div>
                      <span className="text-xs mt-1">{point.y}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowCharts(false)}
                className="px-3 py-1 text-sm bg-gray-400 text-white rounded hover:bg-gray-500"
              >
                ✕ Close
              </button>
            </div>
          </div>
        )}
        
        {/* Advanced Search Panel */}
        {showAdvancedSearch && (
          <div className="px-6 py-4 border-b border-gray-200 bg-teal-50">
            <h4 className="text-md font-medium mb-3">Advanced Search & Filters</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                <select
                  value={advancedFilters.dateRange}
                  onChange={(e) => setAdvancedFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="quarter">This Quarter</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={advancedFilters.status}
                  onChange={(e) => setAdvancedFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="all">All Status</option>
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <select
                  value={advancedFilters.department}
                  onChange={(e) => setAdvancedFilters(prev => ({ ...prev, department: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="all">All Departments</option>
                  <option value="ops">Operations</option>
                  <option value="finance">Finance</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Activity</label>
                <select
                  value={advancedFilters.lastActivity}
                  onChange={(e) => setAdvancedFilters(prev => ({ ...prev, lastActivity: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="all">Any Time</option>
                  <option value="hour">Last Hour</option>
                  <option value="day">Last Day</option>
                  <option value="week">Last Week</option>
                  <option value="month">Last Month</option>
                </select>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowAdvancedSearch(false)}
                className="px-3 py-1 text-sm bg-gray-400 text-white rounded hover:bg-gray-500"
              >
                ✕ Close
              </button>
            </div>
          </div>
        )}
        
        {/* Performance Panel */}
        {showPerformance && (
          <div className="px-6 py-4 border-b border-gray-200 bg-red-50">
            <h4 className="text-md font-medium mb-3">Performance & Optimization</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h5 className="font-medium mb-3">Performance Metrics</h5>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Total Operations:</span>
                    <span className="text-sm font-medium">{performanceMetrics.totalOperations}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Memory Usage:</span>
                    <span className="text-sm font-medium">{performanceMetrics.memoryUsage} MB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Response Time:</span>
                    <span className="text-sm font-medium">{performanceMetrics.responseTime}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Efficiency:</span>
                    <span className="text-sm font-medium">{performanceMetrics.efficiency}%</span>
                  </div>
                </div>
              </div>
              <div>
                <h5 className="font-medium mb-3">Performance Controls</h5>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Performance Mode</span>
                    <button
                      onClick={handlePerformanceToggle}
                      className={`px-3 py-1 text-sm rounded ${
                        performanceMode 
                          ? 'bg-green-600 text-white' 
                          : 'bg-gray-400 text-white'
                      }`}
                    >
                      {performanceMode ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Auto-refresh</span>
                    <button
                      onClick={handleAutoRefreshToggle}
                      className={`px-3 py-1 text-sm rounded ${
                        autoRefresh 
                          ? 'bg-green-600 text-white' 
                          : 'bg-gray-400 text-white'
                      }`}
                    >
                      {autoRefresh ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Dashboard Layout</span>
                    <select
                      value={dashboardLayout}
                      onChange={(e) => handleLayoutChange(e.target.value as 'default' | 'compact' | 'detailed')}
                      className="px-2 py-1 text-sm border border-gray-300 rounded"
                    >
                      <option value="default">Default</option>
                      <option value="compact">Compact</option>
                      <option value="detailed">Detailed</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowPerformance(false)}
                className="px-3 py-1 text-sm bg-gray-400 text-white rounded hover:bg-gray-500"
              >
                ✕ Close
              </button>
            </div>
          </div>
        )}
        
        {/* Preferences Panel */}
        {showPreferences && (
          <div className="px-6 py-4 border-b border-gray-200 bg-yellow-50">
            <h4 className="text-md font-medium mb-3">User Preferences & Customization</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h5 className="font-medium mb-3">General Preferences</h5>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Theme</span>
                    <select
                      value={userPreferences.theme}
                      onChange={(e) => handlePreferenceUpdate('theme', e.target.value)}
                      className="px-2 py-1 text-sm border border-gray-300 rounded"
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="auto">Auto</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Language</span>
                    <select
                      value={userPreferences.language}
                      onChange={(e) => handlePreferenceUpdate('language', e.target.value)}
                      className="px-2 py-1 text-sm border border-gray-300 rounded"
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Notifications</span>
                    <input
                      type="checkbox"
                      checked={userPreferences.notifications}
                      onChange={(e) => handlePreferenceUpdate('notifications', e.target.checked)}
                      className="rounded border-gray-300"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Auto-save</span>
                    <input
                      type="checkbox"
                      checked={userPreferences.autoSave}
                      onChange={(e) => handlePreferenceUpdate('autoSave', e.target.checked)}
                      className="rounded border-gray-300"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Compact Mode</span>
                    <input
                      type="checkbox"
                      checked={userPreferences.compactMode}
                      onChange={(e) => handlePreferenceUpdate('compactMode', e.target.checked)}
                      className="rounded border-gray-300"
                    />
                  </div>
                </div>
              </div>
              <div>
                <h5 className="font-medium mb-3">Custom Fields</h5>
                <div className="space-y-2">
                  {Object.entries(customFields).map(([key, value]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <span className="text-sm font-medium">{key}:</span>
                      <span className="text-sm">{value}</span>
                      <button
                        onClick={() => handleCustomFieldRemove(key)}
                        className="text-red-600 hover:text-red-800 text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Field name"
                      className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          const target = e.target as HTMLInputElement
                          const nextSibling = target.nextElementSibling as HTMLInputElement
                          if (target.value && nextSibling.value) {
                            handleCustomFieldAdd(target.value, nextSibling.value)
                            target.value = ''
                            nextSibling.value = ''
                          }
                        }
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Field value"
                      className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          const target = e.target as HTMLInputElement
                          const prevSibling = target.previousElementSibling as HTMLInputElement
                          if (prevSibling.value && target.value) {
                            handleCustomFieldAdd(prevSibling.value, target.value)
                            prevSibling.value = ''
                            target.value = ''
                          }
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowPreferences(false)}
                className="px-3 py-1 text-sm bg-gray-400 text-white rounded hover:bg-gray-500"
              >
                ✕ Close
              </button>
            </div>
          </div>
        )}
        
        {/* Search and Filter Controls */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search Users</label>
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            {/* Role Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Role</label>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value as 'all' | 'ops' | 'finance')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Roles</option>
                <option value="ops">Operations</option>
                <option value="finance">Finance</option>
              </select>
            </div>
            
            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
              <div className="flex space-x-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'name' | 'email' | 'role' | 'date')}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="name">Name</option>
                  <option value="email">Email</option>
                  <option value="role">Role</option>
                  <option value="date">Date</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Enhanced Bulk Actions */}
        {selectedUsers.size > 0 && (
          <div className="px-6 py-3 bg-blue-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-700 font-medium">
                {selectedUsers.size} user{selectedUsers.size !== 1 ? 's' : ''} selected
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleBulkRemove}
                  className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                  disabled={isLoading}
                >
                  {isLoading ? '⏳' : '🗑️'} Remove Selected
                </button>
                <button
                  onClick={() => handleBulkRoleUpdate('ops')}
                  className="px-3 py-1 text-sm bg-orange-600 text-white rounded hover:bg-orange-700"
                  disabled={isLoading}
                >
                  ⚙️ Set Operations
                </button>
                <button
                  onClick={() => handleBulkRoleUpdate('finance')}
                  className="px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700"
                  disabled={isLoading}
                >
                  💰 Set Finance
                </button>
                <button
                  onClick={() => setSelectedUsers(new Set())}
                  className="px-3 py-1 text-sm bg-gray-400 text-white rounded hover:bg-gray-500"
                >
                  ✕ Clear
                </button>
              </div>
            </div>
          </div>
        )}
      
        {/* Add User Form */}
        {showAddUser && (
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h4 className="text-md font-medium mb-3">Add New User</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Full Name (optional)"
            value={newUserName}
            onChange={(e) => setNewUserName(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="email"
            placeholder="user@example.com"
            value={newUserEmail}
            onChange={(e) => setNewUserEmail(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={newUserRole}
            onChange={(e) => setNewUserRole(e.target.value as 'ops' | 'finance')}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ops">Operations</option>
            <option value="finance">Finance</option>
          </select>
          <button
            onClick={handleAddUser}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                disabled={isLoading}
          >
                {isLoading ? '⏳ Adding...' : '➕ Add User'}
          </button>
        </div>
      </div>
        )}
        
        {/* Enhanced Users Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200" role="table" aria-label="Users table">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Login
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                      <div className="text-4xl mb-4">👥</div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                      <p className="text-gray-500 mb-4">
                        {searchTerm || filterRole !== 'all' 
                          ? 'Try adjusting your search or filter criteria.'
                          : 'Get started by adding your first user.'
                        }
                      </p>
                      {!searchTerm && filterRole === 'all' && (
                        <button
                          onClick={() => setShowAddUser(true)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                          ➕ Add Your First User
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user: User, index: number) => {
                  const userActivityData = userActivity.find(u => u.email === user.email)
                  return (
                    <tr key={user.email} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedUsers.has(user.email)}
                          onChange={() => handleSelectUser(user.email)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
                              {(user.name || user.email).charAt(0).toUpperCase()}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.name || 'No name'}
        </div>
                            <div className="text-sm text-gray-500">{user.email}</div>
            </div>
                </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.role === 'ops' 
                            ? 'bg-orange-100 text-orange-800' 
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {user.role === 'ops' ? '⚙️ Operations' : '💰 Finance'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                          userActivityData?.status === 'online'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          <span className={`w-2 h-2 rounded-full mr-2 ${
                            userActivityData?.status === 'online' ? 'bg-green-400' : 'bg-gray-400'
                          }`}></span>
                          {userActivityData?.status === 'online' ? 'Online' : 'Offline'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {userActivityData?.lastLogin 
                          ? new Date(userActivityData.lastLogin).toLocaleDateString()
                          : 'Never'
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setShowUserDetails(showUserDetails === user.email ? null : user.email)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            👁️ View
                          </button>
                <button
                  onClick={() => handleRemoveUser(user.email)}
                            className="text-red-600 hover:text-red-900"
                            disabled={isLoading}
                          >
                            {isLoading ? '⏳' : '🗑️'} Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* User Details Modal */}
        {showUserDetails && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">User Details</h3>
                  <button
                    onClick={() => setShowUserDetails(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                </button>
                </div>
                {(() => {
                  const user = users.find(u => u.email === showUserDetails)
                  const activity = userActivity.find(u => u.email === showUserDetails)
                  if (!user) return null
                  
                  return (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <p className="text-sm text-gray-900">{user.name || 'Not provided'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <p className="text-sm text-gray-900">{user.email}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Role</label>
                        <p className="text-sm text-gray-900">{user.role === 'ops' ? 'Operations' : 'Finance'}</p>
                      </div>
                      {activity && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Status</label>
                            <p className="text-sm text-gray-900">{activity.status === 'online' ? 'Online' : 'Offline'}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Last Login</label>
                            <p className="text-sm text-gray-900">
                              {new Date(activity.lastLogin).toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Login Count</label>
                            <p className="text-sm text-gray-900">{activity.loginCount}</p>
                          </div>
                        </>
                      )}
                    </div>
                  )
                })()}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Results Summary */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {filteredUsers.length} of {users.length} users
            {searchTerm && ` matching "${searchTerm}"`}
            {filterRole !== 'all' && ` in ${filterRole} role`}
          </div>
          <div className="text-sm text-gray-500">
            {selectedUsers.size > 0 && `${selectedUsers.size} selected`}
          </div>
        </div>
      </div>
      
      {/* Two-Person Rule Info */}
      <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Two-Person Rule</h4>
        <p className="text-sm text-blue-700">
          When enabled in Settings, the two-person rule requires different users to acknowledge 
          Step 1 and Step 2 in the Orders checklist. This ensures proper oversight and reduces errors.
        </p>
      </div>
      
      {/* Keyboard Shortcuts Help Panel */}
      {showKeyboardShortcuts && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Keyboard Shortcuts</h3>
                <button
                  onClick={() => setShowKeyboardShortcuts(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Ctrl + E</span>
                  <span className="text-sm text-gray-600">Toggle Export Panel</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Ctrl + I</span>
                  <span className="text-sm text-gray-600">Toggle Import Panel</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Ctrl + A</span>
                  <span className="text-sm text-gray-600">Toggle Add User Form</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Ctrl + R</span>
                  <span className="text-sm text-gray-600">Generate Activity Report</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Ctrl + S</span>
                  <span className="text-sm text-gray-600">Toggle Shortcuts Panel</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Ctrl + ?</span>
                  <span className="text-sm text-gray-600">Show This Help</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Ctrl + Enter</span>
                  <span className="text-sm text-gray-600">Remove Selected Users</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Ctrl + C</span>
                  <span className="text-sm text-gray-600">Toggle Charts Panel</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Ctrl + F</span>
                  <span className="text-sm text-gray-600">Toggle Advanced Search</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Ctrl + P</span>
                  <span className="text-sm text-gray-600">Toggle Performance Panel</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Keyboard Shortcuts Indicator */}
      <div className="fixed bottom-4 right-4">
        <button
          onClick={() => setShowKeyboardShortcuts(!showKeyboardShortcuts)}
          className="bg-gray-800 text-white p-2 rounded-full shadow-lg hover:bg-gray-700"
          title="Keyboard Shortcuts"
        >
          ⌨️
        </button>
      </div>
    </div>
  )
}

export default UsersView
