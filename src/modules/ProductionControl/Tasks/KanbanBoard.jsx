// KanbanBoard.jsx
import { useEffect, useState } from "react";
import { Button, Input, Modal, notification } from "antd";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import KanbanColumn from "../../../components/KanbanColumn";
import TaskModal from "../../../components/TaskModal";
import { PlusOutlined } from "@ant-design/icons";
import {
  addBoards,
  addCard,
  deleteBoards,
  deleteCards,
  getAllBoard,
  moveCardToBoard,
} from "../../../services/apiTask";
import moment from "moment";

const initialData = {
  columns: {
    todo: {
      id: "todo",
      title: "Todo 🧾",
      taskIds: ["task-1", "task-2"],
    },
    "in-progress": {
      id: "in-progress",
      title: "In Progress ⚡",
      taskIds: ["task-3", "task-4"],
    },
    done: {
      id: "done",
      title: "Done ✅",
      taskIds: ["task-5"],
    },
    backlog: {
      id: "backlog",
      title: "Backlog 📦",
      taskIds: ["task-6"],
    },
  },
  tasks: {
    "task-1": {
      id: "task-1",
      title: "Login view form",
      labels: ["Enhancement"],
      deadline: "2025-04-20",
    },
    "task-2": {
      id: "task-2",
      title: "Implement Landing Page",
      labels: ["Enhancement"],
      deadline: "2025-04-22",
    },
    "task-3": {
      id: "task-3",
      title: "Landing Page hero block",
      labels: ["Needs Review", "Design"],
      deadline: "2025-04-14",
    },
    "task-4": {
      id: "task-4",
      title: "Landing Page footer",
      labels: ["Design"],
      deadline: "2025-04-18",
    },
    "task-5": {
      id: "task-5",
      title: "Registration view form",
      labels: ["Enhancement"],
      deadline: "2025-04-10",
    },
    "task-6": {
      id: "task-6",
      title: "Email verification gives 500",
      labels: ["Bug"],
      deadline: "2025-04-25",
    },
  },
  columnOrder: ["todo", "in-progress", "done", "backlog"],
};

const KanbanBoard = () => {
  const [data, setData] = useState(initialData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeColumnId, setActiveColumnId] = useState(null);
  const [isAddBoardModalOpen, setIsAddBoardModalOpen] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState("");

  useEffect(() => {
    getTask();
  }, []);

  const getTask = async () => {
    try {
      let res = await getAllBoard();
      if (res && res.status === 200) {
        setData(res.data.data);
      }
    } catch (error) {
      setData(initialData);
    }
  };

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    )
      return;

    try {
      let res = await moveCardToBoard(draggableId, destination.droppableId);
      if (res && res.status === 200) {
        getTask();
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
  };

  const addTask = async (columnId, task) => {
    try {
      let res = await addCard(
        task.title,
        "",
        task.deadline ? moment.utc(task.deadline).local() : null,
        "",
        columnId
      );
      if (res && res.status === 200) {
        notification.success({
          message: "Thành công",
          description: "Lưu thành công",
          placement: "topRight",
        });
        getTask();
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
  };

  const deleteTask = async (taskId, columnId) => {
    try {
      let res = await deleteCards(taskId);
      if ((res && res.status === 200) || res.status === 204) {
        notification.success({
          message: "Thành công",
          description: "Đã xóa thành công",
          placement: "topRight",
        });
        getTask();
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
  };

  const addBoard = async (title) => {
    try {
      let res = await addBoards(title);
      if (res && res.status === 200) {
        notification.success({
          message: "Thành công",
          description: "Lưu thành công",
          placement: "topRight",
        });
        getTask();
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
  };

  const deleteBoard = async (columnId) => {
    try {
      let res = await deleteBoards(columnId);
      if ((res && res.status === 200) || res.status === 204) {
        notification.success({
          message: "Thành công",
          description: "Đã xóa thành công",
          placement: "topRight",
        });
        getTask();
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
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 10,
        }}
      >
        <h1 style={{ margin: 0 }}>Quản lý công việc</h1>
        <Button
          icon={<PlusOutlined />}
          onClick={() => setIsAddBoardModalOpen(true)}
        >
          Thêm Board
        </Button>
      </div>
      <DragDropContext onDragEnd={onDragEnd}>
        <div style={{ display: "flex", gap: 16, overflowX: "auto" }}>
          {Array.isArray(data) &&
            data.map((board) => {
              const column = board;
              const tasks = board.cards;

              return (
                <KanbanColumn
                  key={board.id}
                  column={column}
                  tasks={tasks}
                  onAddCard={() => {
                    setActiveColumnId(board.id);
                    setIsModalOpen(true);
                  }}
                  onDeleteTask={(taskId) => deleteTask(taskId, board.id)}
                  onDeleteBoard={() => deleteBoard(board.id)}
                />
              );
            })}
          {/* {data &&
            data?.map((colId) => {
              console.log(colId);
              const column = colId?.name;
              const tasks = colId?.card;
              console.log(colId.name);

              // return (
              //   <KanbanColumn
              //     key={colId}
              //     column={column}
              //     tasks={tasks}
              //     onAddCard={() => {
              //       setActiveColumnId(colId);
              //       setIsModalOpen(true);
              //     }}
              //     onDeleteTask={(taskId) => deleteTask(taskId, colId)}
              //     onDeleteBoard={() => deleteBoard(colId)}
              //   />
              // );
            })} */}
          {/* {data?.map((colId) => {
            const column = data.columns[colId];
            const tasks = column.taskIds.map((taskId) => data.tasks[taskId]);
            return (
              <KanbanColumn
                key={colId}
                column={column}
                tasks={tasks}
                onAddCard={() => {
                  setActiveColumnId(colId);
                  setIsModalOpen(true);
                }}
                onDeleteTask={(taskId) => deleteTask(taskId, colId)}
                onDeleteBoard={() => deleteBoard(colId)}
              />
            );
          })} */}
        </div>
      </DragDropContext>
      <TaskModal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onCreate={(task) => {
          addTask(activeColumnId, task);
          setIsModalOpen(false);
        }}
      />
      <Modal
        title="Thêm Board mới"
        open={isAddBoardModalOpen}
        onCancel={() => {
          setNewBoardTitle("");
          setIsAddBoardModalOpen(false);
        }}
        onOk={() => {
          if (newBoardTitle.trim()) {
            addBoard(newBoardTitle.trim());
            setNewBoardTitle("");
            setIsAddBoardModalOpen(false);
          }
        }}
      >
        <Input
          placeholder="Nhập tên board"
          value={newBoardTitle}
          onChange={(e) => setNewBoardTitle(e.target.value)}
        />
      </Modal>
    </div>
  );
};

export default KanbanBoard;
