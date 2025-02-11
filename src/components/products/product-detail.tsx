"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDispatch } from "react-redux";
import { addToCart } from "@/store/cartSlice";
import { toast } from "react-toastify";

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
    price: number;
    image_url: string;
  }>;
}

interface ProductDetailProps {
  product: Product;
}

export function ProductDetail({ product }: ProductDetailProps) {
  const [quantity, setQuantity] = useState(1);
  const dispatch = useDispatch();

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

  const handleAddToCart = () => {
    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      quantity,
      image_url: product.image_url,
    };
    dispatch(addToCart(cartItem));
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <div className="lg:grid lg:grid-cols-2 lg:gap-x-8">
        {/* Product Image */}
        <div className="aspect-square relative rounded-lg overflow-hidden bg-gray-100">
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Product Info */}
        <div className="mt-10 px-4 sm:mt-16 sm:px-0 lg:mt-0">
          <div className="flex items-center">
            <Link
              href={`/products?category=${product.categories.id}`}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              {product.categories.name}
            </Link>
          </div>

          <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900">
            {product.name}
          </h1>

          <div className="mt-3">
            <h2 className="sr-only">Product information</h2>
            <p className="text-3xl tracking-tight text-gray-900">
              ${product.price.toFixed(2)}
            </p>
          </div>

          <div className="mt-6">
            <h3 className="sr-only">Description</h3>
            <div className="space-y-6 text-base text-gray-700">
              {product.description}
            </div>
          </div>

          <div className="mt-8">
            {product.stock > 0 ? (
              <div className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-gray-200 rounded-md">
                    <button
                      type="button"
                      className="p-2 text-gray-600 hover:text-gray-700"
                      onClick={decreaseQuantity}
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="px-4 py-2 text-gray-900">{quantity}</span>
                    <button
                      type="button"
                      className="p-2 text-gray-600 hover:text-gray-700"
                      onClick={increaseQuantity}
                      disabled={quantity >= product.stock}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  {product.stock < 10 && (
                    <p className="text-sm text-gray-500">
                      Only {product.stock} left in stock
                    </p>
                  )}
                </div>

                <Button
                  onClick={handleAddToCart}
                  className="w-full bg-black hover:bg-gray-900 text-white py-6 rounded-lg text-base"
                >
                  Add to Cart
                </Button>
              </div>
            ) : (
              <Button
                disabled
                className="w-full py-6 bg-gray-200 text-gray-500"
              >
                Out of Stock
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Related Products */}
      {product.related && product.related.length > 0 && (
        <div className="mt-16 pt-16 border-t border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            You might also like
          </h2>

          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {product.related.slice(0, 4).map((relatedProduct) => (
              <Link
                key={relatedProduct.id}
                href={`/products/${relatedProduct.id}`}
                className="group"
              >
                <div className="aspect-square relative rounded-lg overflow-hidden bg-gray-100">
                  <Image
                    src={relatedProduct.image_url}
                    alt={relatedProduct.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <h3 className="mt-2 text-sm text-gray-700">
                  {relatedProduct.name}
                </h3>
                <p className="mt-1 text-sm font-medium text-gray-900">
                  ${relatedProduct.price.toFixed(2)}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
