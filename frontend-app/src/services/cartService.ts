import { CartItem } from '@/data/types';

export class CartService {
  static getCartItems(): CartItem[] {
    const cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : [];
  }

  static addToCart(item: CartItem): void {
    const cart = this.getCartItems();
    const existingItem = cart.find(i => i.id === item.id);
    
    if (existingItem) {
      existingItem.quantity += item.quantity;
    } else {
      cart.push(item);
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new CustomEvent('cartUpdated'));
  }

  static updateCartItemQuantity(itemId: string, quantity: number): void {
    const cart = this.getCartItems();
    const item = cart.find(i => i.id === itemId);
    
    if (item) {
      if (quantity <= 0) {
        this.removeFromCart(itemId);
      } else {
        item.quantity = quantity;
        localStorage.setItem('cart', JSON.stringify(cart));
        window.dispatchEvent(new CustomEvent('cartUpdated'));
      }
    }
  }

  static removeFromCart(itemId: string): void {
    const cart = this.getCartItems();
    const updatedCart = cart.filter(i => i.id !== itemId);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    window.dispatchEvent(new CustomEvent('cartUpdated'));
  }

  static clearCart(): void {
    localStorage.removeItem('cart');
    window.dispatchEvent(new CustomEvent('cartUpdated'));
  }
}