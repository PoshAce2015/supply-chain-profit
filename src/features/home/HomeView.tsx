import React from 'react';
import { Link } from 'react-router-dom';

const HomeView: React.FC = () => {
  const features = [
    {
      id: 'dashboard',
      title: '📊 Dashboard',
      description: 'Real-time overview of your supply chain performance with key metrics and insights',
      path: '/dashboard',
      icon: '📊',
      details: [
        'Live KPI monitoring with color-coded status indicators',
        'Revenue tracking and profit margin analysis',
        'Order processing status and aging alerts',
        'Interactive charts and performance trends',
        'Quick access to critical business metrics'
      ]
    },
    {
      id: 'imports',
      title: '📥 Data Imports',
      description: 'Upload and configure CSV files for comprehensive data processing and analysis',
      path: '/imports',
      icon: '📥',
      details: [
        'Drag-and-drop CSV file upload with validation',
        'Pre-built templates for Purchase, India Listings, US Purchase Orders',
        'Real-time data preview and field mapping',
        'Batch import processing for multiple files',
        'Import history tracking and error reporting'
      ]
    },
    {
      id: 'calculator',
      title: '🧮 Profit Calculator',
      description: 'Advanced margin calculation engine with real-time profit analysis',
      path: '/calculator',
      icon: '🧮',
      details: [
        'Automated profit margin calculations per SKU/ASIN',
        'Real-time cost analysis and pricing optimization',
        'Color-coded profitability indicators (Green/Yellow/Red)',
        'Bulk calculation processing for large datasets',
        'Export capabilities for financial reporting'
      ]
    },
    {
      id: 'orders',
      title: '📦 Order Management',
      description: 'Comprehensive order tracking and checklist management system',
      path: '/orders',
      icon: '📦',
      details: [
        'Order lifecycle tracking from placement to fulfillment',
        'Aging order alerts and priority management',
        'SLA compliance monitoring and reporting',
        'Search and filter capabilities across all orders',
        'Bulk order operations and status updates'
      ]
    },
    {
      id: 'sla',
      title: '⏱️ SLA Monitoring',
      description: 'Service Level Agreement tracking with automated alerts and compliance reporting',
      path: '/sla',
      icon: '⏱️',
      details: [
        'Real-time SLA violation detection and alerts',
        'Customizable SLA rules and thresholds',
        'Performance analytics and trend analysis',
        'Automated notification system for breaches',
        'Comprehensive SLA reporting and dashboards'
      ]
    },
    {
      id: 'analytics',
      title: '📈 Analytics Dashboard',
      description: 'Advanced analytics and reporting for data-driven decision making',
      path: '/analytics',
      icon: '📈',
      details: [
        'Interactive data visualization and charts',
        'Trend analysis and performance forecasting',
        'Custom date range filtering and reporting',
        'Export capabilities for external analysis',
        'Real-time data refresh and updates'
      ]
    },
    {
      id: 'cashflow',
      title: '💰 Cash Flow Simulation',
      description: 'Financial modeling and cash flow projection tools',
      path: '/cashflow',
      icon: '💰',
      details: [
        'Cash flow forecasting and modeling',
        'Scenario analysis and what-if simulations',
        'Financial impact assessment tools',
        'Budget planning and variance analysis',
        'Investment decision support analytics'
      ]
    },
    {
      id: 'reconcile',
      title: '🔍 Settlement Reconciliation',
      description: 'Automated settlement matching and variance analysis',
      path: '/reconcile',
      icon: '🔍',
      details: [
        'Automated settlement matching algorithms',
        'Variance detection and analysis',
        'Dispute resolution tracking',
        'Settlement history and audit trails',
        'Financial reconciliation reporting'
      ]
    },
    {
      id: 'validator',
      title: '✅ Data Validation',
      description: 'Comprehensive data quality checks and validation tools',
      path: '/validator',
      icon: '✅',
      details: [
        'Multi-level data validation rules',
        'Custom validation rule creation',
        'Data quality scoring and reporting',
        'Error detection and correction suggestions',
        'Validation history and audit logs'
      ]
    },
    {
      id: 'users',
      title: '👥 User Management',
      description: 'Role-based access control and user administration',
      path: '/users',
      icon: '👥',
      details: [
        'User role management and permissions',
        'Access control and security settings',
        'User activity monitoring and logging',
        'Bulk user operations and management',
        'User profile and preference management'
      ]
    },
    {
      id: 'settings',
      title: '⚙️ System Configuration',
      description: 'Application settings and configuration management',
      path: '/settings',
      icon: '⚙️',
      details: [
        'Calculation rate configuration',
        'SLA threshold and rule settings',
        'System preferences and defaults',
        'Integration settings and API configuration',
        'Backup and data management options'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Supply Chain & Profit
            </h1>
            <p className="mt-6 text-xl text-blue-100 max-w-3xl mx-auto">
              Comprehensive supply chain analytics and optimization platform for data-driven decision making
            </p>
            <div className="mt-10 flex justify-center gap-4">
              <Link
                to="/dashboard"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                Get Started
              </Link>
              <button className="border border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Complete Supply Chain Management Suite
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            From data import to advanced analytics, our platform provides everything you need to optimize your supply chain operations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div
              key={feature.id}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden"
            >
              {/* Feature Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{feature.icon}</span>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>

              {/* Feature Details */}
              <div className="p-6">
                <h4 className="font-medium text-gray-900 mb-3">Key Features:</h4>
                <ul className="space-y-2">
                  {feature.details.map((detail, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="text-green-500 mt-1">•</span>
                      {detail}
                    </li>
                  ))}
            </ul>
                
                <div className="mt-6">
                  <Link
                    to={feature.path}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Explore {feature.title.split(' ')[1]}
                    <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Platform Overview Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Platform Overview
            </h2>
            <p className="text-xl text-gray-600">
              Explore our comprehensive supply chain management platform
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Dashboard Overview */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">📊 Dashboard Overview</h3>
                <p className="text-gray-600 mt-2">Real-time KPI monitoring and performance metrics</p>
              </div>
              <div className="p-6">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg h-64 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-4">📊</div>
                    <p className="text-gray-600 font-medium">Dashboard Interface</p>
                    <p className="text-sm text-gray-500 mt-2">Live metrics and insights</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Imports Overview */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">📥 Data Import Interface</h3>
                <p className="text-gray-600 mt-2">CSV upload and field mapping capabilities</p>
              </div>
              <div className="p-6">
                <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-lg h-64 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-4">📥</div>
                    <p className="text-gray-600 font-medium">Import Interface</p>
                    <p className="text-sm text-gray-500 mt-2">Drag & drop file upload</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Calculator Overview */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">🧮 Profit Calculator</h3>
                <p className="text-gray-600 mt-2">Advanced margin calculation and analysis</p>
              </div>
              <div className="p-6">
                <div className="bg-gradient-to-br from-purple-50 to-violet-100 rounded-lg h-64 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-4">🧮</div>
                    <p className="text-gray-600 font-medium">Calculator Interface</p>
                    <p className="text-sm text-gray-500 mt-2">Real-time profit analysis</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Analytics Overview */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">📈 Analytics Dashboard</h3>
                <p className="text-gray-600 mt-2">Data visualization and trend analysis</p>
              </div>
              <div className="p-6">
                <div className="bg-gradient-to-br from-orange-50 to-amber-100 rounded-lg h-64 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-4">📈</div>
                    <p className="text-gray-600 font-medium">Analytics Interface</p>
                    <p className="text-sm text-gray-500 mt-2">Interactive charts & insights</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Optimize Your Supply Chain?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Start exploring our comprehensive platform and discover how data-driven insights can transform your operations
          </p>
          <Link
            to="/dashboard"
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors inline-block"
          >
            Launch Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomeView;
