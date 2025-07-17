import { menuItemsData } from '@/data';
import { MenuItem } from '@/data/types';

const API_BASE = '/api/v1';

export class MenuService {
  static async getMenuByRestaurantId(restaurantId: string): Promise<MenuItem[]> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return menuItemsData[restaurantId] || [];
  }

  static async createMenuItem(restaurantId: number, data: { name: string; description: string; price: number; stock: number; imageUrl?: string }) {
    const res = await fetch(`${API_BASE}/menu-items/${restaurantId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create menu item');
    return res.json();
  }

  static async uploadMenuItemImage(menuItemId: number, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/menu-items/${menuItemId}/upload-image`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error('Failed to upload menu item image');
    return res.json();
  }
}