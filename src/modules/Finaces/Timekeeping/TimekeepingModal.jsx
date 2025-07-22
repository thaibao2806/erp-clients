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

dayjs.extend(customParseFormat);

const TimekeepingModal = ({ open, onCancel, onSubmit, initialValues }) => {
  const [form] = Form.useForm();
  const [monthYear, setMonthYear] = useState(dayjs());
  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    if (open) {
      if (initialValues) {
        form.setFieldsValue(initialValues);
        setMonthYear(dayjs(initialValues.month));
        const formattedDetails = initialValues.details.map((item, index) => {
          const daysInMonth = dayjs(initialValues.month).daysInMonth();
          const dayFields = Array.from(
            { length: daysInMonth },
            (_, i) => i + 1
          );
          return {
            key: `${Date.now()}_${index}`,
            stt: index + 1,
            fullName: item.fullName || "",
            position: item.position || "",
            ...dayFields.reduce((acc, day) => {
              acc[`d${day}`] = item[`d${day}`] || "";
              return acc;
            }, {}),
          };
        });
        setTableData(formattedDetails);
      } else {
        form.resetFields();
        setMonthYear(dayjs());
        setTableData([]);
      }
    }
  }, [open, initialValues]);

  const handleMonthChange = (date) => {
    setMonthYear(date);
  };

  const handleAddRow = () => {
    const daysInMonth = monthYear.daysInMonth();
    const newKey = `${Date.now()}`;
    const dayFields = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const newRow = {
      key: newKey,
      stt: tableData.length + 1,
      fullName: "",
      position: "",
      ...dayFields.reduce((acc, day) => {
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
    const daysInMonth = monthYear.daysInMonth();
    const dayColumns = Array.from({ length: daysInMonth }, (_, i) => ({
      title: `Ngày ${i + 1}`,
      dataIndex: `d${i + 1}`,
      width: 80,
      render: (_, record) => (
        <Input
          value={record[`d${i + 1}`]}
          onChange={(e) =>
            handleInputChange(record.key, `d${i + 1}`, e.target.value)
          }
        />
      ),
    }));

    return [
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
        title: "Họ và tên",
        dataIndex: "fullName",
        render: (_, record) => (
          <Input
            value={record.fullName}
            onChange={(e) =>
              handleInputChange(record.key, "fullName", e.target.value)
            }
          />
        ),
      },
      {
        title: "Chức vụ",
        dataIndex: "position",
        render: (_, record) => (
          <Input
            value={record.position}
            onChange={(e) =>
              handleInputChange(record.key, "position", e.target.value)
            }
          />
        ),
      },
      ...dayColumns,
      {
        title: "Tổng công",
        dataIndex: "totalWork",
        render: (_, record) => {
          const total = Array.from({ length: daysInMonth }, (_, i) => {
            const val = (record[`d${i + 1}`] || "").trim().toUpperCase();
            switch (val) {
              case "X":
              case "CT":
                return 1;
              case "X/2":
                return 0.5;
              default:
                return 0;
            }
          }).reduce((acc, cur) => acc + cur, 0);
          return total;
        },
      },
    ];
  };

  const handleOk = () => {
    form.validateFields().then((values) => {
      try {
        const daysInMonth = monthYear.daysInMonth();
        const dayFields = Array.from({ length: daysInMonth }, (_, i) => i + 1);

        const details = tableData.map((item) => {
          const dayData = dayFields.reduce((acc, day) => {
            acc[`d${day}`] = item[`d${day}`] || "";
            return acc;
          }, {});

          const totalWork = dayFields.reduce((sum, day) => {
            const val = (item[`d${day}`] || "").trim().toUpperCase();
            switch (val) {
              case "X":
              case "CT":
                return sum + 1;
              case "X/2":
                return sum + 0.5;
              default:
                return sum;
            }
          }, 0);

          return {
            fullName: item.fullName,
            position: item.position,
            ...dayData,
            totalWork,
          };
        });

        const payload = {
          ...values,
          month: monthYear.toISOString(),
          details,
        };

        onSubmit(payload);
        form.resetFields();
        setTableData([]);
        setMonthYear(dayjs());

        notification.success({
          message: "Thành công",
          description: "Lưu bảng chấm công thành công.",
        });
      } catch (error) {
        notification.error({
          message: "Lỗi",
          description: "Đã có lỗi xảy ra khi lưu.",
        });
      }
    });
  };

  return (
    <Modal
      title={
        <span style={{ fontSize: 25, fontWeight: 600 }}>
          {initialValues ? "Cập nhật chấm công" : "Thêm chấm công"}
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
      width="100%"
      style={{ top: 30 }}
    >
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="voucherNo"
              label="Số chứng từ"
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
            <Form.Item label="Chấm công tháng">
              <DatePicker
                picker="month"
                style={{ width: "100%" }}
                format="MM/YYYY"
                value={monthYear}
                onChange={handleMonthChange}
              />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="note" label="Ghi chú">
              <Input.TextArea rows={2} />
            </Form.Item>
          </Col>
        </Row>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 8,
          }}
        >
          <h4>
            Chi tiết chấm công (X: đủ công, X/2: nữa công, CT: công tác, P: nghỉ
            có phép)
          </h4>
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
      </Form>
    </Modal>
  );
};

export default TimekeepingModal;
