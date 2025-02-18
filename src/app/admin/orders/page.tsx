"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import { toast } from "react-toastify";

interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
}

interface OrderWithUser {
  id: string;
  created_at: string;
  status: "pending" | "processing" | "completed" | "cancelled";
  total_amount: number;
  payment_status: "pending" | "paid" | "failed";
  user_id: string;
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
  users: {
    email: string;
    full_name?: string;
    phone?: string;
  } | null;
}

interface Order extends Omit<OrderWithUser, "users"> {
  user_email: string;
  user_name?: string;
  user_phone?: string;
}

const ITEMS_PER_PAGE = 10;

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [dateFilter, setDateFilter] = useState<string>("all");

  useEffect(() => {
    loadOrders();
  }, [currentPage, statusFilter, paymentFilter, dateFilter]);

  const loadOrders = async () => {
    try {
      setLoading(true);

      // First, get the total count for pagination
      let countQuery = supabase
        .from("orders")
        .select("*", { count: "exact", head: true });

      if (statusFilter !== "all") {
        countQuery = countQuery.eq("status", statusFilter);
      }
      if (paymentFilter !== "all") {
        countQuery = countQuery.eq("payment_status", paymentFilter);
      }
      if (dateFilter !== "all") {
        const today = new Date();
        let startDate = new Date();
        switch (dateFilter) {
          case "today":
            startDate.setHours(0, 0, 0, 0);
            break;
          case "week":
            startDate.setDate(today.getDate() - 7);
            break;
          case "month":
            startDate.setMonth(today.getMonth() - 1);
            break;
        }
        countQuery = countQuery.gte("created_at", startDate.toISOString());
      }

      const { count, error: countError } = await countQuery;

      if (countError) {
        console.error("Count error:", countError);
        throw countError;
      }
      setTotalOrders(count || 0);

      // Then get the actual data with all relations
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select(
          `
          *,
          order_items (
            id,
            quantity,
            price_at_time,
            products (
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
        .order("created_at", { ascending: false })
        .range(
          (currentPage - 1) * ITEMS_PER_PAGE,
          currentPage * ITEMS_PER_PAGE - 1
        );

      if (ordersError) {
        console.error("Orders error:", ordersError);
        throw ordersError;
      }

      if (!ordersData) {
        setOrders([]);
        return;
      }

      // After getting orders, fetch user details
      const userIds = ordersData.map((order) => order.user_id);

      // Since we can't query auth.users directly, we'll transform the orders without user details
      const transformedOrders = ordersData.map((order: any) => ({
        id: order.id,
        created_at: order.created_at,
        status: order.status,
        total_amount: order.total_amount,
        payment_status: order.payment_status,
        user_id: order.user_id,
        user_email: "N/A", // We can't get user details without admin access
        user_name: "N/A",
        user_phone: "N/A",
        items: (order.order_items || []).map((item: any) => ({
          id: item.id,
          product_id: item.products?.id,
          product_name: item.products?.name || "Deleted Product",
          quantity: item.quantity,
          price: item.price_at_time,
        })),
        shipping_address: order.shipping_address || {
          name: "N/A",
          address_line1: "N/A",
          city: "N/A",
          state: "N/A",
          postal_code: "N/A",
          country: "N/A",
        },
      }));

      setOrders(transformedOrders);
    } catch (error: any) {
      console.error("Error in loadOrders:", error);
      toast.error("Failed to load orders: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user_phone?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingOrderId(orderId);
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", orderId);

      if (error) throw error;

      setOrders(
        orders.map((order) =>
          order.id === orderId ? { ...order, status: newStatus as any } : order
        )
      );

      toast.success("Order status updated");
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Failed to update order status");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const totalPages = Math.ceil(totalOrders / ITEMS_PER_PAGE);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Orders Management</h1>
        <div className="text-sm text-gray-500">Total Orders: {totalOrders}</div>
      </div>

      <div className="flex flex-wrap gap-4 mb-4">
        <Input
          placeholder="Search by order ID, email, name or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Select
          value={statusFilter}
          onValueChange={(value) => {
            setStatusFilter(value);
            setCurrentPage(1);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={paymentFilter}
          onValueChange={(value) => {
            setPaymentFilter(value);
            setCurrentPage(1);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by payment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Payments</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={dateFilter}
          onValueChange={(value) => {
            setDateFilter(value);
            setCurrentPage(1);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by date" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">Last 7 Days</SelectItem>
            <SelectItem value="month">Last 30 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">
                  {order.id.slice(0, 8)}...
                </TableCell>
                <TableCell>
                  {format(new Date(order.created_at), "MMM d, yyyy HH:mm")}
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{order.user_name}</p>
                    <p className="text-sm text-gray-500">{order.user_email}</p>
                    {order.user_phone && (
                      <p className="text-sm text-gray-500">
                        {order.user_phone}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <p className="text-sm">{order.items.length} items</p>
                </TableCell>
                <TableCell>
                  <Select
                    value={order.status}
                    onValueChange={(value) =>
                      handleStatusChange(order.id, value)
                    }
                    disabled={updatingOrderId === order.id}
                  >
                    <SelectTrigger
                      className={`w-[140px] ${getStatusColor(order.status)}`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-2 w-2 rounded-full ${
                            order.status === "completed"
                              ? "bg-green-500"
                              : order.status === "processing"
                              ? "bg-blue-500"
                              : order.status === "cancelled"
                              ? "bg-red-500"
                              : "bg-yellow-500"
                          }`}
                        />
                        {order.status.charAt(0).toUpperCase() +
                          order.status.slice(1)}
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-yellow-500" />
                          Pending
                        </div>
                      </SelectItem>
                      <SelectItem value="processing">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-blue-500" />
                          Processing
                        </div>
                      </SelectItem>
                      <SelectItem value="completed">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-green-500" />
                          Completed
                        </div>
                      </SelectItem>
                      <SelectItem value="cancelled">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-red-500" />
                          Cancelled
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Badge
                    className={getPaymentStatusColor(order.payment_status)}
                  >
                    {order.payment_status.charAt(0).toUpperCase() +
                      order.payment_status.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  ₹{order.total_amount.toFixed(2)}
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedOrder(order)}
                  >
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
          <div className="flex flex-1 justify-between sm:hidden">
            <Button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              variant="outline"
            >
              Previous
            </Button>
            <Button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              variant="outline"
            >
              Next
            </Button>
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                {[...Array(totalPages)].map((_, index) => (
                  <Button
                    key={index + 1}
                    variant={currentPage === index + 1 ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(index + 1)}
                  >
                    {index + 1}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Order Details Dialog */}
      <Dialog
        open={!!selectedOrder}
        onOpenChange={() => setSelectedOrder(null)}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Order Details - #{selectedOrder?.id}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="mt-4 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-gray-900">
                    Customer Information
                  </h3>
                  <div className="mt-2 text-sm text-gray-500">
                    <p className="font-medium">{selectedOrder.user_name}</p>
                    <p>{selectedOrder.user_email}</p>
                    {selectedOrder.user_phone && (
                      <p>{selectedOrder.user_phone}</p>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">
                    Order Information
                  </h3>
                  <div className="mt-2 text-sm text-gray-500">
                    <p>
                      Date: {format(new Date(selectedOrder.created_at), "PPpp")}
                    </p>
                    <p>Status: {selectedOrder.status}</p>
                    <p>Payment: {selectedOrder.payment_status}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-900">Items</h3>
                <div className="mt-2">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.product_name}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell className="text-right">
                            ₹{item.price.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell
                          colSpan={3}
                          className="text-right font-medium"
                        >
                          Total Amount
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ₹{selectedOrder.total_amount.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-900">Shipping Address</h3>
                <div className="mt-2 text-sm text-gray-500">
                  <p>{selectedOrder.shipping_address.name}</p>
                  <p>{selectedOrder.shipping_address.address_line1}</p>
                  {selectedOrder.shipping_address.address_line2 && (
                    <p>{selectedOrder.shipping_address.address_line2}</p>
                  )}
                  <p>
                    {selectedOrder.shipping_address.city},{" "}
                    {selectedOrder.shipping_address.state}{" "}
                    {selectedOrder.shipping_address.postal_code}
                  </p>
                  <p>{selectedOrder.shipping_address.country}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
