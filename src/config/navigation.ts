import {
  BookOpen,
  Bookmark,
  GraduationCap,
  History,
  Home,
  Library,
  Settings,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  icon: LucideIcon;
  label: string;
  path: string;
}

/** Single source of truth for the sidebar and the mobile nav sheet. */
export const NAV_ITEMS: NavItem[] = [
  { icon: Home, label: "Home", path: "/" },
  { icon: GraduationCap, label: "Courses", path: "/courses" },
  { icon: BookOpen, label: "My Learning", path: "/dashboard" },
  { icon: TrendingUp, label: "Trending", path: "/trending" },
  { icon: Library, label: "Library", path: "/library" },
  { icon: History, label: "History", path: "/history" },
  { icon: Bookmark, label: "Saved", path: "/saved" },
  { icon: Settings, label: "Settings", path: "/settings" },
];
