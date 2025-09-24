import {
  htmlHideLoadingScreen,
  htmlHidePauseOverlay,
  htmlShowPauseOverlay,
} from '../util/html-utils';

import { createPauseContext, PauseCause } from '../context/pauseContext';
import Scene from '../scenes/_scene';
import { AboutScene } from '../scenes/about-scene';
import GameScene from '../scenes/game-scene';
import { ResultScene } from '../scenes/result-scene';
import { SelectionScene } from '../scenes/selection-scene';
import { StartScene } from '../scenes/start-scene';
import assert from '../util/assert';
import { startMusicWithFade } from '../util/music-utils';
import DisplayDriver from './display-driver/display-driver';
import GameTimeline from './game-logic/game-timeline';

class Game {
  //* Drivers
  displayDriver: DisplayDriver;

  //* Used to keep track of time
  private _lastRenderTime: number = 0;
  private _penultimateRenderTime: number = 0;
  private _currentScene: Scene | null = null;
  private _nickname: string = '';
  private _fps: number = 0;
  private _isRunning: boolean = false;
  private _walletAddress: string | null = null;

  static instance: Game;

  deltaTime: number = 0;

  private pauseDetails = createPauseContext({
    get isPaused() {
      return Object.values(this.pauseCauses).some(Boolean);
    },
    pauseCauses: { gameLogic: false, pauseMenu: false, windowChange: false },
    isWindowActive: null,
    documentTimeline: new DocumentTimeline(),
    pauseGame: this.pauseGame.bind(this),
    resumeGame: this.resumeGame.bind(this),
  });

  private menuMusic: HTMLAudioElement = new Audio(
    '/assets/sounds/menu_theme.wav'
  );

  get currentScene() {
    assert(this._currentScene, 'Current scene not initialized');
    return this._currentScene;
  }

  set currentScene(scene: Scene) {
    if (this._currentScene) this._currentScene.onDisMount();
    this._currentScene = scene;
    this._currentScene.onMount();

    if (
      scene instanceof AboutScene ||
      scene instanceof SelectionScene ||
      scene instanceof StartScene
    ) {
      this.menuMusic.loop = true;
      startMusicWithFade(this.menuMusic);
    } else {
      this.menuMusic.pause();
      this.menuMusic.currentTime = 0;
    }
  }

  get nickname() {
    return this._nickname;
  }

  set nickname(nickname: string) {
    this._nickname = nickname;
  }

  get isRunning() {
    return this._isRunning;
  }

  get walletAddress() {
    return this._walletAddress;
  }

  set walletAddress(address: string | null) {
    this._walletAddress = address;
  }

  constructor(canvas: HTMLCanvasElement) {
    this.displayDriver = new DisplayDriver(canvas);

    Game.instance = this;
  }

  static getInstance(): Game {
    assert(Game.instance, 'Game instance not initialized');
    return Game.instance;
  }

  async start() {
    this._isRunning = true;
    this.displayDriver.setResolution(320, 182);
    this.displayDriver.clear();

    await this.displayDriver.autoLoadSprites();
    htmlHideLoadingScreen();

    this.startStartScene();
    // window.addEventListener("keydown", this.handleKeyDown.bind(this));

    //* Start the game loop
    this._update();
  }

  async startGameScene(car: string, color: string, map: string) {
    this.currentScene = new GameScene(this.displayDriver, car, color, map);
    await this.currentScene.init();
  }

  async startTutorialGameScene(car: string, color: string) {
    const game = new GameScene(this.displayDriver, car, color, 'gravel');
    this.currentScene = game;
    await game.init(true);
  }

  async startSelectionScene() {
    this.currentScene = new SelectionScene();
    await this.currentScene.init();
  }

  startResultScene() {
    const speedMeter = document.querySelector<HTMLElement>(
      '.speed-meter__inner'
    );
    if (speedMeter) speedMeter.style.display = 'none';

    this.currentScene = new ResultScene();
    this.currentScene.init();
  }

  async startAboutScene() {
    this.currentScene = new AboutScene();
    this.currentScene.init();
  }

  async startStartScene() {
    this.currentScene = new StartScene();
    this.currentScene.init();
  }

  pauseGame(cause: PauseCause, skipOverlayUpdate = false): void {
    if (
      !skipOverlayUpdate &&
      this.currentScene instanceof GameScene &&
      cause === 'pauseMenu'
    ) {
      htmlShowPauseOverlay();
    }
    this.pauseDetails.pauseCauses[cause] = true;
  }

  resumeGame(cause: PauseCause): void {
    this.pauseDetails.pauseCauses[cause] = false;
    if (cause === 'pauseMenu') {
      htmlHidePauseOverlay();
    }
    if (!this.pauseDetails.isPaused) {
      this._lastRenderTime = this.pauseDetails.documentTimeline
        .currentTime as number;
      this._penultimateRenderTime = this.pauseDetails.documentTimeline
        .currentTime as number;
      this._update();
    }
  }
  //* This method is called every frame, but it should be free of any game logic
  //* It's only purpose is to keep FPS stable
  //* It prevents the game from running too fast or too slow
  //! For any game logic check out the update method
  private _update() {
    this.displayDriver.clear();
    this.deltaTime =
      (this._lastRenderTime - this._penultimateRenderTime) / 1000;

    // Calculate FPS
    if (this.deltaTime > 0) {
      this._fps = Math.round(1 / this.deltaTime);
    }

    GameTimeline.update(this.deltaTime);
    this.currentScene.update(this.deltaTime);
    this.currentScene.render(this.displayDriver.ctx);

    // Render FPS counter
    this.displayDriver.ctx.fillStyle = 'white';
    this.displayDriver.ctx.font = '12px Arial';
    this.displayDriver.ctx.fillText(`FPS: ${this._fps}`, 10, 20);

    // pause render if window isn't active
    // returns here to allow last render before pause
    if (this.pauseDetails.isPaused) return;

    requestAnimationFrame(renderTime => {
      this._penultimateRenderTime = this._lastRenderTime;
      this._lastRenderTime = renderTime;
      this._update();
    });
  }
}

export default Game;
