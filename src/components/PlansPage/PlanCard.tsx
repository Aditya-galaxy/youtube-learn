"use client";
import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Plan } from "./types";
import { PlanFeature } from "./PlanFeature";

interface PlanCardProps {
  plan: Plan;
  onSelect: (plan: Plan) => void;
}

export const PlanCard: React.FC<PlanCardProps> = ({ plan, onSelect }) => (
  <div
    className={cn(
      "flex flex-col rounded-lg p-8",
      plan.isPopular ? "bg-primary text-primary-foreground" : "bg-card"
    )}
  >
    <div className="flex items-center justify-between">
      <p
        className={cn(
          "eyebrow",
          plan.isPopular && "text-primary-foreground/60"
        )}
      >
        {plan.name}
      </p>
      {plan.isPopular && (
        <span className="rounded-full bg-primary-foreground/15 px-3 py-1 text-xs tracking-tightish">
          Most popular
        </span>
      )}
    </div>

    <p className="mt-6 font-display text-5xl tracking-display">{plan.price}</p>
    <p
      className={cn(
        "mt-1 text-sm tracking-tightish",
        plan.isPopular ? "text-primary-foreground/60" : "text-muted-foreground"
      )}
    >
      {plan.period}
    </p>

    <ul className="mt-8 flex-1 space-y-3 border-t border-current/10 pt-8">
      {plan.features.map((feature) => (
        <PlanFeature key={feature} feature={feature} />
      ))}
    </ul>

    <Button
      variant={plan.isPopular ? "secondary" : "default"}
      className="mt-8 w-full"
      onClick={() => onSelect(plan)}
    >
      {plan.buttonText}
    </Button>
  </div>
);
