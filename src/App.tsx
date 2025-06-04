import { useState, useEffect } from "react";
import "./App.css";
import LocationPanel from "./components/LocationPanel";
import DevicePanel from "./components/DevicePanel";
import WatchLocationPanel from "./components/WatchLocationPanel";
import DebugControls from "./components/DebugControls";
import GestureRouteTransition from "./components/GestureRouteTransition";
import AnimationController from "./components/AnimationController";
import VConsole from "vconsole";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { Button, NavBar } from "antd-mobile";
import {
  useRouteAnimation,
 
} from "./hooks/useRouteAnimation";

// 导入桥接库
import nativeBridge from "h5-native-bridge";
import NavigatePanel from "./components/NavigationPanel";

// 首页组件
const HomePage = ({
  setShowAnimationController,
}: {
  setShowAnimationController: (show: boolean) => void;
}) => {
  const navigate = useNavigate();
  const { push } = useRouteAnimation();

  const navigationItems = [
    {
      id: "location",
      title: "位置服务",
      description: "获取当前位置信息",
      icon: "📍",
      path: "/location",
      color: "#4361ee",
    },
    {
      id: "device",
      title: "WiFi列表",
      description: "获取设备WiFi信息",
      icon: "📶",
      path: "/device",
      color: "#06d6a0",
    },
    {
      id: "watch",
      title: "保存图片",
      description: "图片保存功能演示",
      icon: "📸",
      path: "/watch",
      color: "#f72585",
    },
    {
      id: "navigation",
      title: "模拟路由",
      description: "路由演示",
      icon: "👂🏻",
      path: "/navigate",
      color: "#f98335",
    },
  ];

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      }}
    >
      <NavBar
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(10px)",
          color: "white",
        }}
        backIcon={false}
      >
        <span style={{ color: "white", fontWeight: "600" }}>
          🌉 H5-Native-Bridge 演示
        </span>
      </NavBar>

      <div
        style={{
          flex: 1,
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          overflow: "auto",
        }}
      >
        <div
          style={{
            textAlign: "center",
            marginBottom: "20px",
            color: "white",
          }}
        >
          <h2 style={{ margin: "0 0 8px 0", fontSize: "24px" }}>功能演示</h2>
          <p style={{ margin: 0, opacity: 0.8 }}>点击下方按钮体验各项功能</p>

          {/* 首页动画控制按钮 */}
          <Button
            size="small"
            fill="outline"
            onClick={() => setShowAnimationController(true)}
            style={{
              marginTop: "12px",
              color: "white",
              borderColor: "rgba(255,255,255,0.5)",
              background: "rgba(255,255,255,0.1)",
            }}
          >
            🎨 动画设置
          </Button>
        </div>

        {navigationItems.map((item) => (
          <div
            key={item.id}
            onClick={() => {
                push(item.path)
            }}
            style={{
              background: "rgba(255, 255, 255, 0.95)",
              borderRadius: "16px",
              padding: "20px",
              cursor: "pointer",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
              border: `2px solid transparent`,
              position: "relative" as const,
              overflow: "hidden" as const,
            }}
            onTouchStart={(e) => {
              const target = e.currentTarget;
              target.style.transform = "scale(0.98)";
            }}
            onTouchEnd={(e) => {
              const target = e.currentTarget;
              target.style.transform = "scale(1)";
            }}
          >
            <div
              style={{
                position: "absolute" as const,
                top: 0,
                left: 0,
                right: 0,
                height: "4px",
                background: item.color,
                transform: "scaleX(0)",
                transformOrigin: "left",
                transition: "transform 0.3s ease",
              }}
            />

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                marginBottom: "12px",
              }}
            >
              <div
                style={{
                  width: "50px",
                  height: "50px",
                  borderRadius: "50%",
                  background: item.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px",
                }}
              >
                {item.icon}
              </div>
              <div>
                <h3
                  style={{
                    margin: 0,
                    fontSize: "18px",
                    fontWeight: "600",
                    color: "#333",
                  }}
                >
                  {item.title}
                </h3>
              </div>
            </div>

            <p
              style={{
                margin: 0,
                color: "#666",
                fontSize: "14px",
                lineHeight: "1.5",
              }}
            >
              {item.description}
            </p>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: "16px",
                color: item.color,
                fontWeight: "500",
                fontSize: "14px",
              }}
            >
              <span>点击体验</span>
              <span style={{ fontSize: "16px" }}>→</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

function App() {
  const [bridgeReady, setBridgeReady] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [showAnimationController, setShowAnimationController] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // 移动端视口高度处理
    const setVH = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    };

    setVH();
    window.addEventListener("resize", setVH);
    window.addEventListener("orientationchange", setVH);

    const vConsole = new VConsole();

    // 设置调试模式
    nativeBridge.setDebug(true);
    setDebugMode(nativeBridge.isDebugMode());

    // 等待桥接准备就绪
    nativeBridge.ready(() => {
      console.log("NativeBridge 已准备就绪");
      setBridgeReady(true);
    });

    return () => {
      window.removeEventListener("resize", setVH);
      window.removeEventListener("orientationchange", setVH);
    };
  }, []);

  // 切换调试模式
  const toggleDebugMode = () => {
    const newMode = !debugMode;
    nativeBridge.setDebug(newMode);
    setDebugMode(newMode);
  };

  // 显示已安装的插件
  const printPlugins = () => {
    const plugins = nativeBridge.getInstalledPlugins();
    console.log("已安装的插件:", plugins);
    alert(`已安装的插件: ${plugins.join(", ")}`);
  };

  // 显示动画控制器
  const showAnimationPanel = () => {
    setShowAnimationController(true);
  };

  return (
    <div className="app-container" style={{ padding: 0, maxWidth: "none" }}>
      <GestureRouteTransition enableGesture={true}>
        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                setShowAnimationController={setShowAnimationController}
              />
            }
          />
          <Route path="/location" element={<LocationPanel />} />
          <Route path="/device" element={<DevicePanel />} />
          <Route path="/watch" element={<WatchLocationPanel />} />
          <Route path="/navigate" element={<NavigatePanel />} />
        </Routes>
      </GestureRouteTransition>

      {/* 调试控制面板 - 只在非首页显示 */}
      {location.pathname !== "/" && (
        <>
          <DebugControls
            debugMode={debugMode}
            onToggleDebug={toggleDebugMode}
            onShowPlugins={printPlugins}
          />

          {/* 动画控制按钮 */}
          <div
            style={{
              position: "fixed",
              bottom: "20px",
              left: "20px",
              zIndex: 1000,
            }}
          >
            <Button
              size="small"
              color="primary"
              onClick={showAnimationPanel}
              style={{
                borderRadius: "20px",
                padding: "8px 16px",
              }}
            >
              🎨 动画
            </Button>
          </div>
        </>
      )}

      {/* 动画控制面板 */}
      <AnimationController
        visible={showAnimationController}
        onClose={() => setShowAnimationController(false)}
      />
    </div>
  );
}

export default App;
