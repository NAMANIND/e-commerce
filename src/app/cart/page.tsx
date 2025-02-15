"use client";

import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/store";
import { Navbar } from "@/components/products/navbar";
import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { removeFromCart, updateQuantity } from "@/store/cartSlice";
import { toast } from "react-toastify";

const DEFAULT_PRODUCT_IMAGE =
  "https://images.unsplash.com/photo-1472851294608-062f824d29cc?q=80&w=200&auto=format&fit=crop";

export default function CartPage() {
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const dispatch = useDispatch();

  const subtotal = cartItems.reduce(
    (total, item) =>
      total +
      (item.discounted_price > 0 ? item.discounted_price : item.price) *
        item.quantity,
    0
  );
  const shipping = subtotal > 100 ? 0 : 10;
  const total = subtotal + shipping;

  const handleUpdateQuantity = (
    id: string,
    newQuantity: number,
    stock: number
  ) => {
    if (newQuantity >= 1 && newQuantity <= stock) {
      dispatch(updateQuantity({ id, quantity: newQuantity }));
    }
  };

  const handleRemoveItem = (id: string, name: string) => {
    dispatch(removeFromCart(id));
    toast.success(`${name} removed from cart`);
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
            <div className="mb-6">
              <div className="w-48 h-48 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-24 h-24 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Your cart is empty
            </h2>
            <p className="text-gray-600 mb-8">
              Looks like you haven't added anything to your cart yet.
            </p>
            <Link href="/products">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg">
                Start Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 relative rounded-lg overflow-hidden bg-gray-100">
                      <Image
                        src={item.image_url || DEFAULT_PRODUCT_IMAGE}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {item.name}
                      </h3>
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center gap-3">
                          <p className="text-xl font-medium text-gray-900">
                            ₹
                            {(item.discounted_price > 0
                              ? item.discounted_price
                              : item.price
                            ).toFixed(2)}
                          </p>
                          {item.discounted_price > 0 && (
                            <>
                              <p className="text-sm text-gray-500 line-through">
                                ₹{item.price.toFixed(2)}
                              </p>
                              <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
                                {Math.round(
                                  ((item.price - item.discounted_price) /
                                    item.price) *
                                    100
                                )}
                                % OFF
                              </span>
                            </>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          Price per item •{" "}
                          {item.quantity > 1 &&
                            `${item.quantity} items selected`}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 mt-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() =>
                              handleUpdateQuantity(
                                item.id,
                                item.quantity - 1,
                                item.stock
                              )
                            }
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() =>
                              handleUpdateQuantity(
                                item.id,
                                item.quantity + 1,
                                item.stock
                              )
                            }
                            disabled={item.quantity >= item.stock}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        {item.stock < 10 && (
                          <p className="text-xs text-amber-600 font-medium flex items-center">
                            <span className="inline-block w-1.5 h-1.5 bg-amber-500 rounded-full mr-1"></span>
                            Only {item.stock} left
                          </p>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => handleRemoveItem(item.id, item.name)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">
                        ₹
                        {(
                          (item.discounted_price > 0
                            ? item.discounted_price
                            : item.price) * item.quantity
                        ).toFixed(2)}
                      </p>
                      {item.quantity > 1 && (
                        <div className="mt-1">
                          <p className="text-sm text-gray-500">
                            ₹
                            {(item.discounted_price > 0
                              ? item.discounted_price
                              : item.price
                            ).toFixed(2)}{" "}
                            × {item.quantity}
                          </p>
                          {item.discounted_price > 0 && (
                            <p className="text-xs text-green-600">
                              You save: ₹
                              {(
                                (item.price - item.discounted_price) *
                                item.quantity
                              ).toFixed(2)}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl p-6 shadow-sm sticky top-24">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Order Summary
                </h2>
                <div className="space-y-4">
                  {/* Detailed Product Breakdown */}
                  <div className="space-y-3 mb-6">
                    <h3 className="font-medium text-gray-700">Order Details</h3>
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex flex-col space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-800 font-medium">
                            {item.name}
                          </span>
                          <span className="text-gray-900 font-medium">
                            ₹
                            {(
                              (item.discounted_price > 0
                                ? item.discounted_price
                                : item.price) * item.quantity
                            ).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>
                            {item.quantity} × ₹
                            {(item.discounted_price > 0
                              ? item.discounted_price
                              : item.price
                            ).toFixed(2)}
                          </span>
                          {item.discounted_price > 0 && (
                            <span className="text-green-600">
                              Save ₹
                              {(
                                (item.price - item.discounted_price) *
                                item.quantity
                              ).toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="h-px bg-gray-200"></div>

                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span>
                      {shipping === 0 ? "Free" : `₹${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  {shipping === 0 && (
                    <p className="text-sm text-green-600">
                      ✓ Free shipping applied (Order above ₹100)
                    </p>
                  )}
                  <div className="h-px bg-gray-200"></div>
                  <div className="flex justify-between text-lg font-semibold text-gray-900">
                    <span>Total</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-lg text-lg mt-6"
                    onClick={() => {
                      // TODO: Implement checkout
                      toast.info("Checkout functionality coming soon!");
                    }}
                  >
                    Proceed to Checkout
                  </Button>
                  <p className="text-sm text-gray-500 text-center mt-4">
                    Free shipping on orders over ₹100
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
