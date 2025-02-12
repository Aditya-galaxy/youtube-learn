import React, { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";
import { ProfileSummaryCard } from './ProfileSummaryCard';
import { InterestsCard } from './InterestsCard';
import { LearningProgressCard } from './LearningProgressCard';
import { EditProfileDialog } from './EditProfileDialog';
import { UserProfile } from './types';
import { DUMMY_PROFILE } from './constants';

const AccountPage: React.FC = () => {
  const { data: session, status } = useSession();
  const [imageId, setImageId] = useState(Math.floor(Math.random() * 1000));
  const [profile, setProfile] = useState<UserProfile>(DUMMY_PROFILE);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      setProfile(prev => ({
        ...prev,
        name: session.user.name || prev.name,
        email: session.user.email || prev.email,
        image: session.user.image || prev.image,
      }));
    } else {
      setProfile(DUMMY_PROFILE);
    }
  }, [session, status]);

  const generateNewAvatar = () => {
    if (status !== 'authenticated') {
      setImageId(Math.floor(Math.random() * 1000));
      setProfile(prev => ({
        ...prev,
        image: `https://picsum.photos/seed/${imageId}/150/150`
      }));
    }
  };

  const handleProfileSave = async (updatedProfile: UserProfile) => {
    if (status !== 'authenticated') {
      return;
    }
    
    try {
      // Here you would update the backend if authenticated
      // await updateUserProfile(session.user.id, updatedProfile);
      setProfile(updatedProfile);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  return (
    <div className="min-h-screen bg-black pt-24 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ProfileSummaryCard 
            profile={profile} 
            status={status} 
            session={session}
            onEditClick={() => setIsEditing(true)}
            onAvatarRefresh={generateNewAvatar}
          />
          
          <div className="md:col-span-2 space-y-6">
            <InterestsCard interests={profile.interests} />
            <LearningProgressCard progress={profile.progress} />
          </div>
        </div>
      </div>

      {session && (
        <EditProfileDialog
          isOpen={isEditing}
          onClose={() => setIsEditing(false)}
          profile={profile}
          onSave={handleProfileSave}
        />
      )}
    </div>
  );
};

export default AccountPage;