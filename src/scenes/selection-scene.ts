import Scene from './_scene';
import Game from '@/src/services/game';
import assert from '../util/assert';

export class SelectionScene extends Scene {
  private sceneRef: HTMLElement | null = null;
  private selectedMap: string = 'snow';
  private selectedCar: string = 'opel';
  private selectedColor: string = 'blue';

  override init(): void | Promise<void> {
    this.sceneRef = document.querySelector('#selection-scene');
    assert(this.sceneRef, 'Selection scene not initialized');
    this.sceneRef.style.display = 'block';

    const colorSelection =
      document.querySelector<HTMLElement>('.color-selection')!;
    const colorBoxes = document.querySelectorAll<HTMLElement>(
      '.color-selection .color-box'
    )!;

    //* Handle color selection
    const carImage = this.sceneRef.querySelector<HTMLElement>('.car-preview')!;
    colorBoxes.forEach(box => {
      this.addRemovableListener(box, 'click', () => {
        colorSelection.classList.toggle('active');
        if (!box.classList.contains('selected')) {
          this.selectedColor = box.dataset.color || 'pink';
          colorBoxes.forEach(b => b.classList.remove('selected'));
          box.classList.add('selected');
          carImage.setAttribute(
            'style',
            `--image-url: url(/assets/sprites/${this.selectedCar}_${this.selectedColor}.png);`
          );
        }
      });
    });

    this.addMapSelectionHandling();
    this.addCarSelectionHandling();

    const playBtnRef = this.sceneRef.querySelector('button#play-btn');
    this.addRemovableListener(playBtnRef, 'click', () => {
      if (!Game.getInstance()) return;
      Game.getInstance().startGameScene(
        this.selectedCar,
        this.selectedColor,
        this.selectedMap
      );
    });

    const backBtnRef = this.sceneRef.querySelector('button#back-btn');
    this.addRemovableListener(backBtnRef, 'click', () => {
      if (!Game.getInstance()) return;
      Game.getInstance().startStartScene();
    });

    const tutorialBtnRef = this.sceneRef.querySelector('button#tutorial-btn');
    this.addRemovableListener(tutorialBtnRef, 'click', () => {
      if (!Game.getInstance()) return;
      Game.getInstance().startTutorialGameScene(
        this.selectedCar,
        this.selectedColor
      );
    });

    this.addDialogEvents();
  }

  addDialogEvents() {
    if (!this.sceneRef) return;
    const tutorialDialog = this.sceneRef.querySelector('.dialog.tutorial');
    if (tutorialDialog) {
      const acceptTutorialBtnRef =
        tutorialDialog.querySelector('button.mainBtn');
      const declineTutorialBtnRed = tutorialDialog.querySelector(
        'button:not(.mainBtn)'
      );
      if (acceptTutorialBtnRef) {
        this.addRemovableListener(acceptTutorialBtnRef, 'click', () => {
          Game.getInstance()?.startTutorialGameScene(
            this.selectedCar,
            this.selectedColor
          );
          this.hideTutorialDialog();
        });
      }
      if (declineTutorialBtnRed) {
        this.addRemovableListener(declineTutorialBtnRed, 'click', () => {
          localStorage.setItem('tutorial', 'true');
          Game.getInstance().startGameScene(
            this.selectedCar,
            this.selectedColor,
            this.selectedMap
          );
          this.hideTutorialDialog();
        });
      }
    }
  }
  showTutorialDialog() {
    const tutorialDialog = this.sceneRef?.querySelector('.dialog.tutorial');
    if (!tutorialDialog) return;
    tutorialDialog.setAttribute('style', 'display: grid;');
  }

  hideTutorialDialog() {
    const tutorialDialog = this.sceneRef?.querySelector('.dialog.tutorial');
    if (!tutorialDialog) return;
    tutorialDialog.setAttribute('style', 'display: none;');
  }

  override update(_deltaTime: number): void {}

  override render(_ctx: CanvasRenderingContext2D): void {}

  override onMount() {
    this.sceneRef = document.querySelector('#selection-scene');
    assert(this.sceneRef, 'Selection scene not initialized');
    const selectedCarRef = this.sceneRef.querySelector<HTMLElement>(
      '.car-selection .selection__option.selected'
    )!;
    const selectedMapRef = this.sceneRef.querySelector<HTMLElement>(
      '.track-selection .selection__option.selected'
    )!;
    const selectedColorRef = this.sceneRef.querySelector<HTMLElement>(
      '.color-selection .color-box.selected'
    )!;
    this.selectedCar = selectedCarRef.getAttribute('data-car') || 'opel';
    this.selectedMap = selectedMapRef.getAttribute('data-map') || 'gravel';
    this.selectedColor = selectedColorRef.getAttribute('data-color') || 'blue';
    this.sceneRef.style.display = 'block';
  }

  override onDisMount() {
    super.onDisMount();
    assert(this.sceneRef, 'Selection scene not initialized');
    this.sceneRef.style.display = 'none';
  }

  addMapSelectionHandling() {
    if (!this.sceneRef) return;
    //* Handle map selection
    const mapPreview = this.sceneRef.querySelector<HTMLElement>(
      '.track-selection img'
    )!;
    const nextBtn = this.sceneRef.querySelector<HTMLElement>(
      '.track-selection .selection__button.next'
    )!;
    const prevBtn = this.sceneRef.querySelector<HTMLElement>(
      '.track-selection .selection__button.prev'
    )!;
    const mapOptions = this.sceneRef.querySelectorAll<HTMLElement>(
      '.track-selection .selection__option'
    )!;

    const updateSelection = (newElement: HTMLElement | null) => {
      if (!newElement) return;

      const currentlySelected = document.querySelector(
        `.selection__option[data-map="${this.selectedMap}"]`
      );
      if (currentlySelected) currentlySelected.classList.remove('selected');

      newElement.classList.add('selected');
      this.selectedMap = newElement.getAttribute('data-map') || 'grass';
      mapPreview.setAttribute(
        'src',
        `/assets/ui/track-previews/${this.selectedMap}-track-preview.png`
      );

      const id = parseInt(newElement.getAttribute('data-id') || '1') - 1;
      mapOptions.forEach(option => {
        option.style.transform = `translateX(-${id * 100}%`;
      });
    };

    this.addRemovableListener(nextBtn, 'click', () => {
      const currentlySelected = document.querySelector(
        `.selection__option[data-map="${this.selectedMap}"]`
      );
      updateSelection(currentlySelected?.nextElementSibling as HTMLElement);
    });

    this.addRemovableListener(prevBtn, 'click', () => {
      const currentlySelected = document.querySelector(
        `.selection__option[data-map="${this.selectedMap}"]`
      );
      updateSelection(currentlySelected?.previousElementSibling as HTMLElement);
    });
  }

  addCarSelectionHandling() {
    if (!this.sceneRef) return;
    //* Handle map selection
    const carPreview = this.sceneRef.querySelector<HTMLElement>(
      '.car-selection .car-preview'
    )!;
    const nextBtn = this.sceneRef.querySelector<HTMLElement>(
      '.car-selection .selection__button.next'
    )!;
    const prevBtn = this.sceneRef.querySelector<HTMLElement>(
      '.car-selection .selection__button.prev'
    )!;
    const carOptions = this.sceneRef.querySelectorAll<HTMLElement>(
      '.car-selection .selection__option'
    )!;

    const updateSelection = (newElement: HTMLElement | null) => {
      if (!newElement) return;
      const currentlySelected = document.querySelector(
        `.selection__option[data-car="${this.selectedCar}"]`
      );
      if (currentlySelected) currentlySelected.classList.remove('selected');

      newElement.classList.add('selected');
      this.selectedCar = newElement.getAttribute('data-car') || 'opel';
      carPreview.setAttribute(
        'style',
        `--image-url: url(/assets/sprites/${this.selectedCar}_${this.selectedColor}.png);`
      );

      const id = parseInt(newElement.getAttribute('data-id') || '1') - 1;
      carOptions.forEach(option => {
        option.style.transform = `translateX(-${id * 100}%`;
      });
    };

    this.addRemovableListener(nextBtn, 'click', () => {
      const currentlySelected = document.querySelector(
        `.selection__option[data-car="${this.selectedCar}"]`
      );
      updateSelection(currentlySelected?.nextElementSibling as HTMLElement);
    });

    this.addRemovableListener(prevBtn, 'click', () => {
      const currentlySelected = document.querySelector(
        `.selection__option[data-car="${this.selectedCar}"]`
      );
      updateSelection(currentlySelected?.previousElementSibling as HTMLElement);
    });
  }
}
