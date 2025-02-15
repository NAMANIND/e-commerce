"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/products/navbar";
import { ProductGrid } from "@/components/products/product-grid";
import { Filter, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";

interface Category {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
}

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const category = searchParams.get("category");
  const q = searchParams.get("q");
  const featured = searchParams.get("featured");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("");
  const [isFeatured, setIsFeatured] = useState(featured === "true");
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(category || "");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch("/api/categories");
        const data = await response.json();
        if (data.success) {
          setCategories(data.data);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  useEffect(() => {
    if (category) {
      setSelectedCategory(category);
    }
  }, [category]);

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          {/* <h1 className="text-3xl font-bold text-gray-900">All Products</h1> */}
          <Button
            variant="outline"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>

        <div className="flex gap-8">
          {/* Filters - Desktop */}
          <div className={`w-64 flex-shrink-0 hidden lg:block`}>
            <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Price Range</h3>
                <div className="space-y-2">
                  <input
                    type="number"
                    placeholder="Min Price"
                    value={priceRange.min}
                    onChange={(e) =>
                      setPriceRange({ ...priceRange, min: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-md"
                  />
                  <input
                    type="number"
                    placeholder="Max Price"
                    value={priceRange.max}
                    onChange={(e) =>
                      setPriceRange({ ...priceRange, max: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Sort By</h3>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="">Default</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="newest">Newest First</option>
                </select>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Featured</h3>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Show Featured Products</span>
                </label>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Category</h3>
                {loading ? (
                  <div className="animate-pulse h-10 bg-gray-200 rounded-md" />
                ) : (
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <Button
                className="w-full"
                onClick={() => {
                  const params = new URLSearchParams();
                  if (selectedCategory)
                    params.set("category", selectedCategory);
                  if (sortBy) params.set("sort", sortBy);
                  if (priceRange.min) params.set("minPrice", priceRange.min);
                  if (priceRange.max) params.set("maxPrice", priceRange.max);
                  if (isFeatured) params.set("featured", "true");
                  if (q) params.set("q", q);
                  window.location.href = `/products?${params.toString()}`;
                }}
              >
                Apply Filters
              </Button>
            </div>
          </div>

          {/* Mobile Filters */}
          <div
            className={`fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden ${
              isFilterOpen ? "block" : "hidden"
            }`}
            onClick={() => setIsFilterOpen(false)}
          >
            <div
              className="absolute right-0 top-0 h-full w-80 bg-white p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold">Filters</h2>
                  <Button
                    variant="ghost"
                    onClick={() => setIsFilterOpen(false)}
                  >
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>

                {/* Price Range */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Price Range</h3>
                  <div className="space-y-2">
                    <input
                      type="number"
                      placeholder="Min Price"
                      value={priceRange.min}
                      onChange={(e) =>
                        setPriceRange({ ...priceRange, min: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded-md"
                    />
                    <input
                      type="number"
                      placeholder="Max Price"
                      value={priceRange.max}
                      onChange={(e) =>
                        setPriceRange({ ...priceRange, max: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                </div>

                {/* Sort By */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Sort By</h3>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="">Default</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="newest">Newest First</option>
                  </select>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Featured</h3>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Show Featured Products</span>
                  </label>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Category</h3>
                  {loading ? (
                    <div className="animate-pulse h-10 bg-gray-200 rounded-md" />
                  ) : (
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md"
                    >
                      <option value="">All Categories</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <Button
                  className="w-full"
                  onClick={() => {
                    const params = new URLSearchParams();
                    if (selectedCategory)
                      params.set("category", selectedCategory);
                    if (sortBy) params.set("sort", sortBy);
                    if (priceRange.min) params.set("minPrice", priceRange.min);
                    if (priceRange.max) params.set("maxPrice", priceRange.max);
                    if (isFeatured) params.set("featured", "true");
                    if (q) params.set("q", q);
                    window.location.href = `/products?${params.toString()}`;
                    setIsFilterOpen(false);
                  }}
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            <ProductGrid
              query={q || ""}
              sort={sortBy}
              minPrice={priceRange.min}
              maxPrice={priceRange.max}
              categoryId={selectedCategory}
              featured={isFeatured}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
