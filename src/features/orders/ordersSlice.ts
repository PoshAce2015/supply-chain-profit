import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { OrderSummary, TimelineEvent, IngestResult } from '../../lib/imports/ingest'

interface OrderAck {
  by: string
  at: string
}

interface OrderAcks {
  step1?: OrderAck // Ordered
  step2?: OrderAck // Shipped/Verified
}

interface OrdersState {
  acks: Record<string, OrderAcks> // key: ASIN
  timeline: Record<string, TimelineEvent[]> // orderId → events
  summaries: OrderSummary[] // order summaries
  ingestResult?: IngestResult // latest ingest result
}

const initialState: OrdersState = {
  acks: {},
  timeline: {},
  summaries: [],
}

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    ackStep1: (state, action: PayloadAction<{ asin: string; user: string }>) => {
      const { asin, user } = action.payload
      if (!state.acks[asin]) {
        state.acks[asin] = {}
      }
      state.acks[asin].step1 = {
        by: user,
        at: new Date().toISOString(),
      }
    },
    ackStep2: (state, action: PayloadAction<{ asin: string; user: string }>) => {
      const { asin, user } = action.payload
      if (!state.acks[asin]) {
        state.acks[asin] = {}
      }
      state.acks[asin].step2 = {
        by: user,
        at: new Date().toISOString(),
      }
    },
    resetAck: (state, action: PayloadAction<string>) => {
      const asin = action.payload
      delete state.acks[asin]
    },
    setTimelineData: (state, action: PayloadAction<{ timeline: Record<string, TimelineEvent[]>; summaries: OrderSummary[] }>) => {
      state.timeline = action.payload.timeline
      state.summaries = action.payload.summaries
    },
    setIngestResult: (state, action: PayloadAction<IngestResult>) => {
      state.ingestResult = action.payload
    },
    clearTimelineData: (state) => {
      state.timeline = {}
      state.summaries = []
      state.ingestResult = undefined
    },
  },
})

export const { ackStep1, ackStep2, resetAck, setTimelineData, setIngestResult, clearTimelineData } = ordersSlice.actions
export const ordersReducer = ordersSlice.reducer

// Helper selector to check if two-person rule can be enforced
export const canEnforceTwoPerson = (state: any) => {
  const twoPersonRule = state.sla?.settings?.twoPersonRule || false
  const users = state.users || {}
  const userEmails = Object.values(users).filter((user: any) => user?.email)
  return twoPersonRule && userEmails.length >= 2
}
