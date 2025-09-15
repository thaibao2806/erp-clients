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
import { DeleteOutlined, PlusOutlined,TableOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { createPlan, updatePlans } from "../../../services/apiPlan/apiPlan";
import { getDocumentNumber } from "../../../services/apiAutoNumbering";
import { getAllUser } from "../../../services/apiAuth";
import { getApprovalSetting } from "../../../services/apiApproveSetting";
import {
  createApprovals,
  getApprovalsByRef,
  updateStatusApprovals,
} from "../../../services/apiApprovals";
import { useSelector } from "react-redux";
import { addFollower } from "../../../services/apiFollower";
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

const PlantsModal = ({ open, onCancel, onSubmit, initialValues }) => {
  const [form] = Form.useForm();
  const [monthYear, setMonthYear] = useState(dayjs());
  const [tableData, setTableData] = useState([]);
  const [approvalNumber, setApprovalNumber] = useState();
  const [approvers, setApprovers] = useState([]);
  const [dataUser, setDataUser] = useState([]);
  const [isEditApproval, setIsEditApproval] = useState(false);
  const [loading, setLoading] = useState(false);
  const user = useSelector((state) => state.auth.login?.currentUser);
  const [tableDrawerVisible, setTableDrawerVisible] = useState(false);

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
          vehicleName: item.vehicleName || "",
          content: item.content || "",
          expectedTime: item.expectedTime || "",
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
      if (initialValues) {
        getApprovals(initialValues.id);
      }
      getUser();
    }
  }, [open, initialValues, form]);

  useEffect(() => {
    if (open && !initialValues && approvalNumber > 0) {
      setApprovers(Array(approvalNumber).fill({ user: null }));
    }
  }, [approvalNumber, open, initialValues]);

  const getApprovals = async (refId) => {
    try {
      let res = await getApprovalsByRef(refId, "KH");
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
      let res = await getApprovalSetting("PL", "pl-ke-hoach");
      if (res && res.status === 200) {
        setApprovalNumber(res.data.data.approvalNumber);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getVoucherNo = async () => {
    try {
      let res = await getDocumentNumber("KH");
      if (res && res.status === 200) {
        form.setFieldsValue({ documentNumber: res.data.data.code });
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
      hoTen: "",
      chucVu: "",
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
        title: "Tên phương tiện",
        dataIndex: "vehicleName",
        width: isMobile ? 150 : 200,
        render: (_, record) => (
          <Input
            value={record.vehicleName}
            size={isMobile ? "small" : "default"}
            onChange={(e) =>
              handleInputChange(record.key, "vehicleName", e.target.value)
            }
          />
        ),
      },
      {
        title: "Nội dung",
        dataIndex: "content",
        width: isMobile ? 150 : 200,
        render: (_, record) => (
          <Input
            value={record.content}
            onChange={(e) =>
              handleInputChange(record.key, "content", e.target.value)
            }
          />
        ),
      },
      {
        title: "Thời gian dự kiến",
        dataIndex: "expectedTime",
        width: isMobile ? 80 : 100,
        render: (_, record) => (
          <DatePicker
            value={record.expectedTime ? dayjs(record.expectedTime) : null}
            format="DD/MM/YYYY"
            size={isMobile ? "small" : "default"}
            onChange={(date) =>
              handleInputChange(
                record.key,
                "expectedTime",
                date ? date.toISOString() : null
              )
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
        "KH",
        formattedApprovers,
        documentNumber,
        `/pl/ke-hoach/ke-hoach-chi-tiet/${refId}?type=KH`
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
            documentDate: monthYear.toISOString(), // ISO định dạng
            note: values.note || "",
            details: tableData.map((item) => ({
              vehicleName: item.vehicleName || "",
              content: item.content || "",
              expectedTime: item.expectedTime,
              note: item.note || "",
            })),
          };

          let res = await createPlan(
            payload.department,
            payload.documentNumber,
            payload.planContent,
            payload.documentDate,
            "",
            payload.note,
            payload.details
          );
          if (res && res.status === 200) {
            onSubmit(); // callback từ cha để reload
            await handleAddApprovals(res.data.data, payload.documentNumber);
            const newFollowers = dataUser.find(u => u.value === user.data.userName);
            await addFollower(
              res.data.data,
              "Plan",
               payload.documentNumber,
               [
                {
                  userId: newFollowers.id,      // bạn đã đặt id = user.apk trong getUser
                  userName: newFollowers.value, // chính là userName
                  fullName: user.data.fullName,
                }
              ]
            )
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
            alert(error);
            notification.error({
              message: "Thất bại",
              description: "Đã có lỗi xảy ra. Vui lòng thử lại",
              placement: isMobile ? "top" : "topRight",
            });
          }
        } finally{
          setLoading(false);
        }
      });
    } else {
      form.validateFields().then(async (values) => {
        try {
          setLoading(true);
          const payload = {
            ...values,
            documentDate: monthYear.toISOString(), // ISO định dạng
            note: values.note || "",
            details: tableData.map((item) => ({
              vehicleName: item.vehicleName || "",
              content: item.content || "",
              expectedTime: item.expectedTime,
              note: item.note || "",
            })),
          };

          let res = await updatePlans(
            initialValues.id,
            payload.department,
            payload.documentNumber,
            payload.planContent,
            payload.documentDate,
            "",
            payload.note,
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
        } finally{
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
          alignItems: "center"
        }}
      >
        <h4 style={{ margin: 0, fontSize: 14 }}>Nội dung giao việc ({tableData.length})</h4>
        <Space size="small">
          <Button 
            icon={<PlusOutlined />} 
            size="small"
            onClick={handleAddRow}
          >
            Thêm
          </Button>
          <Button 
            size="small"
            onClick={() => setTableData([])}
          >
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
            color: "#999"
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
                background: "#fafafa"
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 8
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
                  <label style={{ fontSize: 11, color: "#666" }}>Tên phương tiện:</label>
                  <Input
                    value={record.vehicleName}
                    size="small"
                    placeholder="Nhập nội dung"
                    onChange={(e) =>
                      handleInputChange(record.key, "vehicleName", e.target.value)
                    }
                  />
                </div>
                
                <div style={{ display: "flex", gap: 8 }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: 11, color: "#666" }}>Nội dung:</label>
                    <Input
                      value={record.content}
                      size="small"
                      placeholder="Nội dung"
                      onChange={(e) =>
                        handleInputChange(record.key, "content", e.target.value)
                      }
                    />
                  </div>
                  
                </div>
                <div style={{ flex: 1,gap: 8 }}>
                    <label style={{ fontSize: 11, color: "#666" }}>Thời gian dự kiến:</label>
                    <DatePicker
                      value={record.expectedTime ? dayjs(record.expectedTime) : null}
                      format="DD/MM/YYYY"
                      size="small"
                      onChange={(date) =>
                        handleInputChange(
                          record.key,
                          "expectedTime",
                          date ? date.toISOString() : null
                        )
                      }
                    />
                  </div>
                
                <div style={{ display: "flex", gap: 8 }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: 11, color: "#666" }}>Ghi chú:</label>
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
        <span style={{ 
            fontSize: isMobile ? 18 : 25, 
            fontWeight: 600 
          }}>
          {initialValues ? "Cập nhật kế hoạch" : "Thêm kế hoạch"}
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
      width={getModalWidth()}
      okText={initialValues ? "Cập nhật" : "Thêm"}
      confirmLoading={loading}
      style={isMobile ? { top: 20 } : {}}
        bodyStyle={isMobile ? { padding: "16px" } : {}}
    >
      <Form form={form} 
          layout="vertical"
          size={isMobile ? "small" : "default"}>
        <Row gutter={isMobile ? [8, 8] : [16, 16]}>
          <Col span={colSpans.half}>
            <Form.Item
              name="department"
              label="Đơn vị"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={colSpans.half}>
            <Form.Item
              name="documentNumber"
              label="Số chứng từ"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={colSpans.half}>
            <Form.Item
              name="planContent"
              label="Kế hoạch về việc"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={colSpans.half}>
            <Form.Item label="Ngày chứng từ" required>
              <DatePicker
                picker="month"
                style={{ width: "100%" }}
                format="DD/MM/YYYY"
                value={monthYear}
                onChange={handleMonthChange}
              />
            </Form.Item>
          </Col>
          {/* <Col span={12}>
            <Form.Item
              name="receiver"
              label="Nơi nhận"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
          </Col> */}
          <Col span={colSpans.half}>
            <Form.Item name="note" label="Ghi chú">
              <Input.TextArea rows={1} />
            </Form.Item>
          </Col>
          {approvalNumber > 0 && (
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
                            disabled={!isEditApproval || item.username !== user.data.userName}
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
                              disabled={!isEditApproval || item.username !== user.data.userName}
                            />
                          </Form.Item>
                        </Col>
                      )}
                    </>
                  )}
                </React.Fragment>
              ))}
            </>
          )}
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
              alignItems: "center"
            }}
          >
            <h4>Nội dung kế hoạch</h4>
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
                    textAlign: "center"
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
        title="Nội dung kế hoạch"
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

export default PlantsModal;
