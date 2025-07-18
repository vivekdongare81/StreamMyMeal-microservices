import { Link } from "react-router-dom";
import { User, MapPin, CreditCard, Clock, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";
import { userService, ProfileResponse, OrderService } from "@/services";
import { devLog, devError } from "@/lib/logger";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const Profile = () => {
  const [userData, setUserData] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      devLog('[Profile] Fetching user profile...');
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Not authenticated');
        const profile = await userService.getProfile(token);
        setUserData(profile);
        devLog('[Profile] Profile loaded:', profile);
        // Fetch orders for this user
        const ordersRes = await OrderService.getOrdersByUser(profile.userId.toString());
        setOrders(ordersRes.content || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load profile');
        devError('[Profile] Failed to fetch profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!userData) return null;

  const handleChangePassword = async () => {
    if (!userData?.email) {
      toast.error("No email found for this user.");
      return;
    }
    try {
      const res = await fetch("http://localhost:9000/api/v1/auth/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userData.email })
      });
      if (!res.ok) throw new Error("Failed to send password reset email");
      toast.success("Password reset email sent! Check your inbox.");
    } catch (err) {
      toast.error("Failed to send password reset email");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 mt-16">
        <h1 className="text-3xl font-bold mb-8">My Profile</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6 text-center">
                <Avatar className="w-24 h-24 mx-auto mb-4">
                  <AvatarImage src="" />
                  <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                    {userData.username ? userData.username[0] : ''}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-bold mb-2">{userData.username}</h2>
                <p className="text-muted-foreground mb-4">{userData.email}</p>
                {/* Optionally, you can display userId for debugging */}
                {/* <div className="text-sm text-muted-foreground mb-2">User ID: {userData.userId}</div> */}
                {/* Remove or comment out totalOrders and favoriteRestaurants as they are not present in ProfileResponse */}
                {/* <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{userData.totalOrders}</div>
                    <div className="text-sm text-muted-foreground">Total Orders</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{userData.favoriteRestaurants}</div>
                    <div className="text-sm text-muted-foreground">Favorites</div>
                  </div>
                </div> */}
                <Button className="w-full mb-2">Edit Profile</Button>
                <Button className="w-full" variant="outline" onClick={handleChangePassword}>
                  Change Password
                </Button>
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orders.length === 0 ? (
                    <div className="text-muted-foreground">No orders found.</div>
                  ) : (
                    orders.map((order) => (
                      <div key={order.orderId} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                          <h3 className="font-medium">{order.restaurantName || order.recipientName}</h3>
                          <p className="text-sm text-muted-foreground">
                            {order.items && order.items.map((i: any) => i.name || i.menuItemId).join(', ')}
                          </p>
                          <p className="text-xs text-muted-foreground">{order.orderDate ? new Date(order.orderDate).toLocaleString() : ''}</p>
                      </div>
                      <div className="text-right">
                          <div className="font-medium">₹{order.totalAmount}</div>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                    ))
                  )}
                </div>
                <Button variant="outline" className="w-full mt-4">View All Orders</Button>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Addresses
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">Manage your delivery addresses</p>
                  <Button variant="outline" className="w-full">Manage Addresses</Button>
                </CardContent>
              </Card>
              {/* Removed Payment Methods card as requested */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;