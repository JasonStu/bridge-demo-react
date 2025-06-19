import { useState } from 'react';
import nativeBridge from 'h5-native-bridge';
import type { NativeResponse } from 'h5-native-bridge';
import dd,{} from "dingtalk-jsapi"
import { NavBar, Space, Toast } from "antd-mobile";
import { useNavigate } from "react-router-dom";
import {
  useRouteAnimation,
  animationPresets,
  getDeviceType,
} from "../hooks/useRouteAnimation";
const DevicePanel = () => {
  const navigate = useNavigate();
  const { goBack } = useRouteAnimation();
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [wifiList, setWifiList] = useState<any[] | null>(null);
  const [vibrateStatus, setVibrateStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const getDeviceInfo = () => {
    setStatus('loading');
    setErrorMessage('');
    // dd.device.geolocation.get({
    //   targetAccuracy: 200,
    //   coordinate: 1,
    //   withReGeocode: false,
    //   useCache: false
    // })
 
    nativeBridge.getWifiList({
     
    }).then((info) => {

      setWifiList(info.wifiList as []);

      setStatus('success');
    })
    .catch((error) => {
      setErrorMessage(error.message);
      setStatus('error');
    });
  };

  const vibrate = () => {
    setVibrateStatus('idle');
    
 
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
        wifi信息
      </NavBar>
      <div className="panel">
        <div className="panel-header">
          <h2 className="panel-title">wifi信息</h2>
        </div>
        <p className="panel-description">获取wifiList功能</p>

        <div>
          <button onClick={getDeviceInfo}>获取WIFI</button>
        </div>

        {status === "loading" && (
          <div className="status loading">
            <span className="loader"></span>
            <span>正在获取设备信息...</span>
          </div>
        )}

        {status === "success" && wifiList && (
          <div className="device-info">{JSON.stringify(wifiList, null, 2)}</div>
        )}

        {status === "error" && (
          <div className="error">获取设备信息失败: {errorMessage}</div>
        )}
      </div>
    </div>
  );
};

export default DevicePanel;