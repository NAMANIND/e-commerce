"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/lib/utils";
import { useDispatch } from "react-redux";
import { addToCart } from "@/store/cartSlice";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";

interface ProductGridProps {
  limit?: number;
  featured?: boolean;
  categoryId?: string;
  query?: string;
  sort?: string;
  minPrice?: string;
  maxPrice?: string;
  page?: number;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  stock: number;
  discounted_price: number;
  discount_percentage: number;
}

export function ProductGrid({
  limit = 12,
  featured = false,
  categoryId,
  query = "",
  sort = "",
  minPrice = "",
  maxPrice = "",
  page = 1,
}: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (featured) params.set("featured", "true");
      if (categoryId) params.set("category", categoryId);
      if (query) params.set("q", query);
      if (sort) params.set("sort", sort);
      if (minPrice) params.set("minPrice", minPrice);
      if (maxPrice) params.set("maxPrice", maxPrice);
      if (page > 1) params.set("page", page.toString());
      if (limit) params.set("limit", limit.toString());

      const response = await fetch(`/api/products/search?${params.toString()}`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch products");
      }

      if (!Array.isArray(result.data?.products)) {
        throw new Error("Invalid response format");
      }

      setProducts(result.data.products);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product: Product) => {
    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image_url: product.image_url,
    };
    dispatch(addToCart(cartItem));
    toast.success(`${product.name} added to cart!`);
  };

  useEffect(() => {
    fetchProducts();
  }, [limit, featured, categoryId, query, sort, minPrice, maxPrice, page]);

  if (loading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: limit }).map((_, i) => (
          <div key={i} className="h-[350px]">
            <Skeleton className="h-full w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center">
        <div className="bg-red-50 rounded-lg p-6 inline-block">
          <p className="text-red-600 mb-4">{error.toString()}</p>
          <button
            onClick={fetchProducts}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <h3 className="text-gray-500 text-lg mb-4">No products found</h3>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Add your first product
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product: Product) => (
        <Link
          key={product.id}
          href={`/products/${product.id}`}
          className="block"
        >
          <div className="bg-white rounded-lg overflow-hidden">
            <div className="aspect-square relative">
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="text-sm text-gray-700">{product.name}</h3>
              <div className="flex items-center justify-between mt-4">
                {product.discounted_price < product.price && (
                  <div className="flex items-center">
                    <span className="text-sm line-through text-gray-500 mr-2">
                      ₹{product.price.toFixed(2)}
                    </span>
                    <span className="text-lg font-bold text-red-600">
                      ₹{product.discounted_price.toFixed(2)}
                    </span>
                    <span className="ml-2 text-sm text-green-600">
                      {product.discount_percentage}% off
                    </span>
                  </div>
                )}
                {product.discounted_price >= product.price && (
                  <span className="text-lg font-bold text-gray-900">
                    ₹{product.price.toFixed(2)}
                  </span>
                )}
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    handleAddToCart(product);
                  }}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </Button>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
