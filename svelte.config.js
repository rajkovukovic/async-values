// import adapter from '@sveltejs/adapter-auto';
import staticAdapter from '@sveltejs/adapter-static';
import preprocess from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: preprocess(),

	kit: {
		// adapter: adapter(),
		adapter: staticAdapter({
			// base: "/async-values",
			precompress: false
		}),

		// hydrate the <div id="svelte"> element in src/app.html
		target: '#svelte'
	}
};

export default config;
