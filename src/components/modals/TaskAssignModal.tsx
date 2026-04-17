'use client';

import { useState } from 'react';
import { useUIStore } from '@/stores/uiStore';
import { useAgentStore } from '@/stores/agentStore';
import { AGENT_CONFIGS, AgentRole } from '@/types/agent';

interface TaskAssignModalProps {
  agentId: string;
  onAssign: (task: string, agentId: string) => void;
}

const SUGGESTED_TASKS: Record<AgentRole, string[]> = {
  ceo: ['전체 전략 검토', '팀 목표 설정', '주요 의사결정'],
  cmo: ['마케팅 전략 수립', '캠페인 기획', '경쟁사 마케팅 분석'],
  creative_director: ['비주얼 컨셉 제작', '브랜딩 가이드 작성', '크리에이티브 리뷰'],
  copywriter: ['트윗 작성', '블로그 포스트 작성', '마케팅 카피 작성'],
  social_media_manager: ['SNS 콘텐츠 최적화', '해시태그 전략', '포스팅 스케줄 관리'],
  data_analyst: ['성과 데이터 분석', '트렌드 분석 리포트', 'ROI 분석'],
  research: ['경쟁사 분석', '시장 조사', '타겟 고객 리서치'],
  pr_specialist: ['보도자료 작성', '언론 대응 전략', '브랜드 이미지 관리'],
  growth_hacker: ['바이럴 전략 수립', 'A/B 테스트 제안', '전환율 최적화'],
  qa_reviewer: ['콘텐츠 품질 검토', '브랜드 가이드 준수 확인', '최종 검토'],
};

export default function TaskAssignModal({ agentId, onAssign }: TaskAssignModalProps) {
  const [taskInput, setTaskInput] = useState('');
  const closeModal = useUIStore((s) => s.closeModal);
  const agents = useAgentStore((s) => s.agents);

  const agent = agents[agentId];
  if (!agent) return null;

  const config = agent.config;
  const suggestions = SUGGESTED_TASKS[config.role] || [];

  const handleSubmit = () => {
    if (taskInput.trim()) {
      onAssign(taskInput.trim(), agentId);
      closeModal();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setTaskInput(suggestion);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70">
      <div className="w-[480px] bg-[#0d0d1a] border-2 border-[#7B68EE] rounded-lg font-mono text-xs overflow-hidden shadow-2xl shadow-[#7B68EE]/20">
        {/* Header */}
        <div
          className="px-4 py-3 border-b-2 flex items-center justify-between"
          style={{ borderColor: config.color, backgroundColor: config.color + '22' }}
        >
          <div>
            <div className="text-white font-bold text-sm">
              {config.emoji} {config.name}
            </div>
            <div className="text-gray-400">{config.title}</div>
          </div>
          <span
            className="px-2 py-1 rounded text-[10px]"
            style={{
              backgroundColor: agent.status === 'idle' ? '#27AE6033' : '#E74C3C33',
              color: agent.status === 'idle' ? '#27AE60' : '#E74C3C',
            }}
          >
            상태: {agent.status === 'idle' ? '대기중' : agent.status}
          </span>
        </div>

        {/* Body */}
        <div className="p-4">
          <label className="text-gray-300 block mb-2">📝 새 태스크 입력:</label>
          <textarea
            value={taskInput}
            onChange={(e) => setTaskInput(e.target.value)}
            placeholder="예: 신제품 X 런칭 마케팅 전략을 수립해줘"
            className="w-full h-20 px-3 py-2 bg-[#1a1a2e] border-2 border-[#333] rounded text-white text-sm focus:border-[#7B68EE] focus:outline-none resize-none placeholder-gray-600"
            autoFocus
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            onKeyUp={(e) => e.stopPropagation()}
            onKeyPress={(e) => e.stopPropagation()}
          />

          {/* Suggestions */}
          <div className="mt-3">
            <span className="text-gray-400">💡 추천 태스크:</span>
            <div className="mt-2 space-y-1">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleSuggestionClick(s)}
                  className="block w-full text-left px-3 py-1.5 text-gray-300 bg-[#1a1a2e] rounded hover:bg-[#2a2a3e] hover:text-white transition-colors"
                >
                  ├── &quot;{s}&quot;
                </button>
              ))}
            </div>
          </div>

          {/* Skills */}
          <div className="mt-3 flex flex-wrap gap-1">
            {config.skills.map((skill) => (
              <span
                key={skill}
                className="px-2 py-0.5 bg-[#1a1a2e] rounded text-[9px] text-gray-400"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-[#0a0a15] border-t border-[#222] flex justify-between items-center">
          <span className="text-gray-500">[Enter: 할당] [Esc: 취소]</span>
          <div className="flex gap-2">
            <button
              onClick={closeModal}
              className="px-4 py-2 bg-[#333] text-gray-300 rounded hover:bg-[#444] transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleSubmit}
              disabled={!taskInput.trim()}
              className="px-4 py-2 bg-[#4A7C59] text-white rounded hover:bg-[#5a8c69] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-bold"
            >
              ✅ 할당
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
