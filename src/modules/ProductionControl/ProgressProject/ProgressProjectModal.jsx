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
  notification,
} from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import {
  createApprovals,
  getApprovalsByRef,
  updateStatusApprovals,
} from "../../../services/apiApprovals";
import { getAllUser } from "../../../services/apiAuth";
import { getApprovalSetting } from "../../../services/apiApproveSetting";
import { getDocumentNumber } from "../../../services/apiAutoNumbering";
import {
  createProjectProgress,
  updateProjectProgress,
} from "../../../services/apiPlan/apiProgressProject";
dayjs.extend(customParseFormat);

const statusOptions = [
  { label: "Chưa thực hiện", value: "notStarted" },
  { label: "Đang thực hiện", value: "inprogress" },
  { label: "Tạm dừng", value: "paused" },
  { label: "Hoàn thành", value: "completed" },
];

const typeOptions = [
  { label: "Phục vụ khảo sát", value: "pvsk" },
  { label: "Phục vụ sửa chữa", value: "pvsc" },
];

const ProgressProjectModal = ({ open, onCancel, onSubmit, initialValues }) => {
  const [form] = Form.useForm();
  const [monthYear, setMonthYear] = useState(dayjs());
  const [tableData, setTableData] = useState([]);
  const [approvalNumber, setApprovalNumber] = useState();
  const [approvers, setApprovers] = useState([]);
  const [dataUser, setDataUser] = useState([]);
  const [isEditApproval, setIsEditApproval] = useState(false);

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
          name: item.name || "",
          beginDate: item.beginDate || "",
          endDate: item.endDate || "",
          status: item.status || "",
          taskProgressType: item.taskProgressType || "",
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
      let res = await getApprovalsByRef(refId, "TDSC");
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
      let res = await getApprovalSetting("PM", "pm-tien-do");
      if (res && res.status === 200) {
        setApprovalNumber(res.data.data.approvalNumber);
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
        width: 40,
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
        width: 50,
      },
      {
        title: "Nội dung",
        dataIndex: "name",
        render: (_, record) => (
          <Input
            value={record.name}
            onChange={(e) =>
              handleInputChange(record.key, "name", e.target.value)
            }
          />
        ),
      },
      {
        title: "Ngày bắt đầu",
        dataIndex: "beginDate",
        render: (_, record) => (
          <DatePicker
            style={{ width: "100%" }}
            value={record.beginDate ? dayjs(record.beginDate) : null}
            format="DD/MM/YYYY"
            onChange={(date) =>
              handleInputChange(
                record.key,
                "beginDate",
                date ? date.toISOString() : ""
              )
            }
          />
        ),
      },
      {
        title: "Ngày kết thúc",
        dataIndex: "endDate",
        render: (_, record) => (
          <DatePicker
            style={{ width: "100%" }}
            value={record.endDate ? dayjs(record.endDate) : null}
            format="DD/MM/YYYY"
            onChange={(date) =>
              handleInputChange(
                record.key,
                "endDate",
                date ? date.toISOString() : ""
              )
            }
          />
        ),
      },
      {
        title: "Trạng thái",
        dataIndex: "status",
        render: (_, record) => (
          <Select
            value={record.status}
            onChange={(value) => handleInputChange(record.key, "status", value)}
            style={{ width: "100%" }}
            allowClear
          >
            {statusOptions.map((option) => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        ),
      },
      {
        title: "Loại công việc",
        dataIndex: "taskProgressType",
        render: (_, record) => (
          <Select
            value={record.taskProgressType}
            onChange={(value) =>
              handleInputChange(record.key, "taskProgressType", value)
            }
            style={{ width: "100%" }}
            allowClear
          >
            {typeOptions.map((option) => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        ),
      },
      {
        title: "Ghi chú",
        dataIndex: "note",
        render: (_, record) => (
          <Input
            value={record.note}
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
        "TDSC",
        formattedApprovers,
        documentNumber,
        `/pm/tien-do-du-an-chi-tiet/${refId}?type=SK`
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
          const payload = {
            ...values,
            voucherDate: monthYear.toISOString(), // ISO định dạng
            details: tableData.map((item) => ({
              name: item.name || "",
              beginDate: item.beginDate || "",
              endDate: item.endDate || "",
              status: item.status || "",
              taskProgressType: item.taskProgressType || "",
              note: item.note || "",
            })),
          };

          let res = await createProjectProgress(
            payload.taskName,
            payload.voucherNo,
            payload.voucherDate,
            payload.department,
            payload.status,
            payload.note,
            payload.details
          );
          if (res && res.status === 200) {
            await handleAddApprovals(res.data.data, payload.voucherNo);
            onSubmit(); // callback từ cha để reload
            form.resetFields();
            setMonthYear(dayjs());
            setTableData([]);
            notification.success({
              message: "Thành công",
              description: "Lưu phiếu thành công.",
              placement: "topRight",
            });
          }
        } catch (error) {
          if (error) {
            console.log(error);
            notification.error({
              message: "Thất bại",
              description: "Đã có lỗi xảy ra. Vui lòng thử lại",
              placement: "topRight",
            });
          }
        }
      });
    } else {
      form.validateFields().then(async (values) => {
        try {
          const payload = {
            ...values,
            voucherDate: monthYear.toISOString(), // ISO định dạng
            details: tableData.map((item) => ({
              name: item.name || "",
              beginDate: item.beginDate || "",
              endDate: item.endDate || "",
              status: item.status || "",
              taskProgressType: item.taskProgressType || "",
              note: item.note || "",
            })),
          };

          let res = await updateProjectProgress(
            initialValues.id,
            payload.taskName,
            payload.voucherNo,
            payload.voucherDate,
            payload.department,
            payload.status,
            payload.note,
            payload.details
          );
          if ((res && res.status === 200) || res.status === 204) {
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
              placement: "topRight",
            });
          }
        } catch (error) {
          if (error) {
            console.log(error);
            notification.error({
              message: "Thất bại",
              description: "Đã có lỗi xảy ra. Vui lòng thử lại",
              placement: "topRight",
            });
          }
        }
      });
    }
  };

  return (
    <Modal
      title={
        <span style={{ fontSize: 25, fontWeight: 600 }}>
          {initialValues ? "Cập nhật tiến độ" : "Thêm tiến độ"}
        </span>
      }
      open={open}
      onCancel={() => {
        form.resetFields();
        setMonthYear(dayjs());
        setTableData([]);
        onCancel();
      }}
      onOk={handleOk}
      okText={initialValues ? "Cập nhật" : "Thêm"}
      width={1000}
    >
      <Form form={form} layout="vertical">
        <Row gutter={16}>
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
            <Form.Item
              name="taskName"
              label="Sản phẩm"
              rules={[{ required: false }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
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
          <Col span={12}>
            <Form.Item
              name="department"
              label="Tổ thực hiện"
              rules={[{ required: false }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="status"
              label="Trạng thái"
              rules={[{ required: false }]}
            >
              <Select allowClear placeholder="Chọn trạng thái">
                {statusOptions.map((option) => (
                  <Select.Option key={option.value} value={option.value}>
                    {option.label}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="note"
              label="Ghi chú"
              rules={[{ required: false }]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <h4>Bảng tiến độ</h4>
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
            scroll={{ x: "max-content" }}
            bordered
            size="small"
          />
        </>
      </Form>
    </Modal>
  );
};

export default ProgressProjectModal;
