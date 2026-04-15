import { create } from 'zustand';
import { PlayerState, CameraState, TimeOfDay, GameConfig, DEFAULT_GAME_CONFIG } from '@/types/game';

interface GameStore {
  isReady: boolean;
  config: GameConfig;
  player: PlayerState;
  camera: CameraState;
  timeOfDay: TimeOfDay;
  isPaused: boolean;

  setReady: (ready: boolean) => void;
  updatePlayer: (update: Partial<PlayerState>) => void;
  updateCamera: (update: Partial<CameraState>) => void;
  setTimeOfDay: (time: TimeOfDay) => void;
  setPaused: (paused: boolean) => void;
  setNearbyAgent: (agentId: string | null) => void;
}

export const useGameStore = create<GameStore>((set) => ({
  isReady: false,
  config: DEFAULT_GAME_CONFIG,
  player: {
    position: { x: 20, y: 20 },
    direction: 'down',
    isMoving: false,
    nearbyAgentId: null,
  },
  camera: { x: 0, y: 0, zoom: 2 },
  timeOfDay: 'day',
  isPaused: false,

  setReady: (ready) => set({ isReady: ready }),
  updatePlayer: (update) =>
    set((state) => ({ player: { ...state.player, ...update } })),
  updateCamera: (update) =>
    set((state) => ({ camera: { ...state.camera, ...update } })),
  setTimeOfDay: (time) => set({ timeOfDay: time }),
  setPaused: (paused) => set({ isPaused: paused }),
  setNearbyAgent: (agentId) =>
    set((state) => ({ player: { ...state.player, nearbyAgentId: agentId } })),
}));
