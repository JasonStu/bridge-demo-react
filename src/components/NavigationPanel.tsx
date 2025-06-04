import { useState } from "react";
import nativeBridge  from "h5-native-bridge";

import { Button, NavBar, Space, Toast } from "antd-mobile";
import { useNavigate } from "react-router-dom";
import {
  useRouteAnimation,
  animationPresets,
  getDeviceType,
} from "../hooks/useRouteAnimation";

const NavigateType = {
  Back: "Back", // 当前页返回
  Forward: "Forward", // 当前页前进
  Push: "Push", // 打开新页
  Pop: "Pop", // 关闭当前页
} as const;

type NavigateType = (typeof NavigateType)[keyof typeof NavigateType];


const NavigatePanel = () => {
  const navigate = useNavigate();

  const { goBack } = useRouteAnimation();

  const navMethod = async (type: NavigateType,url:string,data:any) => {
    try {
			console.log("nativeBridge", nativeBridge);
			
      const res = await nativeBridge.navigate({ type ,url,data});
      console.log(res);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
      }}
    >
      <NavBar
        onBack={() => {
          goBack();
        }}
      >
        原生路由,H5路由跳转
      </NavBar>
      <Space justify="between" direction="vertical" block align="center">
        <Button
          style={{ width: 200 }}
          onClick={() =>
            navMethod(NavigateType.Push, "/location", {
              info: "打开新页",
            })
          }
        >
          Push 打开新页
        </Button>
        <Button
          style={{ width: 200 }}
          onClick={() =>
            navMethod(NavigateType.Pop, "", {
              info: "关闭当前页",
            })
          }
        >
          Pop 关闭当前页
        </Button>
        <Button
          style={{ width: 200 }}
          onClick={() =>
            navMethod(NavigateType.Forward, "/location", {
              info: "当前页前进",
            })
          }
        >
          Forward 当前页前进
        </Button>
        <Button
          style={{ width: 200 }}
          onClick={() =>
            navMethod(NavigateType.Back, "", {
              info: "当前页返回",
            })
          }
        >
          Back 当前页返回
        </Button>
      </Space>
    </div>
  );
};

export default NavigatePanel;
