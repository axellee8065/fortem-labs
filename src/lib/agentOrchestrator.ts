import { AgentRole, AGENT_CONFIGS } from '@/types/agent';
import { useTaskStore } from '@/stores/taskStore';
import { useAgentStore } from '@/stores/agentStore';
import { getOfficeScene } from '@/game/GameManager';

// Simulated agent responses for MVP (will be replaced with Claude API)
const AGENT_RESPONSES: Record<AgentRole, Record<string, string[]>> = {
  ceo: {
    default: [
      '[DIRECTIVE] 팀을 소집합니다. 이 태스크를 분석하겠습니다.',
      '[STRATEGY] 브랜드 가이드라인을 확인하고 최적의 전략을 수립합니다.',
      '[DECISION] 관련 에이전트들에게 서브태스크를 분배합니다.',
    ],
  },
  cmo: {
    default: [
      '[STRATEGY] 마케팅 관점에서 분석하겠습니다.',
      '[CHANNEL_MIX] 채널별 최적 전략을 수립 중입니다.',
      '[INSIGHT] 과거 캠페인 데이터를 기반으로 전략을 제안합니다.',
    ],
  },
  creative_director: {
    default: [
      '[CONCEPT] 비주얼 컨셉을 구상 중입니다.',
      '[BRAND] 브랜드 톤앤매너에 맞는 방향을 설정합니다.',
      '[VISUAL] 크리에이티브 가이드라인을 적용합니다.',
    ],
  },
  copywriter: {
    default: [
      '[DRAFT] 초안을 작성하고 있습니다...',
      '[TONE] 타겟 오디언스에 맞는 톤으로 조정 중입니다.',
      '[REFINE] 카피를 다듬고 있습니다. 간결하면서도 임팩트 있게.',
    ],
  },
  social_media_manager: {
    default: [
      '[OPTIMIZE] 플랫폼별 최적화를 진행합니다.',
      '[HASHTAG] 트렌드 해시태그를 분석 중입니다.',
      '[TIMING] 최적 포스팅 시간을 분석하고 있습니다.',
    ],
  },
  data_analyst: {
    default: [
      '[ANALYZE] 관련 데이터를 수집하고 분석 중입니다.',
      '[TREND] 최근 트렌드를 파악하고 있습니다.',
      '[REPORT] 분석 결과를 정리 중입니다.',
    ],
  },
  research: {
    default: [
      '[RESEARCH] 시장 조사를 시작합니다.',
      '[COMPETITOR] 경쟁사 동향을 분석 중입니다.',
      '[INSIGHT] 타겟 고객 인사이트를 도출합니다.',
    ],
  },
  pr_specialist: {
    default: [
      '[PR] 홍보 전략을 수립합니다.',
      '[MEDIA] 미디어 채널별 접근 방식을 분석합니다.',
      '[DRAFT] 보도자료/공지사항 초안을 작성합니다.',
    ],
  },
  growth_hacker: {
    default: [
      '[GROWTH] 그로스 전략을 분석합니다.',
      '[VIRAL] 바이럴 포인트를 식별 중입니다.',
      '[CRO] 전환율 최적화 방안을 수립합니다.',
    ],
  },
  qa_reviewer: {
    default: [
      '[REVIEW] 품질 검토를 시작합니다.',
      '[CHECK] 브랜드 가이드라인 준수 여부를 확인합니다.',
      '[APPROVE] 최종 검토를 완료했습니다.',
    ],
  },
};

// Determine which agents should be involved in a task
function determineAgentTeam(taskDescription: string, primaryRole: AgentRole): AgentRole[] {
  const team: AgentRole[] = ['ceo']; // CEO always leads

  if (primaryRole !== 'ceo') {
    team.push(primaryRole);
  }

  const lower = taskDescription.toLowerCase();

  if (lower.includes('트윗') || lower.includes('tweet') || lower.includes('sns') || lower.includes('소셜')) {
    if (!team.includes('copywriter')) team.push('copywriter');
    if (!team.includes('social_media_manager')) team.push('social_media_manager');
  }
  if (lower.includes('마케팅') || lower.includes('캠페인') || lower.includes('전략')) {
    if (!team.includes('cmo')) team.push('cmo');
  }
  if (lower.includes('디자인') || lower.includes('비주얼') || lower.includes('크리에이티브')) {
    if (!team.includes('creative_director')) team.push('creative_director');
  }
  if (lower.includes('분석') || lower.includes('데이터') || lower.includes('성과')) {
    if (!team.includes('data_analyst')) team.push('data_analyst');
  }
  if (lower.includes('경쟁사') || lower.includes('시장') || lower.includes('리서치')) {
    if (!team.includes('research')) team.push('research');
  }
  if (lower.includes('홍보') || lower.includes('보도') || lower.includes('pr')) {
    if (!team.includes('pr_specialist')) team.push('pr_specialist');
  }
  if (lower.includes('그로스') || lower.includes('바이럴') || lower.includes('전환')) {
    if (!team.includes('growth_hacker')) team.push('growth_hacker');
  }

  // Always add QA at the end
  if (!team.includes('qa_reviewer')) team.push('qa_reviewer');

  return team;
}

function generateOutput(taskDescription: string, agents: AgentRole[]): string {
  const lower = taskDescription.toLowerCase();

  if (lower.includes('트윗') || lower.includes('tweet')) {
    return `📱 Twitter Draft:

🚀 새로운 시작을 알립니다!

ForTem이 준비한 특별한 소식,
지금 바로 확인하세요 ✨

더 스마트하게, 더 빠르게
당신의 비즈니스를 혁신합니다.

👉 자세히 보기: fortem.io/launch

#ForTem #AI혁신 #마케팅자동화

📊 예상 참여율: 6.8%
⏰ 최적 포스팅: 오후 6:00`;
  }

  if (lower.includes('마케팅') || lower.includes('전략')) {
    return `📊 마케팅 전략 보고서

1. 타겟 오디언스 분석
   - Primary: 25-35세 스타트업 마케터
   - Secondary: 소규모 팀 리더

2. 채널 전략
   - Twitter: 인사이트 공유 + 커뮤니티 빌딩
   - Discord: 깊은 유저 인게이지먼트
   - LinkedIn: B2B 리드 제네레이션

3. 핵심 메시지
   "AI 에이전트 팀이 당신의 마케팅을 혁신합니다"

4. KPI
   - 월간 활성 유저: 1,000명
   - 전환율: 5%
   - NPS: 50+`;
  }

  return `📋 태스크 완료 보고서

태스크: ${taskDescription}

담당 에이전트: ${agents.map((r) => AGENT_CONFIGS[r].emoji + ' ' + AGENT_CONFIGS[r].name).join(', ')}

결과물이 준비되었습니다.
검토 후 승인해 주세요.`;
}

export async function executeTask(
  taskDescription: string,
  primaryAgentId: string
) {
  const taskStore = useTaskStore.getState();
  const agentStore = useAgentStore.getState();
  const scene = getOfficeScene();

  const agent = agentStore.agents[primaryAgentId];
  if (!agent) return;

  // 1. Create task
  const taskId = taskStore.createTask(taskDescription, taskDescription);
  const agentTeam = determineAgentTeam(taskDescription, agent.config.role);

  // 2. Assign agents
  taskStore.assignAgentsToTask(taskId, agentTeam);

  // 3. Create steps
  agentTeam.forEach((role, i) => {
    const config = AGENT_CONFIGS[role];
    taskStore.addTaskStep(taskId, {
      agentRole: role,
      description: `${config.name} - ${config.skills[0]}`,
      status: 'pending',
      output: null,
    });
  });

  // 4. Move agents to meeting room if team > 2
  if (agentTeam.length > 2 && scene) {
    const agentIds = agentTeam.map((role) => `agent-${role}`);
    scene.moveAgentsToMeeting(agentIds);
    agentIds.forEach((id) => {
      agentStore.updateAgentStatus(id, 'walking');
      scene.updateAgentStatus(id, 'walking');
    });

    await delay(2000);
  }

  // 5. Process each agent sequentially with simulated responses
  const steps = taskStore.tasks[taskId]?.steps || [];

  for (let i = 0; i < agentTeam.length; i++) {
    const role = agentTeam[i];
    const agentId = `agent-${role}`;
    const step = steps[i];

    // Update status to thinking
    agentStore.updateAgentStatus(agentId, 'thinking');
    scene?.updateAgentStatus(agentId, 'thinking');

    taskStore.addMessage({
      taskId,
      agentRole: role,
      content: `[THINKING] 태스크를 분석 중입니다...`,
      messageType: 'thinking',
    });

    if (step) {
      taskStore.updateStepStatus(taskId, step.id, 'in_progress');
    }

    await delay(1500);

    // Update status to working
    agentStore.updateAgentStatus(agentId, 'working');
    scene?.updateAgentStatus(agentId, 'working');

    // Send agent messages
    const responses = AGENT_RESPONSES[role]?.default || ['작업을 수행 중입니다.'];
    for (const response of responses) {
      taskStore.addMessage({
        taskId,
        agentRole: role,
        content: response,
        messageType: 'discussion',
      });

      scene?.showSpeechBubble(agentId, response.substring(0, 30) + '...');

      await delay(1200 + Math.random() * 800);
    }

    // Complete step
    if (step) {
      taskStore.updateStepStatus(taskId, step.id, 'completed', '완료');
    }

    // Update progress
    const progress = Math.round(((i + 1) / agentTeam.length) * 100);
    taskStore.updateTaskProgress(taskId, progress);

    // Mark agent as completed
    agentStore.updateAgentStatus(agentId, 'completed');
    scene?.updateAgentStatus(agentId, 'completed');
    scene?.hideSpeechBubble(agentId);

    await delay(500);
  }

  // 6. Generate output
  const output = generateOutput(taskDescription, agentTeam);

  // 7. Move to awaiting approval
  taskStore.updateTaskStatus(taskId, 'awaiting_approval');
  taskStore.completeTask(taskId, output);

  taskStore.addMessage({
    taskId,
    agentRole: 'qa_reviewer',
    content: `[COMPLETE] 결과물이 준비되었습니다! 검토 후 승인해 주세요.`,
    messageType: 'system',
  });

  // Return agents to desks
  if (scene) {
    agentTeam.forEach((role) => {
      const id = `agent-${role}`;
      scene.returnAgentToDesk(id);
      agentStore.updateAgentStatus(id, 'idle');
      scene.updateAgentStatus(id, 'idle');
    });
  }

  return taskId;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
