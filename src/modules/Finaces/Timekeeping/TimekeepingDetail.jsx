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

  const columns = [
    { title: "STT", dataIndex: "stt", width: 50 },
    { title: "Họ và tên", dataIndex: "fullName" },
    { title: "Chức vụ", dataIndex: "position" },
    ...Array.from({ length: 31 }, (_, i) => ({
      title: `Ngày ${i + 1}`,
      dataIndex: `d${i + 1}`,
      width: 80,
      align: "center",
    })),
    { title: "Thời gian hoàn thành", dataIndex: "workDay" },
    { title: "Tổng công", dataIndex: "totalWork" },
  ];

  return (
    <div style={{ padding: 10 }}>
      <Row justify="space-between" align="middle">
        <Col>
          <Title level={3}>Xem chi tiết phiếu chấm công</Title>
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
        <Panel header="Thông tin phiếu chấm công" key="1">
          {data && (
            <Row gutter={16}>
              <Col span={12}>
                <Space
                  direction="vertical"
                  size="small"
                  style={{ width: "100%" }}
                >
                  <div>Số chứng từ: {data.voucherNo || ""}</div>
                  <div>
                    Ngày chứng từ:{" "}
                    {data.voucherDate
                      ? new Date(data.voucherDate).toLocaleDateString("vi-VN")
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
                  <div>
                    Chấm công tháng:{" "}
                    {data.month ? dayjs(data.month).format("MM/YYYY") : "---"}
                  </div>
                  <div>Ghi chú: {data.note || ""}</div>
                </Space>
              </Col>
            </Row>
          )}
        </Panel>

        <Panel header="Nội dung phiếu chấm công" key="2">
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
            formData.append("refId", data.id); // id của AssignmentSlip
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
