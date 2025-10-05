import { writable } from 'svelte/store';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
	id: string;
	type: NotificationType;
	message: string;
	duration?: number;
}

const createNotificationStore = () => {
	const { subscribe, update } = writable<Notification[]>([]);

	let nextId = 0;

	const add = (
		message: string,
		type: NotificationType = 'info',
		duration: number = 5000
	): string => {
		const id = `notification-${nextId++}`;
		const notification: Notification = { id, type, message, duration };

		update((notifications) => [...notifications, notification]);

		if (duration > 0) {
			setTimeout(() => {
				remove(id);
			}, duration);
		}

		return id;
	};

	const remove = (id: string) => {
		update((notifications) => notifications.filter((n) => n.id !== id));
	};

	const clear = () => {
		update(() => []);
	};

	return {
		subscribe,
		add,
		remove,
		clear,
		info: (message: string, duration?: number) => add(message, 'info', duration),
		success: (message: string, duration?: number) => add(message, 'success', duration),
		warning: (message: string, duration?: number) => add(message, 'warning', duration),
		error: (message: string, duration?: number) => add(message, 'error', duration)
	};
};

export const notifications = createNotificationStore();
