import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import {
  handleApiRoute,
  successResponse,
  errorResponse,
} from "@/lib/middleware";

interface OrderItem {
  quantity: number;
  total: number;
  products: {
    id: string;
    name: string;
    category_id: string;
  };
}

interface Order {
  created_at: string;
  total: number;
  status: string;
  payment_status: string;
}

interface User {
  created_at: string;
  role: string;
}

export async function GET(request: NextRequest) {
  return handleApiRoute(
    request,
    async () => {
      const searchParams = request.nextUrl.searchParams;
      const period = searchParams.get("period") || "30d"; // 7d, 30d, 90d, 1y
      const now = new Date();
      let startDate: Date;

      // Calculate start date based on period
      switch (period) {
        case "7d":
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case "90d":
          startDate = new Date(now.setDate(now.getDate() - 90));
          break;
        case "1y":
          startDate = new Date(now.setFullYear(now.getFullYear() - 1));
          break;
        default: // 30d
          startDate = new Date(now.setDate(now.getDate() - 30));
      }

      // Get sales analytics
      const { data: salesData, error: salesError } = await supabase
        .from("orders")
        .select("created_at, total, status, payment_status")
        .gte("created_at", startDate.toISOString())
        .order("created_at", { ascending: true });

      if (salesError) {
        return errorResponse(salesError);
      }

      // Get product analytics
      const { data: productData, error: productError } = await supabase
        .from("order_items")
        .select(
          `
          quantity,
          total,
          products:products (
            id,
            name,
            category_id
          )
        `
        )
        .gte("created_at", startDate.toISOString());

      if (productError) {
        return errorResponse(productError);
      }

      // Get customer analytics
      const { data: customerData, error: customerError } = await supabase
        .from("users")
        .select("created_at, role")
        .eq("role", "customer")
        .gte("created_at", startDate.toISOString());

      if (customerError) {
        return errorResponse(customerError);
      }

      // Process sales data
      const salesAnalytics = {
        totalSales: (salesData as Order[]).reduce(
          (sum, order) =>
            order.payment_status === "paid" ? sum + order.total : sum,
          0
        ),
        orderCount: salesData.length,
        paidOrders: (salesData as Order[]).filter(
          (order) => order.payment_status === "paid"
        ).length,
        averageOrderValue:
          salesData.length > 0
            ? (salesData as Order[]).reduce(
                (sum, order) => sum + order.total,
                0
              ) / salesData.length
            : 0,
        statusBreakdown: (salesData as Order[]).reduce(
          (acc: Record<string, number>, order) => {
            acc[order.status] = (acc[order.status] || 0) + 1;
            return acc;
          },
          {}
        ),
        dailySales: (salesData as Order[]).reduce(
          (acc: Record<string, number>, order) => {
            const date = order.created_at.split("T")[0];
            acc[date] = (acc[date] || 0) + order.total;
            return acc;
          },
          {}
        ),
      };

      // Process product data
      const productAnalytics = {
        totalItemsSold: (productData as unknown as OrderItem[]).reduce(
          (sum, item) => sum + item.quantity,
          0
        ),
        topProducts: Object.values(
          (productData as unknown as OrderItem[]).reduce(
            (acc: Record<string, any>, item) => {
              const productId = item.products.id;
              if (!acc[productId]) {
                acc[productId] = {
                  productId,
                  name: item.products.name,
                  quantity: 0,
                  revenue: 0,
                };
              }
              acc[productId].quantity += item.quantity;
              acc[productId].revenue += item.total;
              return acc;
            },
            {}
          )
        )
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 10),
      };

      // Process customer data
      const customerAnalytics = {
        totalCustomers: customerData.length,
        newCustomers: customerData.length,
        customerGrowth: (customerData as User[]).reduce(
          (acc: Record<string, number>, user) => {
            const date = user.created_at.split("T")[0];
            acc[date] = (acc[date] || 0) + 1;
            return acc;
          },
          {}
        ),
      };

      return successResponse({
        sales: salesAnalytics,
        products: productAnalytics,
        customers: customerAnalytics,
      });
    },
    { requireAdmin: true }
  );
}
