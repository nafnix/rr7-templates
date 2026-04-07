import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import dotenv from "dotenv";
import fs from "node:fs";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { reactRouterDevTools } from "react-router-devtools";
import { lingui } from "@lingui/vite-plugin";
import babel from "vite-plugin-babel";

const env = process.env.NODE_ENV || "development";
if (fs.existsSync(`.env.${env}`)) {
  dotenv.config({ path: `.env.${env}` });
} else {
  dotenv.config();
}

export default defineConfig({
  plugins: [
    tailwindcss(),
    tsconfigPaths(),
    babel({
      babelConfig: {
        presets: ["@babel/preset-typescript"],
        plugins: [["@lingui/babel-plugin-lingui-macro", {}]],
      },
      filter: /\.[jt]sx?$/,
    }),
    lingui(),
    reactRouterDevTools(),
    reactRouter(),
  ],
  build: {
    sourcemap: false,
    minify: "esbuild",
    target: "es2022",
  },
});
