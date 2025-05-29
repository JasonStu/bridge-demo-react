import React, { useEffect, useState, useRef } from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import { useLocation, useNavigate } from "react-router-dom";
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
  const [transitionName, setTransitionName] = useState("page");
  const [isGestureActive, setIsGestureActive] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 手势相关状态
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  // 路由历史管理
  const routeHistory = useRef<string[]>([]);

  useEffect(() => {
    // 更新路由历史
    if (!routeHistory.current.includes(location.pathname)) {
      routeHistory.current.push(location.pathname);
    }
  }, [location.pathname]);

  // 手势开始
  const handleTouchStart = (e: TouchEvent) => {
    if (!enableGesture || isGestureActive) return;

    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
  };

  // 手势移动
  const handleTouchMove = (e: TouchEvent) => {
    if (!enableGesture || isGestureActive) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;

    // 判断是否开始拖拽（水平滑动且超过阈值）
    if (
      Math.abs(deltaX) > 10 &&
      Math.abs(deltaX) > Math.abs(deltaY) &&
      !isDragging
    ) {
      setIsDragging(true);

      // 应用实时变换
      if (containerRef.current) {
        const progress = Math.min(Math.abs(deltaX) / window.innerWidth, 1);
        const transform =
          deltaX > 0
            ? `translateX(${Math.min(deltaX, window.innerWidth)}px)`
            : `translateX(${Math.max(deltaX, -window.innerWidth)}px)`;

        containerRef.current.style.transform = transform;
        containerRef.current.style.transition = "none";
      }
    }
  };

  // 手势结束
  const handleTouchEnd = (e: TouchEvent) => {
    if (!enableGesture || !isDragging) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStart.x;
    const threshold = window.innerWidth * 0.3; // 30% 的屏幕宽度作为阈值

    // 重置状态
    setIsDragging(false);

    if (containerRef.current) {
      containerRef.current.style.transition = "";
      containerRef.current.style.transform = "";
    }

    // 判断是否触发路由切换
    if (Math.abs(deltaX) > threshold) {
      setIsGestureActive(true);

      if (deltaX > 0 && location.pathname !== "/") {
        // 右滑 - 返回上一页
        setTransitionName("page-back");
        navigate(-1);
      } else if (deltaX < 0) {
        // 左滑 - 可以实现前进逻辑（如果有的话）
        // 这里可以根据需要实现
      }

      // 重置手势状态
      setTimeout(() => {
        setIsGestureActive(false);
      }, 300);
    }
  };

  // 绑定手势事件
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !enableGesture) return;

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
  }, [enableGesture, isGestureActive, isDragging, touchStart]);

  return (
    <div ref={containerRef} className="route-transition-group">
      <TransitionGroup>
        <CSSTransition
          key={location.pathname}
          classNames={transitionName}
          timeout={300}
          unmountOnExit
        >
          <div className="page-wrapper">{children}</div>
        </CSSTransition>
      </TransitionGroup>
    </div>
  );
};

export default GestureRouteTransition;
