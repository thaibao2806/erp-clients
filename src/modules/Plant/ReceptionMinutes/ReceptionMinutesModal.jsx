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
import { useSelector } from "react-redux";
import {
  createReceivingReport,
  updateReceivingReport,
} from "../../../services/apiPlan/apiReceptionMinute";
import { getDocumentNumber } from "../../../services/apiAutoNumbering";
import { getAllUser } from "../../../services/apiAuth";
import { getApprovalSetting } from "../../../services/apiApproveSetting";
import {
  createApprovals,
  getApprovalsByRef,
  updateStatusApprovals,
} from "../../../services/apiApprovals";
import { addFollower } from "../../../services/apiFollower";
dayjs.extend(customParseFormat);

const approvalStatusOptions = [
  { value: "pending", label: "Chờ duyệt" },
  { value: "approved", label: "Đã duyệt" },
  { value: "rejected", label: "Từ chối" },
];

const ReceptionMinutesModal = ({ open, onCancel, onSubmit, initialValues }) => {
  const [form] = Form.useForm();
  const [monthYear, setMonthYear] = useState(dayjs());
  const [receivingDate, setReceivingDate] = useState(dayjs());
  const [tableData, setTableData] = useState([]);
  const user = useSelector((state) => state.auth.login?.currentUser);
  const [approvalNumber, setApprovalNumber] = useState();
  const [approvers, setApprovers] = useState([]);
  const [dataUser, setDataUser] = useState([]);
  const [isEditApproval, setIsEditApproval] = useState(false);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (open) {
      const values = { ...initialValues };
      if (!initialValues) {
        getVoucherNo();
      }

      if (values.runTime) {
        values.runTime = dayjs(values.runTime);
      }
      form.setFieldsValue(values || {});
      setIsEditApproval(!!initialValues?.type);
      setMonthYear(dayjs(initialValues?.documentDate || dayjs()));
      setReceivingDate(dayjs(initialValues?.receivingDate || dayjs()));
      getApprovalByModulePage();
      getUser();
      if (initialValues) {
        getApprovals(initialValues.id);
      }
    }
  }, [open, initialValues, form]);

  useEffect(() => {
    if (open && !initialValues && approvalNumber > 0) {
      setApprovers(Array(approvalNumber).fill({ user: null }));
    }
  }, [approvalNumber, open, initialValues]);

  const getApprovals = async (refId) => {
    try {
      let res = await getApprovalsByRef(refId, "BBTN");
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
      let res = await getApprovalSetting("PL", "pl-bien-ban-tiep-nhan");
      if (res && res.status === 200) {
        setApprovalNumber(res.data.data.approvalNumber);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getVoucherNo = async () => {
    try {
      let res = await getDocumentNumber("BBTN");
      if (res && res.status === 200) {
        form.setFieldsValue({ documentNumber: res.data.data.code });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleMonthChange = (date) => {
    setMonthYear(date);
    if (!date) return;
  };

  const handleReceivingDateChange = (date) => {
    setReceivingDate(date);
    if (!date) return;
  };

  const handleInputChange = (key, field, value) => {
    setTableData((prev) =>
      prev.map((item) =>
        item.key === key ? { ...item, [field]: value } : item
      )
    );
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
        "BBTN",
        formattedApprovers,
        documentNumber,
        `/pl/bien-ban/bien-ban-tiep-nhan-chi-tiet/${refId}?type=BBTN`
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
            documentDate: monthYear.toISOString(), // ISO định dạng
            receivingDate: receivingDate.toISOString(),
          };

          let id = crypto.randomUUID();

          let res = await createReceivingReport(
            id,
            payload.documentNumber,
            payload.vehicleName,
            payload.receivingDate,
            payload.documentDate,
            payload.companyRepresentative,
            payload.companyRepresentativePosition,
            payload.shipRepresentative1,
            payload.shipRepresentative1Position,
            payload.shipRepresentative2,
            payload.shipRepresentative2Position,
            user.data.userName,
            new Date().toISOString(),
            user.data.userName,
            new Date().toISOString()
          );
          if ((res && res.status === 200) || res.status === 201) {
            onSubmit(); // callback từ cha để reload
            await handleAddApprovals(res.data.data, payload.documentNumber);
            const newFollowers = dataUser.find(u => u.value === user.data.userName);
            await addFollower(
              res.data.data,
              "ReceivingReport",
               payload.documentNumber,
               [
                {
                  userId: newFollowers.id,      // bạn đã đặt id = user.apk trong getUser
                  userName: newFollowers.value, // chính là userName
                }
              ]
            )
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
            documentDate: monthYear.toISOString(), // ISO định dạng
            receivingDate: receivingDate.toISOString(),
          };
          let res = await updateReceivingReport(
            initialValues.id,
            payload.documentNumber,
            payload.vehicleName,
            payload.receivingDate,
            payload.documentDate,
            payload.companyRepresentative,
            payload.companyRepresentativePosition,
            payload.shipRepresentative1,
            payload.shipRepresentative1Position,
            payload.shipRepresentative2,
            payload.shipRepresentative2Position,
            initialValues.createdBy,
            initialValues.createdAt,
            user.data.userName,
            new Date().toISOString()
          );
          if ((res && res.status === 200) || res.status === 204) {
            onSubmit(); // callback từ cha để reload
            if (isEditApproval) {
              await handleUpdateApprovals();
            }
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
          {initialValues ? "Cập nhật biên bản" : "Thêm biên bản"}
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
              name="documentNumber"
              label="Số chứng từ"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="vehicleName" label="Tên phương tiện">
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Ngày tiếp nhận">
              <DatePicker
                picker="day"
                style={{ width: "100%" }}
                format="DD/MM/YYYY"
                value={receivingDate}
                onChange={handleReceivingDateChange}
              />
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
            <Form.Item name="companyRepresentative" label="Đại diện công ty">
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="companyRepresentativePosition" label="Chức vụ">
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="shipRepresentative1" label="Đại diện tàu (1)">
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="shipRepresentative1Position" label="Chức vụ">
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="shipRepresentative2" label="Đại diện tàu (2)">
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="shipRepresentative2Position" label="Chức vụ">
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
      </Form>
    </Modal>
  );
};

export default ReceptionMinutesModal;
