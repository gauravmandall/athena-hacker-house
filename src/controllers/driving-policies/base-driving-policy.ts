import { EnemyPath } from '@/src/services/track-driver/enemy-path';
import { Vec2D, Action } from '@/types/physics';
import OpponentController from '../opponents-controller';

//* Base class for driving policies - classes that are responsible for decision making in opponents

abstract class BaseDrivingPolicy {
  protected _enemyPath: EnemyPath;
  protected _scaling_factor: number;

  parentRef: OpponentController | null = null;

  get enemyPath(): EnemyPath {
    return this._enemyPath;
  }

  constructor(trackPath: EnemyPath, scaling_factor: number) {
    this._enemyPath = trackPath;
    this._scaling_factor = scaling_factor;
  }

  abstract getAction(
    current_position: Vec2D,
    current_rotation: number,
    actualForce: Vec2D
  ): Action;
}

export default BaseDrivingPolicy;
