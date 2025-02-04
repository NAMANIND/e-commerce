"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bell,
  Search,
  User,
  LogOut,
  Settings,
  ShoppingCart,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function Header() {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white shadow">
      <div className="flex h-16 items-center gap-x-4 px-4 sm:px-6 lg:px-8">
        {/* Search */}
        <div className="flex flex-1 gap-x-4">
          <div className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              placeholder="Search..."
              className="h-10 w-full rounded-full border-0 bg-gray-100 pl-11 pr-4 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-x-4">
          {/* Notifications */}
          <div className="relative">
            <button
              type="button"
              className="relative rounded-full p-2 hover:bg-gray-100"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
              <Bell className="h-6 w-6 text-gray-500" />
            </button>

            {/* Notifications dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 rounded-lg bg-white p-4 shadow-lg ring-1 ring-black ring-opacity-5">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Notifications</h3>
                  <button className="text-xs text-blue-600 hover:text-blue-500">
                    Mark all as read
                  </button>
                </div>
                <div className="space-y-4">
                  {/* Sample notifications */}
                  <div className="flex gap-x-4 rounded-lg p-2 hover:bg-gray-50">
                    <div className="flex-shrink-0">
                      <span className="inline-block h-8 w-8 rounded-lg bg-blue-100 p-2">
                        <ShoppingCart className="h-4 w-4 text-blue-600" />
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-900">
                        New order received
                      </p>
                      <p className="text-xs text-gray-500">2 minutes ago</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Profile dropdown */}
          <div className="relative">
            <button
              type="button"
              className="flex items-center gap-x-2 rounded-full p-2 hover:bg-gray-100"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              <span className="h-8 w-8 rounded-full bg-gray-100">
                <User className="h-8 w-8 p-1 text-gray-600" />
              </span>
              <span className="hidden text-sm font-medium text-gray-700 lg:block">
                Admin User
              </span>
            </button>

            {/* Profile menu */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 rounded-lg bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5">
                <Link
                  href="/admin/profile"
                  className="flex items-center gap-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <User className="h-4 w-4" />
                  Profile
                </Link>
                <Link
                  href="/admin/settings"
                  className="flex items-center gap-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </Link>
                <button
                  type="button"
                  className="flex w-full items-center gap-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
