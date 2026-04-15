'use client';

import dynamic from 'next/dynamic';

const GameLayout = dynamic(() => import('@/components/game/GameLayout'), {
  ssr: false,
  loading: () => (
    <div className="w-screen h-screen flex flex-col items-center justify-center bg-[#1a1a2e] text-white font-mono">
      <div className="text-4xl mb-4">🏢</div>
      <div className="text-xl text-[#FFD700] mb-2">ForTem Labs</div>
      <div className="text-sm text-gray-400 mb-6">AI Agent Team Platform</div>
      <div className="w-48 h-2 bg-[#333] rounded overflow-hidden">
        <div className="h-full bg-[#4A7C59] rounded animate-pulse" style={{ width: '40%' }} />
      </div>
      <div className="mt-4 text-xs text-gray-600">Loading game engine...</div>
    </div>
  ),
});

export default function Home() {
  return <GameLayout />;
}
