/**
 * Analytics Tracking Service
 * Automatically tracks user events and sends to backend
 * Batches events for performance and reliability
 */

import { apiClient } from './api/base.api';
import { apiConfig } from '@/config/api.config';
import type { AnalyticsEvent } from '@/types/analytics.types';

class AnalyticsService {
  private queue: (AnalyticsEvent & { timestamp: string; url: string; referrer: string })[] = [];
  private flushInterval = 5000; // Flush every 5 seconds
  private timer: NodeJS.Timeout | null = null;
  private enabled = true;

  constructor() {
    // Start auto-flush timer
    this.startAutoFlush();
    
    // Flush on page unload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => this.flush());
      
      // Track page visibility changes (user leaving/returning)
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.flush();
        }
      });
    }
  }

  /**
   * Track an analytics event
   */
  async track(data: AnalyticsEvent): Promise<void> {
    if (!this.enabled) return;

    if (apiConfig.mode === 'mock' && apiConfig.debug) {
      console.log('[Analytics Mock]', data);
    }

    // Add to queue with context
    this.queue.push({
      ...data,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      referrer: document.referrer,
    });

    // Flush if queue is large
    if (this.queue.length >= 10) {
      await this.flush();
    }
  }

  /**
   * Flush queued events to backend
   */
  private async flush(): Promise<void> {
    if (this.queue.length === 0) return;

    const events = [...this.queue];
    this.queue = [];

    try {
      if (apiConfig.mode === 'real') {
        // Backend expects an array or a single event, not { events: [...] }
        await apiClient.post('/api/analytics/track', events);
      }
      // In mock mode, just clear the queue (already logged in console)
    } catch (error) {
      console.warn('[Analytics] Failed to send events:', error);
      // Don't re-queue to avoid infinite loops
    }
  }

  /**
   * Start auto-flush timer
   */
  private startAutoFlush(): void {
    if (this.timer) return;
    this.timer = setInterval(() => this.flush(), this.flushInterval);
  }

  /**
   * Stop auto-flush timer
   */
  destroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.flush(); // Final flush
  }

  /**
   * Enable/disable tracking
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }
}

// Singleton instance
export const analytics = new AnalyticsService();

// Convenience methods for common events
export const trackPageView = (page: string) => 
  analytics.track({ event: 'page_view', metadata: { page } });

export const trackProductView = (productId: string, productName: string) =>
  analytics.track({ 
    event: 'product_view', 
    resourceType: 'product',
    resourceId: productId,
    metadata: { productName }
  });

export const trackMoodboardView = (moodboardId: string, moodboardTitle: string) =>
  analytics.track({
    event: 'moodboard_view',
    resourceType: 'moodboard',
    resourceId: moodboardId,
    metadata: { moodboardTitle }
  });

export const trackSearch = (query: string, resultsCount: number, category?: string) =>
  analytics.track({ 
    event: 'search',
    metadata: { query, resultsCount, category }
  });

export const trackFavoriteAdd = (productId: string, productName: string) =>
  analytics.track({
    event: 'favorite_add',
    resourceType: 'product',
    resourceId: productId,
    metadata: { productName }
  });

export const trackFavoriteRemove = (productId: string) =>
  analytics.track({
    event: 'favorite_remove',
    resourceType: 'product',
    resourceId: productId
  });

export const trackAffiliateClick = (productId: string, productName: string, retailer: string) =>
  analytics.track({
    event: 'affiliate_click',
    resourceType: 'product',
    resourceId: productId,
    metadata: { productName, retailer }
  });

export const trackFilterChange = (filters: Record<string, any>) =>
  analytics.track({
    event: 'filter_change',
    metadata: { filters }
  });

export const trackSortChange = (sortBy: string) =>
  analytics.track({
    event: 'sort_change',
    metadata: { sortBy }
  });

export const trackMoodboardFilterChange = (tag: string, resultsCount?: number) =>
  analytics.track({
    event: 'moodboard_filter',
    metadata: { tag, resultsCount }
  });

export const trackMoodboardProductClick = (moodboardId: string, moodboardTitle: string, productId: string, productName: string) =>
  analytics.track({
    event: 'moodboard_product_click',
    resourceType: 'moodboard',
    resourceId: moodboardId,
    metadata: { moodboardTitle, productId, productName }
  });
