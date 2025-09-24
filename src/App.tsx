import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { PrivyProvider } from './components/PrivyProvider';
import { AuthButton } from './components/AuthButton';
import { AuthService } from './services/auth/auth-service';
import { SwapModalDebugButton } from './components/SwapModalDebug';
// import { showSwapModal } from './components/SwapIntegration'; // Used dynamically in scoreboard
import Game from './services/game';

interface AppProps {
  gameInstance: Game | null;
}

const AuthUI: React.FC<AppProps> = ({ gameInstance }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const authService = AuthService.getInstance();

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = authService.subscribe((state) => {
      setIsAuthenticated(state.isAuthenticated);
      setWalletAddress(state.walletAddress);
    });

    return unsubscribe;
  }, []);

  const handleAuthenticated = (address: string) => {
    console.log('Wallet connected:', address);
    setWalletAddress(address);
    
    // Update the game instance with the wallet address
    if (gameInstance) {
      (gameInstance as any).walletAddress = address;
    }
    
    // Hide auth overlay when authenticated
    const authOverlay = document.getElementById('auth-overlay');
    if (authOverlay) {
      authOverlay.style.display = 'none';
    }
  };

  return (
    <>
      <div id="auth-overlay" className="auth-overlay">
        <div className="auth-content">
          <img src="/logo.png" alt="Monadland" className="auth-logo" />
          <h1 className="auth-title">Monadland</h1>
          <p className="auth-subtitle">Connect your wallet to start racing</p>
          
          <AuthButton 
            onAuthenticated={handleAuthenticated}
            className="main-auth-button"
          />
          
          {isAuthenticated && walletAddress && (
            <div className="wallet-info">
              <p>Connected to Monad Network</p>
              <p className="wallet-address">{walletAddress}</p>
            </div>
          )}
          
          <div className="chain-support">
            <p>Supported Networks:</p>
            <ul>
              <li>🟢 Monad Testnet</li>
              <li>🔵 Ethereum</li>
              <li>🟣 Polygon</li>
            </ul>
          </div>
        </div>
      </div>
      {/* Debug button for testing swap modal */}
      <SwapModalDebugButton />
    </>
  );
};

export const initializeAuth = (gameInstance: Game | null) => {
  // Create a root element for React
  const authRoot = document.createElement('div');
  authRoot.id = 'auth-root';
  document.body.appendChild(authRoot);

  // Render the React app with Privy Provider
  const root = createRoot(authRoot);
  root.render(
    <PrivyProvider>
      <AuthUI gameInstance={gameInstance} />
    </PrivyProvider>
  );
};

export default AuthUI;
