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
} from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);

const RepairModal = ({ open, onCancel, onSubmit, initialValues }) => {
  const [form] = Form.useForm();
  const [monthYear, setMonthYear] = useState(dayjs());
  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    if (open) {
      form.setFieldsValue(initialValues || {});
      setTableData([]);
      setMonthYear(dayjs());
    }
  }, [open, initialValues, form]);

  const handleMonthChange = (date) => {
    setMonthYear(date);
    if (!date) return;

    const daysInMonth = date.daysInMonth();
    const columns = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    setTableData([
      {
        key: "1",
        stt: 1,
        hoTen: "",
        chucVu: "",
        ...columns.reduce((acc, day) => {
          acc[`d${day}`] = "";
          return acc;
        }, {}),
      },
    ]);
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
        dataIndex: "thietbivattu",
        render: (_, record) => (
          <Input
            value={record.hoTen}
            onChange={(e) => handleInputChange(record.key, "hoTen", e.target.value)}
          />
        ),
      },
      {
        title: "Kí hiệu",
        dataIndex: "ngaynhap",
        render: (_, record) => (
          <Input
            value={record.chucVu}
            onChange={(e) => handleInputChange(record.key, "chucVu", e.target.value)}
          />
        ),
      },
      {
        title: "ĐVT",
        dataIndex: "soluongnhap",
        render: (_, record) => (
          <Input
            value={record.chucVu}
            onChange={(e) => handleInputChange(record.key, "chucVu", e.target.value)}
          />
        ),
      },
      {
        title: "Số lượng",
        dataIndex: "soluongnhap",
        render: (_, record) => (
          <Input
            value={record.chucVu}
            onChange={(e) => handleInputChange(record.key, "chucVu", e.target.value)}
          />
        ),
      },
      {
        title: "Tình trạng",
        dataIndex: "soluongxua",
        render: (_, record) => (
          <Input
            value={record.chucVu}
            onChange={(e) => handleInputChange(record.key, "chucVu", e.target.value)}
          />
        ),
      },
      {
        title: "Ghi chú",
        dataIndex: "ghichu",
        render: (_, record) => (
          <Input
            value={record.chucVu}
            onChange={(e) => handleInputChange(record.key, "chucVu", e.target.value)}
          />
        ),
      },
    ];

    const dynamicColumns = monthYear
      ? Array.from({ length: monthYear.daysInMonth() }, (_, i) => {
          const day = i + 1;
          return {
            title: `${day}`,
            dataIndex: `d${day}`,
            width: 40,
            render: (_, record) => (
              <Input
                value={record[`d${day}`] || ""}
                onChange={(e) => handleInputChange(record.key, `d${day}`, e.target.value)}
              />
            ),
          };
        })
      : [];

    return [...baseColumns];
  };

  const handleOk = () => {
    form.validateFields().then((values) => {
      onSubmit({ ...values, month: monthYear, data: tableData });
      form.resetFields();
      setMonthYear(dayjs());
      setTableData([]);
    });
  };

  return (
    <Modal
      title={
        <span style={{ fontSize: 25, fontWeight: 600 }}>
          {initialValues ? "Cập nhật đề xuất" : "Thêm đề xuất"}
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
              name="code"
              label="Số chứng từ"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="name"
              label="Nội dung đề xuất"
              rules={[{ required: true }]}
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
            <Form.Item name="name" label="Bộ phận">
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="name"
              label="Loại đề xuất"
              rules={[
                { required: true, message: "Vui lòng chọn loại đề xuất" },
              ]}
            >
              <Select placeholder="Chọn loại đề xuất">
                <Option value="SC">Sửa chữa</Option>
                <Option value="TL">Thanh lý</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="name" label="Ghi chú" rules={[{ required: true }]}>
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
            <h4>Bảng vật tư, thiết bị sửa chữa, thanh lý</h4>
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

export default RepairModal;