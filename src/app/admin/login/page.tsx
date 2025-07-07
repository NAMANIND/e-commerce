"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Lock, User } from "lucide-react";
import { toast } from "react-toastify";

export default function AdminLogin() {
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in
    const adminAuth = document.cookie
      .split("; ")
      .find((row) => row.startsWith("adminAuth="));

    if (adminAuth) {
      const authData = JSON.parse(decodeURIComponent(adminAuth.split("=")[1]));
      if (new Date().getTime() < authData.expiresAt) {
        router.replace("/admin");
        return;
      } else {
        // Remove expired cookie
        document.cookie =
          "adminAuth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      }
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/admin/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          loginId,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Calculate expiration time (1 month if remember me is checked, 1 day otherwise)
        const expirationTime = rememberMe
          ? 30 * 24 * 60 * 60 * 1000 // 30 days in milliseconds
          : 24 * 60 * 60 * 1000; // 1 day in milliseconds

        const expiresAt = new Date().getTime() + expirationTime;
        const expirationDate = new Date(expiresAt);

        // Store authentication in cookie
        const authData = {
          authenticated: true,
          expiresAt,
          rememberMe,
        };

        document.cookie = `adminAuth=${encodeURIComponent(
          JSON.stringify(authData)
        )}; expires=${expirationDate.toUTCString()}; path=/`;

        toast.success("Login successful!");

        // Use a small delay to ensure cookie is set
        setTimeout(() => {
          router.replace("/admin");
        }, 100);
      } else {
        toast.error(data.message || "Invalid credentials");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <Card className="w-full max-w-md shadow-2xl border-gray-700 bg-white/95 backdrop-blur">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 p-3 rounded-full">
              <Lock className="h-6 w-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Admin Login
          </CardTitle>
          <CardDescription className="text-gray-600">
            Enter your credentials to access the admin panel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="loginId"
                className="text-sm font-medium text-gray-700"
              >
                Login ID
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="loginId"
                  type="text"
                  placeholder="Enter login ID"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  required
                  className="pl-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-sm font-medium text-gray-700"
              >
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10 pr-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="rememberMe"
                checked={rememberMe}
                onCheckedChange={(checked: boolean) => setRememberMe(checked)}
              />
              <Label
                htmlFor="rememberMe"
                className="text-sm text-gray-600 cursor-pointer"
              >
                Remember me for 1 month
              </Label>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
