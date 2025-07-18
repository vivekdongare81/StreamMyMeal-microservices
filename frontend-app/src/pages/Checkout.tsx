import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, CreditCard, MapPin, Clock, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";
import { CartService, OrderService, CartItem } from "@/services";
import { useAuth } from "@/lib/authContext";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;

function loadScript(src: string) {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [deliveryAddress, setDeliveryAddress] = useState({
    street: "",
    city: "",
    pincode: "",
    phone: ""
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [paidOrder, setPaidOrder] = useState<any>(null);
  const [showTestCardModal, setShowTestCardModal] = useState(false);

  useEffect(() => {
    const items = CartService.getCartItems();
    setCartItems(items);
    
    // Redirect to menu if cart is empty
    if (items.length === 0) {
      toast.error("Your cart is empty");
      navigate("/restaurants");
    }
  }, [navigate]);

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = 50;
  const taxes = Math.round(subtotal * 0.18); // 18% GST
  const total = subtotal + deliveryFee + taxes;

  const handlePlaceOrder = async () => {
    // Validate form
    if (!deliveryAddress.street || !deliveryAddress.city || !deliveryAddress.pincode || !deliveryAddress.phone) {
      toast.error("Please fill in all delivery address fields");
      return;
    }
    if (!user) {
      toast.error("You must be logged in to place an order");
      return;
    }
    if (paymentMethod === "card") {
      setShowTestCardModal(true);
      return;
    }
    setIsProcessing(true);
    try {
      const token = localStorage.getItem('token');
      const orderData = {
        userId: user.userId,
        recipientName: user.username,
        contactEmail: user.email,
        shippingAddress: `${deliveryAddress.street}, ${deliveryAddress.city}, ${deliveryAddress.pincode}`,
        contactPhone: deliveryAddress.phone,
        items: cartItems.map(item => ({
          menuItemId: item.id,
          quantity: item.quantity
        }))
      };
      // 1. Always create order first (status PENDING)
      const res = await fetch("/api/v1/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });
      if (!res.ok) throw new Error("Order creation failed");
      const orderResponse = await res.json();

      if (paymentMethod === "cod") {
        // COD: finish order, send notification, clear cart
        await fetch("/api/v1/notifications/order", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(orderResponse)
        });
        CartService.clearCart();
        toast.success(`Order placed successfully! Order ID: ${orderResponse.orderId} 🎉`);
        navigate("/restaurants");
        return;
      }

      // 2. For online payment, call payment service with orderId and open Razorpay UI
      const paymentRes = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: total * 100, // Convert rupees to paise
          currency: "INR",
          receipt: `order_${orderResponse.orderId}`
        })
      });
      if (!paymentRes.ok) throw new Error("Failed to create payment order");
      const paymentOrder = await paymentRes.json();

      // Load Razorpay script
      const loaded = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
      if (!loaded) {
        toast.error("Failed to load Razorpay SDK");
        setIsProcessing(false);
        return;
      }

      // Open Razorpay checkout
      const options = {
        key: RAZORPAY_KEY_ID,
        amount: paymentOrder.amount,
        currency: paymentOrder.currency,
        name: "StreamMyMeal",
        description: `Order #${orderResponse.orderId}`,
        order_id: paymentOrder.orderId || paymentOrder.id,
        handler: async function (response: any) {
          // 1. Mark order as paid in backend
          let paymentStatus = 'PAID';
          try {
            const payRes = await fetch(`/api/v1/orders/${orderResponse.orderId}/pay`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
              },
              body: JSON.stringify({ paymentId: response.razorpay_payment_id, paymentStatus })
            });
            if (payRes.ok) {
              const order = await payRes.json();
              setPaidOrder(order);
              setShowOrderModal(true);
              setTimeout(() => {
                setShowOrderModal(false);
                navigate("/profile");
              }, 2000);
            }
          } catch (err) {
            // If payment fails, mark as FAILED
            paymentStatus = 'FAILED';
            try {
              const failRes = await fetch(`/api/v1/orders/${orderResponse.orderId}/pay`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ paymentStatus })
              });
              if (failRes.ok) {
                const order = await failRes.json();
                setPaidOrder(order);
                setShowOrderModal(true);
              }
            } catch (failErr) {
              console.error('Failed to update order as failed:', failErr);
            }
            toast.error("Payment failed. Please try again.");
            return;
          }
          CartService.clearCart();
          toast.success("Payment successful! Order placed.");
        },
        prefill: {
          name: user.username,
          email: user.email,
          contact: deliveryAddress.phone
        },
        notes: {
          address: orderData.shippingAddress
        },
        theme: { color: "#3399cc" }
      };
      // @ts-ignore
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      toast.error("An error occurred while placing your order");
      console.error('Order placement error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // This function will be called after user sees test card modal
  const handleContinueToPayment = async () => {
    setShowTestCardModal(false);
    setIsProcessing(true);
    try {
      const token = localStorage.getItem('token');
      const orderData = {
        userId: user.userId,
        recipientName: user.username,
        contactEmail: user.email,
        shippingAddress: `${deliveryAddress.street}, ${deliveryAddress.city}, ${deliveryAddress.pincode}`,
        contactPhone: deliveryAddress.phone,
        items: cartItems.map(item => ({
          menuItemId: item.id,
          quantity: item.quantity
        }))
      };
      // 1. Always create order first (status PENDING)
      const res = await fetch("/api/v1/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });
      if (!res.ok) throw new Error("Order creation failed");
      const orderResponse = await res.json();

      // 2. For online payment, call payment service with orderId and open Razorpay UI
      const paymentRes = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: total * 100, // Convert rupees to paise
          currency: "INR",
          receipt: `order_${orderResponse.orderId}`
        })
      });
      if (!paymentRes.ok) throw new Error("Failed to create payment order");
      const paymentOrder = await paymentRes.json();

      // Load Razorpay script
      const loaded = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
      if (!loaded) {
        toast.error("Failed to load Razorpay SDK");
        setIsProcessing(false);
        return;
      }

      // Open Razorpay checkout
      const options = {
        key: RAZORPAY_KEY_ID,
        amount: paymentOrder.amount,
        currency: paymentOrder.currency,
        name: "StreamMyMeal",
        description: `Order #${orderResponse.orderId}`,
        order_id: paymentOrder.orderId || paymentOrder.id,
        handler: async function (response: any) {
          // 1. Mark order as paid in backend
          let paymentStatus = 'PAID';
          try {
            const payRes = await fetch(`/api/v1/orders/${orderResponse.orderId}/pay`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
              },
              body: JSON.stringify({ paymentId: response.razorpay_payment_id, paymentStatus })
            });
            if (payRes.ok) {
              const order = await payRes.json();
              setPaidOrder(order);
              setShowOrderModal(true);
              setTimeout(() => {
                setShowOrderModal(false);
                navigate("/profile");
              }, 2000);
            }
          } catch (err) {
            // If payment fails, mark as FAILED
            paymentStatus = 'FAILED';
            try {
              const failRes = await fetch(`/api/v1/orders/${orderResponse.orderId}/pay`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ paymentStatus })
              });
              if (failRes.ok) {
                const order = await failRes.json();
                setPaidOrder(order);
                setShowOrderModal(true);
              }
            } catch (failErr) {
              console.error('Failed to update order as failed:', failErr);
            }
            toast.error("Payment failed. Please try again.");
            return;
          }
          CartService.clearCart();
          toast.success("Payment successful! Order placed.");
        },
        prefill: {
          name: user.username,
          email: user.email,
          contact: deliveryAddress.phone
        },
        notes: {
          address: orderData.shippingAddress
        },
        theme: { color: "#3399cc" }
      };
      // @ts-ignore
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      toast.error("An error occurred while placing your order");
      console.error('Order placement error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 mt-16">
        <div className="mb-6">
          <Button variant="ghost" asChild className="mb-4">
            <Link to="/restaurants">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Menu
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Details & Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Delivery Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="street">Street Address</Label>
                    <Input
                      id="street"
                      placeholder="123 Main Street"
                      value={deliveryAddress.street}
                      onChange={(e) => setDeliveryAddress(prev => ({ ...prev, street: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      placeholder="Mumbai"
                      value={deliveryAddress.city}
                      onChange={(e) => setDeliveryAddress(prev => ({ ...prev, city: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="pincode">Pincode</Label>
                    <Input
                      id="pincode"
                      placeholder="400001"
                      value={deliveryAddress.pincode}
                      onChange={(e) => setDeliveryAddress(prev => ({ ...prev, pincode: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      placeholder="+91 98765 43210"
                      value={deliveryAddress.phone}
                      onChange={(e) => setDeliveryAddress(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card" className="flex items-center gap-2 cursor-pointer">
                      <CreditCard className="w-4 h-4" />
                      Credit/Debit Card
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="upi" id="upi" />
                    <Label htmlFor="upi" className="cursor-pointer">UPI Payment</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="cod" id="cod" />
                    <Label htmlFor="cod" className="cursor-pointer">Cash on Delivery</Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Delivery Time */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Estimated Delivery
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">Standard Delivery</p>
                    <p className="text-sm text-muted-foreground">35-45 minutes</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">₹{deliveryFee}</p>
                    <p className="text-sm text-muted-foreground">Delivery fee</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Cart Items */}
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{item.name}</h4>
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <span className="font-medium">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Price Breakdown */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span>₹{deliveryFee}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taxes & Fees</span>
                    <span>₹{taxes}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-primary">₹{total}</span>
                  </div>
                </div>

                <Button 
                  className="w-full" 
                  onClick={handlePlaceOrder}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    "Processing..."
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Place Order
                    </>
                  )}
                </Button>

                <div className="text-xs text-muted-foreground text-center">
                  By placing this order, you agree to our Terms of Service
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Dialog open={showOrderModal} onOpenChange={setShowOrderModal}>
        <DialogContent>
          <DialogTitle>Order Placed Successfully!</DialogTitle>
          {paidOrder && (
            <div className="space-y-2">
              <div><b>Order ID:</b> {paidOrder.orderId}</div>
              <div><b>Amount:</b> ₹{paidOrder.totalAmount}</div>
              <div><b>Status:</b> {paidOrder.status}</div>
              <div><b>Payment Status:</b> {paidOrder.paymentStatus}</div>
              <div><b>Date:</b> {paidOrder.orderDate ? new Date(paidOrder.orderDate).toLocaleString() : ''}</div>
              <div><b>Recipient:</b> {paidOrder.recipientName}</div>
              <div><b>Shipping Address:</b> {paidOrder.shippingAddress}</div>
              <div><b>Items:</b>
                <ul className="list-disc ml-6">
                  {paidOrder.items && paidOrder.items.map((item: any) => (
                    <li key={item.orderItemId}>
                      Menu Item ID: {item.menuItemId}, Quantity: {item.quantity}, Subtotal: ₹{item.subtotal}
                    </li>
                  ))}
                </ul>
              </div>
              <Button className="w-full mt-4" onClick={() => { setShowOrderModal(false); navigate("/profile"); }}>
                Go to My Orders
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
      {/* Test Card Modal */}
      {showTestCardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-8 max-w-sm w-full shadow-lg">
            <h2 className="text-xl font-bold mb-4">Test Card Details</h2>
            <div className="mb-4">
              <b>Card Number:</b> 5267 3181 8797 5449<br />
              <b>CVV:</b> Any 3 digits<br />
              <b>Expiry:</b> Any future date<br />
              <b>Name:</b> Any name
            </div>
            <Button className="w-full" onClick={handleContinueToPayment}>
              Continue to Payment
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;