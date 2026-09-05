"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LearningProgressCardProps } from "./types";

export const LearningProgressCard: React.FC<LearningProgressCardProps> = ({
  progress,
}) => {
  if (!progress || Object.keys(progress).length === 0) return null;

  return (
    <Card className="bg-card/50 border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Learning Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Object.entries(progress).map(([skill, progressValue]) => (
            <div key={skill} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{skill}</span>
                <span className="text-muted-foreground">{progressValue}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full">
                <div
                  className="h-full bg-purple-500 rounded-full"
                  style={{ width: `${progressValue}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
