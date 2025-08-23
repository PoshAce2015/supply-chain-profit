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
    },
    linkOrphanToOrder(state, action: PayloadAction<{ orphanId: string; orderKey: string }>) {
      const { orphanId, orderKey } = action.payload;
      
      // Find the orphan event
      const orphanIndex = state.orphan.findIndex(ev => ev.id === orphanId);
      if (orphanIndex === -1) return;
      
      const orphanEvent = state.orphan[orphanIndex];
      
      // Remove from orphans
      state.orphan.splice(orphanIndex, 1);
      
      // Add to the target order
      if (!state.byOrder[orderKey]) {
        state.byOrder[orderKey] = { orderKey, events: [] };
      }
      
      // Update the event with the order key
      orphanEvent.orderKey = orderKey;
      
      // Add to order events and sort by date
      state.byOrder[orderKey].events.push(orphanEvent);
      state.byOrder[orderKey].events.sort((a, b) => 
        (a.when || '').localeCompare(b.when || '')
      );
    },
    unlinkEventFromOrder(state, action: PayloadAction<{ eventId: string; orderKey: string }>) {
      const { eventId, orderKey } = action.payload;
      
      const order = state.byOrder[orderKey];
      if (!order) return;
      
      // Find the event in the order
      const eventIndex = order.events.findIndex(ev => ev.id === eventId);
      if (eventIndex === -1) return;
      
      const event = order.events[eventIndex];
      
      // Remove from order
      order.events.splice(eventIndex, 1);
      
      // Remove order key from event
      delete event.orderKey;
      
      // Add back to orphans
      state.orphan.push(event);
      
      // Remove empty orders
      if (order.events.length === 0) {
        delete state.byOrder[orderKey];
      }
    },
    createNewOrderFromOrphan(state, action: PayloadAction<{ orphanId: string; newOrderKey: string }>) {
      const { orphanId, newOrderKey } = action.payload;
      
      // Find the orphan event
      const orphanIndex = state.orphan.findIndex(ev => ev.id === orphanId);
      if (orphanIndex === -1) return;
      
      const orphanEvent = state.orphan[orphanIndex];
      
      // Remove from orphans
      state.orphan.splice(orphanIndex, 1);
      
      // Create new order
      orphanEvent.orderKey = newOrderKey;
      state.byOrder[newOrderKey] = { orderKey: newOrderKey, events: [orphanEvent] };
    }
  }
});

export const { setTimeline, linkOrphanToOrder, unlinkEventFromOrder, createNewOrderFromOrphan } = slice.actions;
const timelineReducer = slice.reducer;
export default timelineReducer;
