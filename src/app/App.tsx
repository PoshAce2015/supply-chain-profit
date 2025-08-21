
import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { PersistGate } from 'redux-persist/integration/react'
import { persistor } from './store'
import GlobalLogoutWire from './GlobalLogoutWire'


import LoginView from '../features/users/LoginView'
import RegisterView from '../features/users/RegisterView'
import PasswordResetView from '../features/users/PasswordResetView'
import DashboardView from '../features/dashboard/DashboardView'
import { RequireAuth, RedirectIfAuthed } from './guards'
import LayoutAuthed from '../components/LayoutAuthed'
import ErrorBoundary from '../components/ErrorBoundary'
import LoadingSpinner from '../components/LoadingSpinner'

import ImportsView from '../features/imports/ImportsView'
import ImportCategoryPage from '../features/imports/ImportCategoryPage'
import BulkImportView from '../features/imports/BulkImportView'
import { getCategorySchema } from '../features/imports/categorySchemas'
import CalculatorView from '../features/calculator/CalculatorView'
import ChecklistView from '../features/orders/ChecklistView'
import OrderTimelineView from '../features/orders/OrderTimelineView'
import AnalyticsView from '../features/analytics/AnalyticsView'
import CashflowView from '../features/cashflow/CashflowView'
import ReconcileView from '../features/reconcile/ReconcileView'
import ValidatorView from '../features/validator/ValidatorView'
import SettingsView from '../features/settings/SettingsView'
import UsersView from '../features/users/UsersView'
import { useSlaEngine } from '../features/sla/useSlaEngine'
import SLAView from '../features/sla/SLAView'
import { runSelfTests, SelfTestResult } from './selftest'
import LayoutPublic from "./LayoutPublic"
import HomeView from '../features/home/HomeView'

// Category route wrapper component
const CategoryRoute: React.FC<{ categoryId: string }> = ({ categoryId }) => {
  const category = getCategorySchema(categoryId)
  if (!category) {
    return <Navigate to="/imports" replace />
  }
  return <ImportCategoryPage category={category} />
}

export default function App() {
  // Initialize SLA engine
  useSlaEngine()
  
  const [selfTestResults, setSelfTestResults] = React.useState<SelfTestResult[]>([])
  const [showSelfTestBanner, setShowSelfTestBanner] = React.useState(false)
  
  React.useEffect(() => {
    const results = runSelfTests()
    setSelfTestResults(results)
    
    const failingTests = results.filter(result => !result.ok)
    if (failingTests.length > 0) {
      setShowSelfTestBanner(true)
      console.warn('Self-tests failed:', failingTests)
    }
  }, [])

  return (
    <PersistGate loading={<LoadingSpinner />} persistor={persistor}>
        <ErrorBoundary>
          <GlobalLogoutWire />
          <div className="min-h-screen bg-gray-50">
          {/* Self-Test Banner */}
          {showSelfTestBanner && (
            <div
              data-testid="banner-selftest"
              className="bg-yellow-100 border-b border-yellow-200 px-4 py-2 text-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-yellow-800">
                  {selfTestResults.filter(r => !r.ok).length} self-test(s) failed. 
                  <button
                    onClick={() => console.log('Self-test results:', selfTestResults)}
                    className="ml-2 text-yellow-600 underline hover:text-yellow-800"
                  >
                    View details in console
                  </button>
                </span>
                <button
                  onClick={() => setShowSelfTestBanner(false)}
                  className="text-yellow-600 hover:text-yellow-800"
                >
                  ✕
                </button>
              </div>
            </div>
          )}
          
          <Routes>
            {/* Public routes */}
            <Route element={<LayoutPublic />}>
              <Route path="/" element={<HomeView />} />
            </Route>
            <Route element={<RedirectIfAuthed />}>
              <Route element={<LayoutPublic />}>
                <Route path="/login" element={<LoginView />} />
                <Route path="/register" element={<RegisterView />} />
                <Route path="/reset-password" element={<PasswordResetView />} />
              </Route>
            </Route>

            {/* Authed routes */}
            <Route element={<RequireAuth />}>
              <Route element={<LayoutAuthed />}>
                <Route path="/dashboard" element={<DashboardView />} />
                <Route path="/imports" element={<ImportsView />} />
                <Route path="/imports/bulk" element={<BulkImportView />} />
                <Route path="/imports/sales" element={<CategoryRoute categoryId="sales" />} />
                <Route path="/imports/purchase" element={<CategoryRoute categoryId="purchase" />} />
                <Route path="/imports/international-shipping" element={<CategoryRoute categoryId="international-shipping" />} />
                <Route path="/imports/national-shipping" element={<CategoryRoute categoryId="national-shipping" />} />
                <Route path="/imports/payment" element={<CategoryRoute categoryId="payment" />} />
                <Route path="/imports/refund" element={<CategoryRoute categoryId="refund" />} />
                <Route path="/imports/fba" element={<CategoryRoute categoryId="fba" />} />
                <Route path="/calculator" element={<CalculatorView />} />
                <Route path="/orders" element={<ChecklistView />} />
                <Route path="/orders/timeline" element={<OrderTimelineView />} />
                <Route path="/sla" element={<SLAView />} />
                <Route path="/analytics" element={<AnalyticsView />} />
                <Route path="/cashflow" element={<CashflowView />} />
                <Route path="/reconcile" element={<ReconcileView />} />
                <Route path="/validator" element={<ValidatorView />} />
                <Route path="/settings" element={<SettingsView />} />
                <Route path="/users" element={<UsersView />} />
              </Route>
            </Route>

            {/* Catchall */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </ErrorBoundary>
    </PersistGate>
  )
}
