import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Plan } from './types';

interface UpgradeDialogProps {
  plan: Plan | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export const UpgradeDialog: React.FC<UpgradeDialogProps> = ({ 
  plan, 
  isOpen, 
  onOpenChange, 
  onConfirm 
}) => (
  <Dialog open={isOpen} onOpenChange={onOpenChange}>
    <DialogContent className="bg-gray-900 text-white">
      <DialogHeader>
        <DialogTitle>{plan?.name} Plan</DialogTitle>
        <DialogDescription>
          {plan?.name === 'Free' 
            ? "You're already on the Free plan."
            : plan?.name === 'Team'
              ? "Contact our sales team for more information on the Team plan."
              : `Upgrade to the ${plan?.name} plan for ${plan?.price}/${plan?.period}`
          }
        </DialogDescription>
      </DialogHeader>
      <div className="mt-4">
        <button
          onClick={onConfirm}
          className="w-full py-2 rounded-lg font-medium bg-purple-500 hover:bg-purple-600 text-white transition-colors"
        >
          {plan?.name === 'Free' ? 'Close' : plan?.name === 'Team' ? 'Upgrade Now' : 'Confirm Upgrade'}
        </button>
      </div>
    </DialogContent>
  </Dialog>
);