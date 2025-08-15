import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import { FileType, Product, Order, USPO, Event, Settlement } from '../../lib/types'
import { parseCsv } from '../../lib/csv/parse'

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

const initialState: ImportsState = {
  mappings: {
    keepa: {},
    indiaListings: {},
    uspo: {},
    events: {},
    settlement: {},
  },
  datasets: {
    keepa: [],
    indiaListings: [],
    uspo: [],
    events: [],
    settlement: [],
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
      }
    },
  },
})

// Persist only mappings, not datasets
const persistConfig = {
  key: 'imports',
  storage,
  whitelist: ['mappings'],
}

export const { setMapping, ingest, clearDataset } = importsSlice.actions
export const importsReducer = persistReducer(persistConfig, importsSlice.reducer)
