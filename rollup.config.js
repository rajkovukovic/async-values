import svelte from 'rollup-plugin-svelte';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';

import pkg from './package.json';
import preprocess from 'svelte-preprocess';
import rollupTypescript from '@rollup/plugin-typescript';
import typescript2 from "rollup-plugin-typescript2"

// const devMode = false

const tsconfig = {
	transpileOnly: true,
};

const beforeTypescriptPlugins = [
	svelte({
		emitCss: false,
		preprocess: preprocess({
			typescript: tsconfig
		})
	}),
	resolve({
		browser: true,
		dedupe: ['svelte']
	}),
	commonjs(),
]

const afterTypescriptPlugins = [
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
	})]

export default [
	// use typescript2 for building d.ts files
	{
		input: 'src/lib/index.ts',
		treeshake: { moduleSideEffects: false },
		output:
			{ file: `dist/${pkg.module}`, format: 'es', sourcemap: true },
		plugins: [
			...beforeTypescriptPlugins,
			typescript2({ tsconfig: 'tsconfig.build.json' }),
			...afterTypescriptPlugins,
		]
	},
	// use typescript for everything else
	{
		input: 'src/lib/index.ts',
		treeshake: { moduleSideEffects: false },
		output: [
			{ file: `dist/${pkg.module}`, format: 'es', sourcemap: true },
			{ file: `dist/${pkg.main}`, format: 'umd', name: pkg.name, sourcemap: true }
		],
		plugins: [
			...beforeTypescriptPlugins,
			rollupTypescript({ tsconfig: 'tsconfig.build.json' }),
			...afterTypescriptPlugins,
		]
	}
];
