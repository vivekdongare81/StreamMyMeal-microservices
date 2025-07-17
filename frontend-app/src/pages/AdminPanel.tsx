import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import { RestaurantService } from "@/services";
import { toast } from "sonner";
import { MenuService } from "@/services/menuService";

const AdminPanel = () => {
  const [tab, setTab] = useState("restaurant");
  const [newRestaurant, setNewRestaurant] = useState({ name: "", address: "" });
  const [newMenu, setNewMenu] = useState({ restaurantId: "", name: "", price: "", image: "" });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [menuImageFile, setMenuImageFile] = useState<File | null>(null);

  const handleAddRestaurant = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 1. Create restaurant (without image)
      const created = await RestaurantService.createRestaurant({
        name: newRestaurant.name,
        address: newRestaurant.address,
        image: imageFile ? imageFile.name : undefined,
      });
      // 2. If image file selected, upload image
      if (imageFile) {
        await RestaurantService.uploadRestaurantImage(created.id, imageFile);
      }
      toast.success("Restaurant added successfully!");
      setNewRestaurant({ name: "", address: "" });
      setImageFile(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to add restaurant");
    }
  };

  const handleAddMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await MenuService.createMenuItem(
        Number(newMenu.restaurantId),
        {
          name: newMenu.name,
          description: '', // You can add a description input if needed
          price: Number(newMenu.price),
          stock: 100, // Or add a stock input if needed
          imageUrl: menuImageFile ? menuImageFile.name : undefined,
        }
      );
      if (menuImageFile) {
        await MenuService.uploadMenuItemImage(created.menuItemId || created.id, menuImageFile);
      }
      toast.success("Menu item added successfully!");
      setNewMenu({ restaurantId: "", name: "", price: "", image: "" });
      setMenuImageFile(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to add menu item");
    }
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
            <Input placeholder="Address" value={newRestaurant.address} onChange={e => setNewRestaurant(r => ({ ...r, address: e.target.value }))} required />
            <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)} />
            <Button type="submit">Add Restaurant</Button>
          </form>
        )}
        {tab === "menu" && (
          <form onSubmit={handleAddMenu} className="max-w-md space-y-4">
            <h2 className="text-2xl font-semibold mb-4">Add Menu Item</h2>
            <Input placeholder="Restaurant ID" value={newMenu.restaurantId} onChange={e => setNewMenu(m => ({ ...m, restaurantId: e.target.value }))} required />
            <Input placeholder="Name" value={newMenu.name} onChange={e => setNewMenu(m => ({ ...m, name: e.target.value }))} required />
            <Input placeholder="Price" type="number" value={newMenu.price} onChange={e => setNewMenu(m => ({ ...m, price: e.target.value }))} required />
            <input type="file" accept="image/*" onChange={e => setMenuImageFile(e.target.files?.[0] || null)} />
            <Button type="submit">Add Menu Item</Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AdminPanel; 