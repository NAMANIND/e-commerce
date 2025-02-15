"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

interface Product {
  id: string;
  name: string;
  stock: number;
  price: number;
  image_url?: string;
}

export default function LowStockProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLowStockProducts();
  }, []);

  const loadLowStockProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, stock, price, image_url")
        .lt("stock", 10) // Products with stock less than 10
        .order("stock", { ascending: true })
        .limit(5);

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error loading low stock products:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStockColor = (stock: number) => {
    if (stock === 0) return "bg-red-100 text-red-800";
    if (stock < 5) return "bg-orange-100 text-orange-800";
    return "bg-yellow-100 text-yellow-800";
  };

  if (loading) {
    return <div>Loading low stock products...</div>;
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead className="text-right">Price</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell className="flex items-center gap-3">
                {product.image_url && (
                  <div className="relative w-10 h-10">
                    <Image
                      src={product.image_url}
                      alt={product.name}
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                )}
                <span className="font-medium">{product.name}</span>
              </TableCell>
              <TableCell>
                <Badge
                  className={`${getStockColor(product.stock)}`}
                  variant="secondary"
                >
                  {product.stock} left
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                ₹{product.price.toFixed(2)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
