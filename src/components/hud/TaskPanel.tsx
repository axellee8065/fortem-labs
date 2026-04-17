'use client';

import { useTaskStore } from '@/stores/taskStore';
import { useUIStore } from '@/stores/uiStore';
import { AGENT_CONFIGS, AgentRole } from '@/types/agent';

interface TaskPanelProps {
  onViewTask?: (taskId: string) => void;
}

export default function TaskPanel({ onViewTask }: TaskPanelProps) {
  const tasks = useTaskStore((s) => s.tasks);
  const activeTaskId = useTaskStore((s) => s.activeTaskId);
  const setActiveTask = useTaskStore((s) => s.setActiveTask);
  const isPanelOpen = useUIStore((s) => s.isPanelOpen);
  const togglePanel = useUIStore((s) => s.togglePanel);

  const isOpen = isPanelOpen('task');
  if (!isOpen) return null;

  const taskList = Object.values(tasks).sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  );

  const activeTask = activeTaskId ? tasks[activeTaskId] : null;

  const statusColors: Record<string, string> = {
    pending: 'text-gray-400',
    processing: 'text-blue-400',
    awaiting_approval: 'text-yellow-400',
    approved: 'text-green-400',
    rejected: 'text-red-400',
    completed: 'text-green-300',
    failed: 'text-red-500',
  };

  const statusIcons: Record<string, string> = {
    pending: '⏳',
    processing: '🔄',
    awaiting_approval: '👀',
    approved: '✅',
    rejected: '❌',
    completed: '✅',
    failed: '💥',
  };

  return (
    <div className="absolute top-10 left-0 w-80 h-[calc(100%-120px)] z-40 flex flex-col bg-[#0d0d1a]/95 border-r-2 border-[#4A7C59] font-mono text-xs">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#1a2e1a] border-b border-[#4A7C59]/50">
        <span className="text-white font-bold">📋 TASK PROGRESS</span>
        <button
          onClick={() => togglePanel('task')}
          className="text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>

      {/* Active task detail */}
      {activeTask && (
        <div className="p-3 bg-[#0f0f20] border-b border-[#333]">
          <div className="text-white font-bold mb-2">{activeTask.title}</div>

          {/* Progress bar */}
          <div className="w-full bg-[#1a1a2e] rounded-full h-3 mb-2">
            <div
              className="h-3 rounded-full transition-all duration-500 bg-gradient-to-r from-[#4A7C59] to-[#6BCB77]"
              style={{ width: `${activeTask.progress}%` }}
            />
          </div>
          <div className="text-right text-gray-400 mb-3">
            {activeTask.progress}%
          </div>

          {/* Steps */}
          <div className="space-y-2">
            {activeTask.steps.map((step, i) => {
              const agentConfig = AGENT_CONFIGS[step.agentRole as AgentRole];
              return (
                <div key={step.id} className="flex items-center gap-2">
                  <span>
                    {step.status === 'completed'
                      ? '✅'
                      : step.status === 'in_progress'
                      ? '🔄'
                      : '⏳'}
                  </span>
                  <span className="text-gray-300 text-[10px]">
                    {i + 1}. {agentConfig?.emoji} {step.description}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Assigned agents */}
          <div className="mt-3 flex flex-wrap gap-1">
            {activeTask.assignedAgents.map((role) => {
              const config = AGENT_CONFIGS[role];
              return (
                <span
                  key={role}
                  className="px-2 py-0.5 rounded text-[9px]"
                  style={{
                    backgroundColor: config.color + '33',
                    color: config.color,
                    border: `1px solid ${config.color}55`,
                  }}
                >
                  {config.emoji} {config.name.split(' ')[0]}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Task list */}
      <div className="flex-1 overflow-y-auto">
        {taskList.length === 0 ? (
          <div className="text-center text-gray-500 mt-10 px-4">
            <p>아직 태스크가 없습니다.</p>
            <p className="mt-2 text-[#FFD700]">
              💡 에이전트에게 다가가서 [E]키로 태스크를 할당하세요
            </p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {taskList.map((task) => (
              <div
                key={task.id}
                onClick={() => setActiveTask(task.id)}
                className={`w-full text-left p-2 rounded transition-colors cursor-pointer ${
                  task.id === activeTaskId
                    ? 'bg-[#1a2e1a] border border-[#4A7C59]'
                    : 'bg-[#0f0f1a] hover:bg-[#1a1a2e] border border-transparent'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-gray-200 truncate">
                    {statusIcons[task.status]} {task.title}
                  </span>
                  <span className={`text-[9px] ${statusColors[task.status]}`}>
                    {task.status}
                  </span>
                </div>
                <div className="mt-1 w-full bg-[#1a1a2e] rounded-full h-1">
                  <div
                    className="h-1 rounded-full bg-[#4A7C59] transition-all duration-300"
                    style={{ width: `${task.progress}%` }}
                  />
                </div>
                {onViewTask && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onViewTask(task.id); }}
                    className="mt-1.5 w-full px-2 py-1 bg-[#7B68EE22] text-[#7B68EE] rounded text-[10px] hover:bg-[#7B68EE33] transition-colors"
                  >
                    📄 결과 보기
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
