import { AgentRole } from './agent';

export type TaskStatus =
  | 'pending'
  | 'processing'
  | 'awaiting_approval'
  | 'approved'
  | 'rejected'
  | 'completed'
  | 'failed';

export type TaskPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedAgents: AgentRole[];
  progress: number;
  steps: TaskStep[];
  output: string | null;
  createdAt: Date;
  completedAt: Date | null;
}

export interface TaskStep {
  id: string;
  agentRole: AgentRole;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  output: string | null;
}

export interface AgentMessage {
  id: string;
  taskId: string;
  agentRole: AgentRole;
  content: string;
  messageType: 'thinking' | 'discussion' | 'output' | 'system' | 'tool_call';
  timestamp: Date;
}
