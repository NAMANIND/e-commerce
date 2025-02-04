"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface CartSummary {
  subtotal: number;
  itemCount: number;
}

export function CartSummary() {
  const [summary, setSummary] = useState<CartSummary>({
    subtotal: 0,
    itemCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCartSummary() {
      try {
        const res = await fetch("/api/cart");
        const data = await res.json();
        setSummary(data.summary || { subtotal: 0, itemCount: 0 });
      } catch (error) {
        console.error("Error fetching cart summary:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCartSummary();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse" />
          <div className="h-10 bg-gray-200 rounded animate-pulse mt-6" />
        </CardContent>
      </Card>
    );
  }

  const shipping = summary.subtotal > 0 ? 10 : 0;
  const total = summary.subtotal + shipping;

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Order Summary
        </h2>

        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Items ({summary.itemCount})</span>
            <span className="font-medium text-gray-900">
              ${summary.subtotal.toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Shipping</span>
            <span className="font-medium text-gray-900">
              {shipping > 0 ? `$${shipping.toFixed(2)}` : "Free"}
            </span>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-between">
              <span className="text-base font-medium text-gray-900">Total</span>
              <span className="text-base font-medium text-gray-900">
                ${total.toFixed(2)}
              </span>
            </div>
          </div>

          <Button
            asChild
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={summary.itemCount === 0}
          >
            <Link href="/checkout">Proceed to Checkout</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
