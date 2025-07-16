import { useState, useEffect } from 'react';
import { CartItem } from '@/data/types';
import { CartService } from '@/services/cartService';

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);

  // Load cart items on initial render
  useEffect(() => {
    updateCart();
    
    // Listen for cart updates from other components
    const handleCartUpdate = () => updateCart();
    window.addEventListener('cartUpdated', handleCartUpdate);
    
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, []);

  // Update cart items and calculate total
  const updateCart = () => {
    const cartItems = CartService.getCartItems();
    setItems(cartItems);
    
    // Calculate total
    const newTotal = cartItems.reduce(
      (sum, item) => sum + (item.price * item.quantity), 
      0
    );
    setTotal(newTotal);
  };

  // Add item to cart
  const addToCart = (item: CartItem) => {
    CartService.addToCart(item);
  };

  // Remove item from cart
  const removeFromCart = (itemId: string) => {
    CartService.removeFromCart(itemId);
  };

  // Update item quantity
  const updateQuantity = (itemId: string, quantity: number) => {
    CartService.updateCartItemQuantity(itemId, quantity);
  };

  // Clear the cart
  const clearCart = () => {
    CartService.clearCart();
  };

  return {
    items,
    total,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
  };
}
