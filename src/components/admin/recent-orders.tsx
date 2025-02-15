"use client";

import { useEffect, useState } from "react";
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

interface Order {
  id: string;
  created_at: string;
  status: "pending" | "processing" | "completed" | "cancelled";
  total_amount: number;
  payment_status: "pending" | "paid" | "failed";
  user_email: string | null;
}

export default function RecentOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecentOrders();
  }, []);

  const loadRecentOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(
          `
          id,
          created_at,
          status,
          total_amount,
          payment_status,
          user_email:auth.users(email)
        `
        )
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;

      const transformedOrders = (data || []).map((order: any) => ({
        ...order,
        user_email: order.user_email?.[0]?.email || null,
      }));

      setOrders(transformedOrders);
    } catch (error) {
      console.error("Error loading recent orders:", error);
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

  if (loading) {
    return <div>Loading recent orders...</div>;
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">
                {order.id.slice(0, 8)}...
              </TableCell>
              <TableCell>
                {format(new Date(order.created_at), "MMM d, yyyy")}
              </TableCell>
              <TableCell>{order.user_email || "N/A"}</TableCell>
              <TableCell>
                <Badge
                  className={`${getStatusColor(order.status)} capitalize`}
                  variant="secondary"
                >
                  {order.status}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge
                  className={`${getPaymentStatusColor(
                    order.payment_status
                  )} capitalize`}
                  variant="secondary"
                >
                  {order.payment_status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                ₹{order.total_amount.toFixed(2)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
