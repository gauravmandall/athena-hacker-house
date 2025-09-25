import React, { useEffect } from 'react';
import { showSwapModal } from './SwapIntegration';

export const SwapModalDebugButton: React.FC = () => {
  useEffect(() => {
    console.log('SwapModalDebugButton component mounted');
    return () => {
      console.log('SwapModalDebugButton component unmounted');
    };
  }, []);
  const handleTestModal = () => {
    alert('Perfect button clicked! Check console for more details.');
    try {
      showSwapModal({
        bananaPeelCollisions: 0,
        raceTime: 60.5,
        hasAvoidedBananaPeels: true,
      });
      console.log('Debug: showSwapModal called successfully');
    } catch (error) {
      console.error('Debug: Error calling showSwapModal:', error);
      alert(
        'Error opening swap modal: ' +
          (error instanceof Error ? error.message : String(error))
      );
    }
  };

  const handleTestModalWithCollisions = () => {
    console.log('Debug: Manually triggering swap modal with collisions...');
    alert('Collisions button clicked! Check console for more details.');
    try {
      showSwapModal({
        bananaPeelCollisions: 3,
        raceTime: 75.2,
        hasAvoidedBananaPeels: false,
      });
      console.log('Debug: showSwapModal called successfully');
    } catch (error) {
      console.error('Debug: Error calling showSwapModal:', error);
      alert(
        'Error opening swap modal: ' +
          (error instanceof Error ? error.message : String(error))
      );
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 30000,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        pointerEvents: 'auto',
        userSelect: 'none',
      }}
    >
      <button
        onClick={handleTestModal}
        onMouseDown={() => console.log('Debug: Perfect button mousedown')}
        onMouseUp={() => console.log('Debug: Perfect button mouseup')}
        style={{
          padding: '10px 20px',
          background: '#676fff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontFamily: 'Pixelify Sans, cursive',
          fontSize: '14px',
          fontWeight: 'bold',
          pointerEvents: 'auto',
          userSelect: 'none',
          outline: 'none',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
        }}
      >
        Test Swap Modal (Perfect)
      </button>
      <button
        onClick={handleTestModalWithCollisions}
        onMouseDown={() => console.log('Debug: Collisions button mousedown')}
        onMouseUp={() => console.log('Debug: Collisions button mouseup')}
        style={{
          padding: '10px 20px',
          background: '#ff6767',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontFamily: 'Pixelify Sans, cursive',
          fontSize: '14px',
          fontWeight: 'bold',
          pointerEvents: 'auto',
          userSelect: 'none',
          outline: 'none',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
        }}
      >
        Test Swap Modal (Collisions)
      </button>
      <button
        onClick={() => alert('Simple test button works!')}
        style={{
          padding: '5px 10px',
          background: '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '3px',
          cursor: 'pointer',
          fontSize: '12px',
          fontFamily: 'monospace',
          pointerEvents: 'auto',
          userSelect: 'none',
          outline: 'none',
        }}
      >
        Simple Test
      </button>
      <div
        style={{
          padding: '5px 10px',
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          fontSize: '12px',
          borderRadius: '3px',
          fontFamily: 'monospace',
        }}
      >
        Debug buttons loaded
      </div>
    </div>
  );
};
