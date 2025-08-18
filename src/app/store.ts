import { configureStore, combineReducers } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import { importsReducer } from '../features/imports/importsSlice'
import { slaReducer } from '../features/sla/slaSlice'
import { ordersReducer } from '../features/orders/ordersSlice'
import { ratesReducer } from '../features/settings/ratesSlice'
import usersReducer from '../features/users/usersSlice'

// Inline reducers for persisted keys
const settingsReducer = (state = {}, action: any) => {
  switch (action.type) {
    default:
      return state
  }
}

// Persist configuration for root store
const persistConfig = {
  key: 'scp:v1',
  storage,
  whitelist: ['settings', 'users'], // Only persist settings and users
  blacklist: ['imports', 'calculator', 'orders', 'sla', 'analytics', 'cashflow', 'reconcile', 'validator'], // Don't persist large datasets
}

// Root reducer with combineReducers
const rootReducer = combineReducers({
  settings: settingsReducer,
  users: usersReducer,
  imports: importsReducer, // Imports has its own persist config
  sla: slaReducer, // SLA state (no persistence)
  orders: ordersReducer, // Orders state (no persistence)
  rates: ratesReducer, // Rates state (persisted)
  // TODO: Add other slices when implemented
  // calculator: calculatorReducer,
  // analytics: analyticsReducer,
  // cashflow: cashflowReducer,
  // reconcile: reconcileReducer,
  // validator: validatorReducer,
})

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer)

// Configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/FLUSH', 'persist/REHYDRATE', 'persist/PAUSE', 'persist/PERSIST', 'persist/PURGE', 'persist/REGISTER'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
})

// Create persistor
export const persistor = persistStore(store)

// Export types
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
