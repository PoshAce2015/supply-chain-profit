import React from 'react'

interface HeaderMapperProps {
  headers: string[]
  mapping: Record<string, string>
  onChange: (mapping: Record<string, string>) => void
}

const HeaderMapper: React.FC<HeaderMapperProps> = ({
  headers,
  mapping,
  onChange,
}) => {
  const handleFieldChange = (header: string, canonicalField: string) => {
    const newMapping = { ...mapping }
    if (canonicalField.trim()) {
      newMapping[header] = canonicalField.trim()
    } else {
      delete newMapping[header]
    }
    onChange(newMapping)
  }

  return (
    <div className="space-y-2">
      {headers.map((header) => (
        <div key={header} className="flex items-center space-x-4">
          <div className="w-1/3 text-sm font-medium text-gray-700">
            {header}
          </div>
          <div className="w-2/3">
            <input
              type="text"
              value={mapping[header] || ''}
              onChange={(e) => handleFieldChange(header, e.target.value)}
              placeholder="Canonical field name"
              className="w-full px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      ))}
    </div>
  )
}

export default HeaderMapper
