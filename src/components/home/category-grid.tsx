"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface CategorySliderProps {
  limit?: number;
}

interface Category {
  id: string;
  name: string;
  description?: string;
  image_url: string;
  product_count?: number;
}

export function CategorySlider({ limit = 10 }: CategorySliderProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const sliderRef = useRef<HTMLDivElement>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/admin/categories");
      const result = await response.json();

      if (!result.success || !Array.isArray(result.data)) {
        throw new Error(result.error || "Failed to fetch categories");
      }
      console.log("result.data", result.data);

      setCategories(result.data.slice(0, limit));
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

  const scrollLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  if (loading) {
    return (
      <div className="relative mx-auto max-w-7xl px-4">
        <div className="flex space-x-6 overflow-x-auto pb-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center">
              <Skeleton className="h-28 w-28 flex-shrink-0 rounded-full" />
              <Skeleton className="h-4 w-24 mt-2" />
            </div>
          ))}
        </div>
        <div className="flex justify-end absolute right-1 top-4">
          <Skeleton className="h-8 w-48 mb-6" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="bg-red-50 rounded-lg p-4 text-center">
          <p className="text-red-600 mb-2">{error}</p>
          <button
            onClick={fetchCategories}
            className="text-sm font-medium text-red-600 hover:text-red-800"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <div className="relative mx-auto max-w-7xl px-4">
      <div
        ref={sliderRef}
        className="flex space-x-4 sm:space-x-6 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/products?category=${category.id}`}
            className="flex flex-col items-center group flex-shrink-0 text-center"
          >
            <div className="relative h-24 w-24 sm:h-28 sm:w-28 mb-2 overflow-hidden rounded-full border border-gray-200">
              <Image
                src={category.image_url}
                alt={category.name}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-110"
              />
            </div>
            <span className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors capitalize">
              {category.name}
            </span>
          </Link>
        ))}
      </div>
      <div className="flex items-center justify-end w-full mb-6 absolute right-1 top-4">
        <div className="flex space-x-2">
          <Button
            onClick={scrollLeft}
            size="icon"
            variant="outline"
            className="rounded-full h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            onClick={scrollRight}
            size="icon"
            variant="outline"
            className="rounded-full h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
