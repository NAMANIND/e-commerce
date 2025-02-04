"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { supabase } from "@/lib/supabase";

interface SalesData {
  date: string;
  sales: number;
}

function SalesChartComponent() {
  const [data, setData] = useState<SalesData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSalesData() {
      try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data: orders } = await supabase
          .from("orders")
          .select("created_at, total_amount")
          .gte("created_at", thirtyDaysAgo.toISOString())
          .order("created_at");

        if (!orders) return;

        // Group orders by date and sum total amounts
        const salesByDate = orders.reduce(
          (acc: Record<string, number>, order) => {
            const date = new Date(order.created_at).toISOString().split("T")[0];
            acc[date] = (acc[date] || 0) + (order.total_amount || 0);
            return acc;
          },
          {}
        );

        // Convert to array format for chart
        const chartData = Object.entries(salesByDate).map(([date, sales]) => ({
          date,
          sales,
        }));

        setData(chartData);
      } catch (error) {
        console.error("Error fetching sales data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchSalesData();
  }, []);

  if (loading || data.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-gray-500">
          {loading ? "Loading..." : "No sales data available"}
        </p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          tickFormatter={(value: string) =>
            new Date(value).toLocaleDateString()
          }
        />
        <YAxis
          tickFormatter={(value: number) => `$${value.toLocaleString()}`}
        />
        <Tooltip
          formatter={(value: number) => [`$${value.toLocaleString()}`, "Sales"]}
          labelFormatter={(label: string) =>
            new Date(label).toLocaleDateString()
          }
        />
        <Line
          type="monotone"
          dataKey="sales"
          stroke="#2563eb"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export const SalesChart = dynamic(() => Promise.resolve(SalesChartComponent), {
  ssr: false,
});
