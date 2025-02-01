import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Bookmark, Clock, Star, Settings as SettingsIcon, Bell, Moon, Shield, User } from 'lucide-react';
export const SettingsPage = () => {
  const settingsGroups = [
    {
      title: 'Account',
      icon: User,
      settings: [
        { id: 'notifications', label: 'Push Notifications', icon: Bell },
        { id: 'darkMode', label: 'Dark Mode', icon: Moon },
      ]
    },
    {
      title: 'Privacy',
      icon: Shield,
      settings: [
        { id: 'activityTracking', label: 'Activity Tracking', icon: Clock },
        { id: 'dataSharing', label: 'Data Sharing', icon: Star },
      ]
    }
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <SettingsIcon className="w-6 h-6 text-purple-400" />
        <h1 className="text-2xl font-semibold text-white">Settings</h1>
      </div>

      <div className="grid gap-6">
        {settingsGroups.map((group) => (
          <Card key={group.title} className="bg-black/50 border-white/5">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <group.icon className="w-5 h-5 text-purple-400" />
                <CardTitle className="text-lg text-white">{group.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {group.settings.map((setting) => (
                  <div key={setting.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <setting.icon className="w-4 h-4 text-white/60" />
                      <span className="text-sm text-white/80">{setting.label}</span>
                    </div>
                    <Switch />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SettingsPage;