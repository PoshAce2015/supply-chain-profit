# CSV Import & Data Mapping Documentation

## Overview

The CSV Import & Data Mapping page (`/imports`) is a comprehensive data ingestion system that allows users to upload, validate, map, and process CSV files for supply chain and profit analysis. This page provides a modern, user-friendly interface for handling various types of data files with advanced features for data transformation and batch processing.

## Table of Contents

1. [Page Structure](#page-structure)
2. [Supported File Types](#supported-file-types)
3. [Core Features](#core-features)
4. [Advanced Features](#advanced-features)
5. [User Interface Elements](#user-interface-elements)
6. [Data Validation](#data-validation)
7. [Field Mapping System](#field-mapping-system)
8. [Import Process](#import-process)
9. [Performance & Metrics](#performance--metrics)
10. [Best Practices](#best-practices)
11. [Troubleshooting](#troubleshooting)
12. [Technical Architecture](#technical-architecture)

## Page Structure

### Main Components

1. **Breadcrumb Navigation**
   - Dashboard → CSV Imports
   - Provides clear navigation context

2. **Page Header**
   - Title: "CSV Data Imports"
   - Description: "Upload and configure CSV files for data processing and analysis"
   - Action buttons for advanced features

3. **Action Buttons**
   - Import Wizard
   - Import History
   - Batch Import
   - Data Transformations
   - Performance Metrics
   - Export/Import Mappings

4. **CSV Templates Section**
   - Downloadable templates for each file type
   - Visual cards with descriptions and icons

5. **File Upload Tabs**
   - Tabbed interface for different file types
   - Individual upload areas with drag & drop support

6. **Help Section**
   - Getting started guide
   - Best practices
   - Troubleshooting tips

## Supported File Types

### 1. Keepa Data (`keepa`)
- **Purpose**: Amazon product data from Keepa API
- **Icon**: 📊
- **Key Fields**: ASIN, Category, Subcategory, MainCategory, Weight, WeightUnit, Dimensions, BatteryFlag
- **Use Case**: Product catalog management and analysis

### 2. India Listings (`indiaListings`)
- **Purpose**: Product listings from India marketplace
- **Icon**: 🇮🇳
- **Key Fields**: ASIN, SKU, SellingPriceINR, BuyerShippingINR, CommissionValue, CommissionMode, Channel
- **Use Case**: India marketplace operations and pricing

### 3. US Purchase Orders (`uspo`)
- **Purpose**: Purchase order data from US operations
- **Icon**: 📋
- **Key Fields**: ASIN, Vendor, UnitUSD, Qty, Status, OrderDate, ShippedDate, Tracking
- **Use Case**: Purchase order management and tracking

### 4. Events (`events`)
- **Purpose**: Event and activity data
- **Icon**: 📅
- **Key Fields**: ASIN, Event, Date, Carrier, Tracking
- **Use Case**: Supply chain event tracking and timeline management

### 5. Settlement (`settlement`)
- **Purpose**: Financial settlement data
- **Icon**: 💰
- **Key Fields**: ASIN, SKU, FeesTotalINR, NetAmountINR, Date
- **Use Case**: Financial reconciliation and profit analysis

## Core Features

### File Upload System

#### Drag & Drop Interface
- **Visual Feedback**: Border color changes during drag operations
- **File Validation**: Real-time validation of file type and size
- **Progress Tracking**: Visual progress bar during file processing
- **Error Handling**: Clear error messages for validation failures

#### File Validation Rules
- **File Type**: Must be CSV format
- **File Size**: Maximum 10MB per file
- **File Name**: Maximum 100 characters
- **Data Validation**: Minimum 1 row, maximum 10,000 rows
- **Header Requirement**: Must contain column headers

#### Upload States
1. **Idle**: Ready for file selection
2. **Dragging**: Visual feedback during drag operation
3. **Uploading**: Progress bar and processing indicator
4. **Complete**: Success message with file summary
5. **Error**: Error display with validation messages

### Data Preview System

#### Preview Features
- **Header Summary**: Displays column count and row count
- **Data Preview**: Shows first 5 rows in table format
- **Toggle Control**: Show/hide preview functionality
- **Responsive Table**: Horizontal scrolling for wide datasets

#### Preview Information
- Column headers with proper formatting
- Sample data rows (first 5)
- Total row count indicator
- File processing status

## Advanced Features

### Import Wizard

#### Wizard Steps
1. **Upload File**: Select and upload CSV file
2. **Validate Data**: Check data format and structure
3. **Map Fields**: Map CSV columns to system fields
4. **Review & Confirm**: Review settings and confirm import
5. **Import Data**: Process and import data

#### Wizard Benefits
- **Guided Process**: Step-by-step import workflow
- **Progress Tracking**: Visual progress indicators
- **Error Prevention**: Validation at each step
- **User Education**: Helpful descriptions for each step

### Import History

#### History Features
- **Import Records**: Track all import attempts
- **Status Tracking**: Success, error, or processing status
- **Performance Metrics**: Rows processed and processing time
- **Error Logging**: Detailed error messages for failed imports

#### History Display
- **Recent Imports**: Shows last 5 import attempts
- **Status Indicators**: Color-coded status badges
- **Timestamps**: Import date and time
- **Error Details**: Expandable error information

### Batch Import Manager

#### Batch Features
- **Multiple Files**: Process multiple CSV files simultaneously
- **Job Management**: Create and monitor batch import jobs
- **Progress Tracking**: Individual file progress within batch
- **Status Monitoring**: Overall batch job status

#### Batch Job States
- **Pending**: Job created, waiting to start
- **Running**: Currently processing files
- **Completed**: All files processed successfully
- **Failed**: One or more files failed

### Data Transformations

#### Transformation Types
1. **Filter**: Filter data based on conditions
2. **Map**: Transform field values
3. **Aggregate**: Summarize data
4. **Format**: Format data for consistency

#### Transformation Features
- **Enable/Disable**: Toggle transformations on/off
- **Configuration**: Customize transformation parameters
- **Preview**: See transformation results before applying
- **Chaining**: Apply multiple transformations in sequence

### Performance Metrics

#### Metrics Tracked
- **Processing Time**: Total time to process file
- **Rows per Second**: Processing speed
- **Memory Usage**: Memory consumption during processing
- **File Size**: Original file size
- **Success Rate**: Percentage of successful imports

#### Performance Dashboard
- **Overview Cards**: Key metrics at a glance
- **Recent Performance**: Last 3 import metrics
- **Trends**: Performance over time
- **Optimization Tips**: Suggestions for better performance

## User Interface Elements

### Navigation

#### Breadcrumb Navigation
```typescript
const breadcrumbs = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'CSV Imports', href: '/imports', current: true }
]
```

#### Tab Navigation
- **Visual Indicators**: Active tab highlighting
- **Status Badges**: File loaded indicators
- **Icons**: File type specific icons
- **Responsive Design**: Mobile-friendly tab layout

### Action Buttons

#### Primary Actions
- **Import Wizard**: Guided import process
- **Import History**: View import records
- **Batch Import**: Multi-file processing
- **Data Transformations**: Data manipulation tools

#### Secondary Actions
- **Export Mappings**: Save field mappings
- **Import Mappings**: Load saved mappings
- **Performance Metrics**: View processing statistics

### File Upload Interface

#### Upload Area States
```typescript
interface UploadState {
  isDragging: boolean
  isUploading: boolean
  progress: number
}
```

#### Visual Feedback
- **Border Colors**: Changes based on upload state
- **Progress Bar**: Real-time upload progress
- **Status Messages**: Clear feedback for each state
- **Error Display**: Prominent error message placement

## Data Validation

### File-Level Validation

#### Format Validation
- **File Extension**: Must end with `.csv`
- **File Size**: Maximum 10MB limit
- **File Name**: Length and character restrictions
- **Encoding**: UTF-8 encoding support

#### Content Validation
- **Header Presence**: Must contain column headers
- **Data Rows**: Minimum 1 row, maximum 10,000 rows
- **Column Consistency**: All rows must have same column count
- **Data Types**: Basic data type validation

### Field-Level Validation

#### Required Fields
- **ASIN**: Product identifier validation
- **Date Fields**: Date format validation (YYYY-MM-DD)
- **Numeric Fields**: Number format validation
- **Currency Fields**: Currency format validation

#### Custom Validation Rules
- **Email Format**: Valid email address patterns
- **Phone Numbers**: Phone number format validation
- **Postal Codes**: Postal code format validation
- **SKU Format**: SKU pattern validation

## Field Mapping System

### Mapping Interface

#### Header Mapper Component
```typescript
interface HeaderMapperProps {
  headers: string[]
  mapping: Record<string, string>
  onChange: (mapping: Record<string, string>) => void
}
```

#### Mapping Features
- **Auto-Suggestions**: Intelligent field name suggestions
- **Status Indicators**: Visual mapping status (mapped, custom, unmapped)
- **Real-time Updates**: Immediate mapping feedback
- **Validation**: Field name validation

### Field Suggestions

#### Suggestion Categories
1. **Product Fields**: product_id, title, price, quantity
2. **Order Fields**: order_id, order_date, status
3. **Customer Fields**: customer_id, customer_name, email
4. **Financial Fields**: revenue, profit, fees
5. **Date Fields**: date, updated_date
6. **Location Fields**: country, city, state
7. **Generic Fields**: description, category, brand

#### Suggestion Logic
```typescript
const getSuggestions = (header: string): string[] => {
  const headerLower = header.toLowerCase()
  const matchedFields: string[] = []
  
  Object.entries(FIELD_SUGGESTIONS).forEach(([canonicalField, variations]) => {
    if (variations.some(variation => 
      headerLower.includes(variation.toLowerCase()) || 
      variation.toLowerCase().includes(headerLower)
    )) {
      matchedFields.push(canonicalField)
    }
  })
  
  return matchedFields.slice(0, 5)
}
```

### Mapping Status

#### Status Types
- **Mapped**: Field mapped to standard canonical field
- **Custom**: Field mapped to custom field name
- **Unmapped**: Field not yet mapped

#### Status Indicators
- **Green Checkmark**: Successfully mapped to standard field
- **Yellow Warning**: Custom field mapping
- **Gray Question**: Unmapped field

## Import Process

### Step-by-Step Process

#### 1. File Selection
- Choose file type from available tabs
- Upload CSV file via drag & drop or file browser
- File validation and error checking

#### 2. Data Preview
- Review file headers and sample data
- Verify data structure and content
- Check for obvious data quality issues

#### 3. Field Mapping
- Map CSV columns to system fields
- Use auto-suggestions for common fields
- Add custom field mappings as needed
- Validate mapping completeness

#### 4. Data Import
- Process mapped data through transformation pipeline
- Store data in appropriate dataset
- Generate import metrics and history record
- Display success/error feedback

### Error Handling

#### Validation Errors
- **File Errors**: Invalid file format, size, or name
- **Data Errors**: Missing headers, empty data, format issues
- **Mapping Errors**: Incomplete or invalid field mappings
- **Processing Errors**: Data transformation or storage failures

#### Error Recovery
- **Clear Error Messages**: Specific error descriptions
- **Retry Options**: Ability to retry failed operations
- **Partial Success**: Handle partial data imports
- **Error Logging**: Detailed error tracking for debugging

## Performance & Metrics

### Performance Tracking

#### Import Metrics
```typescript
interface ImportMetrics {
  startTime: number
  endTime?: number
  duration?: number
  rowsProcessed: number
  memoryUsage: number
  fileSize: number
  processingSpeed: number // rows per second
}
```

#### Performance Optimization
- **Batch Processing**: Process multiple files efficiently
- **Memory Management**: Monitor and optimize memory usage
- **Processing Speed**: Track and improve processing rates
- **Resource Usage**: Monitor CPU and memory consumption

### Metrics Dashboard

#### Key Performance Indicators
- **Total Imports**: Number of successful imports
- **Success Rate**: Percentage of successful imports
- **Average Processing Time**: Mean time per import
- **Total Rows Processed**: Cumulative data volume

#### Performance Trends
- **Processing Speed**: Rows per second over time
- **Memory Usage**: Memory consumption patterns
- **Error Rates**: Import failure trends
- **User Activity**: Import frequency and patterns

## Best Practices

### File Preparation

#### CSV Format Guidelines
- **Encoding**: Use UTF-8 encoding
- **Delimiters**: Use comma as field separator
- **Headers**: Include descriptive column headers
- **Data Types**: Use consistent data formats

#### Data Quality
- **Completeness**: Ensure all required fields are present
- **Consistency**: Use consistent date and number formats
- **Accuracy**: Validate data accuracy before import
- **Cleanliness**: Remove unnecessary whitespace and special characters

### Field Mapping

#### Mapping Strategy
- **Standard Fields**: Use canonical field names when possible
- **Custom Fields**: Document custom field purposes
- **Validation**: Verify field mappings before import
- **Consistency**: Maintain consistent mappings across imports

#### Mapping Tips
- **Auto-Suggestions**: Leverage intelligent field suggestions
- **Preview Data**: Review mapped data before import
- **Save Mappings**: Export and reuse successful mappings
- **Documentation**: Document custom field mappings

### Performance Optimization

#### File Size Management
- **Chunking**: Break large files into smaller chunks
- **Compression**: Use compressed CSV files when possible
- **Cleanup**: Remove unnecessary columns before import
- **Validation**: Validate data before upload

#### Processing Optimization
- **Batch Imports**: Use batch processing for multiple files
- **Transformations**: Apply data transformations efficiently
- **Memory Management**: Monitor memory usage during processing
- **Error Handling**: Implement robust error recovery

## Troubleshooting

### Common Issues

#### File Upload Problems
- **File Too Large**: Reduce file size or use compression
- **Invalid Format**: Ensure CSV format with proper encoding
- **Network Issues**: Check internet connection and retry
- **Browser Issues**: Try different browser or clear cache

#### Mapping Issues
- **Missing Fields**: Add required field mappings
- **Invalid Field Names**: Use standard field names
- **Mapping Conflicts**: Resolve duplicate field mappings
- **Data Type Mismatches**: Verify data format compatibility

#### Processing Errors
- **Memory Issues**: Reduce file size or use batch processing
- **Timeout Errors**: Increase processing time limits
- **Data Validation Failures**: Fix data format issues
- **System Errors**: Check system resources and retry

### Error Resolution

#### Validation Errors
1. **Review Error Messages**: Read detailed error descriptions
2. **Check File Format**: Verify CSV format and encoding
3. **Validate Data**: Check data quality and completeness
4. **Fix Issues**: Correct identified problems
5. **Retry Import**: Attempt import again

#### Processing Errors
1. **Check System Resources**: Monitor memory and CPU usage
2. **Reduce File Size**: Break large files into smaller chunks
3. **Use Batch Processing**: Process files in smaller batches
4. **Contact Support**: Report persistent issues

## Technical Architecture

### Component Structure

#### Main Components
```typescript
// Main view component
ImportsView.tsx

// Field mapping component
HeaderMapper.tsx

// Custom hooks
useMappings()
useIngest()

// Redux slice
importsSlice.ts

// Templates
templates.ts
```

#### State Management
```typescript
interface ImportsState {
  mappings: Record<FileType, Record<string, string>>
  datasets: {
    keepa: Product[]
    indiaListings: Order[]
    uspo: USPO[]
    events: Event[]
    settlement: Settlement[]
  }
}
```

### Data Flow

#### Upload Process
1. **File Selection**: User selects CSV file
2. **Validation**: File and data validation
3. **Parsing**: CSV parsing and header extraction
4. **Preview**: Data preview generation
5. **Mapping**: Field mapping interface
6. **Processing**: Data transformation and storage

#### Import Process
1. **Mapping Validation**: Verify field mappings
2. **Data Transformation**: Apply transformations
3. **Type Conversion**: Convert data types
4. **Storage**: Store in Redux state
5. **Metrics**: Generate performance metrics
6. **History**: Update import history

### File Processing

#### CSV Parsing
```typescript
const { headers, rows } = parseCsv(text)
```

#### Data Mapping
```typescript
const mappedData = rows.map(row => {
  const obj: Record<string, any> = {}
  
  headers.forEach((header, index) => {
    const canonicalField = mapping[header]
    if (canonicalField && row[index] !== undefined) {
      obj[canonicalField] = row[index]
    }
  })
  
  return obj
})
```

### Performance Considerations

#### Memory Management
- **Streaming**: Process large files in chunks
- **Cleanup**: Clear temporary data after processing
- **Monitoring**: Track memory usage during processing
- **Optimization**: Optimize data structures for memory efficiency

#### Processing Speed
- **Batch Processing**: Process multiple files efficiently
- **Parallel Processing**: Use web workers for heavy processing
- **Caching**: Cache parsed data for repeated access
- **Optimization**: Optimize algorithms for speed

### Security Considerations

#### File Security
- **File Validation**: Strict file type and size validation
- **Content Scanning**: Scan for malicious content
- **Access Control**: Restrict file access to authorized users
- **Data Privacy**: Protect sensitive data during processing

#### Data Security
- **Input Sanitization**: Sanitize all input data
- **Output Encoding**: Properly encode output data
- **Access Logging**: Log all file access and processing
- **Error Handling**: Secure error handling without data leakage

## Conclusion

The CSV Import & Data Mapping page provides a comprehensive, user-friendly solution for data ingestion in the Supply Chain & Profit application. With its advanced features, robust validation, and performance optimization, it enables efficient and reliable data processing for supply chain analysis and profit optimization.

The system's modular architecture, extensive error handling, and user-focused design make it suitable for both novice and advanced users, while its performance monitoring and optimization features ensure scalability for large datasets and high-volume processing requirements.
