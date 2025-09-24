import React, { useState } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { SwapModal } from './SwapModal';
import { PrivyProvider } from './PrivyProvider';

let swapModalRoot: Root | null = null;
let swapModalContainer: HTMLDivElement | null = null;

// Interface for swap modal data
export interface SwapModalData {
  bananaPeelCollisions: number;
  raceTime: number;
  hasAvoidedBananaPeels: boolean;
}

// Function to show the swap modal
export function showSwapModal(data: SwapModalData) {
  // Create container if it doesn't exist
  if (!swapModalContainer) {
    swapModalContainer = document.createElement('div');
    swapModalContainer.id = 'swap-modal-root';
    document.body.appendChild(swapModalContainer);
  }

  // Create React root if it doesn't exist
  if (!swapModalRoot) {
    swapModalRoot = createRoot(swapModalContainer);
  }

  // Component wrapper that handles the modal state
  const SwapModalWrapper: React.FC = () => {
    const [isOpen, setIsOpen] = useState(true);

    const handleClose = () => {
      setIsOpen(false);
      // Clean up after a short delay
      setTimeout(() => {
        if (swapModalRoot) {
          swapModalRoot.unmount();
          swapModalRoot = null;
        }
        if (swapModalContainer && swapModalContainer.parentNode) {
          swapModalContainer.parentNode.removeChild(swapModalContainer);
          swapModalContainer = null;
        }
      }, 300); // Allow time for close animation
    };

    return (
      <SwapModal
        isOpen={isOpen}
        onClose={handleClose}
        bananaPeelCollisions={data.bananaPeelCollisions}
        raceTime={data.raceTime}
      />
    );
  };

  // Render the modal wrapped with PrivyProvider
  swapModalRoot.render(
    <PrivyProvider>
      <SwapModalWrapper />
    </PrivyProvider>
  );
}

// Function to hide the swap modal if it's open
export function hideSwapModal() {
  if (swapModalRoot) {
    swapModalRoot.unmount();
    swapModalRoot = null;
  }
  if (swapModalContainer && swapModalContainer.parentNode) {
    swapModalContainer.parentNode.removeChild(swapModalContainer);
    swapModalContainer = null;
  }
}

// Hook to use swap modal in React components
export function useSwapModal() {
  const [modalData, setModalData] = useState<SwapModalData | null>(null);

  const openModal = (data: SwapModalData) => {
    setModalData(data);
    showSwapModal(data);
  };

  const closeModal = () => {
    setModalData(null);
    hideSwapModal();
  };

  return { openModal, closeModal, modalData };
}
