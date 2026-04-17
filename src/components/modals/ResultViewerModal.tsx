'use client';

import { useState } from 'react';
import { useTaskStore } from '@/stores/taskStore';
import { AGENT_CONFIGS, AgentRole } from '@/types/agent';

interface ResultViewerModalProps {
  taskId: string;
  onClose: () => void;
}

export default function ResultViewerModal({ taskId, onClose }: ResultViewerModalProps) {
  const task = useTaskStore((s) => s.tasks[taskId]);
  const messages = useTaskStore((s) => s.messages).filter((m) => m.taskId === taskId);
  const [tab, setTab] = useState<'output' | 'chat' | 'steps'>('output');
  const [copied, setCopied] = useState(false);

  if (!task) return null;

  const outputMessages = messages.filter((m) => m.messageType === 'output');
  const allOutput = outputMessages.map((m) => m.content).join('\n\n');
  const finalOutput = task.output || allOutput || '(결과물 없음)';

  const handleCopyOutput = () => {
    navigator.clipboard.writeText(finalOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportTxt = () => {
    const content = [
      `═══════════════════════════════════════`,
      `  ForTem Labs - Task Report`,
      `═══════════════════════════════════════`,
      ``,
      `📋 Task: ${task.title}`,
      `📝 Description: ${task.description}`,
      `📊 Status: ${task.status}`,
      `📅 Created: ${task.createdAt.toLocaleString('ko-KR')}`,
      task.completedAt ? `✅ Completed: ${task.completedAt.toLocaleString('ko-KR')}` : '',
      `👥 Agents: ${task.assignedAgents.map((r) => AGENT_CONFIGS[r]?.name || r).join(', ')}`,
      ``,
      `───────────────────────────────────────`,
      `  📄 OUTPUT`,
      `───────────────────────────────────────`,
      ``,
      finalOutput,
      ``,
      `───────────────────────────────────────`,
      `  💬 FULL CONVERSATION LOG`,
      `───────────────────────────────────────`,
      ``,
      ...messages.map((m) => {
        const agent = AGENT_CONFIGS[m.agentRole as AgentRole];
        const time = m.timestamp.toLocaleTimeString('ko-KR');
        return `[${time}] ${agent?.emoji || ''} ${agent?.name || m.agentRole}: ${m.content}`;
      }),
    ].filter(Boolean).join('\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fortem-task-${task.title.replace(/\s+/g, '-').slice(0, 30)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportMd = () => {
    const content = [
      `# 📋 ${task.title}`,
      ``,
      `| 항목 | 내용 |`,
      `|------|------|`,
      `| Status | ${task.status} |`,
      `| Created | ${task.createdAt.toLocaleString('ko-KR')} |`,
      task.completedAt ? `| Completed | ${task.completedAt.toLocaleString('ko-KR')} |` : '',
      `| Agents | ${task.assignedAgents.map((r) => `${AGENT_CONFIGS[r]?.emoji || ''} ${AGENT_CONFIGS[r]?.name || r}`).join(', ')} |`,
      ``,
      `## 📄 Output`,
      ``,
      finalOutput,
      ``,
      `## 💬 Conversation Log`,
      ``,
      ...messages.map((m) => {
        const agent = AGENT_CONFIGS[m.agentRole as AgentRole];
        const time = m.timestamp.toLocaleTimeString('ko-KR');
        return `**[${time}] ${agent?.emoji || ''} ${agent?.name || m.agentRole}:** ${m.content}`;
      }),
    ].filter(Boolean).join('\n');

    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fortem-task-${task.title.replace(/\s+/g, '-').slice(0, 30)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-[640px] max-h-[85vh] bg-[#0d0d1a] border-2 border-[#7B68EE] rounded-lg font-mono text-xs flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 bg-[#1a1a3e] border-b border-[#7B68EE]/50 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-white font-bold text-sm">📄 {task.title}</h2>
            <div className="flex items-center gap-3 mt-1 text-[10px]">
              <span className="text-gray-400">{task.createdAt.toLocaleString('ko-KR')}</span>
              <span
                className="px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: task.status === 'completed' || task.status === 'approved' ? '#27AE6022' : '#FFD70022',
                  color: task.status === 'completed' || task.status === 'approved' ? '#27AE60' : '#FFD700',
                }}
              >
                {task.status}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-lg">✕</button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#333] flex-shrink-0">
          {(['output', 'chat', 'steps'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 px-4 py-2 text-center transition-colors ${
                tab === t
                  ? 'text-white bg-[#1a1a2e] border-b-2 border-[#7B68EE]'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {t === 'output' && '📄 결과물'}
              {t === 'chat' && '💬 대화 로그'}
              {t === 'steps' && '📋 작업 단계'}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {tab === 'output' && (
            <div>
              <div className="bg-[#1a1a2e] rounded-lg p-4 text-gray-200 text-[12px] leading-relaxed whitespace-pre-wrap border border-[#333]">
                {finalOutput}
              </div>
            </div>
          )}

          {tab === 'chat' && (
            <div className="space-y-3">
              {messages.length === 0 ? (
                <p className="text-gray-500 text-center mt-10">대화 기록이 없습니다.</p>
              ) : (
                messages.map((msg) => {
                  const agentConfig = AGENT_CONFIGS[msg.agentRole as AgentRole];
                  return (
                    <div key={msg.id}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-gray-500 text-[10px]">
                          {msg.timestamp.toLocaleTimeString('ko-KR', {
                            hour: '2-digit', minute: '2-digit', second: '2-digit',
                          })}
                        </span>
                        <span className="font-bold" style={{ color: agentConfig?.color || '#888' }}>
                          {agentConfig?.emoji || '🤖'} {agentConfig?.name || msg.agentRole}
                        </span>
                        <span className="text-[9px] text-gray-600">
                          [{msg.messageType}]
                        </span>
                      </div>
                      <div className={`ml-4 p-2 rounded text-gray-200 text-[11px] leading-relaxed ${
                        msg.messageType === 'output'
                          ? 'bg-[#2a1a2a] border-l-2 border-purple-600'
                          : msg.messageType === 'system'
                          ? 'bg-[#1a2a1a] border-l-2 border-green-600'
                          : 'bg-[#1a1a1a]'
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {tab === 'steps' && (
            <div className="space-y-2">
              {task.steps.length === 0 ? (
                <p className="text-gray-500 text-center mt-10">작업 단계가 없습니다.</p>
              ) : (
                task.steps.map((step, i) => {
                  const agentConfig = AGENT_CONFIGS[step.agentRole as AgentRole];
                  return (
                    <div key={step.id} className="p-3 bg-[#1a1a2e] rounded-lg border border-[#333]">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[14px]">
                          {step.status === 'completed' ? '✅' : step.status === 'in_progress' ? '🔄' : '⏳'}
                        </span>
                        <span className="text-white font-bold text-[11px]">
                          Step {i + 1}: {step.description}
                        </span>
                      </div>
                      <div className="ml-6 text-[10px] text-gray-400">
                        {agentConfig?.emoji} {agentConfig?.name} — {step.status}
                      </div>
                      {step.output && (
                        <div className="ml-6 mt-2 p-2 bg-[#0f0f1a] rounded text-[11px] text-gray-300 whitespace-pre-wrap">
                          {step.output}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Footer - Actions */}
        <div className="px-4 py-3 bg-[#0a0a15] border-t border-[#333] flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleCopyOutput}
            className="px-3 py-2 bg-[#2d2d4e] text-white rounded hover:bg-[#3d3d5e] transition-colors text-[11px]"
          >
            {copied ? '✅ 복사됨!' : '📋 결과 복사'}
          </button>
          <button
            onClick={handleExportTxt}
            className="px-3 py-2 bg-[#2d2d4e] text-white rounded hover:bg-[#3d3d5e] transition-colors text-[11px]"
          >
            📥 TXT 내보내기
          </button>
          <button
            onClick={handleExportMd}
            className="px-3 py-2 bg-[#2d2d4e] text-white rounded hover:bg-[#3d3d5e] transition-colors text-[11px]"
          >
            📥 MD 내보내기
          </button>
          <div className="flex-1" />
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#333] text-gray-300 rounded hover:bg-[#444] transition-colors text-[11px]"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
