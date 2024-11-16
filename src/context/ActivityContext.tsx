import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { ActivityWithMeta, BaseActivity, ActivityType } from '../types/activity';
import { FaCalculator, FaExchangeAlt, FaChartLine, FaHistory, FaCalendarAlt, FaCode, FaCoins } from 'react-icons/fa';
import { IconType } from 'react-icons';

interface ActivityContextType {
  activities: ActivityWithMeta[];
  stats: {
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
  addActivity: (type: ActivityType, description: string) => void;
  getRecentActivities: (limit?: number) => ActivityWithMeta[];
}

const ActivityContext = createContext<ActivityContextType | undefined>(undefined);

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

const formatDate = (timestamp: number): string => {
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
};

const addMetaToActivity = (activity: BaseActivity): ActivityWithMeta => ({
  ...activity,
  date: formatDate(activity.timestamp),
  icon: getActivityIcon(activity.type)
});

export const ActivityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityWithMeta[]>([]);
  const [stats, setStats] = useState({
    today: 0,
    thisWeek: 0,
    thisMonth: 0
  });

  // Aktiviteleri localStorage'dan yükle
  useEffect(() => {
    if (user?.id) {
      const loadActivities = () => {
        try {
          const storedActivities = JSON.parse(localStorage.getItem(ACTIVITIES_KEY) || '[]') as BaseActivity[];
          const userActivities = storedActivities
            .filter(activity => activity.userId === user.id)
            .map(addMetaToActivity);
          setActivities(userActivities);

          // İlk kullanımda örnek veriler ekle
          if (userActivities.length === 0) {
            const sampleActivities: BaseActivity[] = [
              {
                id: '1',
                type: 'hesaplama',
                description: 'Standart hesap makinesi kullanıldı',
                timestamp: Date.now() - 2 * 60 * 1000,
                userId: user.id,
              },
              {
                id: '2',
                type: 'yatırım',
                description: 'Bitcoin fiyat analizi yapıldı',
                timestamp: Date.now() - 15 * 60 * 1000,
                userId: user.id,
              },
              {
                id: '3',
                type: 'döviz',
                description: 'USD/TRY çevrimi yapıldı',
                timestamp: Date.now() - 60 * 60 * 1000,
                userId: user.id,
              },
            ];
            localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(sampleActivities));
            setActivities(sampleActivities.map(addMetaToActivity));
          }
        } catch (error) {
          console.error('Aktiviteler yüklenirken hata oluştu:', error);
          setActivities([]);
        }
      };

      loadActivities();
    }
  }, [user?.id]);

  // İstatistikleri hesapla
  useEffect(() => {
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const oneMonthAgo = now - 30 * 24 * 60 * 60 * 1000;

    setStats({
      today: activities.filter(a => a.timestamp > oneDayAgo).length,
      thisWeek: activities.filter(a => a.timestamp > oneWeekAgo).length,
      thisMonth: activities.filter(a => a.timestamp > oneMonthAgo).length,
    });
  }, [activities]);

  const addActivity = (type: ActivityType, description: string) => {
    if (!user?.id) return;

    const newActivity: BaseActivity = {
      id: Date.now().toString(),
      type,
      description,
      timestamp: Date.now(),
      userId: user.id,
    };

    try {
      const storedActivities = JSON.parse(localStorage.getItem(ACTIVITIES_KEY) || '[]') as BaseActivity[];
      const updatedActivities = [newActivity, ...storedActivities].slice(0, 100);
      localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(updatedActivities));

      const activityWithMeta = addMetaToActivity(newActivity);
      setActivities(prev => [activityWithMeta, ...prev]);
    } catch (error) {
      console.error('Aktivite eklenirken hata oluştu:', error);
    }
  };

  const getRecentActivities = (limit: number = 3): ActivityWithMeta[] => {
    return activities.slice(0, limit);
  };

  return (
    <ActivityContext.Provider value={{
      activities,
      stats,
      addActivity,
      getRecentActivities,
    }}>
      {children}
    </ActivityContext.Provider>
  );
};

export const useActivity = () => {
  const context = useContext(ActivityContext);
  if (context === undefined) {
    throw new Error('useActivity must be used within an ActivityProvider');
  }
  return context;
};
