import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AddressSelector } from "@/components/AddressSelector";
import { useCart } from "@/hooks/useCart";
import { currentUser } from "@/data";

export default function CheckoutPage() {
  const { items, total } = useCart();
  const [selectedAddress, setSelectedAddress] = useState(
    currentUser.address.find(addr => addr.isDefault) || null
  );
  const [orderPlaced, setOrderPlaced] = useState(false);

  const handlePlaceOrder = () => {
    if (!selectedAddress) {
      alert('Please select a delivery address');
      return;
    }
    // In a real app, you would submit the order to your backend here
    console.log('Order placed with:', {
      address: selectedAddress,
      paymentMethod: 'CASH_ON_DELIVERY',
      items,
      total
    });
    setOrderPlaced(true);
  };

  if (orderPlaced) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <h2 className="text-2xl font-bold text-green-800 mb-2">Order Placed Successfully!</h2>
          <p className="text-green-700 mb-4">Your food is being prepared. You'll receive updates on your order status.</p>
          <Button onClick={() => setOrderPlaced(false)}>Back to Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          {/* Delivery Address */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Delivery Address</h2>
            <AddressSelector 
              addresses={currentUser.address}
              selectedAddress={selectedAddress}
              onSelect={setSelectedAddress}
            />
          </div>

          {/* Payment Method - Simplified */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Payment</h2>
            <div className="p-4 border rounded-lg bg-gray-50">
              <div className="font-medium">Cash on Delivery</div>
              <p className="text-sm text-gray-600 mt-1">Pay when you receive your order</p>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow sticky top-4">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <span>{item.name} × {item.quantity}</span>
                  <span>₹{item.price * item.quantity}</span>
                </div>
              ))}
              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>₹{total}</span>
                </div>
              </div>
            </div>
            <Button 
              className="w-full mt-6" 
              size="lg"
              onClick={handlePlaceOrder}
            >
              Place Order
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
