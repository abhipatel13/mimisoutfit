/**
 * Trusted Retailers Management
 * Central source of truth for affiliate redirect whitelist
 */

export interface TrustedRetailer {
  domain: string;
  name: string;
  category: 'luxury' | 'contemporary' | 'fast-fashion' | 'marketplace';
  addedAt: string;
  isActive: boolean;
}

// Default trusted retailers (fallback if localStorage is empty)
export const DEFAULT_RETAILERS: TrustedRetailer[] = [
  // Luxury & Designer
  { domain: 'nordstrom.com', name: 'Nordstrom', category: 'luxury', addedAt: '2024-01-01', isActive: true },
  { domain: 'net-a-porter.com', name: 'Net-A-Porter', category: 'luxury', addedAt: '2024-01-01', isActive: true },
  { domain: 'saksfifthavenue.com', name: 'Saks Fifth Avenue', category: 'luxury', addedAt: '2024-01-01', isActive: true },
  { domain: 'bergdorfgoodman.com', name: 'Bergdorf Goodman', category: 'luxury', addedAt: '2024-01-01', isActive: true },
  { domain: 'matchesfashion.com', name: 'Matches Fashion', category: 'luxury', addedAt: '2024-01-01', isActive: true },
  { domain: 'mytheresa.com', name: 'Mytheresa', category: 'luxury', addedAt: '2024-01-01', isActive: true },
  { domain: 'luisaviaroma.com', name: 'Luisa Via Roma', category: 'luxury', addedAt: '2024-01-01', isActive: true },
  { domain: 'farfetch.com', name: 'Farfetch', category: 'luxury', addedAt: '2024-01-01', isActive: true },
  { domain: 'ssense.com', name: 'SSENSE', category: 'luxury', addedAt: '2024-01-01', isActive: true },
  
  // Contemporary
  { domain: 'shopbop.com', name: 'Shopbop', category: 'contemporary', addedAt: '2024-01-01', isActive: true },
  { domain: 'revolve.com', name: 'Revolve', category: 'contemporary', addedAt: '2024-01-01', isActive: true },
  { domain: 'anthropologie.com', name: 'Anthropologie', category: 'contemporary', addedAt: '2024-01-01', isActive: true },
  { domain: 'freepeople.com', name: 'Free People', category: 'contemporary', addedAt: '2024-01-01', isActive: true },
  { domain: 'urbanoutfitters.com', name: 'Urban Outfitters', category: 'contemporary', addedAt: '2024-01-01', isActive: true },
  
  // Fast Fashion
  { domain: 'zara.com', name: 'Zara', category: 'fast-fashion', addedAt: '2024-01-01', isActive: true },
  { domain: 'hm.com', name: 'H&M', category: 'fast-fashion', addedAt: '2024-01-01', isActive: true },
  { domain: 'asos.com', name: 'ASOS', category: 'fast-fashion', addedAt: '2024-01-01', isActive: true },
  { domain: 'mango.com', name: 'Mango', category: 'fast-fashion', addedAt: '2024-01-01', isActive: true },
  { domain: 'stories.com', name: '& Other Stories', category: 'fast-fashion', addedAt: '2024-01-01', isActive: true },
  
  // Marketplaces
  { domain: 'amazon.com', name: 'Amazon', category: 'marketplace', addedAt: '2024-01-01', isActive: true },
  { domain: 'etsy.com', name: 'Etsy', category: 'marketplace', addedAt: '2024-01-01', isActive: true },
  { domain: 'ebay.com', name: 'eBay', category: 'marketplace', addedAt: '2024-01-01', isActive: true },
];

/**
 * Get all trusted retailers from localStorage or defaults
 */
export function getTrustedRetailers(): TrustedRetailer[] {
  if (typeof window === 'undefined') return DEFAULT_RETAILERS;
  
  try {
    const saved = localStorage.getItem('trusted-retailers');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Failed to load trusted retailers:', error);
  }
  
  return DEFAULT_RETAILERS;
}

/**
 * Get only active retailer domains for whitelist checking
 */
export function getActiveTrustedDomains(): string[] {
  const retailers = getTrustedRetailers();
  return retailers
    .filter(r => r.isActive)
    .map(r => r.domain);
}

/**
 * Check if a URL is from a trusted retailer
 */
export function isValidAffiliateUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    
    // Enforce HTTPS
    if (urlObj.protocol !== 'https:') {
      return false;
    }
    
    // Extract domain (remove www. prefix)
    const domain = urlObj.hostname.replace(/^www\./, '');
    
    // Check if domain is in active trusted list
    const trustedDomains = getActiveTrustedDomains();
    return trustedDomains.includes(domain);
  } catch (error) {
    return false;
  }
}

/**
 * Get retailer info by domain
 */
export function getRetailerByDomain(domain: string): TrustedRetailer | null {
  const retailers = getTrustedRetailers();
  const normalizedDomain = domain.replace(/^www\./, '');
  return retailers.find(r => r.domain === normalizedDomain) || null;
}

/**
 * Get retailer info by URL
 */
export function getRetailerByUrl(url: string): TrustedRetailer | null {
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname.replace(/^www\./, '');
    return getRetailerByDomain(domain);
  } catch (error) {
    return null;
  }
}
