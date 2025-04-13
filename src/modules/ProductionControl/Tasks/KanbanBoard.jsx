// KanbanBoard.jsx
import { useState } from 'react';
import { Button, Input, Modal } from 'antd';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import KanbanColumn from '../../../components/KanbanColumn';
import TaskModal from '../../../components/TaskModal';
import { PlusOutlined } from '@ant-design/icons';

const initialData = {
  columns: {
    todo: {
      id: 'todo',
      title: 'Todo 🧾',
      taskIds: ['task-1', 'task-2'],
    },
    'in-progress': {
      id: 'in-progress',
      title: 'In Progress ⚡',
      taskIds: ['task-3', 'task-4'],
    },
    done: {
      id: 'done',
      title: 'Done ✅',
      taskIds: ['task-5'],
    },
    backlog: {
      id: 'backlog',
      title: 'Backlog 📦',
      taskIds: ['task-6'],
    },
  },
  tasks: {
    'task-1': { id: 'task-1', title: 'Login view form', labels: ['Enhancement'], deadline: '2025-04-20' },
    'task-2': { id: 'task-2', title: 'Implement Landing Page', labels: ['Enhancement'], deadline: '2025-04-22' },
    'task-3': { id: 'task-3', title: 'Landing Page hero block', labels: ['Needs Review', 'Design'], deadline: '2025-04-14' },
    'task-4': { id: 'task-4', title: 'Landing Page footer', labels: ['Design'], deadline: '2025-04-18' },
    'task-5': { id: 'task-5', title: 'Registration view form', labels: ['Enhancement'], deadline: '2025-04-10' },
    'task-6': { id: 'task-6', title: 'Email verification gives 500', labels: ['Bug'], deadline: '2025-04-25' },
  },
  columnOrder: ['todo', 'in-progress', 'done', 'backlog'],
};

const KanbanBoard = () => {
  const [data, setData] = useState(initialData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeColumnId, setActiveColumnId] = useState(null);
  const [isAddBoardModalOpen, setIsAddBoardModalOpen] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState('');


  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;

    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const sourceCol = data.columns[source.droppableId];
    const destCol = data.columns[destination.droppableId];

    const sourceTaskIds = [...sourceCol.taskIds];
    sourceTaskIds.splice(source.index, 1);

    const destTaskIds = [...destCol.taskIds];
    destTaskIds.splice(destination.index, 0, draggableId);

    setData({
      ...data,
      columns: {
        ...data.columns,
        [sourceCol.id]: { ...sourceCol, taskIds: sourceTaskIds },
        [destCol.id]: { ...destCol, taskIds: destTaskIds },
      },
    });
  };

  const addTask = (columnId, task) => {
    const newTaskId = `task-${Date.now()}`;
    const newTask = { id: newTaskId, ...task };
    const column = data.columns[columnId];

    setData({
      ...data,
      tasks: {
        ...data.tasks,
        [newTaskId]: newTask,
      },
      columns: {
        ...data.columns,
        [columnId]: {
          ...column,
          taskIds: [...column.taskIds, newTaskId],
        },
      },
    });
  };

  const deleteTask = (taskId, columnId) => {
    const newTasks = { ...data.tasks };
    delete newTasks[taskId];
    const newTaskIds = data.columns[columnId].taskIds.filter((id) => id !== taskId);

    setData({
      ...data,
      tasks: newTasks,
      columns: {
        ...data.columns,
        [columnId]: {
          ...data.columns[columnId],
          taskIds: newTaskIds,
        },
      },
    });
  };

  const addBoard = (title) => {
    const newId = `column-${Date.now()}`;
    const newTitle = title || 'New Board 🆕';
    setData({
      ...data,
      columns: {
        ...data.columns,
        [newId]: { id: newId, title: newTitle, taskIds: [] },
      },
      columnOrder: [...data.columnOrder, newId],
    });
  };
  

  const deleteBoard = (columnId) => {
    const newColumns = { ...data.columns };
    delete newColumns[columnId];
    const newColumnOrder = data.columnOrder.filter((id) => id !== columnId);
    const taskIdsToDelete = data.columns[columnId].taskIds;
    const newTasks = { ...data.tasks };
    taskIdsToDelete.forEach((id) => delete newTasks[id]);

    setData({
      tasks: newTasks,
      columns: newColumns,
      columnOrder: newColumnOrder,
    });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <h1 style={{ margin: 0 }}>Quản lý công việc</h1>
        <Button icon={<PlusOutlined />} onClick={() => setIsAddBoardModalOpen(true)}>
            Thêm Board
        </Button>

      </div>
      <DragDropContext onDragEnd={onDragEnd}>
        <div style={{ display: 'flex', gap: 16, overflowX: 'auto' }}>
          {data.columnOrder.map((colId) => {
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
          })}
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
            setNewBoardTitle('');
            setIsAddBoardModalOpen(false);
        }}
        onOk={() => {
            if (newBoardTitle.trim()) {
            addBoard(newBoardTitle.trim());
            setNewBoardTitle('');
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
