import { Card, Button } from "antd";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import KanbanCard from "./KanbanCard";
import { DeleteOutlined } from "@ant-design/icons";

const KanbanColumn = ({
  column,
  tasks,
  onAddCard,
  onDeleteTask,
  onDeleteBoard,
}) => {
  return (
    <Card
      title={
        <div>
          <div style={{ fontWeight: 600 }}>{column.name}</div>
          {column.assignee && (
            <div
              style={{ display: "flex", alignItems: "center", marginTop: 4 }}
            >
              <Avatar size={24} icon={<UserOutlined />} />
              <span style={{ marginLeft: 8, fontSize: 13 }}>
                {column.assignee.name}
              </span>
            </div>
          )}
        </div>
      }
      style={{ width: 360, marginRight: 16 }} // 👈 tăng chiều ngang
      extra={
        <div style={{ display: "flex", gap: 8 }}>
          <Button type="link" onClick={onAddCard}>
            + Add Card
          </Button>
          <Button
            type="text"
            icon={<DeleteOutlined />}
            danger
            onClick={onDeleteBoard}
          />
        </div>
      }
    >
      <Droppable droppableId={column.id}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            style={{ minHeight: 100 }}
          >
            {tasks.map((task, index) => (
              <Draggable key={task.id} draggableId={task.id} index={index}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    <KanbanCard
                      task={task}
                      onDelete={() => onDeleteTask(task.id)}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </Card>
  );
};

export default KanbanColumn;
