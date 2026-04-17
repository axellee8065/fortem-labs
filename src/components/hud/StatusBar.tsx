'use client';

import { useTaskStore } from '@/stores/taskStore';
import { useUIStore } from '@/stores/uiStore';

interface StatusBarProps {
  onShowGuide?: () => void;
}

export default function StatusBar({ onShowGuide }: StatusBarProps) {
  const tasks = useTaskStore((s) => s.tasks);
  const togglePanel = useUIStore((s) => s.togglePanel);
  const soundEnabled = useUIStore((s) => s.soundEnabled);
  const toggleSound = useUIStore((s) => s.toggleSound);

  const activeTasks = Object.values(tasks).filter(
    (t) => t.status === 'processing' || t.status === 'awaiting_approval'
  ).length;
  const completedTasks = Object.values(tasks).filter(
    (t) => t.status === 'completed'
  ).length;

  return (
    <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-2 bg-[#1a1a2e]/95 border-b-2 border-[#4A7C59] text-white font-mono text-xs">
      <div className="flex items-center gap-4">
        <span className="text-[#FFD700] font-bold tracking-wider">
          🏢 ForTem Labs
        </span>
        <span className="text-gray-400">|</span>
        <span>👤 보스</span>
        <span className="text-gray-400">|</span>
        <span>🪙 Credits: 1,250</span>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => togglePanel('task')}
          className="px-2 py-1 bg-[#2d2d4e] rounded hover:bg-[#3d3d5e] transition-colors"
        >
          📋 Tasks: {activeTasks}
        </button>
        <button
          onClick={() => togglePanel('chat')}
          className="px-2 py-1 bg-[#2d2d4e] rounded hover:bg-[#3d3d5e] transition-colors"
        >
          💬 Chat
        </button>
        <span className="text-green-400">✅ {completedTasks}</span>
        {onShowGuide && (
          <button
            onClick={onShowGuide}
            className="px-2 py-1 bg-[#2d2d4e] rounded hover:bg-[#3d3d5e] transition-colors"
          >
            ❓ Guide
          </button>
        )}
        <button
          onClick={toggleSound}
          className="px-2 py-1 bg-[#2d2d4e] rounded hover:bg-[#3d3d5e] transition-colors"
        >
          {soundEnabled ? '🔊' : '🔇'}
        </button>
        <span className="text-gray-500">
          ⏰ {new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
}
