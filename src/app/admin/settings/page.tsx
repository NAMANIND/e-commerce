"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { Save, Store, Mail, CreditCard, Truck } from "lucide-react";

const defaultSlides = [
  {
    image:
      "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?q=80&w=1475&auto=format&fit=crop",
    title: "Educational Toys Collection",
    description:
      "Discover our range of educational toys that make learning fun and engaging.",
    buttonText: "Shop Toys",
  },
  {
    image:
      "https://images.unsplash.com/photo-1596073419667-9d77d59f033f?q=80&w=1435&auto=format&fit=crop",
    title: "Indoor Plants Collection",
    description:
      "Transform your space with our selection of beautiful indoor plants.",
    buttonText: "View Plants",
  },
  {
    image:
      "https://images.unsplash.com/photo-1581557991964-125469da3b8a?q=80&w=1470&auto=format&fit=crop",
    title: "Kids Development Toys",
    description:
      "Help your child grow with our carefully curated developmental toys.",
    buttonText: "Shop Toys",
  },
];

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

interface ShippingSettings {
  shipping_rate: number;
  free_shipping_threshold: number;
}

interface ContentSettings {
  hero_image: string;
  logo: string;
  favicon: string;
  site_description: string;
  welcome_message: string;
  footer_text: string;
  social_links: {
    facebook: string;
    instagram: string;
    twitter: string;
  };
  slider_content: Array<{
    image: string;
    title: string;
    description: string;
    buttonText: string;
  }>;
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

  const [shippingSettings, setShippingSettings] = useState<ShippingSettings>({
    shipping_rate: 40,
    free_shipping_threshold: 400,
  });

  const [contentSettings, setContentSettings] = useState<ContentSettings>({
    hero_image: "",
    logo: "",
    favicon: "",
    site_description: "",
    welcome_message: "",
    footer_text: "",
    social_links: {
      facebook: "",
      instagram: "",
      twitter: "",
    },
    slider_content: defaultSlides,
  });

  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const { data: contentData, error: contentError } = await supabase
          .from("settings")
          .select("settings")
          .eq("type", "content")
          .single();

        if (contentError) throw contentError;
        if (contentData) {
          setContentSettings(contentData.settings);
        }

        const { data, error } = await supabase
          .from("settings")
          .select("settings")
          .eq("type", "shipping")
          .single();

        if (error) throw error;
        if (data) {
          setShippingSettings(data.settings);
        }
      } catch (error) {
        console.error("Error loading settings:", error);
        setError("Failed to load settings");
      }
    }

    loadSettings();
  }, []);

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

  async function handleShippingSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const { data, error } = await supabase
        .from("settings")
        .upsert([{ type: "shipping", settings: shippingSettings }])
        .select()
        .single();

      if (error) {
        console.error("Supabase error:", error);
        throw new Error(error.message || "Failed to update shipping settings");
      }

      if (!data) {
        throw new Error("No data returned after update");
      }

      setSuccess("Shipping settings updated successfully");
      console.log("Settings updated:", data);
    } catch (error: any) {
      console.error("Error updating shipping settings:", {
        message: error.message,
        details: error,
      });
      setError(error.message || "Failed to update shipping settings");
    } finally {
      setLoading(false);
    }
  }

  async function handleImageUpload(
    file: File,
    type: keyof ContentSettings | { slideIndex: number }
  ) {
    if (!file) return;

    try {
      setUploading(true);
      setError("");

      const fileExt = file.name.split(".").pop();
      const fileName =
        typeof type === "string"
          ? `${type}-${Date.now()}.${fileExt}`
          : `slide-${type.slideIndex}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("site-content")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("site-content").getPublicUrl(filePath);

      if (typeof type === "string") {
        setContentSettings((prev) => ({
          ...prev,
          [type]: publicUrl,
        }));
      } else {
        setContentSettings((prev) => ({
          ...prev,
          slider_content: prev.slider_content.map((slide, index) =>
            index === type.slideIndex ? { ...slide, image: publicUrl } : slide
          ),
        }));
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      setError("Error uploading image");
    } finally {
      setUploading(false);
    }
  }

  async function handleContentSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // First, check if a record exists
      const { data: existingData, error: fetchError } = await supabase
        .from("settings")
        .select("*")
        .eq("type", "content")
        .single();

      if (fetchError && fetchError.code !== "PGRST116") {
        // PGRST116 is "not found" error
        throw fetchError;
      }

      // Perform update or insert
      const { data, error } = await supabase
        .from("settings")
        .upsert({
          id: existingData?.id,
          type: "content",
          settings: contentSettings,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error("Supabase error:", error);
        throw new Error(error.message || "Failed to update content settings");
      }

      if (!data) {
        throw new Error("No data returned after update");
      }

      setSuccess("Content settings updated successfully");
      console.log("Content settings updated:", data);
    } catch (error: any) {
      console.error("Error updating content settings:", {
        message: error.message,
        error: error,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      setError(
        error.details ||
          error.message ||
          error.hint ||
          "Failed to update content settings"
      );
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
        {/* <Card className="p-6">
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
        </Card> */}

        {/* Shipping Settings */}
        <Card className="p-6">
          <div className="flex items-center gap-x-3 mb-6">
            <Truck className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-medium">Shipping Settings</h3>
          </div>

          <form onSubmit={handleShippingSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="shippingRate"
                  className="block text-sm font-medium text-gray-700"
                >
                  Shipping Rate (₹)
                </label>
                <input
                  type="number"
                  id="shippingRate"
                  min="0"
                  step="1"
                  value={shippingSettings.shipping_rate}
                  onChange={(e) =>
                    setShippingSettings({
                      ...shippingSettings,
                      shipping_rate: parseInt(e.target.value),
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Standard shipping rate for all orders
                </p>
              </div>

              <div>
                <label
                  htmlFor="freeShippingThreshold"
                  className="block text-sm font-medium text-gray-700"
                >
                  Free Shipping Threshold (₹)
                </label>
                <input
                  type="number"
                  id="freeShippingThreshold"
                  min="0"
                  step="1"
                  value={shippingSettings.free_shipping_threshold}
                  onChange={(e) =>
                    setShippingSettings({
                      ...shippingSettings,
                      free_shipping_threshold: parseInt(e.target.value),
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Orders above this amount qualify for free shipping
                </p>
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
        {/* <Card className="p-6">
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
        </Card> */}

        {/* Payment Settings */}
        {/* <Card className="p-6">
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
        </Card> */}

        {/* Content Settings */}
        <Card className="p-6">
          <div className="flex items-center gap-x-3 mb-6">
            <Store className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-medium">Content Settings</h3>
          </div>

          <form onSubmit={handleContentSubmit} className="space-y-6">
            {/* Logo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Logo
              </label>
              <div className="mt-1 flex items-center gap-x-4">
                {contentSettings.logo && (
                  <img
                    src={contentSettings.logo}
                    alt="Logo"
                    className="h-12 w-auto object-contain"
                  />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file, "logo");
                  }}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                />
              </div>
            </div>

            {/* Hero Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Hero Image
              </label>
              <div className="mt-1 flex items-center gap-x-4">
                {contentSettings.hero_image && (
                  <img
                    src={contentSettings.hero_image}
                    alt="Hero"
                    className="h-24 w-auto object-cover"
                  />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file, "hero_image");
                  }}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                />
              </div>
            </div>

            {/* Favicon Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Favicon
              </label>
              <div className="mt-1 flex items-center gap-x-4">
                {contentSettings.favicon && (
                  <img
                    src={contentSettings.favicon}
                    alt="Favicon"
                    className="h-8 w-8 object-contain"
                  />
                )}
                <input
                  type="file"
                  accept="image/x-icon,image/png"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file, "favicon");
                  }}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                />
              </div>
            </div>

            {/* Site Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Site Description
              </label>
              <textarea
                value={contentSettings.site_description}
                onChange={(e) =>
                  setContentSettings({
                    ...contentSettings,
                    site_description: e.target.value,
                  })
                }
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>

            {/* Welcome Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Welcome Message
              </label>
              <input
                type="text"
                value={contentSettings.welcome_message}
                onChange={(e) =>
                  setContentSettings({
                    ...contentSettings,
                    welcome_message: e.target.value,
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>

            {/* Footer Text */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Footer Text
              </label>
              <textarea
                value={contentSettings.footer_text}
                onChange={(e) =>
                  setContentSettings({
                    ...contentSettings,
                    footer_text: e.target.value,
                  })
                }
                rows={2}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>

            {/* Social Links */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-700">
                Social Links
              </h4>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Facebook
                  </label>
                  <input
                    type="url"
                    value={contentSettings.social_links.facebook}
                    onChange={(e) =>
                      setContentSettings({
                        ...contentSettings,
                        social_links: {
                          ...contentSettings.social_links,
                          facebook: e.target.value,
                        },
                      })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Instagram
                  </label>
                  <input
                    type="url"
                    value={contentSettings.social_links.instagram}
                    onChange={(e) =>
                      setContentSettings({
                        ...contentSettings,
                        social_links: {
                          ...contentSettings.social_links,
                          instagram: e.target.value,
                        },
                      })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Twitter
                  </label>
                  <input
                    type="url"
                    value={contentSettings.social_links.twitter}
                    onChange={(e) =>
                      setContentSettings({
                        ...contentSettings,
                        social_links: {
                          ...contentSettings.social_links,
                          twitter: e.target.value,
                        },
                      })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Slider Content */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-700">
                Slider Content
              </h4>
              {contentSettings.slider_content.map((slide, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <h5 className="text-sm font-medium">Slide {index + 1}</h5>
                    <button
                      type="button"
                      onClick={() => {
                        setContentSettings((prev) => ({
                          ...prev,
                          slider_content: prev.slider_content.filter(
                            (_, i) => i !== index
                          ),
                        }));
                      }}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </div>

                  {/* Slide Image */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Image
                    </label>
                    <div className="mt-1 flex items-center gap-x-4">
                      {slide.image && (
                        <img
                          src={slide.image}
                          alt={slide.title}
                          className="h-24 w-auto object-cover rounded"
                        />
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file)
                            handleImageUpload(file, { slideIndex: index });
                        }}
                        className="block w-full text-sm text-gray-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-md file:border-0
                          file:text-sm file:font-semibold
                          file:bg-blue-50 file:text-blue-700
                          hover:file:bg-blue-100"
                      />
                    </div>
                  </div>

                  {/* Slide Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Title
                    </label>
                    <input
                      type="text"
                      value={slide.title}
                      onChange={(e) =>
                        setContentSettings((prev) => ({
                          ...prev,
                          slider_content: prev.slider_content.map((s, i) =>
                            i === index ? { ...s, title: e.target.value } : s
                          ),
                        }))
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>

                  {/* Slide Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      value={slide.description}
                      onChange={(e) =>
                        setContentSettings((prev) => ({
                          ...prev,
                          slider_content: prev.slider_content.map((s, i) =>
                            i === index
                              ? { ...s, description: e.target.value }
                              : s
                          ),
                        }))
                      }
                      rows={2}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>

                  {/* Button Text */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Button Text
                    </label>
                    <input
                      type="text"
                      value={slide.buttonText}
                      onChange={(e) =>
                        setContentSettings((prev) => ({
                          ...prev,
                          slider_content: prev.slider_content.map((s, i) =>
                            i === index
                              ? { ...s, buttonText: e.target.value }
                              : s
                          ),
                        }))
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={() => {
                  setContentSettings((prev) => ({
                    ...prev,
                    slider_content: [
                      ...prev.slider_content,
                      {
                        image: "",
                        title: "New Slide",
                        description: "Add a description for this slide",
                        buttonText: "Click Here",
                      },
                    ],
                  }));
                }}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Add New Slide
              </button>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading || uploading}
                className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50"
              >
                <Save className="mr-2 h-4 w-4" />
                {uploading ? "Uploading..." : "Save Changes"}
              </button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
