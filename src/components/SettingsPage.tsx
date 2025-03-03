"use client"
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Settings as SettingsIcon, User, Bell, Shield } from 'lucide-react';

interface Settings {
    pushNotifications: boolean;
    activityTracking: boolean;
    dataSharing: boolean;
  }

  interface Setting {
    key: keyof Settings;
    label: string;
    icon: React.ComponentType;
  }

  interface SettingsGroup {
    title: string;
    icon: React.ComponentType;
    settings: Setting[];
  }
export const SettingsPage = () => {
  const [settings, setSettings] = useState<Settings>({
    pushNotifications: false,
    activityTracking: false,
    dataSharing: false
  });

  const toggleSetting = (settingKey: keyof Settings) => {
    setSettings(prev => ({
      ...prev,
      [settingKey]: !prev[settingKey]
    }));
  };

  const settingsGroups = [
    {
      title: 'Account',
      icon: User,
      settings: [
        { 
          key: 'pushNotifications', 
          label: 'Push Notifications', 
          icon: Bell 
        }
      ]
    },
    {
      title: 'Privacy',
      icon: Shield,
      settings: [
        { 
          key: 'activityTracking', 
          label: 'Activity Tracking', 
          icon: Bell 
        },
        { 
          key: 'dataSharing', 
          label: 'Data Sharing', 
          icon: Shield 
        }
      ]
    }
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto bg-black min-h-screen">
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
                  <div key={setting.key} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <setting.icon className="w-4 h-4 text-white/60" />
                      <span className="text-sm text-white/80">{setting.label}</span>
                    </div>
                    <Switch 
                      checked={settings[setting.key as keyof Settings]} 
                      onCheckedChange={() => toggleSetting(setting.key as keyof Settings)}
                    />
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