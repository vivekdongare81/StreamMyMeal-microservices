// Data Types
export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  deliveryTime: string;
  location: string;
  image: string;
  isLive: boolean;
  viewers?: number;
  priceRange: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  isVegetarian: boolean;
  isPopular?: boolean;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface LiveStream {
  id: string;
  restaurantId: string;
  title: string;
  viewers: number;
  isLive: boolean;
  streamUrl: string;
  chatMessages: ChatMessage[];
}

export interface ChatMessage {
  id: string;
  user: string;
  message: string;
  timestamp: Date;
}

// Mock Data - Replace with actual API calls
const mockRestaurants: Restaurant[] = [
  {
    id: "1",
    name: "Spice Garden",
    cuisine: "Indian",
    rating: 4.5,
    deliveryTime: "30-45 min",
    location: "Downtown",
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=300&fit=crop",
    isLive: true,
    viewers: 156,
    priceRange: "₹₹"
  },
  {
    id: "2",
    name: "Mama's Kitchen",
    cuisine: "Italian",
    rating: 4.7,
    deliveryTime: "25-40 min",
    location: "City Center",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop",
    isLive: false,
    priceRange: "₹₹₹"
  },
  {
    id: "3",
    name: "Sushi Master",
    cuisine: "Japanese",
    rating: 4.8,
    deliveryTime: "40-55 min",
    location: "Uptown",
    image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400&h=300&fit=crop",
    isLive: true,
    viewers: 89,
    priceRange: "₹₹₹₹"
  },
  {
    id: "4",
    name: "Burger Bliss",
    cuisine: "American",
    rating: 4.3,
    deliveryTime: "20-35 min",
    location: "Mall Road",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop",
    isLive: false,
    priceRange: "₹₹"
  },
  {
    id: "5",
    name: "Thai Delight",
    cuisine: "Thai",
    rating: 4.6,
    deliveryTime: "35-50 min",
    location: "Beach Road",
    image: "https://images.unsplash.com/photo-1559847844-5315695dadae?w=400&h=300&fit=crop",
    isLive: true,
    viewers: 203,
    priceRange: "₹₹₹"
  },
  {
    id: "6",
    name: "Pizza Palace",
    cuisine: "Italian",
    rating: 4.4,
    deliveryTime: "25-40 min",
    location: "College Street",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop",
    isLive: false,
    priceRange: "₹₹"
  }
];

const mockMenuItems: { [restaurantId: string]: MenuItem[] } = {
  "1": [
    {
      id: "1",
      name: "Butter Chicken",
      description: "Creamy tomato-based curry with tender chicken pieces",
      price: 350,
      image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=300&h=300&fit=crop",
      category: "Main Course",
      isVegetarian: false,
      isPopular: true
    },
    {
      id: "2",
      name: "Garlic Naan",
      description: "Fresh baked bread with garlic and herbs",
      price: 80,
      image: "https://images.unsplash.com/photo-1619888746842-7ebf6f0f2da8?w=300&h=300&fit=crop",
      category: "Bread",
      isVegetarian: true
    },
    {
      id: "3",
      name: "Biryani Special",
      description: "Aromatic basmati rice with spiced chicken",
      price: 420,
      image: "https://images.unsplash.com/photo-1563379091339-03246963d51a?w=300&h=300&fit=crop",
      category: "Rice",
      isVegetarian: false,
      isPopular: true
    }
  ],
  "2": [
    {
      id: "4",
      name: "Margherita Pizza",
      description: "Classic pizza with fresh mozzarella and basil",
      price: 450,
      image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=300&h=300&fit=crop",
      category: "Pizza",
      isVegetarian: true,
      isPopular: true
    },
    {
      id: "5",
      name: "Pasta Carbonara",
      description: "Creamy pasta with bacon and parmesan",
      price: 380,
      image: "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=300&h=300&fit=crop",
      category: "Pasta",
      isVegetarian: false
    }
  ]
};

const mockLiveStreams: { [restaurantId: string]: LiveStream } = {
  "1": {
    id: "live-1",
    restaurantId: "1",
    title: "Making Butter Chicken - Live from Spice Garden",
    viewers: 156,
    isLive: true,
    streamUrl: "https://example.com/stream1",
    chatMessages: [
      { id: "1", user: "FoodLover123", message: "Looks amazing! 😍", timestamp: new Date() },
      { id: "2", user: "Chef_Fan", message: "What spices are you using?", timestamp: new Date() },
      { id: "3", user: "Hungry_User", message: "Can't wait to order this!", timestamp: new Date() }
    ]
  },
  "3": {
    id: "live-3",
    restaurantId: "3",
    title: "Fresh Sushi Making - Sushi Master",
    viewers: 89,
    isLive: true,
    streamUrl: "https://example.com/stream3",
    chatMessages: [
      { id: "4", user: "SushiLover", message: "Perfect knife skills! 🔪", timestamp: new Date() },
      { id: "5", user: "Tokyo_Taste", message: "Authentic technique", timestamp: new Date() }
    ]
  },
  "5": {
    id: "live-5",
    restaurantId: "5",
    title: "Thai Curry Special - Thai Delight",
    viewers: 203,
    isLive: true,
    streamUrl: "https://example.com/stream5",
    chatMessages: [
      { id: "6", user: "SpicyFood", message: "Love the aroma! 🌶️", timestamp: new Date() },
      { id: "7", user: "Thai_Expert", message: "Traditional method!", timestamp: new Date() }
    ]
  }
};

// Data Service Functions
export class DataService {
  // Restaurant methods
  static async getRestaurants(): Promise<Restaurant[]> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 100));
    return mockRestaurants;
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

  // Menu methods
  static async getMenuByRestaurantId(restaurantId: string): Promise<MenuItem[]> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 100));
    return mockMenuItems[restaurantId] || [];
  }

  // Live stream methods
  static async getLiveStreamByRestaurantId(restaurantId: string): Promise<LiveStream | null> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 100));
    return mockLiveStreams[restaurantId] || null;
  }

  static async addChatMessage(restaurantId: string, message: ChatMessage): Promise<void> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 100));
    if (mockLiveStreams[restaurantId]) {
      mockLiveStreams[restaurantId].chatMessages.push(message);
    }
  }

  // Cart methods (using localStorage for now)
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
      }
    }
  }

  static removeFromCart(itemId: string): void {
    const cart = this.getCartItems();
    const updatedCart = cart.filter(i => i.id !== itemId);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  }

  static clearCart(): void {
    localStorage.removeItem('cart');
  }

  // Order methods
  static async placeOrder(orderData: any): Promise<{ success: boolean; orderId?: string; error?: string }> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate success/failure
    const success = Math.random() > 0.1; // 90% success rate
    
    if (success) {
      this.clearCart();
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