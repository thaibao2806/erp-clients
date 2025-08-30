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
  createApprovals,
  getApprovalsByRef,
  updateStatusApprovals,
} from "../../../../services/apiApprovals";
import { getAllUser } from "../../../../services/apiAuth";
import { getApprovalSetting } from "../../../../services/apiApproveSetting";
import { getDocumentNumber } from "../../../../services/apiAutoNumbering";
import {
  createRepair,
  updateRepair,
} from "../../../../services/apiProductControl/apiRepair";
import { useSelector } from "react-redux";
import { addFollower } from "../../../../services/apiFollower";
dayjs.extend(customParseFormat);

const RepairModal = ({ open, onCancel, onSubmit, initialValues }) => {
  const [form] = Form.useForm();
  const [monthYear, setMonthYear] = useState(dayjs());
  const [tableData, setTableData] = useState([]);
  const [approvalNumber, setApprovalNumber] = useState();
  const [approvers, setApprovers] = useState([]);
  const [dataUser, setDataUser] = useState([]);
  const [isEditApproval, setIsEditApproval] = useState(false);
  const [loading, setLoading] = useState(false);
  const user = useSelector((state) => state.auth.login?.currentUser);

  useEffect(() => {
    if (open) {
      if (!initialValues) {
        getVoucherNo();
      }
      form.setFieldsValue(initialValues || {});
      setIsEditApproval(!!initialValues?.type);
      setMonthYear(dayjs(initialValues?.voucherDate || dayjs()));
      if (initialValues?.details?.length) {
        const daysInMonth = dayjs(initialValues.voucherDate).daysInMonth();
        const columns = Array.from({ length: daysInMonth }, (_, i) => i + 1);

        const formattedDetails = initialValues.details.map((item, index) => ({
          key: `${Date.now()}_${index}`,
          stt: index + 1,
          content: item.content || "",
          code: item.code || "",
          unit: item.unit || "",
          quantity: item.quantity || "",
          condition: item.condition || "",
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
      let res = await getApprovalsByRef(refId, "DXSCTL");
      if (res && res.status === 200) {
        const list = res.data.data.map((ap) => ({
          id: ap.id,
          username: ap.userName, // phải trùng key với name trong Form
          status: ap.status,
          note: ap.note,
        }));
        setApprovers(list);
        form.setFieldsValue({ approvers: list });
      }
    } catch (error) {}
  };

  const getUser = async () => {
    try {
      let res = await getAllUser();
      if (res && res.status === 200) {
        const options = res.data.data.map((user) => ({
          id: user.apk,
          value: user.userName, // hoặc user.id nếu cần
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
      let res = await getApprovalSetting("PM", "pm-de-xuat-sua-chua");
      if (res && res.status === 200) {
        setApprovalNumber(res.data.data.approvalNumber);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getVoucherNo = async () => {
    try {
      let res = await getDocumentNumber("DXSCTL");
      if (res && res.status === 200) {
        form.setFieldsValue({ voucherNo: res.data.data.code });
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
        title: "Tình trạng",
        dataIndex: "condition",
        render: (_, record) => (
          <Input
            value={record.condition}
            onChange={(e) =>
              handleInputChange(record.key, "condition", e.target.value)
            }
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

    return baseColumns;
  };

  const handleAddApprovals = async (refId, documentNumber) => {
    try {
      const approversData = form.getFieldValue("approvers") || [];

      const formattedApprovers = approversData.map((item, index) => {
        const user = dataUser.find((u) => u.value === item.username);
        return {
          userName: item.username,
          fullName: user?.label || "", // hoặc tìm từ danh sách user để lấy fullName
          level: index + 1,
        };
      });

      const res = await createApprovals(
        refId,
        "DXSCTL",
        formattedApprovers,
        documentNumber,
        `/pm/de-xuat/sua-chua-chi-tiet/${refId}?type=BCKKTB`
      );
      if (res && res.status === 200) {
        console.log("Tạo danh sách duyệt thành công");
      }
    } catch (error) {
      console.error("Lỗi khi tạo duyệt:", error);
    }
  };

  const handleUpdateApprovals = async () => {
    try {
      const approversData = form.getFieldValue("approvers") || [];
      const updatePromises = approversData.map((item) => {
        if (item.id) {
          return updateStatusApprovals(item.id, item.status, item.note);
        }
        return null;
      });

      // Lọc null (nếu có), chờ tất cả promise hoàn thành
      const responses = await Promise.all(updatePromises.filter(Boolean));
    } catch (error) {
      console.error("Lỗi cập nhật phê duyệt:", error);
      notification.error({
        message: "Cập nhật thất bại",
        description: "Có lỗi xảy ra khi cập nhật trạng thái duyệt.",
      });
    }
  };

  const handleOk = () => {
    if (!initialValues) {
      form.validateFields().then(async (values) => {
        try {
          setLoading(true);
          const payload = {
            ...values,
            voucherDate: monthYear.toISOString(), // ISO định dạng
            details: tableData.map((item) => ({
              content: item.content || "",
              code: item.code || "",
              unit: item.unit || "",
              quantity: item.quantity || "",
              condition: item.condition || "",
              notes: item.notes || "",
            })),
          };

          let res = await createRepair(
            payload.voucherNo,
            payload.voucherDate,
            payload.assetName,
            payload.assetType,
            payload.department,
            payload.note,
            payload.details
          );
          if (res && res.status === 200) {
            await handleAddApprovals(res.data.data, payload.voucherNo);
            const newFollowers = dataUser.find(u => u.value === user.data.userName);
            await addFollower(
              res.data.data,
              "Repair",
               payload.documentNumber,
               [
                {
                  userId: newFollowers.id,      // bạn đã đặt id = user.apk trong getUser
                  userName: newFollowers.value, // chính là userName
                }
              ]
            )
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
        } finally{
          setLoading(false);
        }
      });
    } else {
      form.validateFields().then(async (values) => {
        try {
          setLoading(true);
          const payload = {
            ...values,
            voucherDate: monthYear.toISOString(), // ISO định dạng
            details: tableData.map((item) => ({
              content: item.content || "",
              code: item.code || "",
              unit: item.unit || "",
              quantity: item.quantity || "",
              condition: item.condition || "",
              notes: item.notes || "",
            })),
          };

          let res = await updateRepair(
            initialValues.id,
            payload.voucherNo,
            payload.voucherDate,
            payload.assetName,
            payload.assetType,
            payload.department,
            payload.note,
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
        } finally{
          setLoading(false);
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
      confirmLoading={loading}
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
            <Form.Item
              name="assetName"
              label="Nội dung đề xuất"
              rules={[{ required: false }]}
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
            <Form.Item name="department" label="Bộ phận">
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="assetType"
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
            <Form.Item
              name="note"
              label="Ghi chú"
              rules={[{ required: false }]}
            >
              <Input />
            </Form.Item>
          </Col>
          {approvalNumber > 0 && (
            <>
              {approvers.map((item, idx) => (
                <React.Fragment key={idx}>
                  <Col span={12}>
                    <Form.Item
                      label={`Người duyệt cấp ${idx + 1}`}
                      name={["approvers", idx, "username"]}
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng chọn người duyệt",
                        },
                      ]}
                    >
                      <Select
                        options={dataUser}
                        placeholder="Chọn người duyệt"
                        showSearch
                        optionFilterProp="label"
                        disabled={!!initialValues}
                      />
                    </Form.Item>
                  </Col>
                  {initialValues && (
                    <>
                      <Col span={12}>
                        <Form.Item
                          label={`Trạng thái duyệt ${idx + 1}`}
                          name={["approvers", idx, "status"]}
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng chọn trạng thái duyệt",
                            },
                          ]}
                        >
                          <Select
                            options={approvalStatusOptions}
                            placeholder="Chọn trạng thái"
                            disabled={!isEditApproval || item.username !== user.data.userName}
                          />
                        </Form.Item>
                      </Col>
                      {isEditApproval && (
                        <Col span={12}>
                          <Form.Item
                            label={`Ghi chú duyệt ${idx + 1}`}
                            name={["approvers", idx, "note"]}
                          >
                            <Input.TextArea
                              rows={1}
                              placeholder="Ghi chú duyệt"
                              disabled={!isEditApproval || item.username !== user.data.userName}
                            />
                          </Form.Item>
                        </Col>
                      )}
                    </>
                  )}
                </React.Fragment>
              ))}
            </>
          )}
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
