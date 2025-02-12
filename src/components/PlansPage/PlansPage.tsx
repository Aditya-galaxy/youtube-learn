import React, { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Plan } from './types';
import { plans } from './data';
import { PlanCard } from './PlanCard'
import { UpgradeDialog } from './UpgradeDialog';

export const PlansPage: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const handlePlanSelection = (plan: Plan) => {
    setSelectedPlan(plan);
    setIsDialogOpen(true);
  };

  const handleConfirm = () => {
    setIsDialogOpen(false);
    if (selectedPlan?.name !== 'Free') {
      toast({
        title: 'Failure',
        description: 'Payment Gateway not setup yet.',
        duration: 3000
      });
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-white mb-4">Choose Your Plan</h1>
        <p className="text-white/60 max-w-2xl mx-auto">
          Unlock advanced features and accelerate your learning journey with our premium plans
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <PlanCard
            key={plan.name}
            plan={plan}
            onSelect={handlePlanSelection}
          />
        ))}
      </div>

      <UpgradeDialog
        plan={selectedPlan}
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onConfirm={handleConfirm}
      />
    </div>
  );
};

export default PlansPage;