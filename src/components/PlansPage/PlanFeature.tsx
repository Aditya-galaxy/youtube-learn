"use client";
import React from "react";
import { Check } from "lucide-react";

export const PlanFeature: React.FC<{ feature: string }> = ({ feature }) => (
  <li className="flex items-start gap-3 text-sm tracking-tightish">
    <Check
      className="mt-0.5 h-4 w-4 shrink-0 opacity-40"
      strokeWidth={1.75}
      aria-hidden
    />
    <span>{feature}</span>
  </li>
);
