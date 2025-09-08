import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const HomeView: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentFeature, setCurrentFeature] = useState(0);

  useEffect(() => {
    setIsLoaded(true);
    
    // Auto-rotate featured items every 5 seconds
    const interval = setInterval(() => {
      setCurrentFeature(prev => (prev + 1) % 4);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      id: 'dashboard',
      title: '📊 Dashboard',
      description: 'Real-time overview of your supply chain performance with key metrics and insights',
      path: '/dashboard',
      icon: '📊',
      color: 'from-blue-500 to-indigo-600',
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
      color: 'from-green-500 to-emerald-600',
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
      color: 'from-purple-500 to-violet-600',
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
      color: 'from-orange-500 to-red-600',
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
      color: 'from-yellow-500 to-orange-600',
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
      color: 'from-cyan-500 to-blue-600',
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
      color: 'from-emerald-500 to-green-600',
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
      color: 'from-teal-500 to-cyan-600',
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
      color: 'from-lime-500 to-green-600',
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
      color: 'from-pink-500 to-rose-600',
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
      color: 'from-slate-500 to-gray-600',
      details: [
        'Calculation rate configuration',
        'SLA threshold and rule settings',
        'System preferences and defaults',
        'Integration settings and API configuration',
        'Backup and data management options'
      ]
    }
  ];

  const testimonials = [
    {
      quote: "This platform has transformed our supply chain operations. We've reduced processing time by 60% and improved accuracy significantly.",
      author: "Sarah Chen",
      role: "Operations Manager",
      company: "TechFlow Solutions"
    },
    {
      quote: "The real-time analytics and automated reconciliation have saved us countless hours every week. Highly recommended!",
      author: "Michael Rodriguez",
      role: "Finance Director", 
      company: "Global Commerce Inc"
    },
    {
      quote: "Finally, a tool that brings all our supply chain data together in one place. The profit calculator is incredibly accurate.",
      author: "Emily Johnson",
      role: "Supply Chain Analyst",
      company: "Retail Dynamics"
    }
  ];

  const stats = [
    { label: 'Orders Processed', value: '2.5M+', icon: '📦' },
    { label: 'Cost Savings', value: '₹45M+', icon: '💰' },
    { label: 'Time Saved', value: '10,000+', suffix: 'hours', icon: '⏰' },
    { label: 'Accuracy Rate', value: '99.8%', icon: '🎯' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-700 to-purple-800">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-300 rounded-full mix-blend-overlay filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8">
          <div className={`text-center transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="mb-8">
              <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium mb-6">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                Now Available - Version 1.0
              </div>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 tracking-tight">
              Supply Chain &{' '}
              <span className="bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
                Profit
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-blue-100 max-w-4xl mx-auto mb-12 leading-relaxed">
              Comprehensive supply chain analytics and optimization platform for{' '}
              <span className="text-cyan-300 font-semibold">data-driven decision making</span>
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Link
                to="/dashboard"
                className="group bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 hover:shadow-xl flex items-center gap-3"
              >
                <span>Get Started</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              
              <button 
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className="group border-2 border-white/30 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/10 hover:border-white/50 transition-all duration-300 backdrop-blur-sm flex items-center gap-3"
              >
                <span>Learn More</span>
                <svg className="w-5 h-5 group-hover:translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div 
                  key={stat.label}
                  className={`text-center transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                  style={{ transitionDelay: `${index * 0.1 + 0.5}s` }}
                >
                  <div className="text-3xl mb-2">{stat.icon}</div>
                  <div className="text-2xl md:text-3xl font-bold text-white mb-1">
                    {stat.value}
                    {stat.suffix && <span className="text-lg text-blue-200 ml-1">{stat.suffix}</span>}
                  </div>
                  <div className="text-blue-200 text-sm font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Complete Supply Chain Management Suite
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              From data import to advanced analytics, our platform provides everything you need to optimize your supply chain operations with precision and efficiency.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={feature.id}
                className={`group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-gray-200 transform hover:-translate-y-2 ${
                  isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${index * 0.1}s` }}
              >
                {/* Feature Header */}
                <div className={`p-6 bg-gradient-to-r ${feature.color} text-white relative overflow-hidden`}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-700"></div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="text-4xl bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                        {feature.icon}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">
                          {feature.title.replace(/^[^\s]+ /, '')}
                        </h3>
                        <div className="text-white/80 text-sm font-medium">
                          {feature.id.charAt(0).toUpperCase() + feature.id.slice(1)}
                        </div>
                      </div>
                    </div>
                    <p className="text-white/90 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>

                {/* Feature Details */}
                <div className="p-6">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    Key Features:
                  </h4>
                  <ul className="space-y-3 mb-6">
                    {feature.details.map((detail, detailIndex) => (
                      <li key={detailIndex} className="flex items-start gap-3 text-sm text-gray-600 leading-relaxed">
                        <span className="text-green-500 mt-1 flex-shrink-0">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </span>
                        {detail}
                      </li>
                    ))}
                  </ul>
                  
                  <Link
                    to={feature.path}
                    className={`inline-flex items-center justify-center w-full px-6 py-3 bg-gradient-to-r ${feature.color} text-white rounded-xl hover:shadow-lg transition-all duration-300 font-semibold group-hover:scale-105`}
                  >
                    <span>Explore {feature.title.split(' ')[1]}</span>
                    <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Overview Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Platform Overview
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Explore our comprehensive supply chain management platform with interactive previews
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Dashboard Preview */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden group hover:shadow-2xl transition-all duration-500">
              <div className="p-8 border-b border-gray-100">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white text-2xl">
                    📊
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Dashboard Overview</h3>
                    <p className="text-gray-600">Real-time KPI monitoring and performance metrics</p>
                  </div>
                </div>
              </div>
              <div className="p-8">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl h-64 flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform duration-500">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="text-center relative z-10">
                    <div className="text-5xl mb-4 animate-bounce">📊</div>
                    <p className="text-gray-700 font-semibold text-lg">Dashboard Interface</p>
                    <p className="text-gray-500 mt-2">Live metrics and insights</p>
                    <div className="mt-4 flex justify-center gap-2">
                      <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Analytics Preview */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden group hover:shadow-2xl transition-all duration-500">
              <div className="p-8 border-b border-gray-100">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl flex items-center justify-center text-white text-2xl">
                    📈
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h3>
                    <p className="text-gray-600">Data visualization and trend analysis</p>
                  </div>
                </div>
              </div>
              <div className="p-8">
                <div className="bg-gradient-to-br from-emerald-50 to-green-100 rounded-xl h-64 flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform duration-500">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-green-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="text-center relative z-10">
                    <div className="text-5xl mb-4">📈</div>
                    <p className="text-gray-700 font-semibold text-lg">Analytics Interface</p>
                    <p className="text-gray-500 mt-2">Interactive charts & insights</p>
                    <div className="mt-4 flex justify-center">
                      <div className="flex items-end gap-1">
                        <div className="w-2 h-8 bg-emerald-400 rounded-sm animate-pulse"></div>
                        <div className="w-2 h-12 bg-green-400 rounded-sm animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-6 bg-emerald-400 rounded-sm animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-10 bg-green-400 rounded-sm animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Trusted by Industry Leaders
            </h2>
            <p className="text-xl text-gray-600">
              See what our customers say about transforming their operations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className={`bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 border border-gray-100 ${
                  isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${index * 0.2 + 1}s` }}
              >
                <div className="mb-6">
                  <div className="flex text-yellow-400 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <blockquote className="text-gray-700 text-lg leading-relaxed italic">
                    "{testimonial.quote}"
                  </blockquote>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {testimonial.author.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.author}</div>
                    <div className="text-gray-600 text-sm">{testimonial.role}</div>
                    <div className="text-gray-500 text-sm">{testimonial.company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white">
            <h2 className="text-4xl font-bold mb-6">
              See It In Action
            </h2>
            <p className="text-xl text-indigo-100 mb-12 max-w-3xl mx-auto">
              Experience the power of our platform with an interactive demo
            </p>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="text-left">
                  <h3 className="text-2xl font-bold mb-4">Try Our Platform</h3>
                  <ul className="space-y-3 text-indigo-100">
                    <li className="flex items-center gap-3">
                      <span className="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center text-white text-sm">✓</span>
                      Import sample data instantly
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center text-white text-sm">✓</span>
                      Calculate real profit margins
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center text-white text-sm">✓</span>
                      View live analytics dashboard
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center text-white text-sm">✓</span>
                      No registration required
                    </li>
                  </ul>
                </div>
                <div className="text-center">
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center gap-3 bg-white text-indigo-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-indigo-50 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    <span>Launch Demo</span>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-9-4V8a3 3 0 013-3h6a3 3 0 013 3v2M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </Link>
                  <p className="text-indigo-200 text-sm mt-4">
                    Full access • No credit card required
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Why Choose Our Platform?
            </h2>
            <p className="text-xl text-gray-600">
              Built for modern supply chain professionals who demand excellence
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: '🚀',
                title: 'Lightning Fast',
                description: 'Process 10,000+ rows in under 2 seconds with optimized algorithms'
              },
              {
                icon: '🔒',
                title: 'Secure & Private',
                description: 'All data processing happens locally - no data leaves your browser'
              },
              {
                icon: '📱',
                title: 'Responsive Design',
                description: 'Works perfectly on desktop, tablet, and mobile devices'
              },
              {
                icon: '🎯',
                title: 'Precision Focused',
                description: '4-decimal internal precision with 2-decimal display accuracy'
              }
            ].map((benefit, index) => (
              <div 
                key={index}
                className={`text-center p-6 rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300 ${
                  isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
                style={{ transitionDelay: `${index * 0.1 + 1.5}s` }}
              >
                <div className="text-4xl mb-4">{benefit.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{benefit.title}</h3>
                <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-indigo-700 to-purple-800 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-300 rounded-full mix-blend-overlay filter blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Optimize Your Supply Chain?
          </h2>
          <p className="text-xl text-blue-100 mb-12 max-w-3xl mx-auto leading-relaxed">
            Start exploring our comprehensive platform and discover how data-driven insights can transform your operations and boost profitability
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link
              to="/dashboard"
              className="group bg-white text-blue-600 px-10 py-5 rounded-xl font-bold text-xl hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-3xl flex items-center gap-3"
            >
              <span>Launch Dashboard</span>
              <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            
            <Link
              to="/imports"
              className="group border-2 border-white/30 text-white px-10 py-5 rounded-xl font-bold text-xl hover:bg-white/10 hover:border-white/50 transition-all duration-300 backdrop-blur-sm flex items-center gap-3"
            >
              <span>Import Data</span>
              <svg className="w-6 h-6 group-hover:translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
            </Link>
          </div>
          
          <div className="mt-12 flex justify-center items-center gap-8 text-blue-200 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full"></span>
              <span>No installation required</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full"></span>
              <span>Works offline</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full"></span>
              <span>Free to use</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-xl">
                  📈
                </div>
                <h3 className="text-2xl font-bold">Supply Chain & Profit</h3>
              </div>
              <p className="text-gray-400 leading-relaxed mb-6">
                Comprehensive supply chain analytics and optimization platform designed for modern businesses who need data-driven insights to stay competitive.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors">
                  <span className="sr-only">Twitter</span>
                  🐦
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors">
                  <span className="sr-only">LinkedIn</span>
                  💼
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors">
                  <span className="sr-only">GitHub</span>
                  🐙
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
                <li><Link to="/imports" className="hover:text-white transition-colors">Data Imports</Link></li>
                <li><Link to="/calculator" className="hover:text-white transition-colors">Calculator</Link></li>
                <li><Link to="/analytics" className="hover:text-white transition-colors">Analytics</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 Supply Chain & Profit. All rights reserved.
            </p>
            <p className="text-gray-500 text-sm mt-4 md:mt-0">
              Version 1.0.1 • Built with precision and reliability in mind
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomeView;