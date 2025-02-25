"use client";

import React from "react";
import { Mail, MapPin, Clock, Phone } from "lucide-react";

export default function ContactUs() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
            Contact Us
          </h1>

          <div className="space-y-8">
            <div className="bg-blue-50 p-8 rounded-xl">
              <h2 className="text-2xl font-semibold text-gray-900 mb-8">
                Get in Touch
              </h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 flex items-center space-x-3 mb-3">
                      <Mail className="w-5 h-5 text-blue-600" />
                      <span>Email</span>
                    </h3>
                    <p className="text-gray-600 ml-8">
                      <a
                        href="mailto:pursekharido@gmail.com"
                        className="hover:text-blue-600 transition-colors"
                      >
                        pursekharido@gmail.com
                      </a>
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 flex items-center space-x-3 mb-3">
                      <Phone className="w-5 h-5 text-blue-600" />
                      <span>Phone</span>
                    </h3>
                    <p className="text-gray-600 ml-8">
                      <a
                        href="tel:+918770863293"
                        className="hover:text-blue-600 transition-colors"
                      >
                        +91 8770863293
                      </a>
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 flex items-center space-x-3 mb-3">
                      <MapPin className="w-5 h-5 text-blue-600" />
                      <span>Address</span>
                    </h3>
                    <p className="text-gray-600 ml-8">
                      Shop No 1, Gaadi Adda,
                      <br />
                      Sehore, MP,
                      <br />
                      India
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 flex items-center space-x-3 mb-3">
                      <Clock className="w-5 h-5 text-blue-600" />
                      <span>Business Hours</span>
                    </h3>
                    <p className="text-gray-600 ml-8">
                      Monday - Saturday
                      <br />
                      10:00 AM - 7:00 PM
                      <br />
                      <span className="text-gray-500">(Closed on Sundays)</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-gray-50 p-6 rounded-xl">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Quick Response
                </h2>
                <p className="text-gray-600">
                  We aim to respond to all inquiries within 24 hours during
                  business days. For urgent matters, please contact us directly
                  via phone or email.
                </p>
              </div>

              <div className="bg-green-50 p-6 rounded-xl">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Customer Support
                </h2>
                <p className="text-gray-600">
                  Our dedicated support team is here to help you with any
                  questions about your orders, shipping, or our products.
                </p>
              </div>
            </div>

            <div className="text-center text-gray-500 text-sm pt-6 border-t border-gray-200">
              <p>
                For the fastest response, please include your order number (if
                applicable) when contacting us.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
