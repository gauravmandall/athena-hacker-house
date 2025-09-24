import React, { useEffect } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { AuthService } from '../services/auth/auth-service';

interface AuthButtonProps {
  onAuthenticated?: (address: string) => void;
  className?: string;
}

export const AuthButton: React.FC<AuthButtonProps> = ({ 
  onAuthenticated,
  className = 'auth-button'
}) => {
  const { ready, authenticated, user, login, logout, connectWallet } = usePrivy();
  const { wallets } = useWallets();
  const authService = AuthService.getInstance();

  useEffect(() => {
    if (authenticated && user) {
      authService.setUser(user);
      
      // Get the wallet address
      const walletAddress = wallets?.[0]?.address || user?.wallet?.address;
      
      if (walletAddress && onAuthenticated) {
        onAuthenticated(walletAddress);
      }
    } else {
      authService.setUser(null);
    }
  }, [authenticated, user, wallets, onAuthenticated]);

  const handleLogin = async () => {
    try {
      authService.setLoading(true);
      await login();
      
      // If user logs in with email, prompt to connect wallet
      if (authenticated && !wallets.length) {
        await connectWallet();
      }
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      authService.setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      authService.setLoading(true);
      await logout();
      authService.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      authService.setLoading(false);
    }
  };

  const getButtonText = () => {
    if (!ready) return 'Loading...';
    if (authenticated) {
      const address = wallets?.[0]?.address || user?.wallet?.address;
      if (address) {
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
      }
      return 'Connect Wallet';
    }
    return 'Connect Wallet';
  };

  const isConnected = authenticated && (wallets.length > 0 || user?.wallet);

  return (
    <div className={`auth-container ${className}`}>
      <button
        className={`auth-btn ${isConnected ? 'connected' : ''}`}
        onClick={authenticated ? handleLogout : handleLogin}
        disabled={!ready}
      >
        <span className="wallet-icon">💳</span>
        {getButtonText()}
      </button>
      
      {authenticated && !wallets.length && !user?.wallet && (
        <button
          className="connect-wallet-btn"
          onClick={connectWallet}
        >
          Connect Wallet to Play
        </button>
      )}
      
      {authenticated && wallets.length > 0 && (
        <div className="chain-info">
          <span className="chain-label">Chain: Monad Testnet</span>
        </div>
      )}
    </div>
  );
};
