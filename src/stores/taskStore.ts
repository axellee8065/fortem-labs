import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { Task, TaskStep, AgentMessage, TaskStatus, TaskPriority } from '@/types/task';
import { AgentRole } from '@/types/agent';

interface TaskStore {
  tasks: Record<string, Task>;
  messages: AgentMessage[];
  activeTaskId: string | null;

  createTask: (title: string, description: string, priority?: TaskPriority) => string;
  updateTaskStatus: (id: string, status: TaskStatus) => void;
  updateTaskProgress: (id: string, progress: number) => void;
  assignAgentsToTask: (id: string, agents: AgentRole[]) => void;
  addTaskStep: (taskId: string, step: Omit<TaskStep, 'id'>) => void;
  updateStepStatus: (taskId: string, stepId: string, status: TaskStep['status'], output?: string) => void;
  setActiveTask: (id: string | null) => void;
  addMessage: (message: Omit<AgentMessage, 'id' | 'timestamp'>) => void;
  getTaskMessages: (taskId: string) => AgentMessage[];
  completeTask: (id: string, output: string) => void;
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: {},
  messages: [],
  activeTaskId: null,

  createTask: (title, description, priority = 'normal') => {
    const id = uuidv4();
    const task: Task = {
      id,
      title,
      description,
      status: 'pending',
      priority,
      assignedAgents: [],
      progress: 0,
      steps: [],
      output: null,
      createdAt: new Date(),
      completedAt: null,
    };
    set((state) => ({
      tasks: { ...state.tasks, [id]: task },
      activeTaskId: id,
    }));
    return id;
  },

  updateTaskStatus: (id, status) =>
    set((state) => ({
      tasks: {
        ...state.tasks,
        [id]: state.tasks[id] ? { ...state.tasks[id], status } : state.tasks[id],
      },
    })),

  updateTaskProgress: (id, progress) =>
    set((state) => ({
      tasks: {
        ...state.tasks,
        [id]: state.tasks[id] ? { ...state.tasks[id], progress } : state.tasks[id],
      },
    })),

  assignAgentsToTask: (id, agents) =>
    set((state) => ({
      tasks: {
        ...state.tasks,
        [id]: state.tasks[id]
          ? { ...state.tasks[id], assignedAgents: agents, status: 'processing' }
          : state.tasks[id],
      },
    })),

  addTaskStep: (taskId, step) => {
    const stepWithId: TaskStep = { ...step, id: uuidv4() };
    set((state) => ({
      tasks: {
        ...state.tasks,
        [taskId]: state.tasks[taskId]
          ? { ...state.tasks[taskId], steps: [...state.tasks[taskId].steps, stepWithId] }
          : state.tasks[taskId],
      },
    }));
  },

  updateStepStatus: (taskId, stepId, status, output) =>
    set((state) => {
      const task = state.tasks[taskId];
      if (!task) return state;
      const steps = task.steps.map((s) =>
        s.id === stepId ? { ...s, status, output: output ?? s.output } : s
      );
      return {
        tasks: { ...state.tasks, [taskId]: { ...task, steps } },
      };
    }),

  setActiveTask: (id) => set({ activeTaskId: id }),

  addMessage: (message) => {
    const fullMessage: AgentMessage = {
      ...message,
      id: uuidv4(),
      timestamp: new Date(),
    };
    set((state) => ({
      messages: [...state.messages, fullMessage],
    }));
  },

  getTaskMessages: (taskId) => {
    return get().messages.filter((m) => m.taskId === taskId);
  },

  completeTask: (id, output) =>
    set((state) => ({
      tasks: {
        ...state.tasks,
        [id]: state.tasks[id]
          ? {
              ...state.tasks[id],
              status: 'completed',
              output,
              progress: 100,
              completedAt: new Date(),
            }
          : state.tasks[id],
      },
    })),
}));
