import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Bookmark, Clock, Star, Shield } from 'lucide-react';

export const SavedPage = () => {
  const savedItems = [
    { id: 1, title: 'React Performance Optimization', type: 'Technical Guide', date: 'Jan 15, 2025', icon: Clock },
    { id: 2, title: 'TypeScript Advanced Patterns', type: 'Professional Development', date: 'Jan 20, 2025', icon: Star },
    { id: 3, title: 'Enterprise Web Security', type: 'Research Paper', date: 'Jan 25, 2025', icon: Shield }
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto bg-black min-h-screen">
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