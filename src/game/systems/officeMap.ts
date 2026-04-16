// Office map data - 40x30 grid
// 0 = floor (walkable), 1 = wall, 2 = furniture/desk, 3 = door

const MAP_WIDTH = 40;
const MAP_HEIGHT = 30;

function createDefaultMap(): number[][] {
  const map: number[][] = [];

  for (let y = 0; y < MAP_HEIGHT; y++) {
    map[y] = [];
    for (let x = 0; x < MAP_WIDTH; x++) {
      if (x === 0 || x === MAP_WIDTH - 1 || y === 0 || y === MAP_HEIGHT - 1) {
        map[y][x] = 1;
      } else {
        map[y][x] = 0;
      }
    }
  }

  // Meeting room walls (x 15-23, y 14-22) - centered
  for (let x = 15; x <= 23; x++) { map[14][x] = 1; map[22][x] = 1; }
  for (let y = 14; y <= 22; y++) { map[y][15] = 1; map[y][23] = 1; }
  map[14][19] = 3; map[22][19] = 3; // doors

  // Meeting table
  map[17][18] = 2; map[17][19] = 2; map[17][20] = 2;
  map[18][18] = 2; map[18][19] = 2; map[18][20] = 2;

  // Agent desks (left x:6-7, right x:32-33)
  const deskPositions = [
    { x: 6, y: 11 }, { x: 7, y: 11 },   // Research
    { x: 32, y: 11 }, { x: 33, y: 11 },  // Data
    { x: 6, y: 15 }, { x: 7, y: 15 },   // Creative
    { x: 32, y: 15 }, { x: 33, y: 15 },  // PR
    { x: 6, y: 19 }, { x: 7, y: 19 },   // Copy
    { x: 32, y: 19 }, { x: 33, y: 19 },  // Growth
    { x: 18, y: 19 }, { x: 19, y: 19 },  // SNS
    { x: 6, y: 23 }, { x: 7, y: 23 },   // CMO
    { x: 32, y: 23 }, { x: 33, y: 23 },  // QA
  ];
  for (const pos of deskPositions) map[pos.y][pos.x] = 2;

  // Break area (bottom center)
  map[27][18] = 2; map[27][19] = 2; map[27][20] = 2; map[27][21] = 2;
  map[28][19] = 2; map[28][20] = 2;

  // Partitions
  for (let y = 9; y <= 10; y++) { map[y][11] = 1; map[y][29] = 1; }

  return map;
}

// Mutable map that can be replaced at runtime
let currentMap: number[][] = createDefaultMap();

// Load saved map from localStorage (called from game scene)
export function loadSavedMap(): {
  tiles: number[][] | null;
  agents: { role: string; x: number; y: number }[] | null;
  player: { x: number; y: number } | null;
} {
  if (typeof window === 'undefined') return { tiles: null, agents: null, player: null };
  try {
    const saved = localStorage.getItem('fortem-map-data');
    if (saved) {
      const data = JSON.parse(saved);
      if (data.tiles) {
        currentMap = data.tiles;
      }
      return {
        tiles: data.tiles || null,
        agents: data.agents || null,
        player: data.player || null,
      };
    }
  } catch {}
  return { tiles: null, agents: null, player: null };
}

export function getMap(): number[][] {
  return currentMap;
}

export const OFFICE_MAP = currentMap;

export function isWalkableTile(x: number, y: number): boolean {
  if (x < 0 || x >= MAP_WIDTH || y < 0 || y >= MAP_HEIGHT) return false;
  const map = currentMap;
  return map[y][x] === 0 || map[y][x] === 3;
}

export function getTileType(x: number, y: number): number {
  if (x < 0 || x >= MAP_WIDTH || y < 0 || y >= MAP_HEIGHT) return 1;
  return currentMap[y][x];
}

export { MAP_WIDTH, MAP_HEIGHT };
