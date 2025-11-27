interface ModalState {
	isOpen: boolean;
	message: string;
}

const modalState = $state<ModalState>({
	isOpen: false,
	message: ''
});

const openModal = (message: string): void => {
	modalState.isOpen = true;
	modalState.message = message;
};

const closeModal = (): void => {
	modalState.isOpen = false;
	modalState.message = '';
};

export { modalState, openModal, closeModal };
export type { ModalState };
