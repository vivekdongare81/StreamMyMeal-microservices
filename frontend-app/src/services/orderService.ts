import { CartService } from './cartService';

interface OrderData {
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  paymentMethod: string;
  items: any[];
  total: number;
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
}