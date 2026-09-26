"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Navigation from "./Navigation";
import ProFeaturesBanner from "./ProFeatures";

const Sidebar = () => {
  const router = useRouter();

  return (
    <aside className="fixed left-0 top-20 z-0 hidden h-[calc(100vh-5rem)] w-64 overflow-y-auto bg-background md:block">
      <div className="px-4 py-6">
        <Navigation />
        <ProFeaturesBanner onUpgradeClick={() => router.push("/plans")} />
      </div>
    </aside>
  );
};

export default React.memo(Sidebar);
