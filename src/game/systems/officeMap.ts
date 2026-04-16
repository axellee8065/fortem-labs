// Office map data - 40x30 grid
// 0 = floor (walkable), 1 = wall, 2 = furniture/desk, 3 = door

const MAP_WIDTH = 40;
const MAP_HEIGHT = 35;

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

  // Meeting room walls (x 16-24, y 16-24)
  for (let x = 16; x <= 24; x++) { map[16][x] = 1; map[24][x] = 1; }
  for (let y = 16; y <= 24; y++) { map[y][16] = 1; map[y][24] = 1; }
  map[16][20] = 3; map[24][20] = 3; // doors

  // Meeting table
  map[19][19] = 2; map[19][20] = 2; map[19][21] = 2;
  map[20][19] = 2; map[20][20] = 2; map[20][21] = 2;

  // Agent desks (left x:6-7, right x:32-33)
  const deskPositions = [
    { x: 6, y: 13 }, { x: 7, y: 13 },   // Research
    { x: 32, y: 13 }, { x: 33, y: 13 },  // Data
    { x: 6, y: 17 }, { x: 7, y: 17 },   // Creative
    { x: 32, y: 17 }, { x: 33, y: 17 },  // PR
    { x: 6, y: 21 }, { x: 7, y: 21 },   // Copy
    { x: 32, y: 21 }, { x: 33, y: 21 },  // Growth
    { x: 18, y: 21 }, { x: 19, y: 21 },  // SNS
    { x: 6, y: 25 }, { x: 7, y: 25 },   // CMO
    { x: 32, y: 25 }, { x: 33, y: 25 },  // QA
  ];
  for (const pos of deskPositions) map[pos.y][pos.x] = 2;

  // Break area (bottom center)
  map[29][18] = 2; map[29][19] = 2; map[29][20] = 2; map[29][21] = 2;
  map[30][19] = 2; map[30][20] = 2;

  // Partitions
  for (let y = 11; y <= 12; y++) { map[y][11] = 1; map[y][29] = 1; }

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
