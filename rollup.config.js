import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import rollupTypescript from "@rollup/plugin-typescript";
import typescriptCompiler from "typescript";
import { terser } from "rollup-plugin-terser";

const production = !process.env.ROLLUP_WATCH;

const output = [
  // esm build
  {
    file: "dist/index.mj",
    format: "esm",
    exports: "named",
    sourcemap: true,
  },
  // cjs build
  {
    file: "dist/index.js",
    format: "cjs",
    sourcemap: true,
  },
];

export default [
  {
    input: "src/index.ts",
    output,
    plugins: [
      rollupTypescript({
        typescript: typescriptCompiler,
        tsconfig: "./tsconfig.json",
      }),
      commonjs({ include: "node_modules/**" }),
      resolve(),
      production && terser(),
    ],
  },
];
