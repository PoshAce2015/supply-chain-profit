import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type TimelineEvent = {
  id: string;                 // stable per-row id (file+row index or generated)
  category: 'sales'|'purchase'|'intl_shipment'|'natl_shipment'|'payment'|'refund'|'cancel';
  orderKey?: string;          // canonical order key (if known)
  when?: string;              // ISO date or datetime string
  raw: any;                   // original row (kept for detail panel)
};

export type OrderThread = {
  orderKey: string;
  events: TimelineEvent[];    // sorted by when asc
};

export interface TimelineState {
  byOrder: Record<string, OrderThread>;
  orphan: TimelineEvent[];    // events we couldn't link yet
  lastBuildAt?: string;
}

const initialState: TimelineState = {
  byOrder: {},
  orphan: [],
};

const slice = createSlice({
  name: 'timeline',
  initialState,
  reducers: {
    setTimeline(state, action: PayloadAction<TimelineState>) {
      return action.payload;
    }
  }
});

export const { setTimeline } = slice.actions;
const timelineReducer = slice.reducer;
export default timelineReducer;
