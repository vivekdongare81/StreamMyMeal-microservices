import { restaurantsData } from '@/data';
import { Restaurant } from '@/data/types';

const API_BASE = '/api/v1';
const RESTAURANT_IMAGE_BASE = '/api/v1/restaurants/images/';

function getRestaurantImageUrl(image: string): string {
  if (!image) return '';
  if (image.startsWith('http://') || image.startsWith('https://') || image.startsWith('/api/v1/restaurants/images/')) return image;
  return RESTAURANT_IMAGE_BASE + image;
}

export class RestaurantService {
  static async getRestaurants(): Promise<Restaurant[]> {
    // Fetch from backend
    let backendRestaurants: Restaurant[] = [];
    try {
      const res = await fetch(`${API_BASE}/restaurants?page=0&size=10`);
      if (res.ok) {
        const data = await res.json();
        // Support both array and paginated response
        backendRestaurants = Array.isArray(data) ? data : (data.content || []);
        // Normalize backend IDs to string and image to full URL
        backendRestaurants = backendRestaurants.map(r => ({
          ...r,
          id: String((r as any).id ?? (r as any).restaurantId),
          image: getRestaurantImageUrl((r as any).image)
        }));
      }
    } catch (e) {
      // fail silently, fallback to dummy
    }
    // Merge: backend first, then dummy if not present
    const backendIds = new Set(backendRestaurants.map(r => r.id));
    const merged = [
      ...backendRestaurants,
      ...restaurantsData.filter(r => !backendIds.has(r.id)).map(r => ({ ...r, image: getRestaurantImageUrl(r.image) }))
    ];
    return merged;
  }

  static async getFeaturedRestaurants(): Promise<Restaurant[]> {
    const restaurants = await this.getRestaurants();
    return restaurants.slice(0, 3);
  }

  static async getLiveRestaurants(): Promise<Restaurant[]> {
    const restaurants = await this.getRestaurants();
    return restaurants.filter(r => r.isLive);
  }

  static async getRestaurantById(id: string): Promise<Restaurant | null> {
    const restaurants = await this.getRestaurants();
    return restaurants.find(r => String(r.id) === String(id)) || null;
  }

  static async searchRestaurants(query: string): Promise<Restaurant[]> {
    const restaurants = await this.getRestaurants();
    return restaurants.filter(restaurant => 
      restaurant.name.toLowerCase().includes(query.toLowerCase()) ||
      restaurant.cuisine.toLowerCase().includes(query.toLowerCase()) ||
      restaurant.location.toLowerCase().includes(query.toLowerCase())
    );
  }

  static async uploadRestaurantImage(restaurantId: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`/api/v1/restaurants/${restaurantId}/upload-image`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error('Failed to upload restaurant image');
    return res.json();
  }

  static async createRestaurant(data: { name: string; address: string; image?: string }) {
    const res = await fetch('/api/v1/restaurants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create restaurant');
    return res.json();
  }
}