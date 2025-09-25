import GameScene from '@/src/scenes/game-scene';
import Game from '../game';
import DisplayDriver from '../display-driver/display-driver';
import { Vec2D } from '@/types/physics';
import { Vector } from '@/src/util/vec-util';
const audioLap = new Audio('assets/sounds/lap_finish.wav');
const audioFinish = new Audio('assets/sounds/finish_line.wav');

export class Scoreboard {
  static _instance: Scoreboard | null = null;
  private currentPlayerStartTime: Date | null = null;
  private lapTimeList: (Date | null)[] = [null, null, null];
  private clearCheckpointsCounter = 0;
  playerResults: { nickname: string; time: number; bestLoopTime: number }[] =
    [];
  _currentLap: number = 0;
  currentCheckpoint: number = 1;

  static get instance(): Scoreboard {
    if (!Scoreboard._instance) {
      Scoreboard._instance = new Scoreboard();
    }

    return Scoreboard._instance;
  }

  get currentTime(): number {
    const now = new Date();
    if (!this.currentPlayerStartTime) {
      this.currentPlayerStartTime = now;
    }
    return now.getTime() - this.currentPlayerStartTime.getTime();
  }

  resetCurrentTime() {
    this.currentPlayerStartTime = new Date();
    this.lapTimeList = [null, null, null];
  }

  get currentLap(): number {
    return this._currentLap;
  }

  set currentLap(lap: number) {
    document
      .querySelector(`#lap-${this._currentLap + 1}`)
      ?.classList.remove('current');
    document.querySelector(`#lap-${lap + 1}`)?.classList.add('current');
    this._currentLap = lap;
  }

  get currentLapTime(): number {
    const now = new Date();
    let lastLapTime = this.lapTimeList[this.currentLap - 1];

    if (!lastLapTime) {
      lastLapTime = now;
      this.lapTimeList[this.currentLap - 1] = lastLapTime;
    }

    return now.getTime() - lastLapTime.getTime();
  }

  update(gameScene: GameScene) {
    const { playerController, track, opponentControllersList, UiService } =
      gameScene;
    if (!playerController || !track || !track.checkPointPath) {
      return;
    }
    const distanceToNextCheckpoint = track.checkPointPath.getDistanceToPoint(
      playerController.centerPosition,
      this.currentCheckpoint
    );
    const distanceToNextPoint = Vector.length(
      Vector.subtract(
        playerController.centerPosition,
        track.checkPointPath.sampledPoints[this.currentCheckpoint].point
      )
    );

    const dd = DisplayDriver.currentInstance!;
    for (const gate of track.gates) {
      const gatePosition = {
        x: (gate.x * dd.scaler) / 2 + gate.sprite.config.spriteWidth / 2,
        y: (gate.y * dd.scaler) / 2 + (gate.sprite.config.spriteHeight / 3) * 2,
      } as Vec2D;
      const distanceToGate = Vector.length(
        Vector.subtract(playerController.centerPosition, gatePosition)
      );

      if (
        distanceToGate < 32 &&
        (track.currentTransitionFraction || !track.areShortcutsOpened) &&
        this.clearCheckpointsCounter >= 10
      ) {
        this.currentCheckpoint += 32;
        this.clearCheckpointsCounter = 0;
      }
    }

    if (
      (distanceToNextCheckpoint < 60 &&
        this.currentCheckpoint !==
          track.checkPointPath.sampledPoints.length - 2) ||
      (distanceToNextPoint < 50 &&
        distanceToNextCheckpoint < 2 &&
        this.currentCheckpoint ===
          track.checkPointPath.sampledPoints.length - 2) ||
      isNaN(distanceToNextCheckpoint)
    ) {
      this.currentCheckpoint++;
      this.clearCheckpointsCounter++;
    }

    UiService.setCurrentTime(this.currentTime);
    UiService.setCurrentLapTime(this.currentLapTime);

    if (
      this.currentCheckpoint ===
      track.checkPointPath.sampledPoints.length - 1
    ) {
      if (
        (this.currentLapTime > 0 &&
          this.currentLapTime < playerController.bestLoopTime) ||
        playerController.bestLoopTime === 0
      ) {
        playerController.bestLoopTime = this.currentLapTime;
      }
      this.currentLap++;
      this.currentCheckpoint = 1;
      if (this.currentLap !== UiService.lapCount) audioLap.play();
    }

    if (this.currentLap === UiService.lapCount) {
      if (playerController.finished) {
        audioFinish.play();
        return;
      }
      const nickname = Game.instance.nickname;

      Scoreboard.instance.playerResults.push({
        nickname: nickname,
        time: this.currentTime,
        bestLoopTime: playerController.bestLoopTime,
      });
      playerController.finished = true;
      playerController.finishedTime = this.currentTime;
      UiService.showSkipButton();

      // Show swap modal for perfect runs (0 collisions) or if player hit 3+ banana peels
      console.log(
        'Race finished! Banana peel collisions:',
        playerController.bananaPeelCollisions
      );
      console.log(
        'Has avoided banana peels:',
        playerController.hasAvoidedBananaPeels
      );

      // Store race data for modal
      const raceData = {
        bananaPeelCollisions: playerController.bananaPeelCollisions,
        raceTime: this.currentTime,
        hasAvoidedBananaPeels: playerController.bananaPeelCollisions === 0,
      };

      // Show swap modal for perfect runs (0 collisions) OR if player hit 3+ banana peels
      if (playerController.bananaPeelCollisions === 0) {
        console.log('Perfect run! Opening swap modal in 1 second...');

        // Add a small delay to ensure the race finish UI is visible first
        setTimeout(() => {
          console.log('Loading swap modal module...');
          // Dynamically import and show the swap modal to avoid circular dependencies
          import('../../components/SwapIntegration')
            .then(({ showSwapModal }) => {
              console.log(
                'SwapIntegration loaded successfully, showing modal...'
              );
              showSwapModal(raceData);
            })
            .catch(error => {
              console.error('Failed to load swap modal:', error);
            });
        }, 1000);
      } else if (playerController.bananaPeelCollisions >= 3) {
        console.log(
          `Hit ${playerController.bananaPeelCollisions} banana peels - showing swap modal for collisions!`
        );

        // Add a small delay to ensure the race finish UI is visible first
        setTimeout(() => {
          console.log('Loading swap modal module for collision case...');
          // Dynamically import and show the swap modal to avoid circular dependencies
          import('../../components/SwapIntegration')
            .then(({ showSwapModal }) => {
              console.log(
                'SwapIntegration loaded successfully, showing modal for collisions...'
              );
              showSwapModal(raceData);
            })
            .catch(error => {
              console.error('Failed to load swap modal:', error);
            });
        }, 1000);
      } else {
        console.log(
          `Hit ${playerController.bananaPeelCollisions} banana peels - swap modal not shown (need 0 or 3+)`
        );
      }

      if (
        playerController.finished &&
        opponentControllersList.every(opponent => opponent.finished)
      ) {
        Game.instance.startResultScene();
      }
    }
  }
}
