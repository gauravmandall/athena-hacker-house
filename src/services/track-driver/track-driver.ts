import BonusBase from '@/src/services/bonus/bonus-base';
import DisplayDriver from '../display-driver/display-driver';
import GameTimeline from '../game-logic/game-timeline';
import { Sprite } from '@/types/display-driver';
import { StartPosition } from '@/types/track-driver';
import { TrackPath } from './track-path';
import type track from '@/public/assets/tracks/grass/track.json';

type GateConfig = (typeof track.gates)[number];
type Gate = Omit<GateConfig, 'sprite'> & { sprite: Sprite };
export type TrackDifficulty = 1 | 2 | 3;

class Track {
  //* List of bonuses that will spawn on the track (inheriting from a base Bonus class)
  private _bonuses: BonusBase[];

  private _traction: number;
  isRainy: boolean;

  //* Start positions (list of 5 starting positions for each car)
  private _startPositions: StartPosition[];

  //* Layers for rendering (e.g., bridges above cars, track below cars) - list of paths to png files
  private _fgLayers: Array<Sprite | null>;
  private _bgLayers: Array<Sprite | null>;

  //* Collider 2d array (value under each record is defining where cars can/can't go)
  //* If it has 1 item in it then the colliders are static otherwise the colliders change in periods defined in TRACK_COLLIDER_SWITCH_COOLDOWN
  private _colliderImages: [number[][]] | [number[][], number[][]];
  private _currentColliderImageIndex = 0;
  private _gates: Gate[] = [];
  readonly difficulty: TrackDifficulty;

  private _checkPointPath: TrackPath | null = null;

  private lastTrackObstacleSwitchTimestamp = -1;
  private readonly TRACK_COLLIDER_SWITCH_COOLDOWN = 5000;
  private readonly SWITCH_TRANSITION_DURATION = 1000;

  private static _instance: Track;

  constructor(
    bonuses: BonusBase[],
    traction: number,
    startPositions: StartPosition[],
    fgLayers: Array<Sprite | null>,
    bgLayers: Array<Sprite | null>,
    baseColliderImage: number[][],
    openedShortcutColliderImage: number[][] | null,
    gates: GateConfig[],
    checkPointPath: TrackPath,
    isRainy: boolean,
    difficulty: TrackDifficulty
  ) {
    this._bonuses = bonuses;
    this._traction = traction;
    this._fgLayers = fgLayers;
    this._bgLayers = bgLayers;
    this._colliderImages = [baseColliderImage];
    if (openedShortcutColliderImage) {
      this._colliderImages.push(openedShortcutColliderImage);
    }
    this._gates = gates.map(gate => {
      const displayDriver = DisplayDriver.currentInstance!;
      const sprite = displayDriver.getSprite(gate.sprite);
      if (!sprite) {
        throw new Error(
          `sprite ${gate.sprite} not found. make sure it's included in autoload.json`
        );
      }
      return { ...gate, sprite };
    });

    this._checkPointPath = checkPointPath;
    this.isRainy = isRainy;
    this.difficulty = difficulty;
    this._startPositions = startPositions.map(startPosition => {
      return {
        position: checkPointPath.sampledPoints[0].point,
        angle: startPosition.angle,
      };
    });
    Track._instance = this;
  }

  //* Getters for accessing private fields safely

  get bonuses(): BonusBase[] {
    return this._bonuses;
  }

  get gates(): Gate[] {
    return this._gates;
  }

  get startPositions(): StartPosition[] {
    return this._startPositions;
  }

  get fgLayers(): Array<Sprite | null> {
    return this._fgLayers;
  }

  get bgLayers(): Array<Sprite | null> {
    return this._bgLayers;
  }

  get colliderImage(): number[][] {
    return this._colliderImages[this._currentColliderImageIndex];
  }

  get traction(): number {
    return this._traction;
  }

  /**
   *  @returns value between 0 and 1 meaning 0 - start of transition, 1 - end of transition, track collider is being changed
   * e.g. if track collider switches every 5000ms then transition starts at 4000ms (with value of 0) and ends at 5000ms (with 1)
   * */
  get currentTransitionFraction() {
    const transition = Math.max(
      0,
      GameTimeline.now() -
        this.lastTrackObstacleSwitchTimestamp -
        this.TRACK_COLLIDER_SWITCH_COOLDOWN +
        this.SWITCH_TRANSITION_DURATION
    );
    return transition / this.SWITCH_TRANSITION_DURATION;
  }

  get areShortcutsOpened() {
    return this._currentColliderImageIndex === 1;
  }

  get checkPointPath(): TrackPath | null {
    return this._checkPointPath;
  }

  static get currentInstance(): Track | null {
    if (!Track._instance) {
      return null;
    }
    return Track._instance;
  }

  update() {
    if (
      GameTimeline.now() >
      this.lastTrackObstacleSwitchTimestamp +
        this.TRACK_COLLIDER_SWITCH_COOLDOWN
    ) {
      this._currentColliderImageIndex =
        (this._currentColliderImageIndex + 1) % this._colliderImages.length;
      this.lastTrackObstacleSwitchTimestamp = GameTimeline.now();
    }
  }

  renderGates() {
    // const gate = document.getElementById("gate")!;
    const displayDriver = DisplayDriver.currentInstance!;
    this._gates.forEach(gate => {
      const spritesNumber =
        gate.sprite.image.width / gate.sprite.config.spriteWidth;
      if (this.areShortcutsOpened) {
        if (this.currentTransitionFraction) {
          displayDriver.drawSprite({
            currentSprite: Math.floor(
              (this.currentTransitionFraction * spritesNumber) % spritesNumber
            ),
            position: {
              x: (gate.x * displayDriver.scaler) / 2,
              y: (gate.y * displayDriver.scaler) / 2,
            },
            sprite: gate.sprite,
          });
        } else {
          displayDriver.drawSprite({
            currentSprite: 0,
            position: {
              x: (gate.x * displayDriver.scaler) / 2,
              y: (gate.y * displayDriver.scaler) / 2,
            },
            sprite: gate.sprite,
          });
        }
      } else {
        if (this.currentTransitionFraction) {
          displayDriver.drawSprite({
            currentSprite: Math.floor(
              (spritesNumber - this.currentTransitionFraction * spritesNumber) %
                spritesNumber
            ),
            position: {
              x: (gate.x * displayDriver.scaler) / 2,
              y: (gate.y * displayDriver.scaler) / 2,
            },
            sprite: gate.sprite,
          });
        } else {
          displayDriver.drawSprite({
            currentSprite: spritesNumber - 1,
            position: {
              x: (gate.x * displayDriver.scaler) / 2,
              y: (gate.y * displayDriver.scaler) / 2,
            },
            sprite: gate.sprite,
          });
        }
      }
    });
  }
}

export default Track;
