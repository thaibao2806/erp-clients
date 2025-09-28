import React, { useEffect, useState } from "react";
import {
  Modal,
  Form,
  Input,
  DatePicker,
  Row,
  Col,
  notification,
  Select,
  InputNumber,
  Card,
} from "antd";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { getApprovalSetting } from "../../../../services/apiApproveSetting";
import { getAllUser } from "../../../../services/apiAuth";
import {
  createApprovals,
  getApprovalsByRef,
  updateStatusApprovals,
} from "../../../../services/apiApprovals";
import {
  createLeaveRequest,
  updateLeaveRequestByID,
} from "../../../../services/apiPolitical/apiLeaveRequest";
import { useSelector } from "react-redux";
import { jwtDecode } from "jwt-decode";

dayjs.extend(customParseFormat);

const approvalStatusOptions = [
  { value: "pending", label: "Chờ duyệt" },
  { value: "approved", label: "Đã duyệt" },
  { value: "rejected", label: "Từ chối" },
];

const calculateWorkingHours = (start, end) => {
  if (!dayjs.isDayjs(start)) start = dayjs(start);
  if (!dayjs.isDayjs(end)) end = dayjs(end);
  let totalMinutes = 0;
  let current = dayjs(start);

  while (current.isBefore(end)) {
    const date = current.format("YYYY-MM-DD");
    const morningStart = dayjs(`${date} 07:00`);
    const morningEnd = dayjs(`${date} 11:00`);
    const afternoonStart = dayjs(`${date} 13:00`);
    const afternoonEnd = dayjs(`${date} 17:00`);

    const msMorning = Math.min(
      Math.max(0, Math.min(morningEnd, end) - Math.max(morningStart, current)),
      4 * 60 * 60 * 1000
    );
    const msAfternoon = Math.min(
      Math.max(
        0,
        Math.min(afternoonEnd, end) - Math.max(afternoonStart, current)
      ),
      4 * 60 * 60 * 1000
    );

    totalMinutes += (msMorning + msAfternoon) / 60000;
    current = current.add(1, "day").startOf("day");
  }

  return totalMinutes / 60;
};

const LeaveRequestModal = ({ open, onCancel, onSubmit, initialValues }) => {
  const [form] = Form.useForm();
  const [approvalNumber, setApprovalNumber] = useState();
  const [approvers, setApprovers] = useState([]);
  const [dataUser, setDataUser] = useState([]);
  const [isEditApproval, setIsEditApproval] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [totalDays, setTotalDays] = useState(0);
  const user = useSelector((state) => state.auth.login?.currentUser);
  const [userID, setUserID] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (user && user.data.token) {
      const decode = jwtDecode(user.data.token);
      setUserID(decode.nameid);
    }
  }, [user]);

  useEffect(() => {
    if (
      dayjs.isDayjs(startDate) &&
      dayjs.isDayjs(endDate) &&
      endDate.isAfter(startDate)
    ) {
      const workingHours = calculateWorkingHours(startDate, endDate);
      const total = workingHours / 8;
      const totalFormatted = Number(total.toFixed(2));
      setTotalDays(totalFormatted);
      form.setFieldsValue({ totalDate: totalFormatted });
    } else {
      setTotalDays(0);
      form.setFieldsValue({ totalDate: 0 });
    }
  }, [startDate, endDate, form]);

  useEffect(() => {
    if (open) {
      if (initialValues) {
        const patchedValues = {
          ...initialValues,
          startDate: initialValues.startDate
            ? dayjs(initialValues.startDate)
            : null,
          endDate: initialValues.endDate ? dayjs(initialValues.endDate) : null,
        };
        form.setFieldsValue(patchedValues);
        setStartDate(patchedValues.startDate);
        setEndDate(patchedValues.endDate);
        setIsEditApproval(!!initialValues?.type);
        getApprovals(initialValues.id);
      } else {
        form.resetFields();
        setStartDate(null);
        setEndDate(null);
      }
      getApprovalByModulePage();
      getUser();
    }
  }, [open, initialValues, form]);

  useEffect(() => {
    if (open && !initialValues && approvalNumber > 0) {
      setApprovers(Array(approvalNumber).fill({ userName: null }));
    }
  }, [approvalNumber, open, initialValues]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 576);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getApprovals = async (refId) => {
    try {
      let res = await getApprovalsByRef(refId, "DXNP");
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
      let res = await getApprovalSetting("PT", "pt-nghi-phep");
      if (res && res.status === 200) {
        setApprovalNumber(res.data.data.approvalNumber);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleOk = () => {
    form.validateFields().then(async (values) => {
      try {
        const payload = {
          ...values,
          startDate: values.startDate
            ? dayjs(values.startDate).format("YYYY-MM-DD HH:mm:ss")
            : null,
          endDate: values.endDate
            ? dayjs(values.endDate).format("YYYY-MM-DD HH:mm:ss")
            : null,
        };

        let res;
        if (!initialValues) {
          res = await createLeaveRequest(
            payload.fullName || "",
            payload.department || "",
            payload.position || "",
            payload.leaveType || "",
            userID,
            payload.startDate || "",
            payload.endDate || "",
            payload.totalDate || "",
            payload.reason || "",
            payload.address || "",
            payload.emailOrPhone || ""
          );
          if (res && res.status === 200) {
            await createApprovals(
              res.data.data,
              "DXNP",
              (form.getFieldValue("approvers") || []).map((item, index) => {
                const user = dataUser.find((u) => u.value === item.username);
                return {
                  userName: item.username,
                  fullName: user?.label || "",
                  level: index + 1,
                };
              }),
              payload.documentNumber,
              `/pt/nhan-su/nghi-phep-chi-tiet/${res.data.data}?type=DXNP`
            );
          }
        } else {
          res = await updateLeaveRequestByID(
            initialValues.id,
            payload.fullName,
            payload.department,
            payload.position,
            payload.leaveType,
            userID,
            payload.startDate,
            payload.endDate,
            payload.totalDate,
            payload.reason,
            payload.address,
            payload.emailOrPhone
          );
          if (res && res.status === 204 && isEditApproval) {
            for (const item of form.getFieldValue("approvers") || []) {
              if (item.id) {
                await updateStatusApprovals(item.id, item.status, item.note);
              }
            }
          }
        }

        if (res && (res.status === 200 || res.status === 204)) {
          onSubmit();
          form.resetFields();
          notification.success({
            message: "Thành công",
            description: "Lưu đơn xin nghỉ thành công.",
            placement: "topRight",
          });
        }
      } catch (error) {
        notification.error({
          message: "Thất bại",
          description: "Đã có lỗi xảy ra. Vui lòng thử lại",
        });
      }
    });
  };

  const renderMobileCards = () => (
    <div style={{ display: "grid", gap: 8 }}>
      <Card size="small" title="Họ và tên">
        <Form.Item name="fullName" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
      </Card>
      <Card size="small" title="Phòng ban">
        <Form.Item name="department" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
      </Card>
      <Card size="small" title="Chức vụ">
        <Form.Item name="position">
          <Input />
        </Form.Item>
      </Card>
      <Card size="small" title="Loại phép">
        <Form.Item name="leaveType">
          <Input />
        </Form.Item>
      </Card>
      <Card size="small" title="Ngày bắt đầu nghỉ">
        <Form.Item name="startDate" rules={[{ required: true }]}>
          <DatePicker
            showTime
            style={{ width: "100%" }}
            format="DD/MM/YYYY HH:mm"
            onChange={(v) => setStartDate(v)}
          />
        </Form.Item>
      </Card>
      <Card size="small" title="Ngày kết thúc nghỉ">
        <Form.Item name="endDate" rules={[{ required: true }]}>
          <DatePicker
            showTime
            style={{ width: "100%" }}
            format="DD/MM/YYYY HH:mm"
            onChange={(v) => setEndDate(v)}
          />
        </Form.Item>
      </Card>
      <Card size="small" title="Tổng số ngày nghỉ">
        <Form.Item name="totalDate">
          <InputNumber style={{ width: "100%" }} value={totalDays} readOnly />
        </Form.Item>
      </Card>
      <Card size="small" title="Lý do nghỉ">
        <Form.Item name="reason" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
      </Card>
      <Card size="small" title="Số điện thoại/email liên hệ">
        <Form.Item name="emailOrPhone">
          <Input />
        </Form.Item>
      </Card>
      <Card size="small" title="Nơi nghỉ">
        <Form.Item name="address">
          <Input />
        </Form.Item>
      </Card>
      {approvalNumber > 0 &&
        approvers.map((item, idx) => (
          <Card key={idx} size="small" title={`Người duyệt cấp ${idx + 1}`}>
            <Form.Item
              name={["approvers", idx, "username"]}
              rules={[{ required: true }]}
            >
              <Select
                options={dataUser}
                placeholder="Chọn người duyệt"
                showSearch
                optionFilterProp="label"
                disabled={!!initialValues}
              />
            </Form.Item>
            {initialValues && (
              <>
                <Form.Item
                  name={["approvers", idx, "status"]}
                  label="Trạng thái duyệt"
                >
                  <Select
                    options={approvalStatusOptions}
                    disabled={!isEditApproval}
                  />
                </Form.Item>
                {isEditApproval && (
                  <Form.Item
                    name={["approvers", idx, "note"]}
                    label="Ghi chú duyệt"
                  >
                    <Input.TextArea rows={1} />
                  </Form.Item>
                )}
              </>
            )}
          </Card>
        ))}
    </div>
  );

  return (
    <Modal
      title={
        <span style={{ fontSize: 22, fontWeight: 600 }}>
          {initialValues ? "Cập nhật đơn xin nghỉ phép" : "Đơn xin nghỉ phép"}
        </span>
      }
      open={open}
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      onOk={handleOk}
      okText={initialValues ? "Cập nhật" : "Thêm"}
      width={isMobile ? "100%" : 1000}
    >
      <Form form={form} layout="vertical">
        {isMobile ? (
          renderMobileCards()
        ) : (
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="fullName"
                label="Họ và tên"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="department"
                label="Phòng ban"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="position" label="Chức vụ">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="leaveType" label="Loại phép">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="startDate"
                label="Ngày bắt đầu nghỉ"
                rules={[{ required: true }]}
              >
                <DatePicker
                  showTime
                  style={{ width: "100%" }}
                  format="DD/MM/YYYY HH:mm"
                  onChange={(v) => setStartDate(v)}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="endDate"
                label="Ngày kết thúc nghỉ"
                rules={[{ required: true }]}
              >
                <DatePicker
                  showTime
                  style={{ width: "100%" }}
                  format="DD/MM/YYYY HH:mm"
                  onChange={(v) => setEndDate(v)}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="totalDate" label="Tổng số ngày nghỉ">
                <InputNumber
                  style={{ width: "100%" }}
                  value={totalDays}
                  readOnly
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="reason"
                label="Lý do nghỉ"
                rules={[{ required: true }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="emailOrPhone" label="SĐT/email liên hệ">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="address" label="Nơi nghỉ">
                <Input />
              </Form.Item>
            </Col>
            {approvalNumber > 0 &&
              approvers.map((item, idx) => (
                <React.Fragment key={idx}>
                  <Col span={12}>
                    <Form.Item
                      label={`Người duyệt cấp ${idx + 1}`}
                      name={["approvers", idx, "username"]}
                      rules={[{ required: true }]}
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
                        >
                          <Select
                            options={approvalStatusOptions}
                            disabled={!isEditApproval}
                          />
                        </Form.Item>
                      </Col>
                      {isEditApproval && (
                        <Col span={12}>
                          <Form.Item
                            label={`Ghi chú duyệt ${idx + 1}`}
                            name={["approvers", idx, "note"]}
                          >
                            <Input.TextArea rows={1} />
                          </Form.Item>
                        </Col>
                      )}
                    </>
                  )}
                </React.Fragment>
              ))}
          </Row>
        )}
      </Form>
    </Modal>
  );
};

export default LeaveRequestModal;
