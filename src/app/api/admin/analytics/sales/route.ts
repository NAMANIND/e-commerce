import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
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
    const conversionRate = ((currentPeriodOrders?.length || 0) / 100) * 3.5; // Example conversion rate calculation

    return NextResponse.json({
      totalSales,
      previousPeriodSales,
      averageOrderValue,
      conversionRate,
    });
  } catch (error) {
    console.error("Error fetching sales stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch sales stats" },
      { status: 500 }
    );
  }
}
