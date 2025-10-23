/**
 * Utility functions for handling image URLs
 */
import api from '../api/axios';

const PLACEHOLDER = '/placeholder.svg';

/**
 * Get the full image URL, handling both external URLs and relative paths
 * @param {string} imageUrl - The image URL (can be relative or absolute)
 * @returns {string} - The full image URL
 */
export const getImageUrl = (imageUrl) => {
  if (!imageUrl) return PLACEHOLDER;

  // If it's already a full URL (starts with http), return as is
  if (typeof imageUrl === 'string' && imageUrl.startsWith('http')) {
    return imageUrl;
  }

  // If it's a relative path, prepend the API base URL
  const baseUrl = api?.defaults?.baseURL || '';
  return `${baseUrl}${imageUrl}`;
};

/**
 * Get image props with error handling
 * @param {string} imageUrl - The image URL
 * @param {string} alt - The alt text
 * @returns {object} - Image props object
 */
export const getImageProps = (imageUrl, alt = 'Product') => ({
  src: getImageUrl(imageUrl),
  alt: alt || 'Product',
  onError: (e) => {
    if (e?.target?.dataset?.fallbackApplied === 'true') return;
    e.target.src = PLACEHOLDER;
    e.target.dataset.fallbackApplied = 'true';
  }
});

/**
 * Format price to display format
 * @param {string|number} price - The price value
 * @returns {string} - Formatted price string
 */
export const formatPrice = (price) => {
  if (!price) return '0.00';
  return parseFloat(price).toFixed(2);
};
