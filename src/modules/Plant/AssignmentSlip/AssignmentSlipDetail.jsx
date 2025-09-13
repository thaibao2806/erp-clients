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
import AssignmentSlipModal from "./AssignmentSlipModal";
import {
  deleteAssignmetSlip,
  getAssignmentSlipById,
} from "../../../services/apiPlan/apiAssignmentSlip";
import dayjs from "dayjs";
import { addAttachments } from "../../../services/apiAttachment";
import { useSelector } from "react-redux";
import { getApprovalsByRef } from "../../../services/apiApprovals";
import { getApprovalSetting } from "../../../services/apiApproveSetting";

const { Title } = Typography;
const { Panel } = Collapse;
const { useBreakpoint } = Grid;

const AssignmentSlipDetail = () => {
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
    getApprovals();
    getApprovalByModulePage();
  }, []);

  const getApprovalByModulePage = async () => {
    try {
      let res = await getApprovalSetting("PL", "pl-phieu-giao-viec");
      if (res && res.status === 200) {
        setApprovalNumber(res.data.data.approvalNumber);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getApprovals = async () => {
    try {
      let res = await getApprovalsByRef(id, "PGV");
      if (res && res.status === 200) {
        setApproval(res.data.data);
      }
    } catch (error) {}
  };

  const getData = async () => {
    try {
      let res = await getAssignmentSlipById(id);
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
        let res = await deleteAssignmetSlip(data.id);
        if ((res && res.status === 200) || res.status === 204) {
          Modal.success({
            title: "Xóa thành công",
            content: `Đã xóa thành công phiếu`,
          });
          navigator("/pl/phieu-giao-viec");
        }
      } catch (error) {
        Modal.error({
          title: "Xóa thất bại",
          content: `Đã có lỗi xãy ra. Vui lòng thử lại sau`,
        });
      }
    }
  };

  // Responsive columns for table
  const getColumns = () => {
    const baseColumns = [
      { 
        title: "STT", 
        dataIndex: "stt", 
        width: isMobile ? 50 : 60,
        fixed: isMobile ? 'left' : false
      },
      { 
        title: "Nội dung", 
        dataIndex: "content",
        width: isMobile ? 200 : undefined,
        onCell: () => ({
          style: { 
            whiteSpace: "normal", 
            wordWrap: "break-word", 
            maxWidth: isMobile ? 200 : 500
          },
        }),
      },
      { 
        title: "ĐVT", 
        dataIndex: "unit",
        width: isMobile ? 80 : undefined
      },
      { 
        title: "SL", 
        dataIndex: "quantity",
        width: isMobile ? 60 : undefined
      },
      { 
        title: "N/Công", 
        dataIndex: "workDay",
        width: isMobile ? 80 : undefined
      },
      { 
        title: "Ghi chú", 
        dataIndex: "note",
        width: isMobile ? 150 : undefined
      },
    ];

    return baseColumns;
  };

  // Responsive info rendering
  const renderInfoSection = () => {
    if (isMobile) {
      return (
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <div><strong>Số chứng từ:</strong> {data.documentNumber || ""}</div>
          <div><strong>Tên sản phẩm:</strong> {data.productName || ""}</div>
          <div>
            <strong>Ngày chứng từ:</strong>{" "}
            {data.documentDate
              ? new Date(data.documentDate).toLocaleDateString("vi-VN")
              : "---"}
          </div>
          <div><strong>Đơn bị quản lý:</strong> {data.documentNumber || ""}</div>
          <div><strong>Bộ phận:</strong> {data.department || ""}</div>
          <div><strong>Ghi chú:</strong> {data.note || ""}</div>
        </Space>
      );
    }

    return (
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={24} md={12} lg={12} xl={12}>
          <Space
            direction="vertical"
            size="small"
            style={{ width: "100%" }}
          >
            <div><strong>Số chứng từ:</strong> {data.documentNumber || ""}</div>
            <div><strong>Tên sản phẩm:</strong> {data.productName || ""}</div>
            <div>
              <strong>Ngày chứng từ:</strong>{" "}
              {data.documentDate
                ? new Date(data.documentDate).toLocaleDateString("vi-VN")
                : "---"}
            </div>
          </Space>
        </Col>
        <Col xs={24} sm={24} md={12} lg={12} xl={12}>
          <Space
            direction="vertical"
            size="small"
            style={{ width: "100%" }}
          >
            <div><strong>Đơn bị quản lý:</strong> {data.documentNumber || ""}</div>
            <div><strong>Bộ phận:</strong> {data.department || ""}</div>
            <div><strong>Ghi chú:</strong> {data.note || ""}</div>
          </Space>
        </Col>
      </Row>
    );
  };

  // Responsive approval section
  const renderApprovalSection = () => {
    if (!approvals?.length) return null;

    if (isMobile) {
      return (
        <div style={{ marginTop: 16 }}>
          {approvals.map((item, index) => (
            <div key={index} style={{ marginBottom: 16, padding: 12, border: '1px solid #d9d9d9', borderRadius: 6 }}>
              <Space direction="vertical" size="small" style={{ width: "100%" }}>
                <div><strong>Người duyệt {index + 1}:</strong> {item.fullName}</div>
                <div>
                  <strong>Trạng thái duyệt {index + 1}:</strong>{" "}
                  {item.status === "rejected"
                    ? "Từ chối"
                    : item.status === "approved"
                    ? "Đã duyệt"
                    : "Chờ duyệt"}
                </div>
                <div><strong>Ghi chú người duyệt {index + 1}:</strong> {item.note || ""}</div>
              </Space>
            </div>
          ))}
        </div>
      );
    }

    return (
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        {approvals.map((item, index) => (
          <Col xs={24} sm={24} md={12} lg={12} xl={12} key={index}>
            <Space
              direction="vertical"
              size="small"
              style={{ width: "100%" }}
            >
              <div><strong>Người duyệt {index + 1}:</strong> {item.fullName}</div>
              <div>
                <strong>Trạng thái duyệt {index + 1}:</strong>{" "}
                {item.status === "rejected"
                  ? "Từ chối"
                  : item.status === "approved"
                  ? "Đã duyệt"
                  : "Chờ duyệt"}
              </div>
              <div><strong>Ghi chú người duyệt {index + 1}:</strong> {item.note || ""}</div>
            </Space>
          </Col>
        ))}
      </Row>
    );
  };

  return (
    <div style={{ 
      padding: isMobile ? 8 : 16,
      minHeight: '100vh'
    }}>
      <Row justify="space-between" align="middle" gutter={[16, 16]}>
        <Col xs={24} sm={16} md={18} lg={20}>
          <Title 
            level={isMobile ? 4 : 3}
            style={{ 
              margin: 0,
              fontSize: isMobile ? '18px' : undefined
            }}
          >
            Xem chi tiết phiếu giao việc
          </Title>
        </Col>
        <Col xs={24} sm={8} md={6} lg={4}>
          <Dropdown
            menu={{ items, onClick: handleMenuClick }}
            trigger={["click"]}
            placement={isMobile ? "bottomRight" : "bottom"}
          >
            <Button 
              style={{ width: isMobile ? '100%' : 'auto' }}
              size={isMobile ? 'middle' : 'middle'}
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
        <Panel header="Thông tin phiếu giao việc" key="1">
          {data && (
            <>
              {renderInfoSection()}
              {renderApprovalSection()}
            </>
          )}
        </Panel>

        <Panel header="Nội dung phiếu giao việc" key="2">
          {data && (
            <div style={{ overflowX: 'auto' }}>
              <Table
                columns={getColumns()}
                dataSource={data.details?.map((item, index) => ({
                  ...item,
                  stt: index + 1,
                }))}
                scroll={{ 
                  x: isMobile ? 600 : 'max-content',
                  y: isMobile ? 300 : undefined
                }}
                size="small"
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
                          fontSize: isMobile ? '12px' : '14px'
                        }}
                      />
                    ),
                  },
                }}
                style={{
                  fontSize: isMobile ? '12px' : '14px'
                }}
              />
            </div>
          )}
        </Panel>

        <Panel header="Đính kèm" key="3">
          <AttachmentSection
            refId={data ? data.id : ""}
            refType={"AssignmentSlip"}
            refreshTrigger={refreshFlag}
          />
        </Panel>

        <Panel header="Ghi chú" key="4">
          <NoteSection
            refId={data ? data.id : ""}
            refType={"AssignmentSlip"}
            voucherNo={data ? data.documentNumber : ""}
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
              refType={"AssignmentSlip"}
              voucherNo={data.documentNumber}
            />
          )}
        </Panel>
      </Collapse>

      <AssignmentSlipModal
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
            formData.append("refType", "AssignmentSlip");

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
    </div>
  );
};

export default AssignmentSlipDetail;