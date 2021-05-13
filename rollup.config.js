import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import rollupTypescript from "@rollup/plugin-typescript";
import typescriptCompiler from "typescript";
import peerDepsExternal from "rollup-plugin-peer-deps-external";
import { terser } from "rollup-plugin-terser";

const production = !process.env.ROLLUP_WATCH;

const output = [
  // esm build
  {
    dir: "dist",
    format: "esm",
    exports: "named",
    sourcemap: true,
  },
  // cjs build
  // {
  //   dir: "dist",
  //   format: "cjs",
  //   sourcemap: true,
  // },
];

export default [
  {
    input: "src/index.ts",
    output,
    plugins: [
      peerDepsExternal(),
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
