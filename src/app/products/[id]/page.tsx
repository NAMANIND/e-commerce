import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/products/product-detail";
import { supabase } from "@/lib/supabase";
import { Navbar } from "@/components/products/navbar";
import Head from "next/head";

interface ProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

async function getProduct(id: string) {
  const { data: product, error } = await supabase
    .from("products")
    .select(
      `
      *,
      categories (
        id,
        name
      )
    `
    )
    .eq("id", id)
    .single();

  if (error || !product) {
    return null;
  }

  return product;
}

export default async function ProductPage({ params }: ProductPageProps) {
  // Await the params before destructuring
  const resolvedParams = await params;
  const { id } = resolvedParams;

  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  return (
    <>
      <Head>
        <title>{product.name} - Your Store Name</title>
        <meta name="description" content={product.description} />
        <meta property="og:title" content={product.name} />
        <meta property="og:description" content={product.description} />
        <meta property="og:image" content={product.image_url} />
        {/* <meta
          property="og:url"
          content={`https://yourstore.com/products/${product.id}`}
        /> */}
      </Head>
      <main className="px-4 sm:px-6 lg:px-8 py-8">
        <Navbar />
        <div className="max-w-7xl mx-auto">
          <ProductDetail product={product} />
        </div>
      </main>
    </>
  );
}
