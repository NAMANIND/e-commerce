"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { SalesChart } from "@/components/admin/charts/sales-chart";
import {
  ArrowUp,
  ArrowDown,
  IndianRupee,
  TrendingUp,
  ShoppingBag,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SalesStats {
  totalSales: number;
  previousPeriodSales: number;
  averageOrderValue: number;
  conversionRate: number;
}

type DateRange = {
  from: Date | undefined;
  to: Date | undefined;
};

export default function SalesAnalyticsPage() {
  const [stats, setStats] = useState<SalesStats>({
    totalSales: 0,
    previousPeriodSales: 0,
    averageOrderValue: 0,
    conversionRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: undefined,
    to: undefined,
  });
  const [selectedPreset, setSelectedPreset] = useState<string>("30days");

  useEffect(() => {
    fetchSalesStats();
  }, [dateRange, selectedPreset]);

  async function fetchSalesStats() {
    try {
      let currentPeriodStart: Date;
      let previousPeriodStart: Date;

      if (dateRange.from && dateRange.to) {
        // Custom date range
        currentPeriodStart = dateRange.from;
        const daysDiff = Math.ceil(
          (dateRange.to.getTime() - dateRange.from.getTime()) /
            (1000 * 60 * 60 * 24)
        );
        previousPeriodStart = new Date(dateRange.from);
        previousPeriodStart.setDate(previousPeriodStart.getDate() - daysDiff);
      } else {
        // Predefined ranges
        currentPeriodStart = new Date();
        previousPeriodStart = new Date();

        switch (selectedPreset) {
          case "7days":
            currentPeriodStart.setDate(currentPeriodStart.getDate() - 7);
            previousPeriodStart.setDate(previousPeriodStart.getDate() - 14);
            break;
          case "30days":
            currentPeriodStart.setDate(currentPeriodStart.getDate() - 30);
            previousPeriodStart.setDate(previousPeriodStart.getDate() - 60);
            break;
          case "90days":
            currentPeriodStart.setDate(currentPeriodStart.getDate() - 90);
            previousPeriodStart.setDate(previousPeriodStart.getDate() - 180);
            break;
          case "year":
            currentPeriodStart.setFullYear(
              currentPeriodStart.getFullYear() - 1
            );
            previousPeriodStart.setFullYear(
              previousPeriodStart.getFullYear() - 2
            );
            break;
        }
      }

      const { data: currentPeriodOrders } = await supabase
        .from("orders")
        .select("total_amount")
        .gte("created_at", currentPeriodStart.toISOString())
        .lte(
          "created_at",
          dateRange.to?.toISOString() || new Date().toISOString()
        );

      const { data: previousPeriodOrders } = await supabase
        .from("orders")
        .select("total_amount")
        .gte("created_at", previousPeriodStart.toISOString())
        .lt("created_at", currentPeriodStart.toISOString());

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
        conversionRate: ((currentPeriodOrders?.length || 0) / 100) * 3.5,
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

  const handlePresetChange = (preset: string) => {
    setSelectedPreset(preset);
    setDateRange({ from: undefined, to: undefined });
  };

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
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Sales Analytics</h2>

        <div className="flex items-center gap-4">
          <Select value={selectedPreset} onValueChange={handlePresetChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="90days">Last 90 Days</SelectItem>
              <SelectItem value="year">Last Year</SelectItem>
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal",
                  !dateRange.from && "text-muted-foreground"
                )}
              >
                <Calendar className="mr-2 h-4 w-4" />
                {dateRange.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y")} -{" "}
                      {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Custom Range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <CalendarComponent
                initialFocus
                mode="range"
                selected={{
                  from: dateRange.from,
                  to: dateRange.to,
                }}
                onSelect={(range: any) => {
                  if (range?.from && range?.to) {
                    // Prevent selecting future dates
                    const today = new Date();
                    today.setHours(23, 59, 59, 999);

                    const from = range.from > today ? today : range.from;
                    const to = range.to > today ? today : range.to;

                    setDateRange({ from, to });
                    setSelectedPreset("");
                  } else {
                    setDateRange(range);
                  }
                }}
                numberOfMonths={2}
                disabled={(date) => date > new Date()}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Sales</p>
              <p className="text-2xl font-semibold">
                ₹{stats.totalSales.toFixed(2)}
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
            <IndianRupee className="h-12 w-12 text-blue-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Average Order Value
              </p>
              <p className="text-2xl font-semibold">
                ₹{stats.averageOrderValue.toFixed(2)}
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
