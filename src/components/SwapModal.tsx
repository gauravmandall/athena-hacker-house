import React, { useState, useEffect } from 'react';
import { useWallets } from '@privy-io/react-auth';
import { ethers } from 'ethers';
import { SwapService, SwapQuote } from '../services/swap/swap-service';
import { getTokensByChainId, TokenInfo } from '../config/tokens';

interface SwapModalProps {
  isOpen: boolean;
  onClose: () => void;
  bananaPeelCollisions: number;
  raceTime: number;
}

export const SwapModal: React.FC<SwapModalProps> = ({
  isOpen,
  onClose,
  bananaPeelCollisions,
  raceTime,
}) => {
  const { wallets } = useWallets();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [chainId, setChainId] = useState(41454);
  const [sellToken, setSellToken] = useState<TokenInfo | null>(null);
  const [buyToken, setBuyToken] = useState<TokenInfo | null>(null);
  const [sellAmount, setSellAmount] = useState('');
  const [buyAmount, setBuyAmount] = useState('');
  const [slippage, setSlippage] = useState(0.5);
  const [quote, setQuote] = useState<SwapQuote | null>(null);
  const [balance, setBalance] = useState<string>('0');

  const swapService = SwapService.getInstance();
  const availableTokens = getTokensByChainId(chainId);

  useEffect(() => {
    if (isOpen && availableTokens.length > 0) {
      setSellToken(availableTokens[0]);
      setBuyToken(availableTokens[1]);
    }
  }, [isOpen, chainId]);

  useEffect(() => {
    if (sellToken && wallets[0]) {
      fetchBalance();
    }
  }, [sellToken, wallets]);

  useEffect(() => {
    if (sellAmount && sellToken && buyToken) {
      fetchQuote();
    }
  }, [sellAmount, sellToken, buyToken, slippage]);

  const fetchBalance = async () => {
    if (!sellToken) {
      setBalance('0');
      return;
    }

    if (!wallets[0]) {
      console.log('No wallet connected');
      setBalance('0');
      return;
    }

    try {
      const ethereumProvider = await wallets[0].getEthereumProvider();
      const provider = new ethers.BrowserProvider(ethereumProvider);
      const address = wallets[0].address;
      const balance = await swapService.getTokenBalance(
        sellToken.address,
        address,
        provider
      );
      setBalance(balance);
    } catch (err) {
      console.error('Failed to fetch balance:', err);
      setBalance('0');
    }
  };

  const fetchQuote = async () => {
    if (!sellAmount || !sellToken || !buyToken) return;

    try {
      const parsedAmount = swapService.parseTokenAmount(
        sellAmount,
        sellToken.decimals
      );
      const userAddress =
        wallets[0]?.address || '0x0000000000000000000000000000000000000001'; // Mock address for testing

      const quote = await swapService.getSwapQuote(
        chainId,
        sellToken.symbol, // Use symbol instead of address for Monad mock
        buyToken.symbol, // Use symbol instead of address for Monad mock
        parsedAmount,
        userAddress,
        slippage
      );

      setQuote(quote);
      setBuyAmount(
        swapService.formatTokenAmount(quote.buyAmount, buyToken.decimals)
      );
      setError(null); // Clear any previous errors
    } catch (err) {
      console.error('Failed to fetch quote:', err);
      setError('Failed to fetch swap quote');
    }
  };

  const handleSwap = async () => {
    if (!quote || !sellToken || !buyToken) {
      setError('Missing swap details. Please try again.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (!wallets[0]) {
        // Mock swap for testing without wallet
        setTimeout(() => {
          setSuccess(
            `Mock swap successful! Swapped ${sellAmount} ${sellToken.symbol} for ${buyAmount} ${buyToken.symbol}!`
          );
          setSellAmount('');
          setBuyAmount('');
          setIsLoading(false);
        }, 2000);
        return;
      }

      const ethereumProvider = await wallets[0].getEthereumProvider();
      const provider = new ethers.BrowserProvider(ethereumProvider);
      const signer = await provider.getSigner();

      const network = await provider.getNetwork();
      if (Number(network.chainId) === 41454) {
        console.log('Monad testnet detected - using mock swap');
        setTimeout(() => {
          setSuccess(
            `Mock swap successful! Swapped ${sellAmount} ${sellToken.symbol} for ${buyAmount} ${buyToken.symbol}!`
          );
          setSellAmount('');
          setBuyAmount('');
          setIsLoading(false);

          // Refresh balance
          fetchBalance();
        }, 2000);
        return;
      }

      // For other networks, execute real swap
      // Check and set allowance if needed
      if (sellToken.address !== '0x0000000000000000000000000000000000000000') {
        await swapService.checkAndSetAllowance(
          sellToken.address,
          quote.allowanceTarget,
          quote.sellAmount,
          signer
        );
      }

      // Execute swap
      const tx = await swapService.executeSwap(quote, signer);
      await tx.wait();

      setSuccess(
        `Successfully swapped ${sellAmount} ${sellToken.symbol} for ${buyAmount} ${buyToken.symbol}!`
      );
      setSellAmount('');
      setBuyAmount('');

      // Refresh balance
      fetchBalance();
    } catch (err: unknown) {
      console.error('Swap failed:', err);
      const errorMessage =
        err instanceof Error ? err.message : 'Swap failed. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const switchTokens = () => {
    const temp = sellToken;
    setSellToken(buyToken);
    setBuyToken(temp);
    setSellAmount('');
    setBuyAmount('');
  };

  const calculateRewards = () => {
    // Calculate bonus rewards based on performance
    const baseReward = 100; // Base MON tokens
    const noBananaPeelBonus = bananaPeelCollisions === 0 ? 500 : 0; // 500 MON bonus for no banana collisions
    const timeBonus = Math.max(0, 300 - Math.floor(raceTime)); // Time-based bonus

    return {
      base: baseReward,
      noBanana: noBananaPeelBonus,
      time: timeBonus,
      total: baseReward + noBananaPeelBonus + timeBonus,
    };
  };

  const rewards = calculateRewards();

  if (!isOpen) return null;

  return (
    <div className="swap-modal-overlay">
      <div className="swap-modal">
        <button className="swap-close-btn" onClick={onClose}>
          ✕
        </button>

        <div className="swap-header">
          <h2 className="swap-title">🏁 Race Complete!</h2>

          {bananaPeelCollisions === 0 ? (
            <div className="achievement-banner gold">
              <span className="achievement-icon">🏆</span>
              <div>
                <h3>Perfect Run!</h3>
                <p>No banana peels hit - Token Swap Unlocked!</p>
              </div>
            </div>
          ) : (
            <div className="achievement-banner silver">
              <span className="achievement-icon">🥈</span>
              <div>
                <h3>Race Finished!</h3>
                <p>
                  {bananaPeelCollisions} banana peel
                  {bananaPeelCollisions > 1 ? 's' : ''} hit
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="rewards-section">
          <h3>Your Rewards</h3>
          <div className="rewards-breakdown">
            <div className="reward-item">
              <span>Base Reward:</span>
              <span>{rewards.base} MON</span>
            </div>
            {rewards.noBanana > 0 && (
              <div className="reward-item bonus">
                <span>Perfect Run Bonus:</span>
                <span>+{rewards.noBanana} MON</span>
              </div>
            )}
            <div className="reward-item">
              <span>Speed Bonus:</span>
              <span>+{rewards.time} MON</span>
            </div>
            <div className="reward-item total">
              <span>Total:</span>
              <span>{rewards.total} MON</span>
            </div>
          </div>
        </div>

        {bananaPeelCollisions === 0 ? (
          <div className="swap-section">
            <h3>
              Token Swap {chainId === 41454 && '(Monad Testnet - Mock Mode)'}
            </h3>
            {chainId === 41454 && (
              <div
                className="info-message"
                style={{
                  background: 'rgba(255, 215, 0, 0.1)',
                  border: '1px solid #ffd700',
                  padding: '0.5rem',
                  borderRadius: '5px',
                  marginBottom: '1rem',
                  fontSize: '0.85rem',
                  color: '#ffd700',
                }}
              >
                Monad Testnet: Using mock swaps to avoid gas fees
              </div>
            )}

            <div className="chain-selector">
              <label>Network:</label>
              <select
                value={chainId}
                onChange={e => setChainId(Number(e.target.value))}
                className="chain-select"
              >
                <option value={41454}>Monad Testnet</option>
                <option value={1}>Ethereum</option>
                <option value={137}>Polygon</option>
              </select>
            </div>

            <div className="swap-container">
              <div className="swap-input-group">
                <label>You Pay</label>
                <div className="token-input">
                  <input
                    type="number"
                    placeholder="0.0"
                    value={sellAmount}
                    onChange={e => setSellAmount(e.target.value)}
                    disabled={isLoading}
                  />
                  <select
                    value={sellToken?.symbol || ''}
                    onChange={e => {
                      const token = availableTokens.find(
                        t => t.symbol === e.target.value
                      );
                      setSellToken(token || null);
                    }}
                    className="token-select"
                  >
                    {availableTokens.map(token => (
                      <option key={token.address} value={token.symbol}>
                        {token.symbol}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="balance-info">
                  Balance:{' '}
                  {sellToken
                    ? swapService.formatTokenAmount(balance, sellToken.decimals)
                    : '0'}{' '}
                  {sellToken?.symbol}
                </div>
              </div>

              <button className="swap-switch-btn" onClick={switchTokens}>
                <span>⇅</span>
              </button>

              <div className="swap-input-group">
                <label>You Receive</label>
                <div className="token-input">
                  <input
                    type="number"
                    placeholder="0.0"
                    value={buyAmount}
                    readOnly
                  />
                  <select
                    value={buyToken?.symbol || ''}
                    onChange={e => {
                      const token = availableTokens.find(
                        t => t.symbol === e.target.value
                      );
                      setBuyToken(token || null);
                    }}
                    className="token-select"
                  >
                    {availableTokens.map(token => (
                      <option key={token.address} value={token.symbol}>
                        {token.symbol}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="slippage-settings">
                <label>Slippage Tolerance: {slippage}%</label>
                <input
                  type="range"
                  min="0.1"
                  max="5"
                  step="0.1"
                  value={slippage}
                  onChange={e => setSlippage(parseFloat(e.target.value))}
                />
              </div>

              {quote && (
                <div className="swap-details">
                  <div className="detail-row">
                    <span>Rate:</span>
                    <span>
                      1 {sellToken?.symbol} ={' '}
                      {parseFloat(quote.price).toFixed(4)} {buyToken?.symbol}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span>Est. Gas:</span>
                    <span>
                      {ethers.formatUnits(quote.estimatedGas, 'gwei')} GWEI
                    </span>
                  </div>
                </div>
              )}

              {error && <div className="error-message">{error}</div>}

              {success && <div className="success-message">{success}</div>}

              <button
                className="swap-execute-btn"
                onClick={handleSwap}
                disabled={!sellAmount || !buyAmount || isLoading}
              >
                {isLoading ? 'Swapping...' : 'Swap Tokens'}
              </button>
            </div>
          </div>
        ) : (
          <div className="swap-locked">
            <h3>🔒 Swap Feature Locked</h3>
            <p>
              Complete a race without hitting any banana peels to unlock token
              swapping!
            </p>
            <p className="tip">Tip: Watch out for banana peels on the track!</p>
          </div>
        )}

        <div className="modal-actions">
          <button className="continue-btn" onClick={onClose}>
            Continue to Results
          </button>
        </div>
      </div>
    </div>
  );
};
