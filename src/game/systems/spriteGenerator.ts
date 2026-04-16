import * as Phaser from 'phaser';

// Pixel art color palette
const SKIN = '#FFCC88';
const SKIN_SHADOW = '#E8B070';
const PANTS = '#2C2C3A';
const SHOES = '#1A1A2E';
const EYE = '#222233';
const MOUTH = '#CC8866';

// Hair styles: [color, style pattern rows]
interface CharacterDef {
  hairColor: string;
  shirtColor: string;
  shirtShadow: string;
  hairStyle: number; // 0=short, 1=medium, 2=long, 3=spiky, 4=bun
}

const CHARACTER_DEFS: Record<string, CharacterDef> = {
  ceo:              { hairColor: '#1A1A2E', shirtColor: '#2C3E50', shirtShadow: '#1A2530', hairStyle: 0 },
  cmo:              { hairColor: '#8B4513', shirtColor: '#D4537E', shirtShadow: '#A03060', hairStyle: 2 },
  creative_director:{ hairColor: '#CC3333', shirtColor: '#E74C3C', shirtShadow: '#C0392B', hairStyle: 3 },
  copywriter:       { hairColor: '#554433', shirtColor: '#3498DB', shirtShadow: '#2070B0', hairStyle: 1 },
  social_media_manager:{ hairColor: '#9944CC', shirtColor: '#9B59B6', shirtShadow: '#7D3C98', hairStyle: 4 },
  data_analyst:     { hairColor: '#222244', shirtColor: '#1ABC9C', shirtShadow: '#16967A', hairStyle: 0 },
  research:         { hairColor: '#DD8833', shirtColor: '#F39C12', shirtShadow: '#D4850A', hairStyle: 1 },
  pr_specialist:    { hairColor: '#332222', shirtColor: '#E91E63', shirtShadow: '#C0194F', hairStyle: 2 },
  growth_hacker:    { hairColor: '#445566', shirtColor: '#00BCD4', shirtShadow: '#0097A7', hairStyle: 3 },
  qa_reviewer:      { hairColor: '#335522', shirtColor: '#27AE60', shirtShadow: '#1E8449', hairStyle: 0 },
  player:           { hairColor: '#332211', shirtColor: '#4488FF', shirtShadow: '#2266DD', hairStyle: 1 },
};

function hexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

// Draw a single pixel on canvas context
function px(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, 1, 1);
}

// Generate character sprite (16x20 pixels)
function drawCharacter(ctx: CanvasRenderingContext2D, def: CharacterDef, frame: number = 0) {
  const h = def.hairColor;
  const s = def.shirtColor;
  const ss = def.shirtShadow;
  const f = SKIN;
  const fs = SKIN_SHADOW;
  const e = EYE;
  const m = MOUTH;
  const p = PANTS;
  const sh = SHOES;

  // Clear
  ctx.clearRect(0, 0, 16, 20);

  // === HAIR (rows 0-4) ===
  switch (def.hairStyle) {
    case 0: // short/neat
      for (let x = 5; x <= 10; x++) px(ctx, x, 0, h);
      for (let x = 4; x <= 11; x++) px(ctx, x, 1, h);
      for (let x = 4; x <= 11; x++) px(ctx, x, 2, h);
      px(ctx, 4, 3, h); px(ctx, 11, 3, h);
      break;
    case 1: // medium
      for (let x = 5; x <= 10; x++) px(ctx, x, 0, h);
      for (let x = 4; x <= 11; x++) px(ctx, x, 1, h);
      for (let x = 3; x <= 12; x++) px(ctx, x, 2, h);
      px(ctx, 3, 3, h); px(ctx, 4, 3, h); px(ctx, 11, 3, h); px(ctx, 12, 3, h);
      px(ctx, 3, 4, h); px(ctx, 12, 4, h);
      break;
    case 2: // long
      for (let x = 5; x <= 10; x++) px(ctx, x, 0, h);
      for (let x = 4; x <= 11; x++) px(ctx, x, 1, h);
      for (let x = 3; x <= 12; x++) px(ctx, x, 2, h);
      px(ctx, 3, 3, h); px(ctx, 4, 3, h); px(ctx, 11, 3, h); px(ctx, 12, 3, h);
      px(ctx, 3, 4, h); px(ctx, 3, 5, h); px(ctx, 12, 4, h); px(ctx, 12, 5, h);
      px(ctx, 3, 6, h); px(ctx, 12, 6, h);
      break;
    case 3: // spiky
      px(ctx, 5, 0, h); px(ctx, 7, 0, h); px(ctx, 9, 0, h); px(ctx, 11, 0, h);
      for (let x = 4; x <= 11; x++) px(ctx, x, 1, h);
      for (let x = 4; x <= 11; x++) px(ctx, x, 2, h);
      px(ctx, 4, 3, h); px(ctx, 11, 3, h);
      break;
    case 4: // bun
      for (let x = 6; x <= 9; x++) px(ctx, x, 0, h);
      for (let x = 5; x <= 10; x++) px(ctx, x, 1, h);
      for (let x = 4; x <= 11; x++) px(ctx, x, 2, h);
      for (let x = 4; x <= 11; x++) px(ctx, x, 3, h);
      px(ctx, 4, 4, h); px(ctx, 11, 4, h);
      // bun on top
      for (let x = 6; x <= 9; x++) { px(ctx, x, 0, h); }
      px(ctx, 7, -1 < 0 ? 0 : 0, h); px(ctx, 8, 0, h);
      break;
  }

  // === FACE (rows 3-7) ===
  for (let x = 5; x <= 10; x++) px(ctx, x, 3, f);
  for (let x = 4; x <= 11; x++) px(ctx, x, 4, f);
  // Eyes
  px(ctx, 6, 4, e); px(ctx, 9, 4, e);
  // Eye whites
  px(ctx, 6, 4, '#FFFFFF'); px(ctx, 9, 4, '#FFFFFF');
  px(ctx, 6 + (frame % 2 === 0 ? 0 : 1), 4, e);
  px(ctx, 9 + (frame % 2 === 0 ? 0 : -1), 4, e);
  // Face continued
  for (let x = 4; x <= 11; x++) px(ctx, x, 5, f);
  px(ctx, 7, 5, fs); px(ctx, 8, 5, fs); // nose shadow
  for (let x = 5; x <= 10; x++) px(ctx, x, 6, f);
  px(ctx, 7, 6, m); px(ctx, 8, 6, m); // mouth
  for (let x = 6; x <= 9; x++) px(ctx, x, 7, f); // chin

  // === BODY/SHIRT (rows 8-13) ===
  // Neck
  px(ctx, 7, 8, f); px(ctx, 8, 8, f);
  // Shoulders
  for (let x = 3; x <= 12; x++) px(ctx, x, 9, s);
  for (let x = 3; x <= 12; x++) px(ctx, x, 10, s);
  // Collar detail
  px(ctx, 7, 9, '#FFFFFF'); px(ctx, 8, 9, '#FFFFFF');
  // Body
  for (let x = 4; x <= 11; x++) px(ctx, x, 11, s);
  for (let x = 4; x <= 11; x++) px(ctx, x, 12, ss);
  for (let x = 5; x <= 10; x++) px(ctx, x, 13, ss);
  // Arms
  px(ctx, 3, 10, s); px(ctx, 3, 11, f); px(ctx, 3, 12, f);
  px(ctx, 12, 10, s); px(ctx, 12, 11, f); px(ctx, 12, 12, f);

  // === LEGS (rows 14-17) ===
  for (let x = 5; x <= 7; x++) px(ctx, x, 14, p);
  for (let x = 8; x <= 10; x++) px(ctx, x, 14, p);
  for (let x = 5; x <= 7; x++) px(ctx, x, 15, p);
  for (let x = 8; x <= 10; x++) px(ctx, x, 15, p);
  for (let x = 5; x <= 7; x++) px(ctx, x, 16, p);
  for (let x = 8; x <= 10; x++) px(ctx, x, 16, p);
  // Shoes
  for (let x = 4; x <= 7; x++) px(ctx, x, 17, sh);
  for (let x = 8; x <= 11; x++) px(ctx, x, 17, sh);
}

// Generate desk with monitor (32x32 pixels)
function drawDesk(ctx: CanvasRenderingContext2D) {
  ctx.clearRect(0, 0, 32, 32);

  // Desk surface (wood)
  const wood = '#8B6914';
  const woodLight = '#A07828';
  const woodDark = '#6B4F0E';

  // Desk top surface
  for (let x = 2; x <= 29; x++) {
    for (let y = 12; y <= 15; y++) {
      px(ctx, x, y, woodLight);
    }
  }
  // Desk front
  for (let x = 2; x <= 29; x++) {
    for (let y = 16; y <= 24; y++) {
      px(ctx, x, y, wood);
    }
  }
  // Desk edge
  for (let x = 2; x <= 29; x++) px(ctx, x, 25, woodDark);

  // Desk legs
  for (let y = 25; y <= 30; y++) {
    px(ctx, 3, y, woodDark); px(ctx, 4, y, woodDark);
    px(ctx, 27, y, woodDark); px(ctx, 28, y, woodDark);
  }

  // Monitor
  const monFrame = '#333344';
  const monScreen = '#1A3A5C';
  const monGlow = '#2A5A8C';

  // Monitor frame
  for (let x = 10; x <= 22; x++) {
    for (let y = 2; y <= 11; y++) {
      px(ctx, x, y, monFrame);
    }
  }
  // Screen
  for (let x = 11; x <= 21; x++) {
    for (let y = 3; y <= 10; y++) {
      px(ctx, x, y, monScreen);
    }
  }
  // Screen content (code lines)
  for (let x = 12; x <= 18; x++) px(ctx, x, 4, monGlow);
  for (let x = 12; x <= 16; x++) px(ctx, x, 6, '#3A7ABC');
  for (let x = 12; x <= 20; x++) px(ctx, x, 8, monGlow);

  // Monitor stand
  px(ctx, 15, 12, monFrame); px(ctx, 16, 12, monFrame);
  for (let x = 13; x <= 18; x++) px(ctx, x, 13, monFrame);

  // Keyboard on desk
  for (let x = 11; x <= 20; x++) px(ctx, x, 14, '#555566');
  for (let x = 12; x <= 19; x++) px(ctx, x, 15, '#444455');

  // Coffee mug
  px(ctx, 25, 13, '#FFFFFF'); px(ctx, 26, 13, '#FFFFFF');
  px(ctx, 25, 14, '#DD4444'); px(ctx, 26, 14, '#DD4444');
  px(ctx, 27, 14, '#BB8866'); // handle
}

// Generate chair (16x16 pixels)
function drawChair(ctx: CanvasRenderingContext2D) {
  ctx.clearRect(0, 0, 16, 16);
  const chairColor = '#333340';
  const chairLight = '#444455';

  // Backrest
  for (let x = 3; x <= 12; x++) {
    for (let y = 0; y <= 5; y++) {
      px(ctx, x, y, chairColor);
    }
  }
  for (let x = 4; x <= 11; x++) px(ctx, x, 1, chairLight);

  // Seat
  for (let x = 2; x <= 13; x++) {
    for (let y = 6; y <= 9; y++) {
      px(ctx, x, y, chairColor);
    }
  }

  // Pole
  px(ctx, 7, 10, '#666677'); px(ctx, 8, 10, '#666677');
  px(ctx, 7, 11, '#666677'); px(ctx, 8, 11, '#666677');

  // Wheels
  for (let x = 4; x <= 11; x++) px(ctx, x, 12, '#555566');
  px(ctx, 4, 13, '#444455'); px(ctx, 7, 13, '#444455');
  px(ctx, 8, 13, '#444455'); px(ctx, 11, 13, '#444455');
}

// Floor tile (32x32)
function drawFloorTile(ctx: CanvasRenderingContext2D, variant: number) {
  ctx.clearRect(0, 0, 32, 32);

  if (variant === 0) {
    // Dark tile
    for (let x = 0; x < 32; x++) {
      for (let y = 0; y < 32; y++) {
        px(ctx, x, y, '#3D3428');
      }
    }
    // Subtle grid lines
    for (let x = 0; x < 32; x++) { px(ctx, x, 0, '#352E22'); px(ctx, x, 31, '#352E22'); }
    for (let y = 0; y < 32; y++) { px(ctx, 0, y, '#352E22'); px(ctx, 31, y, '#352E22'); }
    // Some noise for texture
    px(ctx, 8, 8, '#443D30'); px(ctx, 20, 14, '#443D30');
    px(ctx, 15, 22, '#443D30'); px(ctx, 26, 6, '#443D30');
  } else {
    // Light tile
    for (let x = 0; x < 32; x++) {
      for (let y = 0; y < 32; y++) {
        px(ctx, x, y, '#4A3F30');
      }
    }
    for (let x = 0; x < 32; x++) { px(ctx, x, 0, '#423825'); px(ctx, x, 31, '#423825'); }
    for (let y = 0; y < 32; y++) { px(ctx, 0, y, '#423825'); px(ctx, 31, y, '#423825'); }
    px(ctx, 12, 10, '#524838'); px(ctx, 24, 20, '#524838');
    px(ctx, 6, 26, '#524838'); px(ctx, 28, 4, '#524838');
  }
}

// Wall tile (32x32)
function drawWallTile(ctx: CanvasRenderingContext2D) {
  ctx.clearRect(0, 0, 32, 32);

  // Main wall
  for (let x = 0; x < 32; x++) {
    for (let y = 0; y < 32; y++) {
      px(ctx, x, y, '#5C6B7A');
    }
  }
  // Top highlight
  for (let x = 0; x < 32; x++) {
    px(ctx, x, 0, '#6E7D8C');
    px(ctx, x, 1, '#6E7D8C');
  }
  // Bottom shadow
  for (let x = 0; x < 32; x++) {
    px(ctx, x, 30, '#4A5568');
    px(ctx, x, 31, '#3D4756');
  }
  // Brick pattern
  for (let x = 0; x < 32; x += 8) {
    for (let y = 4; y < 28; y += 6) {
      px(ctx, x, y, '#4A5568');
    }
  }
  for (let x = 4; x < 32; x += 8) {
    for (let y = 7; y < 28; y += 6) {
      px(ctx, x, y, '#4A5568');
    }
  }
}

// Door tile (32x32)
function drawDoorTile(ctx: CanvasRenderingContext2D) {
  ctx.clearRect(0, 0, 32, 32);

  // Door frame
  for (let x = 0; x < 32; x++) {
    for (let y = 0; y < 32; y++) {
      px(ctx, x, y, '#5C4320');
    }
  }
  // Door panel
  for (let x = 4; x <= 27; x++) {
    for (let y = 2; y <= 29; y++) {
      px(ctx, x, y, '#8B6914');
    }
  }
  // Door details
  for (let x = 6; x <= 25; x++) {
    for (let y = 4; y <= 13; y++) {
      px(ctx, x, y, '#9B7924');
    }
  }
  for (let x = 6; x <= 25; x++) {
    for (let y = 17; y <= 27; y++) {
      px(ctx, x, y, '#9B7924');
    }
  }
  // Door handle
  px(ctx, 22, 15, '#FFD700');
  px(ctx, 23, 15, '#FFD700');
  px(ctx, 22, 16, '#DAA520');
  px(ctx, 23, 16, '#DAA520');
}

// Plant decoration (16x24)
function drawPlant(ctx: CanvasRenderingContext2D) {
  ctx.clearRect(0, 0, 16, 24);

  // Pot
  for (let x = 4; x <= 11; x++) {
    for (let y = 16; y <= 22; y++) {
      px(ctx, x, y, '#CC6633');
    }
  }
  for (let x = 5; x <= 10; x++) px(ctx, x, 23, '#AA5522');
  // Pot rim
  for (let x = 3; x <= 12; x++) px(ctx, x, 16, '#DD7744');

  // Leaves
  const leaf = '#2ECC40';
  const leafDark = '#1FA030';
  px(ctx, 7, 6, leaf); px(ctx, 8, 6, leaf);
  px(ctx, 6, 7, leaf); px(ctx, 7, 7, leafDark); px(ctx, 8, 7, leafDark); px(ctx, 9, 7, leaf);
  px(ctx, 5, 8, leaf); px(ctx, 6, 8, leafDark); px(ctx, 9, 8, leafDark); px(ctx, 10, 8, leaf);
  px(ctx, 4, 9, leaf); px(ctx, 5, 9, leaf); px(ctx, 10, 9, leaf); px(ctx, 11, 9, leaf);
  px(ctx, 5, 10, leaf); px(ctx, 6, 10, leaf); px(ctx, 9, 10, leaf); px(ctx, 10, 10, leaf);
  px(ctx, 6, 11, leaf); px(ctx, 7, 11, leafDark); px(ctx, 8, 11, leafDark); px(ctx, 9, 11, leaf);
  px(ctx, 6, 12, leaf); px(ctx, 9, 12, leaf);
  // Stem
  px(ctx, 7, 13, '#5D8233'); px(ctx, 8, 13, '#5D8233');
  px(ctx, 7, 14, '#5D8233'); px(ctx, 8, 14, '#5D8233');
  px(ctx, 7, 15, '#5D8233'); px(ctx, 8, 15, '#5D8233');
}

export function generateAllSprites(scene: Phaser.Scene) {
  // Generate character sprites
  for (const [role, def] of Object.entries(CHARACTER_DEFS)) {
    const key = `char_${role}`;
    const canvas = scene.textures.createCanvas(key, 16, 20);
    if (canvas) {
      const ctx = canvas.getContext();
      drawCharacter(ctx, def, 0);
      canvas.refresh();
    }
  }

  // Generate desk sprite
  {
    const canvas = scene.textures.createCanvas('desk', 32, 32);
    if (canvas) {
      const ctx = canvas.getContext();
      drawDesk(ctx);
      canvas.refresh();
    }
  }

  // Generate chair sprite
  {
    const canvas = scene.textures.createCanvas('chair', 16, 16);
    if (canvas) {
      const ctx = canvas.getContext();
      drawChair(ctx);
      canvas.refresh();
    }
  }

  // Generate floor tiles
  for (let v = 0; v < 2; v++) {
    const canvas = scene.textures.createCanvas(`floor_${v}`, 32, 32);
    if (canvas) {
      const ctx = canvas.getContext();
      drawFloorTile(ctx, v);
      canvas.refresh();
    }
  }

  // Generate wall tile
  {
    const canvas = scene.textures.createCanvas('wall', 32, 32);
    if (canvas) {
      const ctx = canvas.getContext();
      drawWallTile(ctx);
      canvas.refresh();
    }
  }

  // Generate door tile
  {
    const canvas = scene.textures.createCanvas('door', 32, 32);
    if (canvas) {
      const ctx = canvas.getContext();
      drawDoorTile(ctx);
      canvas.refresh();
    }
  }

  // Generate plant
  {
    const canvas = scene.textures.createCanvas('plant', 16, 24);
    if (canvas) {
      const ctx = canvas.getContext();
      drawPlant(ctx);
      canvas.refresh();
    }
  }
}

export { CHARACTER_DEFS };
