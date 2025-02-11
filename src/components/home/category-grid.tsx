"use client";

import React from "react";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight } from "lucide-react";

interface CategoryGridProps {
  limit?: number;
  showImages?: boolean;
}

interface Category {
  id: string;
  name: string;
  description: string;
  image_url: string;
  product_count: number;
}

export function CategoryGrid({
  limit = 6,
  showImages = true,
}: CategoryGridProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/admin/categories");
      const result = await response.json();

      if (!result.success || !Array.isArray(result.data)) {
        throw new Error(result.error || "Failed to fetch categories");
      }

      const categoriesWithProducts = result.data.map((category: any) => ({
        ...category,
        products: [], // Initialize empty products array since we don't need it for the grid
      }));

      setCategories(categoriesWithProducts.slice(0, limit));
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch categories"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [limit]);

  if (loading) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Skeleton className="h-10 w-48 mb-8" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: limit }).map((_, i) => (
              <div key={i} className="h-[300px]">
                <Skeleton className="h-full w-full" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="bg-red-50 rounded-lg p-6">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchCategories}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <h3 className="text-gray-500 text-lg">No categories found</h3>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-admin-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-admin-heading sm:text-4xl">
            Shop by Category
          </h2>
          <p className="mt-4 text-xl text-admin-subtext">
            Explore our wide range of products by category
          </p>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category: Category) => (
            <Link
              key={category.id}
              href={`/products?category=${category.id}`}
              className="group relative overflow-hidden rounded-2xl bg-gray-100 hover:shadow-xl transition-all duration-300"
            >
              {showImages && (
                <div className="aspect-[4/3] relative">
                  <Image
                    src={category.image_url}
                    alt={category.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
              )}
              <div
                className={`p-6 ${
                  showImages
                    ? "absolute bottom-0 left-0 right-0 text-white"
                    : ""
                }`}
              >
                <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-400 transition-colors">
                  {category.name}
                </h3>
                <p
                  className={`text-sm ${
                    showImages ? "text-gray-200" : "text-gray-600"
                  }`}
                >
                  {category.description}
                </p>
                <div className="mt-4 flex items-center text-blue-400 font-medium">
                  Shop Now
                  <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
