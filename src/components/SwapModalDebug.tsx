import React from 'react';
import { showSwapModal } from './SwapIntegration';

// Debug component to test if the swap modal opens correctly
export const SwapModalDebugButton: React.FC = () => {
  const handleTestModal = () => {
    console.log('Debug: Manually triggering swap modal with perfect run data...');
    showSwapModal({
      bananaPeelCollisions: 0,
      raceTime: 60.5,
      hasAvoidedBananaPeels: true,
    });
  };

  const handleTestModalWithCollisions = () => {
    console.log('Debug: Manually triggering swap modal with collisions...');
    showSwapModal({
      bananaPeelCollisions: 3,
      raceTime: 75.2,
      hasAvoidedBananaPeels: false,
    });
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 30000,
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
    }}>
      <button
        onClick={handleTestModal}
        style={{
          padding: '10px 20px',
          background: '#676fff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontFamily: 'Pixelify Sans, cursive',
        }}
      >
        Test Swap Modal (Perfect)
      </button>
      <button
        onClick={handleTestModalWithCollisions}
        style={{
          padding: '10px 20px',
          background: '#ff6767',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontFamily: 'Pixelify Sans, cursive',
        }}
      >
        Test Swap Modal (Collisions)
      </button>
    </div>
  );
};
