"use client"
import React from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Plan } from './types';
import { PlanFeature } from './PlanFeature';

interface PlanCardProps {
  plan: Plan;
  onSelect: (plan: Plan) => void;
}

export const PlanCard: React.FC<PlanCardProps> = ({ plan, onSelect }) => (
  <Card 
    className={`relative bg-card/50 border-border transition-all duration-300 hover:bg-purple-900/20 hover:ring-1 ring-primary/40 ${
      plan.isPopular ? 'ring-2 ring-purple-500' : ''
    }`}
  >
    {plan.isPopular && (
      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
        <span className="bg-purple-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
          Most Popular
        </span>
      </div>
    )}
    
    <CardHeader className="text-center">
      <h3 className="text-xl font-semibold text-foreground mb-2">{plan.name}</h3>
      <div className="mb-2">
        <span className="text-3xl font-bold text-foreground">{plan.price}</span>
        <span className="text-muted-foreground text-sm">/{plan.period}</span>
      </div>
    </CardHeader>

    <CardContent>
      <ul className="space-y-3">
        {plan.features.map((feature) => (
          <PlanFeature key={feature} feature={feature} />
        ))}
      </ul>
    </CardContent>

    <CardFooter className=''>
      <button
        onClick={() => onSelect(plan)}
        className={`w-full py-2 rounded-lg font-medium transition-colors ${
          plan.isPopular
            ? 'bg-purple-500 hover:bg-purple-600 text-white'
            : 'bg-accent hover:bg-accent text-foreground'
        }`}
      >
        {plan.buttonText}
      </button>
    </CardFooter>
  </Card>
);