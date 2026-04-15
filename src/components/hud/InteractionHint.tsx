'use client';

import { useGameStore } from '@/stores/gameStore';
import { useAgentStore } from '@/stores/agentStore';

export default function InteractionHint() {
  const nearbyAgentId = useGameStore((s) => s.player.nearbyAgentId);
  const agents = useAgentStore((s) => s.agents);

  if (!nearbyAgentId) return null;

  const agent = agents[nearbyAgentId];
  if (!agent) return null;

  return (
    <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-[#1a1a2e]/95 border-2 border-[#FFD700] rounded-lg font-mono text-xs text-white animate-bounce">
      <span className="text-[#FFD700]">💡</span>{' '}
      <span>
        {agent.config.emoji} {agent.config.name} 근처입니다.{' '}
        <span className="text-[#FFD700] font-bold">[E]</span> 키를 눌러 태스크를 할당하세요.
      </span>
    </div>
  );
}
