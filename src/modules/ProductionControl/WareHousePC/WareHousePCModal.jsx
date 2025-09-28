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
import {
  createApprovals,
  getApprovalsByRef,
  updateStatusApprovals,
} from "../../../services/apiApprovals";
import { getAllUser } from "../../../services/apiAuth";
import { getApprovalSetting } from "../../../services/apiApproveSetting";
import {
  addWareHousePC,
  updateWareHousePC,
} from "../../../services/apiProductControl/apiWareHouse";
import { getDocumentNumber } from "../../../services/apiAutoNumbering";
import { useSelector } from "react-redux";
import { addFollower } from "../../../services/apiFollower";

dayjs.extend(customParseFormat);

const approvalStatusOptions = [
  { value: "pending", label: "Chờ duyệt" },
  { value: "approved", label: "Đã duyệt" },
  { value: "rejected", label: "Từ chối" },
];

const WareHousePCModal = ({ open, onCancel, onSubmit, initialValues }) => {
  const [form] = Form.useForm();
  const [monthYear, setMonthYear] = useState(dayjs());
  const [tableData, setTableData] = useState([]);
  const [approvalNumber, setApprovalNumber] = useState();
  const [approvers, setApprovers] = useState([]);
  const [dataUser, setDataUser] = useState([]);
  const [isEditApproval, setIsEditApproval] = useState(false);
  const [loading, setLoading] = useState(false);
  const user = useSelector((state) => state.auth.login?.currentUser);

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
          materialName: item.materialName || "",
          importDate: item.importDate || "",
          importQuantity: item.importQuantity || "",
          exportDate: item.exportDate || "",
          exportQuantity: item.exportQuantity || "",
          stockBalance: item.stockBalance || "",
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
      let res = await getApprovalsByRef(refId, "SK");
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
          id: user.apk,
          value: user.userName,
          label: user.fullName || user.userName,
        }));
        setDataUser(options);
      }
    } catch {}
  };

  const getApprovalByModulePage = async () => {
    try {
      let res = await getApprovalSetting("PM", "pm-so-kho");
      if (res && res.status === 200) {
        setApprovalNumber(res.data.data.approvalNumber);
      }
    } catch {}
  };

  const getVoucherNo = async () => {
    try {
      let res = await getDocumentNumber("SK");
      if (res && res.status === 200) {
        form.setFieldsValue({ voucherNo: res.data.data.code });
      }
    } catch {}
  };

  const handleMonthChange = (date) => {
    setMonthYear(date);
  };

  const handleAddRow = () => {
    const newKey = `${Date.now()}`;
    const newRow = {
      key: newKey,
      stt: tableData.length + 1,
      materialName: "",
      importDate: "",
      importQuantity: "",
      exportDate: "",
      exportQuantity: "",
      stockBalance: "",
      notes: "",
    };
    setTableData((prev) => [...prev, newRow]);
  };

  const handleDeleteRow = (key) => {
    setTableData((prev) => prev.filter((item) => item.key !== key));
  };

  const handleInputChange = (key, field, value) => {
    setTableData((prev) =>
      prev.map((item) => {
        if (item.key !== key) return item;
        const updatedItem = { ...item, [field]: value };
        const importQty = Number(updatedItem.importQuantity) || 0;
        const exportQty = Number(updatedItem.exportQuantity) || 0;
        updatedItem.stockBalance = importQty - exportQty;
        return updatedItem;
      })
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
      title: "Tên thiết bị, vật tư",
      dataIndex: "materialName",
      render: (_, record) => (
        <Input
          value={record.materialName}
          onChange={(e) =>
            handleInputChange(record.key, "materialName", e.target.value)
          }
        />
      ),
    },
    {
      title: "Ngày nhập",
      dataIndex: "importDate",
      render: (_, record) => (
        <DatePicker
          style={{ width: "100%" }}
          value={record.importDate ? dayjs(record.importDate) : null}
          format="DD/MM/YYYY"
          onChange={(date) =>
            handleInputChange(
              record.key,
              "importDate",
              date ? date.toISOString() : ""
            )
          }
        />
      ),
    },
    {
      title: "Số lượng nhập",
      dataIndex: "importQuantity",
      render: (_, record) => (
        <Input
          value={record.importQuantity}
          onChange={(e) =>
            handleInputChange(record.key, "importQuantity", e.target.value)
          }
        />
      ),
    },
    {
      title: "Số lượng xuất",
      dataIndex: "exportQuantity",
      render: (_, record) => (
        <Input
          value={record.exportQuantity}
          onChange={(e) =>
            handleInputChange(record.key, "exportQuantity", e.target.value)
          }
        />
      ),
    },
    {
      title: "Ngày xuất",
      dataIndex: "exportDate",
      render: (_, record) => (
        <DatePicker
          style={{ width: "100%" }}
          value={record.exportDate ? dayjs(record.exportDate) : null}
          format="DD/MM/YYYY"
          onChange={(date) =>
            handleInputChange(
              record.key,
              "exportDate",
              date ? date.toISOString() : ""
            )
          }
        />
      ),
    },
    {
      title: "Tồn kho",
      dataIndex: "stockBalance",
      render: (_, record) => (
        <Input
          value={record.stockBalance}
          readOnly
          style={{ backgroundColor: "#f5f5f5", textAlign: "right" }}
        />
      ),
    },
    {
      title: "Ghi chú",
      dataIndex: "notes",
      render: (_, record) => (
        <Input
          value={record.notes}
          onChange={(e) =>
            handleInputChange(record.key, "notes", e.target.value)
          }
        />
      ),
    },
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
          placeholder="Tên thiết bị, vật tư"
          value={row.materialName}
          onChange={(e) =>
            handleInputChange(row.key, "materialName", e.target.value)
          }
          style={{ marginBottom: 8 }}
        />
        <Input
          placeholder="SL nhập"
          value={row.importQuantity}
          onChange={(e) =>
            handleInputChange(row.key, "importQuantity", e.target.value)
          }
          style={{ marginBottom: 8 }}
        />
        <Input
          placeholder="SL xuất"
          value={row.exportQuantity}
          onChange={(e) =>
            handleInputChange(row.key, "exportQuantity", e.target.value)
          }
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
        <span style={{ fontSize: 25, fontWeight: 600 }}>
          {initialValues ? "Cập nhật sổ kho" : "Thêm sổ kho"}
        </span>
      }
      open={open}
      onCancel={() => {
        form.resetFields();
        setMonthYear(dayjs());
        setTableData([]);
        onCancel();
      }}
      onOk={() => {}} // giữ nguyên handleOk cũ nếu cần tích hợp
      okText={initialValues ? "Cập nhật" : "Thêm"}
      width={1000}
      confirmLoading={loading}
    >
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="division"
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
          <h4>Bảng vật tư, thiết bị</h4>
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

export default WareHousePCModal;
