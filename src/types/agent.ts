export type AgentRole =
  | 'ceo'
  | 'cmo'
  | 'creative_director'
  | 'copywriter'
  | 'social_media_manager'
  | 'data_analyst'
  | 'research'
  | 'pr_specialist'
  | 'growth_hacker'
  | 'qa_reviewer';

export type AgentStatus =
  | 'idle'
  | 'assigned'
  | 'walking'
  | 'thinking'
  | 'working'
  | 'collaborating'
  | 'presenting'
  | 'completed'
  | 'waiting_approval';

export interface AgentConfig {
  role: AgentRole;
  name: string;
  title: string;
  emoji: string;
  color: string;
  description: string;
  deskPosition: { x: number; y: number };
  skills: string[];
}

export interface Agent {
  id: string;
  config: AgentConfig;
  status: AgentStatus;
  currentTaskId: string | null;
  position: { x: number; y: number };
  targetPosition: { x: number; y: number } | null;
  path: { x: number; y: number }[];
  speechBubble: string | null;
  energy: number;
}

export const AGENT_CONFIGS: Record<AgentRole, AgentConfig> = {
  ceo: {
    role: 'ceo',
    name: 'CEO Agent',
    title: 'Chief Executive Officer',
    emoji: '👔',
    color: '#2C3E50',
    description: '전략 총괄 및 의사결정',
    deskPosition: { x: 19, y: 18 },
    skills: ['전략 방향 설정', '태스크 분배', '최종 검토'],
  },
  cmo: {
    role: 'cmo',
    name: 'CMO Agent',
    title: 'Chief Marketing Officer',
    emoji: '📈',
    color: '#D4537E',
    description: '마케팅 전략 총괄',
    deskPosition: { x: 7, y: 26 },
    skills: ['캠페인 전략', '브랜드 포지셔닝', 'ROI 분석'],
  },
  creative_director: {
    role: 'creative_director',
    name: 'Creative Director',
    title: 'Creative Director',
    emoji: '🎨',
    color: '#E74C3C',
    description: '크리에이티브 방향',
    deskPosition: { x: 7, y: 18 },
    skills: ['비주얼 컨셉', '브랜딩', '톤앤매너'],
  },
  copywriter: {
    role: 'copywriter',
    name: 'Copywriter',
    title: 'Content Writer',
    emoji: '✍️',
    color: '#3498DB',
    description: '콘텐츠 작성',
    deskPosition: { x: 7, y: 22 },
    skills: ['카피라이팅', '트윗 작성', '공지 작성'],
  },
  social_media_manager: {
    role: 'social_media_manager',
    name: 'SNS Manager',
    title: 'Social Media Manager',
    emoji: '📱',
    color: '#9B59B6',
    description: 'SNS 운영',
    deskPosition: { x: 19, y: 22 },
    skills: ['플랫폼 최적화', '해시태그', '포스팅 타이밍'],
  },
  data_analyst: {
    role: 'data_analyst',
    name: 'Data Analyst',
    title: 'Data Analyst',
    emoji: '📊',
    color: '#1ABC9C',
    description: '데이터 분석',
    deskPosition: { x: 33, y: 14 },
    skills: ['트렌드 분석', '성과 측정', '인사이트 도출'],
  },
  research: {
    role: 'research',
    name: 'Research Agent',
    title: 'Market Researcher',
    emoji: '🔍',
    color: '#F39C12',
    description: '시장 조사',
    deskPosition: { x: 7, y: 14 },
    skills: ['경쟁사 분석', '타겟 리서치', '트렌드 모니터링'],
  },
  pr_specialist: {
    role: 'pr_specialist',
    name: 'PR Specialist',
    title: 'Public Relations',
    emoji: '📣',
    color: '#E91E63',
    description: '홍보 담당',
    deskPosition: { x: 33, y: 18 },
    skills: ['보도자료', '언론 대응', '브랜드 이미지'],
  },
  growth_hacker: {
    role: 'growth_hacker',
    name: 'Growth Hacker',
    title: 'Growth Strategist',
    emoji: '🎯',
    color: '#00BCD4',
    description: '그로스 전략',
    deskPosition: { x: 33, y: 22 },
    skills: ['바이럴 전략', 'A/B 테스트', '전환율 최적화'],
  },
  qa_reviewer: {
    role: 'qa_reviewer',
    name: 'QA Reviewer',
    title: 'Quality Assurance',
    emoji: '✅',
    color: '#27AE60',
    description: '품질 검토',
    deskPosition: { x: 33, y: 26 },
    skills: ['최종 검토', '오류 체크', '품질 보증'],
  },
};
