/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	darkMode: 'class',
	theme: {
		extend: {
			typography: {
				DEFAULT: {
					css: {
						'--tw-prose-body': 'rgb(55 65 81)', // text-gray-700
						'--tw-prose-headings': 'rgb(31 41 55)', // text-gray-800
						'--tw-prose-links': 'rgb(79 70 229)', // text-indigo-600
						'--tw-prose-bold': 'rgb(31 41 55)' // text-gray-800
					}
				}
			}
		}
	},
	plugins: [require('@tailwindcss/typography')]
};
