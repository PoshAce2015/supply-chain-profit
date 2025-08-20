import React, { useState } from 'react'

interface HeaderMapperProps {
  headers: string[]
  mapping: Record<string, string>
  onChange: (mapping: Record<string, string>) => void
}

// Common field mappings for different data types
const FIELD_SUGGESTIONS: Record<string, string[]> = {
  // Product fields
  'product_id': ['product_id', 'id', 'asin', 'sku', 'product_sku', 'item_id'],
  'title': ['title', 'name', 'product_name', 'item_title', 'product_title'],
  'price': ['price', 'cost', 'amount', 'value', 'unit_price', 'selling_price'],
  'quantity': ['quantity', 'qty', 'stock', 'inventory', 'available_quantity'],
  
  // Order fields
  'order_id': ['order_id', 'id', 'order_number', 'po_number', 'purchase_order'],
  'order_date': ['order_date', 'date', 'created_date', 'order_created', 'purchase_date'],
  'status': ['status', 'order_status', 'state', 'condition', 'fulfillment_status'],
  
  // Customer fields
  'customer_id': ['customer_id', 'id', 'buyer_id', 'user_id', 'account_id'],
  'customer_name': ['customer_name', 'name', 'buyer_name', 'customer', 'account_name'],
  'email': ['email', 'customer_email', 'buyer_email', 'contact_email'],
  
  // Financial fields
  'revenue': ['revenue', 'sales', 'total', 'amount', 'gross_revenue'],
  'profit': ['profit', 'margin', 'net_profit', 'earnings', 'income'],
  'fees': ['fees', 'commission', 'charges', 'costs', 'expenses'],
  
  // Date fields
  'date': ['date', 'created_date', 'timestamp', 'created_at', 'date_created'],
  'updated_date': ['updated_date', 'modified_date', 'last_updated', 'date_modified'],
  
  // Location fields
  'country': ['country', 'nation', 'region', 'location', 'marketplace'],
  'city': ['city', 'town', 'location', 'address_city'],
  'state': ['state', 'province', 'region', 'area'],
  
  // Generic fields
  'description': ['description', 'desc', 'details', 'notes', 'comments'],
  'category': ['category', 'type', 'classification', 'group', 'department'],
  'brand': ['brand', 'manufacturer', 'vendor', 'supplier', 'company'],
}

const HeaderMapper: React.FC<HeaderMapperProps> = ({
  headers,
  mapping,
  onChange,
}) => {
  const [suggestions, setSuggestions] = useState<Record<string, string[]>>({})
  const [showSuggestions, setShowSuggestions] = useState<Record<string, boolean>>({})

  const getSuggestions = (header: string): string[] => {
    const headerLower = header.toLowerCase()
    const matchedFields: string[] = []
    
    // Check for exact matches and partial matches
    Object.entries(FIELD_SUGGESTIONS).forEach(([canonicalField, variations]) => {
      if (variations.some(variation => 
        headerLower.includes(variation.toLowerCase()) || 
        variation.toLowerCase().includes(headerLower)
      )) {
        matchedFields.push(canonicalField)
      }
    })
    
    return matchedFields.slice(0, 5) // Limit to 5 suggestions
  }

  const handleFieldChange = (header: string, canonicalField: string) => {
    const newMapping = { ...mapping }
    if (canonicalField.trim()) {
      newMapping[header] = canonicalField.trim()
    } else {
      delete newMapping[header]
    }
    onChange(newMapping)
  }

  const handleSuggestionClick = (header: string, suggestion: string) => {
    handleFieldChange(header, suggestion)
    setShowSuggestions(prev => ({ ...prev, [header]: false }))
  }

  const handleInputFocus = (header: string) => {
    const headerSuggestions = getSuggestions(header)
    setSuggestions(prev => ({ ...prev, [header]: headerSuggestions }))
    setShowSuggestions(prev => ({ ...prev, [header]: true }))
  }

  const handleInputBlur = (header: string) => {
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => {
      setShowSuggestions(prev => ({ ...prev, [header]: false }))
    }, 200)
  }

  const getMappingStatus = (header: string) => {
    const currentMapping = mapping[header]
    if (!currentMapping) return 'unmapped'
    
    // Check if it's a valid canonical field
    const isValidField = Object.keys(FIELD_SUGGESTIONS).includes(currentMapping)
    return isValidField ? 'mapped' : 'custom'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'mapped': return 'text-green-600 bg-green-50 border-green-200'
      case 'custom': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'unmapped': return 'text-gray-600 bg-gray-50 border-gray-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'mapped': return '✅'
      case 'custom': return '⚠️'
      case 'unmapped': return '❓'
      default: return '❓'
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h5 className="text-sm font-medium text-gray-900">Column Mapping</h5>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <span>✅</span>
            <span className="text-green-600">Mapped</span>
          </div>
          <div className="flex items-center gap-1">
            <span>⚠️</span>
            <span className="text-yellow-600">Custom</span>
          </div>
          <div className="flex items-center gap-1">
            <span>❓</span>
            <span className="text-gray-600">Unmapped</span>
          </div>
        </div>
      </div>

      <div className="grid gap-3">
        {headers.map((header) => {
          const status = getMappingStatus(header)
          const headerSuggestions = suggestions[header] || getSuggestions(header)
          
          return (
            <div key={header} className="relative">
              <div className="flex items-center gap-3">
                {/* Header Column */}
                <div className="w-1/3">
                  <div className={`px-3 py-2 rounded-lg border text-sm font-medium ${getStatusColor(status)}`}>
                    <div className="flex items-center gap-2">
                      <span>{getStatusIcon(status)}</span>
                      <span className="truncate">{header}</span>
                    </div>
                  </div>
                </div>
                
                {/* Mapping Input */}
                <div className="w-2/3 relative">
                  <input
                    type="text"
                    value={mapping[header] || ''}
                    onChange={(e) => handleFieldChange(header, e.target.value)}
                    onFocus={() => handleInputFocus(header)}
                    onBlur={() => handleInputBlur(header)}
                    placeholder="Enter canonical field name..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  
                  {/* Suggestions Dropdown */}
                  {showSuggestions[header] && headerSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                      <div className="p-2">
                        <div className="text-xs font-medium text-gray-500 mb-2 px-2">Suggestions:</div>
                        {headerSuggestions.map((suggestion) => (
                          <button
                            key={suggestion}
                            onClick={() => handleSuggestionClick(header, suggestion)}
                            className="w-full text-left px-2 py-1 text-sm hover:bg-blue-50 rounded flex items-center gap-2"
                          >
                            <span className="text-blue-600">→</span>
                            <span className="font-medium">{suggestion}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Field Description */}
              {mapping[header] && FIELD_SUGGESTIONS[mapping[header]] && (
                <div className="mt-1 ml-4 text-xs text-gray-500">
                  Maps to: {mapping[header]} (standard field)
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Mapping Summary */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h6 className="text-sm font-medium text-gray-900 mb-2">Mapping Summary</h6>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="text-green-600 text-2xl font-bold">
              {headers.filter(h => getMappingStatus(h) === 'mapped').length}
            </div>
            <div className="text-gray-600">Mapped Fields</div>
          </div>
          <div className="text-center">
            <div className="text-yellow-600 text-2xl font-bold">
              {headers.filter(h => getMappingStatus(h) === 'custom').length}
            </div>
            <div className="text-gray-600">Custom Fields</div>
          </div>
          <div className="text-center">
            <div className="text-gray-600 text-2xl font-bold">
              {headers.filter(h => getMappingStatus(h) === 'unmapped').length}
            </div>
            <div className="text-gray-600">Unmapped Fields</div>
          </div>
        </div>
      </div>

      {/* Help Text */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-2">
          <span className="text-blue-600 text-sm">💡</span>
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Mapping Tips:</p>
            <ul className="text-xs space-y-1">
              <li>• Use standard field names for better data integration</li>
              <li>• Click on suggestions to auto-fill field mappings</li>
              <li>• Custom field names are allowed but may need manual processing</li>
              <li>• Unmapped fields will be ignored during import</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HeaderMapper
