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
import { useSelector } from "react-redux";
import { getApprovalSetting } from "../../../../services/apiApproveSetting";
import { getApprovalsByRef } from "../../../../services/apiApprovals";
import {
  deleteEquipmentInventoryID,
  getEquipmentInventoryByID,
} from "../../../../services/apiProductControl/apiEquipmentInventory";
import { addAttachments } from "../../../../services/apiAttachment";
import dayjs from "dayjs";
import DeviceManagementModal from "./DeviceManagementModal";

const { Title } = Typography;
const { Panel } = Collapse;

const DeviceManagementDetail = () => {
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
      let res = await getEquipmentInventoryByID(id);
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
        let res = await deleteEquipmentInventoryID(data.id);
        if ((res && res.status === 200) || res.status === 204) {
          Modal.success({
            title: "Xóa thành công",
            content: `Đã xóa thành công phiếu`,
          });
          navigator("/pm/bao-cao/kiem-ke-thiet-bi");
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
          <Title level={3}>Xem chi tiết thông tin thiết bị</Title>
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
        <Panel header="Thông tin thiết bị" key="1">
          {data && (
            <Row gutter={16}>
              <Col span={12}>
                <Space
                  direction="vertical"
                  size="small"
                  style={{ width: "100%" }}
                >
                  <div>Báo cáo kiểm kê: {data.equipmentInventory || ""}</div>
                  <div>Tên thiết bị, CCDC: {data.itemName || ""}</div>
                  <div>Ký hiệu: {data.code || ""}</div>
                  <div>ĐVT: {data.unit || ""}</div>
                  <div>Kiểm kê kỳ trước: {data.previousInventory || ""}</div>
                  <div>Tăng trong năm: {data.annualIncreaseQuantity || ""}</div>
                  <div>Giảm trong năm: {data.annualDecreaseQuantity || ""}</div>
                </Space>
              </Col>
              <Col span={12}>
                <Space
                  direction="vertical"
                  size="small"
                  style={{ width: "100%" }}
                >
                  <div>
                    Kiểm kê năm nay: {data.currentYearInventoryCount || ""}
                  </div>
                  <div>Cấp 1: {data.level1 || ""}</div>
                  <div>Cấp 2: {data.level2 || ""}</div>
                  <div>Cấp 3: {data.level3 || ""}</div>
                  <div>Cấp 4: {data.level4 || ""}</div>
                  <div>Cấp 5: {data.level5 || ""}</div>
                  <div>Ghi chú: {data.notes || ""}</div>
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

        <Panel header="Đính kèm" key="3">
          <AttachmentSection
            refId={data ? data.id : ""}
            refType={"EquipmentInventory"}
            refreshTrigger={refreshFlag}
          />
        </Panel>

        <Panel header="Ghi chú" key="4">
          <NoteSection
            refId={data ? data.id : ""}
            refType={"EquipmentInventory"}
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
              refType={"EquipmentInventory"}
              voucherNo={data.voucherNo}
            />
          )}
        </Panel>
      </Collapse>

      <DeviceManagementModal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onSubmit={(data) => {
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
            formData.append("refType", "EquipmentInventory");

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

export default DeviceManagementDetail;
