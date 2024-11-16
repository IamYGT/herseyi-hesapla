import { IconType } from 'react-icons';

export interface BaseActivity {
  id: string;
  type: string;
  description: string;
  timestamp: number;
  userId: string;
}

export interface ActivityWithMeta extends BaseActivity {
  date: string;
  icon: IconType;
}

export type ActivityType = 'hesaplama' | 'döviz' | 'yatırım' | 'yazı-tura' | 'tarih' | 'programlama';
