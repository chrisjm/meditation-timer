/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	darkMode: 'class',
	theme: {
		extend: {
			typography: {
				DEFAULT: {
					css: {
						'--tw-prose-body': 'rgb(55 65 81)',
						'--tw-prose-headings': 'rgb(31 41 55)',
						'--tw-prose-links': 'rgb(79 70 229)',
						'--tw-prose-bold': 'rgb(31 41 55)'
					}
				}
			},
			spacing: {
				'safe-top': 'env(safe-area-inset-top)',
				'safe-bottom': 'env(safe-area-inset-bottom)',
				'safe-left': 'env(safe-area-inset-left)',
				'safe-right': 'env(safe-area-inset-right)'
			}
		}
	},
	plugins: [
		require('@tailwindcss/typography'),
		function ({ addUtilities }) {
			addUtilities({
				'.safe-top': {
					paddingTop: 'env(safe-area-inset-top)'
				},
				'.safe-bottom': {
					paddingBottom: 'env(safe-area-inset-bottom)'
				},
				'.safe-left': {
					paddingLeft: 'env(safe-area-inset-left)'
				},
				'.safe-right': {
					paddingRight: 'env(safe-area-inset-right)'
				}
			});
		}
	]
};
