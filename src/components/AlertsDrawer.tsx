import React, { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { selectRedAlerts, selectYellowAlerts, selectUnackedCount } from '../features/sla/selectors'
import { acknowledge as acknowledgeAction } from '../features/sla/slaSlice'
import Popover from './Popover'

interface AlertsDrawerProps {
  variant?: 'header' | 'standalone'
}

// Header-ready alerts control
export function HeaderAlertsButton() {
  const btnRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);

  // TODO: wire to real unread count
  const unread = 3;

  return (
    <>
      <button
        ref={btnRef}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        data-testid="alerts-button"
        className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-2 text-white hover:bg-white/25 transition shadow-sm backdrop-blur-sm"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM10.5 3.75a6 6 0 0 1 0 12h-9a6 6 0 0 1 0-12h9z" />
        </svg>
        <span className="hidden sm:inline">Alerts</span>
        {unread > 0 && (
          <span className="ml-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1 text-xs font-semibold text-white">
            {unread}
          </span>
        )}
      </button>

      <Popover
        anchorRef={btnRef as any}
        open={open}
        onClose={() => setOpen(false)}
        align="right"
        panelTestId="alerts-panel"
      >
        <div className="w-80 max-h-[70vh] overflow-auto">
          <div className="px-4 py-3 border-b bg-slate-50 text-slate-700 font-medium">
            Alerts
          </div>
          <ul className="divide-y">
            <li className="px-4 py-3 text-sm">Validator resolved 12 data issues</li>
            <li className="px-4 py-3 text-sm">3 CSV files imported (orders, returns, fees)</li>
            <li className="px-4 py-3 text-sm">Settlement variance decreased to 0.6%</li>
          </ul>
        </div>
      </Popover>
    </>
  );
}

const AlertsDrawer: React.FC<AlertsDrawerProps> = ({ variant = 'standalone' }) => {
  const dispatch = useDispatch()
  const redAlerts = useSelector(selectRedAlerts)
  const yellowAlerts = useSelector(selectYellowAlerts)
  const unackedCount = useSelector(selectUnackedCount)
  const [isOpen, setIsOpen] = useState(false)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  const allAlerts = [...redAlerts, ...yellowAlerts]

  const handleAcknowledge = (id: string) => {
    dispatch(acknowledgeAction({ id, user: 'system' }))
  }

  // Focus close button when drawer opens
  useEffect(() => {
    if (isOpen && closeButtonRef.current) {
      closeButtonRef.current.focus()
    }
  }, [isOpen])

  // Handle Escape key to close drawer
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen])

  // Header variant - just the button
  if (variant === 'header') {
    return (
      <>
        <button
          data-testid="header-alerts-button"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={`Open alerts drawer${unackedCount > 0 ? ` - ${unackedCount} unacknowledged alerts` : ''}`}
          className="flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 backdrop-blur-sm px-3 py-2 text-sm text-white hover:bg-white/20 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM10.5 3.75a6 6 0 0 1 0 12h-9a6 6 0 0 1 0-12h9z" />
          </svg>
          <span>Alerts</span>
          {unackedCount > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium bg-red-500 text-white rounded-full">
              {unackedCount}
            </span>
          )}
        </button>

        {/* Drawer */}
        {isOpen && (
          <div className="fixed inset-0 z-50">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black bg-opacity-50"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Drawer Content */}
            <div className="absolute right-0 top-0 h-full w-96 bg-white shadow-lg">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold">Alerts</h2>
                <button
                  ref={closeButtonRef}
                  onClick={() => setIsOpen(false)}
                  aria-label="Close alerts drawer"
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              <div data-testid="alerts-drawer" className="p-4 overflow-y-auto h-full">
                {allAlerts.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No alerts</p>
                ) : (
                  <div className="space-y-3">
                    {allAlerts.map((alert) => (
                      <div
                        key={alert.id}
                        className={`p-3 rounded-lg border ${
                          alert.severity === 'red'
                            ? 'bg-red-50 border-red-200'
                            : 'bg-yellow-50 border-yellow-200'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  alert.severity === 'red'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}
                              >
                                {alert.severity.toUpperCase()}
                              </span>
                              <span className="text-sm font-medium text-gray-900">
                                {alert.asin}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 mb-2">{alert.message}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(alert.createdAt).toLocaleString()}
                            </p>
                          </div>
                          {!alert.acknowledgedBy && (
                            <button
                              onClick={() => handleAcknowledge(alert.id)}
                              className="btn-neutral ml-2 px-2 py-1 text-xs rounded"
                            >
                              Acknowledge
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </>
    )
  }

  // Standalone variant - original implementation
  return (
    <>
      {/* Sticky Banner */}
      {redAlerts.length > 0 && (
        <div
          data-testid="banner-alerts"
          className="bg-red-600 text-white px-4 py-2 text-center text-sm font-medium"
        >
          {redAlerts.length} critical alert{redAlerts.length !== 1 ? 's' : ''} require{redAlerts.length !== 1 ? '' : 's'} attention
        </div>
      )}

      {/* Toggle Button */}
      <button
        data-testid="open-alerts"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Open alerts drawer${unackedCount > 0 ? ` - ${unackedCount} unacknowledged alerts` : ''}`}
        className="btn-primary fixed top-4 right-4 z-50 px-3 py-2 rounded-md text-sm font-medium"
      >
        Alerts {unackedCount > 0 && `(${unackedCount})`}
      </button>

      {/* Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-40">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Drawer Content */}
          <div className="absolute right-0 top-0 h-full w-96 bg-white shadow-lg">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Alerts</h2>
              <button
                ref={closeButtonRef}
                onClick={() => setIsOpen(false)}
                aria-label="Close alerts drawer"
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div data-testid="alerts-drawer" className="p-4 overflow-y-auto h-full">
              {allAlerts.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No alerts</p>
              ) : (
                <div className="space-y-3">
                  {allAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-3 rounded-lg border ${
                        alert.severity === 'red'
                          ? 'bg-red-50 border-red-200'
                          : 'bg-yellow-50 border-yellow-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                alert.severity === 'red'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {alert.severity.toUpperCase()}
                            </span>
                            <span className="text-sm font-medium text-gray-900">
                              {alert.asin}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 mb-2">{alert.message}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(alert.createdAt).toLocaleString()}
                          </p>
                        </div>
                        {!alert.acknowledgedBy && (
                          <button
                            onClick={() => handleAcknowledge(alert.id)}
                            className="ml-2 px-2 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700"
                          >
                            Acknowledge
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default AlertsDrawer
