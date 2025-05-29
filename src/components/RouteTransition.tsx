import React from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import { useLocation } from "react-router-dom";
import "./RouteTransition.css";

interface RouteTransitionProps {
  children: React.ReactNode;
}

const RouteTransition: React.FC<RouteTransitionProps> = ({ children }) => {
  const location = useLocation();

  return (
    <TransitionGroup className="route-transition-group">
      <CSSTransition
        key={location.pathname}
        classNames="page"
        timeout={300}
        unmountOnExit
      >
        <div className="page-wrapper">{children}</div>
      </CSSTransition>
    </TransitionGroup>
  );
};

export default RouteTransition;
