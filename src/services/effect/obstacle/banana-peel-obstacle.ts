import EffectObject from '../effect-object';
import { Vec2D } from '@/types/physics';
import { Obstacles } from '@/src/util/effects-utils';
import { TimedEffect } from '../timed-effect-driver';
import PhysicsBasedController from '@/src/controllers/physics-based-controller';
import GameTimeline from '../../game-logic/game-timeline';
import PlayerController from '@/src/controllers/player-controller';
import { Vector } from '@/src/util/vec-util';
const audio = new Audio('assets/sounds/banana.wav');

export default class BananaPeelObstacle extends EffectObject {
  constructor(position: Vec2D) {
    super(position, Obstacles.BANANA_PEEL);
  }

  override onEnter(car: PhysicsBasedController) {
    if (Vector.length(car.actualForce) > 80) {
      if (car instanceof PlayerController) {
        audio.play();
        // Track banana peel collision
        car.bananaPeelCollisions++;
        car.hasAvoidedBananaPeels = false;
        console.log(
          `Player hit banana peel! Total collisions: ${car.bananaPeelCollisions}`
        );

        if (car.bananaPeelCollisions >= 3) {
          console.log(
            'Player hit 3 banana peels! Triggering swap modal and finishing game...'
          );

          // Mark player as finished
          car.finished = true;
          car.finishedTime = GameTimeline.now();

          // Show swap modal after a short delay
          setTimeout(() => {
            console.log(
              'Loading swap modal module for 3 banana peel collisions...'
            );
            // Dynamically import and show the swap modal
            import('../../../components/SwapIntegration')
              .then(({ showSwapModal }) => {
                console.log(
                  'SwapIntegration loaded successfully, showing modal for collisions...'
                );
                showSwapModal({
                  bananaPeelCollisions: car.bananaPeelCollisions,
                  raceTime: GameTimeline.now(),
                  hasAvoidedBananaPeels: false,
                });

                // Finish the game after showing modal
                setTimeout(() => {
                  console.log('Finishing game after swap modal...');
                  import('../../game').then(({ default: Game }) => {
                    Game.instance.startResultScene();
                  });
                }, 2000);
              })
              .catch(error => {
                console.error('Failed to load swap modal:', error);
                // Still finish the game even if modal fails
                import('../../game').then(({ default: Game }) => {
                  Game.instance.startResultScene();
                });
              });
          }, 500);
        }
      }

      const effect: TimedEffect = {
        canBeOverrided: true,
        startTimestamp: GameTimeline.now(),
        duration: 700,
        finish() {},
        update(deltaTime) {
          car.rotate(-300 * deltaTime);
        },
      };

      car.timedEffectDriver.addEffect('slip', effect);
    }
  }
}
