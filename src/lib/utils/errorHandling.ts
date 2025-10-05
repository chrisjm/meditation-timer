import { notifications } from '$lib/stores/notifications';

export interface ErrorHandlingOptions {
	showNotification?: boolean;
	notificationMessage?: string;
	logError?: boolean;
	rethrow?: boolean;
}

export async function withErrorHandling<T>(
	fn: () => Promise<T>,
	options: ErrorHandlingOptions = {}
): Promise<T | undefined> {
	const {
		showNotification = true,
		notificationMessage,
		logError = true,
		rethrow = false
	} = options;

	try {
		return await fn();
	} catch (error) {
		if (logError) {
			console.error('Error caught by withErrorHandling:', error);
		}

		if (showNotification) {
			const message =
				notificationMessage || (error instanceof Error ? error.message : 'An error occurred');
			notifications.error(message);
		}

		if (rethrow) {
			throw error;
		}

		return undefined;
	}
}

export function withSyncErrorHandling<T>(
	fn: () => T,
	options: ErrorHandlingOptions = {}
): T | undefined {
	const {
		showNotification = true,
		notificationMessage,
		logError = true,
		rethrow = false
	} = options;

	try {
		return fn();
	} catch (error) {
		if (logError) {
			console.error('Error caught by withSyncErrorHandling:', error);
		}

		if (showNotification) {
			const message =
				notificationMessage || (error instanceof Error ? error.message : 'An error occurred');
			notifications.error(message);
		}

		if (rethrow) {
			throw error;
		}

		return undefined;
	}
}
