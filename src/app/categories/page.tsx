"use client";

import { Navbar } from "@/components/products/navbar";
import { CategoryGrid } from "@/components/home/category-grid";

export default function CategoriesPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            All Categories
          </h1>
          <p className="text-lg text-gray-600">
            Browse our products by category
          </p>
        </div>

        <CategoryGrid showImages />
      </div>
    </main>
  );
}
