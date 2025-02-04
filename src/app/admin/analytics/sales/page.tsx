"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { SalesChart } from "@/components/admin/charts/sales-chart";
import {
  ArrowUp,
  ArrowDown,
  DollarSign,
  TrendingUp,
  ShoppingBag,
} from "lucide-react";

interface SalesStats {
  totalSales: number;
  previousPeriodSales: number;
  averageOrderValue: number;
  conversionRate: number;
}

export default function SalesAnalyticsPage() {
  const [stats, setStats] = useState<SalesStats>({
    totalSales: 0,
    previousPeriodSales: 0,
    averageOrderValue: 0,
    conversionRate: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSalesStats();
  }, []);

  async function fetchSalesStats() {
    try {
      // Get current period sales (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

      const { data: currentPeriodOrders } = await supabase
        .from("orders")
        .select("total_amount")
        .gte("created_at", thirtyDaysAgo.toISOString());

      const { data: previousPeriodOrders } = await supabase
        .from("orders")
        .select("total_amount")
        .gte("created_at", sixtyDaysAgo.toISOString())
        .lt("created_at", thirtyDaysAgo.toISOString());

      const totalSales =
        currentPeriodOrders?.reduce(
          (sum, order) => sum + (order.total_amount || 0),
          0
        ) || 0;
      const previousPeriodSales =
        previousPeriodOrders?.reduce(
          (sum, order) => sum + (order.total_amount || 0),
          0
        ) || 0;
      const averageOrderValue = totalSales / (currentPeriodOrders?.length || 1);

      setStats({
        totalSales,
        previousPeriodSales,
        averageOrderValue,
        conversionRate: ((currentPeriodOrders?.length || 0) / 100) * 3.5, // Example conversion rate calculation
      });
    } catch (error) {
      console.error("Error fetching sales stats:", error);
    } finally {
      setLoading(false);
    }
  }

  const salesChange =
    ((stats.totalSales - stats.previousPeriodSales) /
      stats.previousPeriodSales) *
    100;

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold tracking-tight">Sales Analytics</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 w-1/2 bg-gray-200 rounded" />
                <div className="h-8 w-2/3 bg-gray-200 rounded" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Sales Analytics</h2>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Sales</p>
              <p className="text-2xl font-semibold">
                ${stats.totalSales.toFixed(2)}
              </p>
              <div className="mt-1 flex items-center">
                {salesChange >= 0 ? (
                  <ArrowUp className="h-4 w-4 text-green-500" />
                ) : (
                  <ArrowDown className="h-4 w-4 text-red-500" />
                )}
                <span
                  className={`text-sm ${
                    salesChange >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {Math.abs(salesChange).toFixed(1)}%
                </span>
                <span className="text-sm text-gray-500 ml-1">
                  vs last period
                </span>
              </div>
            </div>
            <DollarSign className="h-12 w-12 text-blue-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Average Order Value
              </p>
              <p className="text-2xl font-semibold">
                ${stats.averageOrderValue.toFixed(2)}
              </p>
            </div>
            <ShoppingBag className="h-12 w-12 text-blue-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Conversion Rate
              </p>
              <p className="text-2xl font-semibold">
                {stats.conversionRate.toFixed(1)}%
              </p>
            </div>
            <TrendingUp className="h-12 w-12 text-blue-600" />
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-medium">Sales Over Time</h3>
        </div>
        <div className="h-[400px]">
          <SalesChart />
        </div>
      </Card>
    </div>
  );
}
