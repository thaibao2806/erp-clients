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
  Select,
} from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { getApprovalSetting } from "../../../../services/apiApproveSetting";
import { getDocumentNumber } from "../../../../services/apiAutoNumbering";
import { getAllUser } from "../../../../services/apiAuth";
import {
  createApprovals,
  getApprovalsByRef,
  updateStatusApprovals,
} from "../../../../services/apiApprovals";
import {
  createEquipmentInventory,
  updateEquipmentInventory,
} from "../../../../services/apiProductControl/apiEquipmentInventory";
dayjs.extend(customParseFormat);

const DeviceManagementModal = ({ open, onCancel, onSubmit, initialValues }) => {
  const [form] = Form.useForm();
  const [monthYear, setMonthYear] = useState(dayjs());
  const [tableData, setTableData] = useState([]);
  const [approvalNumber, setApprovalNumber] = useState();
  const [approvers, setApprovers] = useState([]);
  const [dataUser, setDataUser] = useState([]);
  const [isEditApproval, setIsEditApproval] = useState(false);

  useEffect(() => {
    if (open) {
      form.setFieldsValue(initialValues || {});
      setIsEditApproval(!!initialValues?.type);
      setMonthYear(dayjs(initialValues?.voucherDate || dayjs()));
      if (initialValues?.details?.length) {
        const daysInMonth = dayjs(initialValues.voucherDate).daysInMonth();
        const columns = Array.from({ length: daysInMonth }, (_, i) => i + 1);

        const formattedDetails = initialValues.details.map((item, index) => ({
          key: `${Date.now()}_${index}`,
          stt: index + 1,
          itemName: item.itemName || "",
          code: item.code || "",
          unit: item.unit || "",
          previousInventory: item.previousInventory || "",
          annualIncreaseQuantity: item.annualIncreaseQuantity || "",
          annualDecreaseQuantity: item.annualDecreaseQuantity || "",
          currentYearInventoryCount: item.currentYearInventoryCount || "",
          level1: item.level1 || "",
          level2: item.level2 || "",
          level3: item.level3 || "",
          level4: item.level4 || "",
          level5: item.level5 || "",
          notes: item.notes || "",
        }));

        setTableData(formattedDetails);
      } else {
        setTableData([]);
      }
      getUser();
    }
  }, [open, initialValues, form]);

  const getUser = async () => {
    try {
      let res = await getAllUser();
      if (res && res.status === 200) {
        const options = res.data.data.map((user) => ({
          value: user.userName, // hoặc user.id nếu cần
          label: user.fullName || user.userName,
        }));
        setDataUser(options);
      }
    } catch (error) {
      console.log(error);
    }
  };

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

  const handleOk = () => {
    if (!initialValues) {
      form.validateFields().then(async (values) => {
        try {
          const payload = {
            ...values,
            voucherDate: monthYear.toISOString(), // ISO định dạng
            details: tableData.map((item) => ({
              itemName: item.itemName || "",
              code: item.code || "",
              unit: item.unit || "",
              previousInventory: Number(item.previousInventory) || 0,
              annualIncreaseQuantity: Number(item.annualIncreaseQuantity) || 0,
              annualDecreaseQuantity: Number(item.annualDecreaseQuantity) || 0,
              currentYearInventoryCount:
                Number(item.currentYearInventoryCount) || 0,
              level1: Number(item.level1) || 0,
              level2: Number(item.level2) || 0,
              level3: Number(item.level3) || 0,
              level4: Number(item.level4) || 0,
              level5: Number(item.level5) || 0,
              notes: item.notes || "",
            })),
          };

          let res = await createEquipmentInventory(
            payload.divisionID,
            payload.voucherNo,
            payload.voucherDate,
            payload.department,
            payload.details
          );
          if (res && res.status === 200) {
            await handleAddApprovals(res.data.data, payload.voucherNo);
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
            console.log(error);
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
            voucherDate: monthYear.toISOString(), // ISO định dạng
            details: tableData.map((item) => ({
              itemName: item.itemName || "",
              code: item.code || "",
              unit: item.unit || "",
              previousInventory: Number(item.previousInventory) || 0,
              annualIncreaseQuantity: Number(item.annualIncreaseQuantity) || 0,
              annualDecreaseQuantity: Number(item.annualDecreaseQuantity) || 0,
              currentYearInventoryCount:
                Number(item.currentYearInventoryCount) || 0,
              level1: Number(item.level1) || 0,
              level2: Number(item.level2) || 0,
              level3: Number(item.level3) || 0,
              level4: Number(item.level4) || 0,
              level5: Number(item.level5) || 0,
              notes: item.notes || "",
            })),
          };

          let res = await updateEquipmentInventory(
            initialValues.id,
            payload.divisionID,
            payload.voucherNo,
            payload.voucherDate,
            payload.department,
            payload.details
          );
          if ((res && res.status === 200) || res.status === 204) {
            if (isEditApproval) {
              await handleUpdateApprovals();
            }
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
            console.log(error);
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
              name="equipmentInventory"
              label="Báo cáo kiểm kê"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="itemName"
              label="Tên thiết bị, CCDC"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="code" label="Ký hiệu" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="unit" label="ĐVT" rules={[{ required: false }]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="previousInventory"
              label="Kiểm kê kỳ trước"
              rules={[{ required: false }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="annualIncreaseQuantity"
              label="Tăng trong năm"
              rules={[{ required: false }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="annualDecreaseQuantity"
              label="Giảm trong năm"
              rules={[{ required: false }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="currentYearInventoryCount"
              label="Kiểm kê năm nay"
              rules={[{ required: false }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="level1"
              label="Cấp 1"
              rules={[{ required: false }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="level2"
              label="Cấp 2"
              rules={[{ required: false }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="level3"
              label="Cấp 3"
              rules={[{ required: false }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="level4"
              label="Cấp 4"
              rules={[{ required: false }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="level5"
              label="Cấp 5"
              rules={[{ required: false }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="notes"
              label="Ghi chú"
              rules={[{ required: false }]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default DeviceManagementModal;
