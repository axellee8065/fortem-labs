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
  // Meeting room walls (center area: x 16-24, y 12-20)
  for (let x = 16; x <= 24; x++) {
    map[12][x] = 1;
    map[20][x] = 1;
  }
  for (let y = 12; y <= 20; y++) {
    map[y][16] = 1;
    map[y][24] = 1;
  }
  // Meeting room doors
  map[12][20] = 3;  // top door
  map[20][20] = 3;  // bottom door

  // Meeting table (center of meeting room)
  map[15][19] = 2;
  map[15][20] = 2;
  map[15][21] = 2;
  map[16][19] = 2;
  map[16][20] = 2;
  map[16][21] = 2;

  // Agent desks (shifted down by +4)
  const deskPositions = [
    // Research desk (left)
    { x: 5, y: 9 }, { x: 6, y: 9 },
    // Data desk (right)
    { x: 33, y: 9 }, { x: 34, y: 9 },
    // Creative desk (left)
    { x: 5, y: 13 }, { x: 6, y: 13 },
    // PR desk (right)
    { x: 33, y: 13 }, { x: 34, y: 13 },
    // Copy desk (left)
    { x: 5, y: 17 }, { x: 6, y: 17 },
    // Growth desk (right)
    { x: 33, y: 17 }, { x: 34, y: 17 },
    // SNS desk (center)
    { x: 19, y: 17 }, { x: 20, y: 17 },
    // CMO desk (left)
    { x: 5, y: 21 }, { x: 6, y: 21 },
    // QA desk (right)
    { x: 33, y: 21 }, { x: 34, y: 21 },
  ];

  for (const pos of deskPositions) {
    map[pos.y][pos.x] = 2;
  }

  // Break area furniture (bottom center)
  map[25][18] = 2; // sofa
  map[25][19] = 2;
  map[25][20] = 2;
  map[25][21] = 2;
  map[26][19] = 2; // coffee table
  map[26][20] = 2;

  // Decorative walls / partitions
  for (let y = 7; y <= 8; y++) {
    map[y][10] = 1;
  }
  for (let y = 7; y <= 8; y++) {
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
