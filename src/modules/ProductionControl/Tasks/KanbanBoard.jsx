import { useEffect, useRef, useState } from "react";
import {
  Button,
  Input,
  Modal,
  notification,
  Form,
  Select,
  DatePicker,
  Avatar,
  Tag,
  Typography,
  Space,
  Tooltip,
  Badge,
  Dropdown,
  Popconfirm,
  Card,
  Spin,
  Skeleton,
  Progress,
  Drawer,
  message,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  ClockCircleOutlined,
  UserOutlined,
  ExclamationCircleOutlined,
  MoreOutlined,
  EditOutlined,
  FlagOutlined,
  TeamOutlined,
  SettingOutlined,
  LoadingOutlined,
  SyncOutlined,
  CommentOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import {
  getBoard,
  createBoard,
  deleteBoard as deleteBoardAPI,
  getTask,
  getTaskByID,
  deleteTask as deleteTaskAPI,
  createTask,
  updateStatusKB,
} from "../../../services/apiProductControl/apiKanban";
import { getAllUser } from "../../../services/apiAuth";
import { useSelector } from "react-redux";
import { jwtDecode } from "jwt-decode";
import NoteSection from "../../../components/NoteSection ";
import AttachmentSection from "../../../components/AttachmentSection ";
import { addAttachments } from "../../../services/apiAttachment";

const statusOptions = [
  { value: "pending", label: "🕓 Chưa thực hiện", color: "default" },
  { value: "in-progress", label: "⚙️ Đang làm", color: "blue" },
  { value: "review", label: "👀 Chờ review", color: "orange" },
  { value: "done", label: "✅ Hoàn thành", color: "green" },
  { value: "paused", label: "⏸️ Tạm ngưng", color: "red" },
];

const priorityOptions = [
  { value: "low", label: "Thấp", color: "green" },
  { value: "medium", label: "Trung bình", color: "orange" },
  { value: "high", label: "Cao", color: "red" },
  { value: "urgent", label: "Khẩn cấp", color: "purple" },
];

// Loading Skeleton Components
const CardSkeleton = () => (
  <div
    style={{
      marginBottom: 8,
      padding: 12,
      backgroundColor: "#fff",
      borderRadius: 8,
      boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
      border: "1px solid #d9d9d9",
    }}
  >
    <Skeleton active paragraph={{ rows: 2 }} title={{ width: "80%" }} />
    <div
      style={{
        marginTop: 12,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Skeleton.Avatar size="small" />
      <Skeleton.Button size="small" style={{ width: 80 }} />
    </div>
  </div>
);

const ColumnSkeleton = () => (
  <Card
    style={{
      width: 380,
      marginRight: 16,
      backgroundColor: "#fafafa",
      maxHeight: "80vh",
    }}
    title={<Skeleton.Input style={{ width: 200 }} />}
    extra={<Skeleton.Button size="small" />}
  >
    <div style={{ minHeight: 100 }}>
      {[1, 2, 3].map((i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  </Card>
);

const HeaderSkeleton = () => (
  <div
    style={{
      backgroundColor: "white",
      padding: 20,
      borderRadius: 12,
      marginBottom: 24,
    }}
  >
    <Skeleton active paragraph={{ rows: 2 }} />
    <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
      {[1, 2, 3, 4].map((i) => (
        <Skeleton.Button key={i} size="small" style={{ width: 100 }} />
      ))}
    </div>
  </div>
);

// Enhanced KanbanCard Component with Loading States
const EnhancedKanbanCard = ({
  task,
  onDelete,
  onEdit,
  onComment,
  onStatusChange,
  users,
  isUpdating = false,
  isDeleting = false,
}) => {
  const isOverdue =
    dayjs().isAfter(dayjs(task.deadline)) && task.status !== "done";
  const isDueSoon =
    dayjs().add(1, "day").isAfter(dayjs(task.deadline)) &&
    !isOverdue &&
    task.status !== "done";

  const cardActions = [
    {
      key: "edit",
      label: "Chỉnh sửa",
      icon: <EditOutlined />,
      disabled: isUpdating || isDeleting,
    },
    {
      key: "comment",
      label: "Nhận xét, đính kèm",
      icon: <CommentOutlined />,
      disabled: isUpdating || isDeleting,
    },
    {
      key: "delete",
      label: "Xóa",
      icon: isDeleting ? <LoadingOutlined /> : <DeleteOutlined />,
      danger: true,
      disabled: isUpdating || isDeleting,
    },
  ];

  const handleMenuClick = ({ key }) => {
    if (key === "edit" && !isUpdating && !isDeleting) {
      onEdit && onEdit(task);
    } else if (key === "comment" && !isUpdating && !isDeleting) {
      onComment && onComment(task);
    } else if (key === "delete" && !isUpdating && !isDeleting) {
      onDelete && onDelete(task.id);
    }
  };

  const handleStatusChange = (newStatus) => {
    if (!isUpdating && !isDeleting) {
      onStatusChange && onStatusChange(task.id, newStatus);
    }
  };

  const assigneeInfo = task.assigneeUserId
    ? users.find(
        (u) => u.id === task.assigneeUserId || u.apk === task.assigneeUserId
      )
    : null;

  return (
    <div
      style={{
        marginBottom: 8,
        padding: 12,
        backgroundColor: "#fff",
        borderRadius: 8,
        boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
        border: isOverdue
          ? "2px solid #ff4d4f"
          : isDueSoon
          ? "2px solid #faad14"
          : "1px solid #d9d9d9",
        cursor: isUpdating || isDeleting ? "not-allowed" : "grab",
        transition: "all 0.2s ease",
        opacity: isUpdating || isDeleting ? 0.7 : 1,
        position: "relative",
      }}
      onMouseEnter={(e) => {
        if (!isUpdating && !isDeleting) {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
        }
      }}
      onMouseLeave={(e) => {
        if (!isUpdating && !isDeleting) {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,0.05)";
        }
      }}
    >
      {/* Loading Overlay */}
      {(isUpdating || isDeleting) && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 8,
            zIndex: 10,
          }}
        >
          <Spin
            indicator={<LoadingOutlined style={{ fontSize: 24 }} />}
            tip={isDeleting ? "Đang xóa..." : "Đang cập nhật..."}
          />
        </div>
      )}

      <Space direction="vertical" style={{ width: "100%" }} size="small">
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <Typography.Text strong style={{ flex: 1 }}>
            {task.title}
          </Typography.Text>
          <Dropdown
            menu={{ items: cardActions, onClick: handleMenuClick }}
            trigger={["click"]}
            disabled={isUpdating || isDeleting}
          >
            <Button
              type="text"
              icon={isUpdating ? <SyncOutlined spin /> : <MoreOutlined />}
              size="small"
              disabled={isUpdating || isDeleting}
            />
          </Dropdown>
        </div>

        {/* Description */}
        {task.description && (
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {task.description}
          </Typography.Text>
        )}

        {/* Priority */}
        <div>
          <Tag
            color={
              priorityOptions.find(
                (p) => p.value === (task.priority || "medium")
              )?.color
            }
            icon={<FlagOutlined />}
            size="small"
          >
            {
              priorityOptions.find(
                (p) => p.value === (task.priority || "medium")
              )?.label
            }
          </Tag>
        </div>

        {/* Status */}
        <Select
          size="small"
          value={task.status || "pending"}
          onChange={handleStatusChange}
          style={{ width: "100%" }}
          disabled={isUpdating || isDeleting}
          loading={isUpdating}
          suffixIcon={isUpdating ? <LoadingOutlined /> : undefined}
        >
          {statusOptions.map((status) => (
            <Select.Option key={status.value} value={status.value}>
              <Tag color={status.color}>{status.label}</Tag>
            </Select.Option>
          ))}
        </Select>

        {/* Labels */}
        {task.labels &&
          Array.isArray(task.labels) &&
          task.labels.length > 0 && (
            <div>
              {task.labels.map((label, index) => (
                <Tag key={index} size="small" style={{ marginBottom: 4 }}>
                  {label}
                </Tag>
              ))}
            </div>
          )}

        {/* Deadline */}
        <div
          style={{
            fontSize: 12,
            color: isOverdue ? "#ff4d4f" : isDueSoon ? "#faad14" : "#888",
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <ClockCircleOutlined />
          {dayjs(task.deadline).format("DD/MM/YYYY")}
          {isOverdue && (
            <ExclamationCircleOutlined style={{ color: "#ff4d4f" }} />
          )}
          {isDueSoon && !isOverdue && (
            <ExclamationCircleOutlined style={{ color: "#faad14" }} />
          )}
        </div>

        {/* Assignee */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Tooltip
              title={`Người thực hiện: ${task.assigneeUserName || "Chưa gán"}`}
            >
              <Badge dot status={task.assigneeUserName ? "success" : "default"}>
                <Avatar
                  size={24}
                  style={{
                    backgroundColor: task.assigneeUserName
                      ? "#1677ff"
                      : "#d9d9d9",
                  }}
                  icon={<UserOutlined />}
                >
                  {task.assigneeUserName?.charAt(0) || "?"}
                </Avatar>
              </Badge>
            </Tooltip>
            <Typography.Text style={{ fontSize: 11 }}>
              {task.assigneeUserName || "Chưa gán"}
            </Typography.Text>
          </div>
        </div>
      </Space>
    </div>
  );
};

// Enhanced KanbanColumn Component with Loading States
const EnhancedKanbanColumn = ({
  column,
  onAddCard,
  onDeleteTask,
  onDeleteBoard,
  onEditColumn,
  users,
  loadingStates = {},
  isDeleting = false,
  onComment,
}) => {
  const tasks = column.tasks || [];
  const overdueCount = tasks.filter(
    (task) => dayjs().isAfter(dayjs(task.deadline)) && task.status !== "done"
  ).length;

  const columnAssignees = column.assignees || [];
  const assigneeNames = columnAssignees
    .map((id) => {
      const user = users.find((u) => u.id === id || u.apk === id);
      return user?.name || user?.fullName || user?.username;
    })
    .filter(Boolean);

  return (
    <Card
      title={
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 4,
            }}
          >
            <Typography.Title level={5} style={{ margin: 0 }}>
              {column.name}
            </Typography.Title>
            <Badge
              count={tasks.length}
              style={{ backgroundColor: "#1677ff" }}
            />
            {overdueCount > 0 && (
              <Badge
                count={overdueCount}
                style={{ backgroundColor: "#ff4d4f" }}
              />
            )}
          </div>
          {assigneeNames.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <TeamOutlined style={{ fontSize: 12, color: "#666" }} />
              <Typography.Text style={{ fontSize: 12, color: "#666" }}>
                {assigneeNames.join(", ")}
              </Typography.Text>
            </div>
          )}
        </div>
      }
      style={{
        width: 380,
        marginRight: 16,
        backgroundColor: "#fafafa",
        maxHeight: "80vh",
        overflow: "hidden",
        opacity: isDeleting ? 0.5 : 1,
        transition: "opacity 0.3s ease",
      }}
      extra={
        <div style={{ display: "flex", gap: 4 }}>
          <Button
            type="link"
            onClick={onAddCard}
            size="small"
            disabled={isDeleting}
            loading={loadingStates.addingTask}
          >
            + Thêm
          </Button>
          <Button
            type="text"
            icon={<SettingOutlined />}
            onClick={() => onEditColumn(column)}
            size="small"
            title="Chỉnh sửa cột"
            disabled={isDeleting}
          />
          <Popconfirm
            title="Xóa cột này?"
            description="Tất cả task trong cột sẽ bị xóa"
            onConfirm={onDeleteBoard}
            okText="Xóa"
            cancelText="Hủy"
            disabled={isDeleting}
          >
            <Button
              type="text"
              icon={isDeleting ? <LoadingOutlined /> : <DeleteOutlined />}
              danger
              size="small"
              disabled={isDeleting}
              loading={isDeleting}
            />
          </Popconfirm>
        </div>
      }
      bodyStyle={{
        padding: 8,
        maxHeight: "calc(80vh - 120px)",
        overflowY: "auto",
      }}
    >
      {isDeleting && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 8,
            zIndex: 10,
          }}
        >
          <Spin tip="Đang xóa cột..." />
        </div>
      )}

      <div
        style={{
          minHeight: 100,
          borderRadius: 8,
          padding: 4,
        }}
      >
        {tasks.map((task) => (
          <EnhancedKanbanCard
            key={task.id}
            task={task}
            users={users}
            isUpdating={loadingStates.updatingTasks?.[task.id]}
            isDeleting={loadingStates.deletingTasks?.[task.id]}
            onDelete={(taskId) => {
              onDeleteTask("DELETE_TASK", taskId);
            }}
            onEdit={(task) => {
              onDeleteTask("EDIT_TASK", task);
            }}
            onStatusChange={(taskId, status) => {
              const currentTask = tasks.find((t) => t.id === taskId);
              onDeleteTask("UPDATE_STATUS", {
                taskId,
                status,
                task: currentTask,
              });
            }}
            onComment={onComment}
          />
        ))}
      </div>
    </Card>
  );
};

// Enhanced TaskModal Component with Loading
const EnhancedTaskModal = ({
  open,
  onCancel,
  onCreate,
  editingTask,
  columnAssignees = [],
  users,
  isSubmitting = false,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      if (editingTask) {
        form.setFieldsValue({
          title: editingTask.title,
          description: editingTask.description,
          priority: editingTask.priority || "medium",
          status: editingTask.status || "pending",
          assignee: editingTask.assigneeUserId,
          deadline: editingTask.deadline ? dayjs(editingTask.deadline) : null,
          labels: editingTask.labels || [],
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          priority: "medium",
          status: "pending",
          deadline: dayjs().add(7, "days"),
        });
        if (columnAssignees.length > 0) {
          form.setFieldValue("assignee", columnAssignees[0]);
        }
      }
    }
  }, [open, editingTask, columnAssignees, form]);

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      const selectedUser = users.find(
        (u) => (u.id || u.apk) === values.assignee
      );
      const taskData = {
        id: editingTask?.id,
        title: values.title,
        description: values.description || "",
        deadline:
          values.deadline?.format("YYYY-MM-DD") ||
          dayjs().add(7, "days").format("YYYY-MM-DD"),
        priority: values.priority || "medium",
        status: values.status || "pending",
        assigneeUserId: values.assignee,
        assigneeUserName:
          selectedUser?.name ||
          selectedUser?.fullName ||
          selectedUser?.username ||
          "",
        labels: values.labels || [],
      };
      onCreate(taskData);
      form.resetFields();
    });
  };

  const availableUsers =
    columnAssignees.length > 0
      ? users.filter((user) => columnAssignees.includes(user.id || user.apk))
      : users;

  return (
    <Modal
      title={editingTask ? "Chỉnh sửa Task" : "Tạo Task Mới"}
      open={open}
      onCancel={() => {
        if (!isSubmitting) {
          form.resetFields();
          onCancel();
        }
      }}
      onOk={handleSubmit}
      width={600}
      okText={editingTask ? "Cập nhật" : "Tạo"}
      cancelText="Hủy"
      confirmLoading={isSubmitting}
      maskClosable={!isSubmitting}
      closable={!isSubmitting}
    >
      <Spin spinning={isSubmitting} tip="Đang xử lý...">
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label="Tiêu đề"
            rules={[{ required: true, message: "Vui lòng nhập tiêu đề" }]}
          >
            <Input placeholder="Nhập tiêu đề task" disabled={isSubmitting} />
          </Form.Item>

          <Form.Item name="description" label="Mô tả">
            <Input.TextArea
              rows={3}
              placeholder="Mô tả chi tiết task"
              disabled={isSubmitting}
            />
          </Form.Item>

          <div style={{ display: "flex", gap: 16 }}>
            <Form.Item
              name="priority"
              label="Độ ưu tiên"
              style={{ flex: 1 }}
              initialValue="medium"
            >
              <Select disabled={isSubmitting}>
                {priorityOptions.map((priority) => (
                  <Select.Option key={priority.value} value={priority.value}>
                    <Tag color={priority.color}>{priority.label}</Tag>
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="status"
              label="Trạng thái"
              style={{ flex: 1 }}
              initialValue="pending"
            >
              <Select disabled={isSubmitting}>
                {statusOptions.map((status) => (
                  <Select.Option key={status.value} value={status.value}>
                    <Tag color={status.color}>{status.label}</Tag>
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          <Form.Item
            name="assignee"
            label={`Người thực hiện ${
              columnAssignees.length > 0 ? "(từ cột)" : ""
            }`}
            rules={[
              { required: true, message: "Vui lòng chọn người thực hiện" },
            ]}
          >
            <Select placeholder="Chọn người thực hiện" disabled={isSubmitting}>
              {availableUsers.map((user) => (
                <Select.Option
                  key={user.id || user.apk}
                  value={user.id || user.apk}
                >
                  <Space>
                    <Avatar size={20} icon={<UserOutlined />}>
                      {(
                        user.name ||
                        user.fullName ||
                        user.username ||
                        ""
                      ).charAt(0)}
                    </Avatar>
                    {user.name || user.fullName || user.username}
                  </Space>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="deadline"
            label="Hạn chót"
            rules={[{ required: true, message: "Vui lòng chọn hạn chót" }]}
            initialValue={dayjs().add(7, "days")}
          >
            <DatePicker
              style={{ width: "100%" }}
              placeholder="Chọn hạn chót"
              disabled={isSubmitting}
              disabledDate={(current) =>
                current && current < dayjs().startOf("day")
              }
            />
          </Form.Item>

          <Form.Item name="labels" label="Labels">
            <Select
              mode="tags"
              placeholder="Thêm labels"
              tokenSeparators={[","]}
              disabled={isSubmitting}
            >
              <Select.Option value="Frontend">Frontend</Select.Option>
              <Select.Option value="Backend">Backend</Select.Option>
              <Select.Option value="UI/UX">UI/UX</Select.Option>
              <Select.Option value="Testing">Testing</Select.Option>
              <Select.Option value="Bug">Bug</Select.Option>
              <Select.Option value="Feature">Feature</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
};

// Column Management Modal with Loading
const ColumnModal = ({
  open,
  onCancel,
  onCreate,
  editingColumn,
  users,
  isSubmitting = false,
}) => {
  const [form] = Form.useForm();
  const user = useSelector((state) => state.auth.login?.currentUser);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    if (user && user.data.token) {
      const decode = jwtDecode(user.data.token);
      const id = decode.nameid;
      setCurrentUserId(id);
    }
  }, [user]);

  useEffect(() => {
    if (open) {
      if (editingColumn) {
        form.setFieldsValue({
          name: editingColumn.name,
          assignees: editingColumn.assignees || [],
        });
      } else {
        form.resetFields();
        if (currentUserId) {
          form.setFieldValue("assignees", [currentUserId]);
        }
      }
    }
  }, [open, editingColumn, form, currentUserId]);

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      const columnData = {
        id: editingColumn?.id,
        name: values.name,
        assignees: values.assignees || [],
      };
      onCreate(columnData);
      form.resetFields();
    });
  };

  return (
    <Modal
      title={editingColumn ? "Chỉnh sửa cột" : "Thêm cột mới"}
      open={open}
      onCancel={() => {
        if (!isSubmitting) {
          form.resetFields();
          onCancel();
        }
      }}
      onOk={handleSubmit}
      okText={editingColumn ? "Cập nhật" : "Tạo"}
      cancelText="Hủy"
      confirmLoading={isSubmitting}
      maskClosable={!isSubmitting}
      closable={!isSubmitting}
    >
      <Spin spinning={isSubmitting} tip="Đang xử lý...">
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Tên cột"
            rules={[{ required: true, message: "Vui lòng nhập tên cột" }]}
          >
            <Input placeholder="Nhập tên cột" disabled={isSubmitting} />
          </Form.Item>

          <Form.Item name="assignees" label="Người phụ trách cột">
            <Select
              mode="multiple"
              placeholder="Chọn người phụ trách"
              disabled={isSubmitting}
            >
              {users.map((user) => (
                <Select.Option
                  key={user.id || user.apk}
                  value={user.id || user.apk}
                >
                  <Space>
                    <Avatar size={16} icon={<UserOutlined />}>
                      {(
                        user.name ||
                        user.fullName ||
                        user.username ||
                        ""
                      ).charAt(0)}
                    </Avatar>
                    {user.name || user.fullName || user.username}
                  </Space>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
};

// Main Enhanced KanbanBoard Component with comprehensive loading states
const KanbanBoard = () => {
  const [data, setData] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
  const [activeColumnId, setActiveColumnId] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [editingColumn, setEditingColumn] = useState(null);
  const [openCommentDrawer, setOpenCommentDrawer] = useState(false);
  const [commentTask, setCommentTask] = useState(null);
  const [refreshFlag, setRefreshFlag] = useState(Date.now());
  const fileInputRef = useRef(null);
  const user = useSelector((state) => state.auth.login.currentUser);

  // Loading states for various operations
  const [loadingStates, setLoadingStates] = useState({
    submittingTask: false,
    submittingColumn: false,
    deletingTasks: {},
    updatingTasks: {},
    deletingColumns: {},
    addingTask: false,
  });

  // Update loading state helper
  const updateLoadingState = (key, value) => {
    setLoadingStates((prev) => ({ ...prev, [key]: value }));
  };

  // Update specific item loading state
  const updateItemLoadingState = (category, itemId, value) => {
    setLoadingStates((prev) => ({
      ...prev,
      [category]: { ...prev[category], [itemId]: value },
    }));
  };

  // Load users data with progress
  const getUser = async () => {
    try {
      setLoadingProgress(25);
      let res = await getAllUser();
      console.log("Users API response:", res);

      if (res && res.status === 200) {
        const userData = res.data?.data || res.data || [];
        const usersWithKey = userData.map((user) => ({
          ...user,
          key: user.apk?.toString() || user.id?.toString(),
        }));
        console.log("Processed users:", usersWithKey);
        setUsers(usersWithKey);
        setLoadingProgress(50);
      }
    } catch (error) {
      console.error("Error loading users:", error);
      notification.error({
        message: "Lỗi",
        description: "Không thể tải danh sách người dùng",
        placement: "topRight",
      });
    }
  };

  // Load initial data with progress tracking
  useEffect(() => {
    const loadInitialData = async () => {
      setLoadingProgress(0);
      await Promise.all([loadData(), getUser()]);
      setLoadingProgress(100);

      // Small delay to show 100% before hiding
      setTimeout(() => {
        setLoading(false);
      }, 500);
    };
    loadInitialData();
  }, []);

  const loadData = async () => {
    try {
      setLoadingProgress((prev) => Math.max(prev, 10));
      const [boardsResponse, tasksResponse] = await Promise.all([
        getBoard(),
        getTask(),
      ]);

      setLoadingProgress(75);

      console.log("Boards response:", boardsResponse);
      console.log("Tasks response:", tasksResponse);

      // Handle different response structures
      const boards = Array.isArray(boardsResponse?.data)
        ? boardsResponse.data
        : Array.isArray(boardsResponse?.data?.data)
        ? boardsResponse.data.data
        : Array.isArray(boardsResponse)
        ? boardsResponse
        : [];

      const tasks = Array.isArray(tasksResponse?.data)
        ? tasksResponse.data
        : Array.isArray(tasksResponse?.data?.data)
        ? tasksResponse.data.data
        : Array.isArray(tasksResponse)
        ? tasksResponse
        : [];

      console.log("Processed boards:", boards);
      console.log("Processed tasks:", tasks);

      // Group tasks by boardId and process assignees
      const boardsWithTasks = boards.map((board) => {
        // Handle assignees conversion - convert string/number to number
        let assignees = [];
        if (board.assignees && Array.isArray(board.assignees)) {
          assignees = board.assignees.map((a) => {
            if (typeof a === "object" && a.userId) {
              return a.userId.toString();
            }
            return a.toString();
          });
        }

        console.log(`Board ${board.name} assignees:`, assignees);

        return {
          ...board,
          assignees: assignees,
          tasks: tasks.filter((task) => task.boardId === board.id),
        };
      });

      console.log("Final boards with tasks:", boardsWithTasks);
      setData(boardsWithTasks);
      setLoadingProgress(90);
    } catch (error) {
      console.error("Error loading data:", error);
      notification.error({
        message: "Lỗi",
        description: "Không thể tải dữ liệu",
        placement: "topRight",
      });
      setData([]);
    }
  };

  const addTask = async (columnId, task) => {
    try {
      updateLoadingState("submittingTask", true);

      const selectedUser = users.find(
        (u) => (u.id || u.apk) === task.assigneeUserId
      );

      const taskDto = {
        id:
          task.id && !task.id.startsWith("task-")
            ? task.id
            : crypto.randomUUID(),
        title: task.title,
        description: task.description || "",
        priority: task.priority || "medium",
        status: task.status || "pending",
        deadline: task.deadline,
        assigneeUserId: task.assigneeUserId?.toString() || "",
        assigneeUserName:
          selectedUser?.name ||
          selectedUser?.fullName ||
          selectedUser?.username ||
          "",
        boardId: columnId,
        labels: task.labels || [],
      };

      console.log("Creating/updating task:", taskDto);

      if (task.id && !task.id.startsWith("task-")) {
        await createTask(taskDto);
        notification.success({
          message: "Thành công",
          description: "Đã cập nhật task",
          placement: "topRight",
        });
      } else {
        await createTask(taskDto);
        notification.success({
          message: "Thành công",
          description: "Đã tạo task thành công",
          placement: "topRight",
        });
      }

      await loadData();
    } catch (error) {
      console.error("Error adding/updating task:", error);
      notification.error({
        message: "Lỗi",
        description: "Không thể tạo/cập nhật task",
        placement: "topRight",
      });
    } finally {
      updateLoadingState("submittingTask", false);
    }
  };

  const handleTaskAction = async (action, data) => {
    if (action === "EDIT_TASK") {
      console.log("vô đây", data);
      setEditingTask(data);
      setActiveColumnId(data.boardId);
      setIsTaskModalOpen(true);
    } else if (action === "UPDATE_STATUS") {
      try {
        updateItemLoadingState("updatingTasks", data.taskId, true);

        // Get the full task data
        const currentTask = data.task || data;

        console.log("Updating task status:", {
          taskId: data.taskId,
          newStatus: data.status,
          currentTask: currentTask,
        });

        // Try different approaches based on your API
        try {
          // Method 1: Try the original updateStatusKB if it expects simple params
          await updateStatusKB(data.taskId, data.status);
        } catch (firstError) {
          console.log("First approach failed, trying alternative:", firstError);

          // Method 2: Use createTask with full task data
          const taskUpdateData = {
            id: data.taskId,
            title: currentTask.title,
            description: currentTask.description || "",
            priority: currentTask.priority || "medium",
            status: data.status, // New status
            deadline: currentTask.deadline,
            assigneeUserId: currentTask.assigneeUserId?.toString() || "",
            assigneeUserName: currentTask.assigneeUserName || "",
            boardId: currentTask.boardId,
            labels: currentTask.labels || [],
          };
          await createTask(taskUpdateData);
        }

        // Update local state
        setData((prevData) =>
          prevData.map((board) => ({
            ...board,
            tasks: board.tasks.map((task) =>
              task.id === data.taskId ? { ...task, status: data.status } : task
            ),
          }))
        );

        notification.success({
          message: "Thành công",
          description: "Đã cập nhật trạng thái",
          placement: "topRight",
        });
      } catch (error) {
        console.error("Error updating status:", error);
        console.error("Error details:", error.response?.data);

        // Show more detailed error message
        const errorMessage =
          error.response?.data?.errors?.status?.[0] ||
          error.response?.data?.title ||
          error.message ||
          "Không thể cập nhật trạng thái";

        notification.error({
          message: "Lỗi cập nhật trạng thái",
          description: errorMessage,
          placement: "topRight",
        });
      } finally {
        updateItemLoadingState("updatingTasks", data.taskId, false);
      }
    } else {
      console.log("aaa", data);
      await deleteTask(data);
    }
  };

  const deleteTask = async (taskId) => {
    try {
      updateItemLoadingState("deletingTasks", taskId, true);

      console.log(taskId);
      await deleteTaskAPI(taskId);

      setData((prevData) =>
        prevData.map((board) => ({
          ...board,
          tasks: board.tasks.filter((task) => task.id !== taskId),
        }))
      );

      notification.success({
        message: "Thành công",
        description: "Đã xóa task thành công",
        placement: "topRight",
      });
    } catch (error) {
      console.error("Error deleting task:", error);
      notification.error({
        message: "Lỗi",
        description: "Không thể xóa task",
        placement: "topRight",
      });
    } finally {
      updateItemLoadingState("deletingTasks", taskId, false);
    }
  };

  const addOrUpdateColumn = async (columnData) => {
    try {
      updateLoadingState("submittingColumn", true);

      const boardDto = {
        id:
          columnData.id && !columnData.id.startsWith("column-")
            ? columnData.id
            : crypto.randomUUID(),
        name: columnData.name,
        assignees: columnData.assignees.map((userId) => {
          const user = users.find((u) => (u.id || u.apk) === userId);
          return {
            userId: userId.toString(),
            userName: user?.name || user?.fullName || user?.username || "",
          };
        }),
      };

      console.log("Creating/updating board:", boardDto);

      await createBoard(boardDto);
      await loadData();

      notification.success({
        message: "Thành công",
        description:
          columnData.id && !columnData.id.startsWith("column-")
            ? "Đã cập nhật cột"
            : "Đã tạo cột thành công",
        placement: "topRight",
      });
    } catch (error) {
      console.error("Error adding/updating column:", error);
      notification.error({
        message: "Lỗi",
        description: "Không thể tạo/cập nhật cột",
        placement: "topRight",
      });
    } finally {
      updateLoadingState("submittingColumn", false);
    }
  };

  const deleteBoardHandler = async (columnId) => {
    try {
      updateItemLoadingState("deletingColumns", columnId, true);

      await deleteBoardAPI(columnId);

      setData((prevData) => prevData.filter((board) => board.id !== columnId));

      notification.success({
        message: "Thành công",
        description: "Đã xóa cột thành công",
        placement: "topRight",
      });
    } catch (error) {
      console.error("Error deleting board:", error);
      notification.error({
        message: "Lỗi",
        description: "Không thể xóa cột",
        placement: "topRight",
      });
    } finally {
      updateItemLoadingState("deletingColumns", columnId, false);
    }
  };

  // Calculate statistics
  const totalTasks = data.reduce(
    (sum, board) => sum + (board.tasks?.length || 0),
    0
  );
  const overdueTasks = data.reduce(
    (sum, board) =>
      sum +
      (board.tasks?.filter(
        (task) =>
          dayjs().isAfter(dayjs(task.deadline)) && task.status !== "done"
      ).length || 0),
    0
  );
  const completedTasks = data.reduce(
    (sum, board) =>
      sum + (board.tasks?.filter((task) => task.status === "done").length || 0),
    0
  );

  // Get column assignees for current active column
  const activeColumn = data.find((board) => board.id === activeColumnId);
  const columnAssignees = activeColumn?.assignees || [];

  console.log("Active column:", activeColumn);
  console.log("Column assignees:", columnAssignees);

  if (loading) {
    return (
      <div
        style={{
          padding: 24,
          backgroundColor: "#f0f2f5",
          minHeight: "100vh",
          borderRadius: "10px",
        }}
      >
        {/* Loading Header */}
        <HeaderSkeleton />

        {/* Loading Progress */}
        <div style={{ marginBottom: 24, textAlign: "center" }}>
          <Progress
            percent={loadingProgress}
            status="active"
            strokeColor={{
              from: "#108ee9",
              to: "#87d068",
            }}
            format={(percent) => `Đang tải... ${percent}%`}
          />
        </div>

        {/* Loading Columns */}
        <div
          style={{
            overflowX: "auto",
            width: "100%",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              gap: 16,
              paddingBottom: 16,
            }}
          >
            {[1, 2, 3, 4].map((i) => (
              <ColumnSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: 0,
        backgroundColor: "#f0f2f5",
        minHeight: "100vh",
        borderRadius: "10px",
      }}
    >
      {/* Enhanced Header */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 16,
          marginBottom: 24,
          backgroundColor: "white",
          padding: 20,
          borderRadius: 12,
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
        }}
      >
        <div style={{ flex: 1, minWidth: 280 }}>
          <Typography.Title
            level={2}
            style={{ margin: 0, marginBottom: 8, color: "white" }}
          >
            🏢 Quản lý công việc
          </Typography.Title>
          <Space size={[8, 8]} wrap>
            <Tag color="blue" style={{ fontSize: 14, padding: "4px 12px" }}>
              📋 Tổng: {totalTasks} tasks
            </Tag>
            <Tag color="green" style={{ fontSize: 14, padding: "4px 12px" }}>
              ✅ Hoàn thành: {completedTasks}
            </Tag>
            <Tag color="red" style={{ fontSize: 14, padding: "4px 12px" }}>
              ⚠️ Trễ hạn: {overdueTasks}
            </Tag>
            <Tag color="orange" style={{ fontSize: 14, padding: "4px 12px" }}>
              📊 Tỷ lệ:{" "}
              {totalTasks > 0
                ? Math.round((completedTasks / totalTasks) * 100)
                : 0}
              %
            </Tag>
          </Space>
        </div>
        <div style={{ flexShrink: 0 }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingColumn(null);
              setIsColumnModalOpen(true);
            }}
            size="large"
            loading={loadingStates.submittingColumn}
            style={{
              background: "rgba(255,255,255,0.2)",
              border: "1px solid rgba(255,255,255,0.3)",
              backdropFilter: "blur(10px)",
              color: "white",
            }}
          >
            Thêm cột
          </Button>
        </div>
      </div>

      {/* Enhanced Kanban Board */}
      <div
        style={{
          overflowX: "auto",
          width: "100%",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            gap: 16,
            paddingBottom: 16,
          }}
        >
          {Array.isArray(data) &&
            data.map((board) => (
              <EnhancedKanbanColumn
                key={board.id}
                column={board}
                users={users}
                loadingStates={loadingStates}
                isDeleting={loadingStates.deletingColumns?.[board.id]}
                onAddCard={() => {
                  console.log(
                    "Adding card to board:",
                    board.id,
                    "with assignees:",
                    board.assignees
                  );
                  setActiveColumnId(board.id);
                  setEditingTask(null);
                  setIsTaskModalOpen(true);
                  updateLoadingState("addingTask", true);

                  // Simulate brief loading for better UX
                  setTimeout(() => {
                    updateLoadingState("addingTask", false);
                  }, 300);
                }}
                onDeleteTask={handleTaskAction}
                onDeleteBoard={() => deleteBoardHandler(board.id)}
                onEditColumn={(column) => {
                  setEditingColumn(column);
                  setIsColumnModalOpen(true);
                }}
                onComment={(task) => {
                  setCommentTask(task);
                  setOpenCommentDrawer(true);
                  setRefreshFlag(Date.now());
                }}
              />
            ))}
        </div>
      </div>

      {/* Enhanced Task Modal */}
      <EnhancedTaskModal
        open={isTaskModalOpen}
        onCancel={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
          setActiveColumnId(null);
        }}
        onCreate={(task) => {
          addTask(activeColumnId, task);
          setIsTaskModalOpen(false);
          setEditingTask(null);
          setActiveColumnId(null);
        }}
        editingTask={editingTask}
        columnAssignees={columnAssignees}
        users={users}
        isSubmitting={loadingStates.submittingTask}
      />

      {/* Column Management Modal */}
      <ColumnModal
        open={isColumnModalOpen}
        onCancel={() => {
          setIsColumnModalOpen(false);
          setEditingColumn(null);
        }}
        onCreate={(columnData) => {
          addOrUpdateColumn(columnData);
          setIsColumnModalOpen(false);
          setEditingColumn(null);
        }}
        editingColumn={editingColumn}
        users={users}
        isSubmitting={loadingStates.submittingColumn}
      />
      <Drawer
        title={`Nhận xét & Đính kèm - ${commentTask?.title || ""}`}
        open={openCommentDrawer}
        onClose={() => {
          setOpenCommentDrawer(false);
          setCommentTask(null);
        }}
        width={720}
      >
        {/* Nút đính kèm */}
        <div style={{ marginBottom: 16 }}>
          <Button
            icon={<UploadOutlined />}
            onClick={() => fileInputRef.current?.click()}
          >
            Đính kèm file
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            multiple
            onChange={async (e) => {
              const files = e.target.files;
              if (!files.length || !commentTask?.id) return;

              for (const file of files) {
                const formData = new FormData();
                formData.append("file", file);
                formData.append("refId", commentTask.id);
                formData.append("refType", "Task");

                try {
                  const res = await addAttachments(formData, user?.data?.token);
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

        {/* Phần hiển thị danh sách file */}
        <div style={{ marginBottom: 24 }}>
          <AttachmentSection
            refId={commentTask?.id || ""}
            refType="Task"
            refreshTrigger={refreshFlag}
          />
        </div>

        {/* Ghi chú */}
        <NoteSection
          refId={commentTask?.id || ""}
          refType="Task"
          voucherNo={commentTask?.title || ""}
        />
      </Drawer>
    </div>
  );
};

export default KanbanBoard;
