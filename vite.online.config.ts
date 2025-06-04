// vite.online.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  base: "./",
  plugins: [
    react(),
    // 不再引入 VitePWA 插件
  ],
  build: {
    outDir: "dist-online", // 区分输出目录
    assetsDir: "assets",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
      },
    },
  },
  resolve: {},
  optimizeDeps: {
    include: ["h5-native-bridge", "antd-mobile"],
    esbuildOptions: {
      resolveExtensions: [".js", ".jsx", ".ts", ".tsx"],
    },
  },
});