export type AccountabilityArea = 
  | 'sex'
  | 'relationship'
  | 'drugs'
  | 'alcohol'
  | 'gambling'
  | 'important_dates'
  | 'financial'
  | 'children';

export interface UserProfile {
  id: string;
  name: string;
  age: number;
  location: string;
  city?: string;
  state?: string;
  zipcode?: string;
  sex?: string;
  ethnicity?: string;
  familyStatus: string;
  accountabilityAreas: AccountabilityArea[];
  avatar?: string;
  streakDays: number;
  joinedDate: string;
  phone_number?: string;
  phone_verified?: boolean;
}



export interface JournalEntry {
  id: string;
  date: string;
  content: string;
  mood?: string;
  tags: string[];
}

export interface CircleMember {
  id: string;
  name: string;
  avatar: string;
  status: 'active' | 'pending';
  joinedDate: string;
}

export interface Workshop {
  id: string;
  title: string;
  type: 'article' | 'voice' | 'video';
  duration?: string;
  category: AccountabilityArea;
  image: string;
  completed: boolean;
}


export interface CheckInAlert {
  id: string;
  triggeredAt: string;
  intervals: number[];
  currentIndex: number;
  active: boolean;
}
}


export interface MessageReaction {
  id: string;
  message_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
  user_name?: string;
  user_avatar?: string;
}

export interface Message {
  id: string;
  sender_id: string;
  recipient_id?: string;
  group_id?: string;
  content: string;
  read: boolean;
  read_at?: string;
  created_at: string;
  sender_name?: string;
  sender_avatar?: string;
  message_type?: 'text' | 'voice';
  audio_url?: string;
  audio_duration?: number;
  reactions?: MessageReaction[];
  reply_to_message_id?: string;
  reply_to_message?: Message;
  is_pinned?: boolean;
  pin_note?: string;
  edited_at?: string;
  edit_history?: Array<{
    content: string;
    edited_at: string;
  }>;
  deleted_at?: string;
  mentions?: string[];
}

export interface Group {
  id: string;
  name: string;
  avatar_url?: string;
  description?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: 'admin' | 'member';
  joined_at: string;
  notification_enabled: boolean;
  user_name?: string;
  user_avatar?: string;
}

export interface MediaItem {
  id: string;
  group_id: string;
  message_id?: string;
  user_id: string;
  media_type: 'image' | 'video' | 'audio' | 'file';
  media_url: string;
  thumbnail_url?: string;
  file_name?: string;
  file_size?: number;
  created_at: string;
  user_name?: string;
}








export interface Conversation {
  user_id: string;
  user_name: string;
  user_avatar?: string;
  last_message?: string;
  last_message_time?: string;
  unread_count: number;
}
