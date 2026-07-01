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

export interface SystemConfig {
  theme: ThemeType;
  wallpaper: string;
  soundEnabled: boolean;
}
