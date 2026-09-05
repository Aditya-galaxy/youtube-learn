"use client";
import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Plan } from "./types";
import { plans } from "./data";
import { PlanCard } from "./PlanCard";
import { UpgradeDialog } from "./UpgradeDialog";

export const PlansPage: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  return (
    <div className="mx-auto max-w-[1200px] px-5 py-16 sm:px-10 sm:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <p className="eyebrow">Pricing</p>
        <h1 className="mt-4 font-display text-5xl tracking-display text-foreground sm:text-6xl">
          Learn <em>deliberately</em>.
        </h1>
        <p className="mx-auto mt-5 max-w-md text-base leading-relaxed tracking-tightish text-muted-foreground">
          Start free. Upgrade when you want learning paths, progress tracking
          and an unlimited feed.
        </p>
      </div>

      <div className="mt-16 grid gap-5 md:grid-cols-3">
        {plans.map((plan) => (
          <PlanCard
            key={plan.name}
            plan={plan}
            onSelect={(p) => {
              setSelectedPlan(p);
              setIsDialogOpen(true);
            }}
          />
        ))}
      </div>

      <UpgradeDialog
        plan={selectedPlan}
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onConfirm={() => {
          setIsDialogOpen(false);
          if (selectedPlan?.name !== "Free") {
            toast({
              title: "Not available yet",
              description: "Payments are not set up on this deployment.",
              duration: 3000,
            });
          }
        }}
      />
    </div>
  );
};

export default PlansPage;
