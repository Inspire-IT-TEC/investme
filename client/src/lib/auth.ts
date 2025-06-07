export interface User {
  id: number;
  email: string;
  nomeCompleto?: string;
  nome?: string;
  cpf?: string;
  rg?: string;
  role?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

class AuthManager {
  private static instance: AuthManager;
  private state: AuthState = {
    user: null,
    token: null,
    isAuthenticated: false,
  };
  private listeners: ((state: AuthState) => void)[] = [];

  private constructor() {
    this.loadFromStorage();
  }

  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  private loadFromStorage() {
    try {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      
      if (token && userStr) {
        const user = JSON.parse(userStr);
        this.state = {
          user,
          token,
          isAuthenticated: true,
        };
      }
    } catch (error) {
      console.error('Error loading auth state from storage:', error);
      this.clearStorage();
    }
  }

  private saveToStorage() {
    if (this.state.user && this.state.token) {
      localStorage.setItem('token', this.state.token);
      localStorage.setItem('user', JSON.stringify(this.state.user));
    } else {
      this.clearStorage();
    }
  }

  private clearStorage() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.state));
  }

  subscribe(listener: (state: AuthState) => void) {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  getState(): AuthState {
    return { ...this.state };
  }

  login(user: User, token: string, userType?: string) {
    this.state = {
      user,
      token,
      isAuthenticated: true,
    };
    if (userType) {
      localStorage.setItem('userType', userType);
    }
    this.saveToStorage();
    this.notifyListeners();
  }

  logout() {
    this.state = {
      user: null,
      token: null,
      isAuthenticated: false,
    };
    localStorage.removeItem('userType');
    this.clearStorage();
    this.notifyListeners();
  }

  updateUser(user: Partial<User>) {
    if (this.state.user) {
      this.state.user = { ...this.state.user, ...user };
      this.saveToStorage();
      this.notifyListeners();
    }
  }

  getToken(): string | null {
    return this.state.token;
  }

  isAuthenticated(): boolean {
    return this.state.isAuthenticated && !!this.state.token;
  }
}

export const authManager = AuthManager.getInstance();
