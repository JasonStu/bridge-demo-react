import React, { useState } from "react";
import { getDeviceType, type AnimationType } from "../hooks/useRouteAnimation";
import { Button, Popup, Radio, Space } from "antd-mobile";

interface AnimationControllerProps {
  visible: boolean;
  onClose: () => void;
}

const AnimationController: React.FC<AnimationControllerProps> = ({
  visible,
  onClose,
}) => {
  const deviceType = getDeviceType();
  const [currentAnimation, setCurrentAnimation] =
    useState<AnimationType>("page");

  // 重置导航历史（用于调试）
  const handleResetHistory = () => {
    // 清除浏览器历史状态
    if (window.history.replaceState) {
      window.history.replaceState(null, "", window.location.pathname);
    }

    // 刷新页面以重置状态
    window.location.reload();
  };

  const animationOptions: { label: string; value: AnimationType }[] = [
    { label: "滑动 (默认)", value: "page" },
    { label: "后退滑动", value: "page-back" },
    { label: "淡入淡出", value: "fade" },
    { label: "缩放", value: "scale" },
    { label: "向上滑动", value: "slide-up" },
    { label: "向下滑动", value: "slide-down" },
    { label: "3D翻转", value: "flip" },
  ];

  return (
    <Popup
      visible={visible}
      onMaskClick={onClose}
      position="bottom"
      bodyStyle={{
        borderTopLeftRadius: "16px",
        borderTopRightRadius: "16px",
        minHeight: "40vh",
        padding: "20px",
      }}
    >
      <div>
        {/* 标题栏 */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h3 style={{ margin: 0 }}>🎨 动画控制面板</h3>
          <Button
            size="small"
            fill="none"
            onClick={onClose}
            style={{ padding: "4px 8px" }}
          >
            关闭
          </Button>
        </div>

        {/* 当前状态显示 */}
        <div
          style={{
            background: "#f5f5f5",
            padding: "16px",
            borderRadius: "8px",
            marginBottom: "20px",
          }}
        >
          <h4 style={{ margin: "0 0 8px 0" }}>📊 当前状态</h4>
          <div style={{ fontSize: "14px", lineHeight: "1.6" }}>
            <div>
              🎬 动画类型: <strong>{currentAnimation}</strong>
            </div>
            <div>
              📱 设备类型: <strong>{deviceType}</strong>
            </div>
            <div>
              👆 手势:{" "}
              <strong>{deviceType === "mobile" ? "启用" : "禁用"}</strong>
            </div>
          </div>
        </div>

        {/* 动画类型选择 */}
        <div style={{ marginBottom: "20px" }}>
          <h4 style={{ margin: "0 0 12px 0" }}>🎭 选择动画类型</h4>
          <Radio.Group
            value={currentAnimation}
            onChange={(val) => setCurrentAnimation(val as AnimationType)}
          >
            <Space direction="vertical" style={{ width: "100%" }}>
              {animationOptions.map((option) => (
                <Radio
                  key={option.value}
                  value={option.value}
                  style={{ width: "100%" }}
                >
                  {option.label}
                </Radio>
              ))}
            </Space>
          </Radio.Group>
        </div>

        {/* 预设配置 */}
        <div style={{ marginBottom: "20px" }}>
          <h4 style={{ margin: "0 0 12px 0" }}>⚙️ 预设配置</h4>
          <Space wrap>
            <Button
              size="small"
              color="primary"
              onClick={() => setCurrentAnimation("page")}
            >
              📱 移动端
            </Button>
            <Button
              size="small"
              color="primary"
              onClick={() => setCurrentAnimation("fade")}
            >
              💻 桌面端
            </Button>
            <Button size="small" onClick={() => setCurrentAnimation("fade")}>
              🚫 无动画
            </Button>
          </Space>
        </div>

        {/* 调试工具 */}
        <div style={{ marginBottom: "20px" }}>
          <h4 style={{ margin: "0 0 12px 0" }}>🔧 调试工具</h4>
          <Space wrap>
            <Button size="small" color="warning" onClick={handleResetHistory}>
              🔄 重置导航历史
            </Button>
          </Space>
          <div
            style={{
              fontSize: "12px",
              color: "#666",
              marginTop: "8px",
            }}
          >
            如果动画不正确，可以尝试重置导航历史
          </div>
        </div>

        {/* 使用说明 */}
        <div
          style={{
            background: "#e8f4ff",
            padding: "12px",
            borderRadius: "8px",
            fontSize: "13px",
            color: "#666",
          }}
        >
          <h5 style={{ margin: "0 0 8px 0", color: "#333" }}>💡 动画规则</h5>
          <ul style={{ margin: 0, paddingLeft: "16px" }}>
            <li>
              <strong>前进动画</strong>：首页→子页面 使用 page (滑动)
            </li>
            <li>
              <strong>后退动画</strong>：子页面→首页 使用 fade (淡入淡出)
            </li>
            <li>
              <strong>手势返回</strong>：右滑返回也使用 fade 动画
            </li>
            <li>
              <strong>浏览器按钮</strong>：前进/后退按钮遵循相同规则
            </li>
          </ul>
        </div>
      </div>
    </Popup>
  );
};

export default AnimationController;
