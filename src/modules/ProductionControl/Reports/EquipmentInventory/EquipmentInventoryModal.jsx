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
  Drawer,
  Card,
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

const { Option } = Select;

const EquipmentInventoryModal = ({
  open,
  onCancel,
  onSubmit,
  initialValues,
}) => {
  const [form] = Form.useForm();
  const [monthYear, setMonthYear] = useState(dayjs());
  const [tableData, setTableData] = useState([]);
  const [approvalNumber, setApprovalNumber] = useState();
  const [approvers, setApprovers] = useState([]);
  const [dataUser, setDataUser] = useState([]);
  const [isEditApproval, setIsEditApproval] = useState(false);

  // responsive check
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;
  const isDesktop = windowWidth >= 1024;

  useEffect(() => {
    if (open) {
      if (!initialValues) {
        getVoucherNo();
      }
      form.setFieldsValue(initialValues || {});
      setIsEditApproval(!!initialValues?.type);
      setMonthYear(dayjs(initialValues?.voucherDate || dayjs()));
      if (initialValues?.details?.length) {
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
      getApprovalByModulePage();
      getUser();
      if (initialValues) {
        getApprovals(initialValues.id);
      }
    }
  }, [open, initialValues, form]);

  useEffect(() => {
    if (open && !initialValues && approvalNumber > 0) {
      setApprovers(Array(approvalNumber).fill({ userName: null }));
    }
  }, [approvalNumber, open, initialValues]);

  const getApprovals = async (refId) => {
    try {
      let res = await getApprovalsByRef(refId, "BCKKTB");
      if (res && res.status === 200) {
        const list = res.data.data.map((ap) => ({
          id: ap.id,
          username: ap.userName,
          status: ap.status,
          note: ap.note,
        }));
        setApprovers(list);
        form.setFieldsValue({ approvers: list });
      }
    } catch {}
  };

  const getUser = async () => {
    try {
      let res = await getAllUser();
      if (res && res.status === 200) {
        const options = res.data.data.map((user) => ({
          value: user.userName,
          label: user.fullName || user.userName,
        }));
        setDataUser(options);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getApprovalByModulePage = async () => {
    try {
      let res = await getApprovalSetting("PM", "pm-bao-cao-kiem-ke");
      if (res && res.status === 200) {
        setApprovalNumber(res.data.data.approvalNumber);
      }
    } catch {}
  };

  const getVoucherNo = async () => {
    try {
      let res = await getDocumentNumber("BCKKTB");
      if (res && res.status === 200) {
        form.setFieldsValue({ voucherNo: res.data.data.code });
      }
    } catch {}
  };

  const handleAddRow = () => {
    const newKey = `${Date.now()}`;
    const newRow = {
      key: newKey,
      stt: tableData.length + 1,
      itemName: "",
      code: "",
      unit: "",
      previousInventory: "",
      annualIncreaseQuantity: "",
      annualDecreaseQuantity: "",
      currentYearInventoryCount: "",
      level1: "",
      level2: "",
      level3: "",
      level4: "",
      level5: "",
      notes: "",
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

  const generateColumns = () => [
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
    { title: "STT", dataIndex: "stt", width: 50 },
    {
      title: "Tên thiết bị, vật tư, CCDC",
      dataIndex: "itemName",
      render: (_, record) => (
        <Input
          value={record.itemName}
          onChange={(e) =>
            handleInputChange(record.key, "itemName", e.target.value)
          }
        />
      ),
    },
    {
      title: "Kí hiệu",
      dataIndex: "code",
      render: (_, record) => (
        <Input
          value={record.code}
          onChange={(e) =>
            handleInputChange(record.key, "code", e.target.value)
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
    { title: "Kiểm kê kỳ trước", dataIndex: "previousInventory" },
    { title: "Tăng trong năm", dataIndex: "annualIncreaseQuantity" },
    { title: "Giảm trong năm", dataIndex: "annualDecreaseQuantity" },
    { title: "Kiểm kê năm nay", dataIndex: "currentYearInventoryCount" },
    { title: "Cấp 1", dataIndex: "level1" },
    { title: "Cấp 2", dataIndex: "level2" },
    { title: "Cấp 3", dataIndex: "level3" },
    { title: "Cấp 4", dataIndex: "level4" },
    { title: "Cấp 5", dataIndex: "level5" },
    { title: "Ghi chú", dataIndex: "notes" },
  ];

  // Mobile: render card list
  const renderMobileCards = () =>
    tableData.map((row) => (
      <Card
        key={row.key}
        size="small"
        style={{ marginBottom: 8 }}
        title={`STT: ${row.stt}`}
        extra={
          <Button
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteRow(row.key)}
          />
        }
      >
        <Input
          placeholder="Tên thiết bị"
          value={row.itemName}
          onChange={(e) =>
            handleInputChange(row.key, "itemName", e.target.value)
          }
          style={{ marginBottom: 8 }}
        />
        <Input
          placeholder="Kí hiệu"
          value={row.code}
          onChange={(e) => handleInputChange(row.key, "code", e.target.value)}
          style={{ marginBottom: 8 }}
        />
        <Input
          placeholder="ĐVT"
          value={row.unit}
          onChange={(e) => handleInputChange(row.key, "unit", e.target.value)}
          style={{ marginBottom: 8 }}
        />
        <Input
          placeholder="Ghi chú"
          value={row.notes}
          onChange={(e) => handleInputChange(row.key, "notes", e.target.value)}
        />
      </Card>
    ));

  return (
    <Modal
      title={
        <span style={{ fontSize: 20, fontWeight: 600 }}>
          {initialValues ? "Cập nhật báo cáo" : "Thêm báo cáo"}
        </span>
      }
      open={open}
      onCancel={() => {
        form.resetFields();
        setMonthYear(dayjs());
        setTableData([]);
        onCancel();
      }}
      onOk={() => {}}
      okText={initialValues ? "Cập nhật" : "Thêm"}
      width={1000}
    >
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="divisionID"
              label="Đơn vị"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="voucherNo"
              label="Số chứng từ"
              rules={[{ required: true }]}
            >
              <Input />
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
          <h4>Bảng kiểm kê</h4>
          <Space>
            <Button icon={<PlusOutlined />} onClick={handleAddRow}>
              Thêm dòng
            </Button>
            <Button onClick={() => setTableData([])}>Hủy</Button>
          </Space>
        </div>

        {isMobile ? (
          renderMobileCards()
        ) : isTablet ? (
          <Drawer
            title="Danh sách vật tư"
            open={true}
            mask={false}
            width="100%"
            getContainer={false}
            closable={false}
          >
            <Table
              columns={generateColumns()}
              dataSource={tableData}
              pagination={false}
              scroll={{ x: "max-content" }}
              size="small"
              bordered
            />
          </Drawer>
        ) : (
          <Table
            columns={generateColumns()}
            dataSource={tableData}
            pagination={false}
            scroll={{ x: "max-content" }}
            size="small"
            bordered
          />
        )}
      </Form>
    </Modal>
  );
};

export default EquipmentInventoryModal;
