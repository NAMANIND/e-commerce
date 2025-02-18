"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "react-toastify";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";

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

const ITEMS_PER_PAGE = 5;
const ORDER_STATUSES = [
  "all",
  "pending",
  "processing",
  "completed",
  "cancelled",
] as const;

export default function OrderHistory({ userId }: OrderHistoryProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [selectedStatus, setSelectedStatus] =
    useState<(typeof ORDER_STATUSES)[number]>("all");
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadOrders();
  }, [currentPage, selectedStatus]);

  const loadOrders = async () => {
    try {
      // First, get the total count for pagination
      let query = supabase
        .from("orders")
        .select("*", { count: "exact" })
        .eq("user_id", userId);

      if (selectedStatus !== "all") {
        query = query.eq("status", selectedStatus);
      }

      const { count, error: countError } = await query;

      if (countError) throw countError;
      setTotalOrders(count || 0);

      // Then get the actual data
      let dataQuery = supabase
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
        .order("created_at", { ascending: false })
        .range(
          (currentPage - 1) * ITEMS_PER_PAGE,
          currentPage * ITEMS_PER_PAGE - 1
        );

      if (selectedStatus !== "all") {
        dataQuery = dataQuery.eq("status", selectedStatus);
      }

      const { data, error } = await dataQuery;

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

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  const totalPages = Math.ceil(totalOrders / ITEMS_PER_PAGE);

  if (loading) return <div>Loading...</div>;

  if (orders.length === 0 && selectedStatus === "all") {
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
      {/* Filter Controls */}
      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center space-x-4">
          <label
            htmlFor="status-filter"
            className="text-sm font-medium text-gray-700"
          >
            Filter by Status:
          </label>
          <select
            id="status-filter"
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(
                e.target.value as (typeof ORDER_STATUSES)[number]
              );
              setCurrentPage(1); // Reset to first page when filter changes
            }}
            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            {ORDER_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-8">
          <h3 className="text-lg font-medium text-gray-900">No orders found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try changing your filter settings to see more orders.
          </p>
        </div>
      ) : (
        <>
          {/* Orders List */}
          {orders?.map((order) => (
            <div
              key={order.id}
              className="bg-white border rounded-lg overflow-hidden"
            >
              <div
                className="px-4 py-5 sm:px-6 bg-gray-50 border-b cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => toggleOrderExpansion(order.id)}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    {expandedOrders.has(order.id) ? (
                      <ChevronUpIcon className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                    )}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        Order #{order.id}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Placed on{" "}
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <p className="text-lg font-medium text-gray-900">
                      ₹{order.total_amount.toFixed(2)}
                    </p>
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
                      {order.status.charAt(0).toUpperCase() +
                        order.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>

              {expandedOrders.has(order.id) && (
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
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
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
                        {order.shipping_address.city},{" "}
                        {order.shipping_address.state}{" "}
                        {order.shipping_address.postal_code}
                      </p>
                      <p>{order.shipping_address.country}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Pagination Controls */}
          <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-lg">
            <div className="flex flex-1 justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center rounded-md px-4 py-2 text-sm font-medium ${
                  currentPage === 1
                    ? "bg-gray-100 text-gray-400"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`relative ml-3 inline-flex items-center rounded-md px-4 py-2 text-sm font-medium ${
                  currentPage === totalPages
                    ? "bg-gray-100 text-gray-400"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing{" "}
                  <span className="font-medium">
                    {(currentPage - 1) * ITEMS_PER_PAGE + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(currentPage * ITEMS_PER_PAGE, totalOrders)}
                  </span>{" "}
                  of <span className="font-medium">{totalOrders}</span> results
                </p>
              </div>
              <div>
                <nav
                  className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                  aria-label="Pagination"
                >
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-sm font-medium ${
                      currentPage === 1
                        ? "bg-gray-100 text-gray-400"
                        : "bg-white text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    <span className="sr-only">Previous</span>←
                  </button>
                  {[...Array(totalPages)].map((_, index) => (
                    <button
                      key={index + 1}
                      onClick={() => setCurrentPage(index + 1)}
                      className={`relative inline-flex items-center px-4 py-2 text-sm font-medium ${
                        currentPage === index + 1
                          ? "z-10 bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                          : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0"
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-sm font-medium ${
                      currentPage === totalPages
                        ? "bg-gray-100 text-gray-400"
                        : "bg-white text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    <span className="sr-only">Next</span>→
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
