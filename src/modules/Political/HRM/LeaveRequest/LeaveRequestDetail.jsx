import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  Row,
  Col,
  Typography,
  Button,
  Dropdown,
  Collapse,
  Space,
  message,
  Modal,
  Grid,
} from "antd";
import {
  DownOutlined,
  EditOutlined,
  PaperClipOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import NoteSection from "../../../../components/NoteSection ";
import AttachmentSection from "../../../../components/AttachmentSection ";
import SystemSection from "../../../../components/SystemSection";
import dayjs from "dayjs";
import { addAttachments } from "../../../../services/apiAttachment";
import { useSelector } from "react-redux";
import { getApprovalsByRef } from "../../../../services/apiApprovals";
import { getApprovalSetting } from "../../../../services/apiApproveSetting";
import LeaveRequestModal from "./LeaveRequestModal";
import {
  deleteLeaveRequestByID,
  getLeaveRequestById,
} from "../../../../services/apiPolitical/apiLeaveRequest";

const { Title } = Typography;
const { Panel } = Collapse;
const { useBreakpoint } = Grid;

const LeaveRequestDetail = () => {
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
  const screens = useBreakpoint();

  const isMobile = !screens.md;
  const isTablet = screens.md && !screens.lg;

  useEffect(() => {
    getData();
    getApprovals();
    getApprovalByModulePage();
  }, []);

  const getApprovalByModulePage = async () => {
    try {
      let res = await getApprovalSetting("PT", "pt-nghi-phep");
      if (res && res.status === 200) {
        setApprovalNumber(res.data.data.approvalNumber);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getApprovals = async () => {
    try {
      let res = await getApprovalsByRef(id, "DXNP");
      if (res && res.status === 200) {
        setApproval(res.data.data);
      }
    } catch (error) {}
  };

  const getData = async () => {
    try {
      let res = await getLeaveRequestById(id);
      if (res && res.status === 200) {
        setData(res.data.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const isEditDisabled = approvals?.some(
    (a) => a.level === approvalNumber && a.status === "approved" && !type
  );

  const items = [
    {
      key: "edit",
      label: (
        <span>
          <EditOutlined /> Sửa
        </span>
      ),
      disabled: isEditDisabled,
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
      disabled: isEditDisabled,
    },
  ];

  const handleMenuClick = async ({ key }) => {
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
        let res = await deleteLeaveRequestByID(data.id);
        if ((res && res.status === 200) || res.status === 204) {
          Modal.success({
            title: "Xóa thành công",
            content: `Đã xóa thành công phiếu`,
          });
          navigator("/pt/nhan-su/nghi-phep");
        }
      } catch (error) {
        Modal.error({
          title: "Xóa thất bại",
          content: `Đã có lỗi xảy ra. Vui lòng thử lại sau`,
        });
      }
    }
  };

  const renderInfoSection = () => {
    if (!data) return null;

    if (isMobile) {
      return (
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <div>
            <strong>Họ và tên:</strong> {data.fullName || ""}
          </div>
          <div>
            <strong>Phòng ban:</strong> {data.department || ""}
          </div>
          <div>
            <strong>Chức vụ:</strong> {data.position || ""}
          </div>
          <div>
            <strong>Loại phép:</strong> {data.leaveType || ""}
          </div>
          <div>
            <strong>Ngày bắt đầu:</strong>{" "}
            {data.startDate
              ? new Date(data.startDate).toLocaleString("vi-VN")
              : "---"}
          </div>
          <div>
            <strong>Ngày kết thúc:</strong>{" "}
            {data.endDate
              ? new Date(data.endDate).toLocaleString("vi-VN")
              : "---"}
          </div>
          <div>
            <strong>Tổng ngày nghỉ:</strong> {data.totalDate || ""}
          </div>
          <div>
            <strong>Lý do:</strong> {data.reason || ""}
          </div>
          <div>
            <strong>Liên hệ:</strong> {data.emailOrPhone || ""}
          </div>
          <div>
            <strong>Nơi nghỉ:</strong> {data.address || ""}
          </div>
        </Space>
      );
    }

    return (
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Space direction="vertical" size="small" style={{ width: "100%" }}>
            <div>
              <strong>Họ và tên:</strong> {data.fullName || ""}
            </div>
            <div>
              <strong>Phòng ban:</strong> {data.department || ""}
            </div>
            <div>
              <strong>Chức vụ:</strong> {data.position || ""}
            </div>
            <div>
              <strong>Loại phép:</strong> {data.leaveType || ""}
            </div>
            <div>
              <strong>Ngày bắt đầu:</strong>{" "}
              {data.startDate
                ? new Date(data.startDate).toLocaleString("vi-VN")
                : "---"}
            </div>
          </Space>
        </Col>
        <Col span={12}>
          <Space direction="vertical" size="small" style={{ width: "100%" }}>
            <div>
              <strong>Ngày kết thúc:</strong>{" "}
              {data.endDate
                ? new Date(data.endDate).toLocaleString("vi-VN")
                : "---"}
            </div>
            <div>
              <strong>Tổng ngày nghỉ:</strong> {data.totalDate || ""}
            </div>
            <div>
              <strong>Lý do:</strong> {data.reason || ""}
            </div>
            <div>
              <strong>Liên hệ:</strong> {data.emailOrPhone || ""}
            </div>
            <div>
              <strong>Nơi nghỉ:</strong> {data.address || ""}
            </div>
          </Space>
        </Col>
      </Row>
    );
  };

  return (
    <div style={{ padding: isMobile ? 8 : 16 }}>
      <Row justify="space-between" align="middle" gutter={[16, 16]}>
        <Col xs={24} sm={16} md={18} lg={20}>
          <Title level={isMobile ? 4 : 3}>Xem chi tiết đơn xin nghỉ phép</Title>
        </Col>
        <Col xs={24} sm={8} md={6} lg={4}>
          <Dropdown
            menu={{ items, onClick: handleMenuClick }}
            trigger={["click"]}
            placement={isMobile ? "bottomRight" : "bottom"}
          >
            <Button style={{ width: isMobile ? "100%" : "auto" }}>
              Hoạt động <DownOutlined />
            </Button>
          </Dropdown>
        </Col>
      </Row>

      <Collapse
        defaultActiveKey={["1"]}
        style={{ marginTop: 16 }}
        expandIconPosition="end"
      >
        <Panel header="Thông tin đơn xin nghỉ phép" key="1">
          {renderInfoSection()}
          {approvals?.length > 0 && (
            <Row gutter={[16, 16]} style={{ marginTop: 12 }}>
              {approvals.map((item, idx) => (
                <Col xs={24} md={12} key={idx}>
                  <Space
                    direction="vertical"
                    size="small"
                    style={{ width: "100%" }}
                  >
                    <div>
                      <strong>Người duyệt {idx + 1}:</strong> {item.fullName}
                    </div>
                    <div>
                      <strong>Trạng thái:</strong>
                      {item.status === "rejected"
                        ? "Từ chối"
                        : item.status === "approved"
                        ? "Đã duyệt"
                        : "Chờ duyệt"}
                    </div>
                    <div>
                      <strong>Ghi chú:</strong> {item.note || ""}
                    </div>
                  </Space>
                </Col>
              ))}
            </Row>
          )}
        </Panel>

        <Panel header="Đính kèm" key="2">
          <AttachmentSection
            refId={data?.id || ""}
            refType="LeaveRequest"
            refreshTrigger={refreshFlag}
          />
        </Panel>

        <Panel header="Ghi chú" key="3">
          <NoteSection
            refId={data?.id || ""}
            refType="LeaveRequest"
            voucherNo={data?.fullName || ""}
          />
        </Panel>

        <Panel header="Hệ thống" key="4">
          {data && (
            <SystemSection
              systemInfo={{
                createdBy: data.createdBy,
                createdAt: data.createdAt
                  ? dayjs(data.createdAt).format("DD/MM/YYYY HH:mm:ss")
                  : "",
                updatedBy: data.updatedBy,
                updatedAt: data.updatedAt
                  ? dayjs(data.updatedAt).format("DD/MM/YYYY HH:mm:ss")
                  : "",
              }}
              refId={data.id}
              refType="LeaveRequest"
              voucherNo={data.fullName}
            />
          )}
        </Panel>
      </Collapse>

      <LeaveRequestModal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onSubmit={() => {
          getData();
          getApprovals();
          setIsModalOpen(false);
        }}
        initialValues={editingData}
      />

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
            formData.append("refType", "LeaveRequest");

            try {
              await addAttachments(formData, user.data.token);
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
    </div>
  );
};

export default LeaveRequestDetail;
