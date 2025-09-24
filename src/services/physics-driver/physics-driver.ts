import PhysicsBasedController from '@/src/controllers/physics-based-controller';
import { PhysicsUtils } from '@/src/util/physics-util';
import { Vector } from '@/src/util/vec-util';
import { Vec2D } from '@/types/physics';
import DisplayDriver from '../display-driver/display-driver';
import GameTimeline from '../game-logic/game-timeline';
import PlayerController from '@/src/controllers/player-controller';

const audioEngine = new Audio('assets/sounds/idle.wav');
let isPlaying = false;

function playAudio() {
  if (!isPlaying) {
    isPlaying = true;
    audioEngine.currentTime = 0;
    audioEngine.volume = 0.5;
    audioEngine
      .play()
      .then(() => {
        setTimeout(() => {
          isPlaying = false;
        }, audioEngine.duration * 900);
      })
      .catch(err => console.error('Audio playback error:', err));
  }
}

//* We use separate drivers for physics and display to separate concerns
//* Also we don't perform physics inside the controller, it's 'cause it uses information that single controller has no access to
//* Such as track information, enemies etc.
class PhysicsDriver {
  private isColliding: boolean = false; // Flaga kolizji, aby zapobiec wielokrotnemu przetwarzaniu kolizji
  private soundPlayed: boolean = false;
  //* TRACK INFO REF WILL BE HERE

  updateController(controller: PhysicsBasedController, deltaTime: number) {
    if (this.isColliding) {
      return;
    }

    //* This is a simple physics loop
    this.calculateActualForce(controller, deltaTime);
    controller.actualForce = this.calculateFriction(controller, deltaTime);
    controller.actualForce = this.engineBraking(controller, deltaTime);
    const newPosition = Vector.add(
      controller.position,
      Vector.scale(controller.actualForce, deltaTime)
    );
    controller.position = newPosition;
    controller.turning(deltaTime);
    if (controller.steeringForce !== 0 && !controller.isTurning) {
      controller.steeringForce =
        Math.round(
          (controller.steeringForce -
            60 * deltaTime * 0.05 * Math.sign(controller.steeringForce)) *
            100
        ) / 100;
    }
    if (controller instanceof PlayerController) {
      if (!this.soundPlayed) {
        playAudio();
      }
    }
    controller.isTurning = false;
    //controller.enterNitroMode()
  }

  handleCollision(
    controller: PhysicsBasedController,
    collisionPoint: Vec2D,
    trackCollider: number[][],
    _deltaTime: number
  ) {
    if (!collisionPoint) {
      return;
    }
    const displayDriver = DisplayDriver.currentInstance;

    const approachVector = Vector.subtract(
      controller.centerPosition,
      collisionPoint as Vec2D
    );
    const normalizedNormal = Vector.normalize(approachVector);

    const SPEED_LOSS = 0.7;
    controller.actualForce = Vector.scale(controller.actualForce, SPEED_LOSS);

    //? Miejsce zderzenia w tablicy trackCollider
    const gridX = Math.round(collisionPoint.x / displayDriver!.scaler);
    const gridY = Math.round(collisionPoint.y / displayDriver!.scaler);
    const points: Vec2D[] = [];

    const pattern = 1;
    for (let dx = -pattern; dx <= pattern; dx++) {
      for (let dy = -pattern; dy <= pattern; dy++) {
        if (dy === 0 && dx === 0) continue;
        if (
          trackCollider[gridY + dy] &&
          trackCollider[gridY + dy][gridX + dx] === 1
        ) {
          points.push({
            x: (gridX + dx) * displayDriver!.scaler,
            y: (gridY + dy) * displayDriver!.scaler,
          });
        }
      }
    }

    // for (let p = 0; p < points.length - 1; p++)
    //   displayDriver?.drawLineBetweenVectors(points[p], points[p + 1], "green");

    const x = PhysicsUtils.linearRegression(points);

    let normal: Vec2D;

    if (x[0] === Infinity) {
      normal = { x: 1, y: 0 };
    } else {
      normal = Vector.normalize({ x: -x[0], y: 1 });
    }

    //? Odwrocenie normlanej jesli jest5 zle skierowana (nie wiem czemu ale śmiga :) )
    if (Vector.dot(normal, approachVector) > 0) {
      normal = Vector.scale(normal, -1);
    }

    const dotProduct = Vector.dot(controller.actualForce, normal);
    const reflection = Vector.subtract(
      controller.actualForce,
      Vector.scale(normal, 2 * dotProduct)
    );

    controller.actualForce = Vector.scale(reflection, SPEED_LOSS);

    const impactAngle = Math.atan2(
      controller.actualForce.y,
      controller.actualForce.x
    );
    const normalAngle = Math.atan2(normal.y, normal.x);
    const angleDifference = Math.atan2(
      Math.sin(impactAngle - normalAngle),
      Math.cos(impactAngle - normalAngle)
    );
    controller.rotate(angleDifference * 3);

    controller.setPosition(
      Vector.add(controller.position, Vector.scale(normalizedNormal, 2))
    );

    controller.updateCurrentSprite();
    GameTimeline.setTimeout(() => {
      this.isColliding = false;
    }, 50);
  }

  handleCollisionBetweenControllers(
    controller1: PhysicsBasedController,
    controller2: PhysicsBasedController
  ) {
    const normal = Vector.normalize(
      Vector.subtract(controller1.position, controller2.position)
    );
    const relativeVelocity = Vector.subtract(
      controller1.velocity,
      controller2.velocity
    );
    const speedAlongNormal = Vector.dot(relativeVelocity, normal);

    if (speedAlongNormal > 0) return; // Objects are separating

    const RESTITUTION = 0.8; // Elasticity factor
    const impulseMagnitude = (-(1 + RESTITUTION) * speedAlongNormal) / 2;
    const impulse = Vector.scale(normal, impulseMagnitude);

    controller1.velocity = Vector.add(controller1.velocity, impulse);
    controller2.velocity = Vector.subtract(controller2.velocity, impulse);

    controller1.setPosition(
      Vector.add(controller1.position, Vector.scale(normal, 1))
    );
    controller2.setPosition(
      Vector.subtract(controller2.position, Vector.scale(normal, 1))
    );
  }

  calculateActualForce(controller: PhysicsBasedController, deltaTime: number) {
    controller.actualForce = Vector.add(
      controller.actualForce,
      Vector.scale(controller.acceleration, deltaTime * 60)
    );
    controller.actualForce = PhysicsUtils.normalizeForceToAngle(
      controller.actualForce,
      controller.angle,
      0.05
    );
    controller.acceleration = { x: 0, y: 0 };
  }

  calculateFriction(
    controller: PhysicsBasedController,
    deltaTime: number
  ): Vec2D {
    const differenceInAngle =
      Math.floor(
        ((Math.abs(Vector.angle(controller.actualForce) - controller.angle) %
          180) /
          180) *
          100
      ) / 100;

    const noFrictionValue = 0;
    const frictionAmount =
      Math.round(
        Math.max(
          0,
          Math.sin(
            differenceInAngle * (3.14 + 2 * noFrictionValue) - noFrictionValue
          )
        ) * 100
      ) / 100;

    const frictionForce =
      0.002 +
      controller.traction *
        controller.currentAdhesionModifier *
        frictionAmount *
        0.03 +
      controller.brakingForce;

    controller.brakingForce = 0;
    return Vector.subtractFromLength(
      controller.actualForce,
      Vector.length(controller.actualForce) * frictionForce * 60 * deltaTime
    );
  }

  engineBraking(controller: PhysicsBasedController, deltaTime: number): Vec2D {
    const engineBrakingForce = 2 * deltaTime * 60;
    const brakingAmount =
      controller.currentAdhesionModifier *
      controller.traction *
      engineBrakingForce;

    return Vector.subtractFromLength(controller.actualForce, brakingAmount);
  }
}

export default PhysicsDriver;
