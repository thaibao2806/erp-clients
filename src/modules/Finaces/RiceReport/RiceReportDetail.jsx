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
import RiceReportModal from "./RiceReportModal";
import {
  deleteRiceReportByID,
  getRiceReportById,
} from "../../../services/apiFinaces/apiRiceReport";

const { Title } = Typography;
const { Panel } = Collapse;
const { useBreakpoint } = Grid;

const RiceReportDetail = () => {
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
      let res = await getRiceReportById(id);
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
        let res = await deleteRiceReportByID(data.id);
        if ((res && res.status === 200) || res.status === 204) {
          Modal.success({
            title: "Xóa thành công",
            content: `Đã xóa thành công phiếu`,
          });
          navigator("/fn/nhan-su/bao-com");
        }
      } catch (error) {
        Modal.error({
          title: "Xóa thất bại",
          content: `Đã có lỗi xãy ra. Vui lòng thử lại sau`,
        });
      }
    }
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
            <strong>SL Ban KT-VT-CN:</strong> {data.slKT || ""}
          </div>
          <div>
            <strong>SL Ban CT-HC:</strong> {data.slCT || ""}
          </div>
          <div>
            <strong>SL Ban TC-KT:</strong> {data.slTC || ""}
          </div>
          <div>
            <strong>SL Ban KH-KD:</strong> {data.slKH || ""}
          </div>
          <div>
            <strong>Tổng số lượng:</strong> {data.totalSL || ""}
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
            <div>
              <strong>SL Ban KT-VT-CN:</strong> {data.slKT || ""}
            </div>
            <div>
              <strong>SL Ban CT-HC:</strong> {data.slCT || ""}
            </div>
          </Space>
        </Col>
        <Col xs={24} sm={24} md={12} lg={12} xl={12}>
          <Space direction="vertical" size="small" style={{ width: "100%" }}>
            <div>
              <strong>SL Ban TC-KT:</strong> {data.slTC || ""}
            </div>
            <div>
              <strong>SL Ban KH-KD:</strong> {data.slKH || ""}
            </div>
            <div>
              <strong>Tổng số lượng:</strong> {data.totalSL || ""}
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
            Xem chi tiết báo cơm
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
        <Panel header="Thông tin báo cơm" key="1">
          {data && renderInfoSection()}
        </Panel>

        <Panel header="Đính kèm" key="3">
          <AttachmentSection
            refId={data ? data.id : ""}
            refType={"RiceReport"}
            refreshTrigger={refreshFlag}
          />
        </Panel>

        <Panel header="Ghi chú" key="4">
          <NoteSection
            refId={data ? data.id : ""}
            refType={"RiceReport"}
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
              refType={"RiceReport"}
              voucherNo={data.voucherNo}
            />
          )}
        </Panel>
      </Collapse>

      <RiceReportModal
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
            formData.append("refId", data.id); // id của RiceReport
            formData.append("refType", "RiceReport");

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

export default RiceReportDetail;
