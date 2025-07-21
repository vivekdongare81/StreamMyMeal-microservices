import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import { RestaurantService } from "@/services";
import { toast } from "sonner";
import { MenuService } from "@/services/menuService";
import { Restaurant } from "@/data/types";
import { apiClient } from "@/lib/api";

const AdminPanel = () => {
  const [tab, setTab] = useState("restaurant");
  const [newRestaurant, setNewRestaurant] = useState({ name: "", address: "" });
  const [newMenu, setNewMenu] = useState({ restaurantId: "", name: "", price: "", image: "" });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [menuImageFile, setMenuImageFile] = useState<File | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const PAGE_SIZE = 8;

  const loadRestaurants = async (pageNum = 0) => {
    try {
      const data = await apiClient.get(`/restaurants?page=${pageNum}&size=${PAGE_SIZE}`);
      setRestaurants(data.content.map((r: any) => ({
        id: String(r.id ?? r.restaurantId),
        name: r.name,
        address: r.address,
        image: r.image,
        cuisine: r.cuisine ?? '',
        rating: r.rating ?? 0,
        deliveryTime: r.deliveryTime ?? '',
        location: r.location ?? '',
        isLive: r.isLive ?? false,
        viewers: r.viewers ?? 0,
        priceRange: r.priceRange ?? '',
      })));
      setTotalPages(data.totalPages);
      setPage(data.number);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load restaurants');
    }
  };

  useEffect(() => {
    loadRestaurants(page);
  }, [page]);

  const handleAddRestaurant = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 1. Create restaurant (without image)
      const created = await RestaurantService.createRestaurant({
        name: newRestaurant.name,
        address: newRestaurant.address,
      });
      // 2. If image file selected, upload image using the correct ID
      const restaurantId = created.restaurantId || created.id;
      if (imageFile && restaurantId) {
        await RestaurantService.uploadRestaurantImage(restaurantId, imageFile);
      }
      toast.success("Restaurant added successfully! Live session created automatically.");
      setNewRestaurant({ name: "", address: "" });
      setImageFile(null);
      // Prepend the new restaurant to the list
      setRestaurants(prev => [{
        id: String(restaurantId),
        name: created.name,
        address: created.address,
        image: created.image ?? '',
        cuisine: created.cuisine ?? '',
        rating: created.rating ?? 0,
        deliveryTime: created.deliveryTime ?? '',
        location: created.location ?? '',
        isLive: created.isLive ?? false,
        viewers: created.viewers ?? 0,
        priceRange: created.priceRange ?? '',
      }, ...prev]);
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

  const handleDeleteRestaurant = async (restaurantId: string) => {
    try {
      await RestaurantService.deleteRestaurant(restaurantId);
      setRestaurants(prev => prev.filter(r => r.id !== restaurantId));
      toast.success('Restaurant deleted successfully!');
    } catch (err: any) {
      if (
        err.message &&
        (err.message.includes("Default restaurants cannot be deleted") || err.message.includes("Access forbidden"))
      ) {
        toast.error("Default 10 restaurants cannot be deleted. You can only delete your own restaurants.");
      } else {
      toast.error(err.message || 'Failed to delete restaurant');
      }
    }
  };

  // Helper to determine if a restaurant is a default (top 10)
  const isDefaultRestaurant = (index: number) => index < 10;

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

        <div className="mb-8 mt-12"> {/* Added mt-12 for extra space above */}
          <h2 className="text-2xl font-semibold mb-2">Listed Restaurants</h2>
          <table className="min-w-full border text-left mb-4">
            <thead>
              <tr>
                <th className="border px-4 py-2">Restaurant Name</th>
                <th className="border px-4 py-2">Restaurant ID</th>
                <th className="border px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {restaurants.map((r, index) => (
                <tr key={r.id}>
                  <td className="border px-4 py-2">{r.name}</td>
                  <td className="border px-4 py-2">{r.id}</td>
                  <td className="border px-4 py-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteRestaurant(r.id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex gap-2">
            <Button disabled={page === 0} onClick={() => setPage(page - 1)}>Previous</Button>
            <span>Page {page + 1} of {totalPages}</span>
            <Button disabled={page === totalPages - 1} onClick={() => setPage(page + 1)}>Next</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel; 