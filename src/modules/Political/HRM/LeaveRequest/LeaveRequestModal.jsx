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
  InputNumber,
} from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { getDocumentNumber } from "../../../../services/apiAutoNumbering";
import { getApprovalSetting } from "../../../../services/apiApproveSetting";
import { getAllUser } from "../../../../services/apiAuth";
import {
  createApprovals,
  getApprovalsByRef,
  updateStatusApprovals,
} from "../../../../services/apiApprovals";
dayjs.extend(customParseFormat);

const approvalStatusOptions = [
  { value: "pending", label: "Chờ duyệt" },
  { value: "approved", label: "Đã duyệt" },
  { value: "rejected", label: "Từ chối" },
];

const calculateWorkingHours = (start, end) => {
  let totalMinutes = 0;
  let current = dayjs(start);

  while (current.isBefore(end)) {
    const date = current.format("YYYY-MM-DD");

    const morningStart = dayjs(`${date} 07:00`);
    const morningEnd = dayjs(`${date} 11:00`);
    const afternoonStart = dayjs(`${date} 13:00`);
    const afternoonEnd = dayjs(`${date} 17:00`);

    // Tính thời gian làm việc buổi sáng
    const msMorning = Math.min(
      Math.max(0, Math.min(morningEnd, end) - Math.max(morningStart, current)),
      4 * 60 * 60 * 1000
    );

    // Tính thời gian làm việc buổi chiều
    const msAfternoon = Math.min(
      Math.max(
        0,
        Math.min(afternoonEnd, end) - Math.max(afternoonStart, current)
      ),
      4 * 60 * 60 * 1000
    );

    totalMinutes += (msMorning + msAfternoon) / 60000;

    // chuyển sang ngày tiếp theo
    current = current.add(1, "day").startOf("day");
  }

  return totalMinutes / 60; // trả về tổng số giờ
};

const LeaveRequestModal = ({ open, onCancel, onSubmit, initialValues }) => {
  const [form] = Form.useForm();
  const [monthYear, setMonthYear] = useState(dayjs());
  const [tableData, setTableData] = useState([]);
  const [approvalNumber, setApprovalNumber] = useState();
  const [approvers, setApprovers] = useState([]);
  const [dataUser, setDataUser] = useState([]);
  const [isEditApproval, setIsEditApproval] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [totalDays, setTotalDays] = useState(0);

  useEffect(() => {
    if (startDate && endDate && dayjs(endDate).isAfter(startDate)) {
      const workingHours = calculateWorkingHours(startDate, endDate);
      const total = workingHours / 8;
      const totalFormatted = Number(total.toFixed(2));
      setTotalDays(totalFormatted);
      form.setFieldsValue({ totalLeaveDays: totalFormatted });
    } else {
      setTotalDays(0);
      form.setFieldsValue({ totalLeaveDays: 0 });
    }
  }, [startDate, endDate, form]);

  useEffect(() => {
    if (open) {
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
      let res = await getApprovalsByRef(refId, "DXNP");
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
      let res = await getApprovalSetting("PT", "pt-nghi-phep");
      if (res && res.status === 200) {
        setApprovalNumber(res.data.data.approvalNumber);
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
        dataIndex: "content",
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
        title: "ĐVT",
        dataIndex: "unit",
        render: (_, record) => (
          <Input
            value={record.unit}
            onChange={(e) =>
              handleInputChange(record.key, "unit", e.target.value)
            }
          />
        ),
      },
      {
        title: "Số lượng",
        dataIndex: "quantity",
        render: (_, record) => (
          <Input
            value={record.quantity}
            onChange={(e) =>
              handleInputChange(record.key, "quantity", e.target.value)
            }
          />
        ),
      },
      {
        title: "T/G hoàn thành",
        dataIndex: "workDay",
        render: (_, record) => (
          <Input
            value={record.workDay}
            onChange={(e) =>
              handleInputChange(record.key, "workDay", e.target.value)
            }
          />
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
        "YCCV",
        formattedApprovers,
        documentNumber,
        `/tm/yeu-cau-cong-viec-chi-tiet/${refId}?type=PGV`
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
            await handleAddApprovals(res.data.data, payload.documentNumber);
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
              placement: "topRight",
            });
          }
        } catch (error) {
          if (error) {
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
          {initialValues
            ? "Cập nhật đơn xin nghỉ phép"
            : "Thêm đơn xin nghỉ phép"}
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
          {/* <Col span={12}>
            <Form.Item name="unit" label="Đơn vị" rules={[{ required: true }]}> 
              <Input />
            </Form.Item>
          </Col> */}
          <Col span={12}>
            <Form.Item
              name="voucherNo"
              label="Họ và tên"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="productName"
              label="Phòng ban"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="productName"
              label="Chức vụ"
              rules={[{ required: false }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="productName"
              label="Loại phép"
              rules={[{ required: false }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="startLeaveDate"
              label="Ngày bắt đầu nghỉ"
              rules={[
                { required: true, message: "Vui lòng chọn ngày bắt đầu" },
              ]}
            >
              <DatePicker
                showTime
                style={{ width: "100%" }}
                format="DD/MM/YYYY HH:mm"
                onChange={(value) => setStartDate(value)}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="endLeaveDate"
              label="Ngày kết thúc nghỉ"
              rules={[
                { required: true, message: "Vui lòng chọn ngày kết thúc" },
              ]}
            >
              <DatePicker
                showTime
                style={{ width: "100%" }}
                format="DD/MM/YYYY HH:mm"
                onChange={(value) => setEndDate(value)}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item name="totalLeaveDays" label="Tổng số ngày nghỉ">
              <InputNumber
                style={{ width: "100%" }}
                value={totalDays}
                readOnly
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="productName"
              label="Lý do nghỉ"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="managementUnit"
              label="Số điện thoại/email liên hệ"
              rules={[{ required: false }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="managementUnit"
              label="Nơi nghỉ"
              rules={[{ required: false }]}
            >
              <Input />
            </Form.Item>
          </Col>
          {approvalNumber > 0 && (
            <>
              {approvers.map((item, idx) => (
                <React.Fragment key={idx}>
                  <Col span={12}>
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
                      <Col span={12}>
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
                            disabled={!isEditApproval}
                          />
                        </Form.Item>
                      </Col>
                      {isEditApproval && (
                        <Col span={12}>
                          <Form.Item
                            label={`Ghi chú duyệt ${idx + 1}`}
                            name={["approvers", idx, "note"]}
                          >
                            <Input.TextArea
                              rows={1}
                              placeholder="Ghi chú duyệt"
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
      </Form>
    </Modal>
  );
};

export default LeaveRequestModal;
