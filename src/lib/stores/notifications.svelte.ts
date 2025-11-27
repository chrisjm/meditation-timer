export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
	id: string;
	type: NotificationType;
	message: string;
	duration?: number;
}

const notificationsState = $state<Notification[]>([]);
let nextNotificationId = 0;

const addNotification = (
	message: string,
	type: NotificationType = 'info',
	duration: number = 5000
): string => {
	const id = `notification-${nextNotificationId++}`;
	const notification: Notification = { id, type, message, duration };

	notificationsState.push(notification);

	if (duration > 0) {
		setTimeout(() => {
			removeNotification(id);
		}, duration);
	}

	return id;
};

const removeNotification = (id: string): void => {
	for (let index = notificationsState.length - 1; index >= 0; index -= 1) {
		const notification = notificationsState[index];
		if (notification?.id === id) {
			notificationsState.splice(index, 1);
		}
	}
};

const clearNotifications = (): void => {
	notificationsState.length = 0;
};

const showInfoNotification = (message: string, duration?: number): string =>
	addNotification(message, 'info', duration);

const showSuccessNotification = (message: string, duration?: number): string =>
	addNotification(message, 'success', duration);

const showWarningNotification = (message: string, duration?: number): string =>
	addNotification(message, 'warning', duration);

const showErrorNotification = (message: string, duration?: number): string =>
	addNotification(message, 'error', duration);

export {
	notificationsState,
	addNotification,
	removeNotification,
	clearNotifications,
	showInfoNotification,
	showSuccessNotification,
	showWarningNotification,
	showErrorNotification
};
