import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface BreadcrumbItem {
  name: string;
  href: string;
  current?: boolean;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  showHome?: boolean;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, showHome = true }) => {
  const location = useLocation();
  
  // Default breadcrumb structure based on current path
  const getDefaultBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];
    
    if (showHome) {
      breadcrumbs.push({ name: 'Dashboard', href: '/dashboard' });
    }
    
    // Map path segments to readable names
    const pathNameMap: Record<string, string> = {
      'dashboard': 'Dashboard',
      'imports': 'Data Imports',
      'calculator': 'Profit Calculator',
      'orders': 'Order Management',
      'sla': 'SLA Monitoring',
      'analytics': 'Analytics',
      'cashflow': 'Cash Flow',
      'reconcile': 'Settlement Reconciliation',
      'validator': 'Data Validation',
      'users': 'User Management',
      'settings': 'System Settings'
    };
    
    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === pathSegments.length - 1;
      
      breadcrumbs.push({
        name: pathNameMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1),
        href: currentPath,
        current: isLast
      });
    });
    
    return breadcrumbs;
  };
  
  const breadcrumbs = items || getDefaultBreadcrumbs();
  
  return (
    <nav 
      className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm backdrop-blur-sm bg-white/95" 
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center space-x-2 text-sm max-w-7xl mx-auto">
        {breadcrumbs.map((breadcrumb, index) => (
          <li key={breadcrumb.name} className="flex items-center group">
            {index > 0 && (
              <svg 
                className="w-4 h-4 text-gray-400 mx-2 transition-colors duration-200 group-hover:text-gray-600" 
                fill="currentColor" 
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path 
                  fillRule="evenodd" 
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" 
                  clipRule="evenodd" 
                />
              </svg>
            )}
            {breadcrumb.current ? (
              <span 
                className="text-gray-900 font-medium px-2 py-1 rounded-md bg-gray-50 border border-gray-200"
                aria-current="page"
              >
                {breadcrumb.name}
              </span>
            ) : (
              <Link 
                to={breadcrumb.href} 
                className="text-gray-500 hover:text-gray-700 hover:bg-gray-50 px-2 py-1 rounded-md transition-all duration-200 hover:shadow-sm border border-transparent hover:border-gray-200"
                title={`Navigate to ${breadcrumb.name}`}
              >
                {breadcrumb.name}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
