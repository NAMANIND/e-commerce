"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { supabase } from "@/lib/supabase";

interface ProductData {
  name: string;
  sales: number;
}

function ProductsChartComponent() {
  const [data, setData] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProductData() {
      try {
        // Get order items with product details
        const { data: orderItems } = await supabase.from("order_items").select(`
            quantity,
            product_id,
            products (
              name
            )
          `);

        if (!orderItems) return;

        // Calculate total sales per product
        const productSales = orderItems.reduce(
          (acc: Record<string, number>, item) => {
            const productName =
              item.products[0]?.name || `Product ${item.product_id}`;
            acc[productName] = (acc[productName] || 0) + (item.quantity || 0);
            return acc;
          },
          {}
        );

        // Convert to array and sort by sales
        const chartData = Object.entries(productSales)
          .map(([name, sales]) => ({ name, sales }))
          .sort((a, b) => b.sales - a.sales)
          .slice(0, 7); // Top 7 products

        setData(chartData);
      } catch (error) {
        console.error("Error fetching product data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProductData();
  }, []);

  if (loading || data.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-gray-500">
          {loading ? "Loading..." : "No product data available"}
        </p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis tickFormatter={(value: number) => value.toLocaleString()} />
        <Tooltip
          formatter={(value: number) => [value.toLocaleString(), "Units Sold"]}
        />
        <Bar dataKey="sales" fill="#2563eb" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export const ProductsChart = dynamic(
  () => Promise.resolve(ProductsChartComponent),
  {
    ssr: false,
  }
);
