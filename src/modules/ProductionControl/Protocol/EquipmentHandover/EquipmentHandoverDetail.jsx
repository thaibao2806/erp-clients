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
import NoteSection from "../../../../components/NoteSection ";
import AttachmentSection from "../../../../components/AttachmentSection ";
import SystemSection from "../../../../components/SystemSection";
import EquipmentHandoverModal from "./EquipmentHandoverModal";

const { Title } = Typography;
const { Panel } = Collapse;

const EquipmentHandoverDetail = () => {
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
    { title: "Nội dung", dataIndex: "vattuthietbi" },
    { title: "Kí hiệu", dataIndex: "ngaynhap" },
    { title: "Bộ phận", dataIndex: "bophan" },
    { title: "ĐVT", dataIndex: "slnhap" },
    { title: "Số lượng", dataIndex: "ngayxuat" },
    // { title: "Đơn giá", dataIndex: "dongia" },
    // { title: "Thành tiền", dataIndex: "thanhtien" },
    { title: "Tình trạng", dataIndex: "slxuat" },
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
      loaibienban: "bàn giao"
    },
  ];

  return (
    <div style={{ padding: 10 }}>
      <Row justify="space-between" align="middle">
        <Col>
          <Title level={3}>Xem chi tiết biên bản bàn giao, thu hồi TB-VT</Title>
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
        <Panel header="Thông tin biên bản" key="1">
          <Row gutter={16}>
            <Col span={12}>
              <Space
                direction="vertical"
                size="small"
                style={{ width: "100%" }}
              >
                <div>Đơn vị: Công ty ABC</div>
                <div>Số chứng từ: CC2025-03</div>
                <div>Nội dung bàn giao: Tháng 3 - Phòng Nhân sự</div>
              </Space>
            </Col>
            <Col span={12}>
              <Space
                direction="vertical"
                size="small"
                style={{ width: "100%" }}
              >
                <div>Loại biên bản: Bàn giao</div>
                <div>Ngày chứng từ: 03/2025</div>
              </Space>
            </Col>
          </Row>
          <Space direction="vertical" size="middle"></Space>
        </Panel>

        <Panel header="Bảng vật tư, thiết bị" key="2">
          <Table
            columns={columns}
            dataSource={timekeepingData}
            scroll={{ x: "max-content" }}
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
                      }}
                    />
                  ),
                  },
              }}
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

      <EquipmentHandoverModal
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

export default EquipmentHandoverDetail;
