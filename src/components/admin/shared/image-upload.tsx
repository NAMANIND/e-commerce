"use client";

import { useState } from "react";
import { Upload, X } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  onRemove: () => void;
  folder?: string;
}

export function ImageUpload({
  value,
  onChange,
  onRemove,
  folder = "misc",
}: ImageUploadProps) {
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;

      setLoading(true);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to upload image");
      }

      onChange(result.data.url);
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div className="relative w-[200px] h-[200px] rounded-lg border overflow-hidden">
        {value ? (
          <>
            <Image src={value} alt="Upload" fill className="object-cover" />
            <button
              type="button"
              onClick={onRemove}
              className="absolute top-2 right-2 p-1 rounded-full bg-red-500 text-white hover:bg-red-600"
            >
              <X className="h-4 w-4" />
            </button>
          </>
        ) : (
          <div className="h-full w-full flex flex-col items-center justify-center gap-2 bg-gray-50">
            <Upload className="h-10 w-10 text-gray-400" />
            <p className="text-sm text-gray-600">Upload Image</p>
          </div>
        )}
      </div>
      <input
        type="file"
        accept="image/*"
        onChange={handleUpload}
        disabled={loading}
        className="hidden"
        id="image-upload"
      />
      <label htmlFor="image-upload">
        <Button
          type="button"
          variant="outline"
          disabled={loading}
          className="cursor-pointer"
          asChild
        >
          <span>{loading ? "Uploading..." : "Choose Image"}</span>
        </Button>
      </label>
    </div>
  );
}
