import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  Row,
  Col,
  Typography,
  Button,
  Dropdown,
  Collapse,
  Table,
  Space,
  message,
  Modal,
  Grid,
} from "antd";
import {
  DownOutlined,
  EditOutlined,
  PaperClipOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import NoteSection from "../../../components/NoteSection ";
import AttachmentSection from "../../../components/AttachmentSection ";
import SystemSection from "../../../components/SystemSection";
import {
  deleteAssignmetSlip,
  getAssignmentSlipById,
} from "../../../services/apiPlan/apiAssignmentSlip";
import dayjs from "dayjs";
import { addAttachments } from "../../../services/apiAttachment";
import { useSelector } from "react-redux";
import { getApprovalsByRef } from "../../../services/apiApprovals";
import { getApprovalSetting } from "../../../services/apiApproveSetting";
import RepairPlanModal from "./RepairPlanModal";
import {
  deleteRepairPlanByID,
  getByIdRepairPlan,
} from "../../../services/apiPlan/apiRepairPlan";

const { Title } = Typography;
const { Panel } = Collapse;
const { useBreakpoint } = Grid;

// Gantt Chart Component
const GanttChart = ({ data, isMobile }) => {
  const [timelineRange, setTimelineRange] = useState({
    start: null,
    end: null,
  });
  const [timelineData, setTimelineData] = useState([]);

  useEffect(() => {
    if (data?.details) {
      processTimelineData();
    }
  }, [data]);

  const processTimelineData = () => {
    const details = data.details || [];
    let minDate = null;
    let maxDate = null;

    // Tìm khoảng thời gian tổng thể
    details.forEach((item) => {
      if (item.beginTime) {
        const start = dayjs(item.beginTime);
        if (!minDate || start.isBefore(minDate)) {
          minDate = start;
        }
      }
      if (item.endTime) {
        const end = dayjs(item.endTime);
        if (!maxDate || end.isAfter(maxDate)) {
          maxDate = end;
        }
      }
    });

    // Nếu không có ngày, tạo một khoảng thời gian mặc định
    if (!minDate || !maxDate) {
      minDate = dayjs().startOf("month");
      maxDate = dayjs().endOf("month");
    }

    // Thêm buffer 1 tuần ở mỗi đầu
    minDate = minDate.subtract(1, "week");
    maxDate = maxDate.add(1, "week");

    setTimelineRange({ start: minDate, end: maxDate });
    setTimelineData(details);
  };

  const generateTimelineColumns = () => {
    if (!timelineRange.start || !timelineRange.end) {
      console.log("No timeline range available");
      return [];
    }

    const columns = [];
    const startDate = timelineRange.start.startOf("day");
    const endDate = timelineRange.end.startOf("day");
    const totalDays = endDate.diff(startDate, "day");

    console.log("Timeline Debug Info:", {
      start: startDate.format("YYYY-MM-DD"),
      end: endDate.format("YYYY-MM-DD"),
      totalDays: totalDays,
    });

    // Giới hạn số cột để tránh quá tải
    const maxColumns = isMobile ? 30 : 45;
    let step = 1;

    if (totalDays > maxColumns) {
      step = Math.ceil(totalDays / maxColumns);
    }

    // Tạo các cột timeline - sử dụng for loop để tránh reference issue
    for (let i = 0; i < totalDays && columns.length < maxColumns; i += step) {
      const currentDate = startDate.add(i, "day");

      const dateInfo = {
        date: currentDate,
        day: currentDate.date(),
        month: currentDate.month() + 1,
        year: currentDate.year(),
        isWeekend: currentDate.day() === 0 || currentDate.day() === 6,
        step: step,
      };

      columns.push(dateInfo);

      console.log(
        `Column ${columns.length - 1}: ${currentDate.format(
          "DD/MM/YYYY"
        )} (day: ${dateInfo.day})`
      );
    }

    console.log(`Final columns count: ${columns.length}, step: ${step}`);
    return columns;
  };

  const calculateBarPosition = (startDate, endDate) => {
    if (!startDate || !endDate || !timelineRange.start || !timelineRange.end) {
      return { left: 0, width: 0 };
    }

    try {
      const taskStart = dayjs(startDate);
      const taskEnd = dayjs(endDate);
      const timelineStart = timelineRange.start;
      const timelineEnd = timelineRange.end;

      console.log("Bar Position Debug:", {
        taskStart: taskStart.format("DD/MM/YYYY"),
        taskEnd: taskEnd.format("DD/MM/YYYY"),
        timelineStart: timelineStart.format("DD/MM/YYYY"),
        timelineEnd: timelineEnd.format("DD/MM/YYYY"),
      });

      // Kiểm tra task có nằm trong timeline không
      if (taskEnd.isBefore(timelineStart) || taskStart.isAfter(timelineEnd)) {
        console.log("Task outside timeline range");
        return { left: 0, width: 0 };
      }

      // Tính toán theo số ngày từ đầu timeline
      const totalTimelineDays = timelineEnd.diff(timelineStart, "day");
      const startOffsetDays = taskStart.diff(timelineStart, "day");
      const taskDurationDays = taskEnd.diff(taskStart, "day") + 1;

      // Tính % dựa trên vị trí thực tế trong timeline
      const leftPercent = Math.max(
        0,
        (startOffsetDays / totalTimelineDays) * 100
      );
      const widthPercent = Math.max(
        2,
        (taskDurationDays / totalTimelineDays) * 100
      );

      console.log("Bar calculations:", {
        totalTimelineDays,
        startOffsetDays,
        taskDurationDays,
        leftPercent: leftPercent.toFixed(1) + "%",
        widthPercent: widthPercent.toFixed(1) + "%",
      });

      return {
        left: leftPercent,
        width: Math.min(widthPercent, 100 - leftPercent), // Không vượt quá 100%
      };
    } catch (error) {
      console.error("Error calculating bar position:", error);
      return { left: 0, width: 0 };
    }
  };

  const timelineColumns = generateTimelineColumns();

  const getGanttColumns = () => {
    const baseColumns = [
      {
        title: "STT",
        dataIndex: "stt",
        width: isMobile ? 50 : 60,
        fixed: "left",
        align: "center",
      },
      {
        title: "Nội dung công việc",
        dataIndex: "content",
        width: isMobile ? 120 : 200,
        fixed: "left",
        ellipsis: true,
      },
      {
        title: "Thời gian bắt đầu",
        dataIndex: "beginTime",
        width: isMobile ? 100 : 120,
        render: (date) => (date ? dayjs(date).format("DD/MM/YYYY") : "---"),
      },
      {
        title: "Thời gian kết thúc",
        dataIndex: "endTime",
        width: isMobile ? 100 : 120,
        render: (date) => (date ? dayjs(date).format("DD/MM/YYYY") : "---"),
      },
      {
        title: "Bộ phận thực hiện",
        dataIndex: "department",
        width: isMobile ? 100 : 150,
        ellipsis: true,
      },
      {
        title: "Tổng ngày",
        dataIndex: "totalDays",
        width: isMobile ? 80 : 100,
        align: "center",
        render: (_, record) => {
          if (record.startDate && record.endDate) {
            const days =
              dayjs(record.endDate).diff(dayjs(record.startDate), "day") + 1;
            return days;
          }
          return record.workDay || "---";
        },
      },
      {
        title: "Trạng thái",
        dataIndex: "status",
        width: isMobile ? 90 : 120,
        align: "center",
        render: (status) => {
          const statusConfig = {
            completed: { color: "#52c41a", text: "Hoàn thành" },
            in_progress: { color: "#1890ff", text: "Đang thực hiện" },
            pending: { color: "#faad14", text: "Chờ thực hiện" },
            overdue: { color: "#ff4d4f", text: "Trễ hạn" },
          };

          const config = statusConfig[status] || {
            color: "#d9d9d9",
            text: "Chưa xác định",
          };

          return (
            <div
              style={{
                backgroundColor: config.color,
                color: "white",
                padding: "2px 8px",
                borderRadius: "12px",
                fontSize: isMobile ? "10px" : "12px",
                fontWeight: "bold",
                textAlign: "center",
              }}
            >
              {config.text}
            </div>
          );
        },
      },
      {
        title: "Ghi chú",
        dataIndex: "note",
        width: isMobile ? 100 : 150,
        ellipsis: true,
        render: (note) => note || "---",
      },
    ];

    // Thêm cột timeline
    const timelineColumn = {
      title: (
        <div style={{ textAlign: "center", minWidth: isMobile ? 300 : 600 }}>
          <div style={{ fontWeight: "bold", marginBottom: 8 }}>
            Biểu đồ Gantt
          </div>
        </div>
      ),
      dataIndex: "timeline",
      width: isMobile ? 300 : 600,
      render: (_, record) => {
        const containerWidth = isMobile ? 300 : 600;
        const { left, width } = calculateBarPosition(
          record.beginTime,
          record.endTime
        );

        return (
          <div
            style={{
              position: "relative",
              height: 30,
              minWidth: containerWidth,
              backgroundColor: "#f9f9f9",
              border: "1px solid #f0f0f0",
            }}
          >
            {/* Background grid và date markers */}
            {timelineColumns.length <= 45 &&
              timelineColumns.map((col, index) => {
                const colLeftPercent = (index / timelineColumns.length) * 100;
                const colWidthPercent = 100 / timelineColumns.length;

                return (
                  <div
                    key={`grid-${index}`}
                    style={{
                      position: "absolute",
                      left: `${colLeftPercent}%`,
                      width: `${colWidthPercent}%`,
                      height: "100%",
                      borderRight:
                        index % 5 === 0
                          ? "2px solid #d9d9d9"
                          : "1px solid #f5f5f5",
                      backgroundColor: col.isWeekend
                        ? "#fafafa"
                        : "transparent",
                    }}
                  >
                    {/* Debug: Hiển thị ngày ở giữa mỗi cột */}
                    <div
                      style={{
                        position: "absolute",
                        bottom: "-15px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        fontSize: "8px",
                        color: "#999",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {col.day}
                    </div>
                  </div>
                );
              })}

            {/* Progress bar - sử dụng % thay vì px */}
            {record.beginTime && record.endTime && width > 0 && (
              <div
                style={{
                  position: "absolute",
                  left: `${left}%`,
                  width: `${width}%`,
                  height: 20,
                  top: 5,
                  backgroundColor: (() => {
                    const colors = {
                      completed: "#52c41a",
                      in_progress: "#1890ff",
                      pending: "#faad14",
                      overdue: "#ff4d4f",
                    };
                    return colors[record.status] || "#1890ff";
                  })(),
                  borderRadius: 4,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: isMobile ? "10px" : "12px",
                  fontWeight: "bold",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  overflow: "hidden",
                  zIndex: 10,
                }}
              >
                {/* {width > 15 &&
                record.content &&
                record.content.length > (isMobile ? 5 : 10)
                  ? `${record.content.substring(0, isMobile ? 5 : 10)}...`
                  : width > 8
                  ? record.content
                  : ""} */}
              </div>
            )}
          </div>
        );
      },
    };

    return [...baseColumns, timelineColumn];
  };

  return (
    <div style={{ overflowX: "auto" }}>
      <Table
        columns={getGanttColumns()}
        dataSource={timelineData?.map((item, index) => ({
          ...item,
          stt: index + 1,
          key: index,
          // Thêm các trường mặc định nếu không có
          startDate: item.beginTime || dayjs().format("YYYY-MM-DD"),
          endDate:
            item.endTime ||
            dayjs()
              .add(item.workDay || 1, "day")
              .format("YYYY-MM-DD"),
          department: item.department || "Chưa xác định",
        }))}
        scroll={{
          x: isMobile ? 1000 : 1400,
          y: isMobile ? 400 : undefined,
        }}
        size="small"
        bordered
        pagination={false}
        components={{
          header: {
            cell: (props) => (
              <th
                {...props}
                style={{
                  backgroundColor: "#e6f4fb",
                  color: "#0700ad",
                  fontWeight: "600",
                  fontSize: isMobile ? "12px" : "14px",
                }}
              />
            ),
          },
        }}
        style={{
          fontSize: isMobile ? "12px" : "14px",
        }}
      />
    </div>
  );
};

// Dữ liệu mẫu cho test
const mockData = {
  id: "1",
  documentNumber: "PGV-2024-001",
  productName: "Máy gia công CNC",
  documentDate: "2024-01-15",
  department: "Phòng Kỹ thuật",
  note: "Dự án sửa chữa máy móc quan trọng",
  createdBy: "Nguyễn Văn A",
  createdAt: "2024-01-10T08:00:00Z",
  updatedBy: "Trần Thị B",
  updatedAt: "2024-01-12T10:30:00Z",
  details: [
    {
      id: 1,
      content: "Thiết kế bản vẽ kỹ thuật",
      category: "Thiết kế",
      startDate: "2024-01-15",
      endDate: "2024-01-20",
      department: "Phòng Thiết kế",
      unit: "Bộ",
      quantity: 1,
      workDay: 6,
      status: "completed",
      note: "Ưu tiên cao",
    },
    {
      id: 2,
      content: "Mua sắm vật tư nguyên liệu",
      category: "Mua sắm",
      startDate: "2024-01-18",
      endDate: "2024-01-25",
      department: "Phòng Mua hàng",
      unit: "Lô",
      quantity: 1,
      workDay: 8,
      status: "in_progress",
      note: "Cần phê duyệt trước",
    },
    {
      id: 3,
      content: "Gia công chi tiết máy",
      category: "Sản xuất",
      startDate: "2024-01-22",
      endDate: "2024-02-05",
      department: "Phân xưởng 1",
      unit: "Cái",
      quantity: 50,
      workDay: 15,
      status: "pending",
      note: "Yêu cầu chất lượng cao",
    },
    {
      id: 4,
      content: "Lắp ráp sản phẩm",
      category: "Lắp ráp",
      startDate: "2024-02-01",
      endDate: "2024-02-10",
      department: "Phân xưởng 2",
      unit: "Bộ",
      quantity: 10,
      workDay: 10,
      status: "pending",
      note: "Theo quy trình chuẩn",
    },
    {
      id: 5,
      content: "Kiểm tra chất lượng",
      category: "Kiểm tra",
      startDate: "2024-02-08",
      endDate: "2024-02-12",
      department: "Phòng QC",
      unit: "Lần",
      quantity: 1,
      workDay: 5,
      status: "pending",
      note: "Kiểm tra toàn diện",
    },
    {
      id: 6,
      content: "Đóng gói và xuất kho",
      category: "Xuất kho",
      startDate: "2024-02-10",
      endDate: "2024-02-15",
      department: "Phòng Kho",
      unit: "Kiện",
      quantity: 10,
      workDay: 6,
      status: "overdue",
      note: "Đóng gói cẩn thận",
    },
  ],
};

const RepairPlanDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const type = queryParams.get("type");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingData, setEditingData] = useState(null);
  const [data, setData] = useState();
  const [approvals, setApproval] = useState();
  const [approvalNumber, setApprovalNumber] = useState();
  const [refreshFlag, setRefreshFlag] = useState(0);
  const [useMockData, setUseMockData] = useState(false); // Toggle để dùng dữ liệu mẫu
  const user = useSelector((state) => state.auth.login.currentUser);
  const navigator = useNavigate();
  const fileInputRef = useRef(null);
  const screens = useBreakpoint();

  // Determine if mobile/tablet view
  const isMobile = !screens.md;
  const isTablet = screens.md && !screens.lg;

  useEffect(() => {
    // Nếu muốn test với dữ liệu mẫu, uncomment dòng dưới
    // setUseMockData(true);

    if (useMockData) {
      // Sử dụng dữ liệu mẫu cho test
      setData(mockData);
    } else {
      // Sử dụng API thật
      getData();
    }
  }, [useMockData]);
  const getData = async () => {
    try {
      let res = await getByIdRepairPlan(id);
      if (res && res.status === 200) {
        setData(res.data.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const isEditDisabled = approvals?.some(
    (a) => a.level === approvalNumber && a.status === "approved" && !type
  );

  const items = [
    {
      key: "edit",
      label: (
        <span>
          <EditOutlined /> Sửa
        </span>
      ),
      disabled: isEditDisabled,
    },
    {
      key: "attach",
      label: (
        <span>
          <PaperClipOutlined /> Đính kèm
        </span>
      ),
    },
    {
      key: "delete",
      label: (
        <span style={{ color: "red" }}>
          <DeleteOutlined /> Xóa
        </span>
      ),
      disabled: isEditDisabled,
    },
  ];

  const handleMenuClick = async ({ key }) => {
    if (key === "edit") {
      if (type) {
        setEditingData({
          ...data,
          type: type,
        });
      } else {
        setEditingData(data);
      }
      setIsModalOpen(true);
    } else if (key === "attach") {
      fileInputRef.current?.click();
    } else if (key === "delete") {
      try {
        let res = await deleteRepairPlanByID(data.id);
        if ((res && res.status === 200) || res.status === 204) {
          Modal.success({
            title: "Xóa thành công",
            content: `Đã xóa thành công phiếu`,
          });
          navigator("/pl/ke-hoach/ke-hoach-sua-chua");
        }
      } catch (error) {
        Modal.error({
          title: "Xóa thất bại",
          content: `Đã có lỗi xảy ra. Vui lòng thử lại sau`,
        });
      }
    }
  };

  // Responsive info rendering
  const renderInfoSection = () => {
    if (isMobile) {
      return (
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <div>
            <strong>Số chứng từ:</strong> {data.voucherNo || ""}
          </div>
          <div>
            <strong>Tên sản phẩm:</strong> {data.productName || ""}
          </div>
          <div>
            <strong>Ngày chứng từ:</strong>{" "}
            {data.voucherDate
              ? new Date(data.voucherDate).toLocaleDateString("vi-VN")
              : "---"}
          </div>
          <div>
            <strong>Đơn bị quản lý:</strong> {data.managementUnit || ""}
          </div>
          <div>
            <strong>Ghi chú:</strong> {data.note || ""}
          </div>
        </Space>
      );
    }

    return (
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={24} md={12} lg={12} xl={12}>
          <Space direction="vertical" size="small" style={{ width: "100%" }}>
            <div>
              <strong>Số chứng từ:</strong> {data.voucherNo || ""}
            </div>
            <div>
              <strong>Tên sản phẩm:</strong> {data.productName || ""}
            </div>
            <div>
              <strong>Ngày chứng từ:</strong>{" "}
              {data.voucherDate
                ? new Date(data.voucherDate).toLocaleDateString("vi-VN")
                : "---"}
            </div>
          </Space>
        </Col>
        <Col xs={24} sm={24} md={12} lg={12} xl={12}>
          <Space direction="vertical" size="small" style={{ width: "100%" }}>
            <div>
              <strong>Đơn bị quản lý:</strong> {data.managementUnit || ""}
            </div>
            <div>
              <strong>Ghi chú:</strong> {data.note || ""}
            </div>
          </Space>
        </Col>
      </Row>
    );
  };

  return (
    <div
      style={{
        padding: isMobile ? 8 : 16,
        minHeight: "100vh",
      }}
    >
      <Row justify="space-between" align="middle" gutter={[16, 16]}>
        <Col xs={24} sm={16} md={18} lg={20}>
          <Title
            level={isMobile ? 4 : 3}
            style={{
              margin: 0,
              fontSize: isMobile ? "18px" : undefined,
            }}
          >
            Xem chi tiết tiến độ sửa chữa
          </Title>
        </Col>
        <Col xs={24} sm={8} md={6} lg={4}>
          <Space>
            <Dropdown
              menu={{ items, onClick: handleMenuClick }}
              trigger={["click"]}
              placement={isMobile ? "bottomRight" : "bottom"}
            >
              <Button
                style={{ width: isMobile ? "100%" : "auto" }}
                size={isMobile ? "middle" : "middle"}
              >
                Hoạt động <DownOutlined />
              </Button>
            </Dropdown>
          </Space>
        </Col>
      </Row>

      <Collapse
        defaultActiveKey={["1"]}
        style={{ marginTop: 16 }}
        expandIconPosition="end"
        size={isMobile ? "small" : "middle"}
      >
        <Panel header="Thông tin phiếu giao việc" key="1">
          {data && <>{renderInfoSection()}</>}
        </Panel>

        <Panel header="Biểu đồ Gantt - Nội dung phiếu giao việc" key="2">
          {data && <GanttChart data={data} isMobile={isMobile} />}
        </Panel>

        <Panel header="Đính kèm" key="3">
          <AttachmentSection
            refId={data ? data.id : ""}
            refType={"RepairPlan"}
            refreshTrigger={refreshFlag}
          />
        </Panel>

        <Panel header="Ghi chú" key="4">
          <NoteSection
            refId={data ? data.id : ""}
            refType={"RepairPlan"}
            voucherNo={data ? data.voucherNo : ""}
          />
        </Panel>

        <Panel header="Hệ thống" key="5">
          {data && (
            <SystemSection
              systemInfo={{
                createdBy: `${data.createdBy}`,
                createdAt: data.createdAt
                  ? dayjs(data.createdAt).format("DD/MM/YYYY HH:mm:ss")
                  : "",
                updatedBy: `${data.updatedBy}`,
                updatedAt: data.updatedAt
                  ? dayjs(data.updatedAt).format("DD/MM/YYYY HH:mm:ss")
                  : "",
              }}
              refId={data.id}
              refType={"RepairPlan"}
              voucherNo={data.voucherNo}
            />
          )}
        </Panel>
      </Collapse>

      <RepairPlanModal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onSubmit={() => {
          getData();
          setIsModalOpen(false);
        }}
        initialValues={editingData}
      />

      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        multiple
        onChange={async (e) => {
          const files = e.target.files;
          if (!files.length || !data?.id) return;

          for (const file of files) {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("refId", data.id);
            formData.append("refType", "RepairPlan");

            try {
              const res = await addAttachments(formData, user.data.token);
              message.success(`Đã upload file: ${file.name}`);
            } catch (err) {
              console.error(err);
              message.error(`Upload thất bại: ${file.name}`);
            }
          }

          e.target.value = "";
          setRefreshFlag((prev) => prev + 1);
        }}
      />
    </div>
  );
};

export default RepairPlanDetail;
