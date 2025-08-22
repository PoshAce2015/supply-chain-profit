import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../app/store'

interface DataViewerProps {
  fileType: 'userPurchase' | 'userSales'
}

const DataViewer: React.FC<DataViewerProps> = ({ fileType }) => {
  const [showData, setShowData] = useState(false)
  
  // Get data from Redux store
  const data = useSelector((state: RootState) => {
    switch (fileType) {
      case 'userPurchase':
        return state.imports.datasets.userPurchase
      case 'userSales':
        return state.imports.datasets.userSales
      default:
        return []
    }
  })

  const timelineData = useSelector((state: RootState) => {
    switch (fileType) {
      case 'userPurchase':
        return state.imports.timelineData.userPurchase
      case 'userSales':
        return state.imports.timelineData.userSales
      default:
        return []
    }
  })

  if (data.length === 0 && timelineData.length === 0) {
    return null
  }

  const displayData = data.length > 0 ? data : timelineData
  const headers = displayData.length > 0 ? Object.keys(displayData[0]) : []

  return (
    <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-green-900">
          ✅ {fileType === 'userPurchase' ? 'Purchase' : 'Sales'} Data Imported Successfully
        </h3>
        <button
          onClick={() => setShowData(!showData)}
          className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
        >
          {showData ? 'Hide Data' : 'View Data'}
        </button>
      </div>
      
      <div className="text-sm text-green-700 mb-3">
        <strong>{displayData.length}</strong> rows imported successfully
      </div>

      {showData && (
        <div className="bg-white rounded border border-green-300 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-green-200">
              <thead className="bg-green-50">
                <tr>
                  {headers.map((header, index) => (
                    <th
                      key={index}
                      className="px-3 py-2 text-left text-xs font-medium text-green-700 uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-green-200">
                {displayData.slice(0, 10).map((row, rowIndex) => (
                  <tr key={rowIndex} className="hover:bg-green-50">
                    {headers.map((header, colIndex) => (
                      <td
                        key={colIndex}
                        className="px-3 py-2 text-sm text-green-900 max-w-xs truncate"
                        title={String(row[header] || '')}
                      >
                        {String(row[header] || '').substring(0, 50)}
                        {String(row[header] || '').length > 50 ? '...' : ''}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {displayData.length > 10 && (
            <div className="px-3 py-2 bg-green-50 text-xs text-green-600 border-t border-green-200">
              Showing first 10 rows of {displayData.length} total rows
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default DataViewer
