import React, { ReactNode, useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { createShadowInstance, deleteShadowInstance } from "./styleLoader";

export const CssBoundary = ({ children, init }: { children: ReactNode; init?: ShadowRootInit }) => {
  const id = useRef(`${Date.now() + Math.random()}`);
  const [appPlaceholder, setAppPlaceholder] = useState<ShadowRoot>();

  useEffect(() => {
    const placeholder = createShadowInstance(id.current, init);
    setAppPlaceholder(placeholder);
    return () => {
      deleteShadowInstance(id.current);
    };
  }, [init]);

  return <div id={id.current}>{appPlaceholder && ReactDOM.createPortal(children, appPlaceholder)}</div>;
};
