import React, { useState } from "react";
import { useParams } from "react-router-dom";
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
import ProjectsModal from "./ProjectsModal";

const { Title } = Typography;
const { Panel } = Collapse;

const ProjectsDetail = () => {
  const { id } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingData, setEditingData] = useState(null);


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

  const handleMenuClick = ({ key }) => {
    if (key === "edit") {
      // Giả sử dữ liệu đang xem là 1 đơn chấm công duy nhất
      setEditingData({
        unit: "Công ty ABC",
        code: "CC2025-03",
        name: "Tháng 3 - Phòng Nhân sự",
        // Bạn có thể convert string -> dayjs nếu cần: dayjs("2025-03", "YYYY-MM")
      });
      setIsModalOpen(true);
    } else {
      message.info(`Bạn đã chọn: ${key}`);
    }
  };
  

  const columns = [
    { title: "STT", dataIndex: "stt", width: 50 },
    { title: "Tên vật tư, thiết bị", dataIndex: "vattuthietbi" },
    { title: "Ngày nhập", dataIndex: "ngaynhap" },
    { title: "SL nhập", dataIndex: "slnhap" },
    { title: "Ngày xuất", dataIndex: "ngayxuat" },
    { title: "SL xuất", dataIndex: "slxuat" },
    { title: "SL tồn", dataIndex: "sltồn" },
    { title: "Ghi chú", dataIndex: "ghichu" },
  ];

  const timekeepingData = [
    {
      key: "1",
      stt: 1,
      vattuthietbi: "Máy hàn",
      ngaynhap: "12/04/2025",
      slnhap: "5",
      ngayxuat: "12/04/2025",
      slxuat: "5",
      slton: "0",
      ghichu: "đã giao",
    },
  ];

  return (
    <div style={{ padding: 10 }}>
      <Row justify="space-between" align="middle">
        <Col>
          <Title level={3}>Xem chi tiết dự án</Title>
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
        <Panel header="Thông tin sổ kho" key="1">
          <Row gutter={16}>
            <Col span={12}>
              <Space
                direction="vertical"
                size="small"
                style={{ width: "100%" }}
              >
                <div>Đơn vị: Công ty ABC</div>
                <div>Số chứng từ: CC2025-03</div>
                <div>Sản phẩm: Tháng 3 - Phòng Nhân sự</div>
                <div>Ngày chứng từ: 03/2025</div>
                <div>Ngày bắt đầu: 03/2025</div>
              </Space>
            </Col>
            <Col span={12}>
              <Space
                direction="vertical"
                size="small"
                style={{ width: "100%" }}
              >
                <div>Ngày kết thúc: 03/2025</div>
                <div>Trạng thái: Đang thực hiện</div>
                <div>Ghi chú: Chấm công thử nghiệm</div>
              </Space>
            </Col>
          </Row>
        </Panel>

        {/* <Panel header="Bảng vật tư, thiết bị" key="2">
          <Table
            columns={columns}
            dataSource={timekeepingData}
            scroll={{ x: "max-content" }}
            size="small"
            bordered
            pagination={false}
          />
        </Panel> */}

        <Panel header="Đính kèm" key="3">
          <AttachmentSection attachments={[]} />
        </Panel>

        <Panel header="Ghi chú" key="4">
          <NoteSection />
        </Panel>

        <Panel header="Hệ thống" key="5">
          <SystemSection
            systemInfo={{
              createdBy: "ASOFTADMIN",
              createdAt: "18/11/2024 18:31:58",
              updatedBy: "ASOFTADMIN",
              updatedAt: "18/11/2024 18:31:58",
            }}
            onAddFollower={() => {
              console.log("Thêm người theo dõi");
            }}
          />
        </Panel>
      </Collapse>

      <ProjectsModal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onSubmit={(data) => {
          console.log("Đã cập nhật:", data);
          setIsModalOpen(false);
        }}
        initialValues={editingData}
      />
    </div>
  );
};

export default ProjectsDetail;
