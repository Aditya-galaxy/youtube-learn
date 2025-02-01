import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Bookmark, Clock, Star, Settings as SettingsIcon, Bell, Moon, Shield, User } from 'lucide-react';

// Saved Component
export const SavedPage = () => {
  const savedItems = [
    { id: 1, title: 'Introduction to React', type: 'Course', date: '2025-01-15', icon: Clock },
    { id: 2, title: 'Advanced TypeScript', type: 'Tutorial', date: '2025-01-20', icon: Star },
    { id: 3, title: 'Web Security Basics', type: 'Article', date: '2025-01-25', icon: Shield }
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Bookmark className="w-6 h-6 text-purple-400" />
        <h1 className="text-2xl font-semibold text-white">Saved Items</h1>
      </div>

      <div className="grid gap-4">
        {savedItems.map((item) => (
          <Card key={item.id} className="bg-black/50 border-white/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <item.icon className="w-5 h-5 text-purple-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-medium">{item.title}</h3>
                  <p className="text-sm text-white/60">{item.type}</p>
                </div>
                <span className="text-sm text-white/40">{item.date}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SavedPage;