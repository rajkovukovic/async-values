import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import serve from "rollup-plugin-serve";
import rollupTypescript from "@rollup/plugin-typescript";
import typescriptCompiler from "typescript";
import { terser } from "rollup-plugin-terser";
import livereload from "rollup-plugin-livereload";

const production = !process.env.ROLLUP_WATCH;

function generatePlugins(
  bundleDependencies = false,
  serveBaseDir = null,
) {
  return [
    rollupTypescript({
      typescript: typescriptCompiler,
      tsconfig: "./tsconfig.json",
    }),
    !bundleDependencies && commonjs({ include: "node_modules/**" }),
    resolve(),
    serveBaseDir && !production && serve({
      contentBase: serveBaseDir,
      open: true,
      port: 3000,
    }),
    serveBaseDir && !production && livereload({ watch: serveBaseDir }),
    production && terser(),
  ];
}

const libOutput = production
  ? [
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
  ]
  : [
    // demo/lib - used for development only
    {
      file: "demo/lib/index.js",
      format: "esm",
      exports: "named",
      sourcemap: true,
    },
  ];

const buildSetups = [
  {
    input: "src/index.ts",
    output: libOutput,
    plugins: generatePlugins(false),
  },
];

if (!production) {
  buildSetups.push(
    {
      input: "demo/src/index.ts",
      output: [
        {
          file: "demo/public/dist/index.js",
          format: "esm",
          exports: "named",
          sourcemap: true,
        },
      ],
      plugins: generatePlugins(true, "demo/public"),
    },
  );
}

export default buildSetups;
