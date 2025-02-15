import { HeroSection } from "@/components/home/hero-section";
import { CategorySlider } from "@/components/home/category-grid";
import { ProductGrid } from "@/components/products/product-grid";
import { Navbar } from "@/components/products/navbar";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      {/* <HeroSection /> */}

      {/* Categories Section */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto">
          <CategorySlider limit={6} />
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-20 relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50" />

        {/* Decorative Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
          <div className="absolute top-0 right-0 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-600 tracking-wide uppercase">
                Featured Collection
              </span>
            </div>
            <Link href="/products?featured=true">
              <Button variant="ghost" className="group">
                Explore Collection
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
          <ProductGrid featured limit={6} />
        </div>
      </section>

      {/* All Products Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative">
            {/* Decorative line */}
            <div
              className="absolute inset-0 flex items-center"
              aria-hidden="true"
            >
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-4 text-sm text-gray-500 uppercase tracking-wider">
                Discover Our Collection
              </span>
            </div>
          </div>

          <div className="mt-12">
            <ProductGrid limit={6} />
          </div>

          <div className="mt-16 text-center">
            <Link href="/products">
              <Button
                size="lg"
                className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-6 rounded-full transition-all hover:shadow-lg"
              >
                View All Products
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Replace newsletter section with Footer */}
      <Footer />
    </main>
  );
}
