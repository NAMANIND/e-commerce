import React from "react";

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Terms and Conditions
          </h1>
          <p className="text-gray-500 mb-8">
            Effective Date: February 26, 2024
          </p>

          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-8">
              Welcome to PurseKharido. By accessing or purchasing from
              pursekharido.in (the "Website"), you agree to the following terms
              and conditions.
            </p>

            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  1. General Terms
                </h2>
                <div className="space-y-3 text-gray-600">
                  <p>
                    By using this Website, you confirm that you are at least 18
                    years old or have parental permission to use it.
                  </p>
                  <p>
                    We reserve the right to update or modify these terms at any
                    time without prior notice.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  2. Product Information
                </h2>
                <div className="space-y-3 text-gray-600">
                  <p>
                    We make every effort to display products accurately.
                    However, slight variations in color or design may occur due
                    to screen settings or lighting.
                  </p>
                  <p>
                    All products are sold on an "as is" basis without warranties
                    beyond those required by law.
                  </p>
                </div>
              </section>

              <section className="bg-red-50 p-6 rounded-xl">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  3. No Return & No Exchange Policy
                </h2>
                <div className="space-y-4">
                  <p className="text-gray-600">
                    All sales are final. We do not accept returns or exchanges
                    for any reason, including but not limited to:
                  </p>
                  <ul className="list-disc pl-5 text-gray-600 space-y-1">
                    <li>Change of mind</li>
                    <li>Incorrect size or color selection</li>
                    <li>Minor variations in product appearance</li>
                    <li>Delayed delivery by shipping partners</li>
                  </ul>
                  <div className="mt-4 p-4 bg-white rounded-lg border border-red-100">
                    <p className="text-gray-600">
                      In case of a damaged or defective product, you must report
                      it within 24 hours of delivery with photos and order
                      details. We will assess the issue and may offer a
                      resolution at our sole discretion.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  4. Order Processing & Shipping
                </h2>
                <div className="space-y-3 text-gray-600">
                  <p>
                    Orders are processed within 3-7 business days after payment
                    confirmation.
                  </p>
                  <p>
                    We are not responsible for shipping delays caused by courier
                    services or unforeseen circumstances.
                  </p>
                  <p>
                    Ensure the correct shipping address is provided, as we are
                    not liable for orders delivered to incorrect addresses.
                  </p>
                </div>
              </section>

              <section className="bg-gray-50 p-6 rounded-xl">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  5. Payments
                </h2>
                <div className="space-y-3 text-gray-600">
                  <p>
                    We accept payments via UPI, Credit/Debit Cards, and Net
                    Banking. All transactions are processed securely.
                  </p>
                  <p>
                    Orders are confirmed only after full payment is received.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  6. Contact Information
                </h2>
                <div className="bg-gray-50 p-6 rounded-xl">
                  <p className="text-gray-600 mb-4">
                    For any inquiries, contact us at:
                  </p>
                  <p className="text-gray-700">
                    <span className="font-medium">Email:</span>{" "}
                    pursekharido@gmail.com
                  </p>
                </div>
              </section>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-gray-500 text-sm">
                By purchasing from our Website, you acknowledge and agree to
                these Terms and Conditions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
