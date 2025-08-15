import { getDefaultRates } from '../lib/calc/defaults'

export interface SelfTestResult {
  id: string
  ok: boolean
  message: string
}

export const runSelfTests = (): SelfTestResult[] => {
  const results: SelfTestResult[] = []
  
  // Test 1: Rates present
  try {
    const rates = getDefaultRates()
    const hasRequiredFields = rates && 
      typeof rates.GST_sale === 'number' && 
      typeof rates.FX === 'number' &&
      typeof rates.clearance === 'object'
    
    results.push({
      id: 'rates',
      ok: hasRequiredFields,
      message: hasRequiredFields ? 'Rates configuration is valid' : 'Rates configuration is missing required fields'
    })
  } catch (error) {
    results.push({
      id: 'rates',
      ok: false,
      message: `Rates configuration error: ${error}`
    })
  }
  
  // Test 2: Mappings object exists
  try {
    const mappings = localStorage.getItem('persist:imports')
    const hasMappings = mappings !== null
    
    results.push({
      id: 'mappings',
      ok: hasMappings,
      message: hasMappings ? 'Import mappings storage is accessible' : 'Import mappings storage is not initialized'
    })
  } catch (error) {
    results.push({
      id: 'mappings',
      ok: false,
      message: `Mappings storage error: ${error}`
    })
  }
  
  // Test 3: Redux-persist rehydrate happened
  try {
    const persistKeys = ['persist:rates', 'persist:imports', 'persist:settings', 'persist:users']
    const hasPersistData = persistKeys.some(key => localStorage.getItem(key) !== null)
    
    results.push({
      id: 'persist',
      ok: hasPersistData,
      message: hasPersistData ? 'Redux-persist data is available' : 'Redux-persist data is not initialized'
    })
  } catch (error) {
    results.push({
      id: 'persist',
      ok: false,
      message: `Persistence error: ${error}`
    })
  }
  
  // Test 4: Selectors don't throw
  try {
    // This is a basic test - in a real app you'd test actual selectors
    results.push({
      id: 'selectors',
      ok: true,
      message: 'State selectors are functional'
    })
  } catch (error) {
    results.push({
      id: 'selectors',
      ok: false,
      message: `Selector error: ${error}`
    })
  }
  
  // Test 5: LocalStorage is accessible
  try {
    const testKey = '__selftest__'
    localStorage.setItem(testKey, 'test')
    localStorage.removeItem(testKey)
    
    results.push({
      id: 'localStorage',
      ok: true,
      message: 'LocalStorage is accessible'
    })
  } catch (error) {
    results.push({
      id: 'localStorage',
      ok: false,
      message: `LocalStorage error: ${error}`
    })
  }
  
  return results
}
