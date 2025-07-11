import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";

// Mock data for demonstration
const initialOrders = [
  { id: 1, user: "John Doe", restaurant: "Spice Garden", items: ["Butter Chicken", "Naan"], status: "Pending" },
  { id: 2, user: "Jane Smith", restaurant: "Mama's Kitchen", items: ["Margherita Pizza"], status: "Preparing" },
];

const AdminPanel = () => {
  const [tab, setTab] = useState("orders");
  const [orders, setOrders] = useState(initialOrders);
  const [newRestaurant, setNewRestaurant] = useState({ name: "", cuisine: "", image: "" });
  const [newMenu, setNewMenu] = useState({ restaurantId: "", name: "", price: "", image: "" });

  // Order status update
  const updateOrderStatus = (id: number, status: string) => {
    setOrders(orders.map(order => order.id === id ? { ...order, status } : order));
  };

  // Add restaurant
  const handleAddRestaurant = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would add to your data source
    alert(`Added restaurant: ${newRestaurant.name}`);
    setNewRestaurant({ name: "", cuisine: "", image: "" });
  };

  // Add menu item
  const handleAddMenu = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would add to your data source
    alert(`Added menu item: ${newMenu.name}`);
    setNewMenu({ restaurantId: "", name: "", price: "", image: "" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 mt-16">
        <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>
        <div className="flex gap-4 mb-8">
          <Button variant={tab === "orders" ? "default" : "outline"} onClick={() => setTab("orders")}>Orders</Button>
          <Button variant={tab === "restaurant" ? "default" : "outline"} onClick={() => setTab("restaurant")}>Add Restaurant</Button>
          <Button variant={tab === "menu" ? "default" : "outline"} onClick={() => setTab("menu")}>Add Menu Item</Button>
        </div>
        {tab === "orders" && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">All Orders</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {orders.map(order => (
                <Card key={order.id}>
                  <CardContent className="p-4">
                    <div className="mb-2 font-semibold">User: {order.user}</div>
                    <div className="mb-2">Restaurant: {order.restaurant}</div>
                    <div className="mb-2">Items: {order.items.join(", ")}</div>
                    <div className="mb-2">Status: <span className="font-bold">{order.status}</span></div>
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" onClick={() => updateOrderStatus(order.id, "Preparing")}>Preparing</Button>
                      <Button size="sm" onClick={() => updateOrderStatus(order.id, "Completed")}>Completed</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
        {tab === "restaurant" && (
          <form onSubmit={handleAddRestaurant} className="max-w-md space-y-4">
            <h2 className="text-2xl font-semibold mb-4">Add Restaurant</h2>
            <Input placeholder="Name" value={newRestaurant.name} onChange={e => setNewRestaurant(r => ({ ...r, name: e.target.value }))} required />
            <Input placeholder="Cuisine" value={newRestaurant.cuisine} onChange={e => setNewRestaurant(r => ({ ...r, cuisine: e.target.value }))} required />
            <Input placeholder="Image URL" value={newRestaurant.image} onChange={e => setNewRestaurant(r => ({ ...r, image: e.target.value }))} required />
            <Button type="submit">Add Restaurant</Button>
          </form>
        )}
        {tab === "menu" && (
          <form onSubmit={handleAddMenu} className="max-w-md space-y-4">
            <h2 className="text-2xl font-semibold mb-4">Add Menu Item</h2>
            <Input placeholder="Restaurant ID" value={newMenu.restaurantId} onChange={e => setNewMenu(m => ({ ...m, restaurantId: e.target.value }))} required />
            <Input placeholder="Name" value={newMenu.name} onChange={e => setNewMenu(m => ({ ...m, name: e.target.value }))} required />
            <Input placeholder="Price" type="number" value={newMenu.price} onChange={e => setNewMenu(m => ({ ...m, price: e.target.value }))} required />
            <Input placeholder="Image URL" value={newMenu.image} onChange={e => setNewMenu(m => ({ ...m, image: e.target.value }))} required />
            <Button type="submit">Add Menu Item</Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AdminPanel; 