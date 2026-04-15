import { create } from 'zustand';

export type ModalType = 'task_assign' | 'approval' | 'settings' | 'memory' | null;
export type PanelType = 'chat' | 'task' | 'kanban' | 'memory';

interface UIStore {
  activeModal: ModalType;
  openPanels: Set<PanelType>;
  interactionHint: string | null;
  notifications: Notification[];
  soundEnabled: boolean;
  musicEnabled: boolean;

  openModal: (modal: ModalType) => void;
  closeModal: () => void;
  togglePanel: (panel: PanelType) => void;
  isPanelOpen: (panel: PanelType) => boolean;
  setInteractionHint: (hint: string | null) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  dismissNotification: (id: string) => void;
  toggleSound: () => void;
  toggleMusic: () => void;
}

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  timestamp: Date;
}

export const useUIStore = create<UIStore>((set, get) => ({
  activeModal: null,
  openPanels: new Set<PanelType>(['chat', 'task']),
  interactionHint: null,
  notifications: [],
  soundEnabled: true,
  musicEnabled: true,

  openModal: (modal) => set({ activeModal: modal }),
  closeModal: () => set({ activeModal: null }),

  togglePanel: (panel) =>
    set((state) => {
      const newPanels = new Set(state.openPanels);
      if (newPanels.has(panel)) {
        newPanels.delete(panel);
      } else {
        newPanels.add(panel);
      }
      return { openPanels: newPanels };
    }),

  isPanelOpen: (panel) => get().openPanels.has(panel),

  setInteractionHint: (hint) => set({ interactionHint: hint }),

  addNotification: (notification) =>
    set((state) => ({
      notifications: [
        ...state.notifications,
        {
          ...notification,
          id: `notif-${Date.now()}`,
          timestamp: new Date(),
        },
      ],
    })),

  dismissNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),

  toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
  toggleMusic: () => set((state) => ({ musicEnabled: !state.musicEnabled })),
}));
