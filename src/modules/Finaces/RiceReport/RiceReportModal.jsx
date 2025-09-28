import React, { useEffect, useState } from "react";
import {
  Modal,
  Form,
  Input,
  DatePicker,
  Row,
  Col,
  Button,
  Space,
  notification,
  Select,
  InputNumber,
  Card,
} from "antd";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { getDocumentNumber } from "../../../services/apiAutoNumbering";
import { getAllUser } from "../../../services/apiAuth";
import {
  createRiceReport,
  updateRiceReportByID,
} from "../../../services/apiFinaces/apiRiceReport";

dayjs.extend(customParseFormat);

const RiceReportModal = ({ open, onCancel, onSubmit, initialValues }) => {
  const [form] = Form.useForm();
  const [monthYear, setMonthYear] = useState(dayjs());
  const [dataUser, setDataUser] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  // Theo dõi số lượng
  const slKT = Form.useWatch("slKT", form) || 0;
  const slCT = Form.useWatch("slCT", form) || 0;
  const slTC = Form.useWatch("slTC", form) || 0;
  const slKH = Form.useWatch("slKH", form) || 0;
  const totalSL = (slKT || 0) + (slCT || 0) + (slTC || 0) + (slKH || 0);

  useEffect(() => {
    if (open) {
      if (!initialValues) {
        getVoucherNo();
      }
      form.setFieldsValue(initialValues || {});
      setMonthYear(dayjs(initialValues?.voucherDate || dayjs()));
      getUser();
    }
  }, [open, initialValues, form]);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 576);
      setIsTablet(width >= 576 && width < 992);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getUser = async () => {
    try {
      let res = await getAllUser();
      if (res && res.status === 200) {
        const options = res.data.data.map((user) => ({
          value: user.apk,
          label: user.fullName || user.userName,
        }));
        setDataUser(options);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getVoucherNo = async () => {
    try {
      let res = await getDocumentNumber("BC");
      if (res && res.status === 200) {
        form.setFieldsValue({ voucherNo: res.data.data.code });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleMonthChange = (date) => {
    setMonthYear(date);
  };

  const handleOk = () => {
    form.validateFields().then(async (values) => {
      try {
        setLoading(true);
        const payload = {
          ...values,
          voucherDate: monthYear.toISOString(),
        };

        let res;
        if (!initialValues) {
          res = await createRiceReport(
            payload.voucherNo,
            payload.voucherDate,
            payload.slKT,
            payload.slCT,
            payload.slTC,
            payload.slKH,
            totalSL,
            payload.chefId
          );
        } else {
          res = await updateRiceReportByID(
            initialValues.id,
            payload.voucherNo,
            payload.voucherDate,
            payload.slKT,
            payload.slCT,
            payload.slTC,
            payload.slKH,
            totalSL,
            payload.chefId
          );
        }

        if (res && (res.status === 200 || res.status === 204)) {
          onSubmit();
          form.resetFields();
          setMonthYear(dayjs());
          notification.success({
            message: "Thành công",
            description: "Lưu phiếu thành công.",
            placement: "topRight",
          });
        }
      } catch (error) {
        notification.error({
          message: "Thất bại",
          description: "Đã có lỗi xảy ra. Vui lòng thử lại",
          placement: "topRight",
        });
      } finally {
        setLoading(false);
      }
    });
  };

  const renderMobileCards = () => (
    <div style={{ display: "grid", gap: 8 }}>
      <Card size="small" title="Số chứng từ">
        <Form.Item name="voucherNo" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
      </Card>
      <Card size="small" title="Ngày chứng từ">
        <DatePicker
          picker="day"
          style={{ width: "100%" }}
          format="DD/MM/YYYY"
          value={monthYear}
          onChange={handleMonthChange}
        />
      </Card>
      <Card size="small" title="SL Ban KT-VT-CN">
        <Form.Item name="slKT">
          <InputNumber style={{ width: "100%" }} min={0} />
        </Form.Item>
      </Card>
      <Card size="small" title="SL Ban CT-HC">
        <Form.Item name="slCT">
          <InputNumber style={{ width: "100%" }} min={0} />
        </Form.Item>
      </Card>
      <Card size="small" title="SL Ban TC-KT">
        <Form.Item name="slTC">
          <InputNumber style={{ width: "100%" }} min={0} />
        </Form.Item>
      </Card>
      <Card size="small" title="SL Ban KH-KD">
        <Form.Item name="slKH">
          <InputNumber style={{ width: "100%" }} min={0} />
        </Form.Item>
      </Card>
      <Card size="small" title="Tổng số lượng">
        <InputNumber value={totalSL} style={{ width: "100%" }} readOnly />
      </Card>
      <Card size="small" title="Thông báo đến bếp">
        <Form.Item name="chefId" rules={[{ required: true }]}>
          <Select
            options={dataUser}
            placeholder="Chọn người nhận"
            showSearch
            optionFilterProp="label"
            disabled={!!initialValues}
          />
        </Form.Item>
      </Card>
    </div>
  );

  return (
    <Modal
      open={open}
      onCancel={() => {
        form.resetFields();
        setMonthYear(dayjs());
        onCancel();
      }}
      onOk={handleOk}
      okText={initialValues ? "Cập nhật" : "Thêm"}
      confirmLoading={loading}
      title={<span style={{ fontSize: 20, fontWeight: 600 }}>Báo cơm</span>}
      width={isMobile ? "100%" : 700}
    >
      <Form form={form} layout="vertical">
        {isMobile ? (
          renderMobileCards()
        ) : (
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="voucherNo"
                label="Số chứng từ"
                rules={[{ required: true, message: "Bắt buộc" }]}
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
              <Form.Item name="slKT" label="SL Ban KT-VT-CN">
                <InputNumber style={{ width: "100%" }} min={0} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="slCT" label="SL Ban CT-HC">
                <InputNumber style={{ width: "100%" }} min={0} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="slTC" label="SL Ban TC-KT">
                <InputNumber style={{ width: "100%" }} min={0} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="slKH" label="SL Ban KH-KD">
                <InputNumber style={{ width: "100%" }} min={0} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Tổng số lượng">
                <InputNumber
                  value={totalSL}
                  style={{ width: "100%" }}
                  readOnly
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="chefId"
                label="Thông báo đến bếp"
                rules={[{ required: true }]}
              >
                <Select
                  options={dataUser}
                  placeholder="Chọn người nhận"
                  showSearch
                  optionFilterProp="label"
                  disabled={!!initialValues}
                />
              </Form.Item>
            </Col>
          </Row>
        )}
      </Form>
    </Modal>
  );
};

export default RiceReportModal;
