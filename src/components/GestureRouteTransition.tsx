import React, { useEffect, useState, useRef } from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import { useLocation, useNavigate } from "react-router-dom";
import {
  useRouteAnimation,
  animationPresets,
  getDeviceType,
	
} from "../hooks/useRouteAnimation";
import "./RouteTransition.css";

interface GestureRouteTransitionProps {
  children: React.ReactNode;
  enableGesture?: boolean;
}

const GestureRouteTransition: React.FC<GestureRouteTransitionProps> = ({
  children,
  enableGesture = true,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  // 使用路由动画Hook - 配置前进和后退动画
  const deviceType = getDeviceType();
  const animationConfig = {
    defaultAnimation: "page" as const,
    enableGesture,
    animationDuration: deviceType === "mobile" ? 250 : 300,
    // 关键配置：前进使用page动画，后退使用fade动画
    forwardAnimation: "page" as const, // 跳转到新路由
    backwardAnimation: "fade" as const, // 返回上一级
    // 特殊路由的动画配置（可选）
    routeAnimations: {
      // 例：首页总是使用淡入淡出
      "/": "fade" as const,
      // 例：设备页面使用向上滑动
      // '/device': 'slide-up' as const,
    },
  };

  const { animationType, isAnimating, direction } =
    useRouteAnimation(animationConfig);

  // 手势相关状态 - 简化状态管理
  const [gestureState, setGestureState] = useState({
    touchStartX: 0,
    isDragging: false,
    isGestureActive: false,
  });

  // 手势处理函数 - 合并到一个对象中避免重复定义
  const gestureHandlers = {
    handleTouchStart: (e: TouchEvent) => {
      if (!enableGesture || gestureState.isGestureActive || isAnimating) return;

      const touch = e.touches[0];
      setGestureState((prev) => ({
        ...prev,
        touchStartX: touch.clientX,
      }));
    },

    handleTouchMove: (e: TouchEvent) => {
      if (!enableGesture || gestureState.isGestureActive || isAnimating) return;

      const touch = e.touches[0];
      const deltaX = touch.clientX - gestureState.touchStartX;

      // 判断是否开始拖拽
      if (Math.abs(deltaX) > 15 && !gestureState.isDragging) {
        // 只允许右滑返回
        if (deltaX > 0 && location.pathname !== "/") {
          setGestureState((prev) => ({ ...prev, isDragging: true }));

          // 应用实时变换
          if (containerRef.current) {
            const progress = Math.min(deltaX / window.innerWidth, 1);
            const transform = `translateX(${Math.min(
              deltaX * 0.3,
              window.innerWidth * 0.3
            )}px)`;

            containerRef.current.style.transform = transform;
            containerRef.current.style.transition = "none";
            containerRef.current.style.opacity = `${1 - progress * 0.2}`;
          }
        }
      }
    },

    handleTouchEnd: (e: TouchEvent) => {
      if (!enableGesture || !gestureState.isDragging) return;

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - gestureState.touchStartX;
      const threshold = window.innerWidth * 0.25;

      // 重置视觉状态
      if (containerRef.current) {
        containerRef.current.style.transition = "";
        containerRef.current.style.transform = "";
        containerRef.current.style.opacity = "";
      }

      // 判断是否触发路由切换
      if (
        Math.abs(deltaX) > threshold &&
        deltaX > 0 &&
        location.pathname !== "/"
      ) {
        setGestureState((prev) => ({ ...prev, isGestureActive: true }));

        console.log("[手势返回] 触发手势返回，将使用后退动画");

        // 右滑返回上一页 - 这里会触发 POP 导航，自动使用 fade 动画
        navigate(-1);

        // 重置手势状态
        setTimeout(() => {
          setGestureState((prev) => ({
            ...prev,
            isGestureActive: false,
            isDragging: false,
          }));
        }, 350);
      } else {
        // 重置拖拽状态
        setGestureState((prev) => ({ ...prev, isDragging: false }));
      }
    },
  };

  // 绑定手势事件 - 简化依赖项
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !enableGesture) return;

    const { handleTouchStart, handleTouchMove, handleTouchEnd } =
      gestureHandlers;

    container.addEventListener("touchstart", handleTouchStart, {
      passive: false,
    });
    container.addEventListener("touchmove", handleTouchMove, {
      passive: false,
    });
    container.addEventListener("touchend", handleTouchEnd, { passive: false });

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
    };
  }, [
    enableGesture,
    gestureState.touchStartX,
    gestureState.isDragging,
    gestureState.isGestureActive,
    location.pathname,
    isAnimating,
  ]);
	 console.log("location.animationType====>", animationType);
	 

  return (
    <div ref={containerRef} className="route-transition-group">
      <TransitionGroup>
        <CSSTransition
          key={location.pathname}
          classNames={animationType}
          timeout={animationConfig.animationDuration}
          unmountOnExit
        >
          <div className="page-wrapper">{children}</div>
        </CSSTransition>
      </TransitionGroup>

      {/* 调试信息 - 只在开发环境显示 */}
      {process.env.NODE_ENV === "development" && (
        <div
          style={{
            position: "fixed",
            top: 10,
            right: 10,
            background: "rgba(0,0,0,0.8)",
            color: "white",
            padding: "5px 10px",
            borderRadius: "5px",
            fontSize: "12px",
            zIndex: 9999,
            pointerEvents: "none",
          }}
        >
          {animationType} | {direction} | {isAnimating ? "动画中" : "空闲"}
        </div>
      )}
    </div>
  );
};

export default GestureRouteTransition;
