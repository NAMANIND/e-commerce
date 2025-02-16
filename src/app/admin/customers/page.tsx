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
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { User } from "@supabase/supabase-js";

interface Customer {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  user_metadata: {
    full_name?: string;
    phone?: string;
  };
  orders_count: number;
  total_spent: number;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      // Get all users from auth.users
      const { data: usersData, error: usersError } =
        await supabase.auth.admin.listUsers();

      if (usersError) {
        console.error("Error fetching users:", {
          message: usersError.message,
          details: usersError,
        });
        return;
      }

      if (!usersData?.users || usersData.users.length === 0) {
        console.log("No users found");
        setCustomers([]);
        return;
      }

      // Get all orders
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select("user_id, total_amount");

      if (ordersError) {
        console.error("Error fetching orders:", ordersError);
      }

      // Calculate stats per user
      const userStats = new Map<
        string,
        { orders_count: number; total_spent: number }
      >();
      ordersData?.forEach((order) => {
        const stats = userStats.get(order.user_id) || {
          orders_count: 0,
          total_spent: 0,
        };
        stats.orders_count += 1;
        stats.total_spent += order.total_amount || 0;
        userStats.set(order.user_id, stats);
      });

      // Combine user data with their stats
      const customersWithStats: Customer[] = usersData.users.map((user) => ({
        id: user.id,
        email: user.email || "",
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at || null,
        user_metadata: {
          full_name: user.user_metadata?.full_name,
          phone: user.user_metadata?.phone,
        },
        orders_count: userStats.get(user.id)?.orders_count || 0,
        total_spent: userStats.get(user.id)?.total_spent || 0,
      }));

      setCustomers(customersWithStats);
    } catch (error: any) {
      console.error("Error in loadCustomers:", {
        message: error?.message || "Unknown error",
        details: error,
        stack: error?.stack,
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter((customer) =>
    [
      customer.email,
      customer.user_metadata.full_name,
      customer.user_metadata.phone,
    ]
      .filter(Boolean)
      .some((field) => field?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading customers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Customers</h1>
      </div>

      <div className="flex gap-4 mb-4">
        <Input
          placeholder="Search by name, email, or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead className="text-right">Orders</TableHead>
              <TableHead className="text-right">Total Spent</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCustomers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell>
                  {customer.user_metadata.full_name || "N/A"}
                </TableCell>
                <TableCell>{customer.email}</TableCell>
                <TableCell>{customer.user_metadata.phone || "N/A"}</TableCell>
                <TableCell>
                  {format(new Date(customer.created_at), "MMM d, yyyy")}
                </TableCell>
                <TableCell>
                  {customer.last_sign_in_at
                    ? format(new Date(customer.last_sign_in_at), "MMM d, yyyy")
                    : "Never"}
                </TableCell>
                <TableCell className="text-right">
                  {customer.orders_count}
                </TableCell>
                <TableCell className="text-right">
                  ₹{customer.total_spent.toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
