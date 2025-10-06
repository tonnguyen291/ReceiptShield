// Performance optimization utilities and configuration
import { lazy, Suspense, type ComponentType } from 'react';

// Lazy loading configuration
export const lazyComponents = {
  // Admin components
  AdminDashboard: lazy(() => import('@/components/admin/user-management-table')),
  InviteUserDialog: lazy(() => import('@/components/admin/invite-user-dialog')),
  EditUserDialog: lazy(() => import('@/components/admin/edit-user-dialog')),
  
  // Manager components
  ManagerDashboard: lazy(() => import('@/components/manager/manager-dashboard')),
  EmployeeView: lazy(() => import('@/components/manager/employee-view')),
  
  // Employee components
  EmployeeDashboard: lazy(() => import('@/components/employee/employee-dashboard')),
  ReceiptUpload: lazy(() => import('@/components/employee/receipt-upload')),
  
  // Shared components
  LoadingSpinner: lazy(() => import('@/components/ui/loading-spinner')),
};

// Performance monitoring utilities
export const performanceUtils = {
  // Measure function execution time
  measureExecution: async <T>(
    fn: () => Promise<T>,
    name: string
  ): Promise<{ result: T; duration: number }> => {
    const start = performance.now();
    const result = await fn();
    const duration = performance.now() - start;
    
    console.log(`[Performance] ${name} took ${duration.toFixed(2)}ms`);
    return { result, duration };
  },
  
  // Debounce function for search and input
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },
  
  // Throttle function for scroll and resize events
  throttle: <T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },
};

// Image optimization utilities
export const imageOptimization = {
  // Generate optimized image URLs
  getOptimizedImageUrl: (
    url: string,
    width?: number,
    height?: number,
    quality: number = 80
  ): string => {
    if (url.startsWith('data:')) return url;
    
    // For Firebase Storage images, add resize parameters
    if (url.includes('firebasestorage.googleapis.com')) {
      const params = new URLSearchParams();
      if (width) params.append('w', width.toString());
      if (height) params.append('h', height.toString());
      params.append('q', quality.toString());
      
      return `${url}?${params.toString()}`;
    }
    
    return url;
  },
  
  // Lazy load images
  lazyLoadImage: (src: string, placeholder?: string): string => {
    return placeholder || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB2aWV3Qm94PSIwIDAgMSAxIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNmM2Y0ZjYiLz48L3N2Zz4=';
  },
};

// Bundle optimization utilities
export const bundleOptimization = {
  // Dynamic imports for heavy components
  loadComponent: async <T>(
    importFn: () => Promise<{ default: ComponentType<T> }>
  ): Promise<ComponentType<T>> => {
    const module = await importFn();
    return module.default;
  },
  
  // Preload critical resources
  preloadResource: (href: string, as: string = 'script'): void => {
    if (typeof window === 'undefined') return;
    
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    document.head.appendChild(link);
  },
  
  // Prefetch resources for next page
  prefetchResource: (href: string): void => {
    if (typeof window === 'undefined') return;
    
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = href;
    document.head.appendChild(link);
  },
};

// Caching utilities
export const cachingUtils = {
  // Simple in-memory cache
  cache: new Map<string, { data: any; timestamp: number; ttl: number }>(),
  
  // Set cache with TTL
  set: (key: string, data: any, ttl: number = 5 * 60 * 1000): void => {
    cachingUtils.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  },
  
  // Get from cache
  get: <T>(key: string): T | null => {
    const cached = cachingUtils.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > cached.ttl) {
      cachingUtils.cache.delete(key);
      return null;
    }
    
    return cached.data;
  },
  
  // Clear cache
  clear: (key?: string): void => {
    if (key) {
      cachingUtils.cache.delete(key);
    } else {
      cachingUtils.cache.clear();
    }
  },
};

// Loading states and error boundaries
export const LoadingFallback = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

export const ErrorFallback = ({ error, resetError }: { error: Error; resetError: () => void }) => (
  <div className="flex flex-col items-center justify-center p-8 text-center">
    <h2 className="text-lg font-semibold text-destructive mb-2">Something went wrong</h2>
    <p className="text-sm text-muted-foreground mb-4">{error.message}</p>
    <button
      onClick={resetError}
      className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
    >
      Try again
    </button>
  </div>
);

// Performance monitoring hooks
export const usePerformanceMonitoring = () => {
  const trackPageLoad = (pageName: string) => {
    if (typeof window !== 'undefined') {
      const startTime = performance.now();
      window.addEventListener('load', () => {
        const loadTime = performance.now() - startTime;
        console.log(`[Performance] Page ${pageName} loaded in ${loadTime.toFixed(2)}ms`);
      });
    }
  };
  
  const trackUserInteraction = (interactionType: string, startTime: number) => {
    const duration = performance.now() - startTime;
    console.log(`[Performance] ${interactionType} took ${duration.toFixed(2)}ms`);
  };
  
  return { trackPageLoad, trackUserInteraction };
};

// Resource hints for performance
export const resourceHints = {
  // Add DNS prefetch for external domains
  addDNSPrefetch: (domain: string): void => {
    if (typeof window === 'undefined') return;
    
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = `//${domain}`;
    document.head.appendChild(link);
  },
  
  // Add preconnect for critical resources
  addPreconnect: (url: string): void => {
    if (typeof window === 'undefined') return;
    
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = url;
    document.head.appendChild(link);
  },
};

// Initialize performance optimizations
export const initializePerformanceOptimizations = () => {
  if (typeof window === 'undefined') return;
  
  // Add DNS prefetch for Firebase domains
  resourceHints.addDNSPrefetch('firebaseapp.com');
  resourceHints.addDNSPrefetch('googleapis.com');
  resourceHints.addDNSPrefetch('gstatic.com');
  
  // Add preconnect for critical resources
  resourceHints.addPreconnect('https://www.googleapis.com');
  resourceHints.addPreconnect('https://www.gstatic.com');
};
