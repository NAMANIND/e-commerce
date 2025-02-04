"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: {
    name: string;
    id: string;
  };
}

interface ProductsGridProps {
  searchParams: {
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
    query?: string;
    page?: string;
  };
}

export function ProductsGrid({ searchParams }: ProductsGridProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const page = Number(searchParams.page) || 1;
  const limit = 12;

  useEffect(() => {
    async function fetchProducts() {
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          ...(searchParams.category && { category: searchParams.category }),
          ...(searchParams.minPrice && { minPrice: searchParams.minPrice }),
          ...(searchParams.maxPrice && { maxPrice: searchParams.maxPrice }),
          ...(searchParams.sort && { sort: searchParams.sort }),
          ...(searchParams.query && { q: searchParams.query }),
        });

        const res = await fetch(`/api/products/search?${params}`);
        const data = await res.json();
        setProducts(data.products || []);
        setTotalCount(data.totalCount || 0);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [searchParams, page]);

  async function addToCart(productId: string) {
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product_id: productId,
          quantity: 1,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to add to cart");
      }

      // TODO: Show success toast
    } catch (error) {
      console.error("Error adding to cart:", error);
      // TODO: Show error toast
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: limit }).map((_, i) => (
          <div
            key={i}
            className="aspect-square bg-gray-100 rounded-lg animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No products found
        </h3>
        <p className="text-gray-500">
          Try adjusting your search or filter criteria
        </p>
      </div>
    );
  }

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <Card key={product.id} className="group">
            <Link href={`/products/${product.id}`}>
              <div className="aspect-square relative overflow-hidden">
                <Image
                  src={product.image_url}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            </Link>
            <CardContent className="p-4">
              <Link
                href={`/products?category=${product.category.id}`}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                {product.category.name}
              </Link>
              <Link href={`/products/${product.id}`}>
                <h3 className="font-semibold text-gray-900 mt-1 group-hover:text-blue-600">
                  {product.name}
                </h3>
              </Link>
              <p className="text-gray-600 mt-1 line-clamp-2">
                {product.description}
              </p>
              <div className="flex items-center justify-between mt-4">
                <span className="text-lg font-bold text-gray-900">
                  ${product.price.toFixed(2)}
                </span>
                <Button
                  onClick={() => addToCart(product.id)}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          baseUrl="/products"
          searchParams={searchParams}
        />
      )}
    </div>
  );
}
