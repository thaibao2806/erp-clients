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

  const columns = [
    { title: "STT", dataIndex: "stt", width: 50 },
    { title: "Nội dung", dataIndex: "content" ,onCell: () => ({
      style: { 
        whiteSpace: "normal", 
        wordWrap: "break-word", 
        maxWidth: 500 // bạn có thể chỉnh kích thước mong muốn
      },
    }),},
    { title: "ĐVT", dataIndex: "unit" },
    { title: "SL", dataIndex: "quantity" },
    { title: "N/Công", dataIndex: "workDay" },
    { title: "Ghi chú", dataIndex: "note" },
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
              {approvals?.length > 0 && (
                <>
                  {approvals.map((item, index) => (
                    <Col span={12}>
                      <Space
                        direction="vertical"
                        size="small"
                        style={{ width: "100%", paddingTop: "10px" }}
                        key={index}
                      >
                        <div>
                          Người duyệt {index + 1}: {item.fullName}
                        </div>
                        <div>
                          Trạng thái duyệt {index + 1}:{" "}
                          {item.status === "rejected"
                            ? "Từ chối"
                            : item.status === "approved"
                            ? "Đã duyệt"
                            : "Chờ duyệt"}
                        </div>
                        <div>
                          Ghi chú người duyệt {index + 1}: {item.note || ""}
                        </div>
                      </Space>
                    </Col>
                  ))}
                </>
              )}
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
            formData.append("refId", data.id); // id của AssignmentSlip
            formData.append("refType", "AssignmentSlip");

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

export default AssignmentSlipDetail;
