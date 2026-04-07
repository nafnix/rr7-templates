/// <reference types="vitest" />
import { defineConfig } from "vitest/config";
import { resolve } from "path";
import { lingui } from "@lingui/vite-plugin";
import babel from "vite-plugin-babel";

export default defineConfig({
  plugins: [
    babel({
      babelConfig: {
        presets: ["@babel/preset-typescript"],
        plugins: [["@lingui/babel-plugin-lingui-macro", {}]],
      },
      filter: /\.[jt]sx?$/,
    }),
    lingui(),
  ],
  test: {
    globals: true,
    environment: "happy-dom",
    setupFiles: ["./vitest-setup.ts"],
    include: [
      "**/__tests__/**/*.{test,spec}.{ts,tsx}",
      "**/*.{test,spec}.{ts,tsx}",
    ],
    exclude: ["node_modules", "build", ".react-router", "app/locales"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules",
        "build",
        ".react-router",
        "app/locales",
        "**/*.po",
        "**/__tests__/**",
        "**/vitest-setup.ts",
        "**/vitest.config.ts",
      ],
    },
  },
  resolve: {
    alias: {
      "~": resolve(__dirname, "./app"),
    },
  },
});
