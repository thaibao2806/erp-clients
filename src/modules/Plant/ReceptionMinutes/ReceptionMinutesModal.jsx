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
} from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { useSelector } from "react-redux";
import {
  createReceivingReport,
  updateReceivingReport,
} from "../../../services/apiPlan/apiReceptionMinute";
dayjs.extend(customParseFormat);

const ReceptionMinutesModal = ({ open, onCancel, onSubmit, initialValues }) => {
  const [form] = Form.useForm();
  const [monthYear, setMonthYear] = useState(dayjs());
  const [receivingDate, setReceivingDate] = useState(dayjs());
  const [tableData, setTableData] = useState([]);
  const user = useSelector((state) => state.auth.login?.currentUser);

  useEffect(() => {
    if (open) {
      const values = { ...initialValues };

      if (values.runTime) {
        values.runTime = dayjs(values.runTime);
      }
      form.setFieldsValue(values || {});
      setMonthYear(dayjs(initialValues?.documentDate || dayjs()));
      setReceivingDate(dayjs(initialValues?.receivingDate || dayjs()));
      console.log(initialValues);
    }
  }, [open, initialValues, form]);

  const handleMonthChange = (date) => {
    setMonthYear(date);
    if (!date) return;
  };

  const handleReceivingDateChange = (date) => {
    setReceivingDate(date);
    if (!date) return;
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
            documentDate: monthYear.toISOString(), // ISO định dạng
            receivingDate: receivingDate.toISOString(),
          };

          let id = crypto.randomUUID();

          let res = await createReceivingReport(
            id,
            payload.documentNumber,
            payload.vehicleName,
            payload.receivingDate,
            payload.documentDate,
            payload.companyRepresentative,
            payload.companyRepresentativePosition,
            payload.shipRepresentative1,
            payload.shipRepresentative1Position,
            payload.shipRepresentative2,
            payload.shipRepresentative2Position,
            user.data.userName,
            new Date().toISOString(),
            user.data.userName,
            new Date().toISOString()
          );
          if ((res && res.status === 200) || res.status === 201) {
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
            documentDate: monthYear.toISOString(), // ISO định dạng
            receivingDate: receivingDate.toISOString(),
          };
          let res = await updateReceivingReport(
            initialValues.id,
            payload.documentNumber,
            payload.vehicleName,
            payload.receivingDate,
            payload.documentDate,
            payload.companyRepresentative,
            payload.companyRepresentativePosition,
            payload.shipRepresentative1,
            payload.shipRepresentative1Position,
            payload.shipRepresentative2,
            payload.shipRepresentative2Position,
            initialValues.createdBy,
            initialValues.createdAt,
            user.data.userName,
            new Date().toISOString()
          );
          if ((res && res.status === 200) || res.status === 204) {
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
          {initialValues ? "Cập nhật biên bản" : "Thêm biên bản"}
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
              name="documentNumber"
              label="Số chứng từ"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="vehicleName" label="Tên phương tiện">
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Ngày tiếp nhận">
              <DatePicker
                picker="day"
                style={{ width: "100%" }}
                format="DD/MM/YYYY"
                value={receivingDate}
                onChange={handleReceivingDateChange}
              />
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
            <Form.Item name="companyRepresentative" label="Đại diện công ty">
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="companyRepresentativePosition" label="Chức vụ">
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="shipRepresentative1" label="Đại diện tàu (1)">
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="shipRepresentative1Position" label="Chức vụ">
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="shipRepresentative2" label="Đại diện tàu (2)">
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="shipRepresentative2Position" label="Chức vụ">
              <Input />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default ReceptionMinutesModal;
