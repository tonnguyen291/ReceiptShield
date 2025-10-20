'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { monitoring } from '@/lib/monitoring';

export function UserActivityTracker() {
  const { user } = useAuth();

  useEffect(() => {
    // Initialize monitoring
    monitoring.initialize();

    // Track page view
    const trackPageView = () => {
      monitoring.trackEvent('page_view', {
        page: window.location.pathname,
        userId: user?.id || 'anonymous',
        timestamp: new Date().toISOString()
      });
    };

    // Track user login
    if (user) {
      monitoring.trackEvent('user_login', {
        userId: user.id,
        userRole: user.role,
        timestamp: new Date().toISOString()
      });
    }

    // Track initial page view
    trackPageView();

    // Track page changes (for SPA navigation)
    const handleRouteChange = () => {
      trackPageView();
    };

    // Listen for popstate events (back/forward navigation)
    window.addEventListener('popstate', handleRouteChange);

    // Track user interactions
    const trackUserInteraction = (event: Event) => {
      const target = event.target as HTMLElement;
      if (target) {
        monitoring.trackEvent('user_interaction', {
          userId: user?.id || 'anonymous',
          element: target.tagName,
          className: typeof target.className === 'string' ? target.className : String(target.className),
          id: target.id,
          timestamp: new Date().toISOString()
        });
      }
    };

    // Track clicks (throttled to avoid spam)
    let clickTimeout: NodeJS.Timeout;
    const handleClick = (event: Event) => {
      clearTimeout(clickTimeout);
      clickTimeout = setTimeout(() => {
        trackUserInteraction(event);
      }, 1000); // Throttle to once per second
    };

    document.addEventListener('click', handleClick);

    // Track performance metrics
    const trackPerformance = () => {
      if ('performance' in window) {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigation) {
          monitoring.trackPerformance('page_load_time', navigation.loadEventEnd - navigation.loadEventStart);
          monitoring.trackPerformance('dom_content_loaded', navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart);
        }
      }
    };

    // Track performance after page load
    if (document.readyState === 'complete') {
      trackPerformance();
    } else {
      window.addEventListener('load', trackPerformance);
    }

    // Cleanup
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      document.removeEventListener('click', handleClick);
      window.removeEventListener('load', trackPerformance);
      clearTimeout(clickTimeout);
    };
  }, [user]);

  // Track user session
  useEffect(() => {
    if (user) {
      const trackSession = () => {
        monitoring.trackEvent('user_session', {
          userId: user.id,
          userRole: user.role,
          sessionDuration: Date.now(),
          timestamp: new Date().toISOString()
        });
      };

      // Track session every 2 minutes for more real-time tracking
      const sessionInterval = setInterval(trackSession, 2 * 60 * 1000);

      return () => clearInterval(sessionInterval);
    }
  }, [user]);

  return null; // This component doesn't render anything
}
