import React from "react";

export default function CancellationAndRefund() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Cancellation & Refund Policy
          </h1>
          <p className="text-gray-500 mb-8">
            Effective Date: February 26, 2024
          </p>

          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-8">
              At PurseKharido, we strive to provide a smooth shopping
              experience. Please read our Cancellation and Refund Policy
              carefully before making a purchase.
            </p>

            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  1. Order Cancellation Policy
                </h2>
                <div className="space-y-6">
                  <div className="bg-yellow-50 p-6 rounded-xl">
                    <h3 className="text-xl font-medium text-gray-900 mb-3">
                      Before Order Processing:
                    </h3>
                    <ul className="list-disc pl-5 text-gray-600 space-y-2">
                      <li>
                        You may cancel your order within 2 hours of placing it.
                      </li>
                      <li>
                        Contact us immediately at pursekharido@gmail.com or
                        8770863293.
                      </li>
                      <li>
                        If your order has already been processed or shipped, it
                        cannot be canceled.
                      </li>
                    </ul>
                  </div>

                  <div className="bg-red-50 p-6 rounded-xl">
                    <h3 className="text-xl font-medium text-gray-900 mb-3">
                      After Order Processing:
                    </h3>
                    <p className="text-gray-600">
                      Once an order is shipped, cancellations are not allowed
                      under any circumstances.
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  2. No Refund Policy
                </h2>
                <div className="space-y-4">
                  <p className="text-gray-600">
                    All sales are final. We do not offer refunds once an order
                    is confirmed and processed.
                  </p>
                  <div className="bg-gray-50 p-6 rounded-xl">
                    <p className="text-gray-700 font-medium mb-2">
                      Refunds are not applicable for:
                    </p>
                    <ul className="list-disc pl-5 text-gray-600 space-y-1">
                      <li>Change of mind</li>
                      <li>
                        Incorrect product selection (size, color, style, etc.)
                      </li>
                      <li>
                        Delayed delivery due to courier issues or unforeseen
                        circumstances
                      </li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  3. Exceptions for Refunds (If Applicable)
                </h2>
                <div className="space-y-6">
                  <p className="text-gray-600">
                    Refunds are considered only in the following cases:
                  </p>

                  <div className="bg-green-50 p-6 rounded-xl space-y-6">
                    <div>
                      <h3 className="text-xl font-medium text-gray-900 mb-2">
                        Defective or Damaged Products:
                      </h3>
                      <ul className="list-disc pl-5 text-gray-600 space-y-1">
                        <li>
                          If you receive a defective or damaged item, notify us
                          within 24 hours of delivery with clear photos and
                          order details.
                        </li>
                        <li>
                          We will review the claim and, if approved, issue a
                          refund or replacement at our sole discretion.
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-xl font-medium text-gray-900 mb-2">
                        Wrong Item Received:
                      </h3>
                      <p className="text-gray-600">
                        If you receive an incorrect product, contact us within
                        24 hours with proof, and we will arrange a resolution.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  4. Refund Process (If Approved)
                </h2>
                <div className="space-y-3 text-gray-600">
                  <p>
                    If your refund request is approved, it will be processed
                    within 5-7 business days to your original payment method.
                  </p>
                  <p>
                    We are not responsible for delays in bank processing times.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  5. Contact Us
                </h2>
                <div className="bg-gray-50 p-6 rounded-xl">
                  <p className="text-gray-600 mb-4">
                    For any cancellation or refund-related queries, reach out to
                    us at:
                  </p>
                  <div className="space-y-2">
                    <p className="text-gray-700">
                      <span className="font-medium">Email:</span>{" "}
                      pursekharido@gmail.com
                    </p>
                    <p className="text-gray-700">
                      <span className="font-medium">Phone:</span> 8770863293
                    </p>
                    <p className="text-gray-700">
                      <span className="font-medium">Address:</span> Gaadi Adda,
                      Sehore, MP, India
                    </p>
                  </div>
                </div>
              </section>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-gray-500 text-sm">
                By making a purchase from our Website, you agree to this
                Cancellation & Refund Policy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
