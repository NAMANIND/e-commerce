"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ProductSliderProps {
  title?: string;
  limit?: number;
}

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
  original_price: number;
  discounted_price: number;
  discount_percentage: number;
}

export function ProductSlider({
  title = "Products",
  limit = 10,
}: ProductSliderProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const params = new URLSearchParams({
          limit: limit.toString(),
          sort: "newest",
        });

        const res = await fetch(`/api/products/search?${params}`);
        const data = await res.json();
        setProducts(data.products || []);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [limit]);

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

  const nextSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex + 4 >= products.length ? 0 : prevIndex + 4
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex - 4 < 0 ? Math.max(products.length - 4, 0) : prevIndex - 4
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  const visibleProducts = products.slice(currentIndex, currentIndex + 4);

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={prevSlide}
              className="rounded-full"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={nextSlide}
              className="rounded-full"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {visibleProducts.map((product) => (
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
                  {product.discounted_price < product.original_price && (
                    <div className="flex items-center">
                      <span className="text-sm line-through text-gray-500 mr-2">
                        ₹{product.original_price.toFixed(2)}
                      </span>
                      <span className="text-lg font-bold text-red-600">
                        ₹{product.discounted_price.toFixed(2)}
                      </span>
                      <span className="ml-2 text-sm text-green-600">
                        {product.discount_percentage}% off
                      </span>
                    </div>
                  )}
                  {product.discounted_price >= product.original_price && (
                    <span className="text-lg font-bold text-gray-900">
                      ₹{product.original_price.toFixed(2)}
                    </span>
                  )}
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
      </div>
    </section>
  );
}
