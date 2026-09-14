type AnalyticsEvent = 
  | { name: 'page_view'; properties: { path: string; title: string } }
  | { name: 'view_item'; properties: { product_id: string; product_name: string; price: number } }
  | { name: 'add_to_cart'; properties: { product_id: string; product_name: string; price: number; quantity: number } }
  | { name: 'remove_from_cart'; properties: { product_id: string } }
  | { name: 'begin_checkout'; properties: { value: number; currency: string } }
  | { name: 'purchase'; properties: { transaction_id: string; value: number; currency: string } }
  | { name: 'sign_up'; properties: { method: 'email' | 'sms' } }
  | { name: 'search'; properties: { query: string } };

export function trackEvent(event: AnalyticsEvent): void {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[MENACE Analytics] Event: ${event.name}`, event.properties);
  }
  // In production, send to GA4, Meta Pixel, TikTok Pixel
}

export function trackPageView(path: string, title: string): void {
  trackEvent({ name: 'page_view', properties: { path, title } });
}

export function initAnalytics(): void {
  if (process.env.NODE_ENV === 'development') {
    console.log('[MENACE Analytics] Initialized stub analytics');
  }
  // Initialize third party trackers here based on siteConfig keys
}
