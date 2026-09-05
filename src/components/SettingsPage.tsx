"use client";
import React, { useState } from "react";
import { Switch } from "@/components/ui/switch";

interface Settings {
  pushNotifications: boolean;
  activityTracking: boolean;
  dataSharing: boolean;
}

const GROUPS: Array<{
  title: string;
  items: Array<{ key: keyof Settings; label: string; hint: string }>;
}> = [
  {
    title: "Account",
    items: [
      {
        key: "pushNotifications",
        label: "Push notifications",
        hint: "New courses and weekly progress summaries.",
      },
    ],
  },
  {
    title: "Privacy",
    items: [
      {
        key: "activityTracking",
        label: "Activity tracking",
        hint: "Use watch history to tune recommendations.",
      },
      {
        key: "dataSharing",
        label: "Data sharing",
        hint: "Share anonymised usage data to improve the product.",
      },
    ],
  },
];

export const SettingsPage = () => {
  const [settings, setSettings] = useState<Settings>({
    pushNotifications: false,
    activityTracking: false,
    dataSharing: false,
  });

  return (
    <div className="mx-auto max-w-3xl px-5 py-12 sm:px-10 sm:py-16">
      <div className="border-b border-border pb-8">
        <p className="eyebrow">Preferences</p>
        <h1 className="mt-2 font-display text-4xl tracking-display text-foreground sm:text-5xl">
          Settings
        </h1>
      </div>

      {GROUPS.map((group) => (
        <section key={group.title} className="border-b border-border py-10">
          <h2 className="font-display text-2xl tracking-display text-foreground">
            {group.title}
          </h2>
          <div className="mt-6 space-y-6">
            {group.items.map((item) => (
              <div
                key={item.key}
                className="flex items-start justify-between gap-8"
              >
                <div className="min-w-0">
                  <p className="text-sm tracking-tightish text-foreground">
                    {item.label}
                  </p>
                  <p className="mt-1 text-sm tracking-tightish text-muted-foreground">
                    {item.hint}
                  </p>
                </div>
                <Switch
                  checked={settings[item.key]}
                  aria-label={item.label}
                  onCheckedChange={() =>
                    setSettings((prev) => ({
                      ...prev,
                      [item.key]: !prev[item.key],
                    }))
                  }
                />
              </div>
            ))}
          </div>
        </section>
      ))}

      <p className="pt-8 text-xs tracking-tightish text-muted-foreground">
        These preferences are not stored yet — they reset on reload.
      </p>
    </div>
  );
};

export default SettingsPage;
