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
import { sendAllUserNotification } from "../services/notificationApi";
dayjs.extend(customParseFormat);

const AddNotificationModal = ({ open, onCancel, onSubmit, initialValues }) => {
  const [form] = Form.useForm();
  const [monthYear, setMonthYear] = useState(dayjs());
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleOk = () => {
    form.validateFields().then(async (values) => {
      setLoading(true);
      try {
        const payload = {
          ...values,
        };

        let res = await sendAllUserNotification(
          payload.title,
          payload.content,
          "/notifications",
          "",
          ""
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
      } finally {
        setLoading(false); // Tắt loading dù thành công hay lỗi
      }
    });
  };

  return (
    <Modal
      title={
        <span style={{ fontSize: 25, fontWeight: 600 }}>
          {initialValues ? "Cập nhật thông báo" : "Thêm thông báo nội bộ"}
        </span>
      }
      open={open}
      confirmLoading={loading}
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
          <Col span={16}>
            <Form.Item
              name="title"
              label="Tiêu đề"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
          </Col>

          <Col span={16}>
            <Form.Item
              name="content"
              label="Nội dung"
              rules={[{ required: true }]}
            >
              <Input.TextArea />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default AddNotificationModal;
