import { menuItemsData } from '@/data';
import { MenuItem } from '@/data/types';

export class MenuService {
  static async getMenuByRestaurantId(restaurantId: string): Promise<MenuItem[]> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return menuItemsData[restaurantId] || [];
  }
}