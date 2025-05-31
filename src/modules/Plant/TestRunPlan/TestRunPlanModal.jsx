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
  notification,
} from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import {
  createTestRunPlan,
  updateTestRunPlans,
} from "../../../services/apiPlan/apiTestRunPlan";
dayjs.extend(customParseFormat);

const TestRunPlanModal = ({ open, onCancel, onSubmit, initialValues }) => {
  const [form] = Form.useForm();
  const [monthYear, setMonthYear] = useState(dayjs());
  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    if (open) {
      const values = { ...initialValues };

      if (values.runTime) {
        values.runTime = dayjs(values.runTime);
      }
      form.setFieldsValue(values || {});
      setMonthYear(dayjs(initialValues?.documentDate || dayjs()));
      if (initialValues?.details?.length) {
        const daysInMonth = dayjs(initialValues.documentDate).daysInMonth();
        const columns = Array.from({ length: daysInMonth }, (_, i) => i + 1);

        const formattedDetails = initialValues.details.map((item, index) => ({
          key: `${Date.now()}_${index}`,
          stt: index + 1,
          department: item.department || "",
          participantCount: item.participantCount || "",
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
        title: "Đơn vị",
        dataIndex: "department",
        render: (_, record) => (
          <Input
            value={record.department}
            onChange={(e) =>
              handleInputChange(record.key, "department", e.target.value)
            }
          />
        ),
      },
      {
        title: "Số lượng người tham gia",
        dataIndex: "participantCount",
        render: (_, record) => (
          <Input
            value={record.participantCount}
            onChange={(e) =>
              handleInputChange(record.key, "participantCount", e.target.value)
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

    return baseColumns;
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
              department: item.department || "",
              participantCount: item.participantCount || "",
              note: item.note || "",
            })),
          };

          console.log(payload);

          let res = await createTestRunPlan(
            payload.documentNumber,
            payload.managingDepartment,
            payload.vehicleName,
            payload.documentDate,
            payload.receivingLocation,
            payload.runLocation,
            payload.runSchedule,
            payload.runTime,
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
    } else {
      form.validateFields().then(async (values) => {
        try {
          const payload = {
            ...values,
            documentDate: monthYear.toISOString(), // ISO định dạng
            note: values.note || "",
            details: tableData.map((item) => ({
              department: item.department || "",
              participantCount: item.participantCount || "",
              note: item.note || "",
            })),
          };
          let res = await updateTestRunPlans(
            initialValues.id,
            payload.documentNumber,
            payload.managingDepartment,
            payload.vehicleName,
            payload.documentDate,
            payload.receivingLocation,
            payload.runLocation,
            payload.runSchedule,
            payload.runTime,
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
          {initialValues ? "Cập nhật kế hoạch" : "Thêm kế hoạch"}
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
            <Form.Item
              name="vehicleName"
              label="Tên phương tiện"
              // rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="managingDepartment"
              label="Đơn vị quản lý"
              // rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Ngày chứng từ" required>
              <DatePicker
                picker="month"
                style={{ width: "100%" }}
                format="DD/MM/YYYY"
                value={monthYear}
                onChange={handleMonthChange}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="receivingLocation"
              label="Nơi nhận"
              // rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="runLocation"
              label="Nơi chạy"
              // rules={[{ required: true, message: "Vui lòng chọn nơi chạy" }]}
            >
              <Select placeholder="Chọn nơi chạy">
                <Option value="HCM">Hồ Chí Minh</Option>
                <Option value="KG">Kiên Giang</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="runSchedule"
              label="Lộ trình chạy"
              // rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="runTime"
              label="Thời gian chạy"
              // rules={[
              //   { required: true, message: "Vui lòng chọn thời gian chạy" },
              // ]}
            >
              <DatePicker
                showTime
                format="DD/MM/YYYY HH:mm"
                style={{ width: "100%" }}
                placeholder="Chọn ngày và giờ"
              />
            </Form.Item>
          </Col>
          {/* <Col span={12}>
            <Form.Item name="name" label="Bộ phận" rules={[{ required: true }]}> 
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="name" label="Ghi chú" rules={[{ required: true }]}> 
              <Input />
            </Form.Item>
          </Col> */}
        </Row>

        <>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <h4>Nội dung kế hoạch</h4>
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

export default TestRunPlanModal;
