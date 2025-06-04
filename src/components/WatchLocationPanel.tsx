import { useState, useEffect } from "react";
import nativeBridge from "h5-native-bridge";
import type { LocationInfo } from "h5-native-bridge";
import src from "../../node_modules/vite/client.d";
import { NavBar, Space, Toast, Image } from "antd-mobile";
import { useNavigate } from "react-router-dom";
import {
  useRouteAnimation,
  animationPresets,
  getDeviceType,
} from "../hooks/useRouteAnimation";
import bgImage from "../assets/bg_image.png";
interface LocationRecord extends LocationInfo {
  timestamp: number;
  formattedTime: string;
}

const WatchLocationPanel = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [location, setLocation] = useState<string | null>(null);
  const [imgUrl, setImgUrl] = useState<string>(
    "https://res.wx.qq.com/wxdoc/dist/assets/img/vConsole-game.e52b59be.jpg"
  );
  const demoSrc =
    "https://images.unsplash.com/photo-1567945716310-4745a6b7844b?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1500&q=60";
  const demoSrc2 =
    "https://images.unsplash.com/photo-1620476214170-1d8080f65cdb?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=3150&q=80";
  const demoSrc3 =
    "https://images.unsplash.com/photo-1567945716310-4745a6b7844b?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=3000&q=60";
  const demoSrc4 =
    "https://images.unsplash.com/photo-1567945716310-4745a6b7844b?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=6000&q=60";
  const demoSrc5 =
    "https://images.unsplash.com/photo-1567945716310-4745a6b7844b?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=9000&q=60";
  const { goBack } = useRouteAnimation();

  const getLocation = () => {
    setStatus("loading");
    setErrorMessage("");

    nativeBridge
      .saveImage({
        url: imgUrl,
      })
      .then((location) => {
        setLocation(location.data.file);
        setStatus("success");
      })
      .catch((error) => {
        setErrorMessage(error.message);
      });
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
        图片信息
      </NavBar>
      <div className="panel">
        <div className="panel-header">
          <h2 className="panel-title">图片信息</h2>
        </div>
        <img
          src={imgUrl}
          style={{
            width: 200,
            height: 200,
          }}
        />

        <button onClick={getLocation}>保存图片</button>

        {status === "loading" && (
          <div className="status loading">
            <span className="loader"></span>
            <span>正在获取位置...</span>
          </div>
        )}

        {status === "success" && location && (
          <div className="result">
            <div className="result-item">
              <span className="result-label">保存成功{location}</span>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="error">获取位置失败: {errorMessage}</div>
        )}
      </div>
      <div>
        <Space wrap direction={"vertical"}>
          <Image src={demoSrc} width={"100%"} height={"100%"} fit="fill" />
          <Image src={demoSrc2} width={"100%"} height={"100%"} fit="contain" />
          <Image src={demoSrc3} width={"100%"} height={"100%"} fit="cover" />
          <Image
            src={demoSrc4}
            width={"100%"}
            height={"100%"}
            fit="scale-down"
          />
          <Image src={bgImage} width={"100%"} height={"100%"} fit="fill" />
        </Space>
      </div>
    </div>
  );
};

export default WatchLocationPanel;
