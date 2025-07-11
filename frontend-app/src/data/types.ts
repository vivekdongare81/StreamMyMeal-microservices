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
  category?: string;
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