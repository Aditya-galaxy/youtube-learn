import { UserProfile } from './types';

export const DUMMY_PROFILE: UserProfile = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '+1 (555) 123-4567',
  location: 'San Francisco, CA',
  joinDate: 'January 2024',
  bio: 'Passionate learner | Full Stack Developer | Always exploring new technologies',
  interests: ['React', 'TypeScript', 'Node.js', 'UI/UX Design'],
  image: `https://picsum.photos/seed/abcd/150/150`,
  progress: {
    'React Mastery': 75,
    'TypeScript Fundamentals': 60
  }
};

export const MAX_INTERESTS = 10;