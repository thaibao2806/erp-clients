import React, { useEffect, useState } from "react";
import {
  Modal,
  Form,
  Input,
  Row,
  Col,
  Upload,
  Select,
  Button,
  notification,
  Space,
  Avatar,
} from "antd";
import {
  DeleteOutlined,
  PlusOutlined,
  UploadOutlined,
  UserOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { sendAllUserNotification } from "../services/notificationApi";
import { getAllUser } from "../services/apiAuth";

dayjs.extend(customParseFormat);
const { Option } = Select;

const AddNotificationModal = ({
  open,
  onCancel,
  onSubmit,
  initialValues,
  userOptions = [],
}) => {
  const [form] = Form.useForm();
  const [monthYear, setMonthYear] = useState(dayjs());
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    getUser();
  }, []);

  const getUser = async () => {
    try {
      let res = await getAllUser();
      console.log("Users API response:", res);

      if (res && res.status === 200) {
        const userData = res.data?.data || res.data || [];
        const usersWithKey = userData.map((user) => ({
          ...user,
          key: user.apk?.toString() || user.id?.toString(),
        }));
        console.log("Processed users:", usersWithKey);
        setUsers(usersWithKey);
      }
    } catch (error) {
      console.error("Error loading users:", error);
      notification.error({
        message: "Lỗi",
        description: "Không thể tải danh sách người dùng",
        placement: "topRight",
      });
    }
  };

  const handleOk = () => {
    form.validateFields().then(async (values) => {
      setLoading(true);
      try {
        const selectedReceivers = users
          .filter((u) => values.receiverIds?.includes(u.id || u.apk))
          .map((u) => ({
            userId: u.id?.toString() || u.apk?.toString(),
            userName: u.fullName || u.name || u.username || "",
            email: u.email || "",
          }));

        const payload = {
          title: values.title,
          content: values.content,
          link: "/notifications",
          receivers: selectedReceivers,
        };

        const res = await sendAllUserNotification(
          payload.title,
          payload.content,
          payload.link,
          payload.receivers
        );

        if (res?.status === 200) {
          onSubmit();
          form.resetFields();
          setMonthYear(dayjs());
          setFileList([]);
          notification.success({
            message: "Thành công",
            description: "Gửi thông báo thành công.",
            placement: "topRight",
          });
        }
      } catch (error) {
        notification.error({
          message: "Thất bại",
          description: "Đã có lỗi xảy ra. Vui lòng thử lại",
          placement: "topRight",
        });
      } finally {
        setLoading(false);
      }
    });
  };

  return (
    <Modal
      title={
        <span style={{ fontSize: 20, fontWeight: 600 }}>
          {initialValues ? "Cập nhật thông báo" : "Thêm thông báo nội bộ"}
        </span>
      }
      open={open}
      confirmLoading={loading}
      onCancel={() => {
        form.resetFields();
        setMonthYear(dayjs());
        setFileList([]);
        onCancel();
      }}
      onOk={handleOk}
      okText={initialValues ? "Cập nhật" : "Thêm"}
      width={720} // ✅ GIẢM KÍCH THƯỚC MODAL
    >
      <Form form={form} layout="vertical">
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Form.Item
              name="title"
              label="Tiêu đề"
              rules={[{ required: true, message: "Vui lòng nhập tiêu đề" }]}
            >
              <Input placeholder="Nhập tiêu đề thông báo" />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item
              name="content"
              label="Nội dung"
              rules={[{ required: true, message: "Vui lòng nhập nội dung" }]}
            >
              <Input.TextArea rows={4} placeholder="Nhập nội dung thông báo" />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item name="receiverIds" label="Người nhận">
              <Select
                mode="multiple"
                placeholder="Chọn người nhận thông báo"
                optionFilterProp="label"
                showSearch
              >
                {users.map((user) => (
                  <Select.Option
                    key={user.id || user.apk}
                    value={user.id || user.apk}
                    label={user.fullName || user.name || user.username}
                  >
                    <Space>
                      <Avatar size={16} icon={<UserOutlined />}>
                        {(
                          user.fullName ||
                          user.name ||
                          user.username ||
                          ""
                        ).charAt(0)}
                      </Avatar>
                      {user.fullName || user.name || user.username}
                    </Space>
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default AddNotificationModal;
