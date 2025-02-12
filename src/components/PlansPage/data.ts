import { Plan } from './types';

export const plans: Plan[] = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    features: [
      'Basic course access',
      'Unlimited access to articles',
      'Community forum access',
      'Mobile app access',
      'Limited Videos access',
      'Limited practice exercises',
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
    buttonText: 'Upgrade Now',
    isPopular: false
  }
];