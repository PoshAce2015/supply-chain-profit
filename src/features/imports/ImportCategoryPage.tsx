import React, { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { CategorySchema } from './categorySchemas'
import { importFile, downloadTemplate } from './upload'
import { setTimelineData, setIngestResult } from '../orders/ordersSlice'
import { PURCHASE_VENDOR_LABELS, type PurchaseVendorId, normalizeDomain } from '../../types/purchase'
import { CHANNEL_LABELS } from '../../lib/types'

interface ImportCategoryPageProps {
  category: CategorySchema
}

const ImportCategoryPage: React.FC<ImportCategoryPageProps> = ({ category }) => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<{
    success: boolean
    message: string
    errors?: string[]
    warnings?: string[]
  } | null>(null)

  // Sales source state
  const [selectedChannel, setSelectedChannel] = useState('')
  const [selectedAmazonAccount, setSelectedAmazonAccount] = useState('')

  // Purchase source state
  const [purchaseVendor, setPurchaseVendor] = useState<PurchaseVendorId | ''>('')
  const [customDomain, setCustomDomain] = useState('')
  const [domainError, setDomainError] = useState<string | null>(null)

  const CHANNELS = [
    { id: 'amazon_seller_central', label: 'Amazon Seller Central' },
    { id: 'flipkart',  label: 'Flipkart' },
    { id: 'poshace',   label: CHANNEL_LABELS.poshace },
    { id: 'website',   label: 'Website' },
    { id: 'other',     label: 'Other' }
  ] as const;

  const AMAZON_ACCOUNTS = [
    { id: 'DG', label: 'DG' },
    { id: 'PT', label: 'PT' },
    { id: 'PRT', label: 'PRT' },
    { id: 'NKM', label: 'NKM' },
    { id: 'DJ', label: 'DJ' },
    { id: 'IM', label: 'IM' }
  ] as const;

  const PURCHASE_VENDORS: { id: PurchaseVendorId; label: string }[] = [
    { id: 'amazon_com', label: PURCHASE_VENDOR_LABELS.amazon_com },
    { id: 'walmart_com', label: PURCHASE_VENDOR_LABELS.walmart_com },
    { id: 'ebay_com',    label: PURCHASE_VENDOR_LABELS.ebay_com },
    { id: 'newegg_com',  label: PURCHASE_VENDOR_LABELS.newegg_com },
    { id: 'custom',      label: PURCHASE_VENDOR_LABELS.custom },
  ];

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      await handleFileUpload(files[0])
    }
  }, [])

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      await handleFileUpload(files[0])
    }
  }, [])

  const handleFileUpload = async (file: File | undefined) => {
    if (!file) return
    
    setIsUploading(true)
    setUploadResult(null)

    try {
      // For sales category, pass the source metadata
      let sourceInfo: any = undefined;
      if (category.id === 'sales') {
        sourceInfo = {
          channel: selectedChannel,
          amazonAccount: selectedChannel === 'amazon_seller_central' ? selectedAmazonAccount : undefined
        };
      } else if (category.id === 'purchase') {
        sourceInfo = {
          vendor: purchaseVendor,
          domain: purchaseVendor === 'custom' ? customDomain : undefined
        };
      }

      const result = await importFile(file, category.id, sourceInfo)
      
      if (result.success) {
        setUploadResult({
          success: true,
          message: `Successfully imported ${result.rowsCount} rows into ${category.title}`,
          warnings: result.warnings
        })
        
        // Show toast notification with timeline link
        if (typeof window !== 'undefined' && (window as any).showToast) {
          (window as any).showToast({
            type: 'success',
            message: `Imported ${result.rowsCount} rows into ${category.title}`,
            actions: [
              { label: 'Back to Imports', action: () => navigate('/imports') },
              { label: 'View Timeline', action: () => navigate('/timeline') }
            ]
          })
        }
      } else {
        setUploadResult({
          success: false,
          message: 'Import failed',
          errors: result.errors,
          warnings: result.warnings
        })
      }
    } catch (error) {
      setUploadResult({
        success: false,
        message: `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleTemplateDownload = () => {
    downloadTemplate(category.id)
  }

  // Check if dropzone should be disabled
  const isDropzoneDisabled = 
    (category.id === 'sales' && !selectedChannel) ||
    (category.id === 'sales' && selectedChannel === 'amazon_seller_central' && !selectedAmazonAccount) ||
    (category.id === 'purchase' && !purchaseVendor) ||
    (category.id === 'purchase' && purchaseVendor === 'custom' && (!normalizeDomain(customDomain) || domainError));

  // Check if expected columns should be shown for sales
  const shouldShowExpectedColumns = 
    category.id !== 'sales' || 
    (selectedChannel && (selectedChannel !== 'amazon_seller_central' || selectedAmazonAccount));

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => navigate('/imports')}
            className="btn-neutral px-3 py-2 rounded-lg"
          >
            ← Back to Imports
          </button>
          <h1 data-testid="imp-category-title" className="text-3xl font-bold text-gray-900">
            {category.icon} {category.title}
          </h1>
        </div>
        <p className="text-gray-600 text-lg">{category.help}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Upload Area */}
        <div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Upload File</h2>
            
            {/* Sales Source Controls */}
            {category.id === 'sales' && (
              <div className="mb-6 space-y-4">
                <div>
                  <label htmlFor="sales-source-select" className="block text-sm font-medium text-gray-700 mb-2">
                    Sales source
                  </label>
                  <select
                    id="sales-source-select"
                    data-testid="sales-source-select"
                    value={selectedChannel}
                    onChange={(e) => {
                      setSelectedChannel(e.target.value)
                      if (e.target.value !== 'amazon_seller_central') {
                        setSelectedAmazonAccount('')
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a channel...</option>
                    {CHANNELS.map(channel => (
                      <option key={channel.id} value={channel.id}>
                        {channel.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                {selectedChannel === 'amazon_seller_central' && (
                  <div>
                    <label htmlFor="amazon-account-select" className="block text-sm font-medium text-gray-700 mb-2">
                      Amazon Seller Central Account
                    </label>
                    <select
                      id="amazon-account-select"
                      data-testid="amazon-account-select"
                      value={selectedAmazonAccount}
                      onChange={(e) => setSelectedAmazonAccount(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select an account...</option>
                      {AMAZON_ACCOUNTS.map(account => (
                        <option key={account.id} value={account.id}>
                          {account.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                
                <p className="text-xs text-gray-500">
                  Stamped on each row and shown in order timelines.
                </p>
              </div>
            )}

            {/* Purchase Source Controls */}
            {category.id === 'purchase' && (
              <div className="mb-6">
                <div className="mb-3 grid gap-2 sm:grid-cols-[260px_1fr] items-end">
                  <label className="block">
                    <div className="text-sm text-slate-600 mb-1">Purchase source</div>
                    <select
                      data-testid="purchase-source-select"
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                      value={purchaseVendor}
                      onChange={e => {
                        const v = e.target.value as PurchaseVendorId | '';
                        setPurchaseVendor(v);
                        if (v !== 'custom') {
                          setCustomDomain('');
                          setDomainError(null);
                        }
                      }}
                    >
                      <option value="">— Select —</option>
                      {PURCHASE_VENDORS.map(o => (
                        <option key={o.id} value={o.id}>{o.label}</option>
                      ))}
                    </select>
                  </label>

                  {purchaseVendor === 'custom' && (
                    <label className="block">
                      <div className="text-sm text-slate-600 mb-1">Domain</div>
                      <input
                        data-testid="purchase-source-domain"
                        className={`w-full rounded-md border px-3 py-2 text-sm ${
                          domainError ? 'border-red-400' : 'border-slate-300'
                        }`}
                        placeholder="e.g., bhphotovideo.com"
                        value={customDomain}
                        onChange={e => {
                          setCustomDomain(e.target.value);
                          const d = normalizeDomain(e.target.value);
                          setDomainError(d ? null : 'Enter a valid domain');
                        }}
                        onBlur={() => {
                          const d = normalizeDomain(customDomain);
                          if (!d) setDomainError('Enter a valid domain');
                          else {
                            setCustomDomain(d);
                            setDomainError(null);
                          }
                        }}
                      />
                      {domainError && <div className="mt-1 text-xs text-red-500">{domainError}</div>}
                    </label>
                  )}
                </div>

                <p data-testid="purchase-source-help" className="text-xs text-slate-500 mb-2">
                  The selected source will be stamped on each row and used in reconciliation & timelines.
                </p>
              </div>
            )}
            
            {/* Dropzone */}
            <div
              data-testid="imp-dropzone"
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
                isDragging
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-300 hover:border-gray-400'
              } ${isUploading || isDropzoneDisabled ? 'opacity-50 pointer-events-none' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {isUploading ? (
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
                  <p className="text-gray-600">Processing file...</p>
                </div>
              ) : isDropzoneDisabled ? (
                <div>
                  <div className="text-4xl mb-4">📁</div>
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    {category.id === 'sales' 
                      ? (selectedChannel === 'amazon_seller_central' && !selectedAmazonAccount 
                          ? 'Select an Amazon account first' 
                          : 'Select a sales source first')
                      : 'Select a purchase source first'
                    }
                  </p>
                  <p className="text-gray-600 mb-4">
                    {category.id === 'sales' && selectedChannel === 'amazon_seller_central' && !selectedAmazonAccount
                      ? 'Choose an Amazon Seller Central account above to enable file upload'
                      : 'Choose a source above to enable file upload'
                    }
                  </p>
                </div>
              ) : (
                <div>
                  <div className="text-4xl mb-4">📁</div>
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    Drop your file here
                  </p>
                  <p className="text-gray-600 mb-4">
                    or click to browse
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    Supported formats: {category.accept.join(', ')}
                  </p>
                  <input
                    type="file"
                    accept={category.accept.join(',')}
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="btn-primary px-6 py-2 rounded-lg cursor-pointer inline-block"
                  >
                    Choose File
                  </label>
                </div>
              )}
            </div>

            {/* Upload Result */}
            {uploadResult && (
              <div className={`mt-4 p-4 rounded-lg ${
                uploadResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}>
                <p className={`font-medium ${
                  uploadResult.success ? 'text-green-800' : 'text-red-800'
                }`}>
                  {uploadResult.message}
                </p>

                {uploadResult.success && (
                  <div className="mt-3 flex items-center gap-3">
                    <button
                      onClick={() => navigate('/imports')}
                      className="px-3 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      ← Back to Imports
                    </button>
                    <button
                      onClick={() => navigate('/timeline')}
                      className="px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                    >
                      📊 View Timeline
                    </button>
                  </div>
                )}
                
                {uploadResult.errors && uploadResult.errors.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-red-700 mb-1">Errors:</p>
                    <ul className="text-sm text-red-600 list-disc list-inside">
                      {uploadResult.errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {uploadResult.warnings && uploadResult.warnings.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-yellow-700 mb-1">Warnings:</p>
                    <ul className="text-sm text-yellow-600 list-disc list-inside">
                      {uploadResult.warnings.map((warning, index) => (
                        <li key={index}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Schema Info */}
        <div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Expected Columns</h2>
            
            {!shouldShowExpectedColumns ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">📋</div>
                <p className="text-lg font-medium text-gray-900 mb-2">
                  Select your sales source first
                </p>
                <p className="text-gray-600">
                  Choose a sales source above to see the expected columns
                </p>
              </div>
            ) : (
              <>
                {/* Columns Table */}
                <div className="overflow-x-auto">
                  <table data-testid="imp-columns-table" className="min-w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 px-3 font-medium text-gray-900">Column</th>
                        <th className="text-left py-2 px-3 font-medium text-gray-900">Required</th>
                        <th className="text-left py-2 px-3 font-medium text-gray-900">Example</th>
                      </tr>
                    </thead>
                    <tbody>
                      {category.schema
                        .filter(column => column.key !== 'order-type') // Remove Order Type column
                        .map((column, index) => (
                        <tr key={index} className="border-b border-gray-100">
                          <td className="py-2 px-3 text-gray-900 font-medium">
                            {column.label}
                          </td>
                          <td className="py-2 px-3">
                            {column.required ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Required
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                Optional
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-3 text-gray-600 text-sm">
                            {column.example || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* Template Download */}
            {shouldShowExpectedColumns && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Get Started</h3>
                <p className="text-gray-600 mb-4">
                  Download a template file to see the expected format and get started quickly.
                </p>
                <button
                  data-testid="imp-template-download"
                  onClick={handleTemplateDownload}
                  className="btn-secondary px-4 py-2 rounded-lg"
                >
                  📥 Download Template
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ImportCategoryPage
