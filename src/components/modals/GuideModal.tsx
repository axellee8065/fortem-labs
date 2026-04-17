'use client';

import { useState } from 'react';

const kbdStyle: React.CSSProperties = {
  padding: '4px 8px',
  backgroundColor: '#2d2d4e',
  border: '1px solid #555',
  borderRadius: 4,
  color: '#FFD700',
  fontFamily: 'monospace',
  fontSize: 12,
  textAlign: 'center',
};

const PAGES = [
  {
    title: 'ForTem Labs에 오신 것을 환영합니다!',
    content: (
      <>
        <p style={{ color: '#ccc', lineHeight: 1.8, marginBottom: 12 }}>
          ForTem Labs는 <span style={{ color: '#FFD700' }}>AI 에이전트 팀</span>을 직접 지휘하는 시뮬레이션 플랫폼입니다.
        </p>
        <p style={{ color: '#aaa', lineHeight: 1.8 }}>
          당신은 <span style={{ color: '#4488ff', fontWeight: 'bold' }}>보스</span>로서 오피스를 돌아다니며
          10명의 AI 에이전트에게 태스크를 할당하고, 결과물을 승인/거절할 수 있습니다.
        </p>
        <div style={{ marginTop: 20, padding: 16, backgroundColor: '#1a1a2e', borderRadius: 8, border: '1px solid #333' }}>
          <div style={{ fontSize: 24, textAlign: 'center', marginBottom: 8 }}>🏢</div>
          <p style={{ color: '#888', textAlign: 'center', fontSize: 12 }}>
            게임처럼 재미있고, 업무에는 강력한 AI 에이전트 팀
          </p>
        </div>
      </>
    ),
  },
  {
    title: '기본 조작법',
    content: (
      <>
        <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '12px 16px', marginBottom: 16 }}>
          <kbd style={kbdStyle}>W A S D</kbd>
          <span style={{ color: '#ccc' }}>캐릭터 이동 (방향키도 가능)</span>
          <kbd style={kbdStyle}>E</kbd>
          <span style={{ color: '#ccc' }}>에이전트와 상호작용 (태스크 할당)</span>
          <kbd style={kbdStyle}>ESC</kbd>
          <span style={{ color: '#ccc' }}>모달 닫기</span>
        </div>
        <div style={{ padding: 12, backgroundColor: '#1a2e1a', borderRadius: 8, border: '1px solid #4A7C59' }}>
          <p style={{ color: '#6BCB77', fontSize: 12 }}>
            💡 에이전트 근처로 다가가면 노란색 [E] 힌트가 나타납니다
          </p>
        </div>
      </>
    ),
  },
  {
    title: '태스크 할당 방법',
    content: (
      <>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Step num={1} text="WASD로 원하는 에이전트에게 다가가세요" />
          <Step num={2} text="[E] 키를 눌러 태스크 할당 창을 엽니다" />
          <Step num={3} text="태스크 설명을 입력합니다" />
          <Step num={4} text="에이전트가 작업을 시작하면 우측 채팅에서 실시간 확인" />
          <Step num={5} text="결과물이 나오면 승인 / 거절 / 수정요청을 합니다" />
        </div>
        <div style={{ marginTop: 16, padding: 12, backgroundColor: '#1a1a2e', borderRadius: 8, border: '1px solid #333' }}>
          <p style={{ color: '#FFD700', fontSize: 12 }}>
            예시: Copywriter에게 → "트위터에 올릴 신제품 런칭 카피 작성해줘"
          </p>
        </div>
      </>
    ),
  },
  {
    title: '에이전트 팀 소개',
    content: (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <AgentCard emoji="👔" name="CEO" desc="전략 총괄, 팀 분배" color="#2C3E50" />
        <AgentCard emoji="📈" name="CMO" desc="마케팅 전략" color="#D4537E" />
        <AgentCard emoji="🎨" name="Creative" desc="비주얼, 브랜딩" color="#E74C3C" />
        <AgentCard emoji="✍️" name="Copywriter" desc="카피/콘텐츠 작성" color="#3498DB" />
        <AgentCard emoji="📱" name="SNS Manager" desc="SNS 운영" color="#9B59B6" />
        <AgentCard emoji="📊" name="Data Analyst" desc="데이터 분석" color="#1ABC9C" />
        <AgentCard emoji="🔍" name="Research" desc="시장 조사" color="#F39C12" />
        <AgentCard emoji="📣" name="PR" desc="홍보, 보도자료" color="#E91E63" />
        <AgentCard emoji="🎯" name="Growth" desc="바이럴, 전환율" color="#00BCD4" />
        <AgentCard emoji="✅" name="QA" desc="품질 검토" color="#27AE60" />
      </div>
    ),
  },
  {
    title: 'UI 안내',
    content: (
      <>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <UIItem icon="📋" label="좌측 - Task Progress" desc="현재 진행 중인 태스크의 단계별 진행 상황" />
          <UIItem icon="💬" label="우측 - Live Agent Chat" desc="에이전트들의 실시간 작업 대화 및 결과물" />
          <UIItem icon="🏢" label="상단 바" desc="크레딧, 태스크 수, 채팅 토글, 시간 표시" />
          <UIItem icon="🗺️" label="/editor" desc="오피스 맵을 자유롭게 편집하는 에디터" />
        </div>
        <div style={{ marginTop: 16, padding: 12, backgroundColor: '#2a1a2a', borderRadius: 8, border: '1px solid #7B68EE' }}>
          <p style={{ color: '#7B68EE', fontSize: 12 }}>
            💡 상단 바의 Tasks / Chat 버튼으로 패널을 열고 닫을 수 있습니다
          </p>
        </div>
      </>
    ),
  },
];

function Step({ num, text }: { num: number; text: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <span style={{
        width: 28, height: 28, borderRadius: '50%',
        backgroundColor: '#4A7C59', color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 'bold', fontSize: 13, flexShrink: 0,
      }}>{num}</span>
      <span style={{ color: '#ccc', fontSize: 13 }}>{text}</span>
    </div>
  );
}

function AgentCard({ emoji, name, desc, color }: { emoji: string; name: string; desc: string; color: string }) {
  return (
    <div style={{
      padding: '8px 10px', borderRadius: 6,
      backgroundColor: color + '22', border: `1px solid ${color}55`,
      display: 'flex', alignItems: 'center', gap: 8,
    }}>
      <span style={{ fontSize: 18 }}>{emoji}</span>
      <div>
        <div style={{ color: color, fontWeight: 'bold', fontSize: 11 }}>{name}</div>
        <div style={{ color: '#999', fontSize: 10 }}>{desc}</div>
      </div>
    </div>
  );
}

function UIItem({ icon, label, desc }: { icon: string; label: string; desc: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
      <span style={{ fontSize: 20 }}>{icon}</span>
      <div>
        <div style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>{label}</div>
        <div style={{ color: '#999', fontSize: 11 }}>{desc}</div>
      </div>
    </div>
  );
}

interface GuideModalProps {
  onClose: () => void;
}

export default function GuideModal({ onClose }: GuideModalProps) {
  const [page, setPage] = useState(0);
  const current = PAGES[page];
  const isLast = page === PAGES.length - 1;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
    >
      <div style={{
        width: 480, maxHeight: '85vh',
        backgroundColor: '#0d0d1a', border: '2px solid #4A7C59',
        borderRadius: 12, overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          backgroundColor: '#1a2e1a',
          borderBottom: '1px solid #4A7C5550',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <h2 style={{ margin: 0, fontSize: 16, color: '#fff', fontWeight: 'bold' }}>
            {current.title}
          </h2>
          <span style={{ color: '#666', fontSize: 12 }}>
            {page + 1} / {PAGES.length}
          </span>
        </div>

        {/* Content */}
        <div style={{ padding: 20, flex: 1, overflowY: 'auto' }}>
          {current.content}
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 20px',
          borderTop: '1px solid #333',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <button
            onClick={() => setPage(p => p - 1)}
            disabled={page === 0}
            style={{
              padding: '8px 16px', borderRadius: 6, border: 'none',
              backgroundColor: page === 0 ? '#1a1a2e' : '#2d2d4e',
              color: page === 0 ? '#555' : '#fff',
              cursor: page === 0 ? 'default' : 'pointer',
              fontSize: 13,
            }}
          >
            ← 이전
          </button>

          <div style={{ display: 'flex', gap: 4 }}>
            {PAGES.map((_, i) => (
              <div key={i} style={{
                width: 8, height: 8, borderRadius: '50%',
                backgroundColor: i === page ? '#4A7C59' : '#333',
              }} />
            ))}
          </div>

          {isLast ? (
            <button
              onClick={onClose}
              style={{
                padding: '8px 20px', borderRadius: 6, border: 'none',
                backgroundColor: '#4A7C59', color: '#fff',
                cursor: 'pointer', fontWeight: 'bold', fontSize: 13,
              }}
            >
              시작하기 🎮
            </button>
          ) : (
            <button
              onClick={() => setPage(p => p + 1)}
              style={{
                padding: '8px 16px', borderRadius: 6, border: 'none',
                backgroundColor: '#4A7C59', color: '#fff',
                cursor: 'pointer', fontSize: 13,
              }}
            >
              다음 →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
