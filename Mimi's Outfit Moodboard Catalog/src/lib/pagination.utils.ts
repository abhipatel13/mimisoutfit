/**
 * Pagination Utilities
 * Helper functions for pagination calculations and management
 */

import type { PaginationInfo } from '@/types';

export const DEFAULT_PAGE_SIZE = 12;
export const PAGE_SIZE_OPTIONS = [12, 24, 36, 48];

/**
 * Calculate pagination information from data array
 */
export function calculatePagination<T>(
  data: T[],
  page: number = 1,
  limit: number = DEFAULT_PAGE_SIZE
): { paginatedData: T[]; pagination: PaginationInfo } {
  const total = data.length;
  const totalPages = Math.ceil(total / limit);
  const normalizedPage = Math.max(1, Math.min(page, totalPages || 1));
  
  const startIndex = (normalizedPage - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedData = data?.slice(startIndex, endIndex) || [];

  const pagination: PaginationInfo = {
    page: normalizedPage,
    limit,
    total,
    totalPages,
    hasNextPage: normalizedPage < totalPages,
    hasPrevPage: normalizedPage > 1,
  };

  return { paginatedData, pagination };
}

/**
 * Get page numbers to display in pagination UI
 */
export function getPageNumbers(currentPage: number, totalPages: number): (number | string)[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: (number | string)[] = [];
  
  // Always show first page
  pages.push(1);

  if (currentPage > 3) {
    pages.push('...');
  }

  // Show pages around current page
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (currentPage < totalPages - 2) {
    pages.push('...');
  }

  // Always show last page
  if (totalPages > 1) {
    pages.push(totalPages);
  }

  return pages;
}

/**
 * Calculate offset for API requests
 */
export function calculateOffset(page: number, limit: number): number {
  return (page - 1) * limit;
}

/**
 * Get page range text (e.g., "Showing 1-12 of 52")
 */
export function getPageRangeText(pagination: PaginationInfo): string {
  const { page, limit, total } = pagination;
  
  if (total === 0) {
    return 'No items';
  }

  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return `Showing ${start}-${end} of ${total}`;
}

/**
 * Validate page number
 */
export function validatePage(page: number | undefined, totalPages: number): number {
  if (!page || page < 1) return 1;
  if (page > totalPages) return totalPages || 1;
  return Math.floor(page);
}
