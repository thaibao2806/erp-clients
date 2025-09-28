import React, { useEffect, useState } from "react";
import {
  Modal,
  Form,
  Input,
  DatePicker,
  Row,
  Col,
  notification,
  Card,
} from "antd";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import {
  createEmployee,
  updateEmployees,
} from "../../../../services/apiPolitical/apiEmployee";

dayjs.extend(customParseFormat);

const EmployeeModal = ({ open, onCancel, onSubmit, initialValues }) => {
  const [form] = Form.useForm();
  const [monthYear, setMonthYear] = useState(dayjs());
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

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
      setMonthYear(dayjs(initialValues?.dateOfBirth || dayjs()));
    }
  }, [open, initialValues, form]);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 576);
      setIsTablet(width >= 576 && width < 992);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleMonthChange = (date) => {
    setMonthYear(date);
  };

  const handleOk = () => {
    form.validateFields().then(async (values) => {
      try {
        const payload = {
          ...values,
          issueDate: values.issueDate?.toISOString(),
          startDate: values.startDate?.toISOString(),
          endDate: values.endDate?.toISOString(),
          dateOfBirth: monthYear?.toISOString(),
        };

        let res;
        if (!initialValues) {
          res = await createEmployee(
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
        } else {
          res = await updateEmployees(
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
        }

        if (res && (res.status === 200 || res.status === 204)) {
          onSubmit();
          form.resetFields();
          setMonthYear(dayjs());
          notification.success({
            message: "Thành công",
            description: "Lưu hồ sơ nhân viên thành công.",
            placement: "topRight",
          });
        }
      } catch (error) {
        notification.error({
          message: "Thất bại",
          description: "Đã có lỗi xảy ra. Vui lòng thử lại.",
          placement: "topRight",
        });
      }
    });
  };

  const renderMobileCards = () => (
    <div style={{ display: "grid", gap: 8 }}>
      <Card size="small" title="Họ và tên">
        <Form.Item name="fullName" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
      </Card>
      <Card size="small" title="Giới tính">
        <Form.Item name="gender" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
      </Card>
      <Card size="small" title="Ngày sinh">
        <DatePicker
          picker="day"
          style={{ width: "100%" }}
          format="DD/MM/YYYY"
          value={monthYear}
          onChange={handleMonthChange}
        />
      </Card>
      <Card size="small" title="Số điện thoại">
        <Form.Item name="phoneNumber">
          <Input />
        </Form.Item>
      </Card>
      <Card size="small" title="Email">
        <Form.Item name="email">
          <Input />
        </Form.Item>
      </Card>
      <Card size="small" title="Phòng ban">
        <Form.Item name="department">
          <Input />
        </Form.Item>
      </Card>
      <Card size="small" title="Vị trí">
        <Form.Item name="position">
          <Input />
        </Form.Item>
      </Card>
      <Card size="small" title="Cấp bậc">
        <Form.Item name="rank">
          <Input />
        </Form.Item>
      </Card>
      <Card size="small" title="CCCD">
        <Form.Item name="identityNumber">
          <Input />
        </Form.Item>
      </Card>
      <Card size="small" title="Ngày cấp">
        <Form.Item name="issueDate">
          <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
        </Form.Item>
      </Card>
      <Card size="small" title="Mã số thuế">
        <Form.Item name="taxCode">
          <Input />
        </Form.Item>
      </Card>
      <Card size="small" title="Loại lao động">
        <Form.Item name="laborType">
          <Input />
        </Form.Item>
      </Card>
      <Card size="small" title="Ngày bắt đầu">
        <Form.Item name="startDate">
          <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
        </Form.Item>
      </Card>
      <Card size="small" title="Ngày kết thúc">
        <Form.Item name="endDate">
          <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
        </Form.Item>
      </Card>
      <Card size="small" title="Trạng thái">
        <Form.Item name="status">
          <Input />
        </Form.Item>
      </Card>
      <Card size="small" title="Địa chỉ">
        <Form.Item name="address">
          <Input />
        </Form.Item>
      </Card>
    </div>
  );

  return (
    <Modal
      title={
        <span style={{ fontSize: 22, fontWeight: 600 }}>
          {initialValues ? "Cập nhật hồ sơ nhân viên" : "Thêm hồ sơ nhân viên"}
        </span>
      }
      open={open}
      onCancel={() => {
        form.resetFields();
        setMonthYear(dayjs());
        onCancel();
      }}
      onOk={handleOk}
      okText={initialValues ? "Cập nhật" : "Thêm"}
      width={isMobile ? "100%" : 1000}
    >
      <Form form={form} layout="vertical">
        {isMobile ? (
          renderMobileCards()
        ) : (
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
              <Form.Item name="position" label="Vị trí">
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
        )}
      </Form>
    </Modal>
  );
};

export default EmployeeModal;
