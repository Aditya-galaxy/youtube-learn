import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { InterestsCardProps } from './types';

export const InterestsCard: React.FC<InterestsCardProps> = ({ interests }) => {
  if (!Array.isArray(interests) || interests.length === 0) return null;

  return (
    <Card className="bg-black/50 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Interests</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {interests.map((interest) => (
            <span
              key={interest}
              className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-sm"
            >
              {interest}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};