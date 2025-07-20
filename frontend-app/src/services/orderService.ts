import { CartService } from './cartService';
import { apiClient } from '@/lib/api';

export interface OrderData {
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  total: number;
  deliveryAddress: string;
  paymentMethod: string;
}

export class OrderService {
  static async placeOrder(orderData: OrderData): Promise<{ success: boolean; orderId?: string; error?: string }> {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const success = Math.random() > 0.1; // 90% success rate
    
    if (success) {
      CartService.clearCart();
      return {
        success: true,
        orderId: 'ORD' + Date.now()
      };
    } else {
      return {
        success: false,
        error: 'Payment failed. Please try again.'
      };
    }
  }

  static async getOrdersByUser(userId: string, page = 0, size = 10) {
    return apiClient.get(`/orders/user/${userId}?page=${page}&size=${size}`);
  }

  static async getOrderById(orderId: string | number) {
    return apiClient.get(`/orders/${orderId}`);
  }
}