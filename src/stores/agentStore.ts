import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { Agent, AgentRole, AgentStatus, AGENT_CONFIGS } from '@/types/agent';

interface AgentStore {
  agents: Record<string, Agent>;
  initializeAgents: () => void;
  updateAgentStatus: (id: string, status: AgentStatus) => void;
  updateAgentPosition: (id: string, position: { x: number; y: number }) => void;
  setAgentPath: (id: string, path: { x: number; y: number }[]) => void;
  setAgentSpeechBubble: (id: string, text: string | null) => void;
  assignTask: (id: string, taskId: string) => void;
  getAgentByRole: (role: AgentRole) => Agent | undefined;
  getAgentById: (id: string) => Agent | undefined;
  moveAgentToPosition: (id: string, target: { x: number; y: number }) => void;
}

export const useAgentStore = create<AgentStore>((set, get) => ({
  agents: {},

  initializeAgents: () => {
    const agents: Record<string, Agent> = {};
    for (const [role, config] of Object.entries(AGENT_CONFIGS)) {
      const id = `agent-${role}`;
      agents[id] = {
        id,
        config,
        status: 'idle',
        currentTaskId: null,
        position: { ...config.deskPosition },
        targetPosition: null,
        path: [],
        speechBubble: null,
        energy: 100,
      };
    }
    set({ agents });
  },

  updateAgentStatus: (id, status) =>
    set((state) => ({
      agents: {
        ...state.agents,
        [id]: state.agents[id] ? { ...state.agents[id], status } : state.agents[id],
      },
    })),

  updateAgentPosition: (id, position) =>
    set((state) => ({
      agents: {
        ...state.agents,
        [id]: state.agents[id] ? { ...state.agents[id], position } : state.agents[id],
      },
    })),

  setAgentPath: (id, path) =>
    set((state) => ({
      agents: {
        ...state.agents,
        [id]: state.agents[id]
          ? { ...state.agents[id], path, status: 'walking' as AgentStatus }
          : state.agents[id],
      },
    })),

  setAgentSpeechBubble: (id, text) =>
    set((state) => ({
      agents: {
        ...state.agents,
        [id]: state.agents[id]
          ? { ...state.agents[id], speechBubble: text }
          : state.agents[id],
      },
    })),

  assignTask: (id, taskId) =>
    set((state) => ({
      agents: {
        ...state.agents,
        [id]: state.agents[id]
          ? { ...state.agents[id], currentTaskId: taskId, status: 'assigned' as AgentStatus }
          : state.agents[id],
      },
    })),

  getAgentByRole: (role) => {
    const agents = get().agents;
    return Object.values(agents).find((a) => a.config.role === role);
  },

  getAgentById: (id) => get().agents[id],

  moveAgentToPosition: (id, target) =>
    set((state) => ({
      agents: {
        ...state.agents,
        [id]: state.agents[id]
          ? { ...state.agents[id], targetPosition: target }
          : state.agents[id],
      },
    })),
}));
