// Token configurations for Monad and other chains
export interface TokenInfo {
  address: string;
  symbol: string;
  decimals: number;
  name: string;
  chainId: number;
  logoURI?: string;
}

// Monad Testnet Tokens
export const MONAD_TESTNET_TOKENS: TokenInfo[] = [
  {
    address: '0x0000000000000000000000000000000000000000', // Native MON
    symbol: 'MON',
    decimals: 18,
    name: 'Monad',
    chainId: 41454,
    logoURI: '/logo.png',
  },
  {
    address: '0x1234567890abcdef1234567890abcdef12345678', // Example USDC on Monad
    symbol: 'USDC',
    decimals: 6,
    name: 'USD Coin',
    chainId: 41454,
  },
  {
    address: '0xabcdef1234567890abcdef1234567890abcdef12', // Example WMON (Wrapped Monad)
    symbol: 'WMON',
    decimals: 18,
    name: 'Wrapped Monad',
    chainId: 41454,
  },
];

// Ethereum Mainnet Tokens
export const ETHEREUM_TOKENS: TokenInfo[] = [
  {
    address: '0x0000000000000000000000000000000000000000',
    symbol: 'ETH',
    decimals: 18,
    name: 'Ethereum',
    chainId: 1,
  },
  {
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    symbol: 'USDC',
    decimals: 6,
    name: 'USD Coin',
    chainId: 1,
  },
  {
    address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    symbol: 'WETH',
    decimals: 18,
    name: 'Wrapped Ether',
    chainId: 1,
  },
  {
    address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    symbol: 'DAI',
    decimals: 18,
    name: 'Dai Stablecoin',
    chainId: 1,
  },
];

// Polygon Tokens
export const POLYGON_TOKENS: TokenInfo[] = [
  {
    address: '0x0000000000000000000000000000000000000000',
    symbol: 'MATIC',
    decimals: 18,
    name: 'Polygon',
    chainId: 137,
  },
  {
    address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    symbol: 'USDC',
    decimals: 6,
    name: 'USD Coin',
    chainId: 137,
  },
  {
    address: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
    symbol: 'WMATIC',
    decimals: 18,
    name: 'Wrapped Matic',
    chainId: 137,
  },
];

// Helper function to get tokens by chain ID
export function getTokensByChainId(chainId: number): TokenInfo[] {
  switch (chainId) {
    case 41454:
      return MONAD_TESTNET_TOKENS;
    case 1:
      return ETHEREUM_TOKENS;
    case 137:
      return POLYGON_TOKENS;
    default:
      return [];
  }
}

// Default swap pairs
export const DEFAULT_SWAP_PAIRS = [
  { from: 'MON', to: 'USDC' },
  { from: 'USDC', to: 'MON' },
  { from: 'ETH', to: 'USDC' },
  { from: 'MATIC', to: 'USDC' },
];
