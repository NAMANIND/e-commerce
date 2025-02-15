"use client";

import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AddressManager from "@/components/profile/address-manager";
import OrderHistory from "@/components/profile/order-history";
import ProfileDetails from "@/components/profile/profile-details";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/products/navbar";

export default function ProfileWrapper() {
  const { user, loading, requireAuth } = useAuth();
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") || "profile";

  useEffect(() => {
    requireAuth();
  }, [requireAuth]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center min-h-[60vh]">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-2">Loading...</h2>
              <p className="text-gray-600">
                Please wait while we load your profile.
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!user) return null;

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Account</h1>
        </div>

        <div className="bg-white rounded-xl shadow-sm">
          <Tabs defaultValue={defaultTab} className="w-full">
            <div className="border-b border-gray-200">
              <TabsList className="flex h-auto p-0 bg-transparent">
                <TabsTrigger
                  value="profile"
                  className="relative h-12 px-4 font-medium text-sm text-gray-500 data-[state=active]:text-indigo-600 data-[state=active]:bg-transparent rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 transition-colors hover:text-gray-700"
                >
                  Profile Details
                </TabsTrigger>
                <TabsTrigger
                  value="addresses"
                  className="relative h-12 px-4 font-medium text-sm text-gray-500 data-[state=active]:text-indigo-600 data-[state=active]:bg-transparent rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 transition-colors hover:text-gray-700"
                >
                  My Addresses
                </TabsTrigger>
                <TabsTrigger
                  value="orders"
                  className="relative h-12 px-4 font-medium text-sm text-gray-500 data-[state=active]:text-indigo-600 data-[state=active]:bg-transparent rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 transition-colors hover:text-gray-700"
                >
                  Order History
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-8">
              <TabsContent value="profile" className="mt-0 outline-none">
                <ProfileDetails user={user} />
              </TabsContent>

              <TabsContent value="addresses" className="mt-0 outline-none">
                <AddressManager userId={user.id} />
              </TabsContent>

              <TabsContent value="orders" className="mt-0 outline-none">
                <OrderHistory userId={user.id} />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </main>
  );
}
