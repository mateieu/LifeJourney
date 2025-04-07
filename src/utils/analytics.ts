type AnalyticsEvent = {
  category: string;
  action: string;
  label?: string;
  value?: number;
  nonInteraction?: boolean;
};

/**
 * Track a user event for analytics
 */
export function trackEvent({ category, action, label, value, nonInteraction = false }: AnalyticsEvent) {
  try {
    // Check if Google Analytics exists
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value,
        non_interaction: nonInteraction,
      });
    }
    
    // Can integrate with other analytics providers here
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Analytics] ${category} / ${action}${label ? ` / ${label}` : ''}${value ? ` / ${value}` : ''}`);
    }
  } catch (err) {
    console.error('Error tracking event:', err);
  }
}

/**
 * Track a page view
 */
export function trackPageView(url: string, title?: string) {
  try {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('config', process.env.NEXT_PUBLIC_GA_ID, {
        page_path: url,
        page_title: title,
      });
    }
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Analytics] Page View: ${url}${title ? ` (${title})` : ''}`);
    }
  } catch (err) {
    console.error('Error tracking page view:', err);
  }
} 