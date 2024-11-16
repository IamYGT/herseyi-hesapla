interface StorageItem {
  userId: string;
  type: string;
  data: any;
  timestamp: number;
}

export const dataService = {
  saveData: (userId: string, type: string, data: any) => {
    const storageKey = `${userId}_${type}`;
    const existingData = JSON.parse(localStorage.getItem(storageKey) || '[]');
    
    const newItem: StorageItem = {
      userId,
      type,
      data,
      timestamp: Date.now()
    };

    existingData.push(newItem);
    localStorage.setItem(storageKey, JSON.stringify(existingData));
  },

  getData: (userId: string, type: string): StorageItem[] => {
    const storageKey = `${userId}_${type}`;
    return JSON.parse(localStorage.getItem(storageKey) || '[]');
  },

  clearData: (userId: string, type: string) => {
    const storageKey = `${userId}_${type}`;
    localStorage.removeItem(storageKey);
  }
};
