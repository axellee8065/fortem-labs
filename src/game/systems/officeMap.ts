// Office map data - 40x30 grid
// 0 = floor (walkable), 1 = wall, 2 = furniture/desk, 3 = door

const MAP_WIDTH = 40;
const MAP_HEIGHT = 30;

function createOfficeMap(): number[][] {
  const map: number[][] = [];

  for (let y = 0; y < MAP_HEIGHT; y++) {
    map[y] = [];
    for (let x = 0; x < MAP_WIDTH; x++) {
      // Walls - border
      if (x === 0 || x === MAP_WIDTH - 1 || y === 0 || y === MAP_HEIGHT - 1) {
        map[y][x] = 1;
      } else {
        map[y][x] = 0; // floor
      }
    }
  }

  // Inner walls for rooms
  // Meeting room walls (center area: x 16-24, y 8-16)
  for (let x = 16; x <= 24; x++) {
    map[8][x] = 1;
    map[16][x] = 1;
  }
  for (let y = 8; y <= 16; y++) {
    map[y][16] = 1;
    map[y][24] = 1;
  }
  // Meeting room doors
  map[8][20] = 3;  // top door
  map[16][20] = 3; // bottom door

  // Meeting table (center of meeting room)
  map[11][19] = 2;
  map[11][20] = 2;
  map[11][21] = 2;
  map[12][19] = 2;
  map[12][20] = 2;
  map[12][21] = 2;

  // Agent desks
  const deskPositions = [
    // Research desk (top-left)
    { x: 5, y: 5 }, { x: 6, y: 5 },
    // Data desk (top-right)
    { x: 33, y: 5 }, { x: 34, y: 5 },
    // Creative desk (mid-left)
    { x: 5, y: 9 }, { x: 6, y: 9 },
    // PR desk (mid-right)
    { x: 33, y: 9 }, { x: 34, y: 9 },
    // Copy desk (lower-left)
    { x: 5, y: 13 }, { x: 6, y: 13 },
    // Growth desk (lower-right)
    { x: 33, y: 13 }, { x: 34, y: 13 },
    // SNS desk (bottom mid-left)
    { x: 5, y: 17 }, { x: 6, y: 17 },
    // CMO desk (bottom-left)
    { x: 5, y: 21 }, { x: 6, y: 21 },
    // QA desk (bottom-right)
    { x: 33, y: 17 }, { x: 34, y: 17 },
  ];

  for (const pos of deskPositions) {
    map[pos.y][pos.x] = 2;
  }

  // Break area furniture (bottom center)
  map[22][18] = 2; // sofa
  map[22][19] = 2;
  map[22][20] = 2;
  map[22][21] = 2;
  map[23][19] = 2; // coffee table
  map[23][20] = 2;

  // Decorative walls / partitions
  // Left column
  for (let y = 3; y <= 4; y++) {
    map[y][10] = 1;
  }
  for (let y = 3; y <= 4; y++) {
    map[y][30] = 1;
  }

  return map;
}

export const OFFICE_MAP = createOfficeMap();

export function isWalkableTile(x: number, y: number): boolean {
  if (x < 0 || x >= MAP_WIDTH || y < 0 || y >= MAP_HEIGHT) return false;
  return OFFICE_MAP[y][x] === 0 || OFFICE_MAP[y][x] === 3;
}

export function getTileType(x: number, y: number): number {
  if (x < 0 || x >= MAP_WIDTH || y < 0 || y >= MAP_HEIGHT) return 1;
  return OFFICE_MAP[y][x];
}

export { MAP_WIDTH, MAP_HEIGHT };
