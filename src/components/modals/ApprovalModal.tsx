'use client';

import { useUIStore } from '@/stores/uiStore';
import { useTaskStore } from '@/stores/taskStore';
import { AGENT_CONFIGS, AgentRole } from '@/types/agent';

interface ApprovalModalProps {
  taskId: string;
  onApprove: () => void;
  onReject: () => void;
  onRevise: (feedback: string) => void;
}

export default function ApprovalModal({
  taskId,
  onApprove,
  onReject,
  onRevise,
}: ApprovalModalProps) {
  const closeModal = useUIStore((s) => s.closeModal);
  const tasks = useTaskStore((s) => s.tasks);
  const task = tasks[taskId];

  if (!task) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70">
      <div className="w-[520px] max-h-[80vh] bg-[#0d0d1a] border-2 border-[#FFD700] rounded-lg font-mono text-xs overflow-hidden shadow-2xl shadow-[#FFD700]/20">
        {/* Header */}
        <div className="px-4 py-3 bg-[#2a2a1a] border-b-2 border-[#FFD700]">
          <div className="text-[#FFD700] font-bold text-sm">✅ APPROVAL</div>
          <div className="text-gray-400 mt-1">
            📋 Task: {task.title}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[400px]">
          {/* Assigned agents */}
          <div className="mb-3 text-gray-400">
            작성자:{' '}
            {task.assignedAgents.map((role) => {
              const config = AGENT_CONFIGS[role];
              return (
                <span key={role} className="ml-1" style={{ color: config.color }}>
                  {config.emoji} {config.name.split(' ')[0]}
                </span>
              );
            })}
          </div>

          {/* Output preview */}
          <div className="bg-[#1a1a2e] border border-[#333] rounded p-4">
            <div className="text-gray-300 whitespace-pre-wrap leading-relaxed">
              {task.output || '결과물이 아직 생성되지 않았습니다.'}
            </div>
          </div>

          {/* Steps summary */}
          <div className="mt-4 space-y-1">
            {task.steps.map((step, i) => {
              const config = AGENT_CONFIGS[step.agentRole as AgentRole];
              return (
                <div key={step.id} className="flex items-center gap-2 text-gray-400">
                  <span>{step.status === 'completed' ? '✅' : '⏳'}</span>
                  <span>
                    {i + 1}. {config?.emoji} {step.description}
                  </span>
                  <span className="text-gray-600">—</span>
                  <span className={step.status === 'completed' ? 'text-green-400' : ''}>
                    {step.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="px-4 py-3 bg-[#0a0a15] border-t border-[#222] flex justify-between items-center">
          <span className="text-gray-500">[Esc] 나중에 결정</span>
          <div className="flex gap-2">
            <button
              onClick={() => {
                onReject();
                closeModal();
              }}
              className="px-4 py-2 bg-[#8B0000] text-white rounded hover:bg-[#a00000] transition-colors"
            >
              ❌ 거절
            </button>
            <button
              onClick={() => {
                onRevise('수정이 필요합니다.');
                closeModal();
              }}
              className="px-4 py-2 bg-[#B8860B] text-white rounded hover:bg-[#c89620] transition-colors"
            >
              🔄 수정 요청
            </button>
            <button
              onClick={() => {
                onApprove();
                closeModal();
              }}
              className="px-4 py-2 bg-[#2E7D32] text-white rounded hover:bg-[#388E3C] transition-colors font-bold"
            >
              ✅ 승인
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
