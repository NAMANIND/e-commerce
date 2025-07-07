"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/admin/sidebar";
import { Header } from "@/components/admin/header";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // If it's the login page, render without sidebar
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  // For all other admin pages, show the sidebar layout
  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar />
      <div className="lg:pl-72">
        {/* <Header /> */}
        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
