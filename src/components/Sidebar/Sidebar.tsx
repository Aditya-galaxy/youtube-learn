"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Navigation from "./Navigation";
import ProFeaturesBanner from "./ProFeatures";
import BuyMeACoffee from "./BuyMeACoffee";

/**
 * Hidden below `md`, where the navbar's sheet takes over. It used to stay
 * mounted at a fixed 176px on every viewport and sit on top of the content.
 */
const Sidebar = () => {
  const router = useRouter();

  return (
    <aside className="fixed left-0 top-20 z-0 hidden h-[calc(100vh-5rem)] w-44 overflow-y-auto border-r border-border bg-background/50 backdrop-blur-xl md:block">
      <div className="p-4">
        <Navigation />
        <ProFeaturesBanner onUpgradeClick={() => router.push("/plans")} />
        <BuyMeACoffee />
      </div>
    </aside>
  );
};

export default React.memo(Sidebar);
