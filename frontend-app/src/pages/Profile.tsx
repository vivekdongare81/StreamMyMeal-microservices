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
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [expandedOrderDetails, setExpandedOrderDetails] = useState<any | null>(null);
  const [expandedOrderLoading, setExpandedOrderLoading] = useState(false);
  const [addressEditMode, setAddressEditMode] = useState(false);
  const [addressInput, setAddressInput] = useState(userData?.address || '');
  const [addressLoading, setAddressLoading] = useState(false);

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
        const ordersRes = await OrderService.getOrdersByUser(profile.userId.toString(), 0, 5);
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
          <div className="lg:col-span-1 flex flex-col gap-6">
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
                <Button className="w-full" variant="outline" onClick={handleChangePassword}>
                  Change Password
                </Button>
              </CardContent>
            </Card>
            {/* Address Card below profile card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">Your delivery address</p>
                {!addressEditMode ? (
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-base">{userData.address || <span className='text-muted-foreground'>No address set</span>}</span>
                    <Button variant="outline" size="sm" onClick={() => {
                      setAddressInput(userData.address || '');
                      setAddressEditMode(true);
                    }}>
                      Edit
                    </Button>
                  </div>
                ) : (
                  <form
                    className="flex flex-col gap-2"
                    onSubmit={async e => {
                      e.preventDefault();
                      setAddressLoading(true);
                      try {
                        const token = localStorage.getItem('token');
                        if (!token) throw new Error('Not authenticated');
                        const updated = await userService.updateProfileById(userData.userId, token, { address: addressInput });
                        setUserData(prev => prev ? { ...prev, address: updated.address } : prev);
                        setAddressEditMode(false);
                        toast.success('Address updated!');
                      } catch (err: any) {
                        toast.error(err.message || 'Failed to update address');
                      } finally {
                        setAddressLoading(false);
                      }
                    }}
                  >
                    <Input
                      value={addressInput}
                      onChange={e => setAddressInput(e.target.value)}
                      placeholder="Enter new address"
                      disabled={addressLoading}
                    />
                    <div className="flex gap-2 mt-2">
                      <Button type="submit" size="sm" disabled={addressLoading}>
                        {addressLoading ? 'Saving...' : 'Save'}
                      </Button>
                      <Button type="button" size="sm" variant="outline" onClick={() => setAddressEditMode(false)} disabled={addressLoading}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
          {/* Main content: Orders and other info */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-bold mb-4">Recent Orders</h2>
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orders.length === 0 ? (
                    <div className="text-muted-foreground">No orders found.</div>
                  ) : (
                    orders
                      .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
                      .map((order) => (
                        <div key={order.orderId} className="flex flex-col border rounded-lg">
                          <div
                            className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                            onClick={async () => {
                              if (expandedOrderId === order.orderId) {
                                setExpandedOrderId(null);
                                setExpandedOrderDetails(null);
                                return;
                              }
                              setExpandedOrderId(order.orderId);
                              setExpandedOrderLoading(true);
                              setExpandedOrderDetails(null);
                              try {
                                const details = await OrderService.getOrderById(order.orderId);
                                setExpandedOrderDetails(details);
                              } catch (err) {
                                setExpandedOrderDetails({ error: 'Failed to load order details' });
                              } finally {
                                setExpandedOrderLoading(false);
                              }
                            }}
                          >
                            <div>
                              <h3 className="font-medium">Order #{order.orderId}</h3>
                              <p className="text-sm text-muted-foreground">
                                {order.restaurantName || order.recipientName}
                              </p>
                              <p className="text-xs text-muted-foreground">{order.orderDate ? new Date(order.orderDate).toLocaleString() : ''}</p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <div className="font-medium">₹{order.totalAmount}</div>
                              <Badge variant="secondary" className="bg-green-100 text-green-800">
                                Status: {order.status}
                              </Badge>
                              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                Payment Status: {order.paymentStatus}
                              </Badge>
                              <Button
                                size="sm"
                                variant="outline"
                                className="mt-2 text-primary border-primary hover:bg-primary hover:text-white transition-colors"
                                onClick={e => {
                                  e.stopPropagation();
                                  setExpandedOrderId(order.orderId);
                                  setExpandedOrderLoading(true);
                                  setExpandedOrderDetails(null);
                                  OrderService.getOrderById(order.orderId)
                                    .then(details => setExpandedOrderDetails(details))
                                    .catch(() => setExpandedOrderDetails({ error: 'Failed to load order details' }))
                                    .finally(() => setExpandedOrderLoading(false));
                                }}
                              >
                                View Order
                              </Button>
                            </div>
                          </div>
                          {expandedOrderId === order.orderId && (
                            <div className="p-4 border-t bg-muted/10 animate-fade-in">
                              {expandedOrderLoading ? (
                                <div className="text-center text-muted-foreground">Loading details...</div>
                              ) : expandedOrderDetails && !expandedOrderDetails.error ? (
                                <div>
                                  <div className="mb-2">
                                    <span className="font-semibold">Order ID:</span> {expandedOrderDetails.orderId}
                                  </div>
                                  <div className="mb-2">
                                    <span className="font-semibold">Recipient:</span> {expandedOrderDetails.recipientName}
                                  </div>
                                  <div className="mb-2">
                                    <span className="font-semibold">Email:</span> {expandedOrderDetails.contactEmail}
                                  </div>
                                  <div className="mb-2">
                                    <span className="font-semibold">Phone:</span> {expandedOrderDetails.contactPhone}
                                  </div>
                                  <div className="mb-2">
                                    <span className="font-semibold">Shipping Address:</span> {expandedOrderDetails.shippingAddress}
                                  </div>
                                  <div className="mb-2">
                                    <span className="font-semibold">Order Date:</span> {expandedOrderDetails.orderDate ? new Date(expandedOrderDetails.orderDate).toLocaleString() : ''}
                                  </div>
                                  <div className="mb-2">
                                    <span className="font-semibold">Status:</span> {expandedOrderDetails.status}
                                  </div>
                                  <div className="mb-2">
                                    <span className="font-semibold">Payment Status:</span> {expandedOrderDetails.paymentStatus}
                                  </div>
                                  <div className="mb-2">
                                    <span className="font-semibold">Total Amount:</span> ₹{expandedOrderDetails.totalAmount}
                                  </div>
                                  <div className="mb-2">
                                    <span className="font-semibold">Items:</span>
                                    <ul className="list-disc ml-6">
                                      {expandedOrderDetails.items && expandedOrderDetails.items.map((item: any) => (
                                        <li key={item.orderItemId}>
                                          Menu Item ID: {item.menuItemId}, Quantity: {item.quantity}, Subtotal: ₹{item.subtotal}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                              ) : (
                                <div className="text-red-500 text-center">{expandedOrderDetails?.error || 'No details found.'}</div>
                              )}
                            </div>
                          )}
                        </div>
                      ))
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Removed Payment Methods card as requested */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;