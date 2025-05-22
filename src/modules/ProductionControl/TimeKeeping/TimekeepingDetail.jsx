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
import TimekeepingModal from "./TimekeepingModal";

const { Title } = Typography;
const { Panel } = Collapse;

const TimekeepingDetail = () => {
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
    { title: "Họ và tên", dataIndex: "hoTen" },
    { title: "Chức vụ", dataIndex: "chucVu" },
    ...Array.from({ length: 31 }, (_, i) => ({
      title: `${i + 1}`,
      dataIndex: `d${i + 1}`,
      width: 40,
    })),
  ];

  const timekeepingData = [
    {
      key: "1",
      stt: 1,
      hoTen: "Nguyễn Văn A",
      chucVu: "Nhân viên",
      ...Array.from({ length: 31 }, (_, i) => ({ [`d${i + 1}`]: "" })).reduce((a, b) => ({ ...a, ...b })),
    },
  ];

  return (
    <div style={{ padding: 10 }}>
      <Row justify="space-between" align="middle">
        <Col>
          <Title level={3}>Xem chi tiết chấm công</Title>
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
        <Panel header="Thông tin chấm công" key="1">
          <Row gutter={16}>
            <Col span={12}>
              <Space
                direction="vertical"
                size="small"
                style={{ width: "100%" }}
              >
                <div>Đơn vị: Công ty ABC</div>
                <div>Mã chấm công: CC2025-03</div>
                <div>Tên chấm công: Tháng 3 - Phòng Nhân sự</div>
              </Space>
            </Col>
            <Col span={12}>
              <Space
                direction="vertical"
                size="small"
                style={{ width: "100%" }}
              >
                <div>Tháng: 03/2025</div>
                <div>Ghi chú: Chấm công thử nghiệm</div>
              </Space>
            </Col>
          </Row>
        </Panel>

        <Panel header="Bảng chấm công" key="2">
          <Table
            columns={columns}
            dataSource={timekeepingData}
            scroll={{ x: "max-content" }}
            size="small"
            bordered
            pagination={false}
          />
        </Panel>

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

      <TimekeepingModal
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

export default TimekeepingDetail;
