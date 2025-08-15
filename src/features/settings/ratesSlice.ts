import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Rates } from '../../lib/calc/types'
import { getDefaultRates } from '../../lib/calc/defaults'

const initialState: Rates = getDefaultRates()

const ratesSlice = createSlice({
  name: 'rates',
  initialState,
  reducers: {
    setRates: (state, action: PayloadAction<Partial<Rates>>) => {
      return { ...state, ...action.payload }
    },
  },
})

export const { setRates } = ratesSlice.actions
export const ratesReducer = ratesSlice.reducer

// Selector
export const selectRates = (state: any) => state.rates
