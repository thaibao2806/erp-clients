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
import { getApprovalSetting } from "../../../../services/apiApproveSetting";
import { getAllUser } from "../../../../services/apiAuth";
import {
  createApprovals,
  getApprovalsByRef,
  updateStatusApprovals,
} from "../../../../services/apiApprovals";
import {
  createLeaveRequest,
  updateLeaveRequestByID,
} from "../../../../services/apiPolitical/apiLeaveRequest";
import { useSelector } from "react-redux";
import { jwtDecode } from "jwt-decode";
dayjs.extend(customParseFormat);

const approvalStatusOptions = [
  { value: "pending", label: "Chờ duyệt" },
  { value: "approved", label: "Đã duyệt" },
  { value: "rejected", label: "Từ chối" },
];

const calculateWorkingHours = (start, end) => {
  if (!dayjs.isDayjs(start)) start = dayjs(start);
  if (!dayjs.isDayjs(end)) end = dayjs(end);
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
  const user = useSelector((state) => state.auth.login?.currentUser);
  const [userID, setUserID] = useState("");
  useEffect(() => {
    if (user && user.data.token) {
      const decode = jwtDecode(user.data.token);
      setUserID(decode.nameid);
    }
  }, []);

  useEffect(() => {
    if (
      dayjs.isDayjs(startDate) &&
      dayjs.isDayjs(endDate) &&
      endDate.isAfter(startDate)
    ) {
      const workingHours = calculateWorkingHours(startDate, endDate);
      const total = workingHours / 8;
      const totalFormatted = Number(total.toFixed(2));
      setTotalDays(totalFormatted);
      form.setFieldsValue({ totalDate: totalFormatted });
    } else {
      setTotalDays(0);
      form.setFieldsValue({ totalDate: 0 });
    }
  }, [startDate, endDate, form]);

  useEffect(() => {
    if (open) {
      if (initialValues) {
        const patchedValues = {
          ...initialValues,
          startDate: initialValues.startDate
            ? dayjs(initialValues.startDate)
            : null,
          endDate: initialValues.endDate ? dayjs(initialValues.endDate) : null,
        };

        form.setFieldsValue(patchedValues);
        setStartDate(patchedValues.startDate);
        setEndDate(patchedValues.endDate);
        setIsEditApproval(!!initialValues?.type);
        getApprovals(initialValues.id);
      } else {
        form.resetFields();
        setStartDate(null);
        setEndDate(null);
      }

      getApprovalByModulePage();
      getUser();
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

  const handleInputChange = (key, field, value) => {
    setTableData((prev) =>
      prev.map((item) =>
        item.key === key ? { ...item, [field]: value } : item
      )
    );
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
        "DXNP",
        formattedApprovers,
        documentNumber,
        `/pt/nhan-su/nghi-phep-chi-tiet/${refId}?type=DXNP`
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
            startDate: values.startDate
              ? dayjs(values.startDate).format("YYYY-MM-DD HH:mm:ss")
              : null,
            endDate: values.endDate
              ? dayjs(values.endDate).format("YYYY-MM-DD HH:mm:ss")
              : null,
          };

          let res = await createLeaveRequest(
            payload.fullName || "",
            payload.department || "",
            payload.position || "",
            payload.leaveType || "",
            userID,
            payload.startDate || "",
            payload.endDate || "",
            payload.totalDate || "",
            payload.reason || "",
            payload.address || "",
            payload.emailOrPhone || ""
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
            startDate: values.startDate
              ? dayjs(values.startDate).format("YYYY-MM-DD HH:mm:ss")
              : null,
            endDate: values.endDate
              ? dayjs(values.endDate).format("YYYY-MM-DD HH:mm:ss")
              : null,
          };

          let res = await updateLeaveRequestByID(
            initialValues.id,
            payload.fullName,
            payload.department,
            payload.position,
            payload.leaveType,
            userID,
            payload.startDate,
            payload.endDate,
            payload.totalDate,
            payload.reason,
            payload.address,
            payload.emailOrPhone
          );
          if (res && res.status === 204) {
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
          {initialValues ? "Cập nhật đơn xin nghỉ phép" : "Đơn xin nghỉ phép"}
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
              name="fullName"
              label="Họ và tên"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="department"
              label="Phòng ban"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="position"
              label="Chức vụ"
              rules={[{ required: false }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="leaveType"
              label="Loại phép"
              rules={[{ required: false }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="startDate"
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
              name="endDate"
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
            <Form.Item name="totalDate" label="Tổng số ngày nghỉ">
              <InputNumber
                style={{ width: "100%" }}
                value={totalDays}
                readOnly
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="reason"
              label="Lý do nghỉ"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="emailOrPhone"
              label="Số điện thoại/email liên hệ"
              rules={[{ required: false }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="address"
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
