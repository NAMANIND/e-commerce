import { ProductsSearch } from "@/components/products/products-search";
import { ProductsSort } from "@/components/products/products-sort";
import { ProductsFilters } from "@/components/products/products-filters";
import { ProductGrid } from "@/components/products/product-grid";

interface ProductsPageProps {
  searchParams: {
    q?: string;
    sort?: string;
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    page?: string;
  };
}

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  // Parse search params
  const query = searchParams.q ?? "";
  const sort = searchParams.sort ?? "";
  const category = searchParams.category ?? "";
  const minPrice = searchParams.minPrice ?? "";
  const maxPrice = searchParams.maxPrice ?? "";
  const page = Number(searchParams.page) || 1;

  return (
    <main className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">All Products</h1>
          <p className="mt-2 text-gray-600">
            Browse our collection of products
          </p>
        </div>

        {/* Filters and Search */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="w-full sm:w-96">
              <ProductsSearch defaultValue={query} />
            </div>
            <ProductsSort defaultValue={sort} />
          </div>
        </div>

        {/* Content */}
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          <div className="hidden lg:block lg:col-span-3">
            <aside>
              <ProductsFilters
                defaultCategory={category}
                defaultMinPrice={minPrice}
                defaultMaxPrice={maxPrice}
              />
            </aside>
          </div>

          <div className="lg:col-span-9">
            <ProductGrid
              categoryId={category}
              query={query}
              sort={sort}
              minPrice={minPrice}
              maxPrice={maxPrice}
              page={page}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
