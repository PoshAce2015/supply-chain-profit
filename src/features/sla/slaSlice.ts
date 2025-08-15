import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { SlaSettings, Alert } from './types'

interface SlaState {
  settings: SlaSettings
  alerts: Alert[]
  lastRunAt?: string
}

const initialState: SlaState = {
  settings: {
    SLA_PO_Hours: 12,
    SLA_Customs_Days: 4,
    BatteryExtraDays: 3,
    twoPersonRule: false,
  },
  alerts: [],
}

const slaSlice = createSlice({
  name: 'sla',
  initialState,
  reducers: {
    setSettings: (state, action: PayloadAction<Partial<SlaSettings>>) => {
      state.settings = { ...state.settings, ...action.payload }
    },
    setAlerts: (state, action: PayloadAction<Alert[]>) => {
      state.alerts = action.payload
      state.lastRunAt = new Date().toISOString()
    },
    acknowledge: (state, action: PayloadAction<{ id: string; user: string }>) => {
      const { id, user } = action.payload
      const alert = state.alerts.find(a => a.id === id)
      if (alert) {
        alert.acknowledgedBy = user
      }
    },
  },
})

export const { setSettings, setAlerts, acknowledge } = slaSlice.actions
export const slaReducer = slaSlice.reducer
