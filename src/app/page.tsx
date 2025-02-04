import { HeroSection } from "@/components/home/hero-section";
import { CategoryGrid } from "@/components/home/category-grid";
import { ProductGrid } from "@/components/products/product-grid";

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <CategoryGrid showImages limit={6} />
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Featured Products
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Check out our most popular items
            </p>
          </div>
          <ProductGrid featured limit={6} />
        </div>
      </section>
    </main>
  );
}
