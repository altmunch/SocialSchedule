import { LucideIcon } from 'lucide-react';

export interface StatItem {
  icon: LucideIcon;
  value: string | number | JSX.Element;
  label: string;
  highlight?: boolean;
}

export interface CreatorAvatar {
  id: string;
  name: string;
  image?: string;
}
