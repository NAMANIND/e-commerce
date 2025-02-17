"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "@/store/cartSlice";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { ShoppingCart, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { RootState } from "@/store/store";

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
  is_featured?: boolean;
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
  const cartItems = useSelector((state: RootState) => state.cart.items);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (featured) params.set("is_featured", "true");
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
    if (product.stock === 0) {
      toast.error(`${product.name} is out of stock!`);
      return;
    }

    // Check current quantity in cart
    const currentCartItem = cartItems.find((item) => item.id === product.id);
    const currentQuantity = currentCartItem?.quantity || 0;

    // Check if adding one more would exceed stock
    if (currentQuantity + 1 > product.stock) {
      toast.error(
        `Cannot add more ${product.name}. Only ${product.stock} available in stock!`
      );
      return;
    }

    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      discounted_price: product.discounted_price,
      quantity: 1,
      image_url: product.image_url,
      stock: product.stock,
      discount_percentage: product.discount_percentage,
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
      {products.map((product: Product) => {
        // Calculate remaining stock considering cart quantity
        const cartItem = cartItems.find((item) => item.id === product.id);
        const cartQuantity = cartItem?.quantity || 0;
        const remainingStock = product.stock - cartQuantity;

        return (
          <div key={product.id} className="group relative">
            <Link href={`/products/${product.id}`} className="block">
              <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:shadow-md">
                <div className="aspect-square relative">
                  <Image
                    src={product.image_url}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {/* Stock Status Overlay */}
                  {remainingStock === 0 && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <Badge
                        variant="destructive"
                        className="text-sm font-medium px-3 py-1 bg-red-100 text-red-800 border border-red-200 shadow-sm rounded-full animate-pulse"
                      >
                        Out of Stock
                      </Badge>
                    </div>
                  )}
                  {remainingStock > 0 && remainingStock <= 5 && (
                    <div className="absolute top-2 right-2">
                      <Badge
                        variant="secondary"
                        className="bg-amber-100 text-amber-800 text-xs"
                      >
                        Only {remainingStock} left
                      </Badge>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-medium text-gray-800 line-clamp-2 flex items-start justify-between gap-2">
                    <span>
                      {product.name}
                      {product.is_featured && (
                        <span className="ml-2 text-xs font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full shadow-sm ">
                          Featured
                        </span>
                      )}
                      {remainingStock > 0 && remainingStock <= 5 && (
                        <span className="text-xs text-amber-600 text-center ml-2 font-medium bg-amber-50 px-1.5 py-0.5 rounded-full shadow-sm ">
                          Low stock
                        </span>
                      )}
                      {cartQuantity > 0 && (
                        <span className="text-xs text-green-600 text-center ml-2 font-medium bg-green-50 px-1.5 py-0.5 rounded-full shadow-sm ">
                          {cartQuantity} in cart
                        </span>
                      )}
                    </span>
                  </h3>
                  <p className="text-sm text-gray-500 line-clamp-2 my-2">
                    {product.description}
                  </p>
                  <div className="mt-4 flex flex-col space-y-2">
                    <div className="flex flex-wrap items-baseline gap-1">
                      {product.discounted_price < product.price ? (
                        <>
                          <span className="text-lg font-bold text-gray-900">
                            ₹{product.discounted_price.toFixed(2)}
                          </span>
                          <span className="text-sm line-through text-gray-500">
                            ₹{product.price.toFixed(2)}
                          </span>
                          <span className="text-xs font-medium text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">
                            {product.discount_percentage}% off
                          </span>
                        </>
                      ) : (
                        <span className="text-lg font-bold text-gray-900">
                          ₹{product.price.toFixed(2)}
                        </span>
                      )}
                    </div>
                    <Button
                      onClick={(e) => {
                        e.preventDefault();
                        handleAddToCart(product);
                      }}
                      size="sm"
                      className={`w-full transition-colors ${
                        remainingStock === 0
                          ? "bg-gray-400 hover:bg-gray-400 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700 text-white"
                      }`}
                      disabled={remainingStock === 0}
                    >
                      {remainingStock === 0 ? (
                        <>
                          <AlertCircle className="h-4 w-4 mr-2" />
                          Out of Stock
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Add to Cart
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        );
      })}
    </div>
  );
}
