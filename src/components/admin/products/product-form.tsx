"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "react-toastify";
import { ImageUpload } from "@/components/admin/shared/image-upload";

interface Category {
  id: string;
  name: string;
}

interface ProductFormProps {
  categories: Category[];
  initialData?: {
    id?: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    category_id: string;
    image_url: string;
    is_featured: boolean;
    sku?: string;
    weight?: number;
    dimensions?: string;
    discount_percentage?: number;
    discounted_price?: number;
  };
  onSubmit: () => void;
  onCancel: () => void;
}

export function ProductForm({
  categories,
  initialData,
  onSubmit,
  onCancel,
}: ProductFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    price: initialData?.price || 0,
    discount_percentage: initialData?.discount_percentage || 0,
    discounted_price: initialData?.discounted_price || 0,
    stock: initialData?.stock || 0,
    category_id: initialData?.category_id || "",
    image_url: initialData?.image_url || "",
    is_featured: initialData?.is_featured || false,
    sku: initialData?.sku || "",
    weight: initialData?.weight || 0,
    dimensions: initialData?.dimensions || "",
  });

  const calculateDiscountedPrice = () => {
    const discount = (formData.price * formData.discount_percentage) / 100;
    return formData.price - discount;
  };

  const handlePreview = () => {
    alert(
      `Preview:\nName: ${formData.name}\nOriginal Price: ₹${
        formData.price
      }\nDiscount: ${
        formData.discount_percentage
      }%\nDiscounted Price: ₹${calculateDiscountedPrice()}`
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = initialData?.id
        ? "/api/admin/products"
        : "/api/admin/products";
      const method = initialData?.id ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          initialData?.id
            ? {
                ...formData,
                id: initialData.id,
                discounted_price: calculateDiscountedPrice(),
              }
            : { ...formData, discounted_price: calculateDiscountedPrice() }
        ),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to save product");
      }

      toast.success(
        `Product ${initialData?.id ? "updated" : "created"} successfully`
      );
      onSubmit();
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to save product"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            rows={4}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="price">Price</Label>
            <Input
              id="price"
              type="number"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  price: parseFloat(e.target.value),
                })
              }
              required
            />
          </div>
          <div>
            <Label htmlFor="discount_percentage">Discount (%)</Label>
            <Input
              id="discount_percentage"
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={formData.discount_percentage}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  discount_percentage: parseFloat(e.target.value),
                })
              }
              required
            />
          </div>
          <div>
            <Label htmlFor="discounted_price">Discounted Price</Label>
            <Input
              id="discounted_price"
              type="number"
              min="0"
              step="0.01"
              value={calculateDiscountedPrice()}
              readOnly
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="stock">Stock</Label>
            <Input
              id="stock"
              type="number"
              min="0"
              value={formData.stock}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  stock: parseInt(e.target.value),
                })
              }
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="category">Category</Label>
          <Select
            value={formData.category_id}
            onValueChange={(value) =>
              setFormData({ ...formData, category_id: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories?.map((category: Category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Image</Label>
          <ImageUpload
            value={formData.image_url}
            onChange={(url) => setFormData({ ...formData, image_url: url })}
            onRemove={() => setFormData({ ...formData, image_url: "" })}
            folder="product-images"
          />
        </div>

        <div className="flex items-center gap-2">
          <Switch
            checked={formData.is_featured}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, is_featured: checked })
            }
          />
          <Label>Featured Product</Label>
        </div>

        <div className="space-y-4 border-t pt-4">
          <h3 className="font-medium">Additional Details</h3>
          <div>
            <Label htmlFor="sku">SKU</Label>
            <Input
              id="sku"
              value={formData.sku}
              onChange={(e) =>
                setFormData({ ...formData, sku: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                min="0"
                step="0.01"
                value={formData.weight}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    weight: parseFloat(e.target.value),
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="dimensions">Dimensions</Label>
              <Input
                id="dimensions"
                placeholder="L x W x H"
                value={formData.dimensions}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    dimensions: e.target.value,
                  })
                }
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handlePreview}
          disabled={loading}
        >
          Preview
        </Button>
        <Button type="submit" disabled={loading}>
          {loading
            ? "Saving..."
            : initialData?.id
            ? "Update Product"
            : "Create Product"}
        </Button>
      </div>
    </form>
  );
}
