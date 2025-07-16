import { Link } from "react-router-dom";
import { User, MapPin, CreditCard, Clock, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";
import { userService, ProfileResponse } from "@/services";

const Profile = () => {
  const [userData, setUserData] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Not authenticated');
        const profile = await userService.getProfile(token);
        setUserData(profile);
      } catch (err: any) {
        setError(err.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!userData) return null;

  const recentOrders = [
    { id: "1", restaurant: "Spice Garden", items: "Butter Chicken, Naan", total: 530, date: "2 days ago", status: "Delivered" },
    { id: "2", restaurant: "Pizza Palace", items: "Margherita Pizza", total: 399, date: "1 week ago", status: "Delivered" },
    { id: "3", restaurant: "Sushi Master", items: "Salmon Roll, Miso Soup", total: 890, date: "2 weeks ago", status: "Delivered" }
  ];

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
                    {userData.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-bold mb-2">{userData.name}</h2>
                <p className="text-muted-foreground mb-4">{userData.email}</p>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{userData.totalOrders}</div>
                    <div className="text-sm text-muted-foreground">Total Orders</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{userData.favoriteRestaurants}</div>
                    <div className="text-sm text-muted-foreground">Favorites</div>
                  </div>
                </div>
                <Button className="w-full">Edit Profile</Button>
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
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{order.restaurant}</h3>
                        <p className="text-sm text-muted-foreground">{order.items}</p>
                        <p className="text-xs text-muted-foreground">{order.date}</p>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">₹{order.total}</div>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
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
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Payment Methods
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">Manage your payment options</p>
                  <Button variant="outline" className="w-full">Manage Payments</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;