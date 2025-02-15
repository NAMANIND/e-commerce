"use client";

import React from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { ShoppingBag, Search, Menu, X, User, LogOut } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const { user, isAuthenticated, signOut } = useAuth();

  const totalItems = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  return (
    <>
      {/* Main Navbar */}
      <nav className="fixed top-0 left-0 right-0 bg-white border-b z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              <h1 className="text-xl font-bold text-blue-600">E-Commerce</h1>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link
                href="/products"
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                All Products
              </Link>

              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full px-4 py-2 pl-10 pr-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>

              <Link href="/cart" className="relative group">
                <ShoppingBag className="h-6 w-6 text-gray-600 group-hover:text-blue-600 transition-colors" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Link>

              {/* Profile Menu */}
              <div className="relative">
                {isAuthenticated ? (
                  <>
                    <button
                      type="button"
                      className="flex items-center gap-x-2 rounded-full p-2 hover:bg-gray-100"
                      onClick={() => setShowProfileMenu(!showProfileMenu)}
                    >
                      <span className="h-8 w-8 rounded-full bg-gray-100">
                        <User className="h-8 w-8 p-1 text-gray-600" />
                      </span>
                      <span className="hidden text-sm font-medium text-gray-700 lg:block">
                        {user?.user_metadata?.full_name || "Profile"}
                      </span>
                    </button>

                    {showProfileMenu && (
                      <div className="absolute right-0 mt-2 w-48 rounded-lg bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5">
                        <Link
                          href="/profile"
                          className="flex items-center gap-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <User className="h-4 w-4" />
                          Profile
                        </Link>
                        <button
                          onClick={signOut}
                          className="flex w-full items-center gap-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <LogOut className="h-4 w-4" />
                          Sign out
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href="/login"
                    className="flex items-center gap-x-2 text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    <User className="h-6 w-6" />
                    <span className="text-sm font-medium">Sign in</span>
                  </Link>
                )}
              </div>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-gray-600 hover:text-blue-600 transition-colors"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className={`md:hidden ${isMenuOpen ? "block" : "hidden"}`}>
          <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-b">
            <Link
              href="/products"
              className="block px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            >
              All Products
            </Link>
            <Link
              href="/categories"
              className="block px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            >
              Categories
            </Link>
            <Link
              href="/cart"
              className="block px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            >
              Cart ({totalItems})
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  href="/profile"
                  className="block px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                >
                  Profile
                </Link>
                <button
                  onClick={signOut}
                  className="block w-full text-left px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="block px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Spacer for fixed navbar */}
      <div className="h-16" />
    </>
  );
}
