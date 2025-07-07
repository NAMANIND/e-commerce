import Link from "next/link";
import Image from "next/image";
import {
  Facebook,
  Twitter,
  Instagram,
  Mail,
  Phone,
  MapPin,
  Heart,
  CreditCard,
  ShieldCheck,
  HelpCircle,
  Wallet,
  Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Newsletter Section */}
      {/* <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-white font-semibold text-xl mb-2">
                Stay updated with our latest offers
              </h3>
              <p className="text-gray-400 text-sm">
                Subscribe to our newsletter and get 10% off on your first order
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-grow px-4 py-3 rounded-md bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              />
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md transition-all">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </div> */}

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <Link href="/" className="block">
              {/* <Image
                src="/logo.png"
                alt="PurseKharido Logo"
                width={120}
                height={40}
                className="brightness-0 invert"
              /> */}
              <h1 className="text-2xl font-bold text-white">PurseKharido.in</h1>
            </Link>
            <p className="text-sm text-gray-400">
              Your one-stop destination for quality purses and accessories at
              great prices. We believe in making shopping easy and enjoyable.
            </p>
            <div className="flex gap-4 pt-2">
              <a
                href="https://facebook.com/pursekharido"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-blue-400 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://instagram.com/pursekharido"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-blue-400 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/products"
                  className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
                >
                  <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                  All Products
                </Link>
              </li>
              <li>
                <Link
                  href="/products/new-arrivals"
                  className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
                >
                  <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link
                  href="/products/best-sellers"
                  className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
                >
                  <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                  Best Sellers
                </Link>
              </li>
              <li>
                <Link
                  href="/products/featured"
                  className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
                >
                  <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                  Featured Products
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">
              Customer Service
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/contact-us"
                  className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
                >
                  <HelpCircle className="h-4 w-4" />
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href="/orders"
                  className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
                >
                  <CreditCard className="h-4 w-4" />
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link
                  href="/shipping-and-delivery"
                  className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
                >
                  <ShieldCheck className="h-4 w-4" />
                  Shipping Information
                </Link>
              </li>
              <li>
                <Link
                  href="/cancellation-and-refund"
                  className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
                >
                  <Heart className="h-4 w-4" />
                  Cancellation & Refund
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">
              Contact Us
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-gray-500" />
                <a
                  href="tel:8770863293"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  +91 8770863293
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-gray-500" />
                <a
                  href="mailto:pursekharido@gmail.com"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  pursekharido@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gray-500 mt-1" />
                <span className="text-gray-400">
                  Gaadi Adda,
                  <br />
                  Sehore, MP,
                  <br />
                  India
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="order-2 md:order-1">
              <p className="text-sm text-gray-500">
                © {new Date().getFullYear()} PurseKharido. All rights reserved.
              </p>
            </div>
            <div className="order-1 md:order-2">
              <div className="flex items-center gap-6">
                <span className="text-sm text-gray-500">
                  We Accept: UPI, Cards & Net Banking
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Legal Links */}
        <div className="mt-6 text-center text-xs text-gray-500">
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            <Link
              href="/privacy-policy"
              className="hover:text-gray-300 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms-and-conditions"
              className="hover:text-gray-300 transition-colors"
            >
              Terms & Conditions
            </Link>
            <Link
              href="/shipping-and-delivery"
              className="hover:text-gray-300 transition-colors"
            >
              Shipping Policy
            </Link>
            <Link
              href="/cancellation-and-refund"
              className="hover:text-gray-300 transition-colors"
            >
              Cancellation & Refund
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
