import React from "react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Privacy Policy
          </h1>
          <p className="text-gray-500 mb-8">
            Effective Date: February 26, 2024
          </p>

          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-8">
              PurseKharido values your privacy. This Privacy Policy explains how
              we collect, use, and protect your personal information when you
              visit our website pursekharido.in (the "Website") and purchase our
              products.
            </p>

            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  1. Information We Collect
                </h2>

                <div className="pl-4 space-y-6">
                  <div>
                    <h3 className="text-xl font-medium text-gray-900 mb-3">
                      a. Personal Information
                    </h3>
                    <p className="text-gray-600 mb-2">
                      When you place an order or register on our Website, we may
                      collect:
                    </p>
                    <ul className="list-disc pl-5 text-gray-600 space-y-1">
                      <li>Name</li>
                      <li>Email address</li>
                      <li>Phone number</li>
                      <li>Shipping and billing address</li>
                      <li>
                        Payment details (processed securely through third-party
                        payment providers)
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-medium text-gray-900 mb-3">
                      b. Non-Personal Information
                    </h3>
                    <p className="text-gray-600 mb-2">
                      We may collect non-personal data such as:
                    </p>
                    <ul className="list-disc pl-5 text-gray-600 space-y-1">
                      <li>IP address</li>
                      <li>Browser type</li>
                      <li>Device information</li>
                      <li>Cookies and usage data</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  2. How We Use Your Information
                </h2>
                <p className="text-gray-600 mb-2">
                  We use your information to:
                </p>
                <ul className="list-disc pl-5 text-gray-600 space-y-1">
                  <li>Process and fulfill orders</li>
                  <li>Improve our products and services</li>
                  <li>Send order updates and customer support messages</li>
                  <li>
                    Offer personalized recommendations and promotions (if you
                    opt in)
                  </li>
                  <li>Ensure website security and prevent fraud</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  3. How We Share Your Information
                </h2>
                <p className="text-gray-600 mb-3">
                  We do not sell or rent your personal data. However, we may
                  share your information with:
                </p>
                <ul className="list-disc pl-5 text-gray-600 space-y-1">
                  <li>Payment processors (to securely handle transactions)</li>
                  <li>Shipping partners (to deliver your orders)</li>
                  <li>
                    Marketing tools (if you have opted in to receive promotions)
                  </li>
                  <li>
                    Legal authorities (if required by law or to protect our
                    rights)
                  </li>
                </ul>
              </section>

              <section className="bg-blue-50 p-6 rounded-xl">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  4. Your Rights
                </h2>
                <p className="text-gray-600 mb-3">You have the right to:</p>
                <ul className="list-disc pl-5 text-gray-600 space-y-1">
                  <li>Access, update, or delete your personal information</li>
                  <li>
                    Opt out of marketing emails (via the unsubscribe link)
                  </li>
                  <li>Request a copy of the data we store about you</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  5. Contact Us
                </h2>
                <div className="bg-gray-50 p-6 rounded-xl">
                  <p className="text-gray-600 mb-4">
                    If you have any questions about this Privacy Policy, contact
                    us at:
                  </p>
                  <div className="space-y-2">
                    <p className="text-gray-700">
                      <span className="font-medium">Email:</span>{" "}
                      pursekharido@gmail.com
                    </p>
                    <p className="text-gray-700">
                      <span className="font-medium">Address:</span> Shop No 1,
                      Gaadi Adda Sehore, MP, India
                    </p>
                  </div>
                </div>
              </section>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-gray-500 text-sm">
                By using our Website, you agree to this Privacy Policy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
