import axios from 'axios';
import { ethers } from 'ethers';
import type { TokenInfo } from '../../config/tokens';
import { getTokensByChainId } from '../../config/tokens';

export interface SwapQuote {
  price: string;
  guaranteedPrice: string;
  to: string;
  data: string;
  value: string;
  gas: string;
  estimatedGas: string;
  gasPrice: string;
  buyAmount: string;
  sellAmount: string;
  allowanceTarget: string;
  sources: Array<{ name: string; proportion: string }>;
}

export class SwapService {
  private static instance: SwapService;
  private readonly API_BASE_URL = 'https://api.0x.org';
  // private readonly MONAD_API_BASE = 'https://monad-swap-api.xyz'; // Placeholder for Monad-specific API
  
  private constructor() {}

  public static getInstance(): SwapService {
    if (!SwapService.instance) {
      SwapService.instance = new SwapService();
    }
    return SwapService.instance;
  }

  // Get swap quote from 0x API
  public async getSwapQuote(
    chainId: number,
    sellToken: string,
    buyToken: string,
    sellAmount: string,
    userAddress: string,
    slippagePercentage: number = 0.5
  ): Promise<SwapQuote> {
    try {
      // For Monad testnet, use a custom implementation or wait for 0x support
      if (chainId === 41454) {
        return this.getMonadSwapQuote(sellToken, buyToken, sellAmount, userAddress, slippagePercentage);
      }

      // For supported chains (Ethereum, Polygon), use 0x API
      const params = new URLSearchParams({
        sellToken,
        buyToken,
        sellAmount,
        takerAddress: userAddress,
        slippagePercentage: slippagePercentage.toString(),
      });

      const response = await axios.get(`${this.API_BASE_URL}/swap/v1/quote?${params}`, {
        headers: {
          '0x-api-key': import.meta.env.VITE_0X_API_KEY || '', // Add your 0x API key
        },
      });

      return response.data;
    } catch (error) {
      console.error('Failed to get swap quote:', error);
      throw error;
    }
  }

  // Custom implementation for Monad swaps (placeholder until 0x supports Monad)
  private async getMonadSwapQuote(
    sellToken: string,
    buyToken: string,
    sellAmount: string,
    _userAddress: string, // Will be used when implementing actual DEX integration
    _slippagePercentage: number // Will be used when implementing actual DEX integration
  ): Promise<SwapQuote> {
    // This is a placeholder implementation for Monad
    // In production, you would integrate with Monad's DEX or swap protocol
    
    // Convert sellAmount from wei to human readable format for calculation
    const sellAmountInTokens = parseFloat(sellAmount) / Math.pow(10, 18); // Assuming 18 decimals for MON
    
    const mockPrices: { [key: string]: number } = {
      'MON-USDC': 0.5,    // 1 MON = 0.5 USDC
      'USDC-MON': 2.0,    // 1 USDC = 2 MON
      'MON-WMON': 1.0,    // 1 MON = 1 WMON
      'WMON-MON': 1.0,    // 1 WMON = 1 MON
      'WMON-USDC': 0.5,   // 1 WMON = 0.5 USDC
      'USDC-WMON': 2.0,   // 1 USDC = 2 WMON
    };
    
    // Determine price based on token pair
    let price = 1;
    const pair = `${sellToken}-${buyToken}`;
    price = mockPrices[pair] || 1;
    
    // Calculate buy amount in tokens, then convert back to wei
    const buyAmountInTokens = sellAmountInTokens * price;
    const buyAmountInWei = Math.floor(buyAmountInTokens * Math.pow(10, 6)); // USDC has 6 decimals
    
    console.log(`Monad Swap Quote: ${sellAmountInTokens} ${sellToken} -> ${buyAmountInTokens} ${buyToken} (price: ${price})`);
    
    const mockQuote: SwapQuote = {
      price: price.toString(),
      guaranteedPrice: (price * 0.99).toString(), // 1% slippage
      to: '0x1234567890123456789012345678901234567890', // Mock Monad DEX address
      data: '0x00', // Transaction data would be generated here
      value: sellToken === '0x0000000000000000000000000000000000000000' ? sellAmount : '0',
      gas: '200000',
      estimatedGas: '180000',
      gasPrice: '20000000000',
      buyAmount: buyAmountInWei.toString(),
      sellAmount,
      allowanceTarget: '0x1234567890123456789012345678901234567890', // Mock spender address
      sources: [{ name: 'MonadDEX', proportion: '1' }],
    };

    return mockQuote;
  }

  // Execute the swap transaction
  public async executeSwap(
    quote: SwapQuote,
    _signer: ethers.Signer
  ): Promise<ethers.TransactionResponse> {
    // For Monad testnet, this is a mock implementation
    // In production, you would execute real swap transactions
    
    console.log('Executing mock swap transaction...');
    console.log('Quote:', quote);
    
    // Create a mock transaction response
    const mockTx = {
      hash: '0x' + Math.random().toString(16).substr(2, 64),
      to: quote.to,
      value: quote.value,
      gasLimit: ethers.toBigInt(quote.gas),
      gasPrice: ethers.toBigInt(quote.gasPrice),
      data: quote.data,
      wait: async () => {
        console.log('Mock transaction confirmed');
        return {
          status: 1,
          blockNumber: Math.floor(Math.random() * 1000000),
          gasUsed: ethers.toBigInt(quote.estimatedGas),
        };
      }
    } as any;
    
    return mockTx;
  }

  // Check and set token allowance
  public async checkAndSetAllowance(
    tokenAddress: string,
    spenderAddress: string,
    amount: string,
    signer: ethers.Signer
  ): Promise<void> {
    if (tokenAddress === '0x0000000000000000000000000000000000000000') {
      // Native token, no allowance needed
      return;
    }

    const tokenContract = new ethers.Contract(
      tokenAddress,
      ['function allowance(address owner, address spender) view returns (uint256)',
       'function approve(address spender, uint256 amount) returns (bool)'],
      signer
    );

    const signerAddress = await signer.getAddress();
    const currentAllowance = await tokenContract.allowance(signerAddress, spenderAddress);

    if (currentAllowance < BigInt(amount)) {
      // Set allowance to max uint256 for convenience
      const tx = await tokenContract.approve(
        spenderAddress,
        '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
      );
      await tx.wait();
    }
  }

  // Get token balance
  public async getTokenBalance(
    tokenAddress: string,
    userAddress: string,
    provider: ethers.Provider
  ): Promise<string> {
    try {
      // Try to get the network to check if it's Monad testnet
      let chainId = 1; // Default to mainnet
      try {
        const network = await provider.getNetwork();
        chainId = Number(network.chainId);
        console.log(`Fetching balance on chain ${chainId} for token ${tokenAddress}`);
      } catch {
        // If we can't get network, continue with default
      }
      
      if (tokenAddress === '0x0000000000000000000000000000000000000000') {
        // Native token balance (MON, ETH, MATIC)
        const balance = await provider.getBalance(userAddress);
        console.log(`Native token balance: ${balance.toString()} wei`);
        return balance.toString();
      }

      // ERC20 token balance
      const tokenContract = new ethers.Contract(
        tokenAddress,
        ['function balanceOf(address owner) view returns (uint256)'],
        provider
      );

      const balance = await tokenContract.balanceOf(userAddress);
      console.log(`ERC20 token balance: ${balance.toString()} wei`);
      return balance.toString();
    } catch (error) {
      console.error('Error fetching balance:', error);
      // Return 0 balance on error instead of mock
      return '0';
    }
  }

  // Format token amount for display
  public formatTokenAmount(amount: string, decimals: number): string {
    try {
      const value = parseFloat(amount) / Math.pow(10, decimals);
      // Limit to 6 decimal places for display
      return value.toFixed(Math.min(6, decimals));
    } catch (error) {
      console.error('Error formatting amount:', error);
      return '0';
    }
  }

  // Parse token amount from user input
  public parseTokenAmount(amount: string, decimals: number): string {
    try {
      // Handle empty or invalid input
      if (!amount || isNaN(parseFloat(amount))) {
        return '0';
      }
      // For testing/demo, just convert to wei-like units
      const value = parseFloat(amount) * Math.pow(10, decimals);
      return Math.floor(value).toString();
    } catch (error) {
      console.error('Invalid amount:', error);
      return '0';
    }
  }

  // Get available tokens for a chain
  public getAvailableTokens(chainId: number): TokenInfo[] {
    return getTokensByChainId(chainId);
  }

  // Estimate gas for swap
  public async estimateSwapGas(
    quote: SwapQuote,
    signer: ethers.Signer
  ): Promise<bigint> {
    try {
      const gasEstimate = await signer.estimateGas({
        to: quote.to,
        data: quote.data,
        value: quote.value,
      });
      
      // Add 20% buffer
      return (gasEstimate * 120n) / 100n;
    } catch (error) {
      console.error('Failed to estimate gas:', error);
      // Return default gas limit if estimation fails
      return BigInt(quote.estimatedGas || '200000');
    }
  }
}
