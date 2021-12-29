import svelte from 'rollup-plugin-svelte';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';

import pkg from './package.json';
import preprocess from 'svelte-preprocess';
import typescript from '@rollup/plugin-typescript';
// import typescript from "rollup-plugin-typescript2"

// const devMode = false

const tsconfig = {
	allowJs: true,
	baseUrl: '.',
	rootDir: 'src/lib',
	outDir: 'dist',
	declaration: true,
	declarationDir: 'dist',
	transpileOnly: true,
	paths: {
		$lib: ['src/lib'],
		'$lib/*': ['src/lib/*']
	}
};

export default {
	input: 'src/lib/index.ts',
	treeshake: { moduleSideEffects: false },

	output: [
		{ file: `dist/${pkg.module}`, format: 'es', sourcemap: true },
		{ file: `dist/${pkg.main}`, format: 'umd', name: pkg.name, sourcemap: true }
	],
	plugins: [
		svelte({
			emitCss: false,
			preprocess: preprocess({
				typescript: tsconfig
			})
		}),

		// We don't need to alias when importing from 'svelthree-three'
		// see  '"svelte": "src/Three.js"' in svelthree-three's package.json
		/*
        alias({
            entries: [
                {
          //import from three source on build
                    find: "three",
                    replacement: __dirname + "/node_modules/svelthree-three/src/Three"
                }
            ]
    }),
    */

		resolve({
			browser: true,
			dedupe: ['svelte']
		}),
		commonjs(),
		typescript({ tsconfig: 'tsconfig.build.json' }),

		terser({
			output: {
				comments: function (node, comment) {
					var text = comment.value;
					var type = comment.type;
					if (type == 'comment2') {
						// multiline comment
						return /@licence/i.test(text);
					}
				}
			},
			mangle: false,
			compress: {
				pure_funcs: ['console.log', 'console.info']
			}
		})
	]
};
