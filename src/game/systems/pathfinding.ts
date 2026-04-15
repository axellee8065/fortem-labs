export interface GridPosition {
  x: number;
  y: number;
}

const DIRECTIONS_8: [number, number][] = [
  [0, -1],  // up
  [0, 1],   // down
  [-1, 0],  // left
  [1, 0],   // right
  [-1, -1], // up-left
  [1, -1],  // up-right
  [-1, 1],  // down-left
  [1, 1],   // down-right
];

export function findPath(
  start: GridPosition,
  goal: GridPosition,
  isWalkable: (x: number, y: number) => boolean
): GridPosition[] | null {
  const queue: { pos: GridPosition; path: GridPosition[] }[] = [
    { pos: start, path: [start] },
  ];
  const visited = new Set<string>([`${start.x},${start.y}`]);

  while (queue.length > 0) {
    const current = queue.shift()!;

    if (current.pos.x === goal.x && current.pos.y === goal.y) {
      return current.path;
    }

    for (const [dx, dy] of DIRECTIONS_8) {
      const nx = current.pos.x + dx;
      const ny = current.pos.y + dy;
      const key = `${nx},${ny}`;

      if (!visited.has(key) && isWalkable(nx, ny)) {
        visited.add(key);
        queue.push({
          pos: { x: nx, y: ny },
          path: [...current.path, { x: nx, y: ny }],
        });
      }
    }
  }

  return null;
}

export function getDirection(
  from: GridPosition,
  to: GridPosition
): 'up' | 'down' | 'left' | 'right' {
  const dx = to.x - from.x;
  const dy = to.y - from.y;

  if (Math.abs(dx) > Math.abs(dy)) {
    return dx > 0 ? 'right' : 'left';
  }
  return dy > 0 ? 'down' : 'up';
}
