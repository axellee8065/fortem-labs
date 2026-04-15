import * as Phaser from 'phaser';
import { OFFICE_MAP, MAP_WIDTH, MAP_HEIGHT, isWalkableTile } from '../systems/officeMap';
import { findPath } from '../systems/pathfinding';
import { AGENT_CONFIGS, AgentRole } from '@/types/agent';
import { DEFAULT_GAME_CONFIG } from '@/types/game';

const TILE = DEFAULT_GAME_CONFIG.tileSize;

// Color mapping
const FLOOR_COLOR = 0x3d3225;
const FLOOR_LIGHT = 0x4a3d2e;
const WALL_COLOR = 0x5c6b7a;
const WALL_TOP = 0x4a5568;
const DESK_COLOR = 0x8B6914;
const DESK_TOP = 0xa07828;
const DOOR_COLOR = 0x6B4226;

interface AgentSprite {
  sprite: Phaser.GameObjects.Container;
  body: Phaser.GameObjects.Rectangle;
  nameTag: Phaser.GameObjects.Text;
  statusIcon: Phaser.GameObjects.Text;
  speechBubble: Phaser.GameObjects.Container | null;
  role: AgentRole;
  path: { x: number; y: number }[];
  pathIndex: number;
  isMoving: boolean;
  status: string;
}

export class OfficeScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Container;
  private playerBody!: Phaser.GameObjects.Rectangle;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: { W: Phaser.Input.Keyboard.Key; A: Phaser.Input.Keyboard.Key; S: Phaser.Input.Keyboard.Key; D: Phaser.Input.Keyboard.Key };
  private interactKey!: Phaser.Input.Keyboard.Key;
  private agentSprites: Map<string, AgentSprite> = new Map();
  private tileLayer!: Phaser.GameObjects.Graphics;
  private nearbyAgentId: string | null = null;
  private hintText!: Phaser.GameObjects.Text;
  private onAgentInteract: ((agentId: string) => void) | null = null;
  private onNearbyAgentChange: ((agentId: string | null) => void) | null = null;
  private animTimers: Map<string, Phaser.Time.TimerEvent> = new Map();

  constructor() {
    super({ key: 'OfficeScene' });
  }

  setCallbacks(callbacks: {
    onAgentInteract?: (agentId: string) => void;
    onNearbyAgentChange?: (agentId: string | null) => void;
  }) {
    this.onAgentInteract = callbacks.onAgentInteract || null;
    this.onNearbyAgentChange = callbacks.onNearbyAgentChange || null;
  }

  create() {
    // Draw the office map
    this.drawOfficeMap();

    // Create player
    this.createPlayer();

    // Create agents
    this.createAgents();

    // Set up camera
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(2);
    this.cameras.main.setBounds(0, 0, MAP_WIDTH * TILE, MAP_HEIGHT * TILE);

    // Set up input
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.wasd = {
        W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      };
      this.interactKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
      this.interactKey.on('down', () => this.handleInteraction());
    }

    // Interaction hint text
    this.hintText = this.add.text(0, 0, '', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '6px',
      color: '#FFD700',
      backgroundColor: '#000000aa',
      padding: { x: 4, y: 2 },
    }).setDepth(100).setVisible(false);

    // Start idle animations
    this.startAgentIdleAnimations();
  }

  private drawOfficeMap() {
    this.tileLayer = this.add.graphics();

    for (let y = 0; y < MAP_HEIGHT; y++) {
      for (let x = 0; x < MAP_WIDTH; x++) {
        const px = x * TILE;
        const py = y * TILE;
        const tile = OFFICE_MAP[y][x];

        switch (tile) {
          case 0: // floor
            this.tileLayer.fillStyle((x + y) % 2 === 0 ? FLOOR_COLOR : FLOOR_LIGHT);
            this.tileLayer.fillRect(px, py, TILE, TILE);
            break;
          case 1: // wall
            this.tileLayer.fillStyle(WALL_COLOR);
            this.tileLayer.fillRect(px, py, TILE, TILE);
            this.tileLayer.fillStyle(WALL_TOP);
            this.tileLayer.fillRect(px, py, TILE, 4);
            break;
          case 2: // desk/furniture
            this.tileLayer.fillStyle((x + y) % 2 === 0 ? FLOOR_COLOR : FLOOR_LIGHT);
            this.tileLayer.fillRect(px, py, TILE, TILE);
            this.tileLayer.fillStyle(DESK_COLOR);
            this.tileLayer.fillRect(px + 2, py + 2, TILE - 4, TILE - 4);
            this.tileLayer.fillStyle(DESK_TOP);
            this.tileLayer.fillRect(px + 3, py + 3, TILE - 6, TILE - 6);
            break;
          case 3: // door
            this.tileLayer.fillStyle(DOOR_COLOR);
            this.tileLayer.fillRect(px, py, TILE, TILE);
            this.tileLayer.fillStyle(0x8B5A2B);
            this.tileLayer.fillRect(px + 4, py + 2, TILE - 8, TILE - 4);
            break;
        }
      }
    }

    // Draw zone labels
    const labelStyle = { fontFamily: 'monospace', fontSize: '7px', color: '#ffffff44' };
    this.add.text(4 * TILE, 3 * TILE, 'RESEARCH', labelStyle);
    this.add.text(32 * TILE, 3 * TILE, 'DATA', labelStyle);
    this.add.text(4 * TILE, 7 * TILE, 'CREATIVE', labelStyle);
    this.add.text(32 * TILE, 7 * TILE, 'PR', labelStyle);
    this.add.text(4 * TILE, 11 * TILE, 'COPY', labelStyle);
    this.add.text(32 * TILE, 11 * TILE, 'GROWTH', labelStyle);
    this.add.text(4 * TILE, 15 * TILE, 'SNS', labelStyle);
    this.add.text(32 * TILE, 15 * TILE, 'QA', labelStyle);
    this.add.text(4 * TILE, 19 * TILE, 'CMO', labelStyle);
    this.add.text(18 * TILE, 10 * TILE, 'MEETING\n ROOM', { ...labelStyle, color: '#ffffff66' });
    this.add.text(17 * TILE, 21 * TILE, 'BREAK AREA', labelStyle);
  }

  private createPlayer() {
    const startX = 20 * TILE + TILE / 2;
    const startY = 20 * TILE + TILE / 2;

    this.playerBody = this.add.rectangle(0, 0, 20, 24, 0x4488ff);
    const playerHead = this.add.rectangle(0, -10, 14, 12, 0xffcc88);
    const playerHair = this.add.rectangle(0, -14, 16, 6, 0x332211);
    const playerLabel = this.add.text(0, 14, '🧑‍💼 YOU', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '5px',
      color: '#ffffff',
    }).setOrigin(0.5);

    this.player = this.add.container(startX, startY, [
      this.playerBody,
      playerHead,
      playerHair,
      playerLabel,
    ]).setDepth(50);
  }

  private createAgents() {
    for (const [role, config] of Object.entries(AGENT_CONFIGS)) {
      const id = `agent-${role}`;
      const x = config.deskPosition.x * TILE + TILE / 2;
      const y = config.deskPosition.y * TILE + TILE / 2;

      const color = Phaser.Display.Color.HexStringToColor(config.color).color;

      const body = this.add.rectangle(0, 0, 18, 22, color);
      const head = this.add.rectangle(0, -9, 12, 10, 0xffcc88);

      const nameTag = this.add.text(0, 16, `${config.emoji} ${config.name.split(' ')[0]}`, {
        fontFamily: 'monospace',
        fontSize: '5px',
        color: '#ffffff',
        backgroundColor: config.color + 'cc',
        padding: { x: 2, y: 1 },
      }).setOrigin(0.5);

      const statusIcon = this.add.text(10, -16, '💤', {
        fontSize: '8px',
      }).setOrigin(0.5);

      const container = this.add.container(x, y, [body, head, nameTag, statusIcon]).setDepth(40);

      this.agentSprites.set(id, {
        sprite: container,
        body,
        nameTag,
        statusIcon,
        speechBubble: null,
        role: role as AgentRole,
        path: [],
        pathIndex: 0,
        isMoving: false,
        status: 'idle',
      });
    }
  }

  private startAgentIdleAnimations() {
    this.agentSprites.forEach((agent, id) => {
      const timer = this.time.addEvent({
        delay: 2000 + Math.random() * 3000,
        callback: () => {
          if (agent.status === 'idle' && !agent.isMoving) {
            // Small idle bounce
            this.tweens.add({
              targets: agent.sprite,
              y: agent.sprite.y - 2,
              duration: 200,
              yoyo: true,
              ease: 'Quad.easeInOut',
            });
          }
        },
        loop: true,
      });
      this.animTimers.set(id, timer);
    });
  }

  update(time: number, delta: number) {
    this.handlePlayerMovement(delta);
    this.checkNearbyAgents();
    this.updateAgentMovement(delta);
  }

  private handlePlayerMovement(delta: number) {
    if (!this.cursors || !this.wasd) return;

    const speed = DEFAULT_GAME_CONFIG.playerSpeed;
    let vx = 0;
    let vy = 0;

    if (this.cursors.left.isDown || this.wasd.A.isDown) vx = -1;
    else if (this.cursors.right.isDown || this.wasd.D.isDown) vx = 1;

    if (this.cursors.up.isDown || this.wasd.W.isDown) vy = -1;
    else if (this.cursors.down.isDown || this.wasd.S.isDown) vy = 1;

    if (vx !== 0 || vy !== 0) {
      // Normalize diagonal movement
      const len = Math.sqrt(vx * vx + vy * vy);
      vx /= len;
      vy /= len;

      const newX = this.player.x + vx * speed * (delta / 1000);
      const newY = this.player.y + vy * speed * (delta / 1000);

      // Collision check
      const tileX = Math.floor(newX / TILE);
      const tileY = Math.floor(newY / TILE);

      if (isWalkableTile(tileX, tileY)) {
        this.player.x = newX;
        this.player.y = newY;
      } else {
        // Try sliding along walls
        const tileXOnly = Math.floor((this.player.x + vx * speed * (delta / 1000)) / TILE);
        const tileYOnly = Math.floor((this.player.y + vy * speed * (delta / 1000)) / TILE);

        if (isWalkableTile(tileXOnly, Math.floor(this.player.y / TILE))) {
          this.player.x += vx * speed * (delta / 1000);
        }
        if (isWalkableTile(Math.floor(this.player.x / TILE), tileYOnly)) {
          this.player.y += vy * speed * (delta / 1000);
        }
      }
    }
  }

  private checkNearbyAgents() {
    let closestId: string | null = null;
    let closestDist = Infinity;

    this.agentSprites.forEach((agent, id) => {
      const dist = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        agent.sprite.x,
        agent.sprite.y
      );

      if (dist < DEFAULT_GAME_CONFIG.interactionRadius && dist < closestDist) {
        closestId = id;
        closestDist = dist;
      }
    });

    const newNearby = closestId;
    if (newNearby !== this.nearbyAgentId) {
      this.nearbyAgentId = newNearby;
      this.onNearbyAgentChange?.(newNearby);

      if (newNearby) {
        const agent = this.agentSprites.get(newNearby)!;
        this.hintText.setText(`[E] ${agent.role} 에게 태스크 할당`);
        this.hintText.setPosition(agent.sprite.x - 40, agent.sprite.y - 30);
        this.hintText.setVisible(true);
      } else {
        this.hintText.setVisible(false);
      }
    }
  }

  private handleInteraction() {
    if (this.nearbyAgentId) {
      this.onAgentInteract?.(this.nearbyAgentId);
    }
  }

  private updateAgentMovement(delta: number) {
    this.agentSprites.forEach((agent) => {
      if (!agent.isMoving || agent.path.length === 0) return;

      const target = agent.path[agent.pathIndex];
      if (!target) {
        agent.isMoving = false;
        return;
      }

      const targetX = target.x * TILE + TILE / 2;
      const targetY = target.y * TILE + TILE / 2;
      const speed = DEFAULT_GAME_CONFIG.agentSpeed;

      const dx = targetX - agent.sprite.x;
      const dy = targetY - agent.sprite.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 2) {
        agent.sprite.x = targetX;
        agent.sprite.y = targetY;
        agent.pathIndex++;

        if (agent.pathIndex >= agent.path.length) {
          agent.isMoving = false;
          agent.path = [];
          agent.pathIndex = 0;
        }
      } else {
        agent.sprite.x += (dx / dist) * speed * (delta / 1000);
        agent.sprite.y += (dy / dist) * speed * (delta / 1000);
      }
    });
  }

  // Public API methods called from React
  moveAgentTo(agentId: string, targetX: number, targetY: number) {
    const agent = this.agentSprites.get(agentId);
    if (!agent) return;

    const startTileX = Math.floor(agent.sprite.x / TILE);
    const startTileY = Math.floor(agent.sprite.y / TILE);
    const path = findPath(
      { x: startTileX, y: startTileY },
      { x: targetX, y: targetY },
      isWalkableTile
    );

    if (path) {
      agent.path = path;
      agent.pathIndex = 0;
      agent.isMoving = true;
    }
  }

  updateAgentStatus(agentId: string, status: string) {
    const agent = this.agentSprites.get(agentId);
    if (!agent) return;

    agent.status = status;
    const iconMap: Record<string, string> = {
      idle: '💤',
      assigned: '❗',
      walking: '🚶',
      thinking: '💭',
      working: '✏️',
      collaborating: '💬',
      presenting: '🗣️',
      completed: '✅',
      waiting_approval: '⏳',
    };
    agent.statusIcon.setText(iconMap[status] || '💤');

    // Visual feedback
    if (status === 'assigned') {
      this.tweens.add({
        targets: agent.sprite,
        scaleX: 1.2,
        scaleY: 1.2,
        duration: 200,
        yoyo: true,
      });
    } else if (status === 'completed') {
      this.tweens.add({
        targets: agent.sprite,
        y: agent.sprite.y - 8,
        duration: 300,
        yoyo: true,
        repeat: 2,
        ease: 'Bounce.easeOut',
      });
    } else if (status === 'working') {
      // Typing animation
      if (!this.animTimers.has(`work-${agentId}`)) {
        const timer = this.time.addEvent({
          delay: 300,
          callback: () => {
            if (agent.status === 'working') {
              this.tweens.add({
                targets: agent.sprite,
                x: agent.sprite.x + (Math.random() > 0.5 ? 1 : -1),
                duration: 150,
                yoyo: true,
              });
            }
          },
          loop: true,
        });
        this.animTimers.set(`work-${agentId}`, timer);
      }
    }
  }

  showSpeechBubble(agentId: string, text: string) {
    const agent = this.agentSprites.get(agentId);
    if (!agent) return;

    // Remove existing bubble
    if (agent.speechBubble) {
      agent.speechBubble.destroy();
    }

    const maxWidth = 120;
    const padding = 6;

    const bubbleText = this.add.text(0, 0, text, {
      fontFamily: 'monospace',
      fontSize: '5px',
      color: '#000000',
      wordWrap: { width: maxWidth - padding * 2 },
    }).setOrigin(0.5);

    const bounds = bubbleText.getBounds();
    const bgWidth = Math.max(bounds.width + padding * 2, 30);
    const bgHeight = bounds.height + padding * 2;

    const bg = this.add.graphics();
    bg.fillStyle(0xffffff, 0.95);
    bg.fillRoundedRect(-bgWidth / 2, -bgHeight / 2, bgWidth, bgHeight, 4);
    bg.lineStyle(1, 0x000000, 0.3);
    bg.strokeRoundedRect(-bgWidth / 2, -bgHeight / 2, bgWidth, bgHeight, 4);

    // Triangle pointer
    bg.fillStyle(0xffffff, 0.95);
    bg.fillTriangle(0, bgHeight / 2, -4, bgHeight / 2 + 6, 4, bgHeight / 2);

    const bubble = this.add.container(
      agent.sprite.x,
      agent.sprite.y - 30 - bgHeight / 2,
      [bg, bubbleText]
    ).setDepth(80);

    agent.speechBubble = bubble;

    // Auto-hide after 5 seconds
    this.time.delayedCall(5000, () => {
      if (agent.speechBubble === bubble) {
        bubble.destroy();
        agent.speechBubble = null;
      }
    });
  }

  hideSpeechBubble(agentId: string) {
    const agent = this.agentSprites.get(agentId);
    if (!agent || !agent.speechBubble) return;
    agent.speechBubble.destroy();
    agent.speechBubble = null;
  }

  moveAgentsToMeeting(agentIds: string[]) {
    const positions = [
      { x: 18, y: 10 },
      { x: 22, y: 10 },
      { x: 18, y: 14 },
      { x: 22, y: 14 },
      { x: 17, y: 12 },
      { x: 23, y: 12 },
      { x: 19, y: 9 },
      { x: 21, y: 9 },
    ];

    agentIds.forEach((id, i) => {
      const pos = positions[i % positions.length];
      this.moveAgentTo(id, pos.x, pos.y);
    });
  }

  returnAgentToDesk(agentId: string) {
    const agent = this.agentSprites.get(agentId);
    if (!agent) return;
    const config = AGENT_CONFIGS[agent.role];
    this.moveAgentTo(agentId, config.deskPosition.x, config.deskPosition.y);
  }
}
