# Monadland Token Swap Feature 🏁💱

## Overview
Monadland now includes an integrated token swapping system that rewards players who complete races without hitting banana peels. This feature enables players to swap MON tokens and other cryptocurrencies directly within the game, powered by 0x Swap API with full Monad chain support.

## How It Works

### 🏎️ Race Performance Tracking
- **Banana Peel Detection**: The game tracks every banana peel collision during races
- **Perfect Run Bonus**: Complete a race without hitting any banana peels to unlock the swap feature
- **Performance Metrics**: Your race time and collision count affect your rewards

### 🏆 Reward System

#### Base Rewards
- **Completion Reward**: 100 MON tokens for finishing the race
- **Perfect Run Bonus**: +500 MON tokens for avoiding all banana peels
- **Speed Bonus**: Up to 300 MON tokens based on completion time

#### Achievement Tiers
1. **🏆 Gold Achievement**: No banana peel collisions - Full swap access
2. **🥈 Silver Achievement**: Some collisions - Swap feature locked

### 💱 Token Swap Feature

#### Supported Networks
- **Monad Testnet** (Primary - Chain ID: 41454)
- **Ethereum Mainnet** (Chain ID: 1)
- **Polygon** (Chain ID: 137)

#### Available Tokens

**Monad Testnet:**
- MON (Native Monad token)
- USDC (USD Coin)
- WMON (Wrapped Monad)

**Ethereum:**
- ETH (Ethereum)
- USDC (USD Coin)
- WETH (Wrapped Ether)
- DAI (Dai Stablecoin)

**Polygon:**
- MATIC (Polygon)
- USDC (USD Coin)
- WMATIC (Wrapped Matic)

## User Journey

### 1. Start Race
```
Connect Wallet → Start Game → Begin Racing
```

### 2. During Race
- Avoid banana peels on the track
- Use power-ups strategically
- Complete all laps as quickly as possible

### 3. Race Completion
- **Perfect Run**: Swap modal opens automatically
- **With Collisions**: View rewards and performance stats

### 4. Token Swap Process
1. **Select Network**: Choose from Monad, Ethereum, or Polygon
2. **Choose Tokens**: Select tokens to swap from/to
3. **Enter Amount**: Specify how many tokens to swap
4. **Set Slippage**: Adjust slippage tolerance (default 0.5%)
5. **Review Quote**: Check exchange rate and gas fees
6. **Execute Swap**: Confirm transaction in wallet

## Technical Implementation

### Banana Peel Collision Tracking
```typescript
// Player Controller tracks collisions
class PlayerController {
  bananaPeelCollisions: number = 0;
  hasAvoidedBananaPeels: boolean = true;
}
```

### Swap Service Integration
- **0x Protocol**: For Ethereum and Polygon swaps
- **Custom Implementation**: For Monad network (until 0x adds support)
- **Dynamic Quotes**: Real-time price updates
- **Gas Optimization**: Automatic gas estimation with 20% buffer

### Security Features
- **Wallet Authentication**: Required before swapping
- **Allowance Management**: Automatic token approval handling
- **Slippage Protection**: Configurable slippage tolerance
- **Transaction Monitoring**: Real-time status updates

## Configuration

### Environment Variables
```env
# Required
VITE_PRIVY_APP_ID=your_privy_app_id

# Optional
VITE_0X_API_KEY=your_0x_api_key  # For production use
```

### Adding Custom Tokens
Edit `src/config/tokens.ts`:
```typescript
export const CUSTOM_TOKENS: TokenInfo[] = [
  {
    address: '0x...',
    symbol: 'TOKEN',
    decimals: 18,
    name: 'Token Name',
    chainId: 41454,
  }
];
```

## Development Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Privy
- Create account at [dashboard.privy.io](https://dashboard.privy.io)
- Enable wallet login methods
- Add supported chains

### 3. Configure 0x API (Optional)
- Get API key from [0x.org](https://0x.org)
- Add to environment variables

### 4. Test Locally
```bash
npm run dev
```

## Tips for Players

### 🎮 Gameplay Tips
1. **Learn Track Layouts**: Memorize banana peel locations
2. **Use Ghost Mode**: No-collision power-up helps avoid banana peels
3. **Practice Drifting**: Better control helps navigate obstacles
4. **Time Your Boosts**: Speed boosts can help clear obstacle sections

### 💰 Swap Strategy
1. **Check Gas Prices**: Swap during low-traffic periods
2. **Use Slippage Wisely**: Higher slippage for volatile tokens
3. **Compare Networks**: Different chains have different fees
4. **Batch Swaps**: Combine multiple swaps to save gas

## Troubleshooting

### Common Issues

#### "Swap Locked" Message
- **Cause**: Hit banana peels during race
- **Solution**: Complete a race without collisions

#### Transaction Failed
- **Insufficient Balance**: Check token balance
- **Gas Too Low**: Increase gas limit
- **Slippage**: Increase slippage tolerance

#### Wallet Connection Issues
- **Network Mismatch**: Switch to correct network
- **Popup Blocked**: Allow wallet popups
- **Cache Issues**: Clear browser cache

## Future Enhancements

### Planned Features
- [ ] Leaderboard integration with on-chain records
- [ ] NFT rewards for perfect runs
- [ ] Tournament mode with prize pools
- [ ] Liquidity provision rewards
- [ ] Cross-chain bridge integration
- [ ] Advanced swap routing
- [ ] Limit orders
- [ ] Swap history tracking

### Community Suggestions
We welcome feedback and suggestions! Join our community:
- Discord: [Join Server](#)
- Twitter: [@MonadlandGame](#)
- GitHub: [Issues & PRs](#)

## Smart Contract Addresses

### Monad Testnet
```
Swap Router: 0x... (TBD)
MON Token: 0x... (TBD)
Rewards Pool: 0x... (TBD)
```

### Integration Examples

#### Checking Banana Peel Status
```typescript
const player = PlayerController.currentInstance;
if (player.hasAvoidedBananaPeels) {
  console.log("Perfect run! Swap unlocked!");
} else {
  console.log(`Hit ${player.bananaPeelCollisions} banana peels`);
}
```

#### Programmatic Swap
```typescript
const swapService = SwapService.getInstance();
const quote = await swapService.getSwapQuote(
  41454, // Monad chain ID
  "0x...", // MON address
  "0x...", // USDC address
  "1000000000000000000", // 1 MON
  walletAddress,
  0.5 // slippage
);
```

## Security Considerations

### Best Practices
1. **Never share private keys**
2. **Verify transaction details before signing**
3. **Use hardware wallets for large amounts**
4. **Check token addresses carefully**
5. **Start with small test amounts**

### Audit Status
- Swap Service: Internal review completed
- Smart Contracts: Pending audit
- 0x Protocol: Fully audited

## Support

### Getting Help
- **Documentation**: This file and AUTHENTICATION_SETUP.md
- **In-Game Help**: Tutorial mode available
- **Community**: Discord support channel
- **Technical Issues**: GitHub issues

### Reporting Bugs
Please include:
1. Browser and version
2. Wallet type
3. Network used
4. Error messages
5. Transaction hash (if applicable)

---

**Note**: This feature is in beta. Use at your own risk and always verify transactions before confirming. Monad mainnet support will be added when the network launches.
