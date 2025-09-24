import Game from './services/game';
import { initializeAuth } from './App';
import { AuthService } from './services/auth/auth-service';

function resizeApp(app: HTMLDivElement) {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const scalingFactor = Math.min(width / (320 * 4), height / (182 * 4));
  app.style.scale = `${scalingFactor.toPrecision(2)}`;
}

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
  if (!canvas) {
    throw new Error('Failed to get app element');
  }

  const app = document.getElementById('app') as HTMLDivElement;
  if (!app) {
    throw new Error('Failed to get app element');
  }

  resizeApp(app);
  window.addEventListener('resize', () => {
    resizeApp(app);
  });
  
  const game = new Game(canvas);
  
  // Initialize Privy authentication
  initializeAuth(game);
  
  // Check if user is authenticated before starting the game
  const authService = AuthService.getInstance();
  
  // Subscribe to authentication changes
  authService.subscribe((state) => {
    if (state.isAuthenticated && state.walletAddress) {
      // Start the game when authenticated
      if (!game.isRunning) {
        game.start();
      }
    }
  });
  
  // Show authentication overlay initially
  setTimeout(() => {
    const authOverlay = document.getElementById('auth-overlay');
    if (authOverlay && !authService.isAuthenticated()) {
      authOverlay.style.display = 'flex';
    }
  }, 100);
});
