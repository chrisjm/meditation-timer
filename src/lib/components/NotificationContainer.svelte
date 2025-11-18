<script lang="ts">
	import {
		notificationsState,
		removeNotification,
		type Notification
	} from '$lib/stores/notifications.svelte';
	import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-svelte';

	const getIcon = (type: Notification['type']) => {
		switch (type) {
			case 'success':
				return CheckCircle;
			case 'error':
				return AlertCircle;
			case 'warning':
				return AlertTriangle;
			case 'info':
			default:
				return Info;
		}
	};

	const getColorClasses = (type: Notification['type']) => {
		switch (type) {
			case 'success':
				return 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200';
			case 'error':
				return 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200';
			case 'warning':
				return 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200';
			case 'info':
			default:
				return 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200';
		}
	};

	const handleClose = (id: string) => {
		removeNotification(id);
	};
</script>

<div
	class="pointer-events-none fixed top-4 right-4 z-50 flex flex-col gap-2"
	aria-live="polite"
	aria-atomic="true"
>
	{#each notificationsState as notification (notification.id)}
		<div
			class="pointer-events-auto flex max-w-md min-w-[300px] items-start gap-3 rounded-lg border p-4 shadow-lg transition-all duration-300 {getColorClasses(
				notification.type
			)}"
			role="alert"
		>
			<svelte:component this={getIcon(notification.type)} class="h-5 w-5 flex-shrink-0" />
			<p class="flex-1 text-sm font-medium">{notification.message}</p>
			<button
				onclick={() => handleClose(notification.id)}
				class="flex-shrink-0 rounded-full p-1 transition-colors hover:bg-black/10 dark:hover:bg-white/10"
				aria-label="Close notification"
			>
				<X class="h-4 w-4" />
			</button>
		</div>
	{/each}
</div>
