import { HeroSection } from "@/components/home/hero-section";
import { CategorySlider } from "@/components/home/category-grid";
import { ProductGrid } from "@/components/products/product-grid";
import { Navbar } from "@/components/products/navbar";
import {
  ArrowRight,
  Sparkles,
  Grid,
  ShoppingBag,
  Truck,
  Shield,
  RotateCcw,
  MessageCircle,
} from "lucide-react";
import Link from "next/link";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { ImageSlider } from "@/components/home/ImageSlider";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      {/* Categories Section - Updated with consistent spacing */}
      <section className="py-4 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <CategorySlider limit={6} />
        </div>
      </section>

      {/* Hero Section - Re-enabled for better user introduction */}
      {/* <HeroSection /> */}
      {/* Image Slider Section */}
      <ImageSlider />

      {/* Featured Products Section - Improved with consistent styling */}
      <section className="py-12 relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50" />

        {/* Decorative Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
          <div className="absolute top-0 right-0 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                Featured Collection
              </h2>
            </div>
            <Link href="/products?featured=true">
              <Button variant="ghost" className="group text-sm font-medium">
                See All Featured
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
          <ProductGrid featured limit={6} />
        </div>
      </section>

      {/* All Products Section - Updated with consistent spacing and styling */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                Our Collection
              </h2>
            </div>
            <Link href="/products">
              <Button variant="ghost" className="group text-sm font-medium">
                View All Products
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          <ProductGrid limit={6} />

          <div className="mt-12 text-center">
            <Link href="/products">
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full transition-all hover:shadow-lg"
              >
                Explore Full Collection
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Signals Section - New section to build confidence */}
      <section className="py-8 bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="flex flex-col items-center text-center">
              <Truck className="h-8 w-8 text-blue-600 mb-3" />
              <h3 className="text-sm font-medium text-gray-900">
                Free Shipping
              </h3>
              <p className="text-xs text-gray-500 mt-1">On orders over $50</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <Shield className="h-8 w-8 text-blue-600 mb-3" />
              <h3 className="text-sm font-medium text-gray-900">
                Secure Payment
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                100% protected transactions
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <RotateCcw className="h-8 w-8 text-blue-600 mb-3" />
              <h3 className="text-sm font-medium text-gray-900">
                Easy Returns
              </h3>
              <p className="text-xs text-gray-500 mt-1">Within 30 days</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <MessageCircle className="h-8 w-8 text-blue-600 mb-3" />
              <h3 className="text-sm font-medium text-gray-900">
                Customer Support
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                24/7 dedicated support
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
