import React, { useEffect, useState } from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import { useLocation, useNavigationType } from "react-router-dom";
import "./RouteTransition.css";

interface AdvancedRouteTransitionProps {
  children: React.ReactNode;
}

// 路由层级定义 - 用于判断前进还是后退
const routeHierarchy: Record<string, number> = {
  "/": 0,
  "/location": 1,
  "/device": 1,
  "/watch": 1,
};

const AdvancedRouteTransition: React.FC<AdvancedRouteTransitionProps> = ({
  children,
}) => {
  const location = useLocation();
  const navigationType = useNavigationType();
  const [transitionName, setTransitionName] = useState("page");
  const [previousPath, setPreviousPath] = useState("/");

  useEffect(() => {
    const currentLevel = routeHierarchy[location.pathname] || 1;
    const previousLevel = routeHierarchy[previousPath] || 0;

    // 根据导航类型和路由层级确定动画类型
    let animationType = "page";

    if (navigationType === "POP" || currentLevel < previousLevel) {
      // 后退动画
      animationType = "page-back";
    } else if (location.pathname === "/") {
      // 回到首页使用淡入淡出
      animationType = "fade";
    } else {
      // 前进动画
      animationType = "page";
    }

    setTransitionName(animationType);
    setPreviousPath(location.pathname);
  }, [location.pathname, navigationType, previousPath]);

  return (
    <TransitionGroup className="route-transition-group">
      <CSSTransition
        key={location.pathname}
        classNames={transitionName}
        timeout={300}
        unmountOnExit
      >
        <div className="page-wrapper">{children}</div>
      </CSSTransition>
    </TransitionGroup>
  );
};

export default AdvancedRouteTransition;
