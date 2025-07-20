import { restaurantsData } from '@/data';
import { Restaurant } from '@/data/types';
import { apiClient } from '@/lib/api';

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
      const data = await apiClient.get('/restaurants?page=0&size=10', { requiresAuth: false });
      console.log('[DEBUG] Raw /restaurants response:', data);
      // Support both array and paginated response
      backendRestaurants = Array.isArray(data) ? data : (data.content || []);
      // Debug: log raw backend data before mapping
      console.log('[DEBUG] Raw backend restaurant data:', backendRestaurants);
      // Normalize backend IDs to string and image to full URL
      backendRestaurants = backendRestaurants.map(r => ({
        id: String((r as any).id !== undefined ? (r as any).id : (r as any).restaurantId),
        name: (r as any).name,
        address: (r as any).address,
        image: getRestaurantImageUrl((r as any).image),
        cuisine: (r as any).cuisine ?? '',
        rating: (r as any).rating ?? 0,
        deliveryTime: (r as any).deliveryTime ?? '',
        location: (r as any).location ?? '',
        isLive: (r as any).isLive ?? false,
        viewers: (r as any).viewers ?? 0,
        priceRange: (r as any).priceRange ?? '',
      }));
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
    return apiClient.upload(`/restaurants/${restaurantId}/upload-image`, formData);
  }

  static async createRestaurant(data: { name: string; address: string; image?: string }) {
    return apiClient.post('/restaurants', data);
  }

  static async deleteRestaurant(restaurantId: string) {
    await apiClient.delete(`/restaurants/${restaurantId}`);
  }

  static async getPaginatedRestaurants(page = 0, size = 15): Promise<any> {
    return apiClient.get(`/restaurants?page=${page}&size=${size}`, { requiresAuth: false });
  }
}