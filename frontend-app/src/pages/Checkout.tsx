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
import { DataService, CartItem } from "@/services/dataService";

const Checkout = () => {
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [deliveryAddress, setDeliveryAddress] = useState({
    street: "",
    city: "",
    pincode: "",
    phone: ""
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const items = DataService.getCartItems();
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

    setIsProcessing(true);
    
    try {
      const orderData = {
        items: cartItems,
        deliveryAddress,
        paymentMethod,
        total,
        timestamp: new Date().toISOString()
      };

      const result = await DataService.placeOrder(orderData);
      
      if (result.success) {
        toast.success(`Order placed successfully! Order ID: ${result.orderId} 🎉`);
        navigate("/restaurants");
      } else {
        toast.error(result.error || "Failed to place order");
      }
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

                {paymentMethod === "card" && (
                  <div className="mt-4 space-y-4">
                    <div>
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input id="cardNumber" placeholder="1234 5678 9012 3456" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expiry">Expiry Date</Label>
                        <Input id="expiry" placeholder="MM/YY" />
                      </div>
                      <div>
                        <Label htmlFor="cvv">CVV</Label>
                        <Input id="cvv" placeholder="123" />
                      </div>
                    </div>
                  </div>
                )}
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
    </div>
  );
};

export default Checkout;