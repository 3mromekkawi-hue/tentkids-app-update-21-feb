import { MaterialCommunityIcons } from '@expo/vector-icons';

export type AvatarConfig = {
  id: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  color: string;
  bgColor: string;
  nameAr: string;
  nameEn: string;
  category: 'animals' | 'sweets';
  premium?: boolean;
};

export const avatars: AvatarConfig[] = [
  { id: 'bear', icon: 'teddy-bear', color: '#8D6E63', bgColor: '#EFEBE9', nameAr: 'دبدوب', nameEn: 'Bear', category: 'animals' },
  { id: 'cat', icon: 'cat', color: '#FF8A65', bgColor: '#FBE9E7', nameAr: 'قطة', nameEn: 'Cat', category: 'animals' },
  { id: 'rabbit', icon: 'rabbit', color: '#F48FB1', bgColor: '#FCE4EC', nameAr: 'أرنوب', nameEn: 'Bunny', category: 'animals' },
  { id: 'penguin', icon: 'penguin', color: '#546E7A', bgColor: '#ECEFF1', nameAr: 'بطريق', nameEn: 'Penguin', category: 'animals' },
  { id: 'owl', icon: 'owl', color: '#7E57C2', bgColor: '#EDE7F6', nameAr: 'بومة', nameEn: 'Owl', category: 'animals' },
  { id: 'dog', icon: 'dog', color: '#A1887F', bgColor: '#EFEBE9', nameAr: 'كلبوش', nameEn: 'Dog', category: 'animals' },
  { id: 'fish', icon: 'fish', color: '#4FC3F7', bgColor: '#E1F5FE', nameAr: 'سمكة', nameEn: 'Fish', category: 'animals' },
  { id: 'turtle', icon: 'turtle', color: '#66BB6A', bgColor: '#E8F5E9', nameAr: 'سلحفاة', nameEn: 'Turtle', category: 'animals' },
  { id: 'cupcake', icon: 'cupcake', color: '#EC407A', bgColor: '#FCE4EC', nameAr: 'كب كيك', nameEn: 'Cupcake', category: 'sweets' },
  { id: 'candy', icon: 'candy', color: '#E91E63', bgColor: '#FCE4EC', nameAr: 'حلوى', nameEn: 'Candy', category: 'sweets' },
  { id: 'icecream', icon: 'ice-cream', color: '#4FC3F7', bgColor: '#E1F5FE', nameAr: 'آيس كريم', nameEn: 'Ice Cream', category: 'sweets' },
  { id: 'cookie', icon: 'cookie', color: '#D4A574', bgColor: '#FFF3E0', nameAr: 'كوكيز', nameEn: 'Cookie', category: 'sweets' },
  { id: 'cake', icon: 'cake-variant', color: '#FF7043', bgColor: '#FBE9E7', nameAr: 'كعكة', nameEn: 'Cake', category: 'sweets' },
  { id: 'lollipop', icon: 'candy-outline', color: '#AB47BC', bgColor: '#F3E5F5', nameAr: 'مصاصة', nameEn: 'Lollipop', category: 'sweets' },
  { id: 'ghost', icon: 'ghost', color: '#78909C', bgColor: '#ECEFF1', nameAr: 'شبح', nameEn: 'Ghost', category: 'animals', premium: true },
  { id: 'unicorn', icon: 'unicorn', color: '#AB47BC', bgColor: '#F3E5F5', nameAr: 'يونيكورن', nameEn: 'Unicorn', category: 'animals', premium: true },
  { id: 'star', icon: 'star-four-points', color: '#FFD54F', bgColor: '#FFF8E1', nameAr: 'نجمة', nameEn: 'Star', category: 'sweets', premium: true },
];

export const tentColors = [
  { id: 'rose', color: '#F8BBD0', glow: '#FF80AB', name_ar: 'وردي', name_en: 'Rose' },
  { id: 'lavender', color: '#E1BEE7', glow: '#CE93D8', name_ar: 'لافندر', name_en: 'Lavender' },
  { id: 'sky', color: '#B3E5FC', glow: '#81D4FA', name_ar: 'سماوي', name_en: 'Sky' },
  { id: 'mint', color: '#C8E6C9', glow: '#A5D6A7', name_ar: 'نعناعي', name_en: 'Mint' },
  { id: 'lemon', color: '#FFF9C4', glow: '#FFF176', name_ar: 'ليموني', name_en: 'Lemon' },
  { id: 'peach', color: '#FFCCBC', glow: '#FFAB91', name_ar: 'خوخي', name_en: 'Peach' },
  { id: 'cream', color: '#FFF3E0', glow: '#FFE0B2', name_ar: 'كريمي', name_en: 'Cream' },
  { id: 'coral', color: '#FFAB91', glow: '#FF8A65', name_ar: 'مرجاني', name_en: 'Coral' },
];
