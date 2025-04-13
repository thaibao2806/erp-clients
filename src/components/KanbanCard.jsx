import { Button, Card, Space, Tag, Typography } from 'antd';
import dayjs from 'dayjs';
import { DeleteOutlined } from '@ant-design/icons';

const labelColors = {
  Enhancement: 'purple',
  'Needs Review': 'green',
  Design: 'magenta',
  Bug: 'red',
  Docs: 'orange',
  DevOps: 'gold',
};

const KanbanCard = ({ task, onDelete }) => {
  return (
    <Card
      size="small"
      style={{ marginBottom: 8, width: '100%' }} // 👈 đảm bảo chiếm full chiều ngang
      bodyStyle={{ padding: 12 }}
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography.Text strong>{task.title}</Typography.Text>
          <Button
            type="text"
            icon={<DeleteOutlined />}
            danger
            onClick={onDelete}
            size="small"
          />
        </div>

        <div>
          {task.labels?.map((label) => (
            <Tag key={label} color={labelColors[label] || 'blue'}>
              {label}
            </Tag>
          ))}
        </div>

        <div style={{ fontSize: 12, color: '#888' }}>
          ⏰ {dayjs(task.deadline).format('DD/MM/YYYY')}
        </div>
      </Space>
    </Card>
  );
};

export default KanbanCard;
