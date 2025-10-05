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
} from "antd";
import { DeleteOutlined, PlusOutlined, TableOutlined } from "@ant-design/icons";
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
import { v4 as uuidv4 } from "uuid";
import {
  createShipRepairPlan,
  updateShipRepairPlan,
} from "../../../services/apiPlan/apiShipRepairPlan";

const approvalStatusOptions = [
  { value: "pending", label: "Chờ duyệt" },
  { value: "approved", label: "Đã duyệt" },
  { value: "rejected", label: "Từ chối" },
];

// Hook để theo dõi kích thước màn hình
const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: undefined,
    height: undefined,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowSize;
};

const ShipRepairPlanModal = ({ open, onCancel, onSubmit, initialValues }) => {
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
  const [tableDrawerVisible, setTableDrawerVisible] = useState(false);

  const { width } = useWindowSize();

  // Responsive breakpoints
  const isMobile = width <= 768;
  const isTablet = width > 768 && width <= 1024;
  const isDesktop = width > 1024;

  useEffect(() => {
    if (open) {
      const values = { ...initialValues };
      if (!initialValues) {
        getVoucherNo();
      }

      [
        "arrivalDate",
        "inspectionDate",
        "dockDate",
        "surveyDate",
        "launchDate",
        "departureDate",
        "handoverDate",
      ].forEach((key) => {
        if (values[key]) values[key] = dayjs(values[key]);
      });
      form.setFieldsValue(values || {});
      setIsEditApproval(!!initialValues?.type);
      // setMonthYear(dayjs(initialValues?.documentDate || dayjs()));
      // setReceivingDate(dayjs(initialValues?.receivingDate || dayjs()));
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

  const getVoucherNo = async () => {
    try {
      let res = await getDocumentNumber("KHTVSC");
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
            arrivalDate: values.arrivalDate?.format("YYYY-MM-DD") || null,
            inspectionDate: values.inspectionDate?.format("YYYY-MM-DD") || null,
            dockDate: values.dockDate?.format("YYYY-MM-DD") || null,
            surveyDate: values.surveyDate?.format("YYYY-MM-DD") || null,
            launchDate: values.launchDate?.format("YYYY-MM-DD") || null,
            departureDate: values.departureDate?.format("YYYY-MM-DD") || null,
            handoverDate: values.handoverDate?.format("YYYY-MM-DD") || null,
          };

          let id = uuidv4();

          let res = await createShipRepairPlan(
            id,
            payload.voucherNo,
            payload.shipName,
            payload.managementUnit,
            payload.arrivalDate,
            payload.inspectionDate,
            payload.dockDate,
            payload.surveyDate,
            payload.launchDate,
            payload.departureDate,
            payload.handoverDate,
            payload.note,
            user.data.userName,
            new Date().toISOString(),
            user.data.userName,
            new Date().toISOString()
          );
          if ((res && res.status === 200) || res.status === 201) {
            onSubmit(); // callback từ cha để reload
            //await handleAddApprovals(res.data.data, payload.documentNumber);
            const newFollowers = dataUser.find(
              (u) => u.value === user.data.userName
            );
            await addFollower(
              res.data.data,
              "ShipRepairPlan",
              payload.voucherNo,
              [
                {
                  userId: newFollowers.id, // bạn đã đặt id = user.apk trong getUser
                  userName: newFollowers.value, // chính là userName
                  fullName: user.data.fullName,
                },
              ]
            );
            form.resetFields();
            setMonthYear(dayjs());
            setTableData([]);
            notification.success({
              message: "Thành công",
              description: "Lưu phiếu thành công.",
              placement: isMobile ? "top" : "topRight",
            });
          }
        } catch (error) {
          if (error) {
            notification.error({
              message: "Thất bại",
              description: "Đã có lỗi xảy ra. Vui lòng thử lại",
              placement: isMobile ? "top" : "topRight",
            });
          }
        } finally {
          setLoading(false);
        }
      });
    } else {
      form.validateFields().then(async (values) => {
        try {
          setLoading(true);
          const payload = {
            ...values,
            arrivalDate: values.arrivalDate?.format("YYYY-MM-DD") || null,
            inspectionDate: values.inspectionDate?.format("YYYY-MM-DD") || null,
            dockDate: values.dockDate?.format("YYYY-MM-DD") || null,
            surveyDate: values.surveyDate?.format("YYYY-MM-DD") || null,
            launchDate: values.launchDate?.format("YYYY-MM-DD") || null,
            departureDate: values.departureDate?.format("YYYY-MM-DD") || null,
            handoverDate: values.handoverDate?.format("YYYY-MM-DD") || null,
          };
          let res = await updateShipRepairPlan(
            initialValues.id,
            payload.voucherNo,
            payload.shipName,
            payload.managementUnit,
            payload.arrivalDate,
            payload.inspectionDate,
            payload.dockDate,
            payload.surveyDate,
            payload.launchDate,
            payload.departureDate,
            payload.handoverDate,
            payload.note,
            initialValues.createdBy,
            initialValues.createdAt,
            user.data.userName,
            new Date().toISOString()
          );
          if ((res && res.status === 200) || res.status === 204) {
            onSubmit();
            form.resetFields();
            setMonthYear(dayjs());
            setTableData([]);
            notification.success({
              message: "Thành công",
              description: "Lưu phiếu thành công.",
              placement: isMobile ? "top" : "topRight",
            });
          }
        } catch (error) {
          if (error) {
            notification.error({
              message: "Thất bại",
              description: "Đã có lỗi xảy ra. Vui lòng thử lại",
              placement: isMobile ? "top" : "topRight",
            });
          }
        } finally {
          setLoading(false);
        }
      });
    }
  };

  // Determine modal width and layout
  const getModalWidth = () => {
    if (isMobile) return "95%";
    if (isTablet) return 800;
    return 1000;
  };

  const getColSpans = () => {
    if (isMobile) return { main: 24, half: 24 };
    if (isTablet) return { main: 24, half: 12 };
    return { main: 24, half: 12 };
  };

  const colSpans = getColSpans();

  return (
    <Modal
      title={
        <span style={{ fontSize: isMobile ? 18 : 25, fontWeight: 600 }}>
          {initialValues ? "Cập nhật kế hoạch" : "Thêm kế hoạch"}
        </span>
      }
      open={open}
      onCancel={() => {
        form.resetFields();
        setMonthYear(dayjs());
        setTableData([]);
        onCancel();
        setTableDrawerVisible(false);
      }}
      onOk={handleOk}
      okText={initialValues ? "Cập nhật" : "Thêm"}
      width={getModalWidth()}
      confirmLoading={loading}
      style={isMobile ? { top: 20 } : {}}
      bodyStyle={isMobile ? { padding: "16px" } : {}}
    >
      <Form form={form} layout="vertical" size={isMobile ? "small" : "default"}>
        <Row gutter={isMobile ? [8, 8] : [16, 16]}>
          <Col span={colSpans.half}>
            <Form.Item
              name="voucherNo"
              label="Số chứng từ"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={colSpans.half}>
            <Form.Item name="shipName" label="Tên phương tiện">
              <Input />
            </Form.Item>
          </Col>
          <Col span={colSpans.half}>
            <Form.Item name="managementUnit" label="Đơn vị qlsd">
              <Input />
            </Form.Item>
          </Col>
          <Col span={colSpans.half}>
            <Form.Item label="Ngày cập cảng" name="arrivalDate">
              <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={colSpans.half}>
            <Form.Item label="Chạy kiểm tra" name="inspectionDate">
              <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={colSpans.half}>
            <Form.Item label="Lên đà" name="dockDate">
              <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={colSpans.half}>
            <Form.Item label="Khảo sát" name="surveyDate">
              <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={colSpans.half}>
            <Form.Item label="Ngày hạ thuỷ" name="launchDate">
              <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={colSpans.half}>
            <Form.Item label="Tách bến" name="departureDate">
              <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={colSpans.half}>
            <Form.Item label="Bàn giao" name="handoverDate">
              <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={colSpans.half}>
            <Form.Item label="Ghi chú" name="note">
              <Input.TextArea rows={3} placeholder="Nhập ghi chú (nếu có)" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default ShipRepairPlanModal;
