"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart,
  Settings,
  ChevronDown,
  Menu,
  X,
  Tag,
} from "lucide-react";

const navigation = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: <LayoutDashboard className="h-6 w-6" />,
  },
  {
    name: "Products",
    href: "/admin/products",
    icon: <Package className="h-6 w-6" />,
    children: [
      { name: "All Products", href: "/admin/products" },
      { name: "Add New", href: "/admin/products/new" },
    ],
  },
  {
    name: "Categories",
    href: "/admin/categories",
    icon: <Tag className="h-6 w-6" />,
    children: [
      { name: "All Categories", href: "/admin/categories" },
      { name: "Add New", href: "/admin/categories/new" },
    ],
  },
  {
    name: "Orders",
    href: "/admin/orders",
    icon: <ShoppingCart className="h-6 w-6" />,
    // children: [
    //   { name: "All Orders", href: "/admin/orders" },
    //   { name: "Pending", href: "/admin/orders/pending" },
    //   { name: "Processing", href: "/admin/orders/processing" },
    //   { name: "Shipped", href: "/admin/orders/shipped" },
    // ],
  },
  {
    name: "Customers",
    href: "/admin/customers",
    icon: <Users className="h-6 w-6" />,
  },
  {
    name: "Analytics",
    href: "/admin/analytics",
    icon: <BarChart className="h-6 w-6" />,
    children: [
      { name: "Sales", href: "/admin/analytics/sales" },
      { name: "Products", href: "/admin/analytics/products" },
    ],
  },
  {
    name: "Settings",
    href: "/admin/settings",
    icon: <Settings className="h-6 w-6" />,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState<string[]>([]);

  const toggleMenu = (name: string) => {
    setOpenMenus((prev) =>
      prev.includes(name)
        ? prev.filter((item) => item !== name)
        : [...prev, name]
    );
  };

  const isActive = (href: string) => {
    if (href === "/admin" && pathname === "/admin") return true;
    if (href !== "/admin" && pathname.startsWith(href)) return true;
    return false;
  };

  const NavItem = ({ item }: { item: (typeof navigation)[0] }) => {
    const active = isActive(item.href);
    const hasChildren = item.children && item.children.length > 0;
    const isOpen = openMenus.includes(item.name);

    return (
      <div>
        {hasChildren ? (
          <>
            <button
              onClick={() => toggleMenu(item.name)}
              className={cn(
                "group flex w-full items-center gap-x-3 rounded-md p-2 text-sm leading-6",
                active
                  ? "bg-gray-800 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              )}
            >
              <div className="flex flex-row justify-between w-full">
                <span className="flex flex-row gap-2">
                  {item.icon}
                  <span className="">{item.name}</span>
                </span>
                <ChevronDown
                  className={cn(
                    "h-5 w-5 shrink-0 transition-transform",
                    isOpen && "rotate-180"
                  )}
                />
              </div>
            </button>
            {isOpen && item.children && (
              <div className="mt-1 space-y-1 px-8">
                {item.children.map((child) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    className={cn(
                      "block rounded-md py-2 pl-2 text-sm leading-6",
                      isActive(child.href)
                        ? "bg-gray-800 text-white"
                        : "text-gray-400 hover:bg-gray-800 hover:text-white"
                    )}
                  >
                    {child.name}
                  </Link>
                ))}
              </div>
            )}
          </>
        ) : (
          <Link
            href={item.href}
            className={cn(
              "group flex items-center gap-x-3 rounded-md p-2 text-sm leading-6",
              active
                ? "bg-gray-800 text-white"
                : "text-gray-400 hover:bg-gray-800 hover:text-white"
            )}
          >
            {item.icon}
            <span className="flex-1">{item.name}</span>
          </Link>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        type="button"
        className="lg:hidden fixed top-4 left-4 z-50 rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        <span className="sr-only">Open sidebar</span>
        {isMobileMenuOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </button>

      {/* Sidebar for mobile */}
      <div
        className={cn(
          "fixed inset-0 z-40 lg:hidden",
          isMobileMenuOpen ? "block" : "hidden"
        )}
      >
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
        <div className="fixed inset-y-0 left-0 z-40 w-72 overflow-y-auto bg-gray-900 p-6">
          <div className="space-y-4">
            {navigation.map((item) => (
              <NavItem key={item.name} item={item} />
            ))}
          </div>
        </div>
      </div>

      {/* Sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-900 px-6 py-4">
          <div className="flex h-16 shrink-0 items-center">
            <Link href="/admin" className="text-xl font-bold text-white">
              Admin Dashboard
            </Link>
          </div>
          <nav className="flex flex-1 flex-col">
            <div className="space-y-4">
              {navigation.map((item) => (
                <NavItem key={item.name} item={item} />
              ))}
            </div>
          </nav>
        </div>
      </div>
    </>
  );
}
