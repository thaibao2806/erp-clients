import React, { useEffect, useState } from "react";
import {
  Modal,
  Form,
  Input,
  DatePicker,
  Row,
  Col,
  Table,
  Button,
  Space,
  Tooltip,
  Select,
  Drawer,
  notification,
} from "antd";
import { DeleteOutlined, PlusOutlined, TableOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import {
  createApprovals,
  getApprovalsByRef,
  updateStatusApprovals,
} from "../../../../services/apiApprovals";
import { getAllUser } from "../../../../services/apiAuth";
import { getApprovalSetting } from "../../../../services/apiApproveSetting";
import { getDocumentNumber } from "../../../../services/apiAutoNumbering";
import {
  createRepair,
  updateRepair,
} from "../../../../services/apiProductControl/apiRepair";
import { useSelector } from "react-redux";
import { addFollower } from "../../../../services/apiFollower";

dayjs.extend(customParseFormat);

// hook responsive
const useResponsive = () => {
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return {
    isMobile: width <= 768,
    isTablet: width > 768 && width <= 1024,
    isDesktop: width > 1024,
  };
};

const approvalStatusOptions = [
  { value: "pending", label: "Chờ duyệt" },
  { value: "approved", label: "Đã duyệt" },
  { value: "rejected", label: "Từ chối" },
];

const RepairModal = ({ open, onCancel, onSubmit, initialValues }) => {
  const [form] = Form.useForm();
  const [monthYear, setMonthYear] = useState(dayjs());
  const [tableData, setTableData] = useState([]);
  const [approvalNumber, setApprovalNumber] = useState();
  const [approvers, setApprovers] = useState([]);
  const [dataUser, setDataUser] = useState([]);
  const [isEditApproval, setIsEditApproval] = useState(false);
  const [loading, setLoading] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);

  const user = useSelector((state) => state.auth.login?.currentUser);
  const { isMobile, isTablet } = useResponsive();

  // ================= INIT =================
  useEffect(() => {
    if (open) {
      if (!initialValues) {
        getVoucherNo();
      }
      form.setFieldsValue(initialValues || {});
      setIsEditApproval(!!initialValues?.type);
      setMonthYear(dayjs(initialValues?.voucherDate || dayjs()));

      if (initialValues?.details?.length) {
        const formatted = initialValues.details.map((item, idx) => ({
          key: `${Date.now()}_${idx}`,
          stt: idx + 1,
          content: item.content || "",
          code: item.code || "",
          unit: item.unit || "",
          quantity: item.quantity || "",
          condition: item.condition || "",
          notes: item.notes || "",
        }));
        setTableData(formatted);
      } else {
        setTableData([]);
      }

      getApprovalByModulePage();
      getUser();
      if (initialValues) getApprovals(initialValues.id);
    }
  }, [open, initialValues, form]);

  useEffect(() => {
    if (open && !initialValues && approvalNumber > 0) {
      setApprovers(Array(approvalNumber).fill({ userName: null }));
    }
  }, [approvalNumber, open, initialValues]);

  // ================= API =================
  const getApprovals = async (refId) => {
    try {
      let res = await getApprovalsByRef(refId, "DXSCTL");
      if (res?.status === 200) {
        const list = res.data.data.map((ap) => ({
          id: ap.id,
          username: ap.userName,
          status: ap.status,
          note: ap.note,
        }));
        setApprovers(list);
        form.setFieldsValue({ approvers: list });
      }
    } catch {}
  };

  const getUser = async () => {
    try {
      let res = await getAllUser();
      if (res?.status === 200) {
        const options = res.data.data.map((u) => ({
          id: u.apk,
          value: u.userName,
          label: u.fullName || u.userName,
        }));
        setDataUser(options);
      }
    } catch {}
  };

  const getApprovalByModulePage = async () => {
    try {
      let res = await getApprovalSetting("PM", "pm-de-xuat-sua-chua");
      if (res?.status === 200) {
        setApprovalNumber(res.data.data.approvalNumber);
      }
    } catch {}
  };

  const getVoucherNo = async () => {
    try {
      let res = await getDocumentNumber("DXSCTL");
      if (res?.status === 200) {
        form.setFieldsValue({ voucherNo: res.data.data.code });
      }
    } catch {}
  };

  // ================= TABLE =================
  const handleAddRow = () => {
    const newRow = {
      key: `${Date.now()}`,
      stt: tableData.length + 1,
      content: "",
      code: "",
      unit: "",
      quantity: "",
      condition: "",
      notes: "",
    };
    setTableData((prev) => [...prev, newRow]);
  };

  const handleDeleteRow = (key) =>
    setTableData((prev) => prev.filter((item) => item.key !== key));

  const handleInputChange = (key, field, value) =>
    setTableData((prev) =>
      prev.map((item) =>
        item.key === key ? { ...item, [field]: value } : item
      )
    );

  const generateColumns = () => [
    {
      title: "",
      dataIndex: "action",
      width: isMobile ? 35 : 40,
      render: (_, record) => (
        <Tooltip title="Xóa dòng">
          <Button
            icon={<DeleteOutlined />}
            size="small"
            danger
            onClick={() => handleDeleteRow(record.key)}
          />
        </Tooltip>
      ),
    },
    { title: "STT", dataIndex: "stt", width: 50 },
    {
      title: "Nội dung",
      dataIndex: "content",
      render: (_, r) => (
        <Input
          value={r.content}
          size="small"
          onChange={(e) => handleInputChange(r.key, "content", e.target.value)}
        />
      ),
    },
    {
      title: "Kí hiệu",
      dataIndex: "code",
      render: (_, r) => (
        <Input
          value={r.code}
          size="small"
          onChange={(e) => handleInputChange(r.key, "code", e.target.value)}
        />
      ),
    },
    {
      title: "ĐVT",
      dataIndex: "unit",
      render: (_, r) => (
        <Input
          value={r.unit}
          size="small"
          onChange={(e) => handleInputChange(r.key, "unit", e.target.value)}
        />
      ),
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      render: (_, r) => (
        <Input
          value={r.quantity}
          size="small"
          onChange={(e) => handleInputChange(r.key, "quantity", e.target.value)}
        />
      ),
    },
    {
      title: "Tình trạng",
      dataIndex: "condition",
      render: (_, r) => (
        <Input
          value={r.condition}
          size="small"
          onChange={(e) =>
            handleInputChange(r.key, "condition", e.target.value)
          }
        />
      ),
    },
    {
      title: "Ghi chú",
      dataIndex: "notes",
      render: (_, r) => (
        <Input
          value={r.notes}
          size="small"
          onChange={(e) => handleInputChange(r.key, "notes", e.target.value)}
        />
      ),
    },
  ];

  // ================= MOBILE CARD =================
  const renderMobileCards = () => (
    <div style={{ marginTop: 8 }}>
      {tableData.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: 24,
            border: "1px dashed #d9d9d9",
            borderRadius: 6,
            color: "#999",
          }}
        >
          Chưa có dữ liệu
        </div>
      ) : (
        <div style={{ maxHeight: 300, overflowY: "auto" }}>
          {tableData.map((r, i) => (
            <div
              key={r.key}
              style={{
                border: "1px solid #f0f0f0",
                borderRadius: 8,
                padding: 12,
                marginBottom: 8,
                background: "#fafafa",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <strong>#{i + 1}</strong>
                <Button
                  icon={<DeleteOutlined />}
                  size="small"
                  danger
                  onClick={() => handleDeleteRow(r.key)}
                />
              </div>
              <Input
                value={r.content}
                size="small"
                placeholder="Nội dung"
                onChange={(e) =>
                  handleInputChange(r.key, "content", e.target.value)
                }
                style={{ marginBottom: 8 }}
              />
              <Input
                value={r.code}
                size="small"
                placeholder="Kí hiệu"
                onChange={(e) =>
                  handleInputChange(r.key, "code", e.target.value)
                }
                style={{ marginBottom: 8 }}
              />
              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <Input
                  value={r.unit}
                  size="small"
                  placeholder="ĐVT"
                  onChange={(e) =>
                    handleInputChange(r.key, "unit", e.target.value)
                  }
                />
                <Input
                  value={r.quantity}
                  size="small"
                  placeholder="Số lượng"
                  onChange={(e) =>
                    handleInputChange(r.key, "quantity", e.target.value)
                  }
                />
              </div>
              <Input
                value={r.condition}
                size="small"
                placeholder="Tình trạng"
                onChange={(e) =>
                  handleInputChange(r.key, "condition", e.target.value)
                }
                style={{ marginBottom: 8 }}
              />
              <Input
                value={r.notes}
                size="small"
                placeholder="Ghi chú"
                onChange={(e) =>
                  handleInputChange(r.key, "notes", e.target.value)
                }
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ================= SAVE =================
  const handleOk = () => {
    form.validateFields().then(async (values) => {
      try {
        setLoading(true);
        const payload = {
          ...values,
          voucherDate: monthYear.toISOString(),
          details: tableData,
        };
        if (!initialValues) {
          await createRepair(
            payload.voucherNo,
            payload.voucherDate,
            payload.assetName,
            payload.assetType,
            payload.department,
            payload.note,
            payload.details
          );
        } else {
          await updateRepair(
            initialValues.id,
            payload.voucherNo,
            payload.voucherDate,
            payload.assetName,
            payload.assetType,
            payload.department,
            payload.note,
            payload.details
          );
        }
        notification.success({ message: "Lưu thành công" });
        onSubmit();
        form.resetFields();
        setTableData([]);
        setMonthYear(dayjs());
      } catch {
        notification.error({ message: "Có lỗi xảy ra" });
      } finally {
        setLoading(false);
      }
    });
  };

  return (
    <>
      <Modal
        title={
          <span style={{ fontSize: isMobile ? 18 : 22, fontWeight: 600 }}>
            {initialValues ? "Cập nhật đề xuất" : "Thêm đề xuất"}
          </span>
        }
        open={open}
        onCancel={() => {
          form.resetFields();
          setTableData([]);
          setDrawerVisible(false);
          onCancel();
        }}
        onOk={handleOk}
        okText={initialValues ? "Cập nhật" : "Thêm"}
        confirmLoading={loading}
        width={isMobile ? "95%" : isTablet ? 800 : 1000}
        bodyStyle={isMobile ? { padding: 16 } : {}}
      >
        <Form
          form={form}
          layout="vertical"
          size={isMobile ? "small" : "default"}
        >
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item
                name="voucherNo"
                label="Số chứng từ"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="assetName" label="Nội dung đề xuất">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Ngày chứng từ" required>
                <DatePicker
                  value={monthYear}
                  format="DD/MM/YYYY"
                  onChange={setMonthYear}
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="department" label="Bộ phận">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="assetType"
                label="Loại đề xuất"
                rules={[{ required: true }]}
              >
                <Select
                  options={[
                    { value: "SC", label: "Sửa chữa" },
                    { value: "TL", label: "Thanh lý" },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="note" label="Ghi chú">
                <Input />
              </Form.Item>
            </Col>
          </Row>

          {/* Chi tiết */}
          {isMobile ? (
            <>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <h4>Bảng chi tiết sửa chữa/thanh lý</h4>
                <Space>
                  <Button icon={<PlusOutlined />} onClick={handleAddRow}>
                    Thêm dòng
                  </Button>
                  <Button onClick={() => setTableData([])}>Hủy</Button>
                </Space>
              </div>
              {renderMobileCards()}
            </>
          ) : (
            <>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <h4>Bảng chi tiết sửa chữa/thanh lý</h4>
                {isTablet ? (
                  <Button
                    icon={<TableOutlined />}
                    onClick={() => setDrawerVisible(true)}
                  >
                    Xem bảng
                  </Button>
                ) : (
                  <Space>
                    <Button icon={<PlusOutlined />} onClick={handleAddRow}>
                      Thêm dòng
                    </Button>
                    <Button onClick={() => setTableData([])}>Hủy</Button>
                  </Space>
                )}
              </div>

              {!isTablet && (
                <Table
                  columns={generateColumns()}
                  dataSource={tableData}
                  pagination={false}
                  scroll={{ x: "max-content", y: 300 }}
                  bordered
                  size="small"
                />
              )}

              {isTablet && tableData.length > 0 && (
                <div style={{ textAlign: "center" }}>
                  Có {tableData.length} dòng dữ liệu.{" "}
                  <Button type="link" onClick={() => setDrawerVisible(true)}>
                    Nhấn để xem chi tiết
                  </Button>
                </div>
              )}
            </>
          )}
        </Form>
      </Modal>

      {/* Drawer cho Tablet */}
      <Drawer
        title="Chi tiết sửa chữa/thanh lý"
        width="90%"
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
      >
        <div style={{ marginBottom: 12 }}>
          <Space>
            <Button icon={<PlusOutlined />} onClick={handleAddRow}>
              Thêm dòng
            </Button>
            <Button onClick={() => setTableData([])}>Hủy</Button>
          </Space>
        </div>
        <Table
          columns={generateColumns()}
          dataSource={tableData}
          pagination={false}
          scroll={{ x: "max-content", y: "calc(100vh - 200px)" }}
          bordered
          size="small"
        />
      </Drawer>
    </>
  );
};

export default RepairModal;
