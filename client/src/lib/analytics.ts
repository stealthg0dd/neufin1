// Define the gtag function globally
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

// Initialize Google Analytics and Google Ads
export const initAnalytics = () => {
  const measurementId = 'G-SXSDL3YRVN'; // GA4 measurement ID
  const googleAdsId = 'AW-17089203420'; // Google Ads ID

  // Google Analytics is initialized in index.html through the script tags
  // This function is used for additional configuration or verification
  
  // Make sure gtag is defined
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    console.info('Google Analytics initialized successfully');
    
    // Set up any additional configuration if needed
    // For example, enable enhanced measurement features
    if (typeof window.gtag === 'function') {
      window.gtag('config', measurementId, {
        send_page_view: true,
        cookie_domain: 'auto',
        cookie_flags: 'SameSite=None;Secure',
        cookie_prefix: '_ga'
      });
    }
  } else {
    console.warn('Google Analytics initialization may have failed');
  }
};

// Track page views - useful for single-page applications
export const trackPageView = (url: string) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
  if (!measurementId) return;
  
  window.gtag('config', measurementId, {
    page_path: url
  });
};

// Subscription event tracking for different plans
export const trackSubscription = (
  plan: string,
  price: number,
) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  // Track for Google Analytics
  window.gtag('event', 'subscription', {
    event_category: 'ecommerce',
    event_label: plan,
    value: price,
    plan_name: plan,
    plan_value: price,
  });
  
  // Track for Google Ads conversions
  window.gtag('event', 'conversion', {
    'send_to': 'AW-17089203420/subscription',
    'value': price,
    'currency': 'USD',
    'transaction_id': generateTransactionId(),
  });
};

// Track when users initiate checkout
export const trackCheckoutStart = (
  plan: string,
  price: number,
) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  window.gtag('event', 'begin_checkout', {
    event_category: 'ecommerce',
    event_label: plan,
    value: price,
    items: [{
      plan: plan,
      price: price
    }]
  });
};

// Track when users complete checkout
export const trackPurchaseComplete = (
  plan: string,
  price: number,
  transactionId?: string
) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  const transaction = transactionId || generateTransactionId();
  
  // Track for Google Analytics
  window.gtag('event', 'purchase', {
    event_category: 'ecommerce',
    transaction_id: transaction,
    value: price,
    currency: 'USD',
    items: [{
      plan: plan,
      price: price
    }]
  });
  
  // Track for Google Ads conversions
  window.gtag('event', 'conversion', {
    'send_to': 'AW-17089203420/purchase',
    'value': price,
    'currency': 'USD',
    'transaction_id': transaction,
  });
};

// Track feature usage
export const trackFeatureUsage = (
  feature: string,
  action: string,
  category: string = 'feature_usage'
) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  window.gtag('event', action, {
    event_category: category,
    event_label: feature,
    feature_name: feature
  });
};

// Helper function to generate a transaction ID
const generateTransactionId = (): string => {
  return 'txn_' + new Date().getTime() + '_' + Math.random().toString(36).substring(2, 15);
};