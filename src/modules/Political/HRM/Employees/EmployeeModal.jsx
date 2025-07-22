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
} from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import {
  createEmployee,
  updateEmployees,
} from "../../../../services/apiPolitical/apiEmployee";
dayjs.extend(customParseFormat);

const approvalStatusOptions = [
  { value: "pending", label: "Chờ duyệt" },
  { value: "approved", label: "Đã duyệt" },
  { value: "rejected", label: "Từ chối" },
];

const EmployeeModal = ({ open, onCancel, onSubmit, initialValues }) => {
  const [form] = Form.useForm();
  const [monthYear, setMonthYear] = useState(dayjs());
  const [tableData, setTableData] = useState([]);
  const [approvalNumber, setApprovalNumber] = useState();
  const [approvers, setApprovers] = useState([]);
  const [dataUser, setDataUser] = useState([]);
  const [isEditApproval, setIsEditApproval] = useState(false);

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        ...initialValues,
        issueDate: initialValues?.issueDate
          ? dayjs(initialValues.issueDate)
          : null,
        startDate: initialValues?.startDate
          ? dayjs(initialValues.startDate)
          : null,
        endDate: initialValues?.endDate ? dayjs(initialValues.endDate) : null,
      });

      setIsEditApproval(!!initialValues?.type);
      setMonthYear(dayjs(initialValues?.dateOfBirth || dayjs()));
      if (initialValues?.details?.length) {
        const daysInMonth = dayjs(initialValues.dateOfBirth).daysInMonth();
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
    }
  }, [open, initialValues, form]);

  const handleMonthChange = (date) => {
    setMonthYear(date);
    if (!date) return;

    const daysInMonth = date.daysInMonth();
    const columns = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  };

  const handleInputChange = (key, field, value) => {
    setTableData((prev) =>
      prev.map((item) =>
        item.key === key ? { ...item, [field]: value } : item
      )
    );
  };

  const handleOk = () => {
    if (!initialValues) {
      form.validateFields().then(async (values) => {
        try {
          const payload = {
            ...values,
            issueDate: values.issueDate?.toISOString(),
            startDate: values.startDate?.toISOString(),
            endDate: values.endDate?.toISOString(),
            dateOfBirth: monthYear.toISOString(),
          };

          let res = await createEmployee(
            payload.fullName,
            payload.gender,
            payload.dateOfBirth,
            payload.phoneNumber,
            payload.email,
            payload.department,
            payload.position,
            payload.rank,
            payload.identityNumber,
            payload.issueDate,
            payload.taxCode,
            payload.laborType,
            payload.startDate,
            payload.endDate,
            payload.status,
            payload.address
          );
          if (res && res.status === 200) {
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
            issueDate: values.issueDate?.toISOString(),
            startDate: values.startDate?.toISOString(),
            endDate: values.endDate?.toISOString(),
            dateOfBirth: monthYear.toISOString(),
          };

          let res = await updateEmployees(
            initialValues.id,
            payload.fullName,
            payload.gender,
            payload.dateOfBirth,
            payload.phoneNumber,
            payload.email,
            payload.department,
            payload.position,
            payload.rank,
            payload.identityNumber,
            payload.issueDate,
            payload.taxCode,
            payload.laborType,
            payload.startDate,
            payload.endDate,
            payload.status,
            payload.address
          );
          console.log(res.status);
          if (res && res.status === 204) {
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
          {initialValues ? "Cập nhật hồ sơ nhân viên" : "Thêm hồ sơ nhân viên"}
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
              name="fullName"
              label="Họ và tên"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="gender"
              label="Giới tính"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Ngày sinh">
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
            <Form.Item name="phoneNumber" label="Số điện thoại">
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="email" label="Email">
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="department" label="Phòng ban">
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="position" label="Vị rí">
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="rank" label="Cấp bậc">
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="identityNumber" label="CCCD">
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="issueDate" label="Ngày cấp">
              <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="taxCode" label="Mã số thuế">
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="laborType" label="Loại lao động">
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="startDate" label="Ngày bắt đầu">
              <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="endDate" label="Ngày kết thúc">
              <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="status" label="Trạng thái">
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="address" label="Địa chỉ">
              <Input />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default EmployeeModal;
