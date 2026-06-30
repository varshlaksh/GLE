"use client";

import { useEffect, useState } from "react";
import type { StoreSettings } from "@/types";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [error, setError]       = useState<string | null>(null);
  const [saving, setSaving]     = useState(false);
  const [success, setSuccess]   = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((j) => (j.error ? setError(j.error) : setSettings(j.data)))
      .catch(() => setError("Could not load settings"));
  }, []);

  const handleToggleCod = async () => {
    if (!settings) return;
    const next = !settings.cod_enabled;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cod_enabled: next }),
      });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error ?? "Could not save");
      setSettings(json.data);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <span className="text-sm font-medium uppercase tracking-widest text-clay">
          Configuration
        </span>
        <h1 className="mt-2 font-display text-3xl text-ink sm:text-4xl">
          Store Settings
        </h1>
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-clay/10 px-4 py-3 text-sm text-clay-dark">
          {error}
        </p>
      )}

      {settings === null && !error && (
        <div className="h-28 animate-pulse rounded-2xl border border-sand-dark/60 bg-white" />
      )}

      {settings && (
        <div className="max-w-2xl space-y-4">
          <div className="flex items-center justify-between rounded-2xl border border-sand-dark/60 bg-white p-6">
            <div>
              <h2 className="font-display text-lg text-ink">Cash on Delivery</h2>
              <p className="mt-1 max-w-md text-sm text-ink/60">
                When enabled, customers can choose to pay in cash when their
                order is delivered, instead of paying online via Razorpay.
              </p>
            </div>

            <button
              onClick={handleToggleCod}
              disabled={saving}
              role="switch"
              aria-checked={settings.cod_enabled}
              className={`relative h-7 w-12 shrink-0 rounded-full transition-colors disabled:opacity-60 ${
                settings.cod_enabled ? "bg-clay" : "bg-sand-dark"
              }`}
            >
              <span
                className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                  settings.cod_enabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <span className={`h-2 w-2 rounded-full ${settings.cod_enabled ? "bg-moss" : "bg-ink/30"}`} />
            <span className="text-ink/60">
              COD is currently{" "}
              <strong className="text-ink">
                {settings.cod_enabled ? "enabled" : "disabled"}
              </strong>{" "}
              for customers at checkout.
            </span>
          </div>

          {success && (
            <p className="text-sm font-medium text-moss">✓ Settings saved</p>
          )}
        </div>
      )}
    </div>
  );
}
