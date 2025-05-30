import { useState } from "react";
import nativeBridge from "h5-native-bridge";
import type { LocationInfo } from "h5-native-bridge";
import dd from "dingtalk-jsapi";
import { NavBar, Space, Toast } from "antd-mobile";
import { useNavigate } from "react-router-dom";
import {
  useRouteAnimation,
  animationPresets,
  getDeviceType,
} from "../hooks/useRouteAnimation";

const LocationPanel = () => {
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [location, setLocation] = useState<LocationInfo | null>(null);
  const navigate = useNavigate();
  const { goBack } = useRouteAnimation();
  const getLocation = () => {
    setStatus("loading");
    setErrorMessage("");

    nativeBridge
      .getLocation({
        enableHighAccuracy: true,
        timeout: 8000,
      })
      .then((location) => {
        console.log("获取位置成功:", location);
        setLocation(location);
        setStatus("success");
      })
      .catch((error) => {
        setErrorMessage(error.message);
      });
  };

  // 处理返回导航
  const handleGoBack = () => {
    goBack("fade");
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
      }}
    >
      <NavBar onBack={handleGoBack}>位置服务</NavBar>

      <div className="panel">
        <div className="panel-header">
          <h2 className="panel-title">位置服务</h2>
        </div>
        <p className="panel-description">调用原生接口获取当前位置信息</p>

        <button onClick={getLocation}>获取位置</button>

        {status === "loading" && (
          <div className="status loading">
            <span className="loader"></span>
            <span>正在获取位置...</span>
          </div>
        )}

        {status === "success" && location && (
          <div className="result">
            <div className="result-item">
              <span className="result-label">纬度</span>
              <span className="result-value">{location.latitude}</span>
            </div>
            <div className="result-item">
              <span className="result-label">经度</span>
              <span className="result-value">{location.longitude}</span>
            </div>
            <div className="result-item">
              <span className="result-label">精度</span>
              <span className="result-value">{location.accuracy} 米</span>
            </div>
            {location.address && (
              <div className="result-item">
                <span className="result-label">地址</span>
                <span className="result-value">{location.address}</span>
              </div>
            )}
            {location.city && (
              <div className="result-item">
                <span className="result-label">城市</span>
                <span className="result-value">{location.city}</span>
              </div>
            )}
          </div>
        )}

        {status === "error" && (
          <div className="error">获取位置失败: {errorMessage}</div>
        )}
      </div>
    </div>
  );
};

export default LocationPanel;
