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
  Drawer,
  notification,
} from "antd";
import { DeleteOutlined, PlusOutlined, TableOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

// Hook responsive
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

const BuySuppliesModal = ({ open, onCancel, onSubmit, initialValues }) => {
  const [form] = Form.useForm();
  const [documentDate, setDocumentDate] = useState(dayjs());
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);

  const { isMobile, isTablet } = useResponsive();

  // ================= INIT DATA =================
  useEffect(() => {
    if (open) {
      form.setFieldsValue(initialValues || {});
      setDocumentDate(dayjs(initialValues?.documentDate || dayjs()));
      if (initialValues?.details?.length) {
        const formatted = initialValues.details.map((item, idx) => ({
          key: `${Date.now()}_${idx}`,
          stt: idx + 1,
          itemName: item.itemName || "",
          unit: item.unit || "",
          quantity: item.quantity || "",
          note: item.note || "",
        }));
        setTableData(formatted);
      } else {
        setTableData([]);
      }
    }
  }, [open, initialValues, form]);

  // ================= TABLE LOGIC =================
  const handleAddRow = () => {
    const newRow = {
      key: `${Date.now()}`,
      stt: tableData.length + 1,
      itemName: "",
      unit: "",
      quantity: "",
      note: "",
    };
    setTableData((prev) => [...prev, newRow]);
  };

  const handleDeleteRow = (key) => {
    setTableData((prev) => prev.filter((item) => item.key !== key));
  };

  const handleInputChange = (key, field, value) => {
    setTableData((prev) =>
      prev.map((item) =>
        item.key === key ? { ...item, [field]: value } : item
      )
    );
  };

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
    {
      title: "STT",
      dataIndex: "stt",
      width: isMobile ? 45 : 50,
    },
    {
      title: "Tên vật tư/thiết bị",
      dataIndex: "itemName",
      width: isMobile ? 150 : 200,
      render: (_, record) => (
        <Input
          value={record.itemName}
          size="small"
          placeholder="Tên vật tư"
          onChange={(e) =>
            handleInputChange(record.key, "itemName", e.target.value)
          }
        />
      ),
    },
    {
      title: "ĐVT",
      dataIndex: "unit",
      width: isMobile ? 80 : 100,
      render: (_, record) => (
        <Input
          value={record.unit}
          size="small"
          placeholder="ĐVT"
          onChange={(e) =>
            handleInputChange(record.key, "unit", e.target.value)
          }
        />
      ),
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      width: isMobile ? 90 : 120,
      render: (_, record) => (
        <Input
          value={record.quantity}
          size="small"
          placeholder="Số lượng"
          onChange={(e) =>
            handleInputChange(record.key, "quantity", e.target.value)
          }
        />
      ),
    },
    {
      title: "Ghi chú",
      dataIndex: "note",
      width: isMobile ? 120 : 150,
      render: (_, record) => (
        <Input
          value={record.note}
          size="small"
          placeholder="Ghi chú"
          onChange={(e) =>
            handleInputChange(record.key, "note", e.target.value)
          }
        />
      ),
    },
  ];

  // ================= MOBILE RENDER =================
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
          {tableData.map((record, index) => (
            <div
              key={record.key}
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
                <strong style={{ fontSize: 12 }}>#{index + 1}</strong>
                <Button
                  icon={<DeleteOutlined />}
                  size="small"
                  danger
                  onClick={() => handleDeleteRow(record.key)}
                />
              </div>

              <Input
                value={record.itemName}
                size="small"
                placeholder="Tên vật tư"
                onChange={(e) =>
                  handleInputChange(record.key, "itemName", e.target.value)
                }
                style={{ marginBottom: 8 }}
              />
              <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <Input
                  value={record.unit}
                  size="small"
                  placeholder="ĐVT"
                  onChange={(e) =>
                    handleInputChange(record.key, "unit", e.target.value)
                  }
                />
                <Input
                  value={record.quantity}
                  size="small"
                  placeholder="Số lượng"
                  onChange={(e) =>
                    handleInputChange(record.key, "quantity", e.target.value)
                  }
                />
              </div>
              <Input
                value={record.note}
                size="small"
                placeholder="Ghi chú"
                onChange={(e) =>
                  handleInputChange(record.key, "note", e.target.value)
                }
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ================= HANDLE SAVE =================
  const handleOk = () => {
    form.validateFields().then(async (values) => {
      try {
        setLoading(true);
        const payload = {
          ...values,
          documentDate: documentDate.toISOString(),
          details: tableData,
        };
        // TODO: call API add/update
        console.log("Payload gửi đi:", payload);
        notification.success({
          message: "Thành công",
          description: "Lưu phiếu thành công.",
          placement: isMobile ? "top" : "topRight",
        });
        onSubmit();
        form.resetFields();
        setTableData([]);
        setDocumentDate(dayjs());
      } catch (err) {
        notification.error({
          message: "Thất bại",
          description: "Đã có lỗi xảy ra. Vui lòng thử lại.",
          placement: isMobile ? "top" : "topRight",
        });
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
            {initialValues
              ? "Cập nhật phiếu mua vật tư"
              : "Thêm phiếu mua vật tư"}
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
                name="documentNumber"
                label="Số chứng từ"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Ngày chứng từ" required>
                <DatePicker
                  value={documentDate}
                  format="DD/MM/YYYY"
                  onChange={setDocumentDate}
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="note" label="Ghi chú">
                <Input.TextArea rows={1} />
              </Form.Item>
            </Col>
          </Row>

          {/* Bảng chi tiết */}
          {isMobile ? (
            <>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <h4 style={{ margin: 0 }}>Bảng vật tư, thiết bị</h4>
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
                <h4 style={{ margin: 0 }}>Bảng vật tư, thiết bị</h4>
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
                <div
                  style={{
                    padding: 12,
                    border: "1px solid #f0f0f0",
                    borderRadius: 6,
                    textAlign: "center",
                  }}
                >
                  <span>Có {tableData.length} dòng dữ liệu. </span>
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
        title="Chi tiết vật tư, thiết bị"
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

export default BuySuppliesModal;
