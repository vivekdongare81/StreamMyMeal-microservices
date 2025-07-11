import { MenuItem } from './types';

export const menuItemsData: { [restaurantId: string]: MenuItem[] } = {
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