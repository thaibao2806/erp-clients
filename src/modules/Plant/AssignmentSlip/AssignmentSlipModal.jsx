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
import { addAssignmentSlip } from "../../../services/apiPlan/apiAssignmentSlip";
dayjs.extend(customParseFormat);

const AssignmentSlipModal = ({ open, onCancel, onSubmit, initialValues }) => {
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
        title: "N/Công",
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
                onChange={(e) =>
                  handleInputChange(record.key, `d${day}`, e.target.value)
                }
              />
            ),
          };
        })
      : [];

    return [...baseColumns];
  };

  const handleOk = () => {
    if (!initialValues) {
      form.validateFields().then(async (values) => {
        try {
          const payload = {
            ...values,
            documentDate: monthYear.toISOString(), // ISO định dạng
            note: values.note || "",
            details: tableData.map((item) => ({
              content: item.content || "",
              unit: item.unit || "",
              quantity: Number(item.quantity) || 0,
              workDay: Number(item.workDay) || 0,
              note: item.note || "",
            })),
          };

          let res = await addAssignmentSlip(
            payload.documentNumber,
            payload.productName,
            payload.documentDate,
            payload.department,
            payload.managementUnit,
            payload.note,
            payload.details
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
    }
  };

  return (
    <Modal
      title={
        <span style={{ fontSize: 25, fontWeight: 600 }}>
          {initialValues ? "Cập nhật phiếu giao việc" : "Thêm phiếu giao việc"}
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
              name="documentNumber"
              label="Số chứng từ"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="productName"
              label="Tên sản phẩm"
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
            <Form.Item
              name="managementUnit"
              label="Đơn bị quản lý sử dụng"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="department"
              label="Bộ phận"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="note" label="Ghi chú">
              <Input.TextArea rows={1} />
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
            <h4>Nội dung giao việc</h4>
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

export default AssignmentSlipModal;
