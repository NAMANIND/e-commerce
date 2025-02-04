"use client";

import { useState, useEffect } from "react";
import { Search, Mail, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import Link from "next/link";

interface Customer {
  id: string;
  name: string;
  email: string;
  created_at: string;
  orders_count: number;
  total_spent: number;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchCustomers();
  }, [search]);

  async function fetchCustomers() {
    try {
      const searchParams = new URLSearchParams();
      if (search) {
        searchParams.set("search", search);
      }

      const response = await fetch(`/api/admin/customers?${searchParams}`);
      if (!response.ok) throw new Error("Failed to fetch customers");

      const data = await response.json();
      setCustomers(data);
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Customers</h2>
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="p-6">
              <div className="space-y-3">
                <div className="h-4 w-1/4 bg-gray-200 rounded" />
                <div className="h-4 w-1/2 bg-gray-200 rounded" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Customers</h2>
        <div className="mt-4 sm:mt-0">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              placeholder="Search customers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {customers.map((customer) => (
          <Link key={customer.id} href={`/admin/customers/${customer.id}`}>
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-lg font-medium">{customer.name}</p>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Mail className="h-4 w-4" />
                    <span>{customer.email}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Joined{" "}
                      {new Date(customer.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">
                    ${customer.total_spent.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {customer.orders_count} orders
                  </p>
                </div>
              </div>
            </Card>
          </Link>
        ))}

        {customers.length === 0 && (
          <Card className="p-12 text-center">
            <div className="space-y-3">
              <h3 className="text-lg font-medium">No customers found</h3>
              <p className="text-sm text-gray-500">
                Try adjusting your search to find what you're looking for.
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
