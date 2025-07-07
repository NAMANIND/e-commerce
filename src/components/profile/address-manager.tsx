"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { toast } from "react-toastify";
import {
  HomeIcon,
  BuildingOfficeIcon,
  StarIcon as StarSolidIcon,
} from "@heroicons/react/24/solid";
import { StarIcon as StarOutlineIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

interface Address {
  id: string;
  name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
  type: string;
}

interface AddressManagerProps {
  userId: string;
}

export default function AddressManager({ userId }: AddressManagerProps) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<Address>>({
    name: "",
    phone: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "",
    is_default: false,
    type: "home",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const router = useRouter();

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      const { data, error } = await supabase
        .from("addresses")
        .select("*")
        .eq("user_id", userId)
        .order("is_default", { ascending: false });

      if (error) throw error;
      setAddresses(data || []);
    } catch (error) {
      console.error("Error loading addresses:", error);
      toast.error("Failed to load addresses");
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) newErrors.name = "Name is required";
    if (!formData.phone?.trim()) newErrors.phone = "Phone is required";
    if (!formData.address_line1?.trim())
      newErrors.address_line1 = "Address is required";
    if (!formData.city?.trim()) newErrors.city = "City is required";
    if (!formData.state?.trim()) newErrors.state = "State is required";
    if (!formData.postal_code?.trim())
      newErrors.postal_code = "Postal code is required";
    if (!formData.country?.trim()) newErrors.country = "Country is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    try {
      // If this is the first address, make it default
      const shouldBeDefault = addresses.length === 0;

      const { data, error } = await supabase
        .from("addresses")
        .insert([
          {
            ...formData,
            user_id: userId,
            is_default: shouldBeDefault,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setAddresses([...addresses, data]);
      setShowForm(false);
      setFormData({
        name: "",
        phone: "",
        address_line1: "",
        address_line2: "",
        city: "",
        state: "",
        postal_code: "",
        country: "",
        is_default: false,
        type: "home",
      });
      toast.success("Address added successfully");
      // redirect to checkout page if needed
      router.push("/checkout");
    } catch (error) {
      console.error("Error adding address:", error);
      toast.error("Failed to add address");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const addressToDelete = addresses.find((addr) => addr.id === id);
    if (!addressToDelete) return;

    if (addressToDelete.is_default) {
      toast.error(
        "Cannot delete default address. Please set another address as default first."
      );
      return;
    }

    if (!confirm("Are you sure you want to delete this address?")) return;

    try {
      const { error } = await supabase.from("addresses").delete().eq("id", id);

      if (error) throw error;
      setAddresses(addresses.filter((addr) => addr.id !== id));
      toast.success("Address deleted successfully");
    } catch (error) {
      console.error("Error deleting address:", error);
      toast.error("Failed to delete address");
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      // First, unset all defaults
      await supabase
        .from("addresses")
        .update({ is_default: false })
        .eq("user_id", userId);

      // Then set the new default
      const { error } = await supabase
        .from("addresses")
        .update({ is_default: true })
        .eq("id", id);

      if (error) throw error;

      // Update local state
      setAddresses(
        addresses.map((addr) => ({
          ...addr,
          is_default: addr.id === id,
        }))
      );

      toast.success("Default address updated");
    } catch (error) {
      console.error("Error updating default address:", error);
      toast.error("Failed to update default address");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">Loading addresses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">My Addresses</h2>
        <Button
          onClick={() => setShowForm(!showForm)}
          variant={showForm ? "outline" : "default"}
        >
          {showForm ? "Cancel" : "Add New Address"}
        </Button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="space-y-4 bg-gray-50 p-6 rounded-lg border border-gray-100"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label
                htmlFor="name"
                className="text-sm font-medium text-gray-700"
              >
                Full Name *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label
                htmlFor="phone"
                className="text-sm font-medium text-gray-700"
              >
                Phone Number *
              </Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className={errors.phone ? "border-red-500" : ""}
              />
              {errors.phone && (
                <p className="text-sm text-red-500">{errors.phone}</p>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="type" className="text-sm font-medium text-gray-700">
              Address Type
            </Label>
            <div className="flex space-x-4 mt-1">
              <Button
                type="button"
                variant={formData.type === "home" ? "default" : "outline"}
                className="flex items-center space-x-2"
                onClick={() => setFormData({ ...formData, type: "home" })}
              >
                <HomeIcon className="h-4 w-4" />
                <span>Home</span>
              </Button>
              <Button
                type="button"
                variant={formData.type === "office" ? "default" : "outline"}
                className="flex items-center space-x-2"
                onClick={() => setFormData({ ...formData, type: "office" })}
              >
                <BuildingOfficeIcon className="h-4 w-4" />
                <span>Office</span>
              </Button>
            </div>
          </div>

          <div className="space-y-1">
            <Label
              htmlFor="address_line1"
              className="text-sm font-medium text-gray-700"
            >
              Address Line 1 *
            </Label>
            <Input
              id="address_line1"
              value={formData.address_line1}
              onChange={(e) =>
                setFormData({ ...formData, address_line1: e.target.value })
              }
              className={errors.address_line1 ? "border-red-500" : ""}
            />
            {errors.address_line1 && (
              <p className="text-sm text-red-500">{errors.address_line1}</p>
            )}
          </div>

          <div className="space-y-1">
            <Label
              htmlFor="address_line2"
              className="text-sm font-medium text-gray-700"
            >
              Address Line 2 (Optional)
            </Label>
            <Input
              id="address_line2"
              value={formData.address_line2}
              onChange={(e) =>
                setFormData({ ...formData, address_line2: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label
                htmlFor="city"
                className="text-sm font-medium text-gray-700"
              >
                City *
              </Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
                className={errors.city ? "border-red-500" : ""}
              />
              {errors.city && (
                <p className="text-sm text-red-500">{errors.city}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label
                htmlFor="state"
                className="text-sm font-medium text-gray-700"
              >
                State *
              </Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) =>
                  setFormData({ ...formData, state: e.target.value })
                }
                className={errors.state ? "border-red-500" : ""}
              />
              {errors.state && (
                <p className="text-sm text-red-500">{errors.state}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label
                htmlFor="postal_code"
                className="text-sm font-medium text-gray-700"
              >
                Postal Code *
              </Label>
              <Input
                id="postal_code"
                value={formData.postal_code}
                onChange={(e) =>
                  setFormData({ ...formData, postal_code: e.target.value })
                }
                className={errors.postal_code ? "border-red-500" : ""}
              />
              {errors.postal_code && (
                <p className="text-sm text-red-500">{errors.postal_code}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label
                htmlFor="country"
                className="text-sm font-medium text-gray-700"
              >
                Country *
              </Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) =>
                  setFormData({ ...formData, country: e.target.value })
                }
                className={errors.country ? "border-red-500" : ""}
              />
              {errors.country && (
                <p className="text-sm text-red-500">{errors.country}</p>
              )}
            </div>
          </div>

          <div className="pt-4">
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Adding..." : "Add Address"}
            </Button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 gap-4">
        {addresses.map((address) => (
          <div
            key={address.id}
            className={`relative border rounded-lg p-4 transition-all duration-200 ${
              address.is_default
                ? "border-indigo-200 bg-indigo-50/50"
                : "hover:border-gray-300"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                {address.type === "home" ? (
                  <HomeIcon className="h-5 w-5 text-gray-500 mt-1" />
                ) : (
                  <BuildingOfficeIcon className="h-5 w-5 text-gray-500 mt-1" />
                )}
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-medium text-gray-900">
                      {address.name}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-500">{address.phone}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSetDefault(address.id)}
                  className={`flex items-center space-x-1 ${
                    address.is_default
                      ? "text-yellow-600 hover:text-yellow-700"
                      : "text-gray-500 hover:text-gray-600"
                  }`}
                  title={
                    address.is_default
                      ? "Default address"
                      : "Set as default address"
                  }
                >
                  {address.is_default ? (
                    <>
                      <StarSolidIcon className="h-5 w-5 text-yellow-400" />
                      <span className="text-sm">Default</span>
                    </>
                  ) : (
                    <>
                      <StarOutlineIcon className="h-5 w-5" />
                      <span className="text-sm">Make Default</span>
                    </>
                  )}
                </Button>
                {!address.is_default && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(address.id)}
                  >
                    Delete
                  </Button>
                )}
              </div>
            </div>
            <div className="mt-2 ml-8 text-sm text-gray-600">
              <p>{address.address_line1}</p>
              {address.address_line2 && <p>{address.address_line2}</p>}
              <p>
                {address.city}, {address.state} {address.postal_code}
              </p>
              <p>{address.country}</p>
            </div>
            {/* {address.is_default && (
              <div className="absolute top-0 right-0 w-24 h-24 overflow-hidden">
                <div className="bg-indigo-500 text-white text-xs font-semibold py-1 text-center transform rotate-45 translate-y-8 translate-x-6">
                  Default
                </div>
              </div>
            )} */}
          </div>
        ))}
      </div>

      {addresses.length === 0 && !showForm && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900">
            No addresses yet
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Add your first address to get started
          </p>
          <Button onClick={() => setShowForm(true)} className="mt-4">
            Add New Address
          </Button>
        </div>
      )}
    </div>
  );
}
