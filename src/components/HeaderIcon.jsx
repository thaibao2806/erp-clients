import React, { useEffect, useRef, useState } from "react";
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
  notification,
  Badge,
} from "antd";
import ApprovalSettingModal from "./ApprovalSettingModal";
import { useDispatch, useSelector } from "react-redux";
import { logOutUser } from "../redux/apiRequest";
import {
  fetchUnreadNotifications,
  getAllNotification,
  markNotificationAsRead,
} from "../services/notificationApi";
import { getAvatar } from "../services/apiAuth";
import { HubConnectionBuilder, HttpTransportType } from "@microsoft/signalr";
import { jwtDecode } from "jwt-decode";
import { url } from "../config/config";
import dayjs from "dayjs";

const { Text } = Typography;
const { TabPane } = Tabs;

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
  let index = seed
    ? seed.charCodeAt(0) % colors.length
    : Math.floor(Math.random() * colors.length);
  return colors[index];
};

const HeaderIcons = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeTab, setActiveTab] = useState("1");
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const user = useSelector((state) => state.auth.login?.currentUser);
  const initials = getInitials(user.data.fullName);
  const color = getRandomColor(initials);
  const connectionRef = useRef(null);
  const [userId, setUserId] = useState(null);
  const [api, contextHolder] = notification.useNotification();
  const [avatarUrl, setAvatarUrl] = useState(null);
  // Lấy userId từ token
  useEffect(() => {
    if (user && user.data.token) {
      try {
        const decode = jwtDecode(user.data.token);
        setUserId(decode.nameid);
        loadAvatar(decode.nameid);
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, [user]);

  const loadAvatar = async (id) => {
    try {
      const res = await getAvatar(id);
      const url = URL.createObjectURL(res.data);
      setAvatarUrl(url);
    } catch (error) {
      // Không có avatar thì bỏ qua
    }
  };

  // Kết nối SignalR và load notifications
  useEffect(() => {
    if (!userId) {
      return;
    }

    let isComponentMounted = true;

    const loadNotifications = async () => {
      try {
        const res = await getAllNotification();
        if (isComponentMounted && res && res.data) {
          setNotifications(res.data.data);
        }
      } catch (err) {
        console.error("Error loading notifications:", err);
      }
    };

    const connectSignalR = async () => {
      // Đóng connection cũ nếu có
      if (connectionRef.current) {
        try {
          await connectionRef.current.stop();
          console.log("Previous connection stopped");
        } catch (error) {
          console.log("Error stopping previous connection:", error);
        }
        connectionRef.current = null;
      }

      const connection = new HubConnectionBuilder()
        .withUrl(`${url}/hubs/notification`, {
          transport: HttpTransportType.LongPolling,
          accessTokenFactory: () => {
            return user?.data?.token || "";
          },
          headers: {
            "ngrok-skip-browser-warning": "69420",
          },
        })
        .withAutomaticReconnect([0, 2000, 10000, 30000])
        .build();

      // Xử lý khi nhận thông báo
      connection.on("ReceiveNotification", (notificationData) => {
        if (!isComponentMounted) {
          return;
        }

        // Thêm vào danh sách notifications
        setNotifications((prev) => {
          const newNotifications = [notificationData, ...prev];
          return newNotifications;
        });

        // Hiển thị notification popup
        api.info({
          message: notificationData.title || "Thông báo mới",
          description:
            notificationData.message ||
            notificationData.content ||
            "Bạn có thông báo mới",
          placement: "bottomRight",
          duration: 5,
          icon: <BellOutlined style={{ color: "#1890ff" }} />,
        });
      });

      // Xử lý các sự kiện connection
      connection.onclose((error) => {
        console.log("SignalR connection closed:", error);
      });

      connection.onreconnecting((error) => {
        console.log("SignalR reconnecting:", error);
      });

      connection.onreconnected((connectionId) => {
        console.log("SignalR reconnected with ID:", connectionId);
      });

      try {
        await connection.start();
        connectionRef.current = connection;
      } catch (err) {
        console.error("❌ SignalR connection error:", err);

        if (isComponentMounted) {
          api.error({
            message: "Lỗi kết nối",
            description: "Không thể kết nối đến server thông báo",
            placement: "bottomRight",
            duration: 4,
          });
        }
      }
    };

    // Load notifications và kết nối SignalR
    loadNotifications();
    connectSignalR();

    // Cleanup function
    return () => {
      console.log("Cleaning up SignalR connection");
      isComponentMounted = false;

      if (connectionRef.current) {
        connectionRef.current.stop().catch((error) => {
          console.log("Error stopping connection on cleanup:", error);
        });
        connectionRef.current = null;
      }
    };
  }, [userId, api]); // Chỉ phụ thuộc vào userId và api

  const handleMarkAllAsRead = async () => {
    try {
      if (notifications.length === 0) return;

      // Lấy danh sách những thông báo chưa đọc
      const unreadNotifications = notifications.filter((n) => !n.isRead);

      if (unreadNotifications.length === 0) {
        api.info({
          message: "Thông tin",
          description: "Tất cả thông báo đã được đọc",
          placement: "bottomRight",
          duration: 2,
        });
        return;
      }

      // Gọi API đánh dấu đã đọc cho tất cả thông báo chưa đọc
      await Promise.all(
        unreadNotifications.map((n) => markNotificationAsRead(n.id))
      );

      // Cập nhật state ngay lập tức
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));

      api.success({
        message: "Thành công",
        description: "Đã đánh dấu tất cả thông báo là đã đọc",
        placement: "bottomRight",
        duration: 2,
      });
    } catch (err) {
      console.error("Error marking as read:", err);
      api.error({
        message: "Lỗi",
        description: "Không thể đánh dấu thông báo đã đọc",
        placement: "bottomRight",
        duration: 3,
      });
    }
  };

  const handleNotificationClick = async (notification) => {
    try {
      await markNotificationAsRead(notification.id);

      // Thay thế dòng comment cũ bằng cập nhật trạng thái isRead
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n))
      );

      navigate(notification.link);
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  const renderItems = (items) =>
    items.map((item) => (
      <div
        key={item.id}
        style={{
          padding: "10px 16px",
          cursor: "pointer",
          backgroundColor: item.isRead ? "transparent" : "#e6f7ff",
        }}
        onClick={() => handleNotificationClick(item)}
        onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f5f5")}
        onMouseLeave={(e) =>
          (e.currentTarget.style.background = item.isRead
            ? "transparent"
            : "#e6f7ff")
        }
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <div>
            <Text strong>{item.content}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {dayjs(item.createdAt).format("DD/MM/YYYY")}
            </Text>
          </div>
        </div>
        <Divider style={{ margin: "8px 0" }} />
      </div>
    ));

  const handleLogOut = () => {
    // Đóng SignalR connection trước khi logout
    if (connectionRef.current) {
      connectionRef.current.stop().catch(console.log);
      connectionRef.current = null;
    }
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
        {/* <TabPane tab="Nhắc nhở" key="2">
          <div style={{ maxHeight: 250, overflowY: "auto" }}>
            {renderItems(notifications, "reminder")}
          </div>
        </TabPane> */}
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
        <Button type="link" onClick={handleMarkAllAsRead}>
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
      {user.data.userName === "ADMIN" ? (
        <>
          <Menu.Item
            key="setting-review"
            icon={<CheckCircleOutlined />}
            onClick={() => setApprovalModalOpen(true)}
          >
            Thiết lập xét duyệt
          </Menu.Item>
        </>
      ) : (
        <></>
      )}

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
    <>
      {contextHolder}
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
          <Tooltip title="Thông báo">
            <Badge
              count={notifications.filter((n) => !n.isRead).length}
              size="small"
            >
              <BellOutlined
                style={{
                  fontSize: "20px",
                  cursor: "pointer",
                  color: showNotifications ? "#1890ff" : "inherit",
                }}
              />
            </Badge>
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
            {avatarUrl ? (
              <>
                <Avatar src={avatarUrl} />
              </>
            ) : (
              <>
                <Avatar style={{ backgroundColor: color }}>
                  {initials.toUpperCase()}
                </Avatar>
              </>
            )}
          </div>
        </Dropdown>

        <ApprovalSettingModal
          open={approvalModalOpen}
          onClose={() => setApprovalModalOpen(false)}
        />
      </div>
    </>
  );
};

export default HeaderIcons;
