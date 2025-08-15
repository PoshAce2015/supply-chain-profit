import React, { useState } from 'react'
import { parsePasted } from './parse'
import { validateRows } from './engine'
import { ValidatorInputRow, ValidationResult } from './types'

const ValidatorView: React.FC = () => {
  const [inputText, setInputText] = useState('')
  const [parsedRows, setParsedRows] = useState<ValidatorInputRow[]>([])
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([])
  
  const handleParse = () => {
    const rows = parsePasted(inputText)
    setParsedRows(rows)
    setValidationResults([])
  }
  
  const handleValidate = () => {
    if (parsedRows.length === 0) return
    
    const results = validateRows(parsedRows)
    setValidationResults(results)
  }
  
  const formatINR = (amount: number) => {
    return `₹${Math.round(amount).toLocaleString('en-IN')}`
  }
  

  
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error': return 'text-red-600'
      case 'warn': return 'text-yellow-600'
      case 'info': return 'text-blue-600'
      default: return 'text-gray-600'
    }
  }
  
  return (
    <div data-testid="validator-view" className="p-6">
      <h2 className="text-xl font-semibold mb-4">Validator</h2>
      
      {/* Input Section */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
        <h3 className="text-lg font-medium mb-4">Paste Amazon Data</h3>
        <textarea
          data-testid="validator-input"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Paste CSV or TSV data here (ASIN, SKU, Category, SellingPriceINR, etc.)"
          className="w-full h-32 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="mt-4 space-x-4">
          <button
            onClick={handleParse}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Parse ({parsedRows.length} rows)
          </button>
          <button
            onClick={handleValidate}
            disabled={parsedRows.length === 0}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400"
          >
            Validate
          </button>
        </div>
      </div>
      
      {/* Results Table */}
      {validationResults.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-200">
            <h3 className="text-lg font-medium">Validation Results</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ASIN
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Selling Price (₹)
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actual Fees (₹)
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    GST on Fees (₹)
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Net Proceeds (₹)
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Issues
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {validationResults.map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-3 py-2 text-sm text-gray-900">
                      {row.asin || '-'}
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-900">
                      {row.sku || '-'}
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-900">
                      {row.category || '-'}
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-900 text-right">
                      {formatINR(row.sellingPriceINR)}
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-900 text-right">
                      {row.actualFeesINR ? formatINR(row.actualFeesINR) : '-'}
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-900 text-right">
                      {row.gstOnFeesINR ? formatINR(row.gstOnFeesINR) : '-'}
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-900 text-right">
                      {row.netProceedsINR ? formatINR(row.netProceedsINR) : '-'}
                    </td>
                    <td className="px-3 py-2 text-sm">
                      {row.issues.length > 0 ? (
                        <ul className="space-y-1">
                          {row.issues.map((issue, issueIndex) => (
                            <li
                              key={issueIndex}
                              className={`text-xs ${getSeverityColor(issue.severity)}`}
                            >
                              {issue.message}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-green-600 text-xs">✓ OK</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default ValidatorView
