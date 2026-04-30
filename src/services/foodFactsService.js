/**
 * Service for Open Food Facts API
 * Used for generic food search and barcode scanning.
 */

import { CONFIG } from './config';

/**
 * Search for a food product by name
 * @param {string} query 
 * @returns {Promise<object[]>} Array of food products with normalized nutritional info
 */
export const searchFood = async (query) => {
  if (!query || query.trim() === '') return [];

  const url = `${CONFIG.openFoodFacts.baseUrl}/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=10`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch from Open Food Facts');
    const data = await response.json();
    
    // Normalize products to only include what we need
    return (data.products || []).filter(p => p.product_name).map(product => ({
      id: product.code,
      name: product.product_name_en || product.product_name,
      brand: product.brands,
      image: product.image_url || product.image_front_small_url,
      nutrition: {
        calories: Number(product.nutriments?.['energy-kcal_100g'] || 0),
        protein: Number(product.nutriments?.['proteins_100g'] || 0),
        carbs: Number(product.nutriments?.['carbohydrates_100g'] || 0),
        fat: Number(product.nutriments?.['fat_100g'] || 0),
      },
      servingSize: '100g' // OpenFoodFacts mostly provides per 100g data
    }));
  } catch (error) {
    console.error('Open Food Facts API Error:', error);
    return [];
  }
};

/**
 * Get a specific product by barcode
 * @param {string} barcode 
 * @returns {Promise<object|null>} Normalized product info
 */
export const getProductByBarcode = async (barcode) => {
  if (!barcode) return null;

  const url = `${CONFIG.openFoodFacts.baseUrl}/api/v0/product/${barcode}.json`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch from Open Food Facts');
    const data = await response.json();
    
    if (data.status !== 1 || !data.product) return null;
    
    const product = data.product;
    return {
      id: product.code,
      name: product.product_name_en || product.product_name,
      brand: product.brands,
      image: product.image_url || product.image_front_small_url,
      nutrition: {
        calories: Number(product.nutriments?.['energy-kcal_100g'] || product.nutriments?.['energy-kcal'] || 0),
        protein: Number(product.nutriments?.['proteins_100g'] || product.nutriments?.['proteins'] || 0),
        carbs: Number(product.nutriments?.['carbohydrates_100g'] || product.nutriments?.['carbohydrates'] || 0),
        fat: Number(product.nutriments?.['fat_100g'] || product.nutriments?.['fat'] || 0),
      },
      servingSize: '100g'
    };
  } catch (error) {
    console.error('Open Food Facts API Error:', error);
    return null;
  }
};
