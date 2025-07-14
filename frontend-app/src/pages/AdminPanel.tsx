import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";

const AdminPanel = () => {
  const [tab, setTab] = useState("restaurant");
  const [newRestaurant, setNewRestaurant] = useState({ name: "", cuisine: "", image: "" });
  const [newMenu, setNewMenu] = useState({ restaurantId: "", name: "", price: "", image: "" });

  const handleAddRestaurant = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would make an API call here
    alert(`Added restaurant: ${newRestaurant.name}`);
    setNewRestaurant({ name: "", cuisine: "", image: "" });
  };

  const handleAddMenu = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would make an API call here
    alert(`Added menu item: ${newMenu.name} for restaurant ${newMenu.restaurantId}`);
    setNewMenu({ restaurantId: "", name: "", price: "", image: "" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8 mt-16">
        <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>
        <div className="flex gap-4 mb-8">
          <Button variant={tab === "restaurant" ? "default" : "outline"} onClick={() => setTab("restaurant")}>Add Restaurant</Button>
          <Button variant={tab === "menu" ? "default" : "outline"} onClick={() => setTab("menu")}>Add Menu Item</Button>
        </div>
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