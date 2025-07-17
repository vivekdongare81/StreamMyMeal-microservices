import { menuItemsData } from '@/data';
import { MenuItem } from '@/data/types';

const API_BASE = '/api/v1';
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
      const res = await fetch(`${API_BASE}/menu-items/restaurant/${idForApi}`);
      if (res.ok) {
        backendMenu = await res.json();
        // Normalize all menu item IDs to string and image to full URL
        if (Array.isArray(backendMenu) && backendMenu.length > 0) {
          return backendMenu.map(item => ({
            ...item,
            id: String(item.id ?? item.menuItemId),
            image: getMenuImageUrl(item.image || item.imageUrl)
          }));
        }
      }
    } catch (e) {
      // fail silently, fallback to dummy
    }
    // Fallback to dummy data, also normalize IDs and image URLs
    return (menuItemsData[restaurantId] || []).map(item => ({
      ...item,
      id: String(item.id ?? item.menuItemId),
      image: getMenuImageUrl(item.image || item.imageUrl)
    }));
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