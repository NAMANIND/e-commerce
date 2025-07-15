"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CategoryForm } from "@/components/admin/categories/category-form";
import { toast } from "react-toastify";
import Image from "next/image";
import Link from "next/link";

interface Category {
  id: string;
  name: string;
  description: string;
  image_url: string;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/categories");
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch categories");
      }

      setCategories(result.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to fetch categories"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;

    try {
      const response = await fetch(`/api/admin/categories?id=${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!result.success) {
        if (result.code === "CATEGORY_HAS_PRODUCTS") {
          toast.error(
            "Cannot delete category that has products associated with it. Please remove all products from this category first."
          );
        } else {
          throw new Error(result.error || "Failed to delete category");
        }
        return;
      }

      toast.success("Category deleted successfully");
      fetchCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete category"
      );
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Categories</h2>
        <Link href="/admin/categories/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-[200px] rounded-lg bg-gray-100 animate-pulse"
            />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h3 className="text-gray-500 text-lg">No categories found</h3>
          <Link href="/admin/categories/new">
            <Button className="mt-4" variant="outline">
              Add your first category
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <div
              key={category.id}
              className="bg-white rounded-lg shadow-sm overflow-hidden"
            >
              <div className="aspect-video relative">
                <Image
                  src={
                    category.image_url ||
                    "https://images.unsplash.com/photo-1472851294608-062f824d29cc"
                  }
                  alt={category.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg">{category.name}</h3>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {category.description}
                </p>
                <div className="flex justify-end gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedCategory(category);
                      setIsDialogOpen(true);
                    }}
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(category.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setSelectedCategory(null);
        }}
      >
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          <CategoryForm
            initialData={selectedCategory || undefined}
            onSubmit={() => {
              setIsDialogOpen(false);
              setSelectedCategory(null);
              fetchCategories();
            }}
            onCancel={() => {
              setIsDialogOpen(false);
              setSelectedCategory(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
