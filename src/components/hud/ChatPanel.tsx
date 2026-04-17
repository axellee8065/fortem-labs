'use client';

import { useEffect, useRef } from 'react';
import { useTaskStore } from '@/stores/taskStore';
import { useUIStore } from '@/stores/uiStore';
import { AGENT_CONFIGS, AgentRole } from '@/types/agent';

const STATUS_INFO: Record<string, { icon: string; label: string; color: string }> = {
  idle: { icon: '💤', label: 'IDLE', color: '#666' },
  assigned: { icon: '❗', label: 'ASSIGNED', color: '#FFD700' },
  walking: { icon: '🚶', label: 'MOVING', color: '#888' },
  thinking: { icon: '💭', label: 'THINKING', color: '#7B68EE' },
  working: { icon: '✏️', label: 'WORKING', color: '#3498DB' },
  collaborating: { icon: '💬', label: 'COLLAB', color: '#9B59B6' },
  presenting: { icon: '🗣️', label: 'PRESENTING', color: '#E91E63' },
  completed: { icon: '✅', label: 'DONE', color: '#27AE60' },
  waiting_approval: { icon: '⏳', label: 'WAITING', color: '#F39C12' },
};

function AgentDashboard() {
  const tasks = useTaskStore((s) => s.tasks);

  // Calculate agent workload from tasks
  const agentTaskCounts: Record<string, { active: number; completed: number; status: string }> = {};
  for (const [role] of Object.entries(AGENT_CONFIGS)) {
    agentTaskCounts[role] = { active: 0, completed: 0, status: 'idle' };
  }

  for (const task of Object.values(tasks)) {
    for (const agentRole of task.assignedAgents) {
      if (agentTaskCounts[agentRole]) {
        if (task.status === 'completed' || task.status === 'approved') {
          agentTaskCounts[agentRole].completed++;
        } else if (task.status === 'processing') {
          agentTaskCounts[agentRole].active++;
          agentTaskCounts[agentRole].status = 'working';
        } else if (task.status === 'awaiting_approval') {
          agentTaskCounts[agentRole].status = 'waiting_approval';
        }
      }
    }
  }

  const totalTasks = Object.values(tasks).length;
  const completedTasks = Object.values(tasks).filter(t => t.status === 'completed' || t.status === 'approved').length;
  const activeTasks = Object.values(tasks).filter(t => t.status === 'processing').length;

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Team Overview */}
      <div className="px-4 py-3 border-b border-[#333]">
        <h3 className="text-white font-bold text-[11px] mb-3">📊 TEAM OVERVIEW</h3>
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-[#1a1a2e] rounded-lg p-3 text-center">
            <div className="text-[20px] font-bold text-[#4A7C59]">{totalTasks}</div>
            <div className="text-[9px] text-gray-500 mt-1">TOTAL</div>
          </div>
          <div className="bg-[#1a1a2e] rounded-lg p-3 text-center">
            <div className="text-[20px] font-bold text-[#3498DB]">{activeTasks}</div>
            <div className="text-[9px] text-gray-500 mt-1">ACTIVE</div>
          </div>
          <div className="bg-[#1a1a2e] rounded-lg p-3 text-center">
            <div className="text-[20px] font-bold text-[#27AE60]">{completedTasks}</div>
            <div className="text-[9px] text-gray-500 mt-1">DONE</div>
          </div>
        </div>
      </div>

      {/* Agent Status List */}
      <div className="px-4 py-3">
        <h3 className="text-white font-bold text-[11px] mb-3">👥 AGENT STATUS</h3>
        <div className="space-y-2">
          {Object.entries(AGENT_CONFIGS).map(([role, config]) => {
            const workload = agentTaskCounts[role] || { active: 0, completed: 0, status: 'idle' };
            const statusInfo = STATUS_INFO[workload.status] || STATUS_INFO.idle;
            const totalWork = workload.active + workload.completed;

            return (
              <div
                key={role}
                className="flex items-center gap-3 p-2 rounded-lg bg-[#0f0f1a] hover:bg-[#1a1a2e] transition-colors"
              >
                {/* Avatar */}
                <div
                  className="w-8 h-8 rounded-md flex items-center justify-center text-[14px] flex-shrink-0"
                  style={{ backgroundColor: config.color + '33', border: `1px solid ${config.color}55` }}
                >
                  {config.emoji}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-white text-[11px] font-bold truncate">
                      {config.name.split(' ')[0]}
                    </span>
                    <span
                      className="text-[9px] px-2 py-0.5 rounded-full flex-shrink-0"
                      style={{
                        backgroundColor: statusInfo.color + '22',
                        color: statusInfo.color,
                        border: `1px solid ${statusInfo.color}44`,
                      }}
                    >
                      {statusInfo.icon} {statusInfo.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[9px] text-gray-500">{config.title}</span>
                    {totalWork > 0 && (
                      <span className="text-[9px] text-gray-600 ml-auto">
                        📋 {totalWork}
                      </span>
                    )}
                  </div>
                  {/* Workload bar */}
                  {totalWork > 0 && (
                    <div className="w-full bg-[#1a1a2e] rounded-full h-1 mt-1.5">
                      <div
                        className="h-1 rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min((workload.completed / Math.max(totalWork, 1)) * 100, 100)}%`,
                          backgroundColor: config.color,
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Tips */}
      <div className="px-4 py-3 border-t border-[#333]">
        <h3 className="text-white font-bold text-[11px] mb-2">💡 QUICK TIPS</h3>
        <div className="space-y-2 text-[10px] text-gray-500">
          <p>• WASD로 이동, 에이전트 근처에서 <span className="text-[#FFD700]">[E]</span> 키로 태스크 할당</p>
          <p>• CEO에게 큰 방향을 지시하면 팀에 자동 분배</p>
          <p>• 각 에이전트에게 직접 전문 업무를 할당할 수도 있음</p>
          <p>• <span className="text-[#7B68EE]">/editor</span> 에서 오피스 배치를 자유롭게 수정 가능</p>
        </div>
      </div>
    </div>
  );
}

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

  const hasMessages = filteredMessages.length > 0;

  return (
    <div className="absolute top-10 right-0 w-[480px] h-[calc(100%-120px)] z-40 flex flex-col bg-[#0d0d1a]/95 border-l-2 border-[#7B68EE] font-mono text-xs">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#1a1a3e] border-b border-[#7B68EE]/50">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-white font-bold">
            {hasMessages ? '💬 LIVE AGENT CHAT' : '📊 AGENT DASHBOARD'}
          </span>
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

      {/* Content: Messages or Dashboard */}
      {hasMessages ? (
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3">
          {filteredMessages.map((msg) => {
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
          })}
        </div>
      ) : (
        <AgentDashboard />
      )}

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
