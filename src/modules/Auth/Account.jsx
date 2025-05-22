import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Row,
  Typography,
  DatePicker,
  notification,
} from "antd";
import { useSelector } from "react-redux";
import { getAccount, updateAccount } from "../../services/apiAuth";
import { jwtDecode } from "jwt-decode";
import moment from "moment";

const { Title } = Typography;

const AccountInfo = () => {
  const [form] = Form.useForm();
  const user = useSelector((state) => state.auth.login?.currentUser);
  const [dataUser, setDataUser] = useState();

  useEffect(() => {
    if (user && user.data.token) {
      const decode = jwtDecode(user.data.token);
      let id = decode.nameid;
      getUser(id);
    }
  }, []);

  const getUser = async (id) => {
    try {
      let res = await getAccount(id);
      if (res && res.status === 200) {
        const data = res.data.data;
        setDataUser(data);
        form.setFieldsValue({
          fullName: data.fullName,
          birthDate: data.dateOfBirth
            ? moment.utc(data.dateOfBirth).local()
            : null,
          email: data.email,
          phone: data.phoneNumber,
          address: data.address,
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdate = async () => {
    const values = form.getFieldsValue();
    try {
      let res = await updateAccount(
        dataUser.apk,
        dataUser.userName,
        values.fullName,
        values.email,
        values.phone,
        values.address,
        values.birthDate,
        dataUser.department
      );
      if (res && res.status === 200) {
        notification.success({
          message: "Thành công",
          description: "Cập nhật tài khoản thành công!",
          placement: "topRight",
        });
      }
    } catch (error) {}
    // TODO: Gọi API cập nhật tài khoản ở đây
  };

  return (
    <div style={{ padding: 24 }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={3}>Tài khoản</Title>
        </Col>
        <Col>
          <Button type="primary" onClick={handleUpdate}>
            Cập nhật
          </Button>
        </Col>
      </Row>

      <Card>
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            fullName: "",
            email: "",
            phone: "",
            address: "",
            birthDate: null, // Thêm giá trị mặc định cho ngày sinh
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="fullName" label="Họ và tên">
                <Input placeholder="Họ và tên" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="birthDate" label="Ngày sinh">
                <DatePicker
                  style={{ width: "100%" }}
                  placeholder="Chọn ngày sinh"
                  format="DD/MM/YYYY"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="email" label="Email">
                <Input placeholder="Nhập email" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="phone" label="Số điện thoại">
                <Input placeholder="Nhập số điện thoại" />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="address" label="Địa chỉ">
                <Input.TextArea
                  placeholder="Nhập địa chỉ"
                  autoSize={{ minRows: 2, maxRows: 4 }}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  );
};

export default AccountInfo;
