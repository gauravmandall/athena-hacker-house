import EffectObject from '../effect-object';
import { Vec2D } from '@/types/physics';
import { Obstacles } from '@/src/util/effects-utils';
import { TimedEffect } from '../timed-effect-driver';
import PhysicsBasedController from '@/src/controllers/physics-based-controller';
import GameTimeline from '../../game-logic/game-timeline';
import PlayerController from '@/src/controllers/player-controller';
import { Vector } from '@/src/util/vec-util';
const audio = new Audio('assets/sounds/spikes.wav');

export default class SpikesObstacle extends EffectObject {
  private readonly FORCE_MODIFIER = 0.2;
  private readonly MAX_SPEED_MODIFIER = 0.8;
  private readonly ACCELERATION_MODIFIER = 0.7;

  constructor(position: Vec2D) {
    super(position, Obstacles.SPIKES);
  }

  override onEnter(car: PhysicsBasedController) {
    if (Vector.length(car.actualForce) > 80) {
      if (car instanceof PlayerController) audio.play();

      car.actualForce.x *= this.FORCE_MODIFIER;
      car.actualForce.y *= this.FORCE_MODIFIER;
      car.currentMaxSpeedForward *= this.MAX_SPEED_MODIFIER;
      car.currentAccelerationPowerForward *= this.ACCELERATION_MODIFIER;

      const effect: TimedEffect = {
        canBeOverrided: true,
        startTimestamp: GameTimeline.now(),
        duration: 3000,
        finish: () => {
          car.currentMaxSpeedForward /= this.MAX_SPEED_MODIFIER;
          car.currentAccelerationPowerForward /= this.ACCELERATION_MODIFIER;
        },
        update() {},
      };

      car.timedEffectDriver.addEffect('damaged', effect);
    }
  }
}
