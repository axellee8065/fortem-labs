'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { useAgentStore } from '@/stores/agentStore';
import { useUIStore } from '@/stores/uiStore';

interface GameCanvasProps {
  onAgentInteract: (agentId: string) => void;
}

export default function GameCanvas({ onAgentInteract }: GameCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const setReady = useGameStore((s) => s.setReady);
  const setNearbyAgent = useGameStore((s) => s.setNearbyAgent);
  const initializeAgents = useAgentStore((s) => s.initializeAgents);
  const setInteractionHint = useUIStore((s) => s.setInteractionHint);
  const [isLoading, setIsLoading] = useState(true);

  const handleNearbyAgentChange = useCallback(
    (agentId: string | null) => {
      setNearbyAgent(agentId);
      if (agentId) {
        setInteractionHint(`[E] 태스크 할당`);
      } else {
        setInteractionHint(null);
      }
    },
    [setNearbyAgent, setInteractionHint]
  );

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;

    // Initialize agents store
    initializeAgents();

    // Dynamic import to avoid SSR issues
    import('@/game/GameManager').then(({ createGame }) => {
      if (!containerRef.current) return;

      const game = createGame(containerRef.current, {
        onAgentInteract,
        onNearbyAgentChange: handleNearbyAgentChange,
      });

      gameRef.current = game;
      setReady(true);
      setIsLoading(false);
    });

    return () => {
      import('@/game/GameManager').then(({ destroyGame }) => {
        destroyGame();
      });
      gameRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="relative w-full h-full">
      {isLoading && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#1a1a2e]">
          <div className="text-[#FFD700] font-mono text-lg mb-4 animate-pulse">
            🏢 ForTem Labs Office Loading...
          </div>
          <div className="w-48 h-2 bg-[#333] rounded">
            <div className="h-2 bg-[#4A7C59] rounded animate-pulse" style={{ width: '60%' }} />
          </div>
          <div className="mt-4 text-gray-500 font-mono text-xs">
            WASD or Arrow Keys to move | E to interact
          </div>
        </div>
      )}
      <div
        ref={containerRef}
        className="w-full h-full"
        style={{ imageRendering: 'pixelated' }}
      />
    </div>
  );
}
