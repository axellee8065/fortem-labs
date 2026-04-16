'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { AGENT_CONFIGS, AgentRole } from '@/types/agent';

const MAP_WIDTH = 40;
const MAP_HEIGHT = 30;
const CELL_SIZE = 24;

type TileTool = 'floor' | 'wall' | 'desk' | 'door' | 'eraser';
type EditorTool = TileTool | 'agent' | 'player';

interface AgentPlacement {
  role: AgentRole;
  x: number;
  y: number;
}

interface PlayerPlacement {
  x: number;
  y: number;
}

interface MapData {
  tiles: number[][];
  agents: AgentPlacement[];
  player: PlayerPlacement;
}

const TILE_COLORS: Record<number, string> = {
  0: '#3D3428',
  1: '#5C6B7A',
  2: '#8B6914',
  3: '#6B4226',
};

const TILE_LABELS: Record<number, string> = {
  0: '',
  1: 'W',
  2: 'D',
  3: '🚪',
};

const TOOL_INFO: Record<TileTool, { label: string; color: string; key: string }> = {
  floor: { label: '바닥', color: '#3D3428', key: '1' },
  wall: { label: '벽', color: '#5C6B7A', key: '2' },
  desk: { label: '책상', color: '#8B6914', key: '3' },
  door: { label: '문', color: '#6B4226', key: '4' },
  eraser: { label: '지우개', color: '#ff4444', key: 'E' },
};

const TOOL_TO_TILE: Record<TileTool, number> = {
  floor: 0,
  wall: 1,
  desk: 2,
  door: 3,
  eraser: 0,
};

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
  return map;
}

function loadMapData(): MapData {
  if (typeof window === 'undefined') {
    return getDefaultMapData();
  }
  try {
    const saved = localStorage.getItem('fortem-map-data');
    if (saved) return JSON.parse(saved);
  } catch {}
  return getDefaultMapData();
}

function getDefaultMapData(): MapData {
  const agents: AgentPlacement[] = Object.entries(AGENT_CONFIGS).map(([role, config]) => ({
    role: role as AgentRole,
    x: config.deskPosition.x,
    y: config.deskPosition.y,
  }));

  // Build default map from officeMap logic
  const tiles = createDefaultMap();

  // Meeting room walls (x 14-22)
  for (let x = 14; x <= 22; x++) { tiles[12][x] = 1; tiles[20][x] = 1; }
  for (let y = 12; y <= 20; y++) { tiles[y][14] = 1; tiles[y][22] = 1; }
  tiles[12][18] = 3; tiles[20][18] = 3;

  // Meeting table
  tiles[15][17] = 2; tiles[15][18] = 2; tiles[15][19] = 2;
  tiles[16][17] = 2; tiles[16][18] = 2; tiles[16][19] = 2;

  // Agent desks (right side shifted -2)
  const deskPositions = [
    { x: 5, y: 9 }, { x: 6, y: 9 },
    { x: 31, y: 9 }, { x: 32, y: 9 },
    { x: 5, y: 13 }, { x: 6, y: 13 },
    { x: 31, y: 13 }, { x: 32, y: 13 },
    { x: 5, y: 17 }, { x: 6, y: 17 },
    { x: 31, y: 17 }, { x: 32, y: 17 },
    { x: 17, y: 17 }, { x: 18, y: 17 },
    { x: 5, y: 21 }, { x: 6, y: 21 },
    { x: 31, y: 21 }, { x: 32, y: 21 },
  ];
  for (const pos of deskPositions) tiles[pos.y][pos.x] = 2;

  // Break area
  tiles[25][18] = 2; tiles[25][19] = 2; tiles[25][20] = 2; tiles[25][21] = 2;
  tiles[26][19] = 2; tiles[26][20] = 2;

  // Partitions
  for (let y = 7; y <= 8; y++) { tiles[y][10] = 1; tiles[y][28] = 1; }

  return { tiles, agents, player: { x: 20, y: 23 } };
}

export default function MapEditor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mapData, setMapData] = useState<MapData>(() => loadMapData());
  const [currentTool, setCurrentTool] = useState<EditorTool>('wall');
  const [selectedAgent, setSelectedAgent] = useState<AgentRole | null>(null);
  const [draggingAgent, setDraggingAgent] = useState<AgentRole | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [saved, setSaved] = useState(false);
  const [hoveredCell, setHoveredCell] = useState<{ x: number; y: number } | null>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw tiles
    for (let y = 0; y < MAP_HEIGHT; y++) {
      for (let x = 0; x < MAP_WIDTH; x++) {
        const tile = mapData.tiles[y]?.[x] ?? 0;
        const px = x * CELL_SIZE;
        const py = y * CELL_SIZE;

        // Checkerboard for floor
        if (tile === 0) {
          ctx.fillStyle = (x + y) % 2 === 0 ? '#3D3428' : '#4A3F30';
        } else {
          ctx.fillStyle = TILE_COLORS[tile] || '#3D3428';
        }
        ctx.fillRect(px, py, CELL_SIZE, CELL_SIZE);

        // Tile label
        if (tile > 0) {
          ctx.fillStyle = '#ffffffaa';
          ctx.font = '10px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(TILE_LABELS[tile], px + CELL_SIZE / 2, py + CELL_SIZE / 2 + 4);
        }
      }
    }

    // Draw grid
    if (showGrid) {
      ctx.strokeStyle = '#ffffff11';
      ctx.lineWidth = 0.5;
      for (let x = 0; x <= MAP_WIDTH; x++) {
        ctx.beginPath();
        ctx.moveTo(x * CELL_SIZE, 0);
        ctx.lineTo(x * CELL_SIZE, MAP_HEIGHT * CELL_SIZE);
        ctx.stroke();
      }
      for (let y = 0; y <= MAP_HEIGHT; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * CELL_SIZE);
        ctx.lineTo(MAP_WIDTH * CELL_SIZE, y * CELL_SIZE);
        ctx.stroke();
      }
    }

    // Draw player
    const plrPx = mapData.player.x * CELL_SIZE;
    const plrPy = mapData.player.y * CELL_SIZE;
    ctx.fillStyle = '#4488ff';
    ctx.fillRect(plrPx + 4, plrPy + 2, CELL_SIZE - 8, CELL_SIZE - 4);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('YOU', plrPx + CELL_SIZE / 2, plrPy + CELL_SIZE / 2 + 3);

    // Draw agents
    for (const agent of mapData.agents) {
      const config = AGENT_CONFIGS[agent.role];
      const ax = agent.x * CELL_SIZE;
      const ay = agent.y * CELL_SIZE;

      ctx.fillStyle = config.color;
      ctx.fillRect(ax + 2, ay + 2, CELL_SIZE - 4, CELL_SIZE - 4);

      ctx.fillStyle = '#ffffff';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(config.emoji, ax + CELL_SIZE / 2, ay + CELL_SIZE / 2 + 4);
    }

    // Draw hover indicator
    if (hoveredCell) {
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 2;
      ctx.strokeRect(
        hoveredCell.x * CELL_SIZE,
        hoveredCell.y * CELL_SIZE,
        CELL_SIZE,
        CELL_SIZE
      );

      // Show coordinates
      ctx.fillStyle = '#FFD700';
      ctx.font = '10px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(
        `(${hoveredCell.x}, ${hoveredCell.y})`,
        hoveredCell.x * CELL_SIZE,
        hoveredCell.y * CELL_SIZE - 4
      );
    }
  }, [mapData, showGrid, hoveredCell]);

  useEffect(() => {
    draw();
  }, [draw]);

  const getCellFromEvent = (e: React.MouseEvent): { x: number; y: number } | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = Math.floor((e.clientX - rect.left) * scaleX / CELL_SIZE);
    const y = Math.floor((e.clientY - rect.top) * scaleY / CELL_SIZE);
    if (x < 0 || x >= MAP_WIDTH || y < 0 || y >= MAP_HEIGHT) return null;
    return { x, y };
  };

  const applyTool = (x: number, y: number) => {
    if (currentTool === 'player') {
      setMapData(prev => ({ ...prev, player: { x, y } }));
      return;
    }

    if (currentTool === 'agent' && selectedAgent) {
      setMapData(prev => ({
        ...prev,
        agents: prev.agents.map(a =>
          a.role === selectedAgent ? { ...a, x, y } : a
        ),
      }));
      return;
    }

    if (currentTool in TOOL_TO_TILE) {
      const tileValue = TOOL_TO_TILE[currentTool as TileTool];
      setMapData(prev => {
        const newTiles = prev.tiles.map(row => [...row]);
        newTiles[y][x] = tileValue;
        return { ...prev, tiles: newTiles };
      });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const cell = getCellFromEvent(e);
    if (!cell) return;

    // Check if clicking on an agent to drag
    const clickedAgent = mapData.agents.find(a => a.x === cell.x && a.y === cell.y);
    if (clickedAgent && currentTool !== 'wall' && currentTool !== 'floor' && currentTool !== 'desk' && currentTool !== 'door' && currentTool !== 'eraser') {
      setDraggingAgent(clickedAgent.role);
      setCurrentTool('agent');
      setSelectedAgent(clickedAgent.role);
      return;
    }

    setIsDrawing(true);
    applyTool(cell.x, cell.y);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const cell = getCellFromEvent(e);
    setHoveredCell(cell);

    if (!cell) return;

    if (draggingAgent) {
      setMapData(prev => ({
        ...prev,
        agents: prev.agents.map(a =>
          a.role === draggingAgent ? { ...a, x: cell.x, y: cell.y } : a
        ),
      }));
      return;
    }

    if (isDrawing && (currentTool in TOOL_TO_TILE)) {
      applyTool(cell.x, cell.y);
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    setDraggingAgent(null);
  };

  const handleSave = () => {
    localStorage.setItem('fortem-map-data', JSON.stringify(mapData));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(mapData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fortem-map.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target?.result as string) as MapData;
          setMapData(data);
        } catch {
          alert('잘못된 JSON 파일입니다.');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleReset = () => {
    if (confirm('기본 맵으로 리셋하시겠습니까?')) {
      const defaultData = getDefaultMapData();
      setMapData(defaultData);
      localStorage.removeItem('fortem-map-data');
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case '1': setCurrentTool('floor'); break;
        case '2': setCurrentTool('wall'); break;
        case '3': setCurrentTool('desk'); break;
        case '4': setCurrentTool('door'); break;
        case 'e': case 'E': setCurrentTool('eraser'); break;
        case 'p': case 'P': setCurrentTool('player'); break;
        case 'g': case 'G': setShowGrid(prev => !prev); break;
        case 's': case 'S':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            handleSave();
          }
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mapData]);

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      backgroundColor: '#1a1a2e',
      color: '#ffffff',
      fontFamily: 'monospace',
    }}>
      {/* Left Sidebar - Tools */}
      <div style={{
        width: '220px',
        padding: '16px',
        backgroundColor: '#16213e',
        overflowY: 'auto',
        borderRight: '2px solid #0f3460',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}>
        <h2 style={{ margin: 0, fontSize: '16px', color: '#FFD700' }}>Map Editor</h2>

        {/* Tile Tools */}
        <div>
          <h3 style={{ margin: '0 0 8px', fontSize: '12px', color: '#888' }}>TILES</h3>
          {(Object.entries(TOOL_INFO) as [TileTool, typeof TOOL_INFO[TileTool]][]).map(([tool, info]) => (
            <button
              key={tool}
              onClick={() => { setCurrentTool(tool); setSelectedAgent(null); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                width: '100%',
                padding: '8px',
                marginBottom: '4px',
                backgroundColor: currentTool === tool ? '#0f3460' : 'transparent',
                border: currentTool === tool ? '2px solid #FFD700' : '2px solid transparent',
                color: '#fff',
                cursor: 'pointer',
                borderRadius: '4px',
                fontSize: '12px',
              }}
            >
              <span style={{
                width: '16px',
                height: '16px',
                backgroundColor: info.color,
                display: 'inline-block',
                border: '1px solid #555',
              }} />
              {info.label}
              <span style={{ marginLeft: 'auto', color: '#666', fontSize: '10px' }}>[{info.key}]</span>
            </button>
          ))}
        </div>

        {/* Player Tool */}
        <div>
          <h3 style={{ margin: '0 0 8px', fontSize: '12px', color: '#888' }}>PLAYER</h3>
          <button
            onClick={() => { setCurrentTool('player'); setSelectedAgent(null); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              width: '100%',
              padding: '8px',
              backgroundColor: currentTool === 'player' ? '#0f3460' : 'transparent',
              border: currentTool === 'player' ? '2px solid #FFD700' : '2px solid transparent',
              color: '#fff',
              cursor: 'pointer',
              borderRadius: '4px',
              fontSize: '12px',
            }}
          >
            <span style={{
              width: '16px',
              height: '16px',
              backgroundColor: '#4488ff',
              display: 'inline-block',
              border: '1px solid #555',
            }} />
            플레이어 위치
            <span style={{ marginLeft: 'auto', color: '#666', fontSize: '10px' }}>[P]</span>
          </button>
        </div>

        {/* Agent Tools */}
        <div>
          <h3 style={{ margin: '0 0 8px', fontSize: '12px', color: '#888' }}>AGENTS (클릭→맵에 배치)</h3>
          {Object.entries(AGENT_CONFIGS).map(([role, config]) => {
            const agent = mapData.agents.find(a => a.role === role);
            return (
              <button
                key={role}
                onClick={() => {
                  setCurrentTool('agent');
                  setSelectedAgent(role as AgentRole);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  width: '100%',
                  padding: '6px 8px',
                  marginBottom: '2px',
                  backgroundColor: selectedAgent === role ? '#0f3460' : 'transparent',
                  border: selectedAgent === role ? '2px solid #FFD700' : '2px solid transparent',
                  color: '#fff',
                  cursor: 'pointer',
                  borderRadius: '4px',
                  fontSize: '11px',
                }}
              >
                <span style={{
                  width: '14px',
                  height: '14px',
                  backgroundColor: config.color,
                  display: 'inline-block',
                  border: '1px solid #555',
                  borderRadius: '2px',
                }} />
                <span>{config.emoji} {config.name.split(' ')[0]}</span>
                <span style={{ marginLeft: 'auto', color: '#666', fontSize: '9px' }}>
                  {agent ? `${agent.x},${agent.y}` : ''}
                </span>
              </button>
            );
          })}
        </div>

        {/* Actions */}
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ fontSize: '10px', color: '#666', marginBottom: '4px' }}>
            [G] 그리드 토글 | [Ctrl+S] 저장
          </div>
          <button onClick={handleSave} style={actionBtnStyle(saved ? '#27AE60' : '#0f3460')}>
            {saved ? '저장 완료!' : '💾 저장 (게임 반영)'}
          </button>
          <button onClick={handleExportJSON} style={actionBtnStyle('#0f3460')}>
            📥 JSON 내보내기
          </button>
          <button onClick={handleImportJSON} style={actionBtnStyle('#0f3460')}>
            📤 JSON 불러오기
          </button>
          <button onClick={handleReset} style={actionBtnStyle('#8B0000')}>
            🔄 기본맵 리셋
          </button>
          <a href="/" style={{
            ...actionBtnStyle('#2C3E50'),
            textAlign: 'center',
            textDecoration: 'none',
          }}>
            🎮 게임으로 돌아가기
          </a>
        </div>
      </div>

      {/* Canvas Area */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: '16px',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
      }}>
        <canvas
          ref={canvasRef}
          width={MAP_WIDTH * CELL_SIZE}
          height={MAP_HEIGHT * CELL_SIZE}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => { handleMouseUp(); setHoveredCell(null); }}
          style={{
            cursor: draggingAgent ? 'grabbing' : 'crosshair',
            border: '2px solid #0f3460',
            imageRendering: 'pixelated',
          }}
        />
      </div>
    </div>
  );
}

function actionBtnStyle(bg: string): React.CSSProperties {
  return {
    padding: '8px 12px',
    backgroundColor: bg,
    border: '1px solid #333',
    color: '#fff',
    cursor: 'pointer',
    borderRadius: '4px',
    fontSize: '12px',
    fontFamily: 'monospace',
  };
}
