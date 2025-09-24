import React from 'react';
import { PrivyProvider as BasePrivyProvider } from '@privy-io/react-auth';
import { WagmiProvider, createConfig } from '@privy-io/wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http } from 'viem';
import { mainnet, sepolia, polygon } from 'viem/chains';
import { monadTestnet } from '../config/chains';
import { PRIVY_APP_ID, privyConfig } from '../config/privy';

const queryClient = new QueryClient();

// Configure Wagmi with supported chains including Monad
const wagmiConfig = createConfig({
  chains: [monadTestnet, mainnet, sepolia, polygon],
  transports: {
    [monadTestnet.id]: http(),
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [polygon.id]: http(),
  },
});

interface PrivyProviderProps {
  children: React.ReactNode;
}

export const PrivyProvider: React.FC<PrivyProviderProps> = ({ children }) => {
  return (
    <BasePrivyProvider
      appId={PRIVY_APP_ID}
      config={privyConfig}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig}>
          {children}
        </WagmiProvider>
      </QueryClientProvider>
    </BasePrivyProvider>
  );
};
