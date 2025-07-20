// User Profile and Order History Dummy Data
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    isDefault: boolean;
  }[];
  paymentMethod: 'CASH_ON_DELIVERY' | 'STRIPE';
  preferences: {
    cuisine: string[];
    dietaryRestrictions: string[];
  };
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  specialInstructions?: string;
}

export interface Order {
  id: string;
  userId: string;
  restaurantId: string;
  restaurantName: string;
  items: OrderItem[];
  totalAmount: number;
  deliveryAddress: string;
  status: 'PLACED' | 'CONFIRMED' | 'PREPARING' | 'ON_THE_WAY' | 'DELIVERED' | 'CANCELLED';
  orderTime: string;
  deliveryTime?: string;
  paymentMethod: string;
  deliveryInstructions?: string;
}

export const currentUser: UserProfile = {
  id: 'user-1',
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '+91 98765 43210',
  avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
  address: [
    {
      street: '123 Main Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      zipCode: '400001',
      isDefault: true
    },
    {
      street: '456 Park Road',
      city: 'Mumbai',
      state: 'Maharashtra',
      zipCode: '400020',
      isDefault: false
    }
  ],
  paymentMethod: 'CASH_ON_DELIVERY', // or 'STRIPE' for online payments
  preferences: {
    cuisine: ['Italian', 'Chinese', 'Indian'],
    dietaryRestrictions: ['No nuts', 'No seafood']
  }
};

export const userOrders: Order[] = [
  // {
  //   id: 'order-1',
  //   userId: 'user-1',
  //   restaurantId: '1',
  //   restaurantName: 'Pizza Palace',
  //   items: [
  //     { id: 'item-1', name: 'Margherita Pizza', quantity: 2, price: 199 },
  //     { id: 'item-2', name: 'Garlic Bread', quantity: 1, price: 99 }
  //   ],
  //   totalAmount: 497, // (199 * 2) + 99
  //   deliveryAddress: '123 Main Street, Mumbai, Maharashtra 400001',
  //   status: 'DELIVERED',
  //   orderTime: '2025-07-10T18:30:00.000Z',
  //   deliveryTime: '2025-07-10T19:15:00.000Z',
  //   paymentMethod: 'CASH_ON_DELIVERY'
  // },
  // {
  //   id: 'order-2',
  //   userId: 'user-1',
  //   restaurantId: '3',
  //   restaurantName: 'Burger King',
  //   items: [
  //     { id: 'item-3', name: 'Whopper', quantity: 1, price: 199 },
  //     { id: 'item-4', name: 'French Fries', quantity: 2, price: 99 },
  //     { id: 'item-5', name: 'Coke', quantity: 1, price: 49 }
  //   ],
  //   totalAmount: 446, // 199 + (99 * 2) + 49
  //   deliveryAddress: '123 Main Street, Mumbai, Maharashtra 400001',
  //   status: 'ON_THE_WAY',
  //   orderTime: '2025-07-12T19:00:00.000Z',
  //   paymentMethod: 'STRIPE',
  //   deliveryInstructions: 'Please call before delivery'
  // }
];
