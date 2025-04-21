import React from 'react';
import { Button, Card, Col, Form, Input, Row, Typography, DatePicker } from 'antd';

const { Title } = Typography;

const AccountInfo = () => {
  const [form] = Form.useForm();

  const handleUpdate = () => {
    const values = form.getFieldsValue();
    console.log('Dữ liệu cập nhật:', values);
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
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            address: '',
            birthDate: null, // Thêm giá trị mặc định cho ngày sinh
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="firstName" label="Họ">
                <Input placeholder="Nhập họ" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="lastName" label="Tên">
                <Input placeholder="Nhập tên" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="birthDate" label="Ngày sinh">
                <DatePicker
                  style={{ width: '100%' }}
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
                <Input.TextArea placeholder="Nhập địa chỉ" autoSize={{ minRows: 2, maxRows: 4 }} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  );
};

export default AccountInfo;
