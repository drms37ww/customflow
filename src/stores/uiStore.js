import { create } from 'zustand';

export const useUiStore = create((set) => ({
  sidebarOpen: true,
  activeModal: null,
  flashcardExpandedFolders: {},
  todoExpandedItems: {},

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  openModal: (modal) => set({ activeModal: modal }),
  closeModal: () => set({ activeModal: null }),

  toggleFolderExpanded: (folderId) => set((s) => ({
    flashcardExpandedFolders: {
      ...s.flashcardExpandedFolders,
      [folderId]: !s.flashcardExpandedFolders[folderId],
    },
  })),

  toggleTodoExpanded: (todoId) => set((s) => ({
    todoExpandedItems: {
      ...s.todoExpandedItems,
      [todoId]: !s.todoExpandedItems[todoId],
    },
  })),
}));
