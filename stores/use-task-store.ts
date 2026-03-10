import { create } from 'zustand';

interface TaskStore {
  selectedCategoryId: string | null;
  setSelectedCategoryId: (id: string | null) => void;
  isCreateModalVisible: boolean;
  setCreateModalVisible: (visible: boolean) => void;
}

export const useTaskStore = create<TaskStore>((set) => ({
  selectedCategoryId: null,
  setSelectedCategoryId: (id) => set({ selectedCategoryId: id }),
  isCreateModalVisible: false,
  setCreateModalVisible: (visible) => set({ isCreateModalVisible: visible }),
}));
