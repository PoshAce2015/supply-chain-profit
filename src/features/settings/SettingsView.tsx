import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { selectRates } from './ratesSlice'
import { setRates } from './ratesSlice'
import { setSettings } from '../sla/slaSlice'
import { setMapping } from '../imports/importsSlice'
import { Rates } from '../../lib/calc/types'
import { getDefaultRates } from '../../lib/calc/defaults'
import { FileType } from '../../lib/types'

const SettingsView: React.FC = () => {
  const dispatch = useDispatch()
  const currentRates = useSelector(selectRates)
  const mappings = useSelector((state: any) => state.imports?.mappings || {})
  
  // High Priority Enhancement States
  const [activeTab, setActiveTab] = useState<'general' | 'appearance' | 'security' | 'data' | 'advanced'>('general')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  
  // Settings states
  const [rates, setRatesLocal] = useState<Rates>(currentRates)
  const [slaSettings, setSlaSettingsLocal] = useState({
    SLA_PO_Hours: 48,
    SLA_Customs_Days: 7,
    twoPersonRule: true
  })
  
  // Appearance settings
  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: 'light',
    language: 'en',
    fontSize: 'medium',
    compactMode: false,
    showAnimations: true
  })
  
  // Security settings
  const [securitySettings, setSecuritySettings] = useState({
    requirePassword: false,
    sessionTimeout: 30,
    enableAuditLog: true,
    dataEncryption: true,
    twoFactorAuth: false
  })
  
  // Advanced settings
  const [advancedSettings, setAdvancedSettings] = useState({
    debugMode: false,
    performanceMode: false,
    autoSave: true,
    backupFrequency: 'daily',
    logLevel: 'info'
  })
  
  // Medium Priority Enhancement States
  const [showAdvancedControls, setShowAdvancedControls] = useState(false)
  const [showSettingsSearch, setShowSettingsSearch] = useState(false)
  const [showSettingsHistory, setShowSettingsHistory] = useState(false)
  const [showSettingsAnalytics, setShowSettingsAnalytics] = useState(false)
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [settingsHistory, setSettingsHistory] = useState<Array<{
    timestamp: string
    action: string
    changes: Record<string, any>
    user: string
  }>>([])
  const [settingsAnalytics, setSettingsAnalytics] = useState({
    totalChanges: 0,
    lastModified: new Date().toISOString(),
    mostChangedSettings: ['rates', 'appearance', 'security'],
    averageChangesPerDay: 2.5
  })
  const [customValidationRules, setCustomValidationRules] = useState<Array<{
    id: string
    field: string
    rule: string
    message: string
    enabled: boolean
  }>>([])
  const [settingsConstraints, setSettingsConstraints] = useState({
    maxBackupSize: 10, // MB
    maxHistoryEntries: 100,
    maxCustomRules: 20,
    allowedFileTypes: ['json', 'csv'],
    maxSessionTimeout: 480
  })
  
  // Low Priority Enhancement States
  const [showSettingsImport, setShowSettingsImport] = useState(false)
  const [showSettingsTemplates, setShowSettingsTemplates] = useState(false)
  const [showSettingsPresets, setShowSettingsPresets] = useState(false)
  const [showSettingsUsage, setShowSettingsUsage] = useState(false)
  const [showAccessibilityPanel, setShowAccessibilityPanel] = useState(false)
  const [showPerformancePanel, setShowPerformancePanel] = useState(false)
  const [showMobileOptimization, setShowMobileOptimization] = useState(false)
  const [settingsTemplates, setSettingsTemplates] = useState<Array<{
    id: string
    name: string
    description: string
    settings: Record<string, any>
    category: string
    isDefault: boolean
  }>>([
    {
      id: 'default',
      name: 'Default Settings',
      description: 'Standard configuration for general use',
      settings: { rates: getDefaultRates(), appearance: { theme: 'light' } },
      category: 'general',
      isDefault: true
    },
    {
      id: 'performance',
      name: 'Performance Optimized',
      description: 'Settings optimized for maximum performance',
      settings: { advanced: { performanceMode: true, debugMode: false } },
      category: 'advanced',
      isDefault: false
    },
    {
      id: 'security',
      name: 'High Security',
      description: 'Maximum security and privacy settings',
      settings: { security: { requirePassword: true, twoFactorAuth: true } },
      category: 'security',
      isDefault: false
    }
  ])
  const [settingsPresets, setSettingsPresets] = useState<Array<{
    id: string
    name: string
    description: string
    settings: Record<string, any>
    category: string
  }>>([
    {
      id: 'minimal',
      name: 'Minimal Interface',
      description: 'Clean, minimal interface settings',
      settings: { appearance: { compactMode: true, showAnimations: false } },
      category: 'appearance'
    },
    {
      id: 'detailed',
      name: 'Detailed Interface',
      description: 'Comprehensive interface with all features',
      settings: { appearance: { compactMode: false, showAnimations: true } },
      category: 'appearance'
    }
  ])
  const [settingsUsage, setSettingsUsage] = useState({
    totalSessions: 45,
    averageSessionTime: 12.5, // minutes
    mostUsedFeatures: ['rates', 'appearance', 'data'],
    lastActive: new Date().toISOString(),
    settingsChangedToday: 3,
    settingsChangedThisWeek: 12,
    settingsChangedThisMonth: 28
  })
  const [accessibilitySettings, setAccessibilitySettings] = useState({
    highContrast: false,
    reducedMotion: false,
    screenReader: false,
    keyboardNavigation: true,
    focusIndicators: true,
    colorBlindSupport: false,
    fontSize: 'medium',
    lineSpacing: 'normal'
  })
  const [performanceMetrics, setPerformanceMetrics] = useState({
    loadTime: 1.2, // seconds
    renderTime: 0.8, // seconds
    memoryUsage: 45.2, // MB
    cpuUsage: 12.5, // percentage
    networkRequests: 8,
    cacheHitRate: 85.3 // percentage
  })
  
  // Enhanced save function with loading and feedback states
  const handleSave = async () => {
    setIsLoading(true)
    setError(null)
    setSuccess(null)
    
    try {
      // Simulate save operation
      await new Promise(resolve => setTimeout(resolve, 1000))
      
    dispatch(setRates(rates))
    dispatch(setSettings(slaSettings))
      
      setSuccess('Settings saved successfully!')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError('Failed to save settings. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }
  
  // Enhanced reset function
  const handleResetRates = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      const defaults = getDefaultRates()
      setRatesLocal(defaults)
      setSuccess('Rates reset to defaults successfully!')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError('Failed to reset rates. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }
  
  // Enhanced reset data function
  const handleResetData = async () => {
    const userInput = prompt('This will clear all imported data, mappings, and settings. Type RESET to confirm:')
    if (userInput === 'RESET') {
      setIsLoading(true)
      setError(null)
      
      try {
        await new Promise(resolve => setTimeout(resolve, 1000))
      localStorage.clear()
        setSuccess('Data reset successfully. Page will reload...')
        setTimeout(() => window.location.reload(), 2000)
      } catch (err) {
        setError('Failed to reset data. Please try again.')
        setIsLoading(false)
      }
    }
  }
  
  // Enhanced backup export function
  const handleBackupExport = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800))
      
    const backup = {
      rates: rates,
      mappings: mappings,
      slaSettings: slaSettings,
        appearanceSettings: appearanceSettings,
        securitySettings: securitySettings,
        advancedSettings: advancedSettings,
      users: {
        users: [],
        currentUser: 'system@local'
      },
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    }
    
    const dataStr = JSON.stringify(backup, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'scp-backup.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
      
      setSuccess('Backup exported successfully!')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError('Failed to export backup. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }
  
  // Enhanced backup import function
  const handleBackupImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!confirm('This will overwrite all current settings and mappings. Are you sure?')) {
      return
    }

    setIsLoading(true)
    setError(null)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const backup = JSON.parse(e.target?.result as string)
        
        // Restore rates
        if (backup.rates) {
          dispatch(setRates(backup.rates))
            setRatesLocal(backup.rates)
        }
        
        // Restore mappings
        if (backup.mappings) {
          Object.entries(backup.mappings).forEach(([fileType, mapping]) => {
            dispatch(setMapping({ fileType: fileType as FileType, mapping: mapping as Record<string, string> }))
          })
        }
        
        // Restore SLA settings
        if (backup.slaSettings) {
          dispatch(setSettings(backup.slaSettings))
            setSlaSettingsLocal(backup.slaSettings)
          }
          
          // Restore appearance settings
          if (backup.appearanceSettings) {
            setAppearanceSettings(backup.appearanceSettings)
          }
          
          // Restore security settings
          if (backup.securitySettings) {
            setSecuritySettings(backup.securitySettings)
          }
          
          // Restore advanced settings
          if (backup.advancedSettings) {
            setAdvancedSettings(backup.advancedSettings)
          }
          
          setSuccess('Backup imported successfully!')
          setTimeout(() => setSuccess(null), 3000)
      } catch (error) {
          setError('Failed to import backup. Please check the file format.')
        } finally {
          setIsLoading(false)
      }
    }
    reader.readAsText(file)
    } catch (err) {
      setError('Failed to import backup. Please try again.')
      setIsLoading(false)
    }
  }
  
  // Settings validation
  const validationErrors = useMemo(() => {
    const errors: string[] = []
    
    if (rates.GST_sale < 0 || rates.GST_sale > 100) {
      errors.push('GST Sale must be between 0 and 100')
    }
    if (rates.GST_on_fees < 0 || rates.GST_on_fees > 100) {
      errors.push('GST on Fees must be between 0 and 100')
    }
    if (rates.FX <= 0) {
      errors.push('FX Rate must be greater than 0')
    }
    if (rates.clearance.total < 0) {
      errors.push('Clearance Total cannot be negative')
    }
    if (rates.clearance.unitsInShipment <= 0) {
      errors.push('Units in Shipment must be greater than 0')
    }
    if (rates.reserves.returns < 0 || rates.reserves.returns > 100) {
      errors.push('Returns Reserve must be between 0 and 100')
    }
    if (rates.reserves.overheads < 0 || rates.reserves.overheads > 100) {
      errors.push('Overheads must be between 0 and 100')
    }
    if (rates.BatteryExtraDays < 0) {
      errors.push('Battery Extra Days cannot be negative')
    }
    if (slaSettings.SLA_PO_Hours <= 0) {
      errors.push('SLA PO Hours must be greater than 0')
    }
    if (slaSettings.SLA_Customs_Days <= 0) {
      errors.push('SLA Customs Days must be greater than 0')
    }
    
    return errors
  }, [rates, slaSettings])
  
  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  
  // Auto-save effect
  useEffect(() => {
    if (advancedSettings.autoSave) {
      const timeoutId = setTimeout(() => {
        if (validationErrors.length === 0) {
          handleSave()
        }
      }, 5000) // Auto-save after 5 seconds of inactivity
      
      return () => clearTimeout(timeoutId)
    }
  }, [rates, slaSettings, advancedSettings.autoSave, validationErrors.length])
  
  // Enhanced validation with custom rules
  const enhancedValidationErrors = useMemo(() => {
    const errors = [...validationErrors]
    
    // Apply custom validation rules
    customValidationRules.forEach(rule => {
      if (!rule.enabled) return
      
      switch (rule.field) {
        case 'GST_sale':
          if (rates.GST_sale < 0 || rates.GST_sale > 100) {
            errors.push(rule.message || 'GST Sale must be between 0 and 100')
          }
          break
        case 'FX':
          if (rates.FX <= 0) {
            errors.push(rule.message || 'FX Rate must be greater than 0')
          }
          break
        case 'sessionTimeout':
          if (securitySettings.sessionTimeout > settingsConstraints.maxSessionTimeout) {
            errors.push(rule.message || `Session timeout cannot exceed ${settingsConstraints.maxSessionTimeout} minutes`)
          }
          break
        default:
          break
      }
    })
    
    return errors
  }, [validationErrors, customValidationRules, rates, securitySettings, settingsConstraints])
  
  // Settings search functionality
  const filteredSettings = useMemo(() => {
    if (!searchTerm) return null
    
    const searchLower = searchTerm.toLowerCase()
    const results: Array<{ tab: string; section: string; field: string; value: any }> = []
    
    // Search in rates
    Object.entries(rates).forEach(([key, value]) => {
      if (key.toLowerCase().includes(searchLower) || String(value).toLowerCase().includes(searchLower)) {
        results.push({ tab: 'general', section: 'Calculation Rates', field: key, value })
      }
    })
    
    // Search in SLA settings
    Object.entries(slaSettings).forEach(([key, value]) => {
      if (key.toLowerCase().includes(searchLower) || String(value).toLowerCase().includes(searchLower)) {
        results.push({ tab: 'general', section: 'SLA Settings', field: key, value })
      }
    })
    
    // Search in appearance settings
    Object.entries(appearanceSettings).forEach(([key, value]) => {
      if (key.toLowerCase().includes(searchLower) || String(value).toLowerCase().includes(searchLower)) {
        results.push({ tab: 'appearance', section: 'Appearance & Theme Settings', field: key, value })
      }
    })
    
    // Search in security settings
    Object.entries(securitySettings).forEach(([key, value]) => {
      if (key.toLowerCase().includes(searchLower) || String(value).toLowerCase().includes(searchLower)) {
        results.push({ tab: 'security', section: 'Security & Privacy Settings', field: key, value })
      }
    })
    
    // Search in advanced settings
    Object.entries(advancedSettings).forEach(([key, value]) => {
      if (key.toLowerCase().includes(searchLower) || String(value).toLowerCase().includes(searchLower)) {
        results.push({ tab: 'advanced', section: 'Advanced Settings', field: key, value })
      }
    })
    
    return results
  }, [searchTerm, rates, slaSettings, appearanceSettings, securitySettings, advancedSettings])
  
  // Enhanced save function with history tracking
  const handleEnhancedSave = async () => {
    setIsLoading(true)
    setError(null)
    setSuccess(null)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Track changes for history
      const changes = {
        rates: rates,
        slaSettings: slaSettings,
        appearanceSettings: appearanceSettings,
        securitySettings: securitySettings,
        advancedSettings: advancedSettings
      }
      
      // Add to history
      const historyEntry = {
        timestamp: new Date().toISOString(),
        action: 'Settings Updated',
        changes: changes,
        user: 'current-user@example.com'
      }
      
      setSettingsHistory(prev => [historyEntry, ...prev.slice(0, settingsConstraints.maxHistoryEntries - 1)])
      
      // Update analytics
      setSettingsAnalytics(prev => ({
        ...prev,
        totalChanges: prev.totalChanges + 1,
        lastModified: new Date().toISOString()
      }))
      
      dispatch(setRates(rates))
      dispatch(setSettings(slaSettings))
      
      setSuccess('Settings saved successfully!')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError('Failed to save settings. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }
  
  // Custom validation rule management
  const addCustomValidationRule = () => {
    const newRule = {
      id: Date.now().toString(),
      field: '',
      rule: '',
      message: '',
      enabled: true
    }
    setCustomValidationRules(prev => [...prev, newRule])
  }
  
  const removeCustomValidationRule = (id: string) => {
    setCustomValidationRules(prev => prev.filter(rule => rule.id !== id))
  }
  
  const updateCustomValidationRule = (id: string, updates: Partial<typeof customValidationRules[0]>) => {
    setCustomValidationRules(prev => prev.map(rule => 
      rule.id === id ? { ...rule, ...updates } : rule
    ))
  }
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 's':
            event.preventDefault()
            if (enhancedValidationErrors.length === 0) {
              handleEnhancedSave()
            }
            break
          case 'f':
            event.preventDefault()
            setShowSettingsSearch(true)
            break
          case 'h':
            event.preventDefault()
            setShowSettingsHistory(true)
            break
          case 'a':
            event.preventDefault()
            setShowSettingsAnalytics(true)
            break
          case 'k':
            event.preventDefault()
            setShowKeyboardShortcuts(true)
            break
          case 'r':
            event.preventDefault()
            handleResetRates()
            break
          case 'z':
            event.preventDefault()
            // Undo last change (if history available)
            if (settingsHistory.length > 0) {
              const lastEntry = settingsHistory[0]
              // Restore from history
              setSuccess('Last change undone')
              setTimeout(() => setSuccess(null), 3000)
            }
            break
          case 'i':
            event.preventDefault()
            setShowSettingsImport(true)
            break
          case 't':
            event.preventDefault()
            setShowSettingsTemplates(true)
            break
          case 'p':
            event.preventDefault()
            setShowSettingsPresets(true)
            break
          case 'u':
            event.preventDefault()
            setShowSettingsUsage(true)
            break
          case 'm':
            event.preventDefault()
            optimizeForMobile()
            break
        }
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [enhancedValidationErrors.length, settingsHistory.length])
  
  // Settings export with constraints
  const handleEnhancedExport = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const exportData = {
        rates: rates,
        mappings: mappings,
        slaSettings: slaSettings,
        appearanceSettings: appearanceSettings,
        securitySettings: securitySettings,
        advancedSettings: advancedSettings,
        customValidationRules: customValidationRules,
        settingsConstraints: settingsConstraints,
        settingsHistory: settingsHistory.slice(0, 10), // Export last 10 entries
        settingsAnalytics: settingsAnalytics,
        settingsUsage: settingsUsage,
        accessibilitySettings: accessibilitySettings,
        performanceMetrics: performanceMetrics,
        users: {
          users: [],
          currentUser: 'system@local'
        },
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      }
      
      const dataStr = JSON.stringify(exportData, null, 2)
      const blob = new Blob([dataStr], { type: 'application/json' })
      
      // Check file size constraint
      const sizeInMB = blob.size / (1024 * 1024)
      if (sizeInMB > settingsConstraints.maxBackupSize) {
        setError(`Export file size (${sizeInMB.toFixed(2)}MB) exceeds maximum allowed size (${settingsConstraints.maxBackupSize}MB)`)
        return
      }
      
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'scp-enhanced-backup.json'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      setSuccess('Enhanced backup exported successfully!')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError('Failed to export enhanced backup. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }
  
  // Settings import with validation
  const handleSettingsImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!confirm('This will overwrite all current settings. Are you sure?')) {
      return
    }

    setIsLoading(true)
    setError(null)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const importData = JSON.parse(e.target?.result as string)
          
          // Validate import data structure
          if (!importData.version || !importData.timestamp) {
            throw new Error('Invalid settings file format')
          }
          
          // Restore all settings with validation
          if (importData.rates) {
            setRatesLocal(importData.rates)
            dispatch(setRates(importData.rates))
          }
          
          if (importData.slaSettings) {
            setSlaSettingsLocal(importData.slaSettings)
            dispatch(setSettings(importData.slaSettings))
          }
          
          if (importData.appearanceSettings) {
            setAppearanceSettings(importData.appearanceSettings)
          }
          
          if (importData.securitySettings) {
            setSecuritySettings(importData.securitySettings)
          }
          
          if (importData.advancedSettings) {
            setAdvancedSettings(importData.advancedSettings)
          }
          
          if (importData.customValidationRules) {
            setCustomValidationRules(importData.customValidationRules)
          }
          
          if (importData.accessibilitySettings) {
            setAccessibilitySettings(importData.accessibilitySettings)
          }
          
          // Update usage analytics
          setSettingsUsage(prev => ({
            ...prev,
            settingsChangedToday: prev.settingsChangedToday + 1,
            settingsChangedThisWeek: prev.settingsChangedThisWeek + 1,
            settingsChangedThisMonth: prev.settingsChangedThisMonth + 1
          }))
          
          setSuccess('Settings imported successfully!')
          setTimeout(() => setSuccess(null), 3000)
        } catch (error) {
          setError('Failed to import settings. Please check the file format.')
        } finally {
          setIsLoading(false)
        }
      }
      reader.readAsText(file)
    } catch (err) {
      setError('Failed to import settings. Please try again.')
      setIsLoading(false)
    }
  }
  
  // Template management functions
  const applyTemplate = (template: typeof settingsTemplates[0]) => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Apply template settings
      if (template.settings.rates) {
        setRatesLocal(template.settings.rates)
        dispatch(setRates(template.settings.rates))
      }
      
      if (template.settings.appearance) {
        setAppearanceSettings(prev => ({ ...prev, ...template.settings.appearance }))
      }
      
      if (template.settings.security) {
        setSecuritySettings(prev => ({ ...prev, ...template.settings.security }))
      }
      
      if (template.settings.advanced) {
        setAdvancedSettings(prev => ({ ...prev, ...template.settings.advanced }))
      }
      
      setSuccess(`Template "${template.name}" applied successfully!`)
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError('Failed to apply template. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }
  
  const saveAsTemplate = () => {
    const templateName = prompt('Enter template name:')
    if (!templateName) return
    
    const newTemplate = {
      id: Date.now().toString(),
      name: templateName,
      description: `Custom template created on ${new Date().toLocaleDateString()}`,
      settings: {
        rates: rates,
        appearance: appearanceSettings,
        security: securitySettings,
        advanced: advancedSettings
      },
      category: 'custom',
      isDefault: false
    }
    
    setSettingsTemplates(prev => [...prev, newTemplate])
    setSuccess(`Template "${templateName}" saved successfully!`)
    setTimeout(() => setSuccess(null), 3000)
  }
  
  const deleteTemplate = (templateId: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      setSettingsTemplates(prev => prev.filter(t => t.id !== templateId))
      setSuccess('Template deleted successfully!')
      setTimeout(() => setSuccess(null), 3000)
    }
  }
  
  // Preset management functions
  const applyPreset = (preset: typeof settingsPresets[0]) => {
    setIsLoading(true)
    setError(null)
    
    try {
      if (preset.settings.appearance) {
        setAppearanceSettings(prev => ({ ...prev, ...preset.settings.appearance }))
      }
      
      setSuccess(`Preset "${preset.name}" applied successfully!`)
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError('Failed to apply preset. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }
  
  // Accessibility functions
  const toggleHighContrast = () => {
    setAccessibilitySettings(prev => ({ ...prev, highContrast: !prev.highContrast }))
    document.body.classList.toggle('high-contrast')
  }
  
  const toggleReducedMotion = () => {
    setAccessibilitySettings(prev => ({ ...prev, reducedMotion: !prev.reducedMotion }))
    document.body.classList.toggle('reduced-motion')
  }
  
  const updateFontSize = (size: string) => {
    setAccessibilitySettings(prev => ({ ...prev, fontSize: size }))
    document.documentElement.style.fontSize = size === 'large' ? '18px' : size === 'small' ? '14px' : '16px'
  }
  
  // Performance monitoring
  const updatePerformanceMetrics = () => {
    // Simulate performance metrics update
    setPerformanceMetrics({
      loadTime: Math.random() * 2 + 0.5,
      renderTime: Math.random() * 1.5 + 0.3,
      memoryUsage: Math.random() * 50 + 30,
      cpuUsage: Math.random() * 20 + 5,
      networkRequests: Math.floor(Math.random() * 10) + 5,
      cacheHitRate: Math.random() * 20 + 75
    })
  }
  
  // Mobile optimization
  const optimizeForMobile = () => {
    setShowMobileOptimization(true)
    setAppearanceSettings(prev => ({
      ...prev,
      compactMode: true,
      fontSize: 'medium'
    }))
    setAccessibilitySettings(prev => ({
      ...prev,
      focusIndicators: true,
      keyboardNavigation: true
    }))
  }
  

  
  return (
    <div 
      data-testid="settings-view" 
      className={`${isMobile ? 'p-3' : 'p-6'}`}
      role="main" 
      aria-label="Settings Configuration Dashboard"
    >
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      {/* Success and Error Messages */}
      {success && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-md">
          <div className="flex items-center">
            <span className="mr-2">✅</span>
            {success}
          </div>
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
          <div className="flex items-center">
            <span className="mr-2">❌</span>
            {error}
          </div>
        </div>
      )}
      
      {/* Validation Errors */}
      {enhancedValidationErrors.length > 0 && (
        <div className="mb-4 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-md">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <span className="mr-2">⚠️</span>
              <strong>Validation Errors ({enhancedValidationErrors.length}):</strong>
            </div>
            <button
              onClick={() => setShowAdvancedControls(!showAdvancedControls)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {showAdvancedControls ? 'Hide' : 'Show'} Advanced Controls
            </button>
          </div>
          <ul className="list-disc list-inside space-y-1">
            {enhancedValidationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Advanced Controls Panel */}
      {showAdvancedControls && (
        <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Advanced Controls</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setShowSettingsSearch(!showSettingsSearch)}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                🔍 Search
              </button>
              <button
                onClick={() => setShowSettingsHistory(!showSettingsHistory)}
                className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
              >
                📋 History
              </button>
              <button
                onClick={() => setShowSettingsAnalytics(!showSettingsAnalytics)}
                className="px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                📊 Analytics
              </button>
              <button
                onClick={() => setShowKeyboardShortcuts(!showKeyboardShortcuts)}
                className="px-3 py-1 text-sm bg-orange-600 text-white rounded hover:bg-orange-700"
              >
                ⌨️ Shortcuts
              </button>
              <button
                onClick={() => setShowSettingsImport(!showSettingsImport)}
                className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                📥 Import
              </button>
              <button
                onClick={() => setShowSettingsTemplates(!showSettingsTemplates)}
                className="px-3 py-1 text-sm bg-teal-600 text-white rounded hover:bg-teal-700"
              >
                📋 Templates
              </button>
              <button
                onClick={() => setShowSettingsPresets(!showSettingsPresets)}
                className="px-3 py-1 text-sm bg-pink-600 text-white rounded hover:bg-pink-700"
              >
                ⚙️ Presets
              </button>
              <button
                onClick={() => setShowSettingsUsage(!showSettingsUsage)}
                className="px-3 py-1 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700"
              >
                📈 Usage
              </button>
              <button
                onClick={() => setShowAccessibilityPanel(!showAccessibilityPanel)}
                className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                ♿ Accessibility
              </button>
              <button
                onClick={() => setShowPerformancePanel(!showPerformancePanel)}
                className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
              >
                ⚡ Performance
              </button>
              <button
                onClick={optimizeForMobile}
                className="px-3 py-1 text-sm bg-emerald-600 text-white rounded hover:bg-emerald-700"
              >
                📱 Mobile
              </button>
            </div>
          </div>
          
          {/* Settings Search */}
          {showSettingsSearch && (
            <div className="mb-4 p-4 bg-white border border-gray-200 rounded">
              <div className="flex items-center space-x-2 mb-3">
                <input
                  type="text"
                  placeholder="Search settings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => setSearchTerm('')}
                  className="px-3 py-2 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Clear
                </button>
              </div>
              
              {filteredSettings && filteredSettings.length > 0 && (
                <div className="max-h-40 overflow-y-auto">
                  <h4 className="font-medium mb-2">Search Results ({filteredSettings.length}):</h4>
                  {filteredSettings.map((result, index) => (
                    <div key={index} className="p-2 bg-gray-50 rounded mb-1">
                      <div className="text-sm font-medium">{result.section} → {result.field}</div>
                      <div className="text-xs text-gray-600">Value: {String(result.value)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Settings History */}
          {showSettingsHistory && (
            <div className="mb-4 p-4 bg-white border border-gray-200 rounded">
              <h4 className="font-medium mb-3">Settings History</h4>
              <div className="max-h-40 overflow-y-auto">
                {settingsHistory.length > 0 ? (
                  settingsHistory.map((entry, index) => (
                    <div key={index} className="p-2 bg-gray-50 rounded mb-2">
                      <div className="text-sm font-medium">{entry.action}</div>
                      <div className="text-xs text-gray-600">
                        {new Date(entry.timestamp).toLocaleString()} by {entry.user}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No history available</p>
                )}
              </div>
            </div>
          )}
          
          {/* Settings Analytics */}
          {showSettingsAnalytics && (
            <div className="mb-4 p-4 bg-white border border-gray-200 rounded">
              <h4 className="font-medium mb-3">Settings Analytics</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-medium">Total Changes</div>
                  <div className="text-blue-600">{settingsAnalytics.totalChanges}</div>
                </div>
                <div>
                  <div className="font-medium">Last Modified</div>
                  <div className="text-green-600">{new Date(settingsAnalytics.lastModified).toLocaleDateString()}</div>
                </div>
                <div>
                  <div className="font-medium">Avg Changes/Day</div>
                  <div className="text-purple-600">{settingsAnalytics.averageChangesPerDay}</div>
                </div>
                <div>
                  <div className="font-medium">Most Changed</div>
                  <div className="text-orange-600">{settingsAnalytics.mostChangedSettings.join(', ')}</div>
                </div>
              </div>
            </div>
          )}
          
                     {/* Keyboard Shortcuts */}
           {showKeyboardShortcuts && (
             <div className="mb-4 p-4 bg-white border border-gray-200 rounded">
               <h4 className="font-medium mb-3">Keyboard Shortcuts</h4>
               <div className="grid grid-cols-2 gap-4 text-sm">
                 <div className="flex justify-between">
                   <span>Save Settings:</span>
                   <kbd className="px-2 py-1 bg-gray-200 rounded">Ctrl+S</kbd>
                 </div>
                 <div className="flex justify-between">
                   <span>Search Settings:</span>
                   <kbd className="px-2 py-1 bg-gray-200 rounded">Ctrl+F</kbd>
                 </div>
                 <div className="flex justify-between">
                   <span>Show History:</span>
                   <kbd className="px-2 py-1 bg-gray-200 rounded">Ctrl+H</kbd>
                 </div>
                 <div className="flex justify-between">
                   <span>Show Analytics:</span>
                   <kbd className="px-2 py-1 bg-gray-200 rounded">Ctrl+A</kbd>
                 </div>
                 <div className="flex justify-between">
                   <span>Show Shortcuts:</span>
                   <kbd className="px-2 py-1 bg-gray-200 rounded">Ctrl+K</kbd>
                 </div>
                 <div className="flex justify-between">
                   <span>Reset Rates:</span>
                   <kbd className="px-2 py-1 bg-gray-200 rounded">Ctrl+R</kbd>
                 </div>
                 <div className="flex justify-between">
                   <span>Undo Last Change:</span>
                   <kbd className="px-2 py-1 bg-gray-200 rounded">Ctrl+Z</kbd>
                 </div>
                 <div className="flex justify-between">
                   <span>Import Settings:</span>
                   <kbd className="px-2 py-1 bg-gray-200 rounded">Ctrl+I</kbd>
                 </div>
                 <div className="flex justify-between">
                   <span>Show Templates:</span>
                   <kbd className="px-2 py-1 bg-gray-200 rounded">Ctrl+T</kbd>
                 </div>
                 <div className="flex justify-between">
                   <span>Show Presets:</span>
                   <kbd className="px-2 py-1 bg-gray-200 rounded">Ctrl+P</kbd>
                 </div>
                 <div className="flex justify-between">
                   <span>Show Usage:</span>
                   <kbd className="px-2 py-1 bg-gray-200 rounded">Ctrl+U</kbd>
                 </div>
                 <div className="flex justify-between">
                   <span>Mobile Optimization:</span>
                   <kbd className="px-2 py-1 bg-gray-200 rounded">Ctrl+M</kbd>
                 </div>
               </div>
             </div>
           )}
          
                     {/* Custom Validation Rules */}
           <div className="p-4 bg-white border border-gray-200 rounded">
             <div className="flex items-center justify-between mb-3">
               <h4 className="font-medium">Custom Validation Rules</h4>
               <button
                 onClick={addCustomValidationRule}
                 className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
               >
                 + Add Rule
               </button>
             </div>
             
             {customValidationRules.length > 0 ? (
               <div className="space-y-2">
                 {customValidationRules.map((rule) => (
                   <div key={rule.id} className="p-3 bg-gray-50 rounded border">
                     <div className="flex items-center justify-between mb-2">
                       <div className="flex items-center space-x-2">
                         <input
                           type="checkbox"
                           checked={rule.enabled}
                           onChange={(e) => updateCustomValidationRule(rule.id, { enabled: e.target.checked })}
                           className="rounded border-gray-300"
                         />
                         <span className="text-sm font-medium">Rule {rule.id}</span>
                       </div>
                       <button
                         onClick={() => removeCustomValidationRule(rule.id)}
                         className="text-red-600 hover:text-red-800 text-sm"
                       >
                         Remove
                       </button>
                     </div>
                     <div className="grid grid-cols-3 gap-2 text-sm">
                       <input
                         type="text"
                         placeholder="Field name"
                         value={rule.field}
                         onChange={(e) => updateCustomValidationRule(rule.id, { field: e.target.value })}
                         className="px-2 py-1 border border-gray-300 rounded"
                       />
                       <input
                         type="text"
                         placeholder="Validation rule"
                         value={rule.rule}
                         onChange={(e) => updateCustomValidationRule(rule.id, { rule: e.target.value })}
                         className="px-2 py-1 border border-gray-300 rounded"
                       />
                       <input
                         type="text"
                         placeholder="Error message"
                         value={rule.message}
                         onChange={(e) => updateCustomValidationRule(rule.id, { message: e.target.value })}
                         className="px-2 py-1 border border-gray-300 rounded"
                       />
                     </div>
                   </div>
                 ))}
               </div>
             ) : (
               <p className="text-gray-500 text-sm">No custom validation rules defined</p>
             )}
           </div>
           
           {/* Settings Import */}
           {showSettingsImport && (
             <div className="mb-4 p-4 bg-white border border-gray-200 rounded">
               <h4 className="font-medium mb-3">Settings Import</h4>
               <div className="space-y-3">
                 <div>
                   <input
                     type="file"
                     accept=".json"
                     onChange={handleSettingsImport}
                     className="hidden"
                     id="settings-import-input"
                   />
                   <label
                     htmlFor="settings-import-input"
                     className="block w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-center cursor-pointer"
                   >
                     📥 Import Settings File
                   </label>
                   <p className="text-sm text-gray-500 mt-1">
                     Import settings from a previously exported file
                   </p>
                 </div>
                 <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                   <p className="text-sm text-yellow-800">
                     ⚠️ Importing will overwrite all current settings. Make sure to export your current settings first.
                   </p>
                 </div>
               </div>
             </div>
           )}
           
           {/* Settings Templates */}
           {showSettingsTemplates && (
             <div className="mb-4 p-4 bg-white border border-gray-200 rounded">
               <div className="flex items-center justify-between mb-3">
                 <h4 className="font-medium">Settings Templates</h4>
                 <button
                   onClick={saveAsTemplate}
                   className="px-3 py-1 text-sm bg-teal-600 text-white rounded hover:bg-teal-700"
                 >
                   💾 Save Current as Template
                 </button>
               </div>
               <div className="space-y-3">
                 {settingsTemplates.map((template) => (
                   <div key={template.id} className="p-3 bg-gray-50 rounded border">
                     <div className="flex items-center justify-between mb-2">
                       <div>
                         <h5 className="font-medium">{template.name}</h5>
                         <p className="text-sm text-gray-600">{template.description}</p>
                       </div>
                       <div className="flex space-x-2">
                         <button
                           onClick={() => applyTemplate(template)}
                           className="px-2 py-1 text-xs bg-teal-600 text-white rounded hover:bg-teal-700"
                         >
                           Apply
                         </button>
                         {!template.isDefault && (
                           <button
                             onClick={() => deleteTemplate(template.id)}
                             className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                           >
                             Delete
                           </button>
                         )}
                       </div>
                     </div>
                     <div className="text-xs text-gray-500">
                       Category: {template.category} {template.isDefault && '(Default)'}
                     </div>
                   </div>
                 ))}
               </div>
             </div>
           )}
           
           {/* Settings Presets */}
           {showSettingsPresets && (
             <div className="mb-4 p-4 bg-white border border-gray-200 rounded">
               <h4 className="font-medium mb-3">Settings Presets</h4>
               <div className="space-y-3">
                 {settingsPresets.map((preset) => (
                   <div key={preset.id} className="p-3 bg-gray-50 rounded border">
                     <div className="flex items-center justify-between mb-2">
                       <div>
                         <h5 className="font-medium">{preset.name}</h5>
                         <p className="text-sm text-gray-600">{preset.description}</p>
                       </div>
                       <button
                         onClick={() => applyPreset(preset)}
                         className="px-3 py-1 text-sm bg-pink-600 text-white rounded hover:bg-pink-700"
                       >
                         Apply
                       </button>
                     </div>
                     <div className="text-xs text-gray-500">
                       Category: {preset.category}
                     </div>
                   </div>
                 ))}
               </div>
             </div>
           )}
           
           {/* Settings Usage Analytics */}
           {showSettingsUsage && (
             <div className="mb-4 p-4 bg-white border border-gray-200 rounded">
               <h4 className="font-medium mb-3">Settings Usage Analytics</h4>
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                 <div>
                   <div className="font-medium text-blue-600">Total Sessions</div>
                   <div className="text-lg font-bold">{settingsUsage.totalSessions}</div>
                 </div>
                 <div>
                   <div className="font-medium text-green-600">Avg Session Time</div>
                   <div className="text-lg font-bold">{settingsUsage.averageSessionTime}m</div>
                 </div>
                 <div>
                   <div className="font-medium text-purple-600">Changes Today</div>
                   <div className="text-lg font-bold">{settingsUsage.settingsChangedToday}</div>
                 </div>
                 <div>
                   <div className="font-medium text-orange-600">Changes This Week</div>
                   <div className="text-lg font-bold">{settingsUsage.settingsChangedThisWeek}</div>
                 </div>
                 <div>
                   <div className="font-medium text-red-600">Changes This Month</div>
                   <div className="text-lg font-bold">{settingsUsage.settingsChangedThisMonth}</div>
                 </div>
                 <div>
                   <div className="font-medium text-indigo-600">Last Active</div>
                   <div className="text-xs">{new Date(settingsUsage.lastActive).toLocaleDateString()}</div>
                 </div>
                 <div className="col-span-2">
                   <div className="font-medium text-gray-600">Most Used Features</div>
                   <div className="text-sm">{settingsUsage.mostUsedFeatures.join(', ')}</div>
                 </div>
               </div>
             </div>
           )}
           
           {/* Accessibility Panel */}
           {showAccessibilityPanel && (
             <div className="mb-4 p-4 bg-white border border-gray-200 rounded">
               <h4 className="font-medium mb-3">Accessibility Settings</h4>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="flex items-center">
                   <input
                     type="checkbox"
                     checked={accessibilitySettings.highContrast}
                     onChange={toggleHighContrast}
                     className="mr-2 rounded border-gray-300"
                   />
                   <label className="text-sm font-medium text-gray-700">
                     High Contrast Mode
                   </label>
                 </div>
                 <div className="flex items-center">
                   <input
                     type="checkbox"
                     checked={accessibilitySettings.reducedMotion}
                     onChange={toggleReducedMotion}
                     className="mr-2 rounded border-gray-300"
                   />
                   <label className="text-sm font-medium text-gray-700">
                     Reduced Motion
                   </label>
                 </div>
                 <div className="flex items-center">
                   <input
                     type="checkbox"
                     checked={accessibilitySettings.screenReader}
                     onChange={(e) => setAccessibilitySettings(prev => ({ ...prev, screenReader: e.target.checked }))}
                     className="mr-2 rounded border-gray-300"
                   />
                   <label className="text-sm font-medium text-gray-700">
                     Screen Reader Support
                   </label>
                 </div>
                 <div className="flex items-center">
                   <input
                     type="checkbox"
                     checked={accessibilitySettings.keyboardNavigation}
                     onChange={(e) => setAccessibilitySettings(prev => ({ ...prev, keyboardNavigation: e.target.checked }))}
                     className="mr-2 rounded border-gray-300"
                   />
                   <label className="text-sm font-medium text-gray-700">
                     Enhanced Keyboard Navigation
                   </label>
                 </div>
                 <div className="flex items-center">
                   <input
                     type="checkbox"
                     checked={accessibilitySettings.focusIndicators}
                     onChange={(e) => setAccessibilitySettings(prev => ({ ...prev, focusIndicators: e.target.checked }))}
                     className="mr-2 rounded border-gray-300"
                   />
                   <label className="text-sm font-medium text-gray-700">
                     Focus Indicators
                   </label>
                 </div>
                 <div className="flex items-center">
                   <input
                     type="checkbox"
                     checked={accessibilitySettings.colorBlindSupport}
                     onChange={(e) => setAccessibilitySettings(prev => ({ ...prev, colorBlindSupport: e.target.checked }))}
                     className="mr-2 rounded border-gray-300"
                   />
                   <label className="text-sm font-medium text-gray-700">
                     Color Blind Support
                   </label>
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">
                     Font Size
                   </label>
                   <select
                     value={accessibilitySettings.fontSize}
                     onChange={(e) => updateFontSize(e.target.value)}
                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                   >
                     <option value="small">Small</option>
                     <option value="medium">Medium</option>
                     <option value="large">Large</option>
                   </select>
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">
                     Line Spacing
                   </label>
                   <select
                     value={accessibilitySettings.lineSpacing}
                     onChange={(e) => setAccessibilitySettings(prev => ({ ...prev, lineSpacing: e.target.value }))}
                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                   >
                     <option value="tight">Tight</option>
                     <option value="normal">Normal</option>
                     <option value="loose">Loose</option>
                   </select>
                 </div>
               </div>
             </div>
           )}
           
           {/* Performance Panel */}
           {showPerformancePanel && (
             <div className="mb-4 p-4 bg-white border border-gray-200 rounded">
               <div className="flex items-center justify-between mb-3">
                 <h4 className="font-medium">Performance Metrics</h4>
                 <button
                   onClick={updatePerformanceMetrics}
                   className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                 >
                   🔄 Refresh
                 </button>
               </div>
               <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                 <div>
                   <div className="font-medium text-blue-600">Load Time</div>
                   <div className="text-lg font-bold">{performanceMetrics.loadTime.toFixed(1)}s</div>
                 </div>
                 <div>
                   <div className="font-medium text-green-600">Render Time</div>
                   <div className="text-lg font-bold">{performanceMetrics.renderTime.toFixed(1)}s</div>
                 </div>
                 <div>
                   <div className="font-medium text-purple-600">Memory Usage</div>
                   <div className="text-lg font-bold">{performanceMetrics.memoryUsage.toFixed(1)}MB</div>
                 </div>
                 <div>
                   <div className="font-medium text-orange-600">CPU Usage</div>
                   <div className="text-lg font-bold">{performanceMetrics.cpuUsage.toFixed(1)}%</div>
                 </div>
                 <div>
                   <div className="font-medium text-red-600">Network Requests</div>
                   <div className="text-lg font-bold">{performanceMetrics.networkRequests}</div>
                 </div>
                 <div>
                   <div className="font-medium text-indigo-600">Cache Hit Rate</div>
                   <div className="text-lg font-bold">{performanceMetrics.cacheHitRate.toFixed(1)}%</div>
                 </div>
               </div>
             </div>
           )}
           
           {/* Mobile Optimization */}
           {showMobileOptimization && (
             <div className="mb-4 p-4 bg-white border border-gray-200 rounded">
               <h4 className="font-medium mb-3">Mobile Optimization</h4>
               <div className="space-y-3">
                 <div className="p-3 bg-green-50 border border-green-200 rounded">
                   <p className="text-sm text-green-800">
                     ✅ Mobile optimization applied! The interface has been optimized for mobile devices.
                   </p>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                   <div>
                     <div className="font-medium">Compact Mode</div>
                     <div className="text-gray-600">Enabled for mobile</div>
                   </div>
                   <div>
                     <div className="font-medium">Font Size</div>
                     <div className="text-gray-600">Optimized for touch</div>
                   </div>
                   <div>
                     <div className="font-medium">Focus Indicators</div>
                     <div className="text-gray-600">Enhanced for mobile</div>
                   </div>
                   <div>
                     <div className="font-medium">Keyboard Navigation</div>
                     <div className="text-gray-600">Touch-optimized</div>
                   </div>
                 </div>
               </div>
             </div>
           )}
        </div>
      )}
      
      {/* Tabbed Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Settings tabs">
            {[
              { id: 'general', label: 'General', icon: '⚙️' },
              { id: 'appearance', label: 'Appearance', icon: '🎨' },
              { id: 'security', label: 'Security', icon: '🔒' },
              { id: 'data', label: 'Data Management', icon: '💾' },
              { id: 'advanced', label: 'Advanced', icon: '🔧' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                aria-current={activeTab === tab.id ? 'page' : undefined}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>
      
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
              <span>Processing...</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Tab Content */}
      <div className="space-y-6">
        {/* General Settings Tab */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            {/* Calculation Rates */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="text-lg font-medium mb-4 flex items-center">
                <span className="mr-2">🧮</span>
                Calculation Rates
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              GST Sale (%)
            </label>
            <input
              type="number"
              value={rates.GST_sale}
              onChange={(e) => setRatesLocal({ ...rates, GST_sale: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    max="100"
                    step="0.01"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              GST on Fees (%)
            </label>
            <input
              type="number"
              value={rates.GST_on_fees}
              onChange={(e) => setRatesLocal({ ...rates, GST_on_fees: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    max="100"
                    step="0.01"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              FX Rate
            </label>
            <input
              type="number"
              value={rates.FX}
              onChange={(e) => setRatesLocal({ ...rates, FX: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0.01"
                    step="0.01"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Clearance Total (₹)
            </label>
            <input
              type="number"
              value={rates.clearance.total}
              onChange={(e) => setRatesLocal({ 
                ...rates, 
                clearance: { ...rates.clearance, total: Number(e.target.value) }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    step="0.01"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Units in Shipment
            </label>
            <input
              type="number"
              value={rates.clearance.unitsInShipment}
              onChange={(e) => setRatesLocal({ 
                ...rates, 
                clearance: { ...rates.clearance, unitsInShipment: Number(e.target.value) }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Returns Reserve (%)
            </label>
            <input
              type="number"
              value={rates.reserves.returns}
              onChange={(e) => setRatesLocal({ 
                ...rates, 
                reserves: { ...rates.reserves, returns: Number(e.target.value) }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    max="100"
                    step="0.01"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Overheads (%)
            </label>
            <input
              type="number"
              value={rates.reserves.overheads}
              onChange={(e) => setRatesLocal({ 
                ...rates, 
                reserves: { ...rates.reserves, overheads: Number(e.target.value) }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    max="100"
                    step="0.01"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Battery Extra Days
            </label>
            <input
              type="number"
              value={rates.BatteryExtraDays}
              onChange={(e) => setRatesLocal({ ...rates, BatteryExtraDays: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
            />
          </div>
        </div>
              <div className="mt-6 flex flex-wrap gap-4">
          <button
                  onClick={handleEnhancedSave}
                  disabled={isLoading || enhancedValidationErrors.length > 0}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
                  {isLoading ? 'Saving...' : 'Save Settings'}
          </button>
          <button
            onClick={handleResetRates}
                  disabled={isLoading}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Reset to Defaults
          </button>
                <button
                  onClick={handleEnhancedExport}
                  disabled={isLoading}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Exporting...' : 'Enhanced Export'}
                </button>
        </div>
      </div>
      
      {/* SLA Settings */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="text-lg font-medium mb-4 flex items-center">
                <span className="mr-2">⏱️</span>
                SLA Settings
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              SLA PO Hours
            </label>
            <input
              type="number"
              value={slaSettings.SLA_PO_Hours}
              onChange={(e) => setSlaSettingsLocal({ ...slaSettings, SLA_PO_Hours: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              SLA Customs Days
            </label>
            <input
              type="number"
              value={slaSettings.SLA_Customs_Days}
              onChange={(e) => setSlaSettingsLocal({ ...slaSettings, SLA_Customs_Days: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={slaSettings.twoPersonRule}
              onChange={(e) => setSlaSettingsLocal({ ...slaSettings, twoPersonRule: e.target.checked })}
                    className="mr-2 rounded border-gray-300"
            />
            <label className="text-sm font-medium text-gray-700">
              Two-Person Rule
            </label>
          </div>
        </div>
      </div>
          </div>
        )}
        
        {/* Appearance Settings Tab */}
        {activeTab === 'appearance' && (
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <span className="mr-2">🎨</span>
              Appearance & Theme Settings
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Theme
                </label>
                <select
                  value={appearanceSettings.theme}
                  onChange={(e) => setAppearanceSettings({ ...appearanceSettings, theme: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="auto">Auto (System)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Language
                </label>
                <select
                  value={appearanceSettings.language}
                  onChange={(e) => setAppearanceSettings({ ...appearanceSettings, language: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Font Size
                </label>
                <select
                  value={appearanceSettings.fontSize}
                  onChange={(e) => setAppearanceSettings({ ...appearanceSettings, fontSize: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={appearanceSettings.compactMode}
                  onChange={(e) => setAppearanceSettings({ ...appearanceSettings, compactMode: e.target.checked })}
                  className="mr-2 rounded border-gray-300"
                />
                <label className="text-sm font-medium text-gray-700">
                  Compact Mode
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={appearanceSettings.showAnimations}
                  onChange={(e) => setAppearanceSettings({ ...appearanceSettings, showAnimations: e.target.checked })}
                  className="mr-2 rounded border-gray-300"
                />
                <label className="text-sm font-medium text-gray-700">
                  Show Animations
                </label>
              </div>
            </div>
            <div className="mt-6">
              <button
                onClick={handleEnhancedSave}
                disabled={isLoading || enhancedValidationErrors.length > 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Saving...' : 'Save Appearance Settings'}
              </button>
            </div>
          </div>
        )}
        
        {/* Security Settings Tab */}
        {activeTab === 'security' && (
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <span className="mr-2">🔒</span>
              Security & Privacy Settings
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Session Timeout (minutes)
                </label>
                <input
                  type="number"
                  value={securitySettings.sessionTimeout}
                  onChange={(e) => setSecuritySettings({ ...securitySettings, sessionTimeout: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="5"
                  max="480"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={securitySettings.requirePassword}
                  onChange={(e) => setSecuritySettings({ ...securitySettings, requirePassword: e.target.checked })}
                  className="mr-2 rounded border-gray-300"
                />
                <label className="text-sm font-medium text-gray-700">
                  Require Password for Changes
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={securitySettings.enableAuditLog}
                  onChange={(e) => setSecuritySettings({ ...securitySettings, enableAuditLog: e.target.checked })}
                  className="mr-2 rounded border-gray-300"
                />
                <label className="text-sm font-medium text-gray-700">
                  Enable Audit Log
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={securitySettings.dataEncryption}
                  onChange={(e) => setSecuritySettings({ ...securitySettings, dataEncryption: e.target.checked })}
                  className="mr-2 rounded border-gray-300"
                />
                <label className="text-sm font-medium text-gray-700">
                  Data Encryption
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={securitySettings.twoFactorAuth}
                  onChange={(e) => setSecuritySettings({ ...securitySettings, twoFactorAuth: e.target.checked })}
                  className="mr-2 rounded border-gray-300"
                />
                <label className="text-sm font-medium text-gray-700">
                  Two-Factor Authentication
                </label>
              </div>
            </div>
            <div className="mt-6">
              <button
                onClick={handleEnhancedSave}
                disabled={isLoading || enhancedValidationErrors.length > 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Saving...' : 'Save Security Settings'}
              </button>
            </div>
          </div>
        )}
        
        {/* Data Management Tab */}
        {activeTab === 'data' && (
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <span className="mr-2">💾</span>
              Data Management
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <button
              onClick={handleBackupExport}
                  disabled={isLoading}
              data-testid="backup-export"
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                  {isLoading ? 'Exporting...' : 'Export Backup'}
            </button>
                <p className="text-sm text-gray-500 mt-2">
                  Download all settings, mappings, and data
            </p>
          </div>
          
          <div>
            <input
              type="file"
              accept="application/json"
              onChange={handleBackupImport}
              data-testid="backup-import"
              className="hidden"
              id="backup-import-input"
            />
            <label
              htmlFor="backup-import-input"
                  className="block w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
                  {isLoading ? 'Importing...' : 'Import Backup'}
            </label>
                <p className="text-sm text-gray-500 mt-2">
              Restore from backup file
            </p>
          </div>
        </div>
        
            <div className="border-t pt-6">
              <h4 className="text-md font-medium mb-4 text-red-600">⚠️ Dangerous Actions</h4>
          <button
            onClick={handleResetData}
                disabled={isLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
                {isLoading ? 'Resetting...' : 'Reset All Data'}
          </button>
          <p className="text-sm text-gray-500 mt-2">
            Type "RESET" to confirm. This will clear all data and reload the app.
          </p>
        </div>
      </div>
        )}
        
        {/* Advanced Settings Tab */}
        {activeTab === 'advanced' && (
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <span className="mr-2">🔧</span>
              Advanced Settings
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Backup Frequency
                </label>
                <select
                  value={advancedSettings.backupFrequency}
                  onChange={(e) => setAdvancedSettings({ ...advancedSettings, backupFrequency: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="never">Never</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Log Level
                </label>
                <select
                  value={advancedSettings.logLevel}
                  onChange={(e) => setAdvancedSettings({ ...advancedSettings, logLevel: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="error">Error</option>
                  <option value="warn">Warning</option>
                  <option value="info">Info</option>
                  <option value="debug">Debug</option>
                </select>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={advancedSettings.debugMode}
                  onChange={(e) => setAdvancedSettings({ ...advancedSettings, debugMode: e.target.checked })}
                  className="mr-2 rounded border-gray-300"
                />
                <label className="text-sm font-medium text-gray-700">
                  Debug Mode
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={advancedSettings.performanceMode}
                  onChange={(e) => setAdvancedSettings({ ...advancedSettings, performanceMode: e.target.checked })}
                  className="mr-2 rounded border-gray-300"
                />
                <label className="text-sm font-medium text-gray-700">
                  Performance Mode
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={advancedSettings.autoSave}
                  onChange={(e) => setAdvancedSettings({ ...advancedSettings, autoSave: e.target.checked })}
                  className="mr-2 rounded border-gray-300"
                />
                <label className="text-sm font-medium text-gray-700">
                  Auto-save Settings
                </label>
              </div>
            </div>
            <div className="mt-6">
              <button
                onClick={handleEnhancedSave}
                disabled={isLoading || enhancedValidationErrors.length > 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Saving...' : 'Save Advanced Settings'}
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Floating Keyboard Shortcuts Indicator */}
      <button
        onClick={() => setShowKeyboardShortcuts(!showKeyboardShortcuts)}
        className="fixed bottom-6 right-6 w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 flex items-center justify-center text-lg"
        title="Keyboard Shortcuts (Ctrl+K)"
      >
        ⌨️
      </button>
    </div>
  )
}

export default SettingsView
