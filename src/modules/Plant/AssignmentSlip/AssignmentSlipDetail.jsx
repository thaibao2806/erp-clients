import React, { useEffect, useState } from "react";
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
import AssignmentSlipModal from "./AssignmentSlipModal";
import { getAssignmentSlipById } from "../../../services/apiPlan/apiAssignmentSlip";
import dayjs from "dayjs";

const { Title } = Typography;
const { Panel } = Collapse;

const AssignmentSlipDetail = () => {
  const { id } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingData, setEditingData] = useState(null);
  const [data, setData] = useState();

  useEffect(() => {
    getData();
    console.log(data);
  }, []);

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
    { title: "Nội dung", dataIndex: "content" },
    { title: "ĐVT", dataIndex: "unit" },
    { title: "SL", dataIndex: "quantity" },
    { title: "N/Công", dataIndex: "workDay" },
    { title: "Ghi chú", dataIndex: "note" },
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
        <Panel header="Thông tin phiếu giao việc" key="1">
          {data && (
            <Row gutter={16}>
              <Col span={12}>
                <Space
                  direction="vertical"
                  size="small"
                  style={{ width: "100%" }}
                >
                  <div>Số chứng từ: {data.documentNumber || ""}</div>
                  <div>Tên sản phẩm: {data.productName || ""}</div>
                  <div>
                    Ngày chứng từ:{" "}
                    {data.documentDate
                      ? new Date(data.documentDate).toLocaleDateString("vi-VN")
                      : "---"}
                  </div>
                </Space>
              </Col>
              <Col span={12}>
                <Space
                  direction="vertical"
                  size="small"
                  style={{ width: "100%" }}
                >
                  <div>Đơn bị quản lý: {data.documentNumber || ""}</div>
                  <div>Bộ phận: {data.department || ""}</div>
                  <div>Ghi chú: {data.note || ""}</div>
                </Space>
              </Col>
            </Row>
          )}
        </Panel>

        <Panel header="Nội dung phiếu giao việc" key="2">
          {data && (
            <Table
              columns={columns}
              dataSource={data.details?.map((item, index) => ({
                ...item,
                stt: index + 1,
              }))}
              scroll={{ x: "max-content" }}
              size="small"
              bordered
              pagination={false}
            />
          )}
        </Panel>

        <Panel header="Đính kèm" key="3">
          <AttachmentSection attachments={[]} />
        </Panel>

        <Panel header="Ghi chú" key="4">
          <NoteSection />
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
              onAddFollower={() => {
                console.log("Thêm người theo dõi");
              }}
            />
          )}
        </Panel>
      </Collapse>

      <AssignmentSlipModal
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

export default AssignmentSlipDetail;
