"use client";
import React from "react";
import { Button } from "@/components/ui/button";

type ProFeaturesProps = {
  onUpgradeClick: () => void;
};

const ProFeatures: React.FC<ProFeaturesProps> = ({ onUpgradeClick }) => (
  <div className="mt-10 rounded-lg bg-secondary p-5">
    <p className="eyebrow">Pro</p>
    <h2 className="mt-2 font-display text-xl tracking-display text-foreground">
      Go deeper.
    </h2>
    <p className="mt-2 text-sm leading-relaxed tracking-tightish text-muted-foreground">
      Unlimited feeds, learning paths and progress tracking.
    </p>
    <Button size="sm" className="mt-4 w-full" onClick={onUpgradeClick}>
      Upgrade
    </Button>
  </div>
);

export default ProFeatures;
