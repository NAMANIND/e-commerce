"use client";

import { useState, useEffect } from "react";
import { Search, Filter, ChevronDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

interface Order {
  id: string;
  created_at: string;
  status: string;
  total_amount: number;
  payment_status: string;
  customer: {
    name: string;
    email: string;
  };
}

const ORDER_STATUSES = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "",
    payment_status: "",
    search: "",
  });

  useEffect(() => {
    fetchOrders();
  }, [filters]);

  async function fetchOrders() {
    try {
      let query = supabase
        .from("orders")
        .select(
          `
          *,
          customer:user_id (
            name,
            email
          )
        `
        )
        .order("created_at", { ascending: false });

      if (filters.status) {
        query = query.eq("status", filters.status);
      }
      if (filters.payment_status) {
        query = query.eq("payment_status", filters.payment_status);
      }
      if (filters.search) {
        query = query.or(
          `id.ilike.%${filters.search}%,customer.name.ilike.%${filters.search}%,customer.email.ilike.%${filters.search}%`
        );
      }

      const { data, error } = await query;
      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  }

  async function updateOrderStatus(orderId: string, status: string) {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status })
        .eq("id", orderId);

      if (error) throw error;
      fetchOrders();
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Orders</h2>
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="p-6">
              <div className="space-y-3">
                <div className="h-4 w-1/4 bg-gray-200 rounded" />
                <div className="h-4 w-1/2 bg-gray-200 rounded" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Orders</h2>
        <div className="mt-4 sm:mt-0 sm:flex sm:items-center sm:space-x-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              placeholder="Search orders..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
            />
          </div>
          <div className="relative">
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
              className="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
            >
              <option value="">All Statuses</option>
              {Object.keys(ORDER_STATUSES).map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <Link key={order.id} href={`/admin/orders/${order.id}`}>
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-600">
                    Order #{order.id}
                  </p>
                  <p className="text-sm text-gray-500">
                    {order.customer.name} ({order.customer.email})
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      ORDER_STATUSES[
                        order.status as keyof typeof ORDER_STATUSES
                      ]
                    }`}
                  >
                    {order.status.charAt(0).toUpperCase() +
                      order.status.slice(1)}
                  </div>
                  <p className="text-lg font-bold">
                    ${order.total_amount.toFixed(2)}
                  </p>
                </div>
              </div>
            </Card>
          </Link>
        ))}

        {orders.length === 0 && (
          <Card className="p-12 text-center">
            <div className="space-y-3">
              <h3 className="text-lg font-medium">No orders found</h3>
              <p className="text-sm text-gray-500">
                Try adjusting your search or filter to find what you're looking
                for.
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
