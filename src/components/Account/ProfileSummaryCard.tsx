"use client"
import React from 'react';
import { Mail, Phone, MapPin, Calendar, Edit2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProfileSummaryCardProps } from './types';

export const ProfileSummaryCard: React.FC<ProfileSummaryCardProps> = ({ 
  profile, 
  status, 
  session, 
  onEditClick, 
  onAvatarRefresh 
}) => {
  if (!profile) return null;

  const contactInfo = [
    { icon: Mail, text: profile.email },
    { icon: Phone, text: profile.phone },
    { icon: MapPin, text: profile.location },
    { 
      icon: Calendar, 
      text: `Joined ${status === 'authenticated' 
        ? new Date(Date.now()).toLocaleDateString()
        : profile.joinDate}`
    }
  ];

  return (
    <Card className="md:col-span-1 bg-black/50 border-gray-700">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="relative group">
            <img
              src={status === 'authenticated' ? profile.image : `https://picsum.photos/seed/${Math.floor(Math.random() * 1000)}/150/150`}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover"
            />
            <div className="absolute -bottom-2 -right-2 flex gap-2">
              {!session && (
                <Button
                  size="icon"
                  variant="secondary"
                  className="w-8 h-8 rounded-full bg-purple-500 hover:bg-purple-600 text-white"
                  onClick={onAvatarRefresh}
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              )}
              {session && (
                <Button
                  size="icon"
                  variant="secondary"
                  className="w-8 h-8 rounded-full bg-purple-500 hover:bg-purple-600 text-white"
                  onClick={onEditClick}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
        <CardTitle className="text-xl font-bold text-white">
          {profile.name}
        </CardTitle>
        <p className="text-gray-400 text-sm mt-1">{profile.bio}</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {contactInfo.map(({ icon: Icon, text }, index) => (
            <div key={index} className="flex items-center text-gray-400">
              <Icon className="w-4 h-4 mr-2" />
              <span className="text-sm">{text}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};