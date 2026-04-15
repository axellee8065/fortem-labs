export interface Position {
  x: number;
  y: number;
}

export interface PlayerState {
  position: Position;
  direction: 'up' | 'down' | 'left' | 'right';
  isMoving: boolean;
  nearbyAgentId: string | null;
}

export interface CameraState {
  x: number;
  y: number;
  zoom: number;
}

export type TimeOfDay = 'morning' | 'day' | 'evening' | 'night';

export interface GameConfig {
  tileSize: number;
  mapWidth: number;
  mapHeight: number;
  playerSpeed: number;
  agentSpeed: number;
  interactionRadius: number;
}

export const DEFAULT_GAME_CONFIG: GameConfig = {
  tileSize: 32,
  mapWidth: 40,
  mapHeight: 30,
  playerSpeed: 160,
  agentSpeed: 100,
  interactionRadius: 48,
};

export const MEETING_ROOM_CENTER: Position = { x: 20, y: 12 };

export const MEETING_POSITIONS: Position[] = [
  { x: 18, y: 11 },
  { x: 22, y: 11 },
  { x: 18, y: 13 },
  { x: 22, y: 13 },
  { x: 20, y: 10 },
  { x: 20, y: 14 },
  { x: 17, y: 12 },
  { x: 23, y: 12 },
];
