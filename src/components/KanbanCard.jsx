import {
  Avatar,
  Button,
  Card,
  Space,
  Tag,
  Typography,
  Select,
  Tooltip,
} from "antd";
import {
  DeleteOutlined,
  ClockCircleOutlined,
  UserOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const statusColors = {
  pending: "default",
  "in-progress": "blue",
  done: "green",
  paused: "red",
};

const statusLabels = {
  pending: "🕓 Chưa thực hiện",
  "in-progress": "⚙️ Đang làm",
  done: "✅ Hoàn thành",
  paused: "⏸️ Tạm ngưng",
};

const KanbanCard = ({ task, onDelete, onStatusChange }) => {
  return (
    <Card
      size="small"
      style={{
        marginBottom: 8,
        width: "100%",
        borderRadius: 8,
        background: "#fff",
        boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
      }}
      bodyStyle={{ padding: 12 }}
    >
      <Space direction="vertical" style={{ width: "100%" }}>
        {/* Tiêu đề và nút xoá */}
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Typography.Text strong>{task.title}</Typography.Text>
          <Button
            type="text"
            icon={<DeleteOutlined />}
            danger
            onClick={onDelete}
            size="small"
          />
        </div>

        {/* Trạng thái */}
        <Select
          size="small"
          value={task.status}
          onChange={(value) => onStatusChange(task.id, value)}
          style={{ width: "100%" }}
        >
          {Object.entries(statusLabels).map(([value, label]) => (
            <Select.Option key={value} value={value}>
              <Tag color={statusColors[value]}>{label}</Tag>
            </Select.Option>
          ))}
        </Select>

        {/* Deadline */}
        <div style={{ fontSize: 12, color: "#888" }}>
          <ClockCircleOutlined style={{ marginRight: 4 }} />
          {dayjs(task.deadline).format("DD/MM/YYYY")}
        </div>

        {/* Người phụ trách */}
        {task.assignee?.name && (
          <div
            style={{
              fontSize: 13,
              color: "#555",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Tooltip title={`Người phụ trách: ${task.assignee.name}`}>
              <Avatar
                size={24}
                style={{ backgroundColor: "#1677ff" }}
                icon={<UserOutlined />}
              />
            </Tooltip>
            {task.assignee.name}
          </div>
        )}
      </Space>
    </Card>
  );
};

export default KanbanCard;
