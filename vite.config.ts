import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  base: "./", // 关键：使用相对路径
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      workbox: {
        globPatterns: [
          "**/*.{js,css,html,ico,png,jpg,svg,woff2}",
          "assets/*", // 缓存静态资源
        ],
        runtimeCaching: [
          {
            urlPattern: ({ request }) =>
              request.destination === "script" ||
              request.destination === "style",
            handler: "CacheFirst", // 优先使用缓存
          },
        ],
      },
    }),
  ],
  build: {
    outDir: "dist", // 默认输出目录
    assetsDir: "assets", // 静态资源目录
    emptyOutDir: true, // 清空输出目录,
    assetsInlineLimit: 1024 * 1024, // 1MB（内联所有小文件）
    // 确保单页应用回退到 index.html
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
      },
    },
  },
  resolve: {
    alias: {
      // 添加别名，确保能正确解析h5-native-bridge
      "h5-native-bridge": resolve(
        __dirname,
        "../h5-native-bridge/dist/native-bridge.es.js"
      ),
    },
  },
  // 确保能正确解析非标准扩展名
  optimizeDeps: {
    include: ["h5-native-bridge", "antd-mobile"],
    esbuildOptions: {
      resolveExtensions: [".js", ".jsx", ".ts", ".tsx"],
    },
  },
  server: {
    port: 3000,
    // 确保开发服务器能正确处理跨域请求
    cors: true,
    // 允许在手机上访问开发服务器
    host: "0.0.0.0",
    // 热更新配置
    hmr: true,
  },
});
