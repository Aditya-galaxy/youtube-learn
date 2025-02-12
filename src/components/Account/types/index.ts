export interface UserProgress {
  [skill: string]: number;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  location: string;
  joinDate: string;
  bio: string;
  interests: string[];
  image: string;
  progress: UserProgress;
}

export interface ProfileSummaryCardProps {
  profile: UserProfile;
  status: 'authenticated' | 'unauthenticated' | 'loading';
  session: any;
  onEditClick: () => void;
  onAvatarRefresh: () => void;
}

export interface InterestsCardProps {
  interests: string[];
}

export interface LearningProgressCardProps {
  progress: UserProgress;
}

export interface EditProfileDialogProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSave: (updatedProfile: UserProfile) => void;
}