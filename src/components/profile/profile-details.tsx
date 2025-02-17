"use client";

import { useState } from "react";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { toast } from "react-toastify";

interface ProfileDetailsProps {
  user: User;
}

export default function ProfileDetails({ user }: ProfileDetailsProps) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(user.user_metadata?.full_name || "");
  const [phone, setPhone] = useState(user.user_metadata?.phone || "");
  const [errors, setErrors] = useState({ name: "", phone: "" });

  const validateForm = () => {
    const newErrors = { name: "", phone: "" };
    let isValid = true;

    if (!name.trim()) {
      newErrors.name = "Full name is required";
      isValid = false;
    }

    if (!phone.trim()) {
      newErrors.phone = "Phone number is required";
      isValid = false;
    } else if (!/^[\d\s+()-]{10,}$/.test(phone.trim())) {
      newErrors.phone = "Please enter a valid phone number";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: name.trim(),
          phone: phone.trim(),
        },
      });

      if (error) throw error;
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-1">
        <Label htmlFor="email" className="text-sm font-medium text-gray-700">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          value={user.email}
          disabled
          className="bg-gray-50 text-gray-600"
        />
        <p className="text-xs text-gray-500">Your email cannot be changed</p>
      </div>

      <div className="space-y-1">
        <Label htmlFor="name" className="text-sm font-medium text-gray-700">
          Full Name *
        </Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (errors.name) setErrors({ ...errors, name: "" });
          }}
          placeholder="Enter your full name"
          className={errors.name ? "border-red-500" : ""}
        />
        {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
      </div>

      <div className="space-y-1">
        <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
          Phone Number *
        </Label>
        <Input
          id="phone"
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value);
            if (errors.phone) setErrors({ ...errors, phone: "" });
          }}
          placeholder="Enter your phone number"
          className={errors.phone ? "border-red-500" : ""}
        />
        {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
        <p className="text-xs text-gray-500">
          Format: +1 234 567 8900 or (123) 456-7890
        </p>
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Updating..." : "Update Profile"}
      </Button>
    </form>
  );
}
