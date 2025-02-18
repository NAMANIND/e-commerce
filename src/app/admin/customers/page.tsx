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
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MapPin, ShoppingBag, Package, User } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface Address {
  id: string;
  type: string;
  name: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
}

interface OrderItem {
  id: string;
  quantity: number;
  price_at_time: number;
  products: {
    id: string;
    name: string;
  };
}

interface Order {
  id: string;
  created_at: string;
  status: "pending" | "processing" | "completed" | "cancelled";
  payment_status: "pending" | "paid" | "failed";
  total_amount: number;
  shipping_address: Address;
  items: OrderItem[];
}

interface Customer {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  created_at: string;
  role: string;
  orders_count: number;
  total_spent: number;
  addresses?: Address[];
  orders?: Order[];
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [selectedTab, setSelectedTab] = useState<"addresses" | "orders">(
    "addresses"
  );
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      // Get all customers from users table
      const { data: usersData, error: usersError } = await supabase
        .from("users")
        .select("*")
        .eq("role", "customer");

      if (usersError) {
        console.error("Error fetching users:", usersError);
        return;
      }

      // Get all orders
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select("user_id, total_amount");

      if (ordersError) {
        console.error("Error fetching orders:", ordersError);
      }

      // Get all addresses
      const { data: addressesData, error: addressesError } = await supabase
        .from("addresses")
        .select("*");

      if (addressesError) {
        console.error("Error fetching addresses:", addressesError);
      }

      // Group addresses by user
      const addressesByUser = (addressesData || []).reduce((acc, address) => {
        if (!acc[address.user_id]) {
          acc[address.user_id] = [];
        }
        acc[address.user_id].push(address);
        return acc;
      }, {} as Record<string, Address[]>);

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

      // Combine user data with their stats and addresses
      const customersWithStats: Customer[] = (usersData || []).map((user) => ({
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        phone: user.phone,
        created_at: user.created_at,
        role: user.role,
        orders_count: userStats.get(user.id)?.orders_count || 0,
        total_spent: userStats.get(user.id)?.total_spent || 0,
        addresses: addressesByUser[user.id] || [],
      }));

      setCustomers(customersWithStats);
    } catch (error: any) {
      console.error("Error in loadCustomers:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadCustomerOrders = async (customerId: string) => {
    setLoadingOrders(true);
    try {
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select(
          `
          *,
          items:order_items (
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
            country,
            type
          )
        `
        )
        .eq("user_id", customerId)
        .order("created_at", { ascending: false });

      if (ordersError) {
        console.error("Error fetching orders:", ordersError);
        return;
      }

      setSelectedCustomer((prev) =>
        prev ? { ...prev, orders: ordersData as Order[] } : null
      );
    } catch (error) {
      console.error("Error loading customer orders:", error);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleCustomerSelect = (
    customer: Customer,
    tab: "addresses" | "orders"
  ) => {
    setSelectedCustomer(customer);
    setSelectedTab(tab);
    if (tab === "orders") {
      loadCustomerOrders(customer.id);
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

  const filteredCustomers = customers.filter((customer) =>
    [customer.email, customer.full_name, customer.phone]
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
        <div className="text-sm text-gray-500">
          Total Customers: {customers.length}
        </div>
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
              <TableHead className="text-right">Orders</TableHead>
              <TableHead className="text-right">Total Spent</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCustomers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell>{customer.full_name || "N/A"}</TableCell>
                <TableCell>{customer.email}</TableCell>
                <TableCell>{customer.phone || "N/A"}</TableCell>
                <TableCell>
                  {format(new Date(customer.created_at), "MMM d, yyyy")}
                </TableCell>
                <TableCell className="text-right">
                  {customer.orders_count}
                </TableCell>
                <TableCell className="text-right">
                  ₹{customer.total_spent.toFixed(2)}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCustomerSelect(customer, "addresses")}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Details
                  </Button>
                  {/* <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCustomerSelect(customer, "orders")}
                  >
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    Orders
                  </Button> */}
                </TableCell>
              </TableRow>
            ))}
            {filteredCustomers.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4">
                  No customers found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog
        open={!!selectedCustomer}
        onOpenChange={() => setSelectedCustomer(null)}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Customer Details -{" "}
              {selectedCustomer?.full_name || selectedCustomer?.email}
            </DialogTitle>
          </DialogHeader>
          <Tabs
            value={selectedTab}
            onValueChange={(value) => {
              setSelectedTab(value as "addresses" | "orders");
              handleCustomerSelect(
                selectedCustomer as Customer,
                value as "addresses" | "orders"
              );
            }}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="addresses">Addresses</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
            </TabsList>
            <TabsContent value="addresses" className="mt-4">
              {selectedCustomer?.addresses &&
              selectedCustomer.addresses.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {selectedCustomer.addresses.map((address) => (
                    <div
                      key={address.id}
                      className="p-4 border rounded-lg relative"
                    >
                      {address.is_default && (
                        <span className="absolute top-2 right-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          Default
                        </span>
                      )}
                      <div className="space-y-2">
                        <p className="font-medium">{address.name}</p>
                        <p className="text-sm text-gray-600">
                          {address.address_line1}
                          {address.address_line2 && (
                            <>
                              <br />
                              {address.address_line2}
                            </>
                          )}
                        </p>
                        <p className="text-sm text-gray-600">
                          {address.city}, {address.state} {address.postal_code}
                        </p>
                        <p className="text-sm text-gray-600">
                          {address.country}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          Type:{" "}
                          {address.type.charAt(0).toUpperCase() +
                            address.type.slice(1)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No addresses found for this customer
                </div>
              )}
            </TabsContent>
            <TabsContent value="orders" className="mt-4">
              {loadingOrders ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-600">
                    Loading orders...
                  </p>
                </div>
              ) : selectedCustomer?.orders &&
                selectedCustomer.orders.length > 0 ? (
                <div className="space-y-4">
                  {selectedCustomer.orders.map((order) => (
                    <div
                      key={order.id}
                      className="border rounded-lg overflow-hidden"
                    >
                      <div className="p-4 bg-gray-50 border-b">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">
                              Order #{order.id.slice(0, 8)}
                            </p>
                            <p className="text-sm text-gray-500">
                              {format(new Date(order.created_at), "PPp")}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(order.status)}>
                              {order.status.charAt(0).toUpperCase() +
                                order.status.slice(1)}
                            </Badge>
                            <Badge
                              className={getPaymentStatusColor(
                                order.payment_status
                              )}
                            >
                              {order.payment_status.charAt(0).toUpperCase() +
                                order.payment_status.slice(1)}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-2">
                              Items
                            </h4>
                            <div className="space-y-2">
                              {order.items.map((item) => (
                                <div
                                  key={item.id}
                                  className="flex justify-between text-sm"
                                >
                                  <div className="flex items-center">
                                    <Package className="h-4 w-4 mr-2 text-gray-400" />
                                    <span>{item.products.name}</span>
                                    <span className="text-gray-500 ml-2">
                                      × {item.quantity}
                                    </span>
                                  </div>
                                  <span>
                                    ₹
                                    {(
                                      item.price_at_time * item.quantity
                                    ).toFixed(2)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="border-t pt-4">
                            <h4 className="text-sm font-medium text-gray-900 mb-2">
                              Shipping Address
                            </h4>
                            <div className="text-sm text-gray-600">
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
                          <div className="border-t pt-4 flex justify-end">
                            <p className="text-lg font-medium">
                              Total: ₹{order.total_amount.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No orders found for this customer
                </div>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}
