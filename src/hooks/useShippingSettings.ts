import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface ShippingSettings {
  shipping_rate: number;
  free_shipping_threshold: number;
}

export function useShippingSettings() {
  const [settings, setSettings] = useState<ShippingSettings>({
    shipping_rate: 40,
    free_shipping_threshold: 400,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        const { data, error } = await supabase
          .from("settings")
          .select("settings")
          .eq("type", "shipping")
          .single();

        if (error) throw error;
        if (data) {
          setSettings(data.settings);
        }
      } catch (err) {
        console.error("Error loading shipping settings:", err);
        setError("Failed to load shipping settings");
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, []);

  const calculateShipping = (subtotal: number) => {
    return subtotal >= settings.free_shipping_threshold
      ? 0
      : settings.shipping_rate;
  };

  return {
    settings,
    loading,
    error,
    calculateShipping,
  };
}
