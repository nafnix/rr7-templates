import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "vite";
import { reactRouterDevTools } from "react-router-devtools";
import { lingui } from "@lingui/vite-plugin";
import babel from "vite-plugin-babel";

const env = process.env.NODE_ENV || "development";
const envFile = `.env.${env}`;
const defaultEnvFile = ".env";

if (fs.existsSync(envFile)) {
  dotenv.config({ path: envFile });
} else if (fs.existsSync(defaultEnvFile)) {
  dotenv.config({ path: defaultEnvFile });
}

export default defineConfig({
  plugins: [
    tailwindcss(),
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
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "./app"),
    },
  },
});
