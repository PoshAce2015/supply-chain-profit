import React, { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { CategorySchema } from './categorySchemas'
import { handleImportFile, downloadTemplate } from './upload'

interface ImportCategoryPageProps {
  category: CategorySchema
}

const ImportCategoryPage: React.FC<ImportCategoryPageProps> = ({ category }) => {
  const navigate = useNavigate()
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<{
    success: boolean
    message: string
    errors?: string[]
    warnings?: string[]
  } | null>(null)

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

  const handleFileUpload = async (file: File) => {
    setIsUploading(true)
    setUploadResult(null)

    try {
      const result = await handleImportFile(category.id, file)
      
      if (result.success) {
        setUploadResult({
          success: true,
          message: `Successfully imported ${result.rowsCount} rows into ${category.title}`,
          warnings: result.warnings
        })
        
        // Show toast notification
        if (typeof window !== 'undefined' && (window as any).showToast) {
          (window as any).showToast({
            type: 'success',
            message: `Imported ${result.rowsCount} rows into ${category.title}`,
            actions: [
              { label: 'Back to Imports', action: () => navigate('/imports') },
              { label: 'View Orders', action: () => navigate('/orders') }
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
            
            {/* Dropzone */}
            <div
              data-testid="imp-dropzone"
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
                isDragging
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-300 hover:border-gray-400'
              } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {isUploading ? (
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
                  <p className="text-gray-600">Processing file...</p>
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
                  {category.schema.map((column, index) => (
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

            {/* Template Download */}
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
          </div>
        </div>
      </div>
    </div>
  )
}

export default ImportCategoryPage
