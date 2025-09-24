import type { User } from '@privy-io/react-auth';

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  walletAddress: string | null;
  isLoading: boolean;
}

export class AuthService {
  private static instance: AuthService;
  private state: AuthState;
  private listeners: Array<(state: AuthState) => void> = [];

  private constructor() {
    this.state = {
      isAuthenticated: false,
      user: null,
      walletAddress: null,
      isLoading: false,
    };
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  public updateAuthState(updates: Partial<AuthState>): void {
    this.state = { ...this.state, ...updates };
    this.notifyListeners();
  }

  public getState(): AuthState {
    return { ...this.state };
  }

  public subscribe(listener: (state: AuthState) => void): () => void {
    this.listeners.push(listener);
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.state));
  }

  public setUser(user: User | null): void {
    const walletAddress = user?.wallet?.address || null;
    this.updateAuthState({
      isAuthenticated: !!user,
      user,
      walletAddress,
    });
  }

  public setLoading(isLoading: boolean): void {
    this.updateAuthState({ isLoading });
  }

  public logout(): void {
    this.updateAuthState({
      isAuthenticated: false,
      user: null,
      walletAddress: null,
      isLoading: false,
    });
  }

  public isAuthenticated(): boolean {
    return this.state.isAuthenticated;
  }

  public getWalletAddress(): string | null {
    return this.state.walletAddress;
  }

  public getUser(): User | null {
    return this.state.user;
  }
}
