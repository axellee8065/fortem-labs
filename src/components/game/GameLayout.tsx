'use client';

import { useState, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import StatusBar from '@/components/hud/StatusBar';
import ChatPanel from '@/components/hud/ChatPanel';
import TaskPanel from '@/components/hud/TaskPanel';
import InteractionHint from '@/components/hud/InteractionHint';
import TaskAssignModal from '@/components/modals/TaskAssignModal';
import ApprovalModal from '@/components/modals/ApprovalModal';
import GuideModal from '@/components/modals/GuideModal';
import { useUIStore } from '@/stores/uiStore';
import { useTaskStore } from '@/stores/taskStore';
import { useAgentStore } from '@/stores/agentStore';
import { executeTask } from '@/lib/agentOrchestrator';

// Dynamic import for Phaser (no SSR)
const GameCanvas = dynamic(() => import('./GameCanvas'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[#1a1a2e]">
      <div className="text-[#FFD700] font-mono animate-pulse">Loading Game Engine...</div>
    </div>
  ),
});

export default function GameLayout() {
  const activeModal = useUIStore((s) => s.activeModal);
  const openModal = useUIStore((s) => s.openModal);
  const closeModal = useUIStore((s) => s.closeModal);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [pendingApprovalTaskId, setPendingApprovalTaskId] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(() => {
    if (typeof window === 'undefined') return true;
    return !localStorage.getItem('fortem-guide-seen');
  });
  const tasks = useTaskStore((s) => s.tasks);

  // Handle agent interaction (E key press near agent)
  const handleAgentInteract = useCallback(
    (agentId: string) => {
      setSelectedAgentId(agentId);
      openModal('task_assign');
    },
    [openModal]
  );

  // Handle task assignment
  const handleTaskAssign = useCallback(
    async (taskDescription: string, agentId: string) => {
      closeModal();
      const taskId = await executeTask(taskDescription, agentId);
      if (taskId) {
        // Wait for task completion, then show approval modal
        const checkApproval = setInterval(() => {
          const task = useTaskStore.getState().tasks[taskId];
          if (task && task.status === 'awaiting_approval') {
            clearInterval(checkApproval);
            setPendingApprovalTaskId(taskId);
            openModal('approval');
          }
        }, 1000);
      }
    },
    [closeModal, openModal]
  );

  // Handle approval
  const handleApprove = useCallback(() => {
    if (pendingApprovalTaskId) {
      useTaskStore.getState().updateTaskStatus(pendingApprovalTaskId, 'approved');
      useTaskStore.getState().addMessage({
        taskId: pendingApprovalTaskId,
        agentRole: 'ceo',
        content: '[APPROVED] ✅ 태스크가 승인되었습니다! 게시를 진행합니다.',
        messageType: 'system',
      });
      setPendingApprovalTaskId(null);
    }
  }, [pendingApprovalTaskId]);

  const handleReject = useCallback(() => {
    if (pendingApprovalTaskId) {
      useTaskStore.getState().updateTaskStatus(pendingApprovalTaskId, 'rejected');
      useTaskStore.getState().addMessage({
        taskId: pendingApprovalTaskId,
        agentRole: 'ceo',
        content: '[REJECTED] ❌ 태스크가 거절되었습니다.',
        messageType: 'system',
      });
      setPendingApprovalTaskId(null);
    }
  }, [pendingApprovalTaskId]);

  const handleRevise = useCallback(
    (feedback: string) => {
      if (pendingApprovalTaskId) {
        useTaskStore.getState().updateTaskStatus(pendingApprovalTaskId, 'processing');
        useTaskStore.getState().addMessage({
          taskId: pendingApprovalTaskId,
          agentRole: 'ceo',
          content: `[REVISION] 🔄 수정 요청: "${feedback}"`,
          messageType: 'system',
        });
        setPendingApprovalTaskId(null);
      }
    },
    [pendingApprovalTaskId]
  );

  // Keyboard shortcut for Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeModal) {
        closeModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeModal, closeModal]);

  const isTaskPanelOpen = useUIStore((s) => s.openPanels.has('task'));

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#1a1a2e]">
      {/* HUD Layer (React) - TaskPanel on left */}
      <TaskPanel />

      {/* Game Canvas - offset when task panel is open */}
      <div
        className="absolute top-0 bottom-0 right-0 transition-all duration-300"
        style={{ left: isTaskPanelOpen ? '320px' : '0px' }}
      >
        <GameCanvas onAgentInteract={handleAgentInteract} />
      </div>

      {/* Other HUD */}
      <StatusBar onShowGuide={() => setShowGuide(true)} />
      <ChatPanel />
      <InteractionHint />

      {/* Modals */}
      {activeModal === 'task_assign' && selectedAgentId && (
        <TaskAssignModal
          agentId={selectedAgentId}
          onAssign={handleTaskAssign}
        />
      )}

      {activeModal === 'approval' && pendingApprovalTaskId && (
        <ApprovalModal
          taskId={pendingApprovalTaskId}
          onApprove={handleApprove}
          onReject={handleReject}
          onRevise={handleRevise}
        />
      )}

      {/* Guide Modal */}
      {showGuide && (
        <GuideModal onClose={() => {
          setShowGuide(false);
          localStorage.setItem('fortem-guide-seen', 'true');
        }} />
      )}

      {/* Controls hint */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-30 px-3 py-1 bg-[#1a1a2e]/80 rounded font-mono text-[10px] text-gray-500">
        WASD / Arrow Keys: 이동 | E: 상호작용 | ESC: 취소
      </div>
    </div>
  );
}
