'use client';

import { useEffect, useRef } from 'react';
import { useTaskStore } from '@/stores/taskStore';
import { useUIStore } from '@/stores/uiStore';
import { AGENT_CONFIGS, AgentRole } from '@/types/agent';

export default function ChatPanel() {
  const messages = useTaskStore((s) => s.messages);
  const activeTaskId = useTaskStore((s) => s.activeTaskId);
  const tasks = useTaskStore((s) => s.tasks);
  const isPanelOpen = useUIStore((s) => s.isPanelOpen);
  const togglePanel = useUIStore((s) => s.togglePanel);
  const scrollRef = useRef<HTMLDivElement>(null);

  const isOpen = isPanelOpen('chat');

  const filteredMessages = activeTaskId
    ? messages.filter((m) => m.taskId === activeTaskId)
    : messages.slice(-50);

  const activeTask = activeTaskId ? tasks[activeTaskId] : null;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [filteredMessages.length]);

  if (!isOpen) return null;

  return (
    <div className="absolute top-10 right-0 w-80 h-[calc(100%-120px)] z-40 flex flex-col bg-[#0d0d1a]/95 border-l-2 border-[#7B68EE] font-mono text-xs">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#1a1a3e] border-b border-[#7B68EE]/50">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-white font-bold">💬 LIVE AGENT CHAT</span>
        </div>
        <button
          onClick={() => togglePanel('chat')}
          className="text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>

      {/* Task info */}
      {activeTask && (
        <div className="px-3 py-2 bg-[#1a1a2e] border-b border-[#333] text-gray-300">
          <span className="text-[#FFD700]">● LIVE</span>
          <span className="ml-2">Task: {activeTask.title}</span>
        </div>
      )}

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3">
        {filteredMessages.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">
            <p>에이전트에게 태스크를 할당하면</p>
            <p>여기에 실시간 대화가 표시됩니다.</p>
            <p className="mt-2 text-[#FFD700]">💡 에이전트에게 다가가서 [E]키를 누르세요</p>
          </div>
        ) : (
          filteredMessages.map((msg) => {
            const agentConfig = AGENT_CONFIGS[msg.agentRole as AgentRole];
            return (
              <div key={msg.id} className="group">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-gray-500 text-[10px]">
                    {msg.timestamp.toLocaleTimeString('ko-KR', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </span>
                  <span
                    className="font-bold"
                    style={{ color: agentConfig?.color || '#888' }}
                  >
                    {agentConfig?.emoji || '🤖'} {agentConfig?.name || msg.agentRole}
                  </span>
                </div>
                <div
                  className={`ml-4 p-2 rounded text-gray-200 text-[11px] leading-relaxed ${
                    msg.messageType === 'system'
                      ? 'bg-[#1a2a1a] border-l-2 border-green-600'
                      : msg.messageType === 'tool_call'
                      ? 'bg-[#1a1a2a] border-l-2 border-blue-600'
                      : msg.messageType === 'output'
                      ? 'bg-[#2a1a2a] border-l-2 border-purple-600'
                      : 'bg-[#1a1a1a]'
                  }`}
                >
                  {msg.messageType === 'tool_call' && (
                    <span className="text-blue-400 text-[9px] block mb-1">
                      🔧 Tool Call
                    </span>
                  )}
                  {msg.content}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Tool calls indicator */}
      {activeTask && activeTask.status === 'processing' && (
        <div className="px-3 py-2 bg-[#0a0a15] border-t border-[#333] text-[10px] text-gray-400">
          🔧 Processing...{' '}
          <span className="animate-pulse">█</span>
        </div>
      )}
    </div>
  );
}
