import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

// Move all data declarations to the top, before the component
const features = [
  {
    icon: "📊",
    title: "Data Imports",
    description: "Upload and process CSV files from multiple sources with intelligent mapping",
    benefits: ["Drag & drop interface", "Auto-header detection", "Error validation"],
    link: "/imports"
  },
  {
    icon: "🧮",
    title: "Profit Calculator",
    description: "Real-time margin calculations with comprehensive cost analysis",
    benefits: ["Live calculations", "Multi-channel support", "Cost breakdown"],
    link: "/calculator"
  },
  {
    icon: "📦",
    title: "Order Management",
    description: "Track orders through complete lifecycle with SLA monitoring",
    benefits: ["Two-person workflow", "Aging alerts", "Compliance tracking"],
    link: "/orders"
  },
  {
    icon: "📈",
    title: "Analytics Dashboard",
    description: "Advanced insights and performance metrics for data-driven decisions",
    benefits: ["Real-time KPIs", "Trend analysis", "Custom reports"],
    link: "/analytics"
  },
  {
    icon: "💰",
    title: "Cash Flow",
    description: "Financial projections and cash flow simulation tools",
    benefits: ["Runway calculations", "Scenario modeling", "Risk assessment"],
    link: "/cashflow"
  },
  {
    icon: "🔍",
    title: "Reconciliation",
    description: "Automated settlement matching and variance analysis",
    benefits: ["Auto-matching", "Variance detection", "Audit trails"],
    link: "/reconcile"
  }
];

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Operations Manager",
    company: "TechFlow Solutions",
    content: "This platform transformed our supply chain visibility. We reduced processing time by 60% and caught margin issues before they became costly.",
    rating: 5,
    avatar: "SC"
  },
  {
    name: "Michael Rodriguez",
    role: "Finance Director", 
    company: "Global Commerce Inc",
    content: "The reconciliation features alone saved us 15 hours per week. The accuracy of profit calculations is outstanding.",
    rating: 5,
    avatar: "MR"
  },
  {
    name: "Emily Watson",
    role: "Supply Chain Analyst",
    company: "Retail Dynamics",
    content: "Finally, a tool that speaks our language. The SLA monitoring and alerts keep us ahead of potential issues.",
    rating: 5,
    avatar: "EW"
  }
];

const stats = [
  { label: "Processing Time Saved", value: "75%", description: "Average reduction in manual processing" },
  { label: "Margin Accuracy", value: "99.8%", description: "Calculation precision rate" },
  { label: "Data Issues Caught", value: "2,400+", description: "Potential problems identified" },
  { label: "Hours Saved Weekly", value: "40+", description: "Per operations team member" }
];

const benefits = [
  {
    category: "Operations Excellence",
    items: [
      "Automated data validation and error detection",
      "Real-time SLA monitoring and alerts",
      "Two-person approval workflows",
      "Comprehensive audit trails"
    ]
  },
  {
    category: "Financial Accuracy", 
    items: [
      "Precise margin calculations with 4-decimal precision",
      "Multi-currency support with live FX rates",
      "Settlement reconciliation and variance analysis",
      "Cash flow projections and scenario modeling"
    ]
  },
  {
    category: "Data Intelligence",
    items: [
      "Advanced analytics with trend analysis",
      "Custom KPI dashboards",
      "Predictive insights and recommendations",
      "Export capabilities for external reporting"
    ]
  }
];

const faqs = [
  {
    question: "How secure is my data?",
    answer: "All data processing happens locally in your browser. No data is transmitted to external servers, ensuring complete privacy and security."
  },
  {
    question: "What file formats are supported?",
    answer: "We support CSV, TSV, TXT, and Excel files (.xlsx, .xls) from major platforms including Amazon, Flipkart, and custom sources."
  },
  {
    question: "Can I customize the calculations?",
    answer: "Yes, all rates, fees, and calculation parameters are fully configurable through the settings panel to match your business requirements."
  },
  {
    question: "Is there a learning curve?",
    answer: "The platform is designed for immediate productivity. Most users are processing data within 15 minutes of first use."
  },
  {
    question: "What about data backup?",
    answer: "You can export complete backups of your settings and mappings. All data remains under your control with one-click reset capability."
  }
];

export default function HomeView() {
  const navigate = useNavigate();
  
  // Simplified state management
  const [currentFeature, setCurrentFeature] = useState(0);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [visibleSections, setVisibleSections] = useState(new Set<string>(['hero'])); // Start with hero visible
  const [userPreferences, setUserPreferences] = useState({ reducedMotion: false, highContrast: false });

  // Refs for intersection observer
  const heroRef = useRef<HTMLElement>(null);
  const featuresRef = useRef<HTMLElement>(null);
  const benefitsRef = useRef<HTMLElement>(null);
  const testimonialsRef = useRef<HTMLElement>(null);
  const statsRef = useRef<HTMLElement>(null);
  const faqRef = useRef<HTMLElement>(null);

  // Set page title
  useEffect(() => {
    document.title = 'Supply Chain & Profit - Analytics Platform';
  }, []);

  // Detect user preferences
  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const highContrast = window.matchMedia('(prefers-contrast: high)').matches;
    
    setUserPreferences({ reducedMotion, highContrast });
  }, []);

  // Auto-rotation for features and testimonials
  useEffect(() => {
    if (!isAutoPlaying || userPreferences.reducedMotion) return;

    const interval = setInterval(() => {
      setCurrentFeature(prev => (prev + 1) % features.length);
      setCurrentTestimonial(prev => (prev + 1) % testimonials.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, userPreferences.reducedMotion]);

  // Intersection observer for scroll animations
  useEffect(() => {
    if (userPreferences.reducedMotion) {
      // If reduced motion, make all sections visible immediately
      setVisibleSections(new Set(['hero', 'stats', 'features', 'benefits', 'testimonials', 'faq']));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections(prev => new Set([...prev, entry.target.id]));
          }
        });
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    const refs = [heroRef, featuresRef, benefitsRef, testimonialsRef, statsRef, faqRef];
    refs.forEach(ref => {
      if (ref.current) observer.observe(ref.current);
    });

    return () => observer.disconnect();
  }, [userPreferences.reducedMotion]);

  // Memoized handlers
  const handleGetStarted = useCallback(() => {
    navigate("/register");
  }, [navigate]);

  const handleViewDemo = useCallback(() => {
    navigate("/login");
  }, [navigate]);

  const handleFeatureClick = useCallback((index: number) => {
    setCurrentFeature(index);
    setIsAutoPlaying(false);
  }, []);

  const toggleAutoPlay = useCallback(() => {
    setIsAutoPlaying(prev => !prev);
  }, []);

  const toggleFAQ = useCallback((index: number) => {
    setExpandedFAQ(prev => prev === index ? null : index);
  }, []);

  // Memoized computed values
  const currentFeatureData = useMemo(() => features[currentFeature], [currentFeature]);
  const currentTestimonialData = useMemo(() => testimonials[currentTestimonial], [currentTestimonial]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Skip to content link for accessibility */}
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-white p-2 rounded shadow-lg z-50"
      >
        Skip to main content
      </a>

      <main id="main-content">
        {/* Hero Section */}
        <section 
          ref={heroRef}
          id="hero"
          className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8"
          role="banner"
          aria-label="Platform introduction"
        >
          {/* Background decoration */}
          <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
            <div className="absolute -top-40 -right-32 w-80 h-80 bg-gradient-to-br from-purple-400 to-indigo-600 rounded-full opacity-10 blur-3xl"></div>
            <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-gradient-to-tr from-blue-400 to-cyan-600 rounded-full opacity-10 blur-3xl"></div>
          </div>

          <div className="relative max-w-7xl mx-auto text-center">
            <div className="mb-8">
              <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-indigo-200 mb-6">
                <span className="text-indigo-600 font-medium text-sm">🚀 Version 1.0 Now Available</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Supply Chain & Profit
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                  Analytics Platform
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                Transform your e-commerce operations with comprehensive data analysis, 
                real-time profit calculations, and intelligent supply chain monitoring. 
                Process thousands of orders locally with enterprise-grade precision.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <button
                onClick={handleGetStarted}
                className="group relative px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/50"
                aria-label="Get started with the platform"
              >
                <span className="relative z-10">Get Started Free</span>
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-700 to-purple-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
              
              <button
                onClick={handleViewDemo}
                className="px-8 py-4 bg-white text-indigo-600 font-semibold rounded-xl border-2 border-indigo-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/50"
                aria-label="View platform demo"
              >
                View Live Demo
              </button>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>100% Local Processing</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>No Data Transmission</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Enterprise Security</span>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section 
          ref={statsRef}
          id="stats"
          className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50 backdrop-blur-sm"
          aria-label="Platform statistics"
        >
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div 
                  key={stat.label}
                  className="text-center"
                >
                  <div className="text-3xl lg:text-4xl font-bold text-indigo-600 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-gray-900 font-medium mb-1">{stat.label}</div>
                  <div className="text-sm text-gray-600">{stat.description}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section 
          ref={featuresRef}
          id="features"
          className="py-20 px-4 sm:px-6 lg:px-8"
          aria-label="Platform features"
        >
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Complete Supply Chain Solution
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Everything you need to optimize your e-commerce operations, 
                from data import to profit analysis, all in one integrated platform.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Feature Navigation */}
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Platform Features</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={toggleAutoPlay}
                      className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                      aria-label={isAutoPlaying ? "Pause auto-rotation" : "Start auto-rotation"}
                    >
                      {isAutoPlaying ? "⏸️" : "▶️"}
                    </button>
                    <span className="text-xs text-gray-500">
                      {isAutoPlaying ? "Auto-rotating" : "Paused"}
                    </span>
                  </div>
                </div>

                {features.map((feature, index) => (
                  <div
                    key={feature.title}
                    onClick={() => handleFeatureClick(index)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleFeatureClick(index);
                      }
                    }}
                    className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-indigo-500/50 ${
                      currentFeature === index
                        ? 'border-indigo-500 bg-indigo-50 shadow-lg'
                        : 'border-gray-200 bg-white hover:border-indigo-300 hover:shadow-md'
                    }`}
                    role="button"
                    tabIndex={0}
                    aria-pressed={currentFeature === index}
                    aria-label={`Select ${feature.title} feature`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`text-2xl p-3 rounded-lg transition-colors ${
                        currentFeature === index ? 'bg-indigo-100' : 'bg-gray-100'
                      }`}>
                        {feature.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-2">{feature.title}</h4>
                        <p className="text-gray-600 text-sm mb-3">{feature.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {feature.benefits.map((benefit, idx) => (
                            <span 
                              key={idx}
                              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                            >
                              {benefit}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Feature Preview */}
              <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
                <div className="text-center mb-6">
                  <div className="text-4xl mb-4">{currentFeatureData.icon}</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {currentFeatureData.title}
                  </h3>
                  <p className="text-gray-600 mb-6">{currentFeatureData.description}</p>
                  
                  <Link
                    to={currentFeatureData.link}
                    className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-4 focus:ring-indigo-500/50"
                    aria-label={`Explore ${currentFeatureData.title}`}
                  >
                    Explore Feature
                    <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>

                {/* Feature benefits */}
                <div className="space-y-3">
                  {currentFeatureData.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-gray-700">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section 
          ref={benefitsRef}
          id="benefits"
          className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50"
          aria-label="Platform benefits"
        >
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Why Choose Our Platform?
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Built specifically for e-commerce operations teams who need reliable, 
                accurate, and fast supply chain analytics.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => (
                <div 
                  key={benefit.category}
                  className="bg-white rounded-xl p-8 shadow-lg border border-gray-200 transition-all duration-500 hover:shadow-xl hover:scale-105"
                >
                  <h3 className="text-xl font-bold text-gray-900 mb-6">{benefit.category}</h3>
                  <ul className="space-y-4">
                    {benefit.items.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-700 leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section 
          ref={testimonialsRef}
          id="testimonials"
          className="py-20 px-4 sm:px-6 lg:px-8"
          aria-label="Customer testimonials"
        >
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Trusted by Operations Teams
            </h2>
            <p className="text-xl text-gray-600 mb-12">
              See how teams like yours are transforming their supply chain operations
            </p>

            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
              <div className="mb-6">
                <div className="flex justify-center mb-4">
                  {[...Array(currentTestimonialData.rating)].map((_, i) => (
                    <span key={i} className="text-yellow-400 text-xl">⭐</span>
                  ))}
                </div>
                
                <blockquote className="text-lg text-gray-700 italic mb-6 leading-relaxed">
                  "{currentTestimonialData.content}"
                </blockquote>
                
                <div className="flex items-center justify-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    {currentTestimonialData.avatar}
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-gray-900">{currentTestimonialData.name}</div>
                    <div className="text-gray-600">{currentTestimonialData.role}</div>
                    <div className="text-sm text-gray-500">{currentTestimonialData.company}</div>
                  </div>
                </div>
              </div>

              {/* Testimonial navigation */}
              <div className="flex justify-center gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTestimonial(index)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      currentTestimonial === index ? 'bg-indigo-600' : 'bg-gray-300'
                    }`}
                    aria-label={`View testimonial ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section 
          ref={faqRef}
          id="faq"
          className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50"
          aria-label="Frequently asked questions"
        >
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-xl text-gray-600">
                Everything you need to know about the platform
              </p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div 
                  key={index}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden"
                >
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors focus:outline-none focus:ring-4 focus:ring-indigo-500/50"
                    aria-expanded={expandedFAQ === index}
                    aria-controls={`faq-answer-${index}`}
                  >
                    <span className="font-semibold text-gray-900">{faq.question}</span>
                    <span className={`text-indigo-600 transition-transform duration-200 ${
                      expandedFAQ === index ? 'rotate-180' : ''
                    }`}>
                      ▼
                    </span>
                  </button>
                  
                  {expandedFAQ === index && (
                    <div 
                      id={`faq-answer-${index}`}
                      className="px-6 pb-4 text-gray-600 leading-relaxed"
                      role="region"
                      aria-labelledby={`faq-question-${index}`}
                    >
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section 
          className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-indigo-600 to-purple-600"
          aria-label="Call to action"
        >
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Ready to Transform Your Operations?
            </h2>
            <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
              Join operations teams who have already streamlined their supply chain 
              processes and improved their profit margins.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleGetStarted}
                className="px-8 py-4 bg-white text-indigo-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors shadow-lg focus:outline-none focus:ring-4 focus:ring-white/50"
              >
                Start Free Trial
              </button>
              <button
                onClick={handleViewDemo}
                className="px-8 py-4 bg-transparent text-white font-semibold rounded-xl border-2 border-white hover:bg-white hover:text-indigo-600 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-white/50"
              >
                Schedule Demo
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8" role="contentinfo">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-lg mb-4">Supply Chain & Profit</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Professional supply chain analytics and profit optimization platform 
                for e-commerce operations teams.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/imports" className="hover:text-white transition-colors">Data Imports</Link></li>
                <li><Link to="/calculator" className="hover:text-white transition-colors">Profit Calculator</Link></li>
                <li><Link to="/analytics" className="hover:text-white transition-colors">Analytics</Link></li>
                <li><Link to="/reconcile" className="hover:text-white transition-colors">Reconciliation</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Reference</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 Supply Chain & Profit. All rights reserved.
            </p>
            <div className="flex items-center gap-4 mt-4 sm:mt-0">
              <span className="text-gray-400 text-sm">Version 1.0.1</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-400 text-sm">All systems operational</span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Back to top button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-8 right-8 p-3 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-4 focus:ring-indigo-500/50 z-50"
        aria-label="Back to top"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </button>
    </div>
  );
}