import { defineChain } from 'viem';

// Monad Testnet configuration
export const monadTestnet = defineChain({
  id: 41454, // Monad Testnet Chain ID
  name: 'Monad Testnet',
  network: 'monad-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Monad',
    symbol: 'MON',
  },
  rpcUrls: {
    default: {
      http: ['https://testnet.monad.xyz'],
    },
    public: {
      http: ['https://testnet.monad.xyz'],
    },
  },
  blockExplorers: {
    default: { 
      name: 'Monad Explorer', 
      url: 'https://explorer.testnet.monad.xyz' 
    },
  },
  testnet: true,
});

// Monad Mainnet configuration (when available)
export const monadMainnet = defineChain({
  id: 42, // Placeholder - Replace with actual Monad mainnet chain ID when available
  name: 'Monad',
  network: 'monad',
  nativeCurrency: {
    decimals: 18,
    name: 'Monad',
    symbol: 'MON',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.monad.xyz'], // Replace with actual RPC when available
    },
    public: {
      http: ['https://rpc.monad.xyz'], // Replace with actual RPC when available
    },
  },
  blockExplorers: {
    default: { 
      name: 'Monad Explorer', 
      url: 'https://explorer.monad.xyz' // Replace with actual explorer when available
    },
  },
  testnet: false,
});
