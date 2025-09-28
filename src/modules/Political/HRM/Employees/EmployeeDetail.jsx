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
import EmployeeModal from "./EmployeeModal";
import dayjs from "dayjs";
import { useSelector } from "react-redux";
import {
  deleteEmployees,
  getEmployeeByID,
} from "../../../../services/apiPolitical/apiEmployee";
import { addAttachments } from "../../../../services/apiAttachment";

const { Title } = Typography;
const { Panel } = Collapse;
const { useBreakpoint } = Grid;

const EmployeeDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const type = queryParams.get("type");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingData, setEditingData] = useState(null);
  const [data, setData] = useState();
  const [refreshFlag, setRefreshFlag] = useState(0);

  const user = useSelector((state) => state.auth.login.currentUser);
  const navigator = useNavigate();
  const fileInputRef = useRef(null);
  const screens = useBreakpoint();

  const isMobile = !screens.md;
  const isTablet = screens.md && !screens.lg;

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

  const items = [
    {
      key: "edit",
      label: (
        <span>
          <EditOutlined /> Sửa
        </span>
      ),
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
    },
  ];

  const handleMenuClick = async ({ key }) => {
    if (key === "edit") {
      setEditingData(type ? { ...data, type } : data);
      setIsModalOpen(true);
    } else if (key === "attach") {
      fileInputRef.current?.click();
    } else if (key === "delete") {
      try {
        let res = await deleteEmployees(data.id);
        if ((res && res.status === 200) || res.status === 204) {
          Modal.success({
            title: "Xóa thành công",
            content: `Đã xóa thành công hồ sơ nhân viên`,
          });
          navigator("/pt/nhan-su/ho-so-nhan-vien");
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
            <strong>Giới tính:</strong> {data.gender || ""}
          </div>
          <div>
            <strong>Ngày sinh:</strong>{" "}
            {data.dateOfBirth
              ? new Date(data.dateOfBirth).toLocaleDateString("vi-VN")
              : "---"}
          </div>
          <div>
            <strong>Số điện thoại:</strong> {data.phoneNumber || ""}
          </div>
          <div>
            <strong>Email:</strong> {data.email || ""}
          </div>
          <div>
            <strong>Phòng ban:</strong> {data.department || ""}
          </div>
          <div>
            <strong>Vị trí:</strong> {data.position || ""}
          </div>
          <div>
            <strong>Cấp bậc:</strong> {data.rank || ""}
          </div>
          <div>
            <strong>CCCD:</strong> {data.identityNumber || ""}
          </div>
          <div>
            <strong>Ngày cấp:</strong> {data.issueDate || ""}
          </div>
          <div>
            <strong>Mã số thuế:</strong> {data.taxCode || ""}
          </div>
          <div>
            <strong>Loại lao động:</strong> {data.laborType || ""}
          </div>
          <div>
            <strong>Ngày bắt đầu:</strong> {data.startDate || ""}
          </div>
          <div>
            <strong>Ngày kết thúc:</strong> {data.endDate || ""}
          </div>
          <div>
            <strong>Địa chỉ:</strong> {data.address || ""}
          </div>
          <div>
            <strong>Trạng thái:</strong> {data.status || ""}
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
              <strong>Giới tính:</strong> {data.gender || ""}
            </div>
            <div>
              <strong>Ngày sinh:</strong>{" "}
              {data.dateOfBirth
                ? new Date(data.dateOfBirth).toLocaleDateString("vi-VN")
                : "---"}
            </div>
            <div>
              <strong>Số điện thoại:</strong> {data.phoneNumber || ""}
            </div>
            <div>
              <strong>Email:</strong> {data.email || ""}
            </div>
            <div>
              <strong>Phòng ban:</strong> {data.department || ""}
            </div>
            <div>
              <strong>Vị trí:</strong> {data.position || ""}
            </div>
            <div>
              <strong>Cấp bậc:</strong> {data.rank || ""}
            </div>
          </Space>
        </Col>
        <Col span={12}>
          <Space direction="vertical" size="small" style={{ width: "100%" }}>
            <div>
              <strong>CCCD:</strong> {data.identityNumber || ""}
            </div>
            <div>
              <strong>Ngày cấp:</strong> {data.issueDate || ""}
            </div>
            <div>
              <strong>Mã số thuế:</strong> {data.taxCode || ""}
            </div>
            <div>
              <strong>Loại lao động:</strong> {data.laborType || ""}
            </div>
            <div>
              <strong>Ngày bắt đầu:</strong> {data.startDate || ""}
            </div>
            <div>
              <strong>Ngày kết thúc:</strong> {data.endDate || ""}
            </div>
            <div>
              <strong>Địa chỉ:</strong> {data.address || ""}
            </div>
            <div>
              <strong>Trạng thái:</strong> {data.status || ""}
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
          <Title level={isMobile ? 4 : 3}>Xem chi tiết hồ sơ nhân viên</Title>
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
        <Panel header="Thông tin hồ sơ nhân viên" key="1">
          {renderInfoSection()}
        </Panel>

        <Panel header="Đính kèm" key="2">
          <AttachmentSection
            refId={data?.id || ""}
            refType="Employee"
            refreshTrigger={refreshFlag}
          />
        </Panel>

        <Panel header="Ghi chú" key="3">
          <NoteSection
            refId={data?.id || ""}
            refType="Employee"
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
              refType="Employee"
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
            formData.append("refId", data.id);
            formData.append("refType", "Employee");

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

export default EmployeeDetail;
