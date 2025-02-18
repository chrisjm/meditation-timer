import { writable } from 'svelte/store';

interface ModalState {
  isOpen: boolean;
  message: string;
}

const createModalStore = () => {
  const { subscribe, set, update } = writable<ModalState>({
    isOpen: false,
    message: '',
  });

  return {
    subscribe,
    open: (message: string) => {
      set({ isOpen: true, message });
    },
    close: () => {
      set({ isOpen: false, message: '' });
    },
  };
};

export const modalStore = createModalStore();
