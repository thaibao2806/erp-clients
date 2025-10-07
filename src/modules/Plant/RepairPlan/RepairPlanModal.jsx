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
  notification,
  Select,
  Drawer,
} from "antd";
import { DeleteOutlined, PlusOutlined, TableOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import {
  addAssignmentSlip,
  updateAssignmentSlip,
} from "../../../services/apiPlan/apiAssignmentSlip";
import { getDocumentNumber } from "../../../services/apiAutoNumbering";
import { getAllUser } from "../../../services/apiAuth";
import { useSelector } from "react-redux";
import { addFollower } from "../../../services/apiFollower";
import {
  createRepairPlan,
  updateRepairPlans,
} from "../../../services/apiPlan/apiRepairPlan";
dayjs.extend(customParseFormat);

const approvalStatusOptions = [
  { value: "pending", label: "Chờ duyệt" },
  { value: "approved", label: "Đã duyệt" },
  { value: "rejected", label: "Từ chối" },
];

// Hook để theo dõi kích thước màn hình
const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: undefined,
    height: undefined,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowSize;
};

const statusOptions = [
  { value: "Chưa thực hiện", label: "Chưa thực hiện" },
  { value: "Đang thực hiện", label: "Đang thực hiện" },
  { value: "Hoàn thành", label: "Hoàn thành" },
  { value: "Tạm ngưng", label: "Tạm ngưng" },
];

const RepairPlanModal = ({ open, onCancel, onSubmit, initialValues }) => {
  const [form] = Form.useForm();
  const [monthYear, setMonthYear] = useState(dayjs());
  const [tableData, setTableData] = useState([]);
  const [approvalNumber, setApprovalNumber] = useState();
  const [approvers, setApprovers] = useState([]);
  const [dataUser, setDataUser] = useState([]);
  const [isEditApproval, setIsEditApproval] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tableDrawerVisible, setTableDrawerVisible] = useState(false);
  const user = useSelector((state) => state.auth.login?.currentUser);
  const { width } = useWindowSize();

  // Responsive breakpoints
  const isMobile = width <= 768;
  const isTablet = width > 768 && width <= 1024;
  const isDesktop = width > 1024;

  useEffect(() => {
    if (open) {
      if (!initialValues) {
        getVoucherNo();
      }

      form.setFieldsValue(initialValues || {});
      setIsEditApproval(!!initialValues?.type);
      setMonthYear(dayjs(initialValues?.voucherDate || dayjs()));
      if (initialValues?.details?.length) {
        const daysInMonth = dayjs(initialValues.voucherDate).daysInMonth();
        const columns = Array.from({ length: daysInMonth }, (_, i) => i + 1);

        const formattedDetails = initialValues.details.map((item, index) => ({
          key: `${Date.now()}_${index}`,
          stt: index + 1,
          content: item.content || "",
          unit: item.unit || "",
          quantity: item.quantity || "",
          beginTime: dayjs(item.beginTime) || dayjs(),
          endTime: dayjs(item.endTime) || dayjs(),
          department: item.department || "",
          status: item.status || "",
          note: item.note || "",
          ...columns.reduce((acc, day) => {
            acc[`d${day}`] = item[`d${day}`] || "";
            return acc;
          }, {}),
        }));

        setTableData(formattedDetails);
      } else {
        setTableData([]);
      }
      getUser();
    }
  }, [open, initialValues, form]);

  useEffect(() => {
    if (open && !initialValues && approvalNumber > 0) {
      setApprovers(Array(approvalNumber).fill({ userName: null }));
    }
  }, [approvalNumber, open, initialValues]);

  const getUser = async () => {
    try {
      let res = await getAllUser();
      if (res && res.status === 200) {
        const options = res.data.data.map((user) => ({
          id: user.apk,
          value: user.userName,
          label: user.fullName || user.userName,
        }));
        setDataUser(options);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getVoucherNo = async () => {
    try {
      let res = await getDocumentNumber("TDSC");
      if (res && res.status === 200) {
        form.setFieldsValue({ voucherNo: res.data.data.code });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleMonthChange = (date) => {
    setMonthYear(date);
    if (!date) return;

    const daysInMonth = date.daysInMonth();
    const columns = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  };

  const handleAddRow = () => {
    const daysInMonth = monthYear?.daysInMonth() || 0;
    const newKey = `${Date.now()}`;
    const columns = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const newRow = {
      key: newKey,
      stt: tableData.length + 1,
      ...columns.reduce((acc, day) => {
        acc[`d${day}`] = "";
        return acc;
      }, {}),
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

  const generateColumns = () => {
    const baseColumns = [
      {
        title: "",
        dataIndex: "action",
        width: isMobile ? 35 : 40,
        fixed: isMobile ? "left" : false,
        render: (_, record) => (
          <Tooltip title="Xóa dòng">
            <Button
              icon={<DeleteOutlined />}
              size={isMobile ? "small" : "small"}
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
        fixed: isMobile ? "left" : false,
      },
      {
        title: "Nội dung",
        dataIndex: "content",
        width: isMobile ? 150 : 200,
        render: (_, record) => (
          <Input
            value={record.content}
            size={isMobile ? "small" : "default"}
            onChange={(e) =>
              handleInputChange(record.key, "content", e.target.value)
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
            size={isMobile ? "small" : "default"}
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
            size={isMobile ? "small" : "default"}
            onChange={(e) =>
              handleInputChange(record.key, "quantity", e.target.value)
            }
          />
        ),
      },
      {
        title: "Thời gian bắt đầu",
        dataIndex: "beginTime",
        width: isMobile ? 120 : 150,
        render: (_, record) => (
          <DatePicker
            format="DD/MM/YYYY"
            value={record.beginTime ? dayjs(record.beginTime) : null}
            onChange={(date) =>
              handleInputChange(record.key, "beginTime", date)
            }
          />
        ),
      },
      {
        title: "Thời gian kết thúc",
        dataIndex: "endTime",
        width: isMobile ? 120 : 150,
        render: (_, record) => (
          <DatePicker
            format="DD/MM/YYYY"
            value={record.endTime ? dayjs(record.endTime) : null}
            onChange={(date) => handleInputChange(record.key, "endTime", date)}
          />
        ),
      },
      {
        title: "Bộ phận thực hiện",
        dataIndex: "department",
        width: isMobile ? 120 : 150,
        render: (_, record) => (
          <Input
            value={record.department}
            size={isMobile ? "small" : "default"}
            onChange={(e) =>
              handleInputChange(record.key, "department", e.target.value)
            }
          />
        ),
      },
      {
        title: "Trạng thái",
        dataIndex: "status",
        width: isMobile ? 120 : 150,
        render: (_, record) => (
          <Select
            value={record.status}
            onChange={(value) => handleInputChange(record.key, "status", value)}
            options={statusOptions}
            placeholder="Chọn trạng thái"
          />
        ),
      },
      {
        title: "Ghi chú",
        dataIndex: "note",
        width: isMobile ? 120 : 150,
        render: (_, record) => (
          <Input.TextArea
            value={record.note}
            size={isMobile ? "small" : "default"}
            onChange={(e) =>
              handleInputChange(record.key, "note", e.target.value)
            }
            rows={1}
          />
        ),
      },
    ];

    return baseColumns;
  };

  const handleOk = () => {
    if (!initialValues) {
      form.validateFields().then(async (values) => {
        try {
          setLoading(true);
          const payload = {
            ...values,
            documentDate: monthYear.toISOString(),
            note: values.note || "",
            details: tableData.map((item) => ({
              content: item.content || "",
              unit: item.unit || "",
              quantity: Number(item.quantity) || 0,
              beginTime: item.beginTime?.format("YYYY-MM-DD") || null,
              endTime: item.endTime?.format("YYYY-MM-DD") || null,
              department: item.department || "",
              status: item.status || "",
              note: item.note || "",
            })),
          };

          let res = await createRepairPlan(
            payload.voucherNo,
            payload.productName,
            payload.voucherDate,
            payload.managementUnit,
            payload.note,
            payload.details
          );
          if (res && res.status === 200) {
            const newFollowers = dataUser.find(
              (u) => u.value === user.data.userName
            );
            await addFollower(res.data.data, "RepairPlan", payload.voucherNo, [
              {
                userId: newFollowers.id,
                userName: newFollowers.value,
                fullName: user.data.fullName,
              },
            ]);
            onSubmit();
            form.resetFields();
            setMonthYear(dayjs());
            setTableData([]);
            notification.success({
              message: "Thành công",
              description: "Lưu phiếu thành công.",
              placement: isMobile ? "top" : "topRight",
            });
          }
        } catch (error) {
          if (error) {
            console.log(error);
            notification.error({
              message: "Thất bại",
              description: "Đã có lỗi xảy ra. Vui lòng thử lại",
              placement: isMobile ? "top" : "topRight",
            });
          }
        } finally {
          setLoading(false);
        }
      });
    } else {
      form.validateFields().then(async (values) => {
        try {
          setLoading(true);
          const payload = {
            ...values,
            documentDate: monthYear.toISOString(),
            note: values.note || "",
            details: tableData.map((item) => ({
              content: item.content || "",
              unit: item.unit || "",
              quantity: Number(item.quantity) || 0,
              beginTime: item.beginTime?.format("YYYY-MM-DD") || null,
              endTime: item.endTime?.format("YYYY-MM-DD") || null,
              department: item.department || "",
              status: item.status || "",
              note: item.note || "",
            })),
          };

          let res = await updateRepairPlans(
            initialValues.id,
            payload.voucherNo,
            payload.productName,
            payload.voucherDate,
            payload.managementUnit,
            payload.note,
            payload.details
          );
          if ((res && res.status === 200) || res.status === 204) {
            onSubmit();
            form.resetFields();
            setMonthYear(dayjs());
            setTableData([]);
            notification.success({
              message: "Thành công",
              description: "Lưu phiếu thành công.",
              placement: isMobile ? "top" : "topRight",
            });
          }
        } catch (error) {
          console.log(error);
          if (error) {
            notification.error({
              message: "Thất bại",
              description: "Đã có lỗi xảy ra. Vui lòng thử lại",
              placement: isMobile ? "top" : "topRight",
            });
          }
        } finally {
          setLoading(false);
        }
      });
    }
  };

  // Render Mobile Card View for table data
  const renderMobileCards = () => (
    <div style={{ marginTop: 16 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 12,
          alignItems: "center",
        }}
      >
        <h4 style={{ margin: 0, fontSize: 14 }}>
          Nội dung giao việc ({tableData.length})
        </h4>
        <Space size="small">
          <Button icon={<PlusOutlined />} size="small" onClick={handleAddRow}>
            Thêm
          </Button>
          <Button size="small" onClick={() => setTableData([])}>
            Hủy
          </Button>
        </Space>
      </div>

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
                  alignItems: "center",
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

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div>
                  <label style={{ fontSize: 11, color: "#666" }}>
                    Nội dung:
                  </label>
                  <Input
                    value={record.content}
                    size="small"
                    placeholder="Nhập nội dung"
                    onChange={(e) =>
                      handleInputChange(record.key, "content", e.target.value)
                    }
                  />
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: 11, color: "#666" }}>ĐVT:</label>
                    <Input
                      value={record.unit}
                      size="small"
                      placeholder="ĐVT"
                      onChange={(e) =>
                        handleInputChange(record.key, "unit", e.target.value)
                      }
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: 11, color: "#666" }}>
                      Số lượng:
                    </label>
                    <Input
                      value={record.quantity}
                      size="small"
                      placeholder="Số lượng"
                      onChange={(e) =>
                        handleInputChange(
                          record.key,
                          "quantity",
                          e.target.value
                        )
                      }
                    />
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: 11, color: "#666" }}>
                      Thời gian bắt đầu:
                    </label>
                    <Input
                      value={record.beginTime}
                      size="small"
                      placeholder="Thời gian bắt đầu"
                      onChange={(e) =>
                        handleInputChange(
                          record.key,
                          "beginTime",
                          e.target.value
                        )
                      }
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: 11, color: "#666" }}>
                      Thời gian kết thúc:
                    </label>
                    <Input
                      value={record.endTime}
                      size="small"
                      placeholder="Ghi chú"
                      onChange={(e) =>
                        handleInputChange(record.key, "endTime", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: 11, color: "#666" }}>
                      Bộ phận thực hiện:
                    </label>
                    <Input
                      value={record.department}
                      size="small"
                      placeholder="Bộ phận thực hiện"
                      onChange={(e) =>
                        handleInputChange(
                          record.key,
                          "department",
                          e.target.value
                        )
                      }
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: 11, color: "#666" }}>
                      Trạng thái:
                    </label>
                    <Input
                      value={record.status}
                      size="small"
                      placeholder="Trạng thái"
                      onChange={(e) =>
                        handleInputChange(record.key, "status", e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Determine modal width and layout
  const getModalWidth = () => {
    if (isMobile) return "95%";
    if (isTablet) return 800;
    return 1000;
  };

  const getColSpans = () => {
    if (isMobile) return { main: 24, half: 24 };
    if (isTablet) return { main: 24, half: 12 };
    return { main: 24, half: 12 };
  };

  const colSpans = getColSpans();

  return (
    <>
      <Modal
        title={
          <span
            style={{
              fontSize: isMobile ? 18 : 25,
              fontWeight: 600,
            }}
          >
            {initialValues ? "Cập nhật tiến độ" : "Thêm tiến độ sửa chữa"}
          </span>
        }
        open={open}
        onCancel={() => {
          form.resetFields();
          setMonthYear(dayjs());
          setTableData([]);
          setTableDrawerVisible(false);
          onCancel();
        }}
        onOk={handleOk}
        okText={initialValues ? "Cập nhật" : "Thêm"}
        width={getModalWidth()}
        confirmLoading={loading}
        style={isMobile ? { top: 20 } : {}}
        bodyStyle={isMobile ? { padding: "16px" } : {}}
      >
        <Form
          form={form}
          layout="vertical"
          size={isMobile ? "small" : "default"}
        >
          <Row gutter={isMobile ? [8, 8] : [16, 16]}>
            <Col span={colSpans.half}>
              <Form.Item
                name="voucherNo"
                label="Số chứng từ"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={colSpans.half}>
              <Form.Item
                name="productName"
                label="Tên sản phẩm"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={colSpans.half}>
              <Form.Item label="Ngày chứng từ" required>
                <DatePicker
                  picker="day"
                  style={{ width: "100%" }}
                  format="DD/MM/YYYY"
                  value={monthYear}
                  onChange={handleMonthChange}
                />
              </Form.Item>
            </Col>
            <Col span={colSpans.half}>
              <Form.Item
                name="managementUnit"
                label="Đơn bị quản lý sử dụng"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={colSpans.half}>
              <Form.Item name="note" label="Ghi chú">
                <Input.TextArea rows={1} />
              </Form.Item>
            </Col>
          </Row>

          {/* Table Section */}
          {isMobile ? (
            renderMobileCards()
          ) : (
            <>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 8,
                  alignItems: "center",
                }}
              >
                <h4 style={{ margin: 0 }}>Nội dung giao việc</h4>
                {isTablet && (
                  <Button
                    icon={<TableOutlined />}
                    onClick={() => setTableDrawerVisible(true)}
                  >
                    Xem bảng
                  </Button>
                )}
                {!isTablet && (
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
                  <Button
                    type="link"
                    onClick={() => setTableDrawerVisible(true)}
                  >
                    Nhấn để xem chi tiết
                  </Button>
                </div>
              )}
            </>
          )}
        </Form>
      </Modal>

      {/* Table Drawer for Tablet */}
      <Drawer
        title="Nội dung giao việc"
        width="90%"
        onClose={() => setTableDrawerVisible(false)}
        open={tableDrawerVisible}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
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

export default RepairPlanModal;
