"use client";

import { useEffect, useState } from "react";
import { DollarSign, ShoppingBag, Users, Package } from "lucide-react";
import { Card } from "@/components/ui/card";
import { SalesChart } from "@/components/admin/charts/sales-chart";
import { ProductsChart } from "@/components/admin/charts/products-chart";
import RecentOrdersTable from "@/components/admin/tables/recent-orders";
import LowStockProductsTable from "@/components/admin/tables/low-stock-products";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

interface DashboardStats {
  totalSales: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalSales: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        // Fetch total products
        const { count: productsCount } = await supabase
          .from("products")
          .select("*", { count: "exact" });

        // Fetch total orders
        const { count: ordersCount } = await supabase
          .from("orders")
          .select("*", { count: "exact" });

        // Fetch total customers
        const { count: customersCount } = await supabase
          .from("users")
          .select("*", { count: "exact" });

        // Fetch total sales
        const { data: orders } = await supabase
          .from("orders")
          .select("total_amount");

        const totalSales =
          orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) ||
          0;

        setStats({
          totalSales,
          totalOrders: ordersCount || 0,
          totalCustomers: customersCount || 0,
          totalProducts: productsCount || 0,
        });
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const statsDisplay = [
    {
      label: "Total Sales",
      value: `$${stats.totalSales.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      icon: DollarSign,
    },
    {
      label: "Orders",
      value: stats.totalOrders.toString(),
      icon: ShoppingBag,
    },
    {
      label: "Customers",
      value: stats.totalCustomers.toString(),
      icon: Users,
    },
    {
      label: "Products",
      value: stats.totalProducts.toString(),
      icon: Package,
    },
  ];

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-12 w-12 rounded-full bg-gray-200" />
                <div className="space-y-2">
                  <div className="h-4 w-1/2 rounded bg-gray-200" />
                  <div className="h-6 w-2/3 rounded bg-gray-200" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsDisplay.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="p-6">
              <div className="flex items-center gap-x-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
                  <Icon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-semibold">{stat.value}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-6">
          <div className="mb-4">
            <h3 className="text-lg font-medium">Sales Over Time</h3>
          </div>
          <div className="h-[350px]">
            <SalesChart />
          </div>
        </Card>

        <Card className="p-6">
          <div className="mb-4">
            <h3 className="text-lg font-medium">Top Products</h3>
          </div>
          <div className="h-[350px]">
            <ProductsChart />
          </div>
        </Card>
      </div>

      {/* Tables */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-6">
          <div className="mb-4">
            <h3 className="text-lg font-medium">Recent Orders</h3>
          </div>
          <RecentOrdersTable />
        </Card>

        <Card className="p-6">
          <div className="mb-4">
            <h3 className="text-lg font-medium">Low Stock Products</h3>
          </div>
          <LowStockProductsTable />
        </Card>
      </div>
    </div>
  );
}
