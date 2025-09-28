import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  Row,
  Col,
  Typography,
  Button,
  Dropdown,
  Collapse,
  Table,
  Space,
  message,
  Modal,
  Card,
  Descriptions,
  Drawer,
  Badge,
  Divider,
  FloatButton,
  Tooltip,
} from "antd";
import {
  DownOutlined,
  EditOutlined,
  PaperClipOutlined,
  DeleteOutlined,
  ArrowLeftOutlined,
  BellOutlined,
  MenuOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import NoteSection from "../../components/NoteSection ";
import AttachmentSection from "../../components/AttachmentSection ";
import SystemSection from "../../components/SystemSection";
import dayjs from "dayjs";
import { addAttachments } from "../../services/apiAttachment";
import { useSelector } from "react-redux";
import { getNotificationByID } from "../../services/notificationApi";

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

const NotificationDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const type = queryParams.get("type");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingData, setEditingData] = useState(null);
  const [data, setData] = useState();
  const [approvals, setApproval] = useState();
  const [approvalNumber, setApprovalNumber] = useState();
  const [refreshFlag, setRefreshFlag] = useState(0);
  const user = useSelector((state) => state.auth.login.currentUser);
  const navigator = useNavigate();
  const fileInputRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const [actionDrawerVisible, setActionDrawerVisible] = useState(false);
  const [expandedPanels, setExpandedPanels] = useState(["1"]);

  // Detect screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    try {
      let res = await getNotificationByID(id);
      if (res && res.status === 200) {
        setData(res.data.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const items = [
    {
      key: "edit",
      label: (
        <span>
          <EditOutlined /> Sửa
        </span>
      ),
      disabled: true,
    },
    {
      key: "attach",
      label: (
        <span>
          <PaperClipOutlined /> Đính kèm
        </span>
      ),
    },
    {
      key: "delete",
      label: (
        <span style={{ color: "red" }}>
          <DeleteOutlined /> Xóa
        </span>
      ),
      disabled: true,
    },
  ];

  const handleMenuClick = async ({ key }) => {
    setActionDrawerVisible(false); // Close drawer after action

    if (key === "edit") {
      if (type) {
        setEditingData({
          ...data,
          type: type,
        });
      } else {
        setEditingData(data);
      }
      setIsModalOpen(true);
    } else if (key === "attach") {
      fileInputRef.current?.click();
    } else if (key === "delete") {
      try {
        // let res = await deleteAssignmetSlip(data.id);
        // if ((res && res.status === 200) || res.status === 204) {
        //   Modal.success({
        //     title: "Xóa thành công",
        //     content: `Đã xóa thành công phiếu`,
        //   });
        //   navigator("/pl/phieu-giao-viec");
        // }
        console.log("Delete action");
      } catch (error) {
        Modal.error({
          title: "Xóa thất bại",
          content: `Đã có lỗi xãy ra. Vui lòng thử lại sau`,
        });
      }
    }
  };

  const handleBack = () => {
    navigator(-1);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "---";
    return dayjs(dateString).format("DD/MM/YYYY HH:mm");
  };

  // Mobile Action Menu
  const MobileActionMenu = () => (
    <Drawer
      title="Hoạt động"
      placement="bottom"
      height="auto"
      onClose={() => setActionDrawerVisible(false)}
      open={actionDrawerVisible}
      bodyStyle={{ padding: 0 }}
    >
      <div style={{ padding: "8px 0" }}>
        {items.map((item) => (
          <div
            key={item.key}
            onClick={() => !item.disabled && handleMenuClick({ key: item.key })}
            style={{
              padding: "16px 20px",
              borderBottom: "1px solid #f0f0f0",
              cursor: item.disabled ? "not-allowed" : "pointer",
              opacity: item.disabled ? 0.5 : 1,
              backgroundColor: item.disabled ? "#fafafa" : "white",
            }}
          >
            {item.label}
          </div>
        ))}
      </div>
    </Drawer>
  );

  // Mobile Header Component
  const MobileHeader = () => (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        backgroundColor: "white",
        borderBottom: "1px solid #f0f0f0",
        padding: "12px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", flex: 1 }}>
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={handleBack}
          style={{ marginRight: 8, padding: "4px 8px" }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <Text
            ellipsis={{ tooltip: "Chi tiết thông báo" }}
            style={{
              fontSize: "16px",
              fontWeight: "600",
              color: "#262626",
            }}
          >
            Chi tiết thông báo
          </Text>
        </div>
      </div>
      <Button
        type="text"
        icon={<MoreOutlined />}
        onClick={() => setActionDrawerVisible(true)}
        style={{ padding: "4px 8px" }}
      />
    </div>
  );

  // Desktop Header Component
  const DesktopHeader = () => (
    <div
      style={{
        backgroundColor: "white",
        padding: "16px 20px",
        borderRadius: "8px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        marginBottom: 16,
      }}
    >
      <Row justify="space-between" align="middle">
        <Col flex={1}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={handleBack}
              style={{ marginRight: 8 }}
            />
            <BellOutlined style={{ fontSize: "20px", color: "#1890ff" }} />
            <Title level={3} style={{ margin: 0 }}>
              Chi tiết thông báo
            </Title>
          </div>
        </Col>
        <Col>
          <Dropdown
            menu={{ items, onClick: handleMenuClick }}
            trigger={["click"]}
            placement="bottomRight"
          >
            <Button>
              Hoạt động <DownOutlined />
            </Button>
          </Dropdown>
        </Col>
      </Row>
    </div>
  );

  // Mobile Card Layout
  const MobileLayout = () => (
    <div style={{ backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      <MobileHeader />

      <div style={{ padding: "8px" }}>
        {/* Notification Info Card */}
        <Card
          title={
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <BellOutlined style={{ color: "#1890ff" }} />
              <span>Thông tin thông báo</span>
            </div>
          }
          style={{ marginBottom: 12, borderRadius: 8 }}
          bodyStyle={{ padding: "16px" }}
        >
          {data && (
            <div>
              <div style={{ marginBottom: 16 }}>
                <Text strong style={{ fontSize: "13px", color: "#666" }}>
                  Tiêu đề:
                </Text>
                <div style={{ marginTop: 4 }}>
                  <Text style={{ fontSize: "15px", lineHeight: "1.5" }}>
                    {data.title || "---"}
                  </Text>
                </div>
              </div>

              <div>
                <Text strong style={{ fontSize: "13px", color: "#666" }}>
                  Nội dung:
                </Text>
                <div style={{ marginTop: 4 }}>
                  <Paragraph
                    style={{
                      fontSize: "14px",
                      lineHeight: "1.6",
                      margin: 0,
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {data.content || "---"}
                  </Paragraph>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Attachment Card */}
        <Card
          title={
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <PaperClipOutlined style={{ color: "#1890ff" }} />
              <span>Đính kèm</span>
            </div>
          }
          style={{ marginBottom: 12, borderRadius: 8 }}
          bodyStyle={{ padding: "16px" }}
        >
          <AttachmentSection
            refId={data ? data.id : ""}
            refType={"Notification"}
            refreshTrigger={refreshFlag}
          />
        </Card>

        {/* Notes Card */}
        <Card
          title={
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <EditOutlined style={{ color: "#1890ff" }} />
              <span>Ghi chú</span>
            </div>
          }
          style={{ marginBottom: 12, borderRadius: 8 }}
          bodyStyle={{ padding: "16px" }}
        >
          <NoteSection
            refId={data ? data.id : ""}
            refType={"Notification"}
            voucherNo={data ? data.id : ""}
          />
        </Card>
      </div>

      <MobileActionMenu />
    </div>
  );

  // Desktop Layout
  const DesktopLayout = () => (
    <div
      style={{
        padding: "16px",
        backgroundColor: "#f5f5f5",
        minHeight: "100vh",
      }}
    >
      <DesktopHeader />

      <div
        style={{
          backgroundColor: "white",
          borderRadius: "8px",
          overflow: "hidden",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}
      >
        <Collapse
          activeKey={expandedPanels}
          onChange={setExpandedPanels}
          expandIconPosition="end"
          ghost={false}
          style={{ backgroundColor: "white" }}
        >
          <Panel
            header={
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <BellOutlined style={{ color: "#1890ff" }} />
                <span style={{ fontWeight: "500" }}>Thông tin thông báo</span>
              </div>
            }
            key="1"
            style={{ borderBottom: "1px solid #f0f0f0" }}
          >
            {data && (
              <div style={{ padding: "8px 0" }}>
                <Descriptions
                  column={1}
                  size="middle"
                  labelStyle={{
                    fontWeight: "600",
                    color: "#595959",
                    width: "120px",
                  }}
                  contentStyle={{ color: "#262626" }}
                >
                  <Descriptions.Item label="Tiêu đề">
                    {data.title || "---"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Nội dung">
                    <Paragraph
                      style={{
                        margin: 0,
                        whiteSpace: "pre-wrap",
                        lineHeight: "1.6",
                      }}
                    >
                      {data.content || "---"}
                    </Paragraph>
                  </Descriptions.Item>
                </Descriptions>
              </div>
            )}
          </Panel>

          <Panel
            header={
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <PaperClipOutlined style={{ color: "#1890ff" }} />
                <span style={{ fontWeight: "500" }}>Đính kèm</span>
              </div>
            }
            key="3"
            style={{ borderBottom: "1px solid #f0f0f0" }}
          >
            <div style={{ padding: "8px 0" }}>
              <AttachmentSection
                refId={data ? data.id : ""}
                refType={"Notification"}
                refreshTrigger={refreshFlag}
              />
            </div>
          </Panel>

          <Panel
            header={
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <EditOutlined style={{ color: "#1890ff" }} />
                <span style={{ fontWeight: "500" }}>Ghi chú</span>
              </div>
            }
            key="4"
          >
            <div style={{ padding: "8px 0" }}>
              <NoteSection
                refId={data ? data.id : ""}
                refType={"Notification"}
                voucherNo={data ? data.id : ""}
              />
            </div>
          </Panel>
        </Collapse>
      </div>
    </div>
  );

  return (
    <>
      {isMobile ? <MobileLayout /> : <DesktopLayout />}

      {/* File Upload Input */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        multiple
        onChange={async (e) => {
          const files = e.target.files;
          if (!files.length || !data?.id) return;

          for (const file of files) {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("refId", data.id);
            formData.append("refType", "Notification");

            try {
              const res = await addAttachments(formData, user.data.token);
              message.success(`Đã upload file: ${file.name}`);
            } catch (err) {
              console.error(err);
              message.error(`Upload thất bại: ${file.name}`);
            }
          }

          e.target.value = "";
          setRefreshFlag((prev) => prev + 1);
        }}
      />

      {/* Mobile Floating Attachment Button */}
      {isMobile && (
        <FloatButton
          icon={<PaperClipOutlined />}
          tooltip="Thêm đính kèm"
          onClick={() => fileInputRef.current?.click()}
          style={{
            right: 20,
            bottom: 20,
          }}
        />
      )}
    </>
  );
};

export default NotificationDetail;
