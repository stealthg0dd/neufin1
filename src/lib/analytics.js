// Define the gtag function globally
if (typeof window !== 'undefined') {
  window.dataLayer = window.dataLayer || [];
  window.gtag = function() {
    window.dataLayer.push(arguments);
  };
}

// Initialize Google Analytics
export const initAnalytics = () => {
  const measurementId = 'G-SXSDL3YRVN'; // GA4 measurement ID

  // Google Analytics is initialized in index.html through the script tags
  // This function is used for additional configuration or verification
  
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    console.info('Google Analytics initialized successfully');
    
    // Set up enhanced measurement features
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

// Track page views for single-page applications
export const trackPageView = (url) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  window.gtag('event', 'page_view', {
    page_path: url,
    page_title: document.title
  });
};

// Track subscription events
export const trackSubscription = (plan, price) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  window.gtag('event', 'subscription', {
    event_category: 'engagement',
    event_label: plan,
    value: price
  });
};

// Track checkout initiation
export const trackCheckoutStart = (plan, price) => {
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

// Track purchase completion
export const trackPurchaseComplete = (plan, price, transactionId) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  window.gtag('event', 'purchase', {
    transaction_id: transactionId,
    value: price,
    currency: 'USD',
    items: [{
      item_name: plan,
      price: price
    }]
  });
  
  // Track conversion for Google Ads
  window.gtag('event', 'conversion', {
    'send_to': 'AW-17089203420/purchase_complete',
    'value': price,
    'currency': 'USD',
    'transaction_id': transactionId
  });
};

// Track feature usage
export const trackFeatureUsage = (feature, action) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  window.gtag('event', 'feature_use', {
    event_category: 'engagement',
    event_label: feature,
    action: action
  });
};