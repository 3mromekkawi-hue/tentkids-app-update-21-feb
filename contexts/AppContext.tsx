import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import translations, { Language } from '@/constants/translations';
import * as Crypto from 'expo-crypto';
import { Audio } from 'expo-av';

export interface UserProfile {
  id: string;
  nickname: string;
  avatarId: string;
  tentColor: string;
  tentGlow: string;
  status: string;
  friendCount: number;
  createdAt: number;
}

export interface Post {
  id: string;
  authorId: string;
  authorNickname: string;
  authorAvatarId: string;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  reactions: Record<string, string[]>;
  comments: SafeComment[];
  createdAt: number;
  reported: boolean;
}

export interface SafeComment {
  id: string;
  authorId: string;
  authorNickname: string;
  authorAvatarId: string;
  commentKey: string;
  createdAt: number;
}

export interface Story {
  id: string;
  authorId: string;
  authorNickname: string;
  authorAvatarId: string;
  color: string;
  iconName: string;
  createdAt: number;
}

export interface FriendRequest {
  id: string;
  fromId: string;
  fromNickname: string;
  fromAvatarId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: number;
}

export interface Notification {
  id: string;
  type: 'reaction' | 'comment' | 'friend_request' | 'friend_accepted' | 'system';
  titleAr: string;
  titleEn: string;
  messageAr: string;
  messageEn: string;
  read: boolean;
  createdAt: number;
}

export interface VideoItem {
  id: string;
  titleAr: string;
  titleEn: string;
  thumbnailColor: string;
  iconName: string;
  videoUrl: string;
  reactions: Record<string, string[]>;
  duration: string;
  createdAt: number;
}

interface AppContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
  profile: UserProfile | null;
  setProfile: (profile: UserProfile | null) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  isOnboarded: boolean;
  setIsOnboarded: (val: boolean) => void;
  hasAgreedTerms: boolean;
  setHasAgreedTerms: (val: boolean) => void;
  posts: Post[];
  addPost: (content: string, imageUrl?: string, videoUrl?: string) => void;
  reactToPost: (postId: string, emoji: string) => void;
  addSafeComment: (postId: string, commentKey: string) => void;
  reportPost: (postId: string) => void;
  stories: Story[];
  addStory: (color: string, iconName: string) => void;
  friends: FriendRequest[];
  sendFriendRequest: (toNickname: string, toAvatarId: string) => void;
  acceptFriend: (requestId: string) => void;
  rejectFriend: (requestId: string) => void;
  notifications: Notification[];
  markNotificationRead: (notifId: string) => void;
  unreadCount: number;
  videos: VideoItem[];
  reactToVideo: (videoId: string, emoji: string) => void;
  sessionStartTime: number;
  resetSessionTime: () => void;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

const KEYS = {
  LANG: '@tk_lang',
  PROFILE: '@tk_profile',
  ONBOARDED: '@tk_onboarded',
  TERMS: '@tk_terms',
  POSTS: '@tk_posts',
  STORIES: '@tk_stories',
  FRIENDS: '@tk_friends',
  NOTIFS: '@tk_notifs',
  VIDEOS: '@tk_videos',
};

const samplePosts: Post[] = [
  {
    id: 'sp1', authorId: 'bot1', authorNickname: 'Cupcake', authorAvatarId: 'cupcake',
    content: 'Welcome to Tent-Kids! Have fun everyone!',
    reactions: { 'heart': ['bot2'] }, comments: [], createdAt: Date.now() - 3600000, reported: false,
  },
  {
    id: 'sp2', authorId: 'bot2', authorNickname: 'Bear', authorAvatarId: 'bear',
    content: 'I love my tent color! What about you?',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    reactions: { 'star': ['bot1'] }, comments: [], createdAt: Date.now() - 7200000, reported: false,
  },
  {
    id: 'sp3', authorId: 'bot3', authorNickname: 'Bunny', authorAvatarId: 'rabbit',
    content: 'Check out this cool video!',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    reactions: {}, comments: [], createdAt: Date.now() - 10800000, reported: false,
  },
];

const sampleStories: Story[] = [
  { id: 'ss1', authorId: 'bot1', authorNickname: 'Cupcake', authorAvatarId: 'cupcake', color: '#FF80AB', iconName: 'cupcake', createdAt: Date.now() - 1800000 },
  { id: 'ss2', authorId: 'bot2', authorNickname: 'Bear', authorAvatarId: 'bear', color: '#B388FF', iconName: 'teddy-bear', createdAt: Date.now() - 3600000 },
];

const sampleVideos: VideoItem[] = [
  {
    id: 'v1', titleAr: 'مغامرة في أرض الحلويات', titleEn: 'Candy Land Adventure',
    thumbnailColor: '#FFB74D', iconName: 'candy',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    reactions: {}, duration: '3:45', createdAt: Date.now() - 86400000,
  },
  {
    id: 'v2', titleAr: 'تعلم الألوان مع الكب كيك', titleEn: 'Learn Colors with Cupcakes',
    thumbnailColor: '#F48FB1', iconName: 'cupcake',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    reactions: {}, duration: '5:12', createdAt: Date.now() - 172800000,
  },
  {
    id: 'v3', titleAr: 'قصة الخيمة السحرية', titleEn: 'Magic Tent Story',
    thumbnailColor: '#7E57C2', iconName: 'tent',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    reactions: {}, duration: '8:30', createdAt: Date.now() - 259200000,
  },
  {
    id: 'v4', titleAr: 'أغنية الآيس كريم', titleEn: 'Ice Cream Song',
    thumbnailColor: '#4FC3F7', iconName: 'ice-cream',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    reactions: {}, duration: '2:58', createdAt: Date.now() - 345600000,
  },
];

export function AppProvider({ children }: { children: ReactNode }) {
  const [language, setLangState] = useState<Language>('ar');
  const [profile, setProfileState] = useState<UserProfile | null>(null);
  const [isOnboarded, setOnboardedState] = useState(false);
  const [hasAgreedTerms, setTermsState] = useState(false);
  const [posts, setPosts] = useState<Post[]>(samplePosts);
  const [stories, setStories] = useState<Story[]>(sampleStories);
  const [friends, setFriends] = useState<FriendRequest[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [videos, setVideos] = useState<VideoItem[]>(sampleVideos);
  const [sessionStartTime, setSessionStartTime] = useState(Date.now());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: false,
          interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: false,
          interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
          playThroughEarpieceAndroid: false,
        });
          await Audio.setIsEnabledAsync(true);
      } catch (e) {
        console.warn('Failed to set audio mode', e);
      }
      await loadData();
    })();
  }, []);

  const loadData = async () => {
    try {
      const [lang, prof, onb, terms, pst, st, fr, notif, vid] = await Promise.all([
        AsyncStorage.getItem(KEYS.LANG), AsyncStorage.getItem(KEYS.PROFILE),
        AsyncStorage.getItem(KEYS.ONBOARDED), AsyncStorage.getItem(KEYS.TERMS),
        AsyncStorage.getItem(KEYS.POSTS), AsyncStorage.getItem(KEYS.STORIES),
        AsyncStorage.getItem(KEYS.FRIENDS), AsyncStorage.getItem(KEYS.NOTIFS),
        AsyncStorage.getItem(KEYS.VIDEOS),
      ]);
      if (lang) setLangState(lang as Language);
      if (prof) setProfileState(JSON.parse(prof));
      if (onb) setOnboardedState(JSON.parse(onb));
      if (terms) setTermsState(JSON.parse(terms));
      if (pst) setPosts(JSON.parse(pst));
      if (st) setStories(JSON.parse(st));
      if (fr) setFriends(JSON.parse(fr));
      if (notif) setNotifications(JSON.parse(notif));
      if (vid) setVideos(JSON.parse(vid));
    } catch (e) { console.error('Load error', e); }
    finally { setIsLoading(false); }
  };

  const save = useCallback(async (key: string, val: any) => {
    await AsyncStorage.setItem(key, JSON.stringify(val));
  }, []);

  const setLanguage = useCallback(async (l: Language) => {
    setLangState(l); await AsyncStorage.setItem(KEYS.LANG, l);
  }, []);

  const setProfile = useCallback(async (p: UserProfile | null) => {
    setProfileState(p);
    if (p) await AsyncStorage.setItem(KEYS.PROFILE, JSON.stringify(p));
    else await AsyncStorage.removeItem(KEYS.PROFILE);
  }, []);

  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    setProfileState(prev => {
      if (!prev) return prev;
      const up = { ...prev, ...updates };
      AsyncStorage.setItem(KEYS.PROFILE, JSON.stringify(up));
      return up;
    });
  }, []);

  const setIsOnboarded = useCallback(async (v: boolean) => {
    setOnboardedState(v); await save(KEYS.ONBOARDED, v);
  }, [save]);

  const setHasAgreedTerms = useCallback(async (v: boolean) => {
    setTermsState(v); await save(KEYS.TERMS, v);
  }, [save]);

  const addNotif = useCallback((n: Omit<Notification, 'id' | 'read' | 'createdAt'>) => {
    const nn: Notification = { ...n, id: Crypto.randomUUID(), read: false, createdAt: Date.now() };
    setNotifications(prev => { const u = [nn, ...prev]; save(KEYS.NOTIFS, u); return u; });
  }, [save]);

  const addPost = useCallback((content: string, imageUrl?: string, videoUrl?: string) => {
    if (!profile) return;
    const p: Post = {
      id: Crypto.randomUUID(), authorId: profile.id, authorNickname: profile.nickname,
      authorAvatarId: profile.avatarId, content, imageUrl, videoUrl,
      reactions: {}, comments: [], createdAt: Date.now(), reported: false,
    };
    setPosts(prev => { const u = [p, ...prev]; save(KEYS.POSTS, u); return u; });
  }, [profile, save]);

  const reactToPost = useCallback((postId: string, emoji: string) => {
    if (!profile) return;
    setPosts(prev => {
      const u = prev.map(p => {
        if (p.id !== postId) return p;
        const r = { ...p.reactions };
        if (!r[emoji]) r[emoji] = [];
        if (r[emoji].includes(profile.id)) {
          r[emoji] = r[emoji].filter(id => id !== profile.id);
          if (r[emoji].length === 0) delete r[emoji];
        } else { r[emoji] = [...r[emoji], profile.id]; }
        return { ...p, reactions: r };
      });
      save(KEYS.POSTS, u); return u;
    });
  }, [profile, save]);

  const addSafeComment = useCallback((postId: string, commentKey: string) => {
    if (!profile) return;
    const c: SafeComment = {
      id: Crypto.randomUUID(), authorId: profile.id,
      authorNickname: profile.nickname, authorAvatarId: profile.avatarId,
      commentKey, createdAt: Date.now(),
    };
    setPosts(prev => {
      const u = prev.map(p => p.id === postId ? { ...p, comments: [...p.comments, c] } : p);
      save(KEYS.POSTS, u); return u;
    });
  }, [profile, save]);

  const reportPost = useCallback((postId: string) => {
    setPosts(prev => { const u = prev.map(p => p.id === postId ? { ...p, reported: true } : p); save(KEYS.POSTS, u); return u; });
  }, [save]);

  const addStory = useCallback((color: string, iconName: string) => {
    if (!profile) return;
    const s: Story = {
      id: Crypto.randomUUID(), authorId: profile.id,
      authorNickname: profile.nickname, authorAvatarId: profile.avatarId,
      color, iconName, createdAt: Date.now(),
    };
    setStories(prev => { const u = [s, ...prev]; save(KEYS.STORIES, u); return u; });
  }, [profile, save]);

  const sendFriendRequest = useCallback((nick: string, avatarId: string) => {
    if (!profile) return;
    const r: FriendRequest = {
      id: Crypto.randomUUID(), fromId: Crypto.randomUUID(),
      fromNickname: nick, fromAvatarId: avatarId, status: 'pending', createdAt: Date.now(),
    };
    setFriends(prev => { const u = [...prev, r]; save(KEYS.FRIENDS, u); return u; });
    addNotif({ type: 'friend_request', titleAr: 'طلب صداقة', titleEn: 'Friend Request', messageAr: `طلب من ${nick}`, messageEn: `Request from ${nick}` });
  }, [profile, save, addNotif]);

  const acceptFriend = useCallback((rid: string) => {
    setFriends(prev => { const u = prev.map(f => f.id === rid ? { ...f, status: 'accepted' as const } : f); save(KEYS.FRIENDS, u); return u; });
    if (profile) updateProfile({ friendCount: (profile.friendCount || 0) + 1 });
    addNotif({ type: 'friend_accepted', titleAr: 'صديق جديد', titleEn: 'New Friend', messageAr: 'لديك صديق جديد!', messageEn: 'You have a new friend!' });
  }, [save, profile, updateProfile, addNotif]);

  const rejectFriend = useCallback((rid: string) => {
    setFriends(prev => { const u = prev.map(f => f.id === rid ? { ...f, status: 'rejected' as const } : f); save(KEYS.FRIENDS, u); return u; });
  }, [save]);

  const markNotificationRead = useCallback((nid: string) => {
    setNotifications(prev => { const u = prev.map(n => n.id === nid ? { ...n, read: true } : n); save(KEYS.NOTIFS, u); return u; });
  }, [save]);

  const reactToVideo = useCallback((videoId: string, emoji: string) => {
    if (!profile) return;
    setVideos(prev => {
      const u = prev.map(v => {
        if (v.id !== videoId) return v;
        const r = { ...v.reactions };
        if (!r[emoji]) r[emoji] = [];
        if (r[emoji].includes(profile.id)) {
          r[emoji] = r[emoji].filter(id => id !== profile.id);
          if (!r[emoji].length) delete r[emoji];
        } else { r[emoji] = [...r[emoji], profile.id]; }
        return { ...v, reactions: r };
      });
      save(KEYS.VIDEOS, u); return u;
    });
  }, [profile, save]);

  const resetSessionTime = useCallback(() => setSessionStartTime(Date.now()), []);

  const signOut = useCallback(async () => {
    await AsyncStorage.clear();
    setProfileState(null); setOnboardedState(false); setTermsState(false);
    setPosts(samplePosts); setStories(sampleStories); setFriends([]);
    setNotifications([]); setVideos(sampleVideos);
  }, []);

  const t = useCallback((key: string): string => {
    return (translations[language] as Record<string, string>)[key] || key;
  }, [language]);

  const isRTL = language === 'ar';
  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  const value = useMemo(() => ({
    language, setLanguage, t, isRTL,
    profile, setProfile, updateProfile, isOnboarded, setIsOnboarded,
    hasAgreedTerms, setHasAgreedTerms,
    posts, addPost, reactToPost, addSafeComment, reportPost,
    stories, addStory,
    friends, sendFriendRequest, acceptFriend, rejectFriend,
    notifications, markNotificationRead, unreadCount,
    videos, reactToVideo,
    sessionStartTime, resetSessionTime, isLoading, signOut,
  }), [language, setLanguage, t, isRTL, profile, setProfile, updateProfile,
    isOnboarded, setIsOnboarded, hasAgreedTerms, setHasAgreedTerms,
    posts, addPost, reactToPost, addSafeComment, reportPost,
    stories, addStory, friends, sendFriendRequest, acceptFriend, rejectFriend,
    notifications, markNotificationRead, unreadCount, videos, reactToVideo,
    sessionStartTime, resetSessionTime, isLoading, signOut]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
