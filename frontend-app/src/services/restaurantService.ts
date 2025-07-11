import { restaurantsData } from '@/data';
import { Restaurant } from '@/data/types';

export class RestaurantService {
  static async getRestaurants(): Promise<Restaurant[]> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return restaurantsData;
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
    return restaurants.find(r => r.id === id) || null;
  }

  static async searchRestaurants(query: string): Promise<Restaurant[]> {
    const restaurants = await this.getRestaurants();
    return restaurants.filter(restaurant => 
      restaurant.name.toLowerCase().includes(query.toLowerCase()) ||
      restaurant.cuisine.toLowerCase().includes(query.toLowerCase()) ||
      restaurant.location.toLowerCase().includes(query.toLowerCase())
    );
  }
}