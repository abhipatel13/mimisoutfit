/**
 * User Identifier Utility
 * Generates and manages a unique GUID for each user stored in localStorage
 * This identifier is sent with every API request via X-User-ID header
 */

const USER_ID_KEY = 'lookbook-user-id';

/**
 * Generate a unique GUID (UUID v4)
 * Format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
 */
function generateGUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Get or create user identifier
 * Returns existing ID from localStorage or generates a new one
 */
export function getUserIdentifier(): string {
  try {
    // Try to get existing ID from localStorage
    let userId = localStorage.getItem(USER_ID_KEY);
    
    // If no ID exists, generate a new one and store it
    if (!userId) {
      userId = generateGUID();
      localStorage.setItem(USER_ID_KEY, userId);
      
      console.log('[User ID] Generated new user identifier:', userId);
    }
    
    return userId;
  } catch (error) {
    // Fallback: if localStorage fails, generate a temporary ID
    console.warn('[User ID] localStorage unavailable, using temporary ID', error);
    return generateGUID();
  }
}

/**
 * Clear user identifier (useful for testing or privacy)
 */
export function clearUserIdentifier(): void {
  try {
    localStorage.removeItem(USER_ID_KEY);
    console.log('[User ID] User identifier cleared');
  } catch (error) {
    console.warn('[User ID] Failed to clear user identifier', error);
  }
}

/**
 * Get user identifier without creating a new one
 * Returns null if no identifier exists
 */
export function getExistingUserIdentifier(): string | null {
  try {
    return localStorage.getItem(USER_ID_KEY);
  } catch (error) {
    console.warn('[User ID] Failed to retrieve user identifier', error);
    return null;
  }
}
