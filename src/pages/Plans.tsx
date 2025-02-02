import React ,{useState} from 'react';
import { Check } from 'lucide-react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Dialog, } from '@radix-ui/react-dialog';
import { DialogHeader, DialogTitle , DialogDescription, DialogContent } from '@/components/ui/dialog';

export const PlansPage = () => {
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      features: [
        'Basic course access',
        'Limited practice exercises',
        'Community forum access',
        'Mobile app access'
      ],
      buttonText: 'Current Plan',
      isPopular: false
    },
    {
      name: 'Pro',
      price: '$15',
      period: 'per month',
      features: [
        'All Free features',
        'Advanced learning paths',
        'Personalized feedback',
        'Progress analytics',
        'Offline downloads',
        'Priority support'
      ],
      buttonText: 'Upgrade Now',
      isPopular: true
    },
    {
      name: 'Team',
      price: '$49',
      period: 'per month',
      features: [
        'All Pro features',
        'Team management',
        'Advanced analytics',
        'Custom learning paths',
        'API access',
        'Dedicated support'
      ],
      buttonText: 'Contact Sales',
      isPopular: false
    }
  ];

  interface Plan {
    name: string;
    price: string;
    period: string;
    features: string[];
    buttonText: string;
    isPopular: boolean;
  }

  const handlePlanSelection = (plan: Plan) => {
    setSelectedPlan(plan);
    setIsDialogOpen(true);
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
          <Card 
            key={plan.name}
            className={`relative bg-black/50 border-white/5 transition-all duration-300 hover:bg-purple-900/20 hover:ring-1 ring-purple-900 ${
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
              <h3 className="text-xl font-semibold text-white mb-2">{plan.name}</h3>
              <div className="mb-2">
                <span className="text-3xl font-bold text-white">{plan.price}</span>
                <span className="text-white/60 text-sm">/{plan.period}</span>
              </div>
            </CardHeader>

            <CardContent>
              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-purple-400" />
                    <span className="text-sm text-white/80">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>

            <CardFooter>
              <button
                onClick={()=> handlePlanSelection(plan)}
                className={`w-full py-2 rounded-lg font-medium transition-colors ${
                  plan.isPopular
                    ? 'bg-purple-500 hover:bg-purple-600 text-white'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                {plan.buttonText}
              </button>
            </CardFooter>
          </Card>
        ))}
      </div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-gray-900 text-white">
          <DialogHeader>
            <DialogTitle>{selectedPlan?.name} Plan</DialogTitle>
            <DialogDescription>
              {selectedPlan?.name === 'Free' 
                ? "You're already on the Free plan."
                : selectedPlan?.name === 'Team'
                  ? "Contact our sales team for more information on the Team plan."
                  : `Upgrade to the ${selectedPlan?.name} plan for ${selectedPlan?.price}/${selectedPlan?.period}`
              }
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <button
              onClick={() => setIsDialogOpen(false)}
              className="w-full py-2 rounded-lg font-medium bg-purple-500 hover:bg-purple-600 text-white transition-colors"
            >
              {selectedPlan?.name === 'Free' ? 'Close' : selectedPlan?.name === 'Team' ? 'Contact Sales' : 'Confirm Upgrade'}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PlansPage;