import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '../lib/analytics';

/**
 * Hook for tracking page views in the application
 * Automatically tracks when the route changes
 */
export function useAnalytics() {
  const location = useLocation();
  const prevLocationRef = useRef(location.pathname);
  
  useEffect(() => {
    if (location.pathname !== prevLocationRef.current) {
      trackPageView(location.pathname);
      prevLocationRef.current = location.pathname;
    }
  }, [location]);
}