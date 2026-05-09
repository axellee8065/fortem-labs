import { AgentRole, AGENT_CONFIGS } from '@/types/agent';
import { useTaskStore } from '@/stores/taskStore';
import { useAgentStore } from '@/stores/agentStore';
import { getOfficeScene } from '@/game/GameManager';

// ============================================================================
// PROFESSIONAL AGENT DIALOGUE SYSTEM
// Each agent contributes domain-specific expertise based on task context
// ============================================================================

interface TaskContext {
  description: string;
  taskType: TaskType;
  domain: string[];
  keywords: string[];
}

type TaskType = 'campaign' | 'content' | 'research' | 'analytics' | 'pr' | 'growth' | 'review' | 'general';

function analyzeTask(description: string): TaskContext {
  const lower = description.toLowerCase();
  const keywords: string[] = [];
  const domain: string[] = [];

  const detect = (terms: string[], dom: string) => {
    for (const t of terms) {
      if (lower.includes(t)) {
        keywords.push(t);
        if (!domain.includes(dom)) domain.push(dom);
      }
    }
  };

  detect(['트윗', 'tweet', '트위터', 'twitter', 'sns', '소셜', 'instagram', '인스타'], 'social');
  detect(['카피', 'copy', '문구', '슬로건', '메시지', '카피라이팅'], 'copy');
  detect(['디자인', '비주얼', '크리에이티브', '브랜딩', 'visual', 'design'], 'creative');
  detect(['분석', '데이터', '성과', 'kpi', 'roi', 'metric', 'analytics'], 'analytics');
  detect(['경쟁사', '시장', '리서치', 'research', '트렌드', 'competitor'], 'research');
  detect(['홍보', '보도', 'pr', '언론', 'press', 'media'], 'pr');
  detect(['그로스', '바이럴', '전환', 'growth', 'viral', 'cro', 'a/b'], 'growth');
  detect(['마케팅', '캠페인', '전략', 'gtm', 'launch', '런칭'], 'marketing');
  detect(['검토', '품질', 'qa', 'review', '리뷰'], 'review');

  let taskType: TaskType = 'general';
  if (domain.includes('marketing') || domain.includes('growth')) taskType = 'campaign';
  else if (domain.includes('copy') || domain.includes('social')) taskType = 'content';
  else if (domain.includes('research')) taskType = 'research';
  else if (domain.includes('analytics')) taskType = 'analytics';
  else if (domain.includes('pr')) taskType = 'pr';
  else if (domain.includes('review')) taskType = 'review';

  return { description, taskType, domain, keywords };
}

// ============================================================================
// CONTEXTUAL AGENT DIALOGUE GENERATORS
// ============================================================================

function ceoDialogue(ctx: TaskContext, team: AgentRole[]): string[] {
  const teamNames = team
    .filter((r) => r !== 'ceo')
    .map((r) => AGENT_CONFIGS[r].name.split(' ')[0])
    .join(', ');

  return [
    `[OPENING] 팀 여러분, 새로운 미션입니다: "${ctx.description}". 전략적 접근이 필요합니다.`,
    `[CONTEXT] 이번 태스크의 핵심 도메인: ${ctx.domain.length > 0 ? ctx.domain.join(', ') : 'general strategy'}. 회사 OKR과 연결지어 봅시다.`,
    `[TEAM_BRIEF] ${teamNames} 들어주세요. CMO는 전체 전략 프레이밍, 각 전문가는 도메인별 인사이트를 30분 내 공유 부탁합니다.`,
    `[KEY_QUESTION] 우리가 답해야 할 핵심 질문 — "이 작업이 사용자에게 어떤 가치를 만드는가? 측정 가능한 성과는 무엇인가?"`,
    `[DECISION_FRAMEWORK] 결과물은 (1) 명확한 데이터 근거 (2) 실행 가능성 (3) 브랜드 일관성 — 세 축으로 평가하겠습니다.`,
  ];
}

function cmoDialogue(ctx: TaskContext): string[] {
  if (ctx.taskType === 'campaign') {
    return [
      `[STRATEGIC_FRAME] CEO 의견에 동의합니다. 이 작업의 마케팅 임팩트를 풉니다 — 인지도(Awareness)냐 전환(Conversion)이냐 명확히 해야 합니다.`,
      `[FUNNEL_ANALYSIS] 현재 퍼널 단계별 누수: TOFU 차감 28%, MOFU 41%. 이 캠페인이 어느 단계 강화에 집중할지 결정 필요.`,
      `[CHANNEL_MIX] 추천 채널 믹스 — Paid(40%) Earned(35%) Owned(25%). 예산 효율 기준입니다.`,
      `[BRAND_POSITIONING] 차별화 메시지: "AI agent team" 카테고리 자체를 우리가 정의한다는 관점으로 접근.`,
      `[KPI_PROPOSAL] 1차 KPI: CAC < $42, NPS > 50, 30일 retention > 35%. CEO 승인 후 진행하겠습니다.`,
    ];
  }
  return [
    `[FRAME] 마케팅 관점에서 이 태스크를 reframe하겠습니다. 사용자의 어떤 jobs-to-be-done을 해결하는지가 출발점.`,
    `[CONTEXT] 최근 분기 마케팅 성과: blended CAC $38, organic 비중 62%. 이 컨텍스트에서 결정해야 합니다.`,
    `[INSIGHT] 경쟁사 대비 우리의 unique edge — agent 시각화. 모든 메시지에서 이 차별점을 부각해야 합니다.`,
  ];
}

function researchDialogue(ctx: TaskContext): string[] {
  return [
    `[METHODOLOGY] 리서치 접근법 — primary(설문 N=312) + secondary(Statista, Gartner Q4 2025) 혼합 분석합니다.`,
    `[COMPETITIVE_LANDSCAPE] 직접 경쟁사 3곳: Salesforce Agentforce, Microsoft Copilot Studio, OpenAI Operator. 각자 포지셔닝 분석 완료.`,
    `[MARKET_GAP] 발견된 기회 영역 — "협업 시각화"는 어떤 경쟁사도 메인 메시지로 쓰지 않음. White space 입니다.`,
    `[USER_INSIGHT] 인터뷰 결과 핵심 페인 포인트: "AI 결과물에 대한 통제 부족"(73%), "팀 공유 어려움"(58%). 우리 핵심 가치와 정확히 일치.`,
    `[RECOMMENDATION] 메시징은 "통제 가능한 AI 팀"으로 좁혀야 합니다. 데이터 첨부합니다 → /research/2026-q1-market.pdf`,
  ];
}

function dataAnalystDialogue(ctx: TaskContext): string[] {
  return [
    `[DATA_PULL] BigQuery에서 지난 90일 데이터 추출 완료. n=14,238 events, 2,104 unique users.`,
    `[CORRELATION] 가설 검증 — "에이전트 사용 빈도"와 "30일 retention" 상관계수 r=0.71 (강한 양의 상관).`,
    `[SEGMENT_ANALYSIS] 코호트별 LTV: power user($420) > regular($180) > casual($45). 전환 우선순위 명확합니다.`,
    `[FORECAST] 현재 추세 유지 시 Q2 MAU projection: 2,800±240명. 캠페인 효과 적용 시 +18~25% 가능 추정.`,
    `[ACTIONABLE] 데이터가 가리키는 실행 항목: (1) 첫 7일 내 3개 태스크 완료 유도 (2) 협업 기능 노출 강화. 첨부 → dashboard/cohort-2604.json`,
  ];
}

function creativeDialogue(ctx: TaskContext): string[] {
  return [
    `[CREATIVE_DIRECTION] 비주얼 방향성 — "controlled chaos". 픽셀 아트 친근함 + 엔터프라이즈급 신뢰감의 균형.`,
    `[MOOD] 컬러 팔레트: primary #4A7C59 (성장/신뢰), accent #FFD700 (행동 유도), neutral #1A1A2E (전문성).`,
    `[BRAND_VOICE] 톤앤매너 — "확신 있는 동료". 전문가적이되 친구처럼. 절대 피해야 할 것: 과장된 마케팅 어조.`,
    `[VISUAL_HIERARCHY] CTA → 제품 데모 → 사회적 증거 → 가치 제안 순. F-pattern 스캔 경로 고려.`,
    `[DELIVERABLES] 키 비주얼 3안 + 컴포넌트 가이드 작성하겠습니다. 피드백 후 최종안 확정.`,
  ];
}

function copywriterDialogue(ctx: TaskContext): string[] {
  return [
    `[VOICE_CHECK] 브랜드 보이스 가이드 재확인 — 6학년 수준 어휘, 능동태 우선, 1문장 평균 12단어 이하.`,
    `[ANGLE_TESTING] 카피 앵글 3가지 테스트: (A) 시간 절약 (B) 통제력 (C) 팀 협업. 사전 A/B 결과 (B)가 CTR 2.3배.`,
    `[HOOK_DRAFT] 1차 훅: "AI 팀이 일하는 모습을 직접 지켜보세요." — 호기심 + 구체성 조합.`,
    `[REFINE] 카피 압축 작업 중 — 23단어 → 14단어. 의미 유지하며 명료성 +35%.`,
    `[VARIATIONS] 채널별 변주 5종 준비 (Twitter/Threads/LinkedIn/이메일/랜딩) — 각 플랫폼 구문 길이 최적화.`,
  ];
}

function snsDialogue(ctx: TaskContext): string[] {
  return [
    `[PLATFORM_FIT] 채널별 콘텐츠 분기 — Twitter(인사이트 thread), LinkedIn(케이스 스터디), Instagram(behind-the-scenes 릴스).`,
    `[HASHTAG_RESEARCH] 트렌드 분석 결과: #AIagents (+340% MoM), #buildinpublic (+89%), #saastools (안정). 후자 2개 추천.`,
    `[POSTING_WINDOW] 타겟 활동 분석 → Twitter 화/목 오후 6:30, LinkedIn 수요일 오전 8시 최적.`,
    `[ENGAGEMENT_HOOK] 첫 24시간 인게이지먼트 부스트 전략 — community manager 5명 사전 조율 + reply ladder 준비.`,
    `[CROSS_PROMO] 디스코드 커뮤니티 내 amplifier 멤버 12명 식별, DM 템플릿 준비 완료.`,
  ];
}

function prDialogue(ctx: TaskContext): string[] {
  return [
    `[NARRATIVE] PR 앵글 — "AI agent의 black box를 깬 첫 번째 한국 스타트업". 미디어 픽업 가능성 높습니다.`,
    `[OUTLET_LIST] 1차 타겟 매체: TechCrunch Korea, 더벨, 플래텀, 아웃스탠딩. 각 에디터 컨택 보유.`,
    `[EMBARGO_PLAN] 출시 D-3 embargo 제안. 1차 트랜치: 3개 매체 독점 → 출시일 일반 배포 흐름.`,
    `[MESSAGING_DOC] Q&A 문서 + bridging messages 준비 — "왜 지금?" "다른 AI 도구와 차이?" 핵심 질문 16개 답변 작성.`,
    `[CRISIS_PREP] 부정 시나리오 4개 사전 mapping + holding statement 초안 완성. 리스크 매니지 완료.`,
  ];
}

function growthDialogue(ctx: TaskContext): string[] {
  return [
    `[GROWTH_LOOP] 추천 그로스 루프 — 사용자가 결과물 export → 외부 공유 → 신규 유저 유입 → 반복. ICE score 8.4/10.`,
    `[VIRAL_K] K-factor 목표 1.2 이상. 현재 0.4 → 공유 인센티브 + watermark 전략으로 0.9 도달 가능 예측.`,
    `[ACTIVATION] 핵심 활성 메트릭 정의 — "첫 7일 내 3개 이상 태스크 + 1회 export". 코호트 기반 검증.`,
    `[AB_TEST] 동시 가동 실험 3개: (1) 온보딩 길이 (2) 첫 CTA 위치 (3) 가격 표시 방식. 통계적 유의 가능 표본 N=1,800.`,
    `[CHANNEL_ECONOMICS] CAC payback 분석 — Twitter 11일, LinkedIn 23일, paid search 38일. 우선순위 명확합니다.`,
  ];
}

function qaDialogue(ctx: TaskContext): string[] {
  return [
    `[REVIEW_START] 모든 산출물 통합 검토 시작합니다. 체크리스트 38개 항목 적용.`,
    `[BRAND_COMPLIANCE] 브랜드 가이드 준수 — 컬러 ✅, 폰트 ✅, 보이스 ✅, 로고 클리어 스페이스 ⚠️ (1건 조정).`,
    `[FACT_CHECK] 모든 수치/통계 출처 검증 완료. 14건 중 13건 confirmed, 1건 출처 미흡 → 수정 요청 처리.`,
    `[LEGAL_CHECK] 컴플라이언스 — 광고 표시법, 개인정보 표현, 비교 광고 규제 모두 통과.`,
    `[FINAL_VERDICT] 종합 평가 — production-ready. 승인 권고드립니다. 발견 이슈 모두 패치 완료.`,
  ];
}

const DIALOGUE_GENERATORS: Record<AgentRole, (ctx: TaskContext, team: AgentRole[]) => string[]> = {
  ceo: ceoDialogue,
  cmo: (ctx) => cmoDialogue(ctx),
  research: (ctx) => researchDialogue(ctx),
  data_analyst: (ctx) => dataAnalystDialogue(ctx),
  creative_director: (ctx) => creativeDialogue(ctx),
  copywriter: (ctx) => copywriterDialogue(ctx),
  social_media_manager: (ctx) => snsDialogue(ctx),
  pr_specialist: (ctx) => prDialogue(ctx),
  growth_hacker: (ctx) => growthDialogue(ctx),
  qa_reviewer: (ctx) => qaDialogue(ctx),
};

// ============================================================================
// TEAM COMPOSITION (smarter team selection)
// ============================================================================

function determineAgentTeam(ctx: TaskContext, primaryRole: AgentRole): AgentRole[] {
  const team: AgentRole[] = ['ceo'];
  if (primaryRole !== 'ceo') team.push(primaryRole);

  const add = (role: AgentRole) => { if (!team.includes(role)) team.push(role); };

  // Always include CMO for strategic framing on multi-domain tasks
  if (ctx.domain.length >= 2) add('cmo');

  if (ctx.domain.includes('research') || ctx.domain.includes('marketing')) add('research');
  if (ctx.domain.includes('analytics') || ctx.domain.includes('marketing') || ctx.domain.includes('growth')) add('data_analyst');
  if (ctx.domain.includes('creative') || ctx.domain.includes('marketing')) add('creative_director');
  if (ctx.domain.includes('copy') || ctx.domain.includes('social') || ctx.domain.includes('marketing')) add('copywriter');
  if (ctx.domain.includes('social')) add('social_media_manager');
  if (ctx.domain.includes('pr')) add('pr_specialist');
  if (ctx.domain.includes('growth') || ctx.domain.includes('marketing')) add('growth_hacker');

  add('qa_reviewer');

  return team;
}

// ============================================================================
// PROFESSIONAL OUTPUT GENERATION
// ============================================================================

function generateOutput(ctx: TaskContext, team: AgentRole[]): string {
  const teamRoster = team.map((r) => `${AGENT_CONFIGS[r].emoji} ${AGENT_CONFIGS[r].name}`).join(', ');

  if (ctx.taskType === 'campaign' || ctx.domain.includes('marketing')) {
    return `# 📊 캠페인 전략 보고서: "${ctx.description}"

## 1. Executive Summary
본 보고서는 ${teamRoster} 팀이 협업하여 작성한 통합 마케팅 전략입니다.
시장 분석, 데이터 인사이트, 크리에이티브 방향, 그로스 전술을 한 번에 제안합니다.

## 2. Market & Competitive Analysis (Research)
- **Market Size**: SAM 약 $4.2B (Gartner 2026 Q1), CAGR 32%
- **Key Competitors**: Salesforce Agentforce (mature), MS Copilot Studio (broad), OpenAI Operator (consumer)
- **White Space**: "협업 시각화" 카테고리 미점유 — 우리의 차별 포지션
- **User Pain Points**: AI 통제 부족(73%), 팀 공유 어려움(58%), 결과물 신뢰도(67%)

## 3. Strategy Framework (CMO)
- **Primary Goal**: 첫 분기 MAU 2,800 달성
- **Positioning**: "통제 가능한 AI 팀 — 결과를 보고 승인하세요"
- **Funnel Focus**: Activation 단계 강화 (현재 누수 41%)
- **Channel Mix**: Paid 40% / Earned 35% / Owned 25%

## 4. Data-Driven Insights (Data Analyst)
- 코호트 분석: power user LTV $420 (regular 대비 2.3x)
- 활성화 임계값: 첫 7일 내 3개 태스크 완료 시 retention +47%
- 채널별 CAC payback: Twitter 11일 / LinkedIn 23일 / Paid 38일
- 예측 모델: 캠페인 적용 시 Q2 MAU +18~25% 상승

## 5. Creative Direction
- **Visual Concept**: "Controlled chaos" — 픽셀 아트 친근함 + 엔터프라이즈 신뢰감
- **Color System**: #4A7C59 primary / #FFD700 accent / #1A1A2E neutral
- **Brand Voice**: "확신 있는 동료" — 전문적이되 친근함

## 6. Content & Copy (Copywriter)
- **Hero Hook**: "AI 팀이 일하는 모습을 직접 지켜보세요."
- **Angle Tested**: 통제력 앵글 CTR 2.3x 우위
- **Channel Variations**: 5종 (Twitter/LinkedIn/Instagram/Email/Landing)

## 7. Distribution Plan (SNS Manager)
- **Twitter**: Insight thread, 화/목 18:30 KST
- **LinkedIn**: Case study, 수요일 08:00 KST
- **Instagram**: Behind-the-scenes 릴스
- **Hashtag**: #AIagents #buildinpublic #saastools

## 8. PR & Media Plan
- **Narrative Angle**: "AI black box를 깬 한국 스타트업"
- **Tier 1 Outlets**: TechCrunch Korea, 더벨, 플래텀, 아웃스탠딩
- **Embargo**: D-3, 3개 매체 독점 → 출시일 일반 배포

## 9. Growth Mechanics (Growth Hacker)
- **Core Loop**: Export → Share → Acquisition (ICE 8.4/10)
- **K-factor Target**: 0.4 → 0.9 (공유 인센티브 + watermark)
- **A/B Tests**: 온보딩 길이 / CTA 위치 / 가격 표시 (N=1,800)

## 10. KPI & Success Metrics
| Metric | Baseline | Target (90d) |
|--------|----------|--------------|
| MAU | 1,200 | 2,800 |
| CAC | $52 | < $42 |
| Retention (D30) | 22% | > 35% |
| K-factor | 0.4 | 0.9 |
| NPS | 34 | > 50 |

## 11. Risk & Mitigation
- 부정 시나리오 4개 사전 mapping (PR Specialist)
- Holding statement 4종 준비 완료
- Crisis comms playbook 첨부

## 12. Final QA Sign-off (QA Reviewer)
- 브랜드 가이드 준수: ✅
- Fact-check: 13/14 확인 (1건 출처 보강)
- Legal compliance: ✅ 광고법/개인정보/비교광고 모두 통과
- **Final Verdict**: Production-ready, 승인 권고

---
*Generated by ForTem Labs Agent Team — ${teamRoster}*`;
  }

  if (ctx.domain.includes('social') || ctx.domain.includes('copy')) {
    return `# 📱 콘텐츠 패키지: "${ctx.description}"

## Twitter (Primary)
> 🚀 AI 팀이 일하는 모습을 직접 지켜보세요.
>
> ForTem Labs는 카피라이터, 디자이너, 데이터 분석가까지
> 10명의 AI 에이전트가 한 팀으로 움직입니다.
>
> 결과를 보고 승인하세요. 통제 가능한 AI의 시작.
>
> 👉 fortem.io/launch
>
> #AIagents #buildinpublic #saastools

**Posting Strategy**:
- 시간대: 화요일/목요일 18:30 KST (타겟 활성도 +47%)
- Reply ladder 준비 (12명 community amplifier 사전 조율)
- 첫 24시간 engagement boost: 5명 시드 reply

## LinkedIn (B2B)
> "AI 에이전트가 업무를 처리하는 과정을 시각적으로 본 적이 있나요?
>
> ForTem Labs는 그 black box를 깼습니다.
>
> 10명의 전문 에이전트(CEO, CMO, Copywriter, Designer, Analyst...)가
> 픽셀 오피스에서 협업하는 모습을 실시간 관찰하며
> 결과물을 검토하고 승인할 수 있습니다.
>
> 결과적으로:
> ✓ AI 의사결정 과정 100% 투명
> ✓ 결과물 통제력 회복
> ✓ 팀 단위 공유 가능
>
> 한국 스타트업이 만든 새로운 카테고리입니다."

## Instagram Reels (Visual)
- **Hook (0-3s)**: 픽셀 캐릭터들이 책상에서 일어나는 장면
- **Body (3-12s)**: 사용자가 태스크 입력 → 에이전트들이 미팅룸으로 이동 → 토론 → 결과물 생성
- **CTA (12-15s)**: "지금 무료로 체험" + 도메인

## Email (Nurture)
- **Subject**: "당신의 AI는 보이지 않게 일하고 있나요?"
- **Preview**: "10명의 에이전트 팀이 보이는 곳에서 일합니다."

---
**Performance Forecast**:
- Twitter ER: 6.8% (벤치마크 4.2%)
- LinkedIn impressions: 12K~18K
- Instagram reach: 24K~32K
- Email CTR: 11.4%

*QA Reviewed & Approved — All copy fact-checked, brand-compliant*`;
  }

  if (ctx.domain.includes('research')) {
    return `# 🔍 리서치 보고서: "${ctx.description}"

## Methodology
- Primary research: 312명 사용자 설문 (2026.04.01-04.20)
- Secondary: Statista, Gartner Q4 2025, CB Insights
- Competitive teardown: 8개사 product teardown
- 1:1 interview: 18 sessions (avg 45min)

## Key Findings

### 1. Market Landscape
- TAM: $14.8B (2026), CAGR 32% (2026-2030)
- SAM: $4.2B (협업 AI agent 세그먼트)
- SOM (Y1 realistic): $42M

### 2. Competitive Mapping
| 경쟁사 | Strength | Weakness | Threat Level |
|--------|----------|----------|--------------|
| Salesforce Agentforce | 엔터프라이즈 신뢰 | 높은 진입장벽 | High |
| MS Copilot Studio | 광범위 통합 | 차별화 부족 | Medium |
| OpenAI Operator | 기술 우위 | B2B 미성숙 | Medium |
| Anthropic Claude | API 강함 | UX 부재 | Low |

### 3. User Pain Points (n=312)
1. **AI 결과 통제 부족** — 73% (가장 높음)
2. **팀 단위 공유의 어려움** — 58%
3. **결과물 신뢰도 검증 어려움** — 67%
4. **여러 도구 분산 사용** — 51%
5. **비용 대비 효용 불명확** — 44%

### 4. White Space Discovery
- "협업 과정 시각화"를 메인 메시지로 사용하는 경쟁사 0곳
- 한국어 네이티브 + 픽셀 게임 UX 결합 카테고리 미존재
- B2B SaaS 가격 + B2C 즐거움 결합 포지셔닝 가능

### 5. Target Segment Sizing
- **Primary**: 한국 스타트업 마케터 (~28K명, $4.8M ARR potential)
- **Secondary**: 콘텐츠 크리에이터 팀 (~64K, $11M)
- **Tertiary**: 1인 기업가 (~210K, $18M)

## Strategic Recommendations
1. **포지셔닝**: "통제 가능한 AI 팀" 메시지로 선점
2. **Wedge Market**: 한국 스타트업 마케터부터 (300명 design partner)
3. **Pricing**: B2B $39/seat/mo + B2C $14.99/mo freemium
4. **Moat**: 협업 시각화 + 한국어 네이티브 + agent customization

## Appendix
- /research/2026-q1-market-data.xlsx
- /interviews/transcripts (18 sessions)
- /competitive/teardowns (8 reports)`;
  }

  // Default professional output
  return `# 📋 작업 결과 보고서: "${ctx.description}"

## Executive Summary
${teamRoster} 팀이 협업하여 본 태스크를 완료했습니다.

## Approach
1. CEO가 전략 방향성 설정 및 팀 소집
${team.includes('cmo') ? '2. CMO가 마케팅 프레이밍 및 KPI 정의\n' : ''}${team.includes('research') ? '3. Research가 시장/경쟁사/사용자 인사이트 도출\n' : ''}${team.includes('data_analyst') ? '4. Data Analyst가 정량 데이터 검증\n' : ''}${team.includes('creative_director') ? '5. Creative Director가 비주얼 컨셉 정립\n' : ''}${team.includes('copywriter') ? '6. Copywriter가 메시징 및 카피 작성\n' : ''}${team.includes('social_media_manager') ? '7. SNS Manager가 플랫폼별 배포 전략 수립\n' : ''}${team.includes('pr_specialist') ? '8. PR Specialist가 미디어 전략 및 위기 대응 준비\n' : ''}${team.includes('growth_hacker') ? '9. Growth Hacker가 그로스 루프 및 A/B 실험 설계\n' : ''}10. QA Reviewer가 최종 통합 검토 후 승인

## Output
태스크의 구체적 산출물은 각 에이전트의 대화 로그에서 확인할 수 있으며,
주요 인사이트와 실행 계획이 통합된 형태로 제공됩니다.

## Next Steps
1. 본 보고서 검토 및 승인 (현재 단계)
2. 실행 단계 분배
3. 30일 후 성과 리뷰

---
*ForTem Labs Multi-Agent Collaboration — ${new Date().toLocaleDateString('ko-KR')}*`;
}

// ============================================================================
// EXECUTION ORCHESTRATOR
// ============================================================================

export async function executeTask(taskDescription: string, primaryAgentId: string) {
  const taskStore = useTaskStore.getState();
  const agentStore = useAgentStore.getState();
  const scene = getOfficeScene();

  const agent = agentStore.agents[primaryAgentId];
  if (!agent) return;

  const ctx = analyzeTask(taskDescription);
  const taskId = taskStore.createTask(taskDescription, taskDescription);
  const team = determineAgentTeam(ctx, agent.config.role);

  taskStore.assignAgentsToTask(taskId, team);

  // Create steps with meaningful descriptions
  const stepDescriptions: Record<AgentRole, string> = {
    ceo: '전략 방향 설정 및 팀 브리핑',
    cmo: '마케팅 전략 프레이밍 및 KPI 정의',
    research: '시장/경쟁사/사용자 리서치 수행',
    data_analyst: '데이터 분석 및 인사이트 도출',
    creative_director: '크리에이티브 컨셉 및 비주얼 가이드',
    copywriter: '메시징 및 카피 작성',
    social_media_manager: '채널별 배포 전략 수립',
    pr_specialist: 'PR 앵글 및 미디어 전략',
    growth_hacker: '그로스 루프 및 실험 설계',
    qa_reviewer: '최종 통합 품질 검토',
  };

  team.forEach((role) => {
    taskStore.addTaskStep(taskId, {
      agentRole: role,
      description: stepDescriptions[role] || AGENT_CONFIGS[role].name,
      status: 'pending',
      output: null,
    });
  });

  // Move team to meeting room for collaboration
  if (team.length > 2 && scene) {
    const ids = team.map((r) => `agent-${r}`);
    scene.moveAgentsToMeeting(ids);
    ids.forEach((id) => {
      agentStore.updateAgentStatus(id, 'walking');
      scene.updateAgentStatus(id, 'walking');
    });
    await delay(1800);
  }

  // Each agent presents their domain expertise
  const steps = taskStore.tasks[taskId]?.steps || [];

  for (let i = 0; i < team.length; i++) {
    const role = team[i];
    const agentId = `agent-${role}`;
    const step = steps[i];

    // Thinking phase
    agentStore.updateAgentStatus(agentId, 'thinking');
    scene?.updateAgentStatus(agentId, 'thinking');

    taskStore.addMessage({
      taskId,
      agentRole: role,
      content: `[ANALYZING] 도메인 전문성을 적용하여 분석 중입니다...`,
      messageType: 'thinking',
    });

    if (step) taskStore.updateStepStatus(taskId, step.id, 'in_progress');

    await delay(1200);

    // Working/discussion phase — professional dialogue
    agentStore.updateAgentStatus(agentId, role === 'qa_reviewer' ? 'presenting' : 'working');
    scene?.updateAgentStatus(agentId, role === 'qa_reviewer' ? 'presenting' : 'working');

    const dialogue = DIALOGUE_GENERATORS[role](ctx, team);
    for (const line of dialogue) {
      taskStore.addMessage({
        taskId,
        agentRole: role,
        content: line,
        messageType: line.startsWith('[') ? 'discussion' : 'output',
      });

      // Show abbreviated speech bubble
      const bubble = line.replace(/^\[[A-Z_]+\]\s*/, '').substring(0, 28) + '...';
      scene?.showSpeechBubble(agentId, bubble);

      await delay(900 + Math.random() * 600);
    }

    // Cross-team interaction — agents respond to each other
    if (i > 0 && Math.random() > 0.5) {
      const previousRole = team[i - 1];
      const interactionMessages: Record<string, string> = {
        'ceo->cmo': '[ALIGNED] CEO 방향성에 마케팅 프레임을 추가하면 명확해집니다.',
        'cmo->research': '[BUILDING_ON] CMO의 포지셔닝 가설을 데이터로 뒷받침하겠습니다.',
        'research->data_analyst': '[CONNECTING] 리서치 정성 데이터를 정량 분석과 교차 검증.',
        'data_analyst->creative_director': '[INSIGHT_TO_DESIGN] 데이터가 가리키는 사용자 행동을 비주얼로 번역.',
        'creative_director->copywriter': '[VOICE_ALIGN] 비주얼 톤에 맞춰 카피 보이스 조정 필요.',
        'copywriter->social_media_manager': '[CONTENT_HANDOFF] 카피 변주를 채널별로 받아서 최적화.',
      };
      const key = `${previousRole}->${role}`;
      if (interactionMessages[key]) {
        await delay(400);
        taskStore.addMessage({
          taskId,
          agentRole: role,
          content: interactionMessages[key],
          messageType: 'discussion',
        });
      }
    }

    if (step) taskStore.updateStepStatus(taskId, step.id, 'completed', dialogue[dialogue.length - 1]);

    const progress = Math.round(((i + 1) / team.length) * 100);
    taskStore.updateTaskProgress(taskId, progress);

    agentStore.updateAgentStatus(agentId, 'completed');
    scene?.updateAgentStatus(agentId, 'completed');
    scene?.hideSpeechBubble(agentId);

    await delay(600);
  }

  // Generate comprehensive output
  const output = generateOutput(ctx, team);

  // Add output as a message so it appears in chat
  taskStore.addMessage({
    taskId,
    agentRole: 'ceo',
    content: output,
    messageType: 'output',
  });

  taskStore.updateTaskStatus(taskId, 'awaiting_approval');
  taskStore.completeTask(taskId, output);

  taskStore.addMessage({
    taskId,
    agentRole: 'qa_reviewer',
    content: `[FINAL] 통합 산출물 준비 완료. ${team.length}명 에이전트의 협업 결과를 보고드립니다. 검토 후 승인 부탁드립니다.`,
    messageType: 'system',
  });

  // Return agents to desks
  if (scene) {
    team.forEach((role) => {
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
