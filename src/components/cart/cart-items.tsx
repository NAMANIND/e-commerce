"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface CartItem {
  id: string;
  quantity: number;
  products: {
    id: string;
    name: string;
    price: number;
    image_url: string;
    stock: number;
    category: {
      name: string;
      id: string;
    };
  };
}

export function CartItems() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCartItems();
  }, []);

  async function fetchCartItems() {
    try {
      const res = await fetch("/api/cart");
      const data = await res.json();
      setItems(data.items || []);
    } catch (error) {
      console.error("Error fetching cart items:", error);
    } finally {
      setLoading(false);
    }
  }

  async function updateQuantity(itemId: string, quantity: number) {
    try {
      const res = await fetch(`/api/cart/${itemId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quantity }),
      });

      if (!res.ok) {
        throw new Error("Failed to update quantity");
      }

      // Refresh cart items
      fetchCartItems();
    } catch (error) {
      console.error("Error updating quantity:", error);
      // TODO: Show error toast
    }
  }

  async function removeItem(itemId: string) {
    try {
      const res = await fetch(`/api/cart/${itemId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to remove item");
      }

      // Refresh cart items
      fetchCartItems();
    } catch (error) {
      console.error("Error removing item:", error);
      // TODO: Show error toast
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="flex gap-6">
              <div className="w-24 h-24 bg-gray-200 rounded" />
              <div className="flex-1 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="h-4 bg-gray-200 rounded w-1/4" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <h2 className="text-lg font-medium text-gray-900 mb-2">
            Your cart is empty
          </h2>
          <p className="text-gray-500 mb-4">
            Add some products to your cart to continue shopping
          </p>
          <Link href="/products">
            <Button className="bg-blue-600 hover:bg-blue-700">
              Browse Products
            </Button>
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <Card key={item.id} className="p-6">
          <div className="flex gap-6">
            {/* Product Image */}
            <Link href={`/products/${item.products.id}`} className="shrink-0">
              <div className="relative w-24 h-24">
                <Image
                  src={item.products.image_url}
                  alt={item.products.name}
                  fill
                  className="object-cover rounded"
                />
              </div>
            </Link>

            {/* Product Info */}
            <div className="flex-1">
              <div className="flex justify-between">
                <div>
                  <Link
                    href={`/products/${item.products.id}`}
                    className="font-medium text-gray-900 hover:text-blue-600"
                  >
                    {item.products.name}
                  </Link>
                  <Link
                    href={`/products?category=${item.products.category.id}`}
                    className="block text-sm text-gray-500 hover:text-gray-700"
                  >
                    {item.products.category.name}
                  </Link>
                </div>
                <p className="font-medium text-gray-900">
                  ${(item.products.price * item.quantity).toFixed(2)}
                </p>
              </div>

              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center space-x-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="text-lg font-medium text-gray-900">
                    {item.quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    disabled={item.quantity >= item.products.stock}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeItem(item.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
