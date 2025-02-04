"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/use-debounce";

interface Category {
  id: string;
  name: string;
  product_count: number;
}

interface ProductsFiltersProps {
  defaultCategory?: string;
  defaultMinPrice?: string;
  defaultMaxPrice?: string;
}

export function ProductsFilters({
  defaultCategory = "",
  defaultMinPrice = "",
  defaultMaxPrice = "",
}: ProductsFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(defaultCategory);
  const [minPrice, setMinPrice] = useState(defaultMinPrice);
  const [maxPrice, setMaxPrice] = useState(defaultMaxPrice);
  const [loading, setLoading] = useState(true);

  const debouncedMinPrice = useDebounce(minPrice, 500);
  const debouncedMaxPrice = useDebounce(maxPrice, 500);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch("/api/categories");
        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || "Failed to fetch categories");
        }

        if (!Array.isArray(result.data)) {
          throw new Error("Invalid response format");
        }

        setCategories(result.data);
      } catch (err) {
        console.error("Error fetching categories:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());

    if (selectedCategory) {
      params.set("category", selectedCategory);
    } else {
      params.delete("category");
    }

    if (debouncedMinPrice) {
      params.set("minPrice", debouncedMinPrice);
    } else {
      params.delete("minPrice");
    }

    if (debouncedMaxPrice) {
      params.set("maxPrice", debouncedMaxPrice);
    } else {
      params.delete("maxPrice");
    }

    // Reset to first page when filters change
    params.delete("page");

    router.push(`/products?${params.toString()}`);
  }, [
    selectedCategory,
    debouncedMinPrice,
    debouncedMaxPrice,
    router,
    searchParams,
  ]);

  const clearFilters = () => {
    setSelectedCategory("");
    setMinPrice("");
    setMaxPrice("");
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-8 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasActiveFilters =
    selectedCategory || defaultMinPrice || defaultMaxPrice;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div
              className={`cursor-pointer p-2 rounded-md transition-colors ${
                selectedCategory === ""
                  ? "bg-gray-100 text-gray-900"
                  : "hover:bg-gray-50"
              }`}
              onClick={() => setSelectedCategory("")}
            >
              All Categories
            </div>
            {categories.map((category) => (
              <div
                key={category.id}
                className={`cursor-pointer p-2 rounded-md transition-colors ${
                  selectedCategory === category.id
                    ? "bg-gray-100 text-gray-900"
                    : "hover:bg-gray-50"
                }`}
                onClick={() => setSelectedCategory(category.id)}
              >
                <div className="flex items-center justify-between">
                  <span>{category.name}</span>
                  <span className="text-sm text-gray-500">
                    ({category.product_count})
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Price Range</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="min-price">Min Price</Label>
              <Input
                id="min-price"
                type="number"
                min="0"
                step="0.01"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="max-price">Max Price</Label>
              <Input
                id="max-price"
                type="number"
                min="0"
                step="0.01"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="1000.00"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {hasActiveFilters && (
        <Button variant="outline" className="w-full" onClick={clearFilters}>
          Clear Filters
        </Button>
      )}
    </div>
  );
}
