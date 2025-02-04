"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
// import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  stock: number;
  categories: {
    name: string;
    id: string;
  };
  related: Array<{
    id: string;
    name: string;
    description: string;
    price: number;
    image_url: string;
    categories: {
      name: string;
      id: string;
    };
  }>;
}

interface ProductDetailProps {
  product: Product;
}

export function ProductDetail({ product }: ProductDetailProps) {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  function increaseQuantity() {
    if (quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  }

  function decreaseQuantity() {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  }

  async function addToCart() {
    try {
      setLoading(true);
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product_id: product.id,
          quantity,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to add to cart");
      }

      // TODO: Show success toast
    } catch (error) {
      console.error("Error adding to cart:", error);
      // TODO: Show error toast
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      // initial={{ opacity: 0, y: 20 }}
      // animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto px-4 py-8 space-y-12"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Image */}
        <div
          // whileHover={{ scale: 1.02 }}
          className="aspect-square relative rounded-2xl overflow-hidden shadow-2xl"
        >
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover"
            priority
          />
          {product.stock < 10 && product.stock > 0 && (
            <Badge className="absolute top-4 right-4 bg-orange-500">
              Only {product.stock} left
            </Badge>
          )}
        </div>

        {/* Product Details */}
        <div className="space-y-8 lg:pt-8">
          <div className="space-y-4">
            <Link
              href={`/products?category=${product.categories.id}`}
              className="inline-block px-4 py-2 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
            >
              {product.categories.name}
            </Link>
            <h1 className="text-4xl font-bold text-gray-900">{product.name}</h1>
            <p className="text-3xl font-bold text-blue-600">
              ${product.price.toFixed(2)}
            </p>
          </div>

          <div className="bg-gray-50 rounded-xl p-6 space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Description</h2>
            <p className="text-gray-600 leading-relaxed">
              {product.description}
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Quantity</h2>
            <div className="flex items-center space-x-6 bg-gray-50 p-4 rounded-lg">
              <Button
                variant="outline"
                size="icon"
                onClick={decreaseQuantity}
                disabled={quantity <= 1}
                className="hover:bg-blue-50"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="text-2xl font-medium text-gray-900 w-12 text-center">
                {quantity}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={increaseQuantity}
                disabled={quantity >= product.stock}
                className="hover:bg-blue-50"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Button
            onClick={addToCart}
            disabled={loading || product.stock === 0}
            className="w-full h-14 text-lg bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            <ShoppingCart className="h-6 w-6 mr-2" />
            {product.stock === 0 ? (
              <span className="text-red-200">Out of Stock</span>
            ) : loading ? (
              <span className="flex items-center">
                <div
                  // animate={{ rotate: 360 }}
                  // transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="mr-2 h-5 w-5 border-2 border-white border-t-transparent rounded-full"
                />
                Adding to Cart...
              </span>
            ) : (
              "Add to Cart"
            )}
          </Button>
        </div>
      </div>

      {/* Related Products */}
      {product.related && product.related.length > 0 && (
        <div className="pt-12 border-t">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Related Products
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {product.related.slice(0, 4).map((relatedProduct) => (
              <div
                key={relatedProduct.id}
                // whileHover={{ y: -8 }}
                // transition={{ duration: 0.2 }}
              >
                <Link href={`/products/${relatedProduct.id}`}>
                  <Card className="group overflow-hidden">
                    <div className="aspect-square relative overflow-hidden">
                      <Image
                        src={relatedProduct.image_url}
                        alt={relatedProduct.name}
                        fill
                        className="object-cover transform group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="font-semibold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
                        {relatedProduct.name}
                      </h3>
                      <p className="text-xl font-bold text-blue-600 mt-2">
                        ${relatedProduct.price.toFixed(2)}
                      </p>
                    </div>
                  </Card>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
