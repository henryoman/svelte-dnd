import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [svelte()],
	resolve: {
		alias: {
			'svelte-dnd': new URL('../lib/src/lib/index.ts', import.meta.url).pathname
		}
	}
});
