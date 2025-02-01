import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Calendar, Edit2, RefreshCw } from 'lucide-react';
import { Button } from '../components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const AccountPage = () => {
  const [imageId, setImageId] = useState(Math.floor(Math.random() * 1000));
  
  const userProfile = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    joinDate: 'January 2024',
    bio: 'Passionate learner | Full Stack Developer | Always exploring new technologies',
    interests: ['React', 'TypeScript', 'Node.js', 'UI/UX Design'],
  };

  const generateNewAvatar = () => {
    setImageId(Math.floor(Math.random() * 1000));
  };

  return (
    <div className="min-h-screen bg-black pt-24 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Summary Card */}
          <Card className="md:col-span-1 bg-black/50 border-white/10">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="relative group">
                  <img
                    src={`https://picsum.photos/seed/${imageId}/150/150`}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover"
                  />
                  <div className="absolute -bottom-2 -right-2 flex gap-2">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="w-8 h-8 rounded-full bg-purple-500 hover:bg-purple-600 text-white"
                      onClick={generateNewAvatar}
                    >
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="w-8 h-8 rounded-full bg-purple-500 hover:bg-purple-600 text-white"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
              <CardTitle className="text-xl font-bold text-white">
                {userProfile.name}
              </CardTitle>
              <p className="text-white/60 text-sm mt-1">{userProfile.bio}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center text-white/60">
                  <Mail className="w-4 h-4 mr-2" />
                  <span className="text-sm">{userProfile.email}</span>
                </div>
                <div className="flex items-center text-white/60">
                  <Phone className="w-4 h-4 mr-2" />
                  <span className="text-sm">{userProfile.phone}</span>
                </div>
                <div className="flex items-center text-white/60">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span className="text-sm">{userProfile.location}</span>
                </div>
                <div className="flex items-center text-white/60">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span className="text-sm">Joined {userProfile.joinDate}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Content Area */}
          <div className="md:col-span-2 space-y-6">
            {/* Interests */}
            <Card className="bg-black/50 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Interests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {userProfile.interests.map((interest) => (
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

            {/* Learning Progress */}
            <Card className="bg-black/50 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Learning Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">React Mastery</span>
                      <span className="text-white/60">75%</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full">
                      <div className="h-full w-3/4 bg-purple-500 rounded-full" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">TypeScript Fundamentals</span>
                      <span className="text-white/60">60%</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full">
                      <div className="h-full w-3/5 bg-purple-500 rounded-full" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;