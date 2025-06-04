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
      setMonthYear(dayjs(initialValues?.documentDate || dayjs()));
      setReceivingDate(dayjs(initialValues?.receivingDate || dayjs()));
      getApprovalByModulePage();
      getUser();
    }
  }, [open, initialValues, form]);

  useEffect(() => {
    if (open && !initialValues && approvalNumber > 0) {
      setApprovers(Array(approvalNumber).fill({ user: null }));
    }
  }, [approvalNumber, open, initialValues]);

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

  const handleOk = () => {
    if (!initialValues) {
      form.validateFields().then(async (values) => {
        try {
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
                      />
                    </Form.Item>
                  </Col>
                  {initialValues && (
                    <Col span={12}>
                      <Form.Item label="Trạng thái duyệt">
                        <Form.Item
                          label="Trạng thái duyệt"
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
                            disabled={!!initialValues}
                          />
                        </Form.Item>
                      </Form.Item>
                    </Col>
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
