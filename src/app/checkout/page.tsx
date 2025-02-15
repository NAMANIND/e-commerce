"use client";

import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { RootState } from "@/store/store";
import { Navbar } from "@/components/products/navbar";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { toast } from "react-toastify";
import { clearCart } from "@/store/cartSlice";
import { useAuth } from "@/hooks/useAuth";

type CheckoutStep = "address" | "confirmation";

interface Address {
  id: string;
  name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
}

export default function CheckoutPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const { user, requireAuth } = useAuth();
  const [currentStep, setCurrentStep] = useState<CheckoutStep>("address");
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);

  const subtotal = cartItems.reduce(
    (total, item) =>
      total + (item.discounted_price || item.price) * item.quantity,
    0
  );
  const shipping = subtotal > 100 ? 0 : 10;
  const total = subtotal + shipping;

  useEffect(() => {
    requireAuth("/login?redirect=/checkout");
    if (user) {
      loadAddresses();
    }
  }, [user]);

  const loadAddresses = async () => {
    try {
      const { data, error } = await supabase
        .from("addresses")
        .select("*")
        .eq("user_id", user?.id)
        .order("is_default", { ascending: false });

      if (error) throw error;
      setAddresses(data || []);

      // Set default address if available
      const defaultAddress = data?.find((addr) => addr.is_default);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id);
      }
    } catch (error) {
      console.error("Error loading addresses:", error);
      toast.error("Failed to load addresses");
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      toast.error("Please select a delivery address");
      return;
    }

    setPlacingOrder(true);
    try {
      if (!user) throw new Error("Not authenticated");

      const selectedAddress = addresses.find(
        (addr) => addr.id === selectedAddressId
      );

      // Create order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert([
          {
            user_id: user.id,
            status: "pending",
            shipping_address_id: selectedAddressId,
            subtotal: subtotal,
            shipping_cost: shipping,
            total_amount: total,
            payment_status: "pending",
            payment_method: "cod",
            notes: "Order placed via website",
          },
        ])
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = cartItems.map((item) => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        price_at_time: item.discounted_price || item.price,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Clear cart
      dispatch(clearCart());

      toast.success("Order placed successfully!");
      router.push("/profile?tab=orders");
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error("Failed to place order");
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900">
              Your cart is empty
            </h2>
            <p className="mt-2 text-gray-600">
              Add some products to your cart to checkout
            </p>
            <Button onClick={() => router.push("/products")} className="mt-4">
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {currentStep === "address" && (
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h2 className="text-xl font-semibold mb-6">
                    Select Delivery Address
                  </h2>

                  {addresses.length === 0 ? (
                    <div className="text-center py-6">
                      <p className="text-gray-600 mb-4">No addresses found</p>
                      <Button
                        onClick={() => router.push("/profile?tab=addresses")}
                      >
                        Add New Address
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {addresses.map((address) => (
                        <div
                          key={address.id}
                          className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                            selectedAddressId === address.id
                              ? "border-blue-500 bg-blue-50"
                              : "hover:border-gray-400"
                          }`}
                          onClick={() => setSelectedAddressId(address.id)}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium text-gray-900">
                                {address.name}
                              </p>
                              <p className="text-gray-600">{address.phone}</p>
                            </div>
                            {address.is_default && (
                              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                                Default
                              </span>
                            )}
                          </div>
                          <div className="mt-2 text-gray-600">
                            <p>{address.address_line1}</p>
                            {address.address_line2 && (
                              <p>{address.address_line2}</p>
                            )}
                            <p>
                              {address.city}, {address.state}{" "}
                              {address.postal_code}
                            </p>
                            <p>{address.country}</p>
                          </div>
                        </div>
                      ))}

                      <div className="flex justify-between items-center mt-6">
                        <Button
                          variant="outline"
                          onClick={() => router.push("/profile?tab=addresses")}
                        >
                          Add New Address
                        </Button>
                        <Button
                          onClick={() => setCurrentStep("confirmation")}
                          disabled={!selectedAddressId}
                        >
                          Continue to Confirmation
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {currentStep === "confirmation" && (
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h2 className="text-xl font-semibold mb-6">
                    Order Confirmation
                  </h2>

                  <div className="space-y-6">
                    {/* Selected Address */}
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">
                        Delivery Address
                      </h3>
                      {addresses.find(
                        (addr) => addr.id === selectedAddressId
                      ) && (
                        <div className="text-gray-600">
                          <p>
                            {
                              addresses.find(
                                (addr) => addr.id === selectedAddressId
                              )?.name
                            }
                          </p>
                          <p>
                            {
                              addresses.find(
                                (addr) => addr.id === selectedAddressId
                              )?.address_line1
                            }
                          </p>
                          {addresses.find(
                            (addr) => addr.id === selectedAddressId
                          )?.address_line2 && (
                            <p>
                              {
                                addresses.find(
                                  (addr) => addr.id === selectedAddressId
                                )?.address_line2
                              }
                            </p>
                          )}
                          <p>
                            {
                              addresses.find(
                                (addr) => addr.id === selectedAddressId
                              )?.city
                            }
                            ,{" "}
                            {
                              addresses.find(
                                (addr) => addr.id === selectedAddressId
                              )?.state
                            }{" "}
                            {
                              addresses.find(
                                (addr) => addr.id === selectedAddressId
                              )?.postal_code
                            }
                          </p>
                          <p>
                            {
                              addresses.find(
                                (addr) => addr.id === selectedAddressId
                              )?.country
                            }
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Order Items */}
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">
                        Order Items
                      </h3>
                      <div className="space-y-4">
                        {cartItems.map((item) => (
                          <div key={item.id} className="flex justify-between">
                            <div>
                              <p className="font-medium text-gray-900">
                                {item.name}
                              </p>
                              <p className="text-gray-600">
                                Quantity: {item.quantity}
                              </p>
                            </div>
                            <p className="font-medium text-gray-900">
                              ₹
                              {(
                                (item.discounted_price || item.price) *
                                item.quantity
                              ).toFixed(2)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-4 mt-6">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setCurrentStep("address")}
                      >
                        Back
                      </Button>
                      <Button
                        className="w-full"
                        onClick={handlePlaceOrder}
                        disabled={placingOrder}
                      >
                        {placingOrder ? "Placing Order..." : "Place Order"}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-sm sticky top-24">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Order Summary
              </h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {item.name} × {item.quantity}
                      </span>
                      <span className="font-medium text-gray-900">
                        ₹
                        {(
                          (item.discounted_price || item.price) * item.quantity
                        ).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium text-gray-900">
                      ₹{subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium text-gray-900">
                      {shipping === 0 ? "Free" : `₹${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  {shipping === 0 && (
                    <p className="text-sm text-green-600">
                      ✓ Free shipping applied (Order above ₹100)
                    </p>
                  )}
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between text-base font-medium">
                    <span className="text-gray-900">Total</span>
                    <span className="text-gray-900">₹{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
