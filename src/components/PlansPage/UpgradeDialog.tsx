"use client";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plan } from "./types";

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
  onConfirm,
}) => (
  <Dialog open={isOpen} onOpenChange={onOpenChange}>
    <DialogContent className="bg-card sm:max-w-md">
      <DialogHeader>
        <DialogTitle className="text-left font-display text-2xl tracking-display">
          {plan?.name}
        </DialogTitle>
        <DialogDescription className="text-left text-sm leading-relaxed tracking-tightish">
          {plan?.name === "Free"
            ? "You are already on the Free plan."
            : plan?.name === "Team"
              ? "Contact sales to set up a Team plan."
              : `Upgrade to ${plan?.name} for ${plan?.price} ${plan?.period}.`}
        </DialogDescription>
      </DialogHeader>
      <Button className="mt-2 w-full" onClick={onConfirm}>
        {plan?.name === "Free" ? "Close" : "Continue"}
      </Button>
    </DialogContent>
  </Dialog>
);
