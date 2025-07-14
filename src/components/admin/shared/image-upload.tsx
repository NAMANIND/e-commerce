"use client";

import { useState, useRef } from "react";
import { Upload, X } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { toast } from "react-toastify";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  onRemove: () => void;
  folder?: string;
  maxSize?: number; // in MB
  acceptedTypes?: string[];
}

export function ImageUpload({
  value,
  onChange,
  onRemove,
  folder = "misc",
  maxSize = 10, // 5MB default
  acceptedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"],
}: ImageUploadProps) {
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Check file type
    if (!acceptedTypes.includes(file.type)) {
      return `Invalid file type. Please select: ${acceptedTypes
        .map((type) => type.split("/")[1])
        .join(", ")}`;
    }

    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      return `File too large. Maximum size: ${maxSize}MB (current: ${(
        file.size /
        1024 /
        1024
      ).toFixed(2)}MB)`;
    }

    // Check for empty file
    if (file.size === 0) {
      return "File appears to be empty";
    }

    // Check filename length
    if (file.name.length > 255) {
      return "Filename too long";
    }

    return null;
  };

  const uploadFile = async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setLoading(true);
    setUploadProgress(0);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error("Authentication required. Please log in again.");
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        let errorMessage = `Upload failed with status ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          // If we can't parse the error response, use the default message
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to upload image");
      }

      if (!result.data?.url) {
        throw new Error("Invalid response: missing image URL");
      }

      onChange(result.data.url);
      toast.success("Image uploaded successfully!");
    } catch (error) {
      console.error("Error uploading image:", error);

      if (error instanceof Error) {
        if (error.name === "AbortError") {
          toast.error("Upload timed out. Please try again.");
        } else {
          toast.error(error.message);
        }
      } else {
        toast.error("An unexpected error occurred while uploading");
      }
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    await uploadFile(file);

    // Reset the input value to allow re-uploading the same file
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragIn = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setDragActive(true);
    }
  };

  const handleDragOut = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0 && files[0].type.startsWith("image/")) {
      uploadFile(files[0]);
    } else if (files.length > 0) {
      toast.error("Please drop an image file");
    }
  };

  const handleRemove = () => {
    onRemove();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    toast.success("Image removed");
  };

  const handleAreaClick = () => {
    if (!loading && !value && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div
        className={`relative w-[200px] h-[200px] rounded-lg border-2 border-dashed overflow-hidden transition-all duration-200 ${
          dragActive
            ? "border-blue-500 bg-blue-50"
            : value
            ? "border-gray-300"
            : "border-gray-300 hover:border-gray-400 cursor-pointer"
        }`}
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleAreaClick}
      >
        {value ? (
          <>
            <Image
              src={value}
              alt="Upload"
              fill
              className="object-cover"
              onError={() => {
                toast.error("Failed to load image");
                onRemove();
              }}
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 p-1 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors z-10"
              aria-label="Remove image"
            >
              <X className="h-4 w-4" />
            </button>
            {loading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="text-white text-sm">
                  {uploadProgress > 0 ? `${uploadProgress}%` : "Processing..."}
                </div>
              </div>
            )}
          </>
        ) : (
          <div
            className={`h-full w-full flex flex-col items-center justify-center gap-2 transition-colors ${
              dragActive ? "bg-blue-50" : "bg-gray-50 hover:bg-gray-100"
            }`}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
                <p className="text-sm text-gray-600">
                  {uploadProgress > 0
                    ? `Uploading... ${uploadProgress}%`
                    : "Processing..."}
                </p>
              </>
            ) : (
              <>
                <Upload
                  className={`h-10 w-10 ${
                    dragActive ? "text-blue-500" : "text-gray-400"
                  }`}
                />
                <p className="text-sm text-gray-600 text-center">
                  {dragActive
                    ? "Drop image here"
                    : "Drag & drop or click to upload"}
                </p>
                <p className="text-xs text-gray-400">
                  Max {maxSize}MB •{" "}
                  {acceptedTypes.map((type) => type.split("/")[1]).join(", ")}
                </p>
              </>
            )}
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.join(",")}
        onChange={handleUpload}
        disabled={loading}
        className="hidden"
        id="image-upload"
      />

      <div className="flex flex-col gap-2">
        <label htmlFor="image-upload">
          <Button
            type="button"
            variant="outline"
            disabled={loading}
            className="cursor-pointer"
            asChild
          >
            <span>
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                  Uploading...
                </>
              ) : (
                "Choose Image"
              )}
            </span>
          </Button>
        </label>

        {value && !loading && (
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleRemove}
            className="w-full"
          >
            <X className="h-4 w-4 mr-1" />
            Remove
          </Button>
        )}
      </div>
    </div>
  );
}
