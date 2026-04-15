import * as Phaser from 'phaser';
import { OfficeScene } from './scenes/OfficeScene';

let gameInstance: Phaser.Game | null = null;
let officeScene: OfficeScene | null = null;

export function createGame(
  parent: HTMLElement,
  callbacks: {
    onAgentInteract?: (agentId: string) => void;
    onNearbyAgentChange?: (agentId: string | null) => void;
  }
): Phaser.Game {
  if (gameInstance) {
    gameInstance.destroy(true);
  }

  const scene = new OfficeScene();
  officeScene = scene;

  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent,
    backgroundColor: '#1a1a2e',
    pixelArt: true,
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { x: 0, y: 0 },
        debug: false,
      },
    },
    scene: scene,
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    render: {
      antialias: false,
      roundPixels: true,
    },
  };

  gameInstance = new Phaser.Game(config);

  // Set callbacks after scene is ready
  gameInstance.events.once('ready', () => {
    scene.setCallbacks(callbacks);
  });

  // Also try setting when scene starts
  scene.events?.once('create', () => {
    scene.setCallbacks(callbacks);
  });

  return gameInstance;
}

export function getOfficeScene(): OfficeScene | null {
  return officeScene;
}

export function destroyGame() {
  if (gameInstance) {
    gameInstance.destroy(true);
    gameInstance = null;
    officeScene = null;
  }
}
