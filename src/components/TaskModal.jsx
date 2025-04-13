import { Modal, Form, Input, Select, DatePicker } from 'antd';

const TaskModal = ({ open, onCancel, onCreate }) => {
  const [form] = Form.useForm();

  const handleOk = () => {
    form.validateFields().then((values) => {
      const task = {
        title: values.title,
        labels: values.labels,
        deadline: values.deadline.format('YYYY-MM-DD')
      };
      onCreate(task);
      form.resetFields();
    });
  };

  return (
    <Modal
      title="Add Task"
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      okText="Create"
    >
      <Form form={form} layout="vertical">
        <Form.Item name="title" label="Title" rules={[{ required: true }]}> 
          <Input placeholder="Task title" />
        </Form.Item>
        <Form.Item name="labels" label="Labels">
          <Select mode="tags" style={{ width: '100%' }} placeholder="Add labels" />
        </Form.Item>
        <Form.Item name="deadline" label="Deadline" rules={[{ required: true }]}> 
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default TaskModal;