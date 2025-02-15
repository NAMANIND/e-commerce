"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "react-toastify";

interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  created_at: string;
  total_amount: number;
  status: "pending" | "processing" | "completed" | "cancelled";
  items: OrderItem[];
  shipping_address: {
    name: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
}

interface OrderHistoryProps {
  userId: string;
}

export default function OrderHistory({ userId }: OrderHistoryProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(
          `
          *,
          items:order_items (
            id,
            order_id,
            product_id,
            quantity,
            price_at_time,
            created_at,
            updated_at,
            product:products (
              id,
              name
            )
          ),
          shipping_address:addresses!orders_shipping_address_id_fkey (
            id,
            name,
            address_line1,
            address_line2,
            city,
            state,
            postal_code,
            country
          )
        `
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Transform the data to match our interface
      const transformedOrders = data.map((order: any) => ({
        ...order,
        items: order.items.map((item: any) => ({
          id: item.id,
          order_id: item.order_id,
          product_id: item.product_id,
          product_name: item.product.name,
          quantity: item.quantity,
          price: item.price_at_time,
          created_at: item.created_at,
          updated_at: item.updated_at,
        })),
        shipping_address: order.shipping_address,
      }));

      setOrders(transformedOrders);
    } catch (error) {
      console.error("Error loading orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  if (orders.length === 0) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium text-gray-900">No orders yet</h3>
        <p className="mt-1 text-sm text-gray-500">
          When you place orders, they will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {orders?.map((order) => (
        <div
          key={order.id}
          className="bg-white border rounded-lg overflow-hidden"
        >
          <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  Order #{order.id}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Placed on {new Date(order.created_at).toLocaleDateString()}
                </p>
              </div>
              <div>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    order.status === "completed"
                      ? "bg-green-100 text-green-800"
                      : order.status === "processing"
                      ? "bg-blue-100 text-blue-800"
                      : order.status === "cancelled"
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>
            </div>
          </div>

          <div className="px-4 py-5 sm:p-6">
            <div className="space-y-4">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center"
                >
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">
                      {item.product_name}
                    </h4>
                    <p className="text-sm text-gray-500">
                      Quantity: {item.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 border-t pt-4">
              <div className="flex justify-between items-center">
                <p className="text-sm font-medium text-gray-900">
                  Total Amount
                </p>
                <p className="text-lg font-medium text-gray-900">
                  ${order.total_amount.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="mt-6 border-t pt-4">
              <h4 className="text-sm font-medium text-gray-900">
                Shipping Address
              </h4>
              <div className="mt-2 text-sm text-gray-500">
                <p>{order.shipping_address.name}</p>
                <p>{order.shipping_address.address_line1}</p>
                {order.shipping_address.address_line2 && (
                  <p>{order.shipping_address.address_line2}</p>
                )}
                <p>
                  {order.shipping_address.city}, {order.shipping_address.state}{" "}
                  {order.shipping_address.postal_code}
                </p>
                <p>{order.shipping_address.country}</p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
