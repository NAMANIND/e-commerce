"use client";

import React from "react";
import {
  Truck,
  Clock,
  MapPin,
  AlertCircle,
  Package,
  Phone,
} from "lucide-react";
import { useShippingSettings } from "@/hooks/useShippingSettings";

export default function ShippingAndDelivery() {
  const { settings } = useShippingSettings();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Shipping & Delivery Policy
          </h1>
          <p className="text-gray-500 mb-8">
            Effective Date: February 26, 2024
          </p>

          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-8">
              At PurseKharido ("we," "our," or "us"), we are committed to
              delivering your orders promptly and securely. Please read our
              shipping and delivery terms before placing an order.
            </p>

            <div className="space-y-8">
              <section className="bg-blue-50 p-6 rounded-xl">
                <div className="flex items-start gap-4">
                  <Truck className="w-6 h-6 text-blue-600 mt-1" />
                  <div className="flex-1">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                      1. Shipping Locations
                    </h2>
                    <div className="space-y-3 text-gray-600">
                      <p>We currently deliver across India.</p>
                      <p className="text-sm bg-white p-3 rounded-lg border border-blue-100">
                        Note: For international shipping inquiries, please
                        contact our customer support.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="bg-gray-50 p-6 rounded-xl">
                <div className="flex items-start gap-4">
                  <Clock className="w-6 h-6 text-gray-600 mt-1" />
                  <div className="flex-1">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                      2. Shipping Timeframes
                    </h2>
                    <div className="space-y-4">
                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <p className="font-medium text-gray-900 mb-2">
                          Order Processing:
                        </p>
                        <p className="text-gray-600">
                          Orders are processed within 3 business days after
                          payment confirmation.
                        </p>
                      </div>

                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <p className="font-medium text-gray-900 mb-2">
                          Delivery Time:
                        </p>
                        <p className="text-gray-600">
                          Domestic Shipping: 3-7 business days
                        </p>
                      </div>

                      <p className="text-sm text-gray-500 italic">
                        Note: Unforeseen delays due to weather, customs, or
                        courier issues are beyond our control.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <div className="flex items-start gap-4">
                  <Package className="w-6 h-6 text-gray-600 mt-1" />
                  <div className="flex-1">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                      3. Shipping Charges
                    </h2>
                    <div className="space-y-3 text-gray-600">
                      <p>Standard shipping rate: ₹{settings.shipping_rate}</p>
                      <p>
                        Free shipping on orders above ₹
                        {settings.free_shipping_threshold}
                      </p>
                      <p>
                        Any applicable taxes, customs duties, or import fees are
                        the buyer's responsibility.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="bg-green-50 p-6 rounded-xl">
                <div className="flex items-start gap-4">
                  <AlertCircle className="w-6 h-6 text-green-600 mt-1" />
                  <div className="flex-1">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                      4. Order Tracking
                    </h2>
                    <div className="space-y-4 text-gray-600">
                      <p>
                        Once your order is shipped, you will receive a tracking
                        number via email/SMS.
                      </p>
                      <p>
                        You can track your shipment on our courier partner's
                        website.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="bg-yellow-50 p-6 rounded-xl">
                <div className="flex items-start gap-4">
                  <MapPin className="w-6 h-6 text-yellow-600 mt-1" />
                  <div className="flex-1">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                      5. Address & Delivery Issues
                    </h2>
                    <ul className="list-disc pl-5 text-gray-600 space-y-2">
                      <li>
                        Ensure you provide an accurate shipping address at
                        checkout.
                      </li>
                      <li>
                        We are not responsible for lost or undelivered packages
                        due to incorrect addresses.
                      </li>
                      <li>
                        If a package is returned due to an incorrect address,
                        reshipping charges will apply.
                      </li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <div className="flex items-start gap-4">
                  <Phone className="w-6 h-6 text-gray-600 mt-1" />
                  <div className="flex-1">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                      6. Contact Us
                    </h2>
                    <div className="bg-gray-50 p-6 rounded-xl">
                      <p className="text-gray-600 mb-4">
                        For shipping-related inquiries, contact us at:
                      </p>
                      <div className="space-y-2">
                        <p className="text-gray-700">
                          <span className="font-medium">Email:</span>{" "}
                          pursekharido@gmail.com
                        </p>
                        <p className="text-gray-700">
                          <span className="font-medium">Address:</span> Gaadi
                          Adda, Sehore, MP, India
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-gray-500 text-sm">
                By placing an order, you agree to this Shipping & Delivery
                Policy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
