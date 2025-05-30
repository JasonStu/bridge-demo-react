import { useEffect, useState, useCallback, useRef } from "react";
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
  // 新增：前进和后退动画配置
  forwardAnimation?: AnimationType;
  backwardAnimation?: AnimationType;
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
    // 设置前进和后退的默认动画
    forwardAnimation = "page",
    backwardAnimation = "fade",
  } = options;

  const location = useLocation();
  const navigationType = useNavigationType();

  const [animationState, setAnimationState] = useState<RouteAnimationState>({
    animationType: defaultAnimation,
    isAnimating: false,
    direction: "forward",
  });

  // 使用 ref 来存储前一个路径和导航历史
  const previousPathRef = useRef<string>("/");

  // 路由层级定义
  const routeHierarchy = useRef<Record<string, number>>({
    "/": 0,
    "/location": 1,
    "/device": 1,
    "/watch": 1,
  });

  // 简化的方向判断逻辑 - 重点关注 navigationType
  const getNavigationDirection = useCallback(
    (
      currentPath: string,
      previousPath: string,
      navType: string
    ): "forward" | "backward" => {
      const currentLevel = routeHierarchy.current[currentPath] || 1;
      const previousLevel = routeHierarchy.current[previousPath] || 0;

      console.log(
        `[方向判断] 导航类型: ${navType}, 路径: ${previousPath} -> ${currentPath}, 层级: ${previousLevel} -> ${currentLevel}`
      );

      // 1. 最重要：navigationType 为 POP 一定是后退
      if (navType === "POP") {
        console.log(`[方向判断] POP 导航 -> 后退`);
        return "backward";
      }

      // 2. navigationType 为 PUSH 且层级上升，是前进
      if (navType === "PUSH" && currentLevel > previousLevel) {
        console.log(`[方向判断] PUSH 导航且层级上升 -> 前进`);
        return "forward";
      }

      // 3. 根据层级判断
      if (currentLevel < previousLevel) {
        console.log(`[方向判断] 层级下降 -> 后退`);
        return "backward";
      }

      // 4. 默认为前进
      console.log(`[方向判断] 默认 -> 前进`);
      return "forward";
    },
    []
  );

  // 获取动画类型
  const getAnimationType = useCallback(
    (currentPath: string, direction: "forward" | "backward"): AnimationType => {
      // 优先使用路由特定动画
      if (routeAnimations[currentPath]) {
        console.log(
          `[动画选择] 使用路由特定动画: ${routeAnimations[currentPath]}`
        );
        return routeAnimations[currentPath];
      }

      // 根据方向选择动画
      if (direction === "backward") {
        console.log(`[动画选择] 后退方向 -> ${backwardAnimation}`);
        return backwardAnimation; // 后退使用fade
      } else {
        console.log(`[动画选择] 前进方向 -> ${forwardAnimation}`);
        return forwardAnimation; // 前进使用page
      }
    },
    [routeAnimations, forwardAnimation, backwardAnimation]
  );

  // 监听路由变化
  useEffect(() => {
    const currentPath = location.pathname;
    const previousPath = previousPathRef.current;

    console.log(`\n=== 路由变化检测 ===`);
    console.log(`路径变化: ${previousPath} -> ${currentPath}`);
    console.log(`导航类型: ${navigationType}`);

    // 只有路径真正改变时才更新
    if (currentPath !== previousPath) {
      // 判断导航方向
      const direction = getNavigationDirection(
        currentPath,
        previousPath,
        navigationType
      );

      // 获取动画类型
      const animationType = getAnimationType(currentPath, direction);

      console.log(`\n🎬 最终结果:`);
      console.log(`- 方向: ${direction}`);
      console.log(`- 动画: ${animationType}`);
      console.log(`===================\n`);

      setAnimationState({
        animationType,
        isAnimating: true,
        direction,
      });

      // 更新前一个路径
      previousPathRef.current = currentPath;

      // 动画完成后重置状态
      const timer = setTimeout(() => {
        setAnimationState((prev) => ({ ...prev, isAnimating: false }));
      }, animationDuration);

      return () => clearTimeout(timer);
    }
  }, [
    location.pathname,
    navigationType,
    getNavigationDirection,
    getAnimationType,
    animationDuration,
  ]);

  // 手动设置动画类型
  const setAnimationType = useCallback((type: AnimationType) => {
    setAnimationState((prev) => ({ ...prev, animationType: type }));
  }, []);

  // 预加载路由组件（性能优化）
  const preloadRoute = useCallback((path: string) => {
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
