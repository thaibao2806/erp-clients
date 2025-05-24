import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  EditOutlined,
  CalendarOutlined,
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
  LockOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import {
  Dropdown,
  Tooltip,
  Avatar,
  Typography,
  Button,
  Tabs,
  Divider,
  Menu,
} from "antd";
import ApprovalSettingModal from "./ApprovalSettingModal";
import { useDispatch, useSelector } from "react-redux";
import { logOutUser } from "../redux/apiRequest";

const { Text } = Typography;
const { TabPane } = Tabs;

const notifications = [
  {
    id: 1,
    image:
      "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png",
    title: "Cập nhật hệ thống",
    time: "13/06/2022 04:42",
  },
  {
    id: 2,
    image:
      "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png",
    title: "Cập nhật tính năng mới",
    time: "14/06/2022 09:30",
  },
];

const reminders = [
  {
    id: 1,
    image:
      "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png",
    title: "Nhắc bạn duyệt phiếu kho",
    time: "15/06/2022 10:00",
  },
];

// Hàm lấy chữ viết tắt tên (ví dụ: "Nguyễn Văn A" -> "NA")
const getInitials = (name) => {
  if (!name) return "";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0][0];
  return parts[0][0] + parts[parts.length - 1][0];
};

// Hàm random màu
const getRandomColor = (seed) => {
  const colors = [
    "#f56a00",
    "#7265e6",
    "#ffbf00",
    "#00a2ae",
    "#1890ff",
    "#87d068",
  ];
  // Dựa trên seed để không random mỗi lần
  let index = seed
    ? seed.charCodeAt(0) % colors.length
    : Math.floor(Math.random() * colors.length);
  return colors[index];
};

const HeaderIcons = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeTab, setActiveTab] = useState("1"); // 1: Thông báo, 2: Nhắc nhở
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const user = useSelector((state) => state.auth.login?.currentUser);
  const initials = getInitials(user.data.fullName);
  const color = getRandomColor(initials);
  const handleItemClick = (type, id) => {
    if (type === "notification") {
      navigate(`/notifications/${id}`);
    } else if (type === "reminder") {
      navigate(`/reminders/${id}`);
    }
  };

  const renderItems = (items, type) =>
    items.map((item) => (
      <div
        key={`${type}-${item.id}`}
        style={{
          padding: "10px 16px",
          cursor: "pointer",
          transition: "background 0.3s",
        }}
        onClick={() => handleItemClick(type, item.id)}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f5f5")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <Avatar src={item.image} size={32} style={{ marginRight: 10 }} />
          <div>
            <Text strong>{item.title}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {item.time}
            </Text>
          </div>
        </div>
        <Divider style={{ margin: "8px 0" }} />
      </div>
    ));

  const handleLogOut = () => {
    logOutUser(dispatch, navigate);
  };

  const notificationMenu = (
    <div
      style={{
        width: 350,
        maxHeight: 400,
        background: "#fff",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        borderRadius: 8,
        overflow: "hidden",
      }}
    >
      <Tabs
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key)}
        centered
        style={{ padding: "8px 0 0 0" }}
      >
        <TabPane tab="Thông báo" key="1">
          <div style={{ maxHeight: 250, overflowY: "auto" }}>
            {renderItems(notifications, "notification")}
          </div>
        </TabPane>
        <TabPane tab="Nhắc nhở" key="2">
          <div style={{ maxHeight: 250, overflowY: "auto" }}>
            {renderItems(reminders, "reminder")}
          </div>
        </TabPane>
      </Tabs>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "8px 16px",
          borderTop: "1px solid #f0f0f0",
          background: "#ffffff",
        }}
      >
        <Button type="link" onClick={() => navigate("/notifications")}>
          Xem tất cả
        </Button>
        <Button type="link" onClick={() => console.log("Đánh dấu đã đọc")}>
          Đánh dấu đã đọc
        </Button>
      </div>
    </div>
  );

  const accountMenu = (
    <Menu>
      <Menu.Item
        key="profile"
        icon={<UserOutlined />}
        onClick={() => navigate("/profile")}
      >
        Tài khoản
      </Menu.Item>
      <Menu.Item
        key="change-password"
        icon={<LockOutlined />}
        onClick={() => navigate("/change-password")}
      >
        Đổi mật khẩu
      </Menu.Item>
      <Menu.Item
        key="setting-review"
        icon={<CheckCircleOutlined />}
        onClick={() => setApprovalModalOpen(true)}
      >
        Thiết lập xét duyệt
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item
        key="logout"
        icon={<LogoutOutlined />}
        style={{ color: "red" }}
        onClick={handleLogOut}
      >
        Đăng xuất
      </Menu.Item>
    </Menu>
  );

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "35px" }}>
      <Tooltip title="Xét duyệt">
        <EditOutlined
          style={{ fontSize: "20px", cursor: "pointer" }}
          onClick={() => navigate("/review")}
        />
      </Tooltip>

      <Tooltip title="Lịch">
        <CalendarOutlined
          style={{ fontSize: "20px", cursor: "pointer" }}
          onClick={() => navigate("/calendar")}
        />
      </Tooltip>

      <Dropdown
        overlay={notificationMenu}
        trigger={["click"]}
        placement="bottomRight"
        onOpenChange={setShowNotifications}
      >
        <Tooltip>
          <BellOutlined
            style={{
              fontSize: "20px",
              cursor: "pointer",
              color: showNotifications ? "#1890ff" : "inherit",
            }}
          />
        </Tooltip>
      </Dropdown>

      <Dropdown
        overlay={accountMenu}
        trigger={["click"]}
        placement="bottomRight"
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            cursor: "pointer",
            gap: "8px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              lineHeight: "1",
              whiteSpace: "nowrap",
              textAlign: "right",
            }}
          >
            <span style={{ fontWeight: 600, fontSize: "16px" }}>
              {user.data.fullName}
            </span>
            <span
              style={{
                fontSize: "12px",
                color: "#999",
                fontWeight: 500,
                paddingTop: "4px",
              }}
            >
              {user.data.department}
            </span>
          </div>

          <Avatar style={{ backgroundColor: color }}>
            {initials.toUpperCase()}
          </Avatar>
        </div>
      </Dropdown>

      <ApprovalSettingModal
        open={approvalModalOpen}
        onClose={() => setApprovalModalOpen(false)}
      />
    </div>
  );
};

export default HeaderIcons;
