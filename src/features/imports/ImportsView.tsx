import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllCategories } from './categorySchemas'
import { useDispatch } from 'react-redux'
import { processFile } from './importsSlice'
import DataViewer from './DataViewer'

const ImportsView: React.FC = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const categories = getAllCategories()
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingStatus, setProcessingStatus] = useState('')

  // Set page title
  useEffect(() => {
    document.title = 'Data Imports - Supply Chain & Profit 1.0'
  }, [])

  const handleCategoryClick = (categoryId: string) => {
    navigate(`/imports/${categoryId}`)
  }

  // Test import function for user's files
  const handleTestImport = async (fileType: 'userPurchase' | 'userSales') => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = fileType === 'userPurchase' ? '.xlsx,.xls' : '.xls,.xlsx'
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      setIsProcessing(true)
      setProcessingStatus(`Processing ${file.name}...`)

      try {
        // Create a basic mapping based on the file type
        const mapping: Record<string, string> = {}
        
        if (fileType === 'userPurchase') {
          // Map common purchase file columns
          mapping['ASIN'] = 'asin'
          mapping['SKU'] = 'sku'
          mapping['Title'] = 'title'
          mapping['Brand'] = 'brand'
          mapping['Price'] = 'price'
          mapping['Quantity'] = 'qty'
          mapping['Order Date'] = 'order_date'
          mapping['Supplier'] = 'supplier'
          mapping['Unit Cost'] = 'unit_cost'
          mapping['Total Cost'] = 'total_cost'
        } else if (fileType === 'userSales') {
          // Map common sales file columns
          mapping['Order ID'] = 'order_id'
          mapping['Order Item ID'] = 'order_item_id'
          mapping['Purchase Date'] = 'purchase_date'
          mapping['SKU'] = 'sku'
          mapping['Product Name'] = 'product_name'
          mapping['Quantity Purchased'] = 'quantity_purchased'
          mapping['Sale Price'] = 'sale_price'
          mapping['Buyer Shipping'] = 'buyer_shipping'
          mapping['Channel'] = 'channel'
          mapping['Buyer Name'] = 'buyer_name'
          mapping['Ship City'] = 'ship_city'
          mapping['Ship State'] = 'ship_state'
        }

        // Process the file
        await dispatch(processFile(fileType, file, mapping) as any)
        
        setProcessingStatus(`✅ Successfully imported ${file.name}!`)
        setTimeout(() => {
          setIsProcessing(false)
          setProcessingStatus('')
        }, 3000)
        
      } catch (error) {
        console.error('Import error:', error)
        setProcessingStatus(`❌ Error importing ${file.name}: ${error}`)
        setTimeout(() => {
          setIsProcessing(false)
          setProcessingStatus('')
        }, 5000)
      }
    }

    input.click()
  }

  return (
    <div data-testid="imports-view" className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Data Imports
          </h1>
          <p className="text-gray-600 text-lg">
            Import your data files into the system. Choose a category below to get started.
          </p>
        </div>

        {/* Test Import Section for User's Files */}
        <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
          <h2 className="text-xl font-semibold text-blue-900 mb-4 flex items-center gap-2">
            <span>🧪</span>
            <span>Quick Test Import</span>
          </h2>
          <p className="text-blue-700 mb-4">
            Test your Purchase.xlsx and Sales.xls files with automatic column mapping:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <button
              onClick={() => handleTestImport('userPurchase')}
              disabled={isProcessing}
              className="p-4 bg-white rounded-lg border border-blue-300 hover:border-blue-400 hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">📊</span>
                <div className="text-left">
                  <div className="font-semibold text-blue-900">Test Purchase.xlsx</div>
                  <div className="text-sm text-blue-600">Import your purchase data</div>
                </div>
              </div>
            </button>
            
            <button
              onClick={() => handleTestImport('userSales')}
              disabled={isProcessing}
              className="p-4 bg-white rounded-lg border border-blue-300 hover:border-blue-400 hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">📈</span>
                <div className="text-left">
                  <div className="font-semibold text-blue-900">Test Sales.xls</div>
                  <div className="text-sm text-blue-600">Import your sales data</div>
                </div>
              </div>
            </button>
          </div>
          
          {processingStatus && (
            <div className="p-3 bg-white rounded-lg border border-blue-300">
              <div className="flex items-center gap-2">
                {isProcessing && (
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                )}
                <span className="text-sm text-blue-700">{processingStatus}</span>
              </div>
            </div>
          )}
          
          <div className="text-xs text-blue-600 mt-3">
            💡 <strong>Tip:</strong> These test imports use automatic column mapping. For custom mapping, use the categories below.
          </div>
        </div>

        {/* Data Viewers for Imported Data */}
        <DataViewer fileType="userPurchase" />
        <DataViewer fileType="userSales" />

        {/* Toolbar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">
              {categories.length} import categories available
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/imports/bulk')}
              className="btn-primary px-4 py-2 rounded-lg text-sm"
            >
              📦 Bulk Import
            </button>
            <button className="btn-neutral px-4 py-2 rounded-lg text-sm">
              📊 Import History
            </button>
            <button className="btn-neutral px-4 py-2 rounded-lg text-sm">
              ⚙️ Import Settings
            </button>
          </div>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <div
              key={category.id}
              data-testid={`imp-cat-${category.id}`}
              onClick={() => handleCategoryClick(category.id)}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer group"
            >
              {/* Card Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{category.icon}</span>
                  <h3 className="text-xl font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                    {category.title}
                  </h3>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-0">
                  {category.help}
                </p>
              </div>

              {/* Card Content */}
              <div className="p-6">
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Expected Columns</h4>
                  <div className="flex flex-wrap gap-2">
                    {category.schema.slice(0, 5).map((col, index) => (
                      <span
                        key={index}
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          col.required
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {col.label}
                      </span>
                    ))}
                    {category.schema.length > 5 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        +{category.schema.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="text-sm text-gray-500">
                    Accepts: {category.accept.join(', ')}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400 group-hover:text-indigo-500 transition-colors">
                      Click to import →
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Help Section */}
        <div className="mt-12 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Need Help?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Getting Started</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Use the Quick Test Import above for your Excel files</li>
                <li>• Choose the category that matches your data type</li>
                <li>• Download the template to see the expected format</li>
                <li>• Prepare your CSV file with the required columns</li>
                <li>• Upload and review the import results</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Supported Formats</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• CSV files (comma or tab separated)</li>
                <li>• TXT files with delimited data</li>
                <li>• Excel files (.xlsx, .xls) - first worksheet only</li>
                <li>• Maximum file size: 10MB</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ImportsView
