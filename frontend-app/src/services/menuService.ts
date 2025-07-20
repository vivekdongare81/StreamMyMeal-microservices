import { menuItemsData } from '@/data';
import { MenuItem } from '@/data/types';
import { apiClient } from '@/lib/api';

const MENU_IMAGE_BASE = '/api/v1/menu-items/images/';

function getMenuImageUrl(image: string): string {
  if (!image) return '';
  // If already a full URL, return as is
  if (image.startsWith('http://') || image.startsWith('https://') || image.startsWith('/api/v1/menu-items/images/')) return image;
  // Otherwise, treat as filename
  return MENU_IMAGE_BASE + image;
}

export class MenuService {
  static async getMenuByRestaurantId(restaurantId: string): Promise<MenuItem[]> {
    // Always convert restaurantId to number for backend
    const idForApi = Number(restaurantId);
    let backendMenu: MenuItem[] = [];
    try {
      backendMenu = await apiClient.get(`/menu-items/restaurant/${idForApi}`, { requiresAuth: false });
      // Normalize all menu item IDs to string and image to full URL
      if (Array.isArray(backendMenu) && backendMenu.length > 0) {
        return backendMenu.map(item => ({
          ...item,
          id: String((item as any).id ?? (item as any).menuItemId),
          image: getMenuImageUrl((item as any).image || (item as any).imageUrl)
        }));
      }
    } catch (e) {
      // fail silently, fallback to dummy
    }
    // Fallback to dummy data, also normalize IDs and image URLs
    return (menuItemsData[restaurantId] || []).map(item => ({
      ...item,
      id: String((item as any).id ?? (item as any).menuItemId),
      image: getMenuImageUrl((item as any).image || (item as any).imageUrl)
    }));
  }

  static async createMenuItem(restaurantId: number, data: { name: string; description: string; price: number; stock: number; imageUrl?: string }) {
    return apiClient.post(`/menu-items/${restaurantId}`, data);
  }

  static async uploadMenuItemImage(menuItemId: number, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.upload(`/menu-items/${menuItemId}/upload-image`, formData);
  }
}