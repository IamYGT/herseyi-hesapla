import { FaCalculator, FaExchangeAlt, FaChartLine, FaHistory, FaCalendarAlt, FaCode, FaCoins } from 'react-icons/fa';
import { IconType } from 'react-icons';
import { BaseActivity, ActivityWithMeta, ActivityType } from '../types/activity';

const ACTIVITIES_KEY = 'user_activities';

const getActivityIcon = (type: string): IconType => {
  switch (type.toLowerCase()) {
    case 'hesaplama':
      return FaCalculator;
    case 'döviz':
      return FaExchangeAlt;
    case 'yatırım':
      return FaChartLine;
    case 'yazı-tura':
      return FaCoins;
    case 'tarih':
      return FaCalendarAlt;
    case 'programlama':
      return FaCode;
    default:
      return FaHistory;
  }
};

export const activityService = {
  addActivity: (userId: string, type: ActivityType, description: string): void => {
    const activities = JSON.parse(localStorage.getItem(ACTIVITIES_KEY) || '[]') as BaseActivity[];
    
    const newActivity: BaseActivity = {
      id: Date.now().toString(),
      userId,
      type,
      description,
      timestamp: Date.now(),
    };

    activities.unshift(newActivity);
    
    // Son 100 aktiviteyi tut
    const limitedActivities = activities.slice(0, 100);
    localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(limitedActivities));
  },

  getUserActivities: (userId: string): ActivityWithMeta[] => {
    const activities = JSON.parse(localStorage.getItem(ACTIVITIES_KEY) || '[]') as BaseActivity[];
    return activities
      .filter((activity) => activity.userId === userId)
      .map((activity) => ({
        ...activity,
        date: formatDate(activity.timestamp),
        icon: getActivityIcon(activity.type),
      }));
  },

  getRecentActivities: (userId: string, limit: number = 3): ActivityWithMeta[] => {
    const activities = JSON.parse(localStorage.getItem(ACTIVITIES_KEY) || '[]') as BaseActivity[];
    return activities
      .filter((activity) => activity.userId === userId)
      .slice(0, limit)
      .map((activity) => ({
        ...activity,
        date: formatDate(activity.timestamp),
        icon: getActivityIcon(activity.type),
      }));
  },

  getActivityStats: (userId: string) => {
    const activities = JSON.parse(localStorage.getItem(ACTIVITIES_KEY) || '[]') as BaseActivity[];
    const userActivities = activities.filter((activity) => activity.userId === userId);

    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const oneMonthAgo = now - 30 * 24 * 60 * 60 * 1000;

    return {
      today: userActivities.filter((a) => a.timestamp > oneDayAgo).length,
      thisWeek: userActivities.filter((a) => a.timestamp > oneWeekAgo).length,
      thisMonth: userActivities.filter((a) => a.timestamp > oneMonthAgo).length,
    };
  },

  // Test için örnek aktiviteler ekleme
  addSampleActivities: (userId: string) => {
    const sampleActivities: BaseActivity[] = [
      {
        id: '1',
        type: 'hesaplama',
        description: 'Standart hesap makinesi kullanıldı',
        timestamp: Date.now() - 2 * 60 * 1000, // 2 dakika önce
        userId,
      },
      {
        id: '2',
        type: 'yatırım',
        description: 'Bitcoin fiyat analizi yapıldı',
        timestamp: Date.now() - 15 * 60 * 1000, // 15 dakika önce
        userId,
      },
      {
        id: '3',
        type: 'döviz',
        description: 'USD/TRY çevrimi yapıldı',
        timestamp: Date.now() - 60 * 60 * 1000, // 1 saat önce
        userId,
      },
    ];

    localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(sampleActivities));
    },
};

function formatDate(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return 'Az önce';
  if (minutes < 60) return `${minutes} dakika önce`;
  if (hours < 24) return `${hours} saat önce`;
  if (days < 7) return `${days} gün önce`;

  const date = new Date(timestamp);
  return date.toLocaleDateString('tr-TR');
}
