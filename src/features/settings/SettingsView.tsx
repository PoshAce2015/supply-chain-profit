import React, { useState } from 'react'
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
  
  const [rates, setRatesLocal] = useState<Rates>(currentRates)
  const [slaSettings, setSlaSettingsLocal] = useState({
    SLA_PO_Hours: 48,
    SLA_Customs_Days: 7,
    twoPersonRule: true
  })
  
  const handleSave = () => {
    dispatch(setRates(rates))
    dispatch(setSettings(slaSettings))
  }
  
  const handleResetData = () => {
    const userInput = prompt('This will clear all imported data, mappings, and settings. Type RESET to confirm:')
    if (userInput === 'RESET') {
      localStorage.clear()
      window.location.reload()
    }
  }

  const handleBackupExport = () => {
    // Get all persisted data from localStorage
    const backup = {
      rates: rates,
      mappings: mappings,
      slaSettings: slaSettings,
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
  }

  const handleBackupImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!confirm('This will overwrite all current settings and mappings. Are you sure?')) {
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const backup = JSON.parse(e.target?.result as string)
        
        // Restore rates
        if (backup.rates) {
          dispatch(setRates(backup.rates))
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
        }
        
        // Reload to ensure all data is properly restored
        window.location.reload()
      } catch (error) {
        console.error('Failed to import backup:', error)
        alert('Failed to import backup. Please check the file format.')
      }
    }
    reader.readAsText(file)
  }
  
  const handleResetRates = () => {
    const defaults = getDefaultRates()
    setRatesLocal(defaults)
  }
  
  return (
    <div data-testid="settings-view" className="p-6">
      <h2 className="text-xl font-semibold mb-4">Settings</h2>
      
      {/* Rates Settings */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
        <h3 className="text-lg font-medium mb-4">Calculation Rates</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              GST Sale (%)
            </label>
            <input
              type="number"
              value={rates.GST_sale}
              onChange={(e) => setRatesLocal({ ...rates, GST_sale: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            />
          </div>
        </div>
        <div className="mt-4 space-x-4">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Save Rates
          </button>
          <button
            onClick={handleResetRates}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Reset to Defaults
          </button>
        </div>
      </div>
      
      {/* SLA Settings */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
        <h3 className="text-lg font-medium mb-4">SLA Settings</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              SLA PO Hours
            </label>
            <input
              type="number"
              value={slaSettings.SLA_PO_Hours}
              onChange={(e) => setSlaSettingsLocal({ ...slaSettings, SLA_PO_Hours: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={slaSettings.twoPersonRule}
              onChange={(e) => setSlaSettingsLocal({ ...slaSettings, twoPersonRule: e.target.checked })}
              className="mr-2"
            />
            <label className="text-sm font-medium text-gray-700">
              Two-Person Rule
            </label>
          </div>
        </div>
      </div>
      
      {/* Data Management */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium mb-4">Data Management</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <button
              onClick={handleBackupExport}
              data-testid="backup-export"
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Export Backup
            </button>
            <p className="text-sm text-gray-500 mt-1">
              Download all settings and mappings
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
              className="block w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-center cursor-pointer"
            >
              Import Backup
            </label>
            <p className="text-sm text-gray-500 mt-1">
              Restore from backup file
            </p>
          </div>
        </div>
        
        <div className="border-t pt-4">
          <button
            onClick={handleResetData}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Reset Local Data
          </button>
          <p className="text-sm text-gray-500 mt-2">
            Type "RESET" to confirm. This will clear all data and reload the app.
          </p>
        </div>
      </div>
    </div>
  )
}

export default SettingsView
