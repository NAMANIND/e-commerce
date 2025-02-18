"use client";

import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AddressManager from "@/components/profile/address-manager";
import OrderHistory from "@/components/profile/order-history";
import ProfileDetails from "@/components/profile/profile-details";
import { useSearchParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/products/navbar";
import {
  UserIcon,
  ShoppingBagIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";

export default function ProfileWrapper() {
  const { user, loading, requireAuth } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const defaultTab = searchParams.get("tab") || "account";
  const isCheckoutFlow = searchParams.get("checkout") === "true";

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
        {isCheckoutFlow && (
          <div className="mb-8 bg-indigo-50 border border-indigo-100 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-indigo-900">
                  Complete Your Profile
                </h2>
                <p className="text-indigo-700 mt-1">
                  Please ensure your profile details and shipping address are up
                  to date before proceeding to checkout.
                </p>
              </div>
              <button
                onClick={() => router.push("/checkout")}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Proceed to Checkout
                <ArrowRightIcon className="ml-2 -mr-1 h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Account</h1>
        </div>

        <Tabs defaultValue={defaultTab} className="w-full">
          <div className="border-b border-gray-200 mb-8">
            <TabsList className="flex h-auto p-0 bg-transparent">
              <TabsTrigger
                value="account"
                className="relative h-12 px-8 font-medium text-sm text-gray-500 data-[state=active]:text-indigo-600 data-[state=active]:bg-transparent rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 transition-colors hover:text-gray-700 flex items-center space-x-2"
              >
                <UserIcon className="h-5 w-5" />
                <span>Account Details</span>
              </TabsTrigger>
              <TabsTrigger
                value="orders"
                className="relative h-12 px-8 font-medium text-sm text-gray-500 data-[state=active]:text-indigo-600 data-[state=active]:bg-transparent rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 transition-colors hover:text-gray-700 flex items-center space-x-2"
              >
                <ShoppingBagIcon className="h-5 w-5" />
                <span>Order History</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="account" className="mt-0 outline-none space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Profile and Personal Information */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-semibold mb-6">
                    Personal Information
                  </h2>
                  <ProfileDetails user={user} />
                </div>
              </div>

              {/* Addresses Section */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <AddressManager userId={user.id} />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="orders" className="mt-0 outline-none">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold">Order History</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    View and track all your orders in one place
                  </p>
                </div>
              </div>
              <OrderHistory userId={user.id} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
