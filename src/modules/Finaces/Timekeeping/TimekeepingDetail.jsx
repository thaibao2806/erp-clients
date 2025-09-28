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
  Grid,
} from "antd";
import {
  DownOutlined,
  EditOutlined,
  PaperClipOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import NoteSection from "../../../components/NoteSection ";
import AttachmentSection from "../../../components/AttachmentSection ";
import SystemSection from "../../../components/SystemSection";
import dayjs from "dayjs";
import { addAttachments } from "../../../services/apiAttachment";
import { useSelector } from "react-redux";
import { getApprovalsByRef } from "../../../services/apiApprovals";
import { getApprovalSetting } from "../../../services/apiApproveSetting";
import {
  deleteJobRequirements,
  getByIDJobRequirement,
} from "../../../services/apiTechnicalMaterial/apiJobRequirement";
import TimekeepingModal from "./TimekeepingModal";
import {
  deleteTimeKeepingByID,
  getTimeKeepingById,
} from "../../../services/apiFinaces/apiTimeKeeping";

const { Title } = Typography;
const { Panel } = Collapse;
const { useBreakpoint } = Grid;

const TimekeepingDetail = () => {
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

  // Determine if mobile/tablet view
  const isMobile = !screens.md;
  const isTablet = screens.md && !screens.lg;

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    try {
      let res = await getTimeKeepingById(id);
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
          type: type, // hoặc đơn giản: type
        });
      } else {
        setEditingData(data);
      }
      setIsModalOpen(true);
    } else if (key === "attach") {
      fileInputRef.current?.click(); // Mở hộp thoại chọn file
    } else if (key === "delete") {
      try {
        let res = await deleteTimeKeepingByID(data.id);
        if ((res && res.status === 200) || res.status === 204) {
          Modal.success({
            title: "Xóa thành công",
            content: `Đã xóa thành công phiếu`,
          });
          navigator("/fn/nhan-su/cham-cong");
        }
      } catch (error) {
        Modal.error({
          title: "Xóa thất bại",
          content: `Đã có lỗi xãy ra. Vui lòng thử lại sau`,
        });
      }
    }
  };

  // Responsive columns for the complex timekeeping table
  const getColumns = () => {
    const baseColumns = [
      {
        title: "STT",
        dataIndex: "stt",
        width: isMobile ? 50 : 60,
        fixed: "left",
      },
      {
        title: "Họ và tên",
        dataIndex: "fullName",
        width: isMobile ? 120 : 150,
        fixed: "left",
        onCell: () => ({
          style: {
            whiteSpace: "normal",
            wordWrap: "break-word",
            maxWidth: isMobile ? 120 : 150,
          },
        }),
      },
      {
        title: "Chức vụ",
        dataIndex: "position",
        width: isMobile ? 100 : 120,
        fixed: "left",
        onCell: () => ({
          style: {
            whiteSpace: "normal",
            wordWrap: "break-word",
            maxWidth: isMobile ? 100 : 120,
          },
        }),
      },
    ];

    // Add 31 day columns
    const dayColumns = Array.from({ length: 31 }, (_, i) => ({
      title: isMobile ? `${i + 1}` : `Ngày ${i + 1}`,
      dataIndex: `d${i + 1}`,
      width: isMobile ? 40 : 60,
      align: "center",
    }));

    const endColumns = [
      {
        title: isMobile ? "TG" : "Thời gian hoàn thành",
        dataIndex: "workDay",
        width: isMobile ? 60 : 120,
        fixed: "right",
      },
      {
        title: isMobile ? "TC" : "Tổng công",
        dataIndex: "totalWork",
        width: isMobile ? 60 : 100,
        fixed: "right",
      },
    ];

    return [...baseColumns, ...dayColumns, ...endColumns];
  };

  // Responsive info rendering
  const renderInfoSection = () => {
    if (isMobile) {
      return (
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <div>
            <strong>Số chứng từ:</strong> {data.voucherNo || ""}
          </div>
          <div>
            <strong>Ngày chứng từ:</strong>{" "}
            {data.voucherDate
              ? new Date(data.voucherDate).toLocaleDateString("vi-VN")
              : "---"}
          </div>
          <div>
            <strong>Chấm công tháng:</strong>{" "}
            {data.month ? dayjs(data.month).format("MM/YYYY") : "---"}
          </div>
          <div>
            <strong>Ghi chú:</strong> {data.note || ""}
          </div>
        </Space>
      );
    }

    return (
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={24} md={12} lg={12} xl={12}>
          <Space direction="vertical" size="small" style={{ width: "100%" }}>
            <div>
              <strong>Số chứng từ:</strong> {data.voucherNo || ""}
            </div>
            <div>
              <strong>Ngày chứng từ:</strong>{" "}
              {data.voucherDate
                ? new Date(data.voucherDate).toLocaleDateString("vi-VN")
                : "---"}
            </div>
          </Space>
        </Col>
        <Col xs={24} sm={24} md={12} lg={12} xl={12}>
          <Space direction="vertical" size="small" style={{ width: "100%" }}>
            <div>
              <strong>Chấm công tháng:</strong>{" "}
              {data.month ? dayjs(data.month).format("MM/YYYY") : "---"}
            </div>
            <div>
              <strong>Ghi chú:</strong> {data.note || ""}
            </div>
          </Space>
        </Col>
      </Row>
    );
  };

  return (
    <div
      style={{
        padding: isMobile ? 8 : 16,
        minHeight: "100vh",
      }}
    >
      <Row justify="space-between" align="middle" gutter={[16, 16]}>
        <Col xs={24} sm={16} md={18} lg={20}>
          <Title
            level={isMobile ? 4 : 3}
            style={{
              margin: 0,
              fontSize: isMobile ? "18px" : undefined,
            }}
          >
            Xem chi tiết phiếu chấm công
          </Title>
        </Col>
        <Col xs={24} sm={8} md={6} lg={4}>
          <Dropdown
            menu={{ items, onClick: handleMenuClick }}
            trigger={["click"]}
            placement={isMobile ? "bottomRight" : "bottom"}
          >
            <Button
              style={{ width: isMobile ? "100%" : "auto" }}
              size={isMobile ? "middle" : "middle"}
            >
              Hoạt động <DownOutlined />
            </Button>
          </Dropdown>
        </Col>
      </Row>

      <Collapse
        defaultActiveKey={["1"]}
        style={{ marginTop: 16 }}
        expandIconPosition="end"
        size={isMobile ? "small" : "middle"}
      >
        <Panel header="Thông tin phiếu chấm công" key="1">
          {data && renderInfoSection()}
        </Panel>

        <Panel header="Nội dung phiếu chấm công" key="2">
          {data && (
            <div style={{ overflowX: "auto" }}>
              {isMobile && (
                <div
                  style={{
                    marginBottom: 12,
                    color: "#666",
                    fontSize: "12px",
                    fontStyle: "italic",
                  }}
                >
                  * Vuốt ngang để xem thêm các ngày trong tháng
                </div>
              )}
              <Table
                columns={getColumns()}
                dataSource={data.details?.map((item, index) => ({
                  ...item,
                  stt: index + 1,
                }))}
                scroll={{
                  x: isMobile ? 1800 : "max-content",
                  y: isMobile ? 400 : undefined,
                }}
                size={isMobile ? "small" : "small"}
                bordered
                pagination={false}
                components={{
                  header: {
                    cell: (props) => (
                      <th
                        {...props}
                        style={{
                          backgroundColor: "#e6f4fb",
                          color: "#0700ad",
                          fontWeight: "600",
                          fontSize: isMobile ? "11px" : "12px",
                          padding: isMobile ? "4px" : "8px",
                        }}
                      />
                    ),
                  },
                  body: {
                    cell: (props) => (
                      <td
                        {...props}
                        style={{
                          fontSize: isMobile ? "11px" : "12px",
                          padding: isMobile ? "4px" : "8px",
                        }}
                      />
                    ),
                  },
                }}
              />
            </div>
          )}
        </Panel>

        <Panel header="Đính kèm" key="3">
          <AttachmentSection
            refId={data ? data.id : ""}
            refType={"TimeKeeping"}
            refreshTrigger={refreshFlag}
          />
        </Panel>

        <Panel header="Ghi chú" key="4">
          <NoteSection
            refId={data ? data.id : ""}
            refType={"TimeKeeping"}
            voucherNo={data ? data.voucherNo : ""}
          />
        </Panel>

        <Panel header="Hệ thống" key="5">
          {data && (
            <SystemSection
              systemInfo={{
                createdBy: `${data.createdBy}`,
                createdAt: data.createdAt
                  ? dayjs(data.createdAt).format("DD/MM/YYYY HH:mm:ss")
                  : "",
                updatedBy: `${data.updatedBy}`,
                updatedAt: data.updatedAt
                  ? dayjs(data.updatedAt).format("DD/MM/YYYY HH:mm:ss")
                  : "",
              }}
              refId={data.id}
              refType={"TimeKeeping"}
              voucherNo={data.voucherNo}
            />
          )}
        </Panel>
      </Collapse>

      <TimekeepingModal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onSubmit={() => {
          getData();
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
            formData.append("refId", data.id); // id của TimeKeeping
            formData.append("refType", "TimeKeeping");

            try {
              const res = await addAttachments(formData, user.data.token);

              message.success(`Đã upload file: ${file.name}`);
              // Có thể reload danh sách file nếu muốn
            } catch (err) {
              console.error(err);
              message.error(`Upload thất bại: ${file.name}`);
            }
          }

          // Reset lại input để có thể chọn cùng file lần nữa nếu muốn
          e.target.value = "";
          setRefreshFlag((prev) => prev + 1);
        }}
      />
    </div>
  );
};

export default TimekeepingDetail;
