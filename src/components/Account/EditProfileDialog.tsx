"use client"
import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { EditProfileDialogProps } from './types';
import { MAX_INTERESTS } from './constants';

export const EditProfileDialog: React.FC<EditProfileDialogProps> = ({ 
  isOpen, 
  onClose, 
  profile, 
  onSave 
}) => {
  const [editForm, setEditForm] = useState(profile);
  const [newInterest, setNewInterest] = useState('');

  // `useState(profile)` only reads its argument on the first render, so the
  // form kept showing the placeholder profile after the session loaded and
  // saving wrote those stale values back. Reset whenever the dialog opens.
  useEffect(() => {
    if (isOpen) {
      setEditForm(profile);
      setNewInterest('');
    }
  }, [isOpen, profile]);

  const addInterest = () => {
    if (!newInterest) return;
    
    const trimmedInterest = newInterest.trim();
    if (
      trimmedInterest && 
      !editForm.interests.includes(trimmedInterest) && 
      editForm.interests.length < MAX_INTERESTS
    ) {
      setEditForm(prev => ({
        ...prev,
        interests: [...prev.interests, trimmedInterest]
      }));
      setNewInterest('');
    }
  };

  const removeInterest = (interest: string) => {
    setEditForm(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i !== interest),
    }));
  };

  const handleSave = () => {
    const sanitizedProfile = {
      ...editForm,
      name: editForm.name.trim(),
      bio: editForm.bio.trim(),
      interests: editForm.interests.map(i => i.trim()).filter(Boolean)
    };

    onSave(sanitizedProfile);
    onClose();
  };

  // Helper function to ensure string values
  const getStringValue = (value: any): string => {
    if (typeof value === 'string') {
      return value;
    }
    // If it's not a string, convert to string or return empty string
    return String(value) || '';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-popover text-foreground">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {[
            { label: 'Name', field: 'name' },
            { label: 'Phone', field: 'phone' },
            { label: 'Location', field: 'location' },
          ].map(({ label, field }) => (
            <div key={field}>
              <label className="text-sm text-muted-foreground">{label}</label>
              <Input
                value={getStringValue(editForm[field as keyof typeof editForm])}
                onChange={(e) => setEditForm(prev => ({ ...prev, [field]: e.target.value }))}
                className="bg-muted border-border text-foreground"
              />
            </div>
          ))}
          
          <div>
            <label className="text-sm text-muted-foreground">Bio</label>
            <Textarea
              value={getStringValue(editForm.bio)}
              onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
              className="bg-muted border-border text-foreground"
            />
          </div>

          <div>
            <label className="text-sm text-muted-foreground">Interests</label>
            <div className="flex gap-2">
              <Input
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addInterest();
                  }
                }}
                className="bg-muted border-border text-foreground"
                placeholder="Add new interest"
              />
              <Button onClick={addInterest} className="bg-purple-500 hover:bg-purple-600 text-white">
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {editForm.interests.map((interest) => (
                <span
                  key={interest}
                  className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-sm flex items-center gap-2"
                >
                  {interest}
                  <button
                    onClick={() => removeInterest(interest)}
                    className="text-purple-400 hover:text-purple-300"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-border text-muted-foreground hover:bg-muted"
            >
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-purple-600 hover:bg-purple-700 text-white">
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};