import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import { FileType, Product, Order, USPO, Event, Settlement } from '../../lib/types'
import { parseCsv, parseFile } from '../../lib/csv/parse'

interface ImportsState {
  mappings: Record<FileType, Record<string, string>>
  datasets: {
    keepa: Product[]
    indiaListings: Order[]
    uspo: USPO[]
    events: Event[]
    settlement: Settlement[]
    // User's specific datasets
    userPurchase: any[]
    userSales: any[]
  }
  // New structure for timeline stitching
  timelineData: {
    sales: any[]
    purchase: any[]
    intl_shipment: any[]
    natl_shipment: any[]
    payment: any[]
    refund: any[]
    cancel: any[]
    // User's specific timeline data
    userPurchase: any[]
    userSales: any[]
  }
}

const initialState: ImportsState = {
  mappings: {
    keepa: {},
    indiaListings: {},
    uspo: {},
    events: {},
    settlement: {},
    // User's specific mappings
    userPurchase: {},
    userSales: {},
  },
  datasets: {
    keepa: [],
    indiaListings: [],
    uspo: [],
    events: [],
    settlement: [],
    // User's specific datasets
    userPurchase: [],
    userSales: [],
  },
  timelineData: {
    sales: [],
    purchase: [],
    intl_shipment: [],
    natl_shipment: [],
    payment: [],
    refund: [],
    cancel: [],
    // User's specific timeline data
    userPurchase: [],
    userSales: [],
  },
}

const importsSlice = createSlice({
  name: 'imports',
  initialState,
  reducers: {
    setMapping: (
      state,
      action: PayloadAction<{ fileType: FileType; mapping: Record<string, string> }>
    ) => {
      const { fileType, mapping } = action.payload
      state.mappings[fileType] = mapping
    },
    ingest: (
      state,
      action: PayloadAction<{ fileType: FileType; text: string }>
    ) => {
      const { fileType, text } = action.payload
      const mapping = state.mappings[fileType]
      
      if (!mapping || Object.keys(mapping).length === 0) {
        throw new Error(`No mapping defined for file type: ${fileType}`)
      }

      const { headers, rows } = parseCsv(text)
      
      // Map rows to typed objects based on current mapping
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

      // Store in appropriate dataset
      switch (fileType) {
        case 'keepa':
          state.datasets.keepa = mappedData as Product[]
          break
        case 'indiaListings':
          state.datasets.indiaListings = mappedData as Order[]
          break
        case 'uspo':
          state.datasets.uspo = mappedData as USPO[]
          break
        case 'events':
          state.datasets.events = mappedData as Event[]
          break
        case 'settlement':
          state.datasets.settlement = mappedData as Settlement[]
          break
        case 'userPurchase':
          state.datasets.userPurchase = mappedData
          break
        case 'userSales':
          state.datasets.userSales = mappedData
          break
      }
    },
    // New action for file-based ingestion (supports Excel files)
    ingestFile: (
      state,
      action: PayloadAction<{ fileType: FileType; file: File }>
    ) => {
      const { fileType, file } = action.payload
      const mapping = state.mappings[fileType]
      
      if (!mapping || Object.keys(mapping).length === 0) {
        throw new Error(`No mapping defined for file type: ${fileType}`)
      }

      // This will be handled by the thunk middleware
      // The actual parsing happens in the thunk
    },
    // Action to set parsed data from file
    setParsedData: (
      state,
      action: PayloadAction<{ fileType: FileType; data: any[] }>
    ) => {
      const { fileType, data } = action.payload
      
      // Store in appropriate dataset
      switch (fileType) {
        case 'keepa':
          state.datasets.keepa = data as Product[]
          break
        case 'indiaListings':
          state.datasets.indiaListings = data as Order[]
          break
        case 'uspo':
          state.datasets.uspo = data as USPO[]
          break
        case 'events':
          state.datasets.events = data as Event[]
          break
        case 'settlement':
          state.datasets.settlement = data as Settlement[]
          break
        case 'userPurchase':
          state.datasets.userPurchase = data
          break
        case 'userSales':
          state.datasets.userSales = data
          break
      }
    },
    clearDataset: (state, action: PayloadAction<FileType>) => {
      const fileType = action.payload
      switch (fileType) {
        case 'keepa':
          state.datasets.keepa = []
          break
        case 'indiaListings':
          state.datasets.indiaListings = []
          break
        case 'uspo':
          state.datasets.uspo = []
          break
        case 'events':
          state.datasets.events = []
          break
        case 'settlement':
          state.datasets.settlement = []
          break
        case 'userPurchase':
          state.datasets.userPurchase = []
          break
        case 'userSales':
          state.datasets.userSales = []
          break
      }
    },
    // New action for timeline stitching
    addTimelineData: (
      state,
      action: PayloadAction<{ category: string; rows: any[] }>
    ) => {
      const { category, rows } = action.payload
      const key = category as keyof typeof state.timelineData
      if (state.timelineData[key]) {
        // Serialize dates to strings to avoid Redux serialization warnings
        const serializedRows = rows.map(row => {
          const serialized = { ...row }
          // Convert any Date objects to ISO strings
          Object.keys(serialized).forEach(k => {
            if (serialized[k] instanceof Date) {
              serialized[k] = serialized[k].toISOString()
            }
          })
          return serialized
        })
        
        // Replace with new rows for this category (each import replaces previous for that category)
        state.timelineData[key] = serializedRows
      }
    },
    clearTimelineData: (state, action: PayloadAction<string>) => {
      const category = action.payload
      const key = category as keyof typeof state.timelineData
      if (state.timelineData[key]) {
        state.timelineData[key] = []
      }
    },
    // Action to get all timeline data for debugging
    setAllTimelineData: (
      state, 
      action: PayloadAction<{ [key: string]: any[] }>
    ) => {
      Object.keys(action.payload).forEach(category => {
        const key = category as keyof typeof state.timelineData
        if (state.timelineData[key]) {
          state.timelineData[key] = action.payload[category] || []
        }
      })
    },
  },
})

// Thunk for file processing
export const processFile = (fileType: FileType, file: File, mapping: Record<string, string>) => {
  return async (dispatch: any) => {
    try {
      // Parse the file (supports both CSV and Excel)
      const { headers, rows } = await parseFile(file)
      
      // Map rows to typed objects based on mapping
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

      // Set the parsed data
      dispatch(setParsedData({ fileType, data: mappedData }))
      
      // Also add to timeline data for the user's specific files
      if (fileType === 'userPurchase' || fileType === 'userSales') {
        dispatch(addTimelineData({ category: fileType, rows: mappedData }))
      }
      
      return { success: true, data: mappedData }
    } catch (error) {
      console.error('File processing error:', error)
      throw error
    }
  }
}

// Persist mappings and timeline data for better debugging
const persistConfig = {
  key: 'imports',
  storage,
  whitelist: ['mappings', 'timelineData'],
}

export const { 
  setMapping, 
  ingest, 
  ingestFile, 
  setParsedData, 
  clearDataset, 
  addTimelineData, 
  clearTimelineData, 
  setAllTimelineData 
} = importsSlice.actions
export const importsReducer = persistReducer(persistConfig, importsSlice.reducer)
