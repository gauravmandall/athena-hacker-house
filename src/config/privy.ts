import { monadTestnet } from './chains';
import { mainnet, sepolia, polygon } from 'viem/chains';
import type { PrivyClientConfig } from '@privy-io/react-auth';

// Get Privy App ID from environment variable
export const PRIVY_APP_ID = import.meta.env.VITE_PRIVY_APP_ID || 'your-privy-app-id';

export const privyConfig: PrivyClientConfig = {
  embeddedWallets: {
    ethereum: {
      createOnLogin: 'users-without-wallets',
    },
    showWalletUIs: true,
  },
  loginMethods: ['wallet', 'email'],
  appearance: {
    theme: 'dark',
    accentColor: '#676FFF',
    logo: '/logo.png',
    showWalletLoginFirst: true,
    walletChainType: 'ethereum-only',
  },
  walletConnectCloudProjectId: '', // Add your WalletConnect Cloud Project ID if using WalletConnect
};

// Supported chains for the application
export const supportedChains = [
  monadTestnet,
  mainnet,
  sepolia,
  polygon,
];

// Default chain (Monad Testnet)
export const defaultChain = monadTestnet;
