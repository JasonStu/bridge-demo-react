import { useEffect, useState, useCallback, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";
import { useNavigate } from "react-router-dom";

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
  forwardAnimation?: AnimationType;
  backwardAnimation?: AnimationType;
}

interface RouteAnimationState {
  animationType: AnimationType;
  isAnimating: boolean;
  direction: "forward" | "backward";
}

// 全局路由动画状态管理
class RouteAnimationManager {
  private static instance: RouteAnimationManager;
  private listeners: Array<(state: RouteAnimationState) => void> = [];
  private currentState: RouteAnimationState = {
    animationType: "page",
    isAnimating: false,
    direction: "forward",
  };
  private routeHistory: string[] = [];

  static getInstance(): RouteAnimationManager {
    if (!RouteAnimationManager.instance) {
      RouteAnimationManager.instance = new RouteAnimationManager();
    }
    return RouteAnimationManager.instance;
  }

  subscribe(listener: (state: RouteAnimationState) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => listener(this.currentState));
  }

  // 预设动画 - 在路由变化前调用
  presetAnimation(
    animationType: AnimationType,
    direction: "forward" | "backward"
  ) {
    console.log(`[全局预设] 动画: ${animationType}, 方向: ${direction}`);
    this.currentState = {
      animationType,
      isAnimating: true,
      direction,
    };
    this.notify();
  }

  // 路由变化时调用
  onRouteChange(
    newPath: string,
    navType: string,
    options: RouteAnimationOptions
  ) {
    const {
      forwardAnimation = "page",
      backwardAnimation = "fade",
      routeAnimations = {},
    } = options;

    console.log(`[路由变化] 路径: ${newPath}, 导航类型: ${navType}`);

    // 如果动画已经被预设，直接使用预设的动画
    if (this.currentState.isAnimating) {
      console.log(`[使用预设] 动画: ${this.currentState.animationType}`);
      this.updateHistory(newPath, this.currentState.direction);
      return;
    }

    // 自动判断方向和动画
    const direction = this.determineDirection(newPath, navType);
    const animationType =
      routeAnimations[newPath] ||
      (direction === "backward" ? backwardAnimation : forwardAnimation);

    console.log(`[自动判断] 方向: ${direction}, 动画: ${animationType}`);

    this.currentState = {
      animationType,
      isAnimating: true,
      direction,
    };

    this.updateHistory(newPath, direction);
    this.notify();
  }

  private determineDirection(
    newPath: string,
    navType: string
  ): "forward" | "backward" {
    // POP 一定是后退
    if (navType === "POP") {
      return "backward";
    }

    // 检查是否在历史中存在
    const lastIndex = this.routeHistory.lastIndexOf(newPath);
    if (lastIndex >= 0 && lastIndex < this.routeHistory.length - 1) {
      return "backward";
    }

    // 基于层级判断
    const routeHierarchy: Record<string, number> = {
      "/": 0,
      "/location": 1,
      "/device": 1,
      "/watch": 1,
    };

    const currentPath = this.routeHistory[this.routeHistory.length - 1] || "/";
    const currentLevel = routeHierarchy[currentPath] || 1;
    const newLevel = routeHierarchy[newPath] || 1;

    return newLevel < currentLevel ? "backward" : "forward";
  }

  private updateHistory(newPath: string, direction: "forward" | "backward") {
    if (direction === "forward") {
      this.routeHistory.push(newPath);
    } else {
      const index = this.routeHistory.lastIndexOf(newPath);
      if (index >= 0) {
        this.routeHistory = this.routeHistory.slice(0, index + 1);
      }
    }
    console.log(`[历史更新] [${this.routeHistory.join(" -> ")}]`);
  }

  finishAnimation() {
    this.currentState = {
      ...this.currentState,
      isAnimating: false,
    };
    this.notify();
  }

  getCurrentState() {
    return this.currentState;
  }

  initializeHistory(initialPath: string) {
    if (this.routeHistory.length === 0) {
      this.routeHistory = [initialPath];
      console.log(`[初始化历史] ${initialPath}`);
    }
  }
}

export const useRouteAnimation = (options: RouteAnimationOptions = {}) => {
  const {
    defaultAnimation = "page",
    routeAnimations = {},
    enableGesture = true,
    animationDuration = 300,
    forwardAnimation = "page",
    backwardAnimation = "fade",
  } = options;

  const location = useLocation();
  const navigationType = useNavigationType();
  const navigate = useNavigate();

  const manager = RouteAnimationManager.getInstance();
  const [animationState, setAnimationState] = useState<RouteAnimationState>(
    () => manager.getCurrentState()
  );

  const currentPathRef = useRef<string>("");
  const animationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isInitializedRef = useRef(false);

  // 订阅全局状态变化
  useEffect(() => {
    const unsubscribe = manager.subscribe(setAnimationState);
    return unsubscribe;
  }, []);

  // 监听路由变化
  useEffect(() => {
    const currentPath = location.pathname;

    // 初始化
    if (!isInitializedRef.current) {
      manager.initializeHistory(currentPath);
      currentPathRef.current = currentPath;
      isInitializedRef.current = true;
      return;
    }

    // 路径变化时通知管理器
    if (currentPath !== currentPathRef.current) {
      console.log(
        `\n📍 检测到路由变化: ${currentPathRef.current} -> ${currentPath}`
      );

      manager.onRouteChange(currentPath, navigationType, {
        forwardAnimation,
        backwardAnimation,
        routeAnimations,
      });

      currentPathRef.current = currentPath;

      // 清除之前的定时器
      if (animationTimerRef.current) {
        clearTimeout(animationTimerRef.current);
      }

      // 设置动画完成定时器
      animationTimerRef.current = setTimeout(() => {
        manager.finishAnimation();
      }, animationDuration);
    }

    return () => {
      if (animationTimerRef.current) {
        clearTimeout(animationTimerRef.current);
      }
    };
  }, [
    location.pathname,
    navigationType,
    forwardAnimation,
    backwardAnimation,
    routeAnimations,
    animationDuration,
  ]);

  // 增强的后退函数
  const goBack = useCallback(
    (animation?: AnimationType) => {
      const backAnimation = animation || backwardAnimation;
      console.log(`[预设后退] 动画: ${backAnimation}`);

      // 先预设动画，再执行导航
      manager.presetAnimation(backAnimation, "backward");

      // 稍微延迟执行，确保状态更新
      setTimeout(() => {
        navigate(-1);
      }, 16);
    },
    [navigate, backwardAnimation]
  );

  // 增强的导航函数
  const enhancedNavigate = useCallback(
    (
      to: string | number,
      options?: {
        replace?: boolean;
        state?: any;
        animation?: AnimationType;
        direction?: "forward" | "backward";
      }
    ) => {
      if (options?.animation) {
        console.log(`[预设导航] 目标: ${to}, 动画: ${options.animation}`);
        manager.presetAnimation(
          options.animation,
          options.direction || "forward"
        );

        setTimeout(() => {
          if (typeof to === "number") {
            navigate(to);
          } else {
            navigate(to, { replace: options?.replace, state: options?.state });
          }
        }, 16);
      } else {
        if (typeof to === "number") {
          navigate(to);
        } else {
          navigate(to, { replace: options?.replace, state: options?.state });
        }
      }
    },
    [navigate]
  );

  // 手动设置动画类型
  const setAnimationType = useCallback(
    (type: AnimationType) => {
      manager.presetAnimation(type, animationState.direction);
    },
    [animationState.direction]
  );

  return {
    ...animationState,
    setAnimationType,
    enhancedNavigate,
    goBack,
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
    forwardAnimation: "page" as AnimationType,
    backwardAnimation: "fade" as AnimationType,
  },

  // 桌面端动画
  desktop: {
    defaultAnimation: "fade" as AnimationType,
    routeAnimations: {},
    enableGesture: false,
    animationDuration: 200,
    forwardAnimation: "fade" as AnimationType,
    backwardAnimation: "fade" as AnimationType,
  },

  // 无动画模式
  none: {
    defaultAnimation: "fade" as AnimationType,
    routeAnimations: {},
    enableGesture: false,
    animationDuration: 0,
    forwardAnimation: "fade" as AnimationType,
    backwardAnimation: "fade" as AnimationType,
  },
};

// 检测设备类型
export const getDeviceType = (): "mobile" | "desktop" => {
  return /Mobi|Android/i.test(navigator.userAgent) ? "mobile" : "desktop";
};
