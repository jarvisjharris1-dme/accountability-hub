import { UserProfile, JournalEntry, CircleMember, Workshop } from '../types';


export const mockUser: UserProfile = {
  id: '1',
  name: 'Marcus Johnson',
  age: 34,
  location: 'Atlanta, GA',
  familyStatus: 'Married, 2 children',
  accountabilityAreas: ['financial', 'important_dates', 'children'],
  avatar: 'https://d64gsuwffb70l.cloudfront.net/6906b0c9650ee0590aaf52d9_1762046205196_8fbaf12c.webp',
  streakDays: 23,
  joinedDate: '2024-10-10'
};

export const mockCircle: CircleMember[] = [
  {
    id: '2',
    name: 'David Chen',
    avatar: 'https://d64gsuwffb70l.cloudfront.net/6906b0c9650ee0590aaf52d9_1762046206977_682ba12e.webp',
    status: 'active',
    joinedDate: '2024-10-12'
  },
  {
    id: '3',
    name: 'James Williams',
    avatar: 'https://d64gsuwffb70l.cloudfront.net/6906b0c9650ee0590aaf52d9_1762046208719_63ec0529.webp',
    status: 'active',
    joinedDate: '2024-10-15'
  }
];

export const mockWorkshops: Workshop[] = [

  {
    id: '1',
    title: 'Building Financial Discipline',
    type: 'article',
    category: 'financial',
    image: 'https://d64gsuwffb70l.cloudfront.net/6906b0c9650ee0590aaf52d9_1762046216185_62841db2.webp',
    completed: false
  },
  {
    id: '2',
    title: 'Being Present for Your Kids',
    type: 'voice',
    duration: '8 min',
    category: 'children',
    image: 'https://d64gsuwffb70l.cloudfront.net/6906b0c9650ee0590aaf52d9_1762046217917_6ecd1248.webp',
    completed: false
  }
];
