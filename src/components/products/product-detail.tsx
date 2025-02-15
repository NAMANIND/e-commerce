"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Tag, Truck, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDispatch } from "react-redux";
import { addToCart } from "@/store/cartSlice";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

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
  sku: string;
  weight: number;
  dimensions: string;
  discount_percentage: number;
  discounted_price: number;
}

interface ProductDetailProps {
  product: Product;
}

export function ProductDetail({ product }: ProductDetailProps) {
  const [quantity, setQuantity] = useState(1);
  const dispatch = useDispatch();
  const router = useRouter();

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
      price:
        product.discounted_price > 0 ? product.discounted_price : product.price,
      discounted_price: product.discounted_price,
      quantity,
      image_url: product.image_url,
      stock: product.stock,
    };
    dispatch(addToCart(cartItem));
    toast.success(`${product.name} added to cart!`);
    router.push("/cart");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 sm:py-12 lg:py-16">
      <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 bg-white rounded-2xl overflow-hidden shadow-md">
        {/* Product Image */}
        <div className="aspect-square relative overflow-hidden bg-gray-50">
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover hover:scale-105 transition-transform duration-300"
            priority
          />
        </div>

        {/* Product Info */}
        <div className="p-6 sm:p-8 lg:p-10 flex flex-col h-full">
          <div>
            <Link
              href={`/products?category=${product.categories.id}`}
              className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
            >
              <Tag className="h-4 w-4 mr-1" />
              {product.categories.name}
            </Link>
          </div>

          <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-900">
            {product.name}
          </h1>

          <div className="mt-4 flex items-center">
            {product.discount_percentage > 0 ? (
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold text-gray-900">
                  ${product.discounted_price.toFixed(2)}
                </span>
                <span className="text-lg line-through text-gray-500">
                  ${product.price.toFixed(2)}
                </span>
                <span className="ml-2 px-2 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full">
                  {product.discount_percentage}% OFF
                </span>
              </div>
            ) : (
              <span className="text-3xl font-bold text-gray-900">
                ${product.price.toFixed(2)}
              </span>
            )}
          </div>

          <div className="mt-6 text-base text-gray-700 leading-relaxed">
            {product.description}
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start">
              <Package className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Product Details</p>
                <p className="mt-1">
                  <span className="text-gray-500">SKU:</span> {product.sku}
                </p>
                <p>
                  <span className="text-gray-500">Weight:</span>{" "}
                  {product.weight} kg
                </p>
                <p>
                  <span className="text-gray-500">Dimensions:</span>{" "}
                  {product.dimensions}
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <Truck className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">
                  Shipping Information
                </p>
                <p className="mt-1">Free shipping on orders over $50</p>
                <p>Usually ships within 1-2 business days</p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            {product.stock > 0 ? (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      type="button"
                      className="p-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                      onClick={decreaseQuantity}
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="px-4 py-2 text-base font-medium text-gray-900 min-w-[40px] text-center">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      className="p-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                      onClick={increaseQuantity}
                      disabled={quantity >= product.stock}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  {product.stock < 10 && (
                    <p className="text-sm text-amber-600 font-medium flex items-center">
                      <span className="inline-block w-2 h-2 bg-amber-500 rounded-full mr-1.5"></span>
                      Only {product.stock} left in stock
                    </p>
                  )}
                </div>

                <Button
                  onClick={handleAddToCart}
                  disabled={quantity > product.stock}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-xl text-base font-semibold shadow-sm transition-colors flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  <ShoppingBag className="h-5 w-5 mr-2" />
                  {quantity > product.stock ? "Out of Stock" : "Add to Cart"}
                </Button>
              </div>
            ) : (
              <Button
                disabled
                className="w-full py-6 bg-gray-100 text-gray-500 rounded-xl"
              >
                Out of Stock
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Related Products */}
      {product.related && product.related.length > 0 && (
        <div className="mt-16">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            You might also like
          </h2>

          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
            {product.related.slice(0, 4).map((relatedProduct) => (
              <Link
                key={relatedProduct.id}
                href={`/products/${relatedProduct.id}`}
                className="group"
              >
                <div className="aspect-square relative rounded-xl overflow-hidden bg-gray-100 shadow-sm">
                  <Image
                    src={relatedProduct.image_url}
                    alt={relatedProduct.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h3 className="mt-3 text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                  {relatedProduct.name}
                </h3>
                <p className="mt-1 text-sm font-semibold text-gray-900">
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
