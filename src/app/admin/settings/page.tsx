"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { Save, Store, Mail, CreditCard } from "lucide-react";

interface StoreSettings {
  name: string;
  email: string;
  currency: string;
  timezone: string;
}

interface EmailSettings {
  orderConfirmation: boolean;
  shipmentUpdates: boolean;
  marketingEmails: boolean;
  lowStockAlerts: boolean;
}

interface PaymentSettings {
  stripeEnabled: boolean;
  paypalEnabled: boolean;
  stripeKey: string;
  paypalClientId: string;
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [storeSettings, setStoreSettings] = useState<StoreSettings>({
    name: "Your Store",
    email: "store@example.com",
    currency: "USD",
    timezone: "UTC",
  });

  const [emailSettings, setEmailSettings] = useState<EmailSettings>({
    orderConfirmation: true,
    shipmentUpdates: true,
    marketingEmails: false,
    lowStockAlerts: true,
  });

  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
    stripeEnabled: true,
    paypalEnabled: false,
    stripeKey: "",
    paypalClientId: "",
  });

  async function handleStoreSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const { error } = await supabase
        .from("settings")
        .upsert([{ type: "store", settings: storeSettings }]);

      if (error) throw error;
      setSuccess("Store settings updated successfully");
    } catch (error) {
      console.error("Error updating store settings:", error);
      setError("Failed to update store settings");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Settings</h2>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="rounded-md bg-green-50 p-4">
          <p className="text-sm font-medium text-green-800">{success}</p>
        </div>
      )}

      <div className="grid gap-6">
        {/* Store Settings */}
        <Card className="p-6">
          <div className="flex items-center gap-x-3 mb-6">
            <Store className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-medium">Store Settings</h3>
          </div>

          <form onSubmit={handleStoreSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="storeName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Store Name
                </label>
                <input
                  type="text"
                  id="storeName"
                  value={storeSettings.name}
                  onChange={(e) =>
                    setStoreSettings({ ...storeSettings, name: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="storeEmail"
                  className="block text-sm font-medium text-gray-700"
                >
                  Store Email
                </label>
                <input
                  type="email"
                  id="storeEmail"
                  value={storeSettings.email}
                  onChange={(e) =>
                    setStoreSettings({
                      ...storeSettings,
                      email: e.target.value,
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="currency"
                  className="block text-sm font-medium text-gray-700"
                >
                  Currency
                </label>
                <select
                  id="currency"
                  value={storeSettings.currency}
                  onChange={(e) =>
                    setStoreSettings({
                      ...storeSettings,
                      currency: e.target.value,
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="timezone"
                  className="block text-sm font-medium text-gray-700"
                >
                  Timezone
                </label>
                <select
                  id="timezone"
                  value={storeSettings.timezone}
                  onChange={(e) =>
                    setStoreSettings({
                      ...storeSettings,
                      timezone: e.target.value,
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  <option value="UTC">UTC</option>
                  <option value="EST">EST</option>
                  <option value="PST">PST</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50"
              >
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </button>
            </div>
          </form>
        </Card>

        {/* Email Settings */}
        <Card className="p-6">
          <div className="flex items-center gap-x-3 mb-6">
            <Mail className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-medium">Email Notifications</h3>
          </div>

          <div className="space-y-4">
            {Object.entries(emailSettings).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    {key
                      .replace(/([A-Z])/g, " $1")
                      .replace(/^./, (str) => str.toUpperCase())}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setEmailSettings({ ...emailSettings, [key]: !value })
                  }
                  className={`${
                    value ? "bg-blue-600" : "bg-gray-200"
                  } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                >
                  <span
                    className={`${
                      value ? "translate-x-5" : "translate-x-0"
                    } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                  />
                </button>
              </div>
            ))}
          </div>
        </Card>

        {/* Payment Settings */}
        <Card className="p-6">
          <div className="flex items-center gap-x-3 mb-6">
            <CreditCard className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-medium">Payment Methods</h3>
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Stripe</p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setPaymentSettings({
                      ...paymentSettings,
                      stripeEnabled: !paymentSettings.stripeEnabled,
                    })
                  }
                  className={`${
                    paymentSettings.stripeEnabled
                      ? "bg-blue-600"
                      : "bg-gray-200"
                  } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                >
                  <span
                    className={`${
                      paymentSettings.stripeEnabled
                        ? "translate-x-5"
                        : "translate-x-0"
                    } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                  />
                </button>
              </div>

              {paymentSettings.stripeEnabled && (
                <div>
                  <label
                    htmlFor="stripeKey"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Stripe Secret Key
                  </label>
                  <input
                    type="password"
                    id="stripeKey"
                    value={paymentSettings.stripeKey}
                    onChange={(e) =>
                      setPaymentSettings({
                        ...paymentSettings,
                        stripeKey: e.target.value,
                      })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">PayPal</p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setPaymentSettings({
                      ...paymentSettings,
                      paypalEnabled: !paymentSettings.paypalEnabled,
                    })
                  }
                  className={`${
                    paymentSettings.paypalEnabled
                      ? "bg-blue-600"
                      : "bg-gray-200"
                  } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                >
                  <span
                    className={`${
                      paymentSettings.paypalEnabled
                        ? "translate-x-5"
                        : "translate-x-0"
                    } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                  />
                </button>
              </div>

              {paymentSettings.paypalEnabled && (
                <div>
                  <label
                    htmlFor="paypalClientId"
                    className="block text-sm font-medium text-gray-700"
                  >
                    PayPal Client ID
                  </label>
                  <input
                    type="password"
                    id="paypalClientId"
                    value={paymentSettings.paypalClientId}
                    onChange={(e) =>
                      setPaymentSettings({
                        ...paymentSettings,
                        paypalClientId: e.target.value,
                      })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
