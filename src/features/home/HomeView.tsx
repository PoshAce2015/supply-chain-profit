import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';

const HomeView: React.FC = () => {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentFeature, setCurrentFeature] = useState(0);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [userPreferences, setUserPreferences] = useState({
    reducedMotion: false,
    highContrast: false
  });

  // Intersection observers for scroll animations
  const { elementRef: heroRef, isIntersecting: heroVisible } = useIntersectionObserver({ threshold: 0.1, triggerOnce: true });
  const { elementRef: featuresRef, isIntersecting: featuresVisible } = useIntersectionObserver({ threshold: 0.1, triggerOnce: true });
  const { elementRef: benefitsRef, isIntersecting: benefitsVisible } = useIntersectionObserver({ threshold: 0.1, triggerOnce: true });

  // Detect user preferences
  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const highContrast = window.matchMedia('(prefers-contrast: high)').matches;
    
    setUserPreferences({ reducedMotion, highContrast });
    setIsLoaded(true);

    // Listen for preference changes
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const contrastQuery = window.matchMedia('(prefers-contrast: high)');
    
    const handleMotionChange = (e: MediaQueryListEvent) => {
      setUserPreferences(prev => ({ ...prev, reducedMotion: e.matches }));
    };
    
    const handleContrastChange = (e: MediaQueryListEvent) => {
      setUserPreferences(prev => ({ ...prev, highContrast: e.matches }));
    };

    motionQuery.addEventListener('change', handleMotionChange);
    contrastQuery.addEventListener('change', handleContrastChange);

    return () => {
      motionQuery.removeEventListener('change', handleMotionChange);
      contrastQuery.removeEventListener('change', handleContrastChange);
    };
  }, []);

  // Auto-rotate features with pause on hover
  useEffect(() => {
    if (!isPlaying || userPreferences.reducedMotion) return;
    
    const interval = setInterval(() => {
      setCurrentFeature(prev => (prev + 1) % features.length);
    }, 4000);
    
    return () => clearInterval(interval);
  }, [isPlaying, userPreferences.reducedMotion]);

  // Auto-rotate testimonials
  useEffect(() => {
    if (userPreferences.reducedMotion) return;
    
    const interval = setInterval(() => {
      setCurrentTestimonial(prev => (prev + 1) % testimonials.length);
    }, 6000);
    
    return () => clearInterval(interval);
  }, [userPreferences.reducedMotion]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && currentFeature > 0) {
        setCurrentFeature(prev => prev - 1);
        setIsPlaying(false);
      } else if (e.key === 'ArrowRight' && currentFeature < features.length - 1) {
        setCurrentFeature(prev => prev + 1);
        setIsPlaying(false);
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying(prev => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentFeature, features.length]);

  const handleFeatureNavigation = useCallback((index: number) => {
    setCurrentFeature(index);
    setIsPlaying(false);
  }, []);

  const handleTestimonialNavigation = useCallback((index: number) => {
    setCurrentTestimonial(index);
  }, []);

  const handleCTAClick = useCallback((path: string, eventName: string) => {
    // Analytics tracking would go here
    console.log(`CTA clicked: ${eventName}`);
    navigate(path);
  }, [navigate]);

  const features = useMemo(() => [
    {
      id: 'dashboard',
      title: 'Dashboard',
      description: 'Real-time overview of your supply chain performance with comprehensive KPI monitoring',
      path: '/dashboard',
      icon: '📊',
      color: 'from-blue-500 to-indigo-600',
      gradient: 'bg-gradient-to-br from-blue-50 to-indigo-100',
      details: [
        'Live KPI monitoring with color-coded status indicators',
        'Revenue tracking and profit margin analysis in real-time',
        'Order processing status and intelligent aging alerts',
        'Interactive charts with drill-down capabilities',
        'Customizable dashboard widgets and layouts'
      ],
      metrics: { users: '2.5K+', satisfaction: '98%', timesSaved: '60%' }
    },
    {
      id: 'imports',
      title: 'Data Imports',
      description: 'Intelligent CSV processing with automated field mapping and comprehensive validation',
      path: '/imports',
      icon: '📥',
      color: 'from-green-500 to-emerald-600',
      gradient: 'bg-gradient-to-br from-green-50 to-emerald-100',
      details: [
        'Drag-and-drop interface with instant file validation',
        'Smart field mapping with AI-powered suggestions',
        'Real-time data preview and quality assessment',
        'Batch processing for enterprise-scale operations',
        'Comprehensive error reporting and data cleansing'
      ],
      metrics: { accuracy: '99.8%', speed: '10K rows/sec', formats: '15+' }
    },
    {
      id: 'calculator',
      title: 'Profit Calculator',
      description: 'Advanced margin calculation engine with multi-currency support and scenario modeling',
      path: '/calculator',
      icon: '🧮',
      color: 'from-purple-500 to-violet-600',
      gradient: 'bg-gradient-to-br from-purple-50 to-violet-100',
      details: [
        'Automated profit margin calculations with 4-decimal precision',
        'Real-time cost analysis and dynamic pricing optimization',
        'Color-coded profitability indicators with trend analysis',
        'Scenario modeling for strategic decision making',
        'Export capabilities for financial reporting and audits'
      ],
      metrics: { precision: '99.99%', calculations: '1M+', savings: '₹45M+' }
    },
    {
      id: 'analytics',
      title: 'Analytics Dashboard',
      description: 'Advanced business intelligence with predictive analytics and custom reporting',
      path: '/analytics',
      icon: '📈',
      color: 'from-cyan-500 to-blue-600',
      gradient: 'bg-gradient-to-br from-cyan-50 to-blue-100',
      details: [
        'Interactive data visualization with multiple chart types',
        'Predictive analytics and trend forecasting',
        'Custom report builder with scheduled delivery',
        'Real-time collaboration and data sharing',
        'Advanced filtering and drill-down capabilities'
      ],
      metrics: { insights: '500+', reports: '10K+', accuracy: '97%' }
    }
  ], []);

  const testimonials = useMemo(() => [
    {
      quote: "This platform has revolutionized our supply chain operations. We've reduced processing time by 60% and improved accuracy significantly. The real-time analytics are game-changing.",
      author: "Sarah Chen",
      role: "Operations Manager",
      company: "TechFlow Solutions",
      avatar: "SC",
      rating: 5,
      metrics: "60% faster processing"
    },
    {
      quote: "The automated reconciliation and profit calculator have saved us countless hours every week. The accuracy is incredible and the insights are actionable.",
      author: "Michael Rodriguez",
      role: "Finance Director", 
      company: "Global Commerce Inc",
      avatar: "MR",
      rating: 5,
      metrics: "₹2.5M cost savings"
    },
    {
      quote: "Finally, a tool that brings all our supply chain data together in one place. The profit calculator is incredibly accurate and the dashboard is intuitive.",
      author: "Emily Johnson",
      role: "Supply Chain Analyst",
      company: "Retail Dynamics",
      avatar: "EJ",
      rating: 5,
      metrics: "99.8% accuracy rate"
    }
  ], []);

  const stats = useMemo(() => [
    { label: 'Orders Processed', value: '2.5M+', icon: '📦', description: 'Successfully processed orders' },
    { label: 'Cost Savings', value: '₹45M+', icon: '💰', description: 'Total savings generated' },
    { label: 'Time Saved', value: '10,000+', suffix: 'hours', icon: '⏰', description: 'Operational efficiency gained' },
    { label: 'Accuracy Rate', value: '99.8%', icon: '🎯', description: 'Data processing accuracy' }
  ], []);

  const benefits = useMemo(() => [
    {
      icon: '🚀',
      title: 'Lightning Fast Performance',
      description: 'Process 10,000+ rows in under 2 seconds with optimized algorithms and intelligent caching',
      features: ['Sub-second response times', 'Optimized for large datasets', 'Smart caching system']
    },
    {
      icon: '🔒',
      title: 'Enterprise Security',
      description: 'Bank-grade security with local processing - your data never leaves your browser',
      features: ['Local-first architecture', 'Zero data transmission', 'GDPR compliant']
    },
    {
      icon: '📱',
      title: 'Universal Compatibility',
      description: 'Works seamlessly across all devices and platforms with responsive design',
      features: ['Cross-platform support', 'Mobile optimized', 'Offline capabilities']
    },
    {
      icon: '🎯',
      title: 'Precision Engineering',
      description: '4-decimal internal precision with 2-decimal display for financial accuracy',
      features: ['Financial-grade precision', 'Audit-ready calculations', 'Regulatory compliance']
    },
    {
      icon: '⚡',
      title: 'Real-time Processing',
      description: 'Live data updates and instant calculations for immediate insights',
      features: ['Live data sync', 'Instant calculations', 'Real-time alerts']
    },
    {
      icon: '🔧',
      title: 'Highly Configurable',
      description: 'Customize every aspect to match your business processes and requirements',
      features: ['Custom workflows', 'Flexible settings', 'Personalized dashboards']
    }
  ], []);

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Skip to content link for accessibility */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-lg z-50"
      >
        Skip to main content
      </a>

      {/* Hero Section */}
      <section 
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800"
        aria-labelledby="hero-title"
      >
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-20">
          <div className={`absolute top-0 left-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl ${!userPreferences.reducedMotion ? 'animate-pulse' : ''}`}></div>
          <div className={`absolute bottom-0 right-0 w-96 h-96 bg-cyan-300 rounded-full mix-blend-overlay filter blur-3xl ${!userPreferences.reducedMotion ? 'animate-pulse' : ''}`} style={{ animationDelay: '2s' }}></div>
          <div className={`absolute top-1/2 left-1/2 w-64 h-64 bg-purple-300 rounded-full mix-blend-overlay filter blur-3xl ${!userPreferences.reducedMotion ? 'animate-pulse' : ''}`} style={{ animationDelay: '4s' }}></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8 text-center">
          <div className={`transition-all duration-1000 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {/* Status Badge */}
            <div className="inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium mb-8 border border-white/20">
              <span className={`w-2 h-2 bg-green-400 rounded-full mr-3 ${!userPreferences.reducedMotion ? 'animate-pulse' : ''}`}></span>
              <span>Now Available - Version 1.0.1</span>
              <span className="ml-3 px-2 py-1 bg-green-400/20 rounded-full text-xs">NEW</span>
            </div>
            
            <h1 
              id="hero-title"
              className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-8 tracking-tight leading-tight"
            >
              Supply Chain &{' '}
              <span className="bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300 bg-clip-text text-transparent">
                Profit
              </span>
              <br />
              <span className="text-3xl md:text-4xl lg:text-5xl text-blue-100 font-normal">
                Analytics Platform
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-blue-100 max-w-4xl mx-auto mb-12 leading-relaxed">
              Transform your operations with{' '}
              <span className="text-cyan-300 font-semibold">intelligent analytics</span>,{' '}
              <span className="text-purple-300 font-semibold">automated calculations</span>, and{' '}
              <span className="text-green-300 font-semibold">real-time insights</span>
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
              <button
                onClick={() => handleCTAClick('/dashboard', 'hero_primary_cta')}
                className="group bg-white text-blue-600 px-10 py-5 rounded-2xl font-bold text-xl hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center gap-3 min-w-[200px] justify-center"
                aria-label="Launch dashboard to start using the platform"
              >
                <span>Launch Dashboard</span>
                <svg className={`w-6 h-6 ${!userPreferences.reducedMotion ? 'group-hover:translate-x-1' : ''} transition-transform`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
              
              <button
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className="group border-2 border-white/30 text-white px-10 py-5 rounded-2xl font-bold text-xl hover:bg-white/10 hover:border-white/50 transition-all duration-300 backdrop-blur-sm flex items-center gap-3 min-w-[200px] justify-center"
                aria-label="Learn more about platform features"
              >
                <span>Explore Features</span>
                <svg className={`w-6 h-6 ${!userPreferences.reducedMotion ? 'group-hover:translate-y-1' : ''} transition-transform`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
              {stats.map((stat, index) => (
                <div 
                  key={stat.label}
                  className={`text-center transition-all duration-700 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                  style={{ transitionDelay: `${index * 0.1 + 0.5}s` }}
                >
                  <div className="text-4xl mb-3" role="img" aria-label={stat.description}>
                    {stat.icon}
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                    {stat.value}
                    {stat.suffix && <span className="text-lg text-blue-200 ml-1">{stat.suffix}</span>}
                  </div>
                  <div className="text-blue-200 text-sm font-medium">{stat.label}</div>
                  <div className="text-blue-300 text-xs mt-1">{stat.description}</div>
                </div>
              ))}
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
              <div className={`w-6 h-10 border-2 border-white/30 rounded-full flex justify-center ${!userPreferences.reducedMotion ? 'animate-bounce' : ''}`}>
                <div className="w-1 h-3 bg-white/60 rounded-full mt-2"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main id="main-content">
        {/* Features Section */}
        <section 
          id="features" 
          ref={featuresRef}
          className="py-24 bg-gradient-to-br from-gray-50 to-blue-50"
          aria-labelledby="features-title"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className={`text-center mb-20 transition-all duration-1000 ${featuresVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <h2 id="features-title" className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Complete Supply Chain Management Suite
              </h2>
              <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                From data import to advanced analytics, our platform provides everything you need to optimize your supply chain operations with precision and efficiency.
              </p>
            </div>

            {/* Featured Module Showcase */}
            <div className="mb-16">
              <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
                <div className="grid grid-cols-1 lg:grid-cols-2">
                  {/* Feature Content */}
                  <div className="p-12 flex flex-col justify-center">
                    <div className="mb-8">
                      <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${features[currentFeature].color} rounded-2xl text-white text-3xl mb-6`}>
                        {features[currentFeature].icon}
                      </div>
                      <h3 className="text-3xl font-bold text-gray-900 mb-4">
                        {features[currentFeature].title}
                      </h3>
                      <p className="text-lg text-gray-600 leading-relaxed mb-6">
                        {features[currentFeature].description}
                      </p>
                    </div>

                    <ul className="space-y-4 mb-8">
                      {features[currentFeature].details.map((detail, index) => (
                        <li key={index} className="flex items-start gap-3 text-gray-700">
                          <span className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-sm mt-0.5 flex-shrink-0">
                            ✓
                          </span>
                          <span className="leading-relaxed">{detail}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Feature Metrics */}
                    <div className="grid grid-cols-3 gap-4 mb-8">
                      {Object.entries(features[currentFeature].metrics).map(([key, value]) => (
                        <div key={key} className="text-center p-3 bg-gray-50 rounded-xl">
                          <div className="text-lg font-bold text-gray-900">{value}</div>
                          <div className="text-xs text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}</div>
                        </div>
                      ))}
                    </div>

                    <Link
                      to={features[currentFeature].path}
                      className={`inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r ${features[currentFeature].color} text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105`}
                    >
                      <span>Explore {features[currentFeature].title}</span>
                      <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </Link>
                  </div>

                  {/* Feature Visual */}
                  <div className={`p-12 ${features[currentFeature].gradient} flex items-center justify-center relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
                    <div className="relative z-10 text-center">
                      <div className="text-8xl mb-6 opacity-80">{features[currentFeature].icon}</div>
                      <div className="text-2xl font-bold text-gray-800 mb-2">{features[currentFeature].title}</div>
                      <div className="text-gray-600">Interactive Interface</div>
                      
                      {/* Animated Elements */}
                      <div className="mt-8 flex justify-center gap-2">
                        {[...Array(4)].map((_, i) => (
                          <div 
                            key={i}
                            className={`w-3 h-3 bg-blue-400 rounded-full ${!userPreferences.reducedMotion ? 'animate-pulse' : ''}`}
                            style={{ animationDelay: `${i * 0.2}s` }}
                          ></div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Feature Navigation */}
                <div className="px-12 py-8 bg-gray-50 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-3">
                      {features.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => handleFeatureNavigation(index)}
                          className={`w-3 h-3 rounded-full transition-all duration-300 ${
                            index === currentFeature 
                              ? 'bg-blue-600 scale-125' 
                              : 'bg-gray-300 hover:bg-gray-400'
                          }`}
                          aria-label={`View feature ${index + 1}: ${features[index].title}`}
                        />
                      ))}
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="text-gray-500 hover:text-gray-700 transition-colors"
                        aria-label={isPlaying ? 'Pause auto-rotation' : 'Resume auto-rotation'}
                      >
                        {isPlaying ? '⏸️' : '▶️'}
                      </button>
                      
                      <div className="text-sm text-gray-500">
                        {currentFeature + 1} of {features.length}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* All Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.slice(4).concat([
                {
                  id: 'orders',
                  title: 'Order Management',
                  description: 'Comprehensive order tracking with SLA monitoring and compliance reporting',
                  path: '/orders',
                  icon: '📦',
                  color: 'from-orange-500 to-red-600',
                  gradient: 'bg-gradient-to-br from-orange-50 to-red-100',
                  details: [
                    'Order lifecycle tracking from placement to fulfillment',
                    'Aging order alerts and priority management',
                    'SLA compliance monitoring and reporting',
                    'Two-person approval workflow for compliance'
                  ],
                  metrics: { orders: '50K+', compliance: '98%', efficiency: '75%' }
                },
                {
                  id: 'cashflow',
                  title: 'Cash Flow Simulation',
                  description: 'Financial modeling and cash flow projection with scenario analysis',
                  path: '/cashflow',
                  icon: '💰',
                  color: 'from-emerald-500 to-green-600',
                  gradient: 'bg-gradient-to-br from-emerald-50 to-green-100',
                  details: [
                    'Cash flow forecasting and modeling',
                    'Scenario analysis and what-if simulations',
                    'Financial impact assessment tools',
                    'Budget planning and variance analysis'
                  ],
                  metrics: { accuracy: '96%', scenarios: '100+', forecasts: '1K+' }
                },
                {
                  id: 'reconcile',
                  title: 'Settlement Reconciliation',
                  description: 'Automated settlement matching with intelligent variance detection',
                  path: '/reconcile',
                  icon: '🔍',
                  color: 'from-teal-500 to-cyan-600',
                  gradient: 'bg-gradient-to-br from-teal-50 to-cyan-100',
                  details: [
                    'Automated settlement matching algorithms',
                    'Variance detection and analysis',
                    'Dispute resolution tracking',
                    'Comprehensive audit trails'
                  ],
                  metrics: { matches: '99.5%', disputes: '0.2%', time: '90%' }
                }
              ]).map((feature, index) => (
                <div
                  key={feature.id}
                  className={`group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-gray-200 transform hover:-translate-y-2 ${
                    featuresVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                  }`}
                  style={{ transitionDelay: `${index * 0.1}s` }}
                >
                  {/* Feature Header */}
                  <div className={`p-8 bg-gradient-to-r ${feature.color} text-white relative overflow-hidden`}>
                    <div className={`absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 ${!userPreferences.reducedMotion ? 'group-hover:scale-150' : ''} transition-transform duration-700`}></div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="text-5xl bg-white/20 p-4 rounded-2xl backdrop-blur-sm">
                          {feature.icon}
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold mb-1">
                            {feature.title}
                          </h3>
                          <div className="text-white/80 text-sm font-medium uppercase tracking-wide">
                            {feature.id}
                          </div>
                        </div>
                      </div>
                      <p className="text-white/90 leading-relaxed text-lg">
                        {feature.description}
                      </p>
                    </div>
                  </div>

                  {/* Feature Details */}
                  <div className="p-8">
                    <h4 className="font-semibold text-gray-900 mb-6 flex items-center gap-2 text-lg">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      Key Capabilities:
                    </h4>
                    <ul className="space-y-4 mb-8">
                      {feature.details.map((detail, detailIndex) => (
                        <li key={detailIndex} className="flex items-start gap-3 text-gray-600 leading-relaxed">
                          <span className="text-green-500 mt-1 flex-shrink-0">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </span>
                          {detail}
                        </li>
                      ))}
                    </ul>

                    {/* Feature Metrics */}
                    <div className="grid grid-cols-3 gap-3 mb-8">
                      {Object.entries(feature.metrics).map(([key, value]) => (
                        <div key={key} className="text-center p-3 bg-gray-50 rounded-xl">
                          <div className="text-lg font-bold text-gray-900">{value}</div>
                          <div className="text-xs text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}</div>
                        </div>
                      ))}
                    </div>
                    
                    <Link
                      to={feature.path}
                      className={`inline-flex items-center justify-center w-full px-6 py-4 bg-gradient-to-r ${feature.color} text-white rounded-xl hover:shadow-lg transition-all duration-300 font-semibold text-lg group-hover:scale-105`}
                    >
                      <span>Explore {feature.title}</span>
                      <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section 
          ref={benefitsRef}
          className="py-24 bg-white"
          aria-labelledby="benefits-title"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className={`text-center mb-20 transition-all duration-1000 ${benefitsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <h2 id="benefits-title" className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Why Choose Our Platform?
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Built for modern supply chain professionals who demand excellence, security, and performance
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => (
                <div 
                  key={index}
                  className={`group text-center p-8 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 ${
                    benefitsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                  }`}
                  style={{ transitionDelay: `${index * 0.1}s` }}
                >
                  <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">
                    {benefit.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{benefit.title}</h3>
                  <p className="text-gray-600 leading-relaxed mb-6">{benefit.description}</p>
                  
                  <ul className="space-y-2 text-sm text-gray-500">
                    {benefit.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-2 justify-center">
                        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-24 bg-gradient-to-br from-blue-50 to-indigo-100" aria-labelledby="testimonials-title">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 id="testimonials-title" className="text-4xl font-bold text-gray-900 mb-6">
                Trusted by Industry Leaders
              </h2>
              <p className="text-xl text-gray-600">
                See what our customers say about transforming their operations
              </p>
            </div>

            {/* Featured Testimonial */}
            <div className="max-w-4xl mx-auto mb-16">
              <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
                <div className="p-12 text-center">
                  <div className="flex justify-center mb-6">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-6 h-6 text-yellow-400 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  
                  <blockquote className="text-2xl text-gray-700 leading-relaxed italic mb-8 font-medium">
                    "{testimonials[currentTestimonial].quote}"
                  </blockquote>
                  
                  <div className="flex items-center justify-center gap-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      {testimonials[currentTestimonial].avatar}
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-gray-900 text-lg">{testimonials[currentTestimonial].author}</div>
                      <div className="text-gray-600">{testimonials[currentTestimonial].role}</div>
                      <div className="text-gray-500 text-sm">{testimonials[currentTestimonial].company}</div>
                      <div className="text-blue-600 text-sm font-semibold mt-1">{testimonials[currentTestimonial].metrics}</div>
                    </div>
                  </div>
                </div>

                {/* Testimonial Navigation */}
                <div className="px-12 py-6 bg-gray-50 border-t border-gray-100 flex justify-center gap-3">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => handleTestimonialNavigation(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        index === currentTestimonial 
                          ? 'bg-blue-600 scale-125' 
                          : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                      aria-label={`View testimonial ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* All Testimonials Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
              {testimonials.map((testimonial, index) => (
                <div 
                  key={index}
                  className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-500 border border-gray-100 group"
                >
                  <div className="flex justify-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  
                  <blockquote className="text-gray-700 leading-relaxed italic mb-6 text-center">
                    "{testimonial.quote.length > 120 ? testimonial.quote.substring(0, 120) + '...' : testimonial.quote}"
                  </blockquote>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{testimonial.author}</div>
                      <div className="text-gray-600 text-sm">{testimonial.role}</div>
                      <div className="text-gray-500 text-sm">{testimonial.company}</div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="text-center">
                      <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                        {testimonial.metrics}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Interactive Demo Section */}
        <section className="py-24 bg-gradient-to-r from-indigo-600 to-purple-700 relative overflow-hidden" aria-labelledby="demo-title">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-300 rounded-full mix-blend-overlay filter blur-3xl"></div>
          </div>
          
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center text-white mb-16">
              <h2 id="demo-title" className="text-4xl md:text-5xl font-bold mb-6">
                Experience the Platform
              </h2>
              <p className="text-xl text-indigo-100 max-w-3xl mx-auto leading-relaxed">
                Try our comprehensive demo with real data and see immediate results
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Demo Features */}
              <div className="space-y-8">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                  <h3 className="text-2xl font-bold text-white mb-6">What You'll Experience:</h3>
                  <ul className="space-y-4">
                    {[
                      { icon: '📊', text: 'Import sample data instantly with one click', time: '< 5 seconds' },
                      { icon: '🧮', text: 'Calculate real profit margins with live data', time: '< 2 seconds' },
                      { icon: '📈', text: 'View interactive analytics dashboard', time: 'Real-time' },
                      { icon: '🔍', text: 'Explore settlement reconciliation', time: 'Instant' },
                      { icon: '💰', text: 'Run cash flow simulations', time: '< 1 second' }
                    ].map((item, index) => (
                      <li key={index} className="flex items-center gap-4 text-white">
                        <span className="text-2xl">{item.icon}</span>
                        <div className="flex-1">
                          <span className="text-lg">{item.text}</span>
                          <div className="text-cyan-300 text-sm font-medium">{item.time}</div>
                        </div>
                        <span className="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center text-white text-sm">
                          ✓
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Trust Indicators */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center border border-white/20">
                    <div className="text-3xl mb-2">🔒</div>
                    <div className="text-white font-semibold">100% Secure</div>
                    <div className="text-indigo-200 text-sm">Local processing only</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center border border-white/20">
                    <div className="text-3xl mb-2">⚡</div>
                    <div className="text-white font-semibold">Instant Results</div>
                    <div className="text-indigo-200 text-sm">No waiting time</div>
                  </div>
                </div>
              </div>

              {/* Demo CTA */}
              <div className="text-center lg:text-left">
                <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-12 border border-white/20">
                  <h3 className="text-3xl font-bold text-white mb-6">
                    Ready to Get Started?
                  </h3>
                  <p className="text-indigo-100 text-lg mb-8 leading-relaxed">
                    Launch the platform now and start exploring with sample data. No registration required.
                  </p>
                  
                  <div className="space-y-4">
                    <button
                      onClick={() => handleCTAClick('/dashboard', 'demo_primary_cta')}
                      className="w-full bg-white text-indigo-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-indigo-50 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
                    >
                      <span>🚀 Launch Platform</span>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </button>
                    
                    <button
                      onClick={() => handleCTAClick('/imports', 'demo_secondary_cta')}
                      className="w-full border-2 border-white/30 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/10 hover:border-white/50 transition-all duration-300 backdrop-blur-sm flex items-center justify-center gap-3"
                    >
                      <span>📥 Import Your Data</span>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="mt-8 flex justify-center items-center gap-8 text-indigo-200 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                      <span>No installation</span>
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
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-24 bg-white" aria-labelledby="faq-title">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 id="faq-title" className="text-4xl font-bold text-gray-900 mb-6">
                Frequently Asked Questions
              </h2>
              <p className="text-xl text-gray-600">
                Everything you need to know about our platform
              </p>
            </div>

            <div className="space-y-6">
              {[
                {
                  question: "How secure is my data?",
                  answer: "Your data is completely secure. All processing happens locally in your browser - no data is ever transmitted to our servers. This ensures complete privacy and compliance with data protection regulations."
                },
                {
                  question: "What file formats are supported?",
                  answer: "We support CSV, TSV, TXT, and Excel files (.xlsx, .xls). Our intelligent parser can handle various delimiters and automatically detect file formats for seamless importing."
                },
                {
                  question: "How accurate are the profit calculations?",
                  answer: "Our calculations use 4-decimal precision internally with financial-grade accuracy. All formulas are based on industry standards and have been validated against real-world scenarios."
                },
                {
                  question: "Can I use this on mobile devices?",
                  answer: "Yes! Our platform is fully responsive and optimized for mobile devices. You can access all features on smartphones and tablets with the same functionality as desktop."
                },
                {
                  question: "Is there a limit on data size?",
                  answer: "The platform can efficiently handle datasets with 10,000+ rows. For larger datasets, we recommend using our batch processing features for optimal performance."
                },
                {
                  question: "Do I need to install anything?",
                  answer: "No installation required! Our platform runs entirely in your web browser. Just visit the website and start using it immediately - it even works offline."
                }
              ].map((faq, index) => (
                <details key={index} className="group bg-gray-50 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
                  <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {faq.question}
                    </h3>
                    <svg className="w-5 h-5 text-gray-500 group-hover:text-blue-600 transition-all duration-200 group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="px-6 pb-6">
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-24 bg-gradient-to-r from-blue-600 via-indigo-700 to-purple-800 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-300 rounded-full mix-blend-overlay filter blur-3xl"></div>
          </div>
          
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Transform Your Supply Chain Today
            </h2>
            <p className="text-xl text-blue-100 mb-12 max-w-3xl mx-auto leading-relaxed">
              Join thousands of professionals who have optimized their operations and boosted profitability with our platform
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
              <button
                onClick={() => handleCTAClick('/dashboard', 'final_cta_dashboard')}
                className="group bg-white text-blue-600 px-12 py-6 rounded-2xl font-bold text-xl hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-3xl flex items-center gap-4"
              >
                <span>🚀 Start Free Trial</span>
                <svg className={`w-6 h-6 ${!userPreferences.reducedMotion ? 'group-hover:translate-x-1' : ''} transition-transform`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
              
              <button
                onClick={() => handleCTAClick('/imports', 'final_cta_import')}
                className="group border-2 border-white/30 text-white px-12 py-6 rounded-2xl font-bold text-xl hover:bg-white/10 hover:border-white/50 transition-all duration-300 backdrop-blur-sm flex items-center gap-4"
              >
                <span>📊 View Demo</span>
                <svg className={`w-6 h-6 ${!userPreferences.reducedMotion ? 'group-hover:scale-110' : ''} transition-transform`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
            
            {/* Trust Indicators */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {[
                { icon: '🔒', label: 'Bank-Grade Security', desc: 'Your data stays local' },
                { icon: '⚡', label: 'Lightning Fast', desc: 'Sub-second processing' },
                { icon: '🎯', label: '99.8% Accurate', desc: 'Financial precision' },
                { icon: '🌍', label: 'Global Ready', desc: 'Multi-currency support' }
              ].map((indicator, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl mb-3">{indicator.icon}</div>
                  <div className="text-white font-semibold text-lg">{indicator.label}</div>
                  <div className="text-blue-200 text-sm">{indicator.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Enhanced Footer */}
      <footer className="bg-gray-900 text-white py-16" role="contentinfo">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* Company Info */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl">
                  📈
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Supply Chain & Profit</h3>
                  <p className="text-gray-400 text-sm">Analytics & Optimization Platform</p>
                </div>
              </div>
              <p className="text-gray-400 leading-relaxed mb-8 max-w-md">
                Comprehensive supply chain analytics and optimization platform designed for modern businesses who need data-driven insights to stay competitive in today's market.
              </p>
              
              {/* Social Links */}
              <div className="flex gap-4">
                {[
                  { name: 'Twitter', icon: '🐦', href: '#' },
                  { name: 'LinkedIn', icon: '💼', href: '#' },
                  { name: 'GitHub', icon: '🐙', href: '#' },
                  { name: 'YouTube', icon: '📺', href: '#' }
                ].map((social) => (
                  <a 
                    key={social.name}
                    href={social.href} 
                    className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center hover:bg-gray-700 transition-all duration-300 transform hover:scale-110"
                    aria-label={`Follow us on ${social.name}`}
                  >
                    <span className="text-xl">{social.icon}</span>
                  </a>
                ))}
              </div>
            </div>
            
            {/* Platform Links */}
            <div>
              <h4 className="font-bold text-lg mb-6 text-white">Platform</h4>
              <ul className="space-y-3">
                {[
                  { name: 'Dashboard', path: '/dashboard' },
                  { name: 'Data Imports', path: '/imports' },
                  { name: 'Profit Calculator', path: '/calculator' },
                  { name: 'Analytics', path: '/analytics' },
                  { name: 'Order Management', path: '/orders' },
                  { name: 'Settings', path: '/settings' }
                ].map((link) => (
                  <li key={link.name}>
                    <Link 
                      to={link.path} 
                      className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center gap-2 group"
                    >
                      <span className={`w-1 h-1 bg-blue-400 rounded-full ${!userPreferences.reducedMotion ? 'group-hover:scale-150' : ''} transition-transform`}></span>
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Support Links */}
            <div>
              <h4 className="font-bold text-lg mb-6 text-white">Support & Resources</h4>
              <ul className="space-y-3">
                {[
                  { name: 'Documentation', href: '/docs' },
                  { name: 'Help Center', href: '/help' },
                  { name: 'API Reference', href: '/api' },
                  { name: 'Contact Support', href: '/contact' },
                  { name: 'Privacy Policy', href: '/privacy' },
                  { name: 'Terms of Service', href: '/terms' }
                ].map((link) => (
                  <li key={link.name}>
                    <a 
                      href={link.href} 
                      className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center gap-2 group"
                    >
                      <span className={`w-1 h-1 bg-purple-400 rounded-full ${!userPreferences.reducedMotion ? 'group-hover:scale-150' : ''} transition-transform`}></span>
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {/* Footer Bottom */}
          <div className="border-t border-gray-800 mt-16 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-6">
                <p className="text-gray-400 text-sm">
                  © 2025 Supply Chain & Profit. All rights reserved.
                </p>
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  <span>System Status: Operational</span>
                </div>
              </div>
              
              <div className="flex items-center gap-6 text-sm text-gray-400">
                <span>Version 1.0.1</span>
                <span>•</span>
                <span>Built with precision</span>
                <span>•</span>
                <button 
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                  aria-label="Back to top"
                >
                  <span>Back to top</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomeView;