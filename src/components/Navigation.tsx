import React from 'react'
import { NavLink } from 'react-router-dom'

const Navigation: React.FC = () => {
  const tabs = [
    { name: 'Imports', path: '/imports', icon: '📁', testId: 'tab-imports' },
    { name: 'Calculator', path: '/calculator', icon: '🧮', testId: 'tab-calculator' },
    { name: 'Orders', path: '/orders', icon: '📋', testId: 'tab-orders' },
    { name: 'SLA', path: '/sla', icon: '⏰', testId: 'tab-sla' },
    { name: 'Analytics', path: '/analytics', icon: '📊', testId: 'tab-analytics' },
    { name: 'Cashflow', path: '/cashflow', icon: '💰', testId: 'tab-cashflow' },
    { name: 'Reconcile', path: '/reconcile', icon: '🔍', testId: 'tab-reconcile' },
    { name: 'Validator', path: '/validator', icon: '✅', testId: 'tab-validator' },
    { name: 'Settings', path: '/settings', icon: '⚙️', testId: 'tab-settings' },
    { name: 'Users', path: '/users', icon: '👥', testId: 'tab-users' },
  ]

  return (
    <nav className="w-64 bg-white shadow-sm border-r border-gray-200" data-testid="app-nav">
      <div className="p-4">
        <div className="space-y-1">
          {tabs.map((tab) => (
            <NavLink
              key={tab.path}
              to={tab.path}
              data-testid={tab.testId}
              className={({ isActive }) =>
                `flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? 'tab-active bg-indigo-50 border-l-4 border-indigo-500'
                    : 'tab-inactive hover:bg-gray-50'
                }`
              }
            >
              <span className="mr-3 text-lg">{tab.icon}</span>
              {tab.name}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  )
}

export default Navigation
