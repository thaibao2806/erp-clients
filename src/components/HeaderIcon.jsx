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
  CalendarFilled,
  BellFilled,
  EditFilled,
  MenuOutlined,
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
  Drawer,
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

// Hook để theo dõi kích thước màn hình
const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: undefined,
    height: undefined,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowSize;
};

const HeaderIcons = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeTab, setActiveTab] = useState("1");
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
  const user = useSelector((state) => state.auth.login?.currentUser);
  const initials = getInitials(user.data.fullName);
  const color = getRandomColor(initials);
  const connectionRef = useRef(null);
  const [userId, setUserId] = useState(null);
  const [api, contextHolder] = notification.useNotification();
  const [avatarUrl, setAvatarUrl] = useState(null);
  const { width } = useWindowSize();
  
  // Responsive breakpoints
  const isMobile = width <= 768;
  const isTablet = width > 768 && width <= 1024;
  const isDesktop = width > 1024;

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
          placement: isMobile ? "top" : "bottomRight",
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
            placement: isMobile ? "top" : "bottomRight",
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
  }, [userId, api, isMobile]); // Thêm isMobile vào dependencies

  const handleMarkAllAsRead = async () => {
    try {
      if (notifications.length === 0) return;

      // Lấy danh sách những thông báo chưa đọc
      const unreadNotifications = notifications.filter((n) => !n.isRead);

      if (unreadNotifications.length === 0) {
        api.info({
          message: "Thông tin",
          description: "Tất cả thông báo đã được đọc",
          placement: isMobile ? "top" : "bottomRight",
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
        placement: isMobile ? "top" : "bottomRight",
        duration: 2,
      });
    } catch (err) {
      console.error("Error marking as read:", err);
      api.error({
        message: "Lỗi",
        description: "Không thể đánh dấu thông báo đã đọc",
        placement: isMobile ? "top" : "bottomRight",
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
      setMobileMenuVisible(false); // Đóng mobile menu sau khi navigate
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  const renderItems = (items) =>
    items.map((item) => (
      <div
        key={item.id}
        style={{
          padding: isMobile ? "8px 12px" : "10px 16px",
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
            <Text strong style={{ fontSize: isMobile ? 12 : 14 }}>
              {item.content}
            </Text>
            <br />
            <Text type="secondary" style={{ fontSize: isMobile ? 10 : 12 }}>
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
    setMobileMenuVisible(false);
    logOutUser(dispatch, navigate);
  };

  const notificationMenu = (
    <div
      style={{
        width: isMobile ? Math.min(width - 40, 350) : 350,
        maxHeight: isMobile ? Math.min(window.innerHeight - 200, 400) : 400,
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
        size={isMobile ? "small" : "default"}
      >
        <TabPane tab="Thông báo" key="1">
          <div 
            style={{ 
              maxHeight: isMobile ? 200 : 250, 
              overflowY: "auto" 
            }}
          >
            {renderItems(notifications, "notification")}
          </div>
        </TabPane>
      </Tabs>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: isMobile ? "6px 12px" : "8px 16px",
          borderTop: "1px solid #f0f0f0",
          background: "#ffffff",
        }}
      >
        <Button 
          type="link" 
          size={isMobile ? "small" : "default"}
          onClick={() => {
            navigate("/notifications");
            setShowNotifications(false);
          }}
        >
          Xem tất cả
        </Button>
        <Button 
          type="link" 
          size={isMobile ? "small" : "default"}
          onClick={handleMarkAllAsRead}
        >
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
        onClick={() => {
          navigate("/profile");
          setMobileMenuVisible(false);
        }}
      >
        Tài khoản
      </Menu.Item>
      <Menu.Item
        key="change-password"
        icon={<LockOutlined />}
        onClick={() => {
          navigate("/change-password");
          setMobileMenuVisible(false);
        }}
      >
        Đổi mật khẩu
      </Menu.Item>
      {user.data.department === "ADMIN" && (
        <Menu.Item
          key="setting-review"
          icon={<CheckCircleOutlined />}
          onClick={() => {
            setApprovalModalOpen(true);
            setMobileMenuVisible(false);
          }}
        >
          Thiết lập xét duyệt
        </Menu.Item>
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

  const renderUserInfo = (showText = true) => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        cursor: "pointer",
        gap: "8px",
      }}
    >
      {showText && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            lineHeight: "1",
            whiteSpace: "nowrap",
            textAlign: "right",
          }}
        >
          <span 
            style={{ 
              fontWeight: 600, 
              fontSize: isMobile ? "14px" : "16px" 
            }}
          >
            {user.data.fullName}
          </span>
          <span
            style={{
              fontSize: isMobile ? "10px" : "12px",
              color: "#fff",
              fontWeight: 500,
              paddingTop: "4px",
            }}
          >
            {user.data.department}
          </span>
        </div>
      )}
      {avatarUrl ? (
        <Avatar 
          src={avatarUrl} 
          size={isMobile ? "small" : "default"}
        />
      ) : (
        <Avatar 
          style={{ backgroundColor: color }}
          size={isMobile ? "small" : "default"}
        >
          {initials.toUpperCase()}
        </Avatar>
      )}
    </div>
  );

  // Mobile drawer content
  const mobileMenuContent = (
    <div style={{ padding: "20px 0" }}>
      {/* User Info */}
      <div 
        style={{ 
          padding: "0 24px 20px", 
          borderBottom: "1px solid #f0f0f0",
          marginBottom: "20px" 
        }}
      >
        {renderUserInfo(true)}
      </div>

      {/* Navigation Items */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <Button
          type="text"
          icon={<EditFilled />}
          style={{ 
            justifyContent: "flex-start", 
            height: "auto", 
            padding: "12px 24px",
            fontSize: "16px"
          }}
          onClick={() => {
            navigate("/review");
            setMobileMenuVisible(false);
          }}
        >
          Xét duyệt
        </Button>

        <Button
          type="text"
          icon={<CalendarFilled />}
          style={{ 
            justifyContent: "flex-start", 
            height: "auto", 
            padding: "12px 24px",
            fontSize: "16px"
          }}
          onClick={() => {
            navigate("/calendar");
            setMobileMenuVisible(false);
          }}
        >
          Lịch
        </Button>

        <div style={{ padding: "0 24px" }}>
          <div 
            style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "8px",
              padding: "12px 0",
              cursor: "pointer"
            }}
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Badge
              count={notifications.filter((n) => !n.isRead).length}
              size="small"
            >
              <BellFilled style={{ fontSize: "16px" }} />
            </Badge>
            <span style={{ fontSize: "16px" }}>Thông báo</span>
          </div>
          
          {showNotifications && (
            <div style={{ marginLeft: "24px", marginTop: "8px" }}>
              <div 
                style={{ 
                  maxHeight: 200, 
                  overflowY: "auto",
                  border: "1px solid #f0f0f0",
                  borderRadius: "4px"
                }}
              >
                {renderItems(notifications)}
              </div>
            </div>
          )}
        </div>

        <Divider style={{ margin: "8px 0" }} />

        {/* Account Menu Items */}
        <Button
          type="text"
          icon={<UserOutlined />}
          style={{ 
            justifyContent: "flex-start", 
            height: "auto", 
            padding: "12px 24px",
            fontSize: "16px"
          }}
          onClick={() => {
            navigate("/profile");
            setMobileMenuVisible(false);
          }}
        >
          Tài khoản
        </Button>

        <Button
          type="text"
          icon={<LockOutlined />}
          style={{ 
            justifyContent: "flex-start", 
            height: "auto", 
            padding: "12px 24px",
            fontSize: "16px"
          }}
          onClick={() => {
            navigate("/change-password");
            setMobileMenuVisible(false);
          }}
        >
          Đổi mật khẩu
        </Button>

        {user.data.department === "ADMIN" && (
          <Button
            type="text"
            icon={<CheckCircleOutlined />}
            style={{ 
              justifyContent: "flex-start", 
              height: "auto", 
              padding: "12px 24px",
              fontSize: "16px"
            }}
            onClick={() => {
              setApprovalModalOpen(true);
              setMobileMenuVisible(false);
            }}
          >
            Thiết lập xét duyệt
          </Button>
        )}

        <Button
          type="text"
          danger
          icon={<LogoutOutlined />}
          style={{ 
            justifyContent: "flex-start", 
            height: "auto", 
            padding: "12px 24px",
            fontSize: "16px"
          }}
          onClick={handleLogOut}
        >
          Đăng xuất
        </Button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <>
        {contextHolder}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <Button
            type="text"
            icon={<MenuOutlined />}
            style={{ color: "white", fontSize: "18px" }}
            onClick={() => setMobileMenuVisible(true)}
          />
          
          {renderUserInfo(false)}

          <Drawer
            title="Menu"
            placement="right"
            onClose={() => setMobileMenuVisible(false)}
            open={mobileMenuVisible}
            width={280}
          >
            {mobileMenuContent}
          </Drawer>

          <ApprovalSettingModal
            open={approvalModalOpen}
            onClose={() => setApprovalModalOpen(false)}
          />
        </div>
      </>
    );
  }

  return (
    <>
      {contextHolder}
      <div 
        style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: isTablet ? "20px" : "35px" 
        }}
      >
        <Tooltip title="Xét duyệt">
          <EditFilled
            style={{ 
              fontSize: isTablet ? "18px" : "20px", 
              cursor: "pointer" 
            }}
            onClick={() => navigate("/review")}
          />
        </Tooltip>

        <Tooltip title="Lịch">
          <CalendarFilled
            style={{ 
              fontSize: isTablet ? "18px" : "20px", 
              cursor: "pointer" 
            }}
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
              <BellFilled
                style={{
                  fontSize: isTablet ? "18px" : "20px",
                  cursor: "pointer",
                  color: showNotifications ? "#1890ff" : "white",
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
          {renderUserInfo(!isTablet)}
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