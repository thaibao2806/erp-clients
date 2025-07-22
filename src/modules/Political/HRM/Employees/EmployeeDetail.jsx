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
import EmployeeModal from "./EmployeeModal";
// import {
//   deleteAssignmetSlip,
//   getAssignmentSlipById,
// } from "../../../services/apiPlan/apiAssignmentSlip";
import dayjs from "dayjs";
// import { addAttachments } from "../../../services/apiAttachment";
import { useSelector } from "react-redux";
import {
  deleteEmployees,
  getEmployeeByID,
} from "../../../../services/apiPolitical/apiEmployee";
import { addAttachments } from "../../../../services/apiAttachment";
// import { getApprovalsByRef } from "../../../services/apiApprovals";
// import { getApprovalSetting } from "../../../services/apiApproveSetting";

const { Title } = Typography;
const { Panel } = Collapse;

const EmployeeDetail = () => {
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

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    try {
      let res = await getEmployeeByID(id);
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
        let res = await deleteEmployees(data.id);
        if ((res && res.status === 200) || res.status === 204) {
          Modal.success({
            title: "Xóa thành công",
            content: `Đã xóa thành công phiếu`,
          });
          navigator("/pt/nhan-su/ho-so-nhan-vien");
        }
      } catch (error) {
        Modal.error({
          title: "Xóa thất bại",
          content: `Đã có lỗi xãy ra. Vui lòng thử lại sau`,
        });
      }
    }
  };

  return (
    <div style={{ padding: 10 }}>
      <Row justify="space-between" align="middle">
        <Col>
          <Title level={3}>Xem chi tiết phiếu giao việc</Title>
        </Col>
        <Col>
          <Dropdown
            menu={{ items, onClick: handleMenuClick }}
            trigger={["click"]}
          >
            <Button>
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
        <Panel header="Thông tin hồ sơ nhân viên" key="1">
          {data && (
            <Row gutter={16}>
              <Col span={12}>
                <Space
                  direction="vertical"
                  size="small"
                  style={{ width: "100%" }}
                >
                  <div>Họ và tên: {data.fullName || ""}</div>
                  <div>Giới tính: {data.gender || ""}</div>
                  <div>
                    Ngày sinh:{" "}
                    {data.dateOfBirth
                      ? new Date(data.documentDate).toLocaleDateString("vi-VN")
                      : "---"}
                  </div>
                  <div>Số điện thoại: {data.phoneNumber || ""}</div>
                  <div>Email: {data.email || ""}</div>
                  <div>Phòng ban: {data.department || ""}</div>
                  <div>Vị trí: {data.position || ""}</div>
                  <div>Cấp bậc: {data.rank || ""}</div>
                </Space>
              </Col>
              <Col span={12}>
                <Space
                  direction="vertical"
                  size="small"
                  style={{ width: "100%" }}
                >
                  <div>CCCD: {data.identityNumber || ""}</div>
                  <div>Ngày cấp: {data.issueDate || ""}</div>
                  <div>Mã số thuế: {data.taxCode || ""}</div>
                  <div>Loại lao động: {data.laborType || ""}</div>
                  <div>Ngày bắt đầu: {data.startDate || ""}</div>
                  <div>Ngày kết thúc: {data.endDate || ""}</div>
                  <div>Địa chỉ: {data.address || ""}</div>
                  <div>Trạng thái: {data.status || ""}</div>
                </Space>
              </Col>
            </Row>
          )}
        </Panel>

        <Panel header="Đính kèm" key="3">
          <AttachmentSection
            refId={data ? data.id : ""}
            refType={"Employee"}
            refreshTrigger={refreshFlag}
          />
        </Panel>

        <Panel header="Ghi chú" key="4">
          <NoteSection
            refId={data ? data.id : ""}
            refType={"Employee"}
            voucherNo={data ? data.fullName : ""}
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
              refType={"Employee"}
              voucherNo={data.fullName}
            />
          )}
        </Panel>
      </Collapse>

      <EmployeeModal
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
            formData.append("refId", data.id); // id của AssignmentSlip
            formData.append("refType", "Employee");

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

export default EmployeeDetail;
