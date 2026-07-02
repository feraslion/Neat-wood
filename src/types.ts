export interface WindowInstance {
  id: string;
  title: string;
  icon: string; // lucide icon name
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  width: number;
  height: number;
  x: number;
  y: number;
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  category: "work" | "personal" | "ideas" | "urgent";
  createdAt: string;
  dueDate?: string;
  dueTime?: string;
  notified?: boolean;
  recurrence?: "none" | "daily" | "weekly" | "monthly";
}

export interface Note {
  id: string;
  title: string;
  content: string;
  category: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: string;
}

export type ThemeType = "slate" | "ocean" | "cosmic" | "emerald";

export interface FileSystemItem {
  id: string;
  name: string;
  type: "file" | "folder";
  content?: string;
  parentId: string | null;
  createdAt: string;
  size?: string;
  extension?: "txt" | "json" | "note" | "task" | "md";
}

export interface SystemConfig {
  theme: ThemeType;
  wallpaper: string;
  soundEnabled: boolean;
}

export interface Currency {
  code: string;
  symbol: string;
  name: string;
  rate: number; // Conversion rate relative to 1 SAR
}

export const CURRENCIES: Currency[] = [
  { code: "SAR", symbol: "ر.س", name: "ريال سعودي", rate: 1.0 },
  { code: "USD", symbol: "$", name: "دولار أمريكي", rate: 0.266 },
  { code: "EUR", symbol: "€", name: "يورو", rate: 0.25 },
  { code: "AED", symbol: "د.إ", name: "درهم إماراتي", rate: 0.98 },
  { code: "EGP", symbol: "ج.م", name: "جنيه مصري", rate: 12.5 }
];

export interface DesktopIcon {
  id: string;
  titleAr: string;
  titleEn: string;
  iconName: string;
  x: number;
  y: number;
}

export interface KeyboardShortcut {
  id: string;
  nameAr: string;
  nameEn: string;
  ctrlKey: boolean;
  altKey: boolean;
  shiftKey: boolean;
  key: string;
}

