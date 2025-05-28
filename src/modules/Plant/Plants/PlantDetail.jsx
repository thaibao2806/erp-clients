import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import NoteSection from "../../../components/NoteSection ";
import AttachmentSection from "../../../components/AttachmentSection ";
import SystemSection from "../../../components/SystemSection";
import PlantsModal from "./PlantsModal";
import { useSelector } from "react-redux";
import { deletePlans, getPlansByID } from "../../../services/apiPlan/apiPlan";
import dayjs from "dayjs";
import { addAttachments } from "../../../services/apiAttachment";

const { Title } = Typography;
const { Panel } = Collapse;

const PlantsDetail = () => {
  const { id } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingData, setEditingData] = useState(null);
  const [data, setData] = useState();
  const [refreshFlag, setRefreshFlag] = useState(0);
  const user = useSelector((state) => state.auth.login.currentUser);
  const fileInputRef = useRef(null);
  const navigator = useNavigate();

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    try {
      let res = await getPlansByID(id);
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
      setEditingData(data);
      setIsModalOpen(true);
    } else if (key === "attach") {
      fileInputRef.current?.click(); // Mở hộp thoại chọn file
    } else if (key === "delete") {
      try {
        let res = await deletePlans(data.id);
        if ((res && res.status === 200) || res.status === 204) {
          Modal.success({
            title: "Xóa thành công",
            content: `Đã xóa thành công phiếu`,
          });
          navigator("/pl/ke-hoach/ke-hoach");
        }
      } catch (error) {
        Modal.error({
          title: "Xóa thất bại",
          content: `Đã có lỗi xãy ra. Vui lòng thử lại sau`,
        });
      }
    }
  };

  const columns = [
    { title: "STT", dataIndex: "stt", width: 50 },
    { title: "Tên phương tiện", dataIndex: "vehicleName" },
    { title: "Nội dung", dataIndex: "content" },
    {
      title: "Thời gian (dự kiến)",
      dataIndex: "expectedTime",
      render: (date) =>
        date ? new Date(date).toLocaleDateString("vi-VN") : "---",
    },
    { title: "Ghi chú", dataIndex: "note" },
  ];

  return (
    <div style={{ padding: 10 }}>
      <Row justify="space-between" align="middle">
        <Col>
          <Title level={3}>Xem chi tiết kế hoạch</Title>
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
        <Panel header="Thông tin kế hoạch" key="1">
          {data && (
            <Row gutter={16}>
              <Col span={12}>
                <Space
                  direction="vertical"
                  size="small"
                  style={{ width: "100%" }}
                >
                  <div>Đơn vị: {data.department || ""}</div>
                  <div>Số chứng từ: {data.documentNumber || ""}</div>
                  <div>Kế hoạch về việc: {data.planContent || ""}</div>
                </Space>
              </Col>
              <Col span={12}>
                <Space
                  direction="vertical"
                  size="small"
                  style={{ width: "100%" }}
                >
                  <div>
                    Ngày chứng từ:{" "}
                    {data.documentDate
                      ? new Date(data.documentDate).toLocaleDateString("vi-VN")
                      : "---"}
                  </div>
                  <div>Nơi nhận: {data.receiver || ""}</div>
                  <div>Ghi chú: {data.note || ""}</div>
                </Space>
              </Col>
            </Row>
          )}
        </Panel>

        <Panel header="Nội dung kế hoạch" key="2">
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
          <AttachmentSection
            refId={data ? data.id : ""}
            refType={"Plan"}
            refreshTrigger={refreshFlag}
          />
        </Panel>

        <Panel header="Ghi chú" key="4">
          <NoteSection refId={data ? data.id : ""} refType={"Plan"} />
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
            />
          )}
        </Panel>
      </Collapse>

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
            formData.append("refType", "Plan");

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

      <PlantsModal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onSubmit={(data) => {
          getData();
          setIsModalOpen(false);
        }}
        initialValues={editingData}
      />
    </div>
  );
};

export default PlantsDetail;
