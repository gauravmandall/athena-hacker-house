# Monadland - Wallet Authentication Setup Guide

## Overview
Monadland now supports wallet authentication through Privy, including support for the Monad blockchain network. Players must connect their wallet to start playing the game.

## Features
- 🔐 **Wallet Authentication**: Connect with MetaMask, WalletConnect, and other popular wallets
- ⚡ **Monad Chain Support**: Full support for Monad testnet and future mainnet
- 🌐 **Multi-chain**: Also supports Ethereum, Polygon, and Sepolia
- 📧 **Email Login**: Option to login with email and connect wallet later
- 🎮 **Seamless Integration**: Authentication flow integrated with game start

## Setup Instructions

### 1. Create a Privy Account
1. Go to [Privy Dashboard](https://dashboard.privy.io/)
2. Sign up for a free account
3. Create a new app for your game

### 2. Configure Privy App
In your Privy dashboard:
1. Enable **Wallet** login method
2. Enable **Email** login method (optional)
3. Add supported chains:
   - Monad Testnet (Chain ID: 41454)
   - Ethereum Mainnet
   - Polygon
   - Sepolia (for testing)

### 3. Set Environment Variables
Create a `.env` file in the project root:
```env
# Privy Configuration
VITE_PRIVY_APP_ID=your_privy_app_id_here
```

### 4. Install Dependencies
```bash
npm install
```

### 5. Run the Application
```bash
npm run dev
```

## Monad Network Configuration

The application is pre-configured with Monad network settings:

**Monad Testnet:**
- Chain ID: 41454
- RPC URL: https://testnet.monad.xyz
- Symbol: MON
- Explorer: https://explorer.testnet.monad.xyz

**Monad Mainnet (when available):**
- Configuration will be updated when mainnet launches
- Current placeholder Chain ID: 42

## Authentication Flow

1. **Initial Load**: Players see the authentication screen
2. **Connect Wallet**: Click "Connect Wallet" to open Privy modal
3. **Select Provider**: Choose wallet provider (MetaMask, WalletConnect, etc.)
4. **Network Selection**: Switch to Monad network if not already connected
5. **Game Start**: Once authenticated, the game automatically starts

## Customization

### Modify Privy Configuration
Edit `src/config/privy.ts` to customize:
- Login methods
- Appearance theme
- Embedded wallet settings
- Chain configurations

### Add Custom Chains
Edit `src/config/chains.ts` to add more blockchain networks:
```typescript
export const customChain = defineChain({
  id: YOUR_CHAIN_ID,
  name: 'Your Chain Name',
  network: 'your-network',
  nativeCurrency: {
    decimals: 18,
    name: 'Token Name',
    symbol: 'TOKEN',
  },
  rpcUrls: {
    default: { http: ['https://your-rpc-url'] },
  },
  // ... other configurations
});
```

## User Features

### For Players
- **Wallet Display**: Shows connected wallet address (truncated)
- **Network Indicator**: Displays current connected network
- **Easy Disconnect**: Click wallet address to disconnect

### For Developers
- **Auth State Management**: Centralized authentication service
- **React Integration**: Privy components integrated with game engine
- **TypeScript Support**: Full type safety for authentication flows

## Troubleshooting

### Common Issues

1. **"Invalid App ID" Error**
   - Ensure `VITE_PRIVY_APP_ID` is set correctly in `.env`
   - Verify the App ID matches your Privy dashboard

2. **Wallet Connection Failed**
   - Check if wallet extension is installed
   - Ensure popup blockers are disabled
   - Try refreshing the page

3. **Network Switch Issues**
   - Manually add Monad network to wallet if auto-switch fails
   - Check RPC URL connectivity

4. **React/TypeScript Errors**
   - Run `npm install` to ensure all dependencies are installed
   - Clear node_modules and reinstall if issues persist

## Security Best Practices

1. **Never commit `.env` file** to version control
2. **Use environment variables** for sensitive configuration
3. **Enable domain restrictions** in Privy dashboard for production
4. **Implement rate limiting** for authentication attempts
5. **Regular security audits** of wallet interactions

## Support

- **Privy Documentation**: [docs.privy.io](https://docs.privy.io)
- **Monad Network**: [monad.xyz](https://monad.xyz)
- **Game Issues**: Open an issue in the repository

## Next Steps

After successful setup:
1. Test wallet connection with different providers
2. Verify Monad network connectivity
3. Customize authentication UI to match game theme
4. Add on-chain features (NFTs, tokens, etc.)
5. Implement player profiles linked to wallet addresses

---

**Note**: Make sure to test thoroughly on testnet before deploying to mainnet.
