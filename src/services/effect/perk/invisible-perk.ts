import { Vec2D } from '@/types/physics';
import { Perks } from '@/src/util/effects-utils';
import PhysicsBasedController from '@/src/controllers/physics-based-controller';
import EffectObject from '../effect-object';
import { TimedEffect } from '../timed-effect-driver';
import GameScene from '@/src/scenes/game-scene';
import GameTimeline from '../../game-logic/game-timeline';
import PlayerController from '@/src/controllers/player-controller';
const audio = new Audio('assets/sounds/invisible.wav');

export default class InvisiblePerk extends EffectObject {
  constructor(position: Vec2D) {
    super(position, Perks.INVISIBLE);
  }

  override onEnter(car: PhysicsBasedController) {
    if (car instanceof PlayerController) audio.play();
    if (!GameScene.instance || !GameScene.instance.playerController) return;
    GameScene.instance.opponentControllersList.forEach(opponent => {
      opponent.invisible = true;
    });
    GameScene.instance.playerController.invisible = true;

    const effect: TimedEffect = {
      canBeOverrided: false,
      startTimestamp: GameTimeline.now(),
      duration: 2000,
      finish: () => {
        if (!GameScene.instance || !GameScene.instance.playerController) return;

        GameScene.instance.opponentControllersList.forEach(opponent => {
          opponent.invisible = false;
        });
        GameScene.instance.playerController.invisible = false;
      },
      update() {},
    };

    car.timedEffectDriver.addEffect('invisible', effect);
  }
}
