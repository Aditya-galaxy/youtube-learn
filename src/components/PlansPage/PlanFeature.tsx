import React from 'react';
import { Check } from 'lucide-react';

interface PlanFeatureProps {
  feature: string;
}

export const PlanFeature: React.FC<PlanFeatureProps> = ({ feature }) => (
  <li className="flex items-center gap-2">
    <Check className="w-4 h-4 text-purple-400" />
    <span className="text-sm text-white/80">{feature}</span>
  </li>
);
