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
} from "../../../../services/apiPlan/apiAssignmentSlip";
import { getDocumentNumber } from "../../../../services/apiAutoNumbering";
import { getApprovalSetting } from "../../../../services/apiApproveSetting";
import { getAllUser } from "../../../../services/apiAuth";
import {
  createApprovals,
  getApprovalsByRef,
  updateStatusApprovals,
} from "../../../../services/apiApprovals";
import {
  createJobRequirements,
  updateJobRequirements,
} from "../../../../services/apiTechnicalMaterial/apiJobRequirement";
import { useSelector } from "react-redux";
import { addFollower } from "../../../../services/apiFollower";
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

const ExportWareHouseModal = ({ open, onCancel, onSubmit, initialValues }) => {
  const [form] = Form.useForm();
  const [monthYear, setMonthYear] = useState(dayjs());
  const [tableData, setTableData] = useState([]);
  const [approvalNumber, setApprovalNumber] = useState();
  const [approvers, setApprovers] = useState([]);
  const [tableDrawerVisible, setTableDrawerVisible] = useState(false);
  const [dataUser, setDataUser] = useState([]);
  const [isEditApproval, setIsEditApproval] = useState(false);
  const [loading, setLoading] = useState(false);
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
      setMonthYear(dayjs(initialValues?.documentDate || dayjs()));
      if (initialValues?.details?.length) {
        const daysInMonth = dayjs(initialValues.documentDate).daysInMonth();
        const columns = Array.from({ length: daysInMonth }, (_, i) => i + 1);

        const formattedDetails = initialValues.details.map((item, index) => ({
          key: `${Date.now()}_${index}`,
          stt: index + 1,
          content: item.content || "",
          unit: item.unit || "",
          quantity: item.quantity || "",
          workDay: item.workDay || "",
          note: item.note || "",
          ...columns.reduce((acc, day) => {
            acc[`d${day}`] = item[`d${day}`] || ""; // Nếu dữ liệu có d1, d2,...
            return acc;
          }, {}),
        }));

        setTableData(formattedDetails);
      } else {
        setTableData([]);
      }
      getApprovalByModulePage();
      getUser();
      if (initialValues) {
        getApprovals(initialValues.id);
      }
    }
  }, [open, initialValues, form]);

  useEffect(() => {
    if (open && !initialValues && approvalNumber > 0) {
      setApprovers(Array(approvalNumber).fill({ userName: null }));
    }
  }, [approvalNumber, open, initialValues]);

  const getApprovals = async (refId) => {
    try {
      let res = await getApprovalsByRef(refId, "YCCV");
      if (res && res.status === 200) {
        const list = res.data.data.map((ap) => ({
          id: ap.id,
          username: ap.userName, // phải trùng key với name trong Form
          status: ap.status,
          note: ap.note,
        }));
        setApprovers(list);
        form.setFieldsValue({ approvers: list });
      }
    } catch (error) {}
  };

  const getUser = async () => {
    try {
      let res = await getAllUser();
      if (res && res.status === 200) {
        const options = res.data.data.map((user) => ({
          id: user.apk,
          value: user.userName, // hoặc user.id nếu cần
          label: user.fullName || user.userName,
        }));
        setDataUser(options);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getApprovalByModulePage = async () => {
    try {
      let res = await getApprovalSetting("TM", "tm-yeu-cau-cong-viec");
      if (res && res.status === 200) {
        setApprovalNumber(res.data.data.approvalNumber);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getVoucherNo = async () => {
    try {
      let res = await getDocumentNumber("YCCV");
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
        title: "Mã vật tư",
        width: isMobile ? 150 : 200,
        dataIndex: "materialCode",
        render: (_, record) => (
          <Input
            value={record.materialCode}
            size={isMobile ? "small" : "default"}
            onChange={(e) =>
              handleInputChange(record.key, "materialCode", e.target.value)
            }
          />
        ),
      },
      {
        title: "Tên vật tư",
        width: isMobile ? 150 : 200,
        dataIndex: "materialName",
        render: (_, record) => (
          <Input
            value={record.materialName}
            size={isMobile ? "small" : "default"}
            onChange={(e) =>
              handleInputChange(record.key, "materialName", e.target.value)
            }
          />
        ),
      },
      {
        title: "ĐVT",
        width: isMobile ? 80 : 100,
        dataIndex: "unit",
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
        width: isMobile ? 80 : 100,
        dataIndex: "quantity",
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
        title: "Đơn giá",
        width: isMobile ? 80 : 100,
        dataIndex: "unitPrice",
        render: (_, record) => (
          <Input
            value={record.unitPrice}
            size={isMobile ? "small" : "default"}
            onChange={(e) =>
              handleInputChange(record.key, "unitPrice", e.target.value)
            }
          />
        ),
      },
      {
        title: "Thành tiền",
        width: isMobile ? 80 : 100,
        dataIndex: "totalPrice",
        render: (_, record) => (
          <Input
            value={record.totalPrice}
            size={isMobile ? "small" : "default"}
            onChange={(e) =>
              handleInputChange(record.key, "totalPrice", e.target.value)
            }
          />
        ),
      },
      {
        title: "Ghi chú",
        width: isMobile ? 120 : 150,
        dataIndex: "note",
        render: (_, record) => (
          <Input
            value={record.note}
            size={isMobile ? "small" : "default"}
            onChange={(e) =>
              handleInputChange(record.key, "note", e.target.value)
            }
          />
        ),
      },
    ];

    return baseColumns;
  };

  const handleAddApprovals = async (refId, documentNumber) => {
    try {
      const approversData = form.getFieldValue("approvers") || [];

      const formattedApprovers = approversData.map((item, index) => {
        const user = dataUser.find((u) => u.value === item.username);
        return {
          userName: item.username,
          fullName: user?.label || "", // hoặc tìm từ danh sách user để lấy fullName
          level: index + 1,
        };
      });

      const res = await createApprovals(
        refId,
        "YCCV",
        formattedApprovers,
        documentNumber,
        `/tm/vat-tu/phieu-xuat-chi-tiet/${refId}?type=PGV`
      );
      if (res && res.status === 200) {
        console.log("Tạo danh sách duyệt thành công");
      }
    } catch (error) {
      console.error("Lỗi khi tạo duyệt:", error);
    }
  };

  const handleUpdateApprovals = async () => {
    try {
      const approversData = form.getFieldValue("approvers") || [];
      const updatePromises = approversData.map((item) => {
        if (item.id) {
          return updateStatusApprovals(item.id, item.status, item.note);
        }
        return null;
      });

      // Lọc null (nếu có), chờ tất cả promise hoàn thành
      const responses = await Promise.all(updatePromises.filter(Boolean));
    } catch (error) {
      console.error("Lỗi cập nhật phê duyệt:", error);
      notification.error({
        message: "Cập nhật thất bại",
        description: "Có lỗi xảy ra khi cập nhật trạng thái duyệt.",
      });
    }
  };

  const handleOk = () => {
    if (!initialValues) {
      form.validateFields().then(async (values) => {
        try {
          setLoading(true);
          const payload = {
            ...values,
            voucherDate: monthYear.toISOString(), // ISO định dạng
            details: tableData.map((item) => ({
              content: item.content || "",
              unit: item.unit || "",
              quantity: Number(item.quantity) || 0,
              workDay: Number(item.workDay) || 0,
              note: item.note || "",
            })),
          };

          let res = await createJobRequirements(
            payload.voucherNo,
            payload.voucherDate,
            payload.productName,
            payload.repairOrderCode,
            payload.department,
            payload.managementUnit,
            payload.details
          );
          if (res && res.status === 200) {
            await handleAddApprovals(res.data.data, payload.voucherNo);
            const newFollowers = dataUser.find(
              (u) => u.value === user.data.userName
            );
            await addFollower(
              res.data.data,
              "JobRequirement",
              payload.voucherNo,
              [
                {
                  userId: newFollowers.id, // bạn đã đặt id = user.apk trong getUser
                  userName: newFollowers.value, // chính là userName
                  fullName: user.data.fullName,
                },
              ]
            );
            onSubmit(); // callback từ cha để reload
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
            voucherDate: monthYear.toISOString(), // ISO định dạng
            details: tableData.map((item) => ({
              content: item.content || "",
              unit: item.unit || "",
              quantity: Number(item.quantity) || 0,
              workDay: Number(item.workDay) || 0,
              note: item.note || "",
            })),
          };

          let res = await updateJobRequirements(
            initialValues.id,
            payload.voucherNo,
            payload.voucherDate,
            payload.productName,
            payload.repairOrderCode,
            payload.department,
            payload.managementUnit,
            payload.details
          );
          if (res && res.status === 200) {
            if (isEditApproval) {
              await handleUpdateApprovals();
            }
            onSubmit(); // callback từ cha để reload
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
          Nội dung phiếu xuất ({tableData.length})
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
                    Mã vật tư:
                  </label>
                  <Input
                    value={record.materialCode}
                    size="small"
                    placeholder="Mã vật tư"
                    onChange={(e) =>
                      handleInputChange(
                        record.key,
                        "materialCode",
                        e.target.value
                      )
                    }
                  />
                </div>

                <div>
                  <label style={{ fontSize: 11, color: "#666" }}>
                    Tên vật tư:
                  </label>
                  <Input
                    value={record.materialName}
                    size="small"
                    placeholder="Tên vật tư"
                    onChange={(e) =>
                      handleInputChange(
                        record.key,
                        "materialName",
                        e.target.value
                      )
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
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: 11, color: "#666" }}>
                      Đơn giá:
                    </label>
                    <Input
                      value={record.unitPrice}
                      size="small"
                      placeholder="Đơn giá"
                      onChange={(e) =>
                        handleInputChange(
                          record.key,
                          "unitPrice",
                          e.target.value
                        )
                      }
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: 11, color: "#666" }}>
                      Thành tiền:
                    </label>
                    <Input
                      value={record.totalPrice}
                      size="small"
                      placeholder="Thanh tiền"
                      onChange={(e) =>
                        handleInputChange(
                          record.key,
                          "totalPrice",
                          e.target.value
                        )
                      }
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: 11, color: "#666" }}>
                      Ghi chú:
                    </label>
                    <Input
                      value={record.note}
                      size="small"
                      placeholder="Ghi chú"
                      onChange={(e) =>
                        handleInputChange(record.key, "note", e.target.value)
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
          <span style={{ fontSize: isMobile ? 18 : 25, fontWeight: 600 }}>
            {initialValues ? "Cập nhật phiếu xuất kho" : "Thêm phiếu xuất kho"}
          </span>
        }
        open={open}
        onCancel={() => {
          form.resetFields();
          setMonthYear(dayjs());
          setTableData([]);
          onCancel();
          setTableDrawerVisible(false);
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
                name="objectName"
                label="Đối tượng"
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
                name="wareHouseName"
                label="Kho xuất"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={colSpans.half}>
              <Form.Item
                name="goodTypeName"
                label="Loại hàng"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={colSpans.half}>
              <Form.Item name="deliveryAddress" label="Địa chỉ giao hàng">
                <Input />
              </Form.Item>
            </Col>
            <Col span={colSpans.half}>
              <Form.Item name="note" label="Ghi chú">
                <Input />
              </Form.Item>
            </Col>
            {/* {approvalNumber > 0 && (
              <>
                {approvers.map((item, idx) => (
                  <React.Fragment key={idx}>
                    <Col span={colSpans.half}>
                      <Form.Item
                        label={`Người duyệt cấp ${idx + 1}`}
                        name={["approvers", idx, "username"]}
                        rules={[
                          {
                            required: true,
                            message: "Vui lòng chọn người duyệt",
                          },
                        ]}
                      >
                        <Select
                          options={dataUser}
                          placeholder="Chọn người duyệt"
                          showSearch
                          optionFilterProp="label"
                          disabled={!!initialValues}
                        />
                      </Form.Item>
                    </Col>
                    {initialValues && (
                      <>
                        <Col span={colSpans.half}>
                          <Form.Item
                            label={`Trạng thái duyệt ${idx + 1}`}
                            name={["approvers", idx, "status"]}
                            rules={[
                              {
                                required: true,
                                message: "Vui lòng chọn trạng thái duyệt",
                              },
                            ]}
                          >
                            <Select
                              options={approvalStatusOptions}
                              placeholder="Chọn trạng thái"
                              disabled={
                                !isEditApproval ||
                                item.username !== user.data.userName
                              }
                            />
                          </Form.Item>
                        </Col>
                        {isEditApproval && (
                          <Col span={colSpans.half}>
                            <Form.Item
                              label={`Ghi chú duyệt ${idx + 1}`}
                              name={["approvers", idx, "note"]}
                            >
                              <Input.TextArea
                                rows={1}
                                placeholder="Ghi chú duyệt"
                                disabled={
                                  !isEditApproval ||
                                  item.username !== user.data.userName
                                }
                              />
                            </Form.Item>
                          </Col>
                        )}
                      </>
                    )}
                  </React.Fragment>
                ))}
              </>
            )} */}
          </Row>

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
                <h4 style={{ margin: 0 }}>Nội dung phiếu xuất</h4>
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
                  scroll={{ x: "max-content" }}
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
      <Drawer
        title="Nội dung phiếu xuất"
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

export default ExportWareHouseModal;
