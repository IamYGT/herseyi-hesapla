interface User {
  id: string;
  username: string;
  password: string;
}

const USERS_KEY = 'users';
const CURRENT_USER_KEY = 'currentUser';

export const authService = {
  register: (username: string, password: string): boolean => {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    
    if (users.some((user: User) => user.username === username)) {
      return false;
    }

    const newUser = {
      id: Date.now().toString(),
      username,
      password, // In a real app, this should be hashed
    };

    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return true;
  },

  login: (username: string, password: string): boolean => {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    const user = users.find((u: User) => u.username === username && u.password === password);
    
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      return true;
    }
    return false;
  },

  logout: () => {
    localStorage.removeItem(CURRENT_USER_KEY);
  },

  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem(CURRENT_USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }
};
