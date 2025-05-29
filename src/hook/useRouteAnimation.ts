import { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

export type AnimationType =
  | "page"
  | "page-back"
  | "fade"
  | "scale"
  | "slide-up"
  | "slide-down"
  | "flip";

interface RouteAnimationOptions {
  defaultAnimation?: AnimationType;
  routeAnimations?: Record<string, AnimationType>;
  enableGesture?: boolean;
  animationDuration?: number;
}

interface RouteAnimationState {
  animationType: AnimationType;
  isAnimating: boolean;
  direction: "forward" | "backward";
}

export const useRouteAnimation = (options: RouteAnimationOptions = {}) => {
  const {
    defaultAnimation = "page",
    routeAnimations = {},
    enableGesture = true,
    animationDuration = 300,
  } = options;

  const location = useLocation();
  const navigationType = useNavigationType();

  const [animationState, setAnimationState] = useState<RouteAnimationState>({
    animationType: defaultAnimation,
    isAnimating: false,
    direction: "forward",
  });

  // 路由层级定义 - 用于判断前进还是后退
  const routeHierarchy: Record<string, number> = {
    "/": 0,
    "/location": 1,
    "/device": 1,
    "/watch": 1,
  };

  // 获取动画类型
  const getAnimationType = useCallback(
    (currentPath: string, previousPath: string): AnimationType => {
      // 优先使用路由特定动画
      if (routeAnimations[currentPath]) {
        return routeAnimations[currentPath];
      }

      const currentLevel = routeHierarchy[currentPath] || 1;
      const previousLevel = routeHierarchy[previousPath] || 0;

      // 根据导航类型和路由层级确定动画类型
      if (navigationType === "POP" || currentLevel < previousLevel) {
        return "page-back"; // 后退动画
      } else if (currentPath === "/") {
        return "fade"; // 回到首页使用淡入淡出
      } else {
        return defaultAnimation; // 前进动画
      }
    },
    [navigationType, routeAnimations, defaultAnimation, routeHierarchy]
  );

  // 监听路由变化
  useEffect(() => {
    const previousPath = sessionStorage.getItem("previousPath") || "/";
    const currentPath = location.pathname;

    const animationType = getAnimationType(currentPath, previousPath);
    const direction =
      routeHierarchy[currentPath] > routeHierarchy[previousPath]
        ? "forward"
        : "backward";

    setAnimationState({
      animationType,
      isAnimating: true,
      direction,
    });

    // 存储当前路径
    sessionStorage.setItem("previousPath", currentPath);

    // 动画完成后重置状态
    const timer = setTimeout(() => {
      setAnimationState((prev) => ({ ...prev, isAnimating: false }));
    }, animationDuration);

    return () => clearTimeout(timer);
  }, [location.pathname, getAnimationType, animationDuration, routeHierarchy]);

  // 手动设置动画类型
  const setAnimationType = useCallback((type: AnimationType) => {
    setAnimationState((prev) => ({ ...prev, animationType: type }));
  }, []);

  // 预加载路由组件（性能优化）
  const preloadRoute = useCallback((path: string) => {
    // 这里可以实现路由组件预加载逻辑
    console.log(`预加载路由: ${path}`);
  }, []);

  return {
    ...animationState,
    setAnimationType,
    preloadRoute,
    enableGesture,
  };
};

// 动画配置预设
export const animationPresets = {
  // 标准移动端动画
  mobile: {
    defaultAnimation: "page" as AnimationType,
    routeAnimations: {
      "/": "fade" as AnimationType,
    },
    enableGesture: true,
    animationDuration: 250,
  },

  // 桌面端动画
  desktop: {
    defaultAnimation: "fade" as AnimationType,
    routeAnimations: {},
    enableGesture: false,
    animationDuration: 200,
  },

  // 无动画模式
  none: {
    defaultAnimation: "fade" as AnimationType,
    routeAnimations: {},
    enableGesture: false,
    animationDuration: 0,
  },
};

// 检测设备类型
export const getDeviceType = (): "mobile" | "desktop" => {
  return /Mobi|Android/i.test(navigator.userAgent) ? "mobile" : "desktop";
};
