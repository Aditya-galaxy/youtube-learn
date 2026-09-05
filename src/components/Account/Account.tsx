"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { ProfileSummaryCard } from "./ProfileSummaryCard";
import { InterestsCard } from "./InterestsCard";
import { LearningProgressCard } from "./LearningProgressCard";
import { EditProfileDialog } from "./EditProfileDialog";
import type { UserProfile } from "./types";
import { DUMMY_PROFILE } from "./constants";

const AccountPage: React.FC = () => {
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<UserProfile>(DUMMY_PROFILE);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      setProfile((prev) => ({
        ...prev,
        name: session.user.name || prev.name,
        email: session.user.email || prev.email,
        image: session.user.image || prev.image,
      }));
    } else if (status === "unauthenticated") {
      setProfile(DUMMY_PROFILE);
    }
  }, [session, status]);

  // Picks a fresh seed and uses *that* seed. The previous version read the
  // `imageId` state it was about to replace, so the avatar always lagged one
  // click behind the seed shown in the UI.
  const generateNewAvatar = useCallback(() => {
    if (status === "authenticated") return;
    const seed = Math.floor(Math.random() * 1000);
    setProfile((prev) => ({
      ...prev,
      image: `https://picsum.photos/seed/${seed}/150/150`,
    }));
  }, [status]);

  const handleProfileSave = useCallback(
    (updatedProfile: UserProfile) => {
      if (status !== "authenticated") return;
      // Local-only for now: there is no profile write endpoint yet, so this
      // does not survive a reload.
      setProfile(updatedProfile);
      setIsEditing(false);
    },
    [status]
  );

  return (
    <div className="mx-auto max-w-[1100px] px-5 py-12 sm:px-10 sm:py-16">
      <div>
        <div className="border-b border-border pb-8">
          <p className="eyebrow">Account</p>
          <h1 className="mt-2 font-display text-4xl tracking-display text-foreground sm:text-5xl">
            Profile
          </h1>
        </div>

        <div className="grid grid-cols-1 gap-5 pt-10 md:grid-cols-3">
          <ProfileSummaryCard
            profile={profile}
            status={status}
            session={session}
            onEditClick={() => setIsEditing(true)}
            onAvatarRefresh={generateNewAvatar}
          />

          <div className="space-y-6 md:col-span-2">
            <InterestsCard interests={profile.interests} />
            <LearningProgressCard progress={profile.progress} />
          </div>
        </div>
      </div>

      {status === "authenticated" && (
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
