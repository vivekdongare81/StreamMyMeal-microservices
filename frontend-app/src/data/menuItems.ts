import { MenuItem } from './types';

export const menuItemsData: { [restaurantId: string]: MenuItem[] } = {
  "1": [
    {
      id: "1",
      name: "Butter Chicken",
      description: "Creamy tomato-based curry with tender chicken pieces",
      price: 350,
      image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=300&h=300&fit=crop",
      isVegetarian: false,
      isPopular: true
    },
    {
      id: "2",
      name: "Garlic Naan",
      description: "Fresh baked bread with garlic and herbs",
      price: 80,
      image: "https://images.unsplash.com/photo-1619888746842-7ebf6f0f2da8?w=300&h=300&fit=crop",
      isVegetarian: true
    },
    {
      id: "3",
      name: "Biryani Special",
      description: "Aromatic basmati rice with spiced chicken",
      price: 420,
      image: "https://images.unsplash.com/photo-1563379091339-03246963d51a?w=300&h=300&fit=crop",
      isVegetarian: false,
      isPopular: true
    }
  ],
  // "2": [
  //   {
  //     id: "4",
  //     name: "Margherita Pizza",
  //     description: "Classic pizza with fresh mozzarella and basil",
  //     price: 450,
  //     image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=300&h=300&fit=crop",
  //     isVegetarian: true,
  //     isPopular: true
  //   },
  //   {
  //     id: "5",
  //     name: "Pasta Carbonara",
  //     description: "Creamy pasta with bacon and parmesan",
  //     price: 380,
  //     image: "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=300&h=300&fit=crop",
  //     isVegetarian: false
  //   }
  // ],
  // "3": [
  //   {
  //     id: "6",
  //     name: "Salmon Sushi",
  //     description: "Fresh salmon over seasoned rice",
  //     price: 320,
  //     image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=300&h=300&fit=crop",
  //     isVegetarian: false,
  //     isPopular: true
  //   },
  //   {
  //     id: "7",
  //     name: "Tempura Udon",
  //     description: "Udon noodles in broth with tempura",
  //     price: 280,
  //     image: "https://images.unsplash.com/photo-1464306076886-debca5e8a6b0?w=300&h=300&fit=crop",
  //     isVegetarian: false
  //   }
  // ],
  // "4": [
  //   {
  //     id: "8",
  //     name: "Classic Cheeseburger",
  //     description: "Juicy beef patty with cheese, lettuce, and tomato",
  //     price: 250,
  //     image: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=300&h=300&fit=crop",
  //     isVegetarian: false,
  //     isPopular: true
  //   },
  //   {
  //     id: "9",
  //     name: "Fries",
  //     description: "Crispy golden potato fries",
  //     price: 90,
  //     image: "https://images.unsplash.com/photo-1506089676908-3592f7389d4d?w=300&h=300&fit=crop",
  //     isVegetarian: true
  //   }
  // ],
  // "5": [
  //   {
  //     id: "10",
  //     name: "Pad Thai",
  //     description: "Stir-fried rice noodles with shrimp, tofu, and peanuts",
  //     price: 300,
  //     image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=300&h=300&fit=crop",
  //     isVegetarian: false,
  //     isPopular: true
  //   },
  //   {
  //     id: "11",
  //     name: "Green Curry",
  //     description: "Spicy green curry with chicken and vegetables",
  //     price: 320,
  //     image: "https://images.unsplash.com/photo-1519864600265-abb23847ef2c?w=300&h=300&fit=crop",
  //     isVegetarian: false
  //   }
  // ],
  // "6": [
  //   {
  //     id: "12",
  //     name: "Pepperoni Pizza",
  //     description: "Pizza topped with pepperoni and cheese",
  //     price: 480,
  //     image: "https://images.unsplash.com/photo-1548365328-8b6b7c7c7c7c?w=300&h=300&fit=crop",
  //     isVegetarian: false,
  //     isPopular: true
  //   },
  //   {
  //     id: "13",
  //     name: "Veggie Delight Pizza",
  //     description: "Pizza with assorted fresh vegetables",
  //     price: 420,
  //     image: "https://images.unsplash.com/photo-1519864600265-abb23847ef2c?w=300&h=300&fit=crop",
  //     isVegetarian: true
  //   }
  // ],
  // "7": [
  //   {
  //     id: "14",
  //     name: "Kung Pao Chicken",
  //     description: "Spicy stir-fried chicken with peanuts and vegetables",
  //     price: 340,
  //     image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=300&h=300&fit=crop",
  //     isVegetarian: false,
  //     isPopular: true
  //   },
  //   {
  //     id: "15",
  //     name: "Vegetable Spring Rolls",
  //     description: "Crispy rolls stuffed with vegetables",
  //     price: 120,
  //     image: "https://images.unsplash.com/photo-1519864600265-abb23847ef2c?w=300&h=300&fit=crop",
  //     isVegetarian: true
  //   }
  // ],
  // "8": [
  //   {
  //     id: "16",
  //     name: "Sweet and Sour Pork",
  //     description: "Pork in sweet and tangy sauce with peppers",
  //     price: 360,
  //     image: "https://images.unsplash.com/photo-1464306076886-debca5e8a6b0?w=300&h=300&fit=crop",
  //     isVegetarian: false
  //   },
  //   {
  //     id: "17",
  //     name: "Egg Fried Rice",
  //     description: "Fried rice with eggs and vegetables",
  //     price: 200,
  //     image: "https://images.unsplash.com/photo-1506089676908-3592f7389d4d?w=300&h=300&fit=crop",
  //     isVegetarian: true
  //   }
  // ],
  // "9": [
  //   {
  //     id: "18",
  //     name: "Paneer Tikka",
  //     description: "Grilled paneer cubes marinated in spices",
  //     price: 220,
  //     image: "https://images.unsplash.com/photo-1519864600265-abb23847ef2c?w=300&h=300&fit=crop",
  //     isVegetarian: true,
  //     isPopular: true
  //   },
  //   {
  //     id: "19",
  //     name: "Dal Makhani",
  //     description: "Slow-cooked black lentils in creamy sauce",
  //     price: 180,
  //     image: "https://images.unsplash.com/photo-1464306076886-debca5e8a6b0?w=300&h=300&fit=crop",
  //     isVegetarian: true
  //   }
  // ],
  // "10": [
  //   {
  //     id: "20",
  //     name: "Masala Dosa",
  //     description: "Crispy rice crepe filled with spiced potatoes",
  //     price: 160,
  //     image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=300&h=300&fit=crop",
  //     isVegetarian: true,
  //     isPopular: true
  //   },
  //   {
  //     id: "21",
  //     name: "Sambar Vada",
  //     description: "Lentil donuts soaked in spicy sambar",
  //     price: 120,
  //     image: "https://images.unsplash.com/photo-1519864600265-abb23847ef2c?w=300&h=300&fit=crop",
  //     isVegetarian: true
  //   }
  // ]
};