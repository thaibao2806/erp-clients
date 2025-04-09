import React, { useState } from 'react';
import '@fullcalendar/react/dist/vdom'
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Modal, Form, Input } from 'antd';

const Calendar = () => {
  const [events, setEvents] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [form] = Form.useForm();

  const handleDateClick = (arg) => {
    setSelectedDate(arg.dateStr);
    setModalVisible(true);
  };

  const handleAddEvent = () => {
    form.validateFields().then((values) => {
      setEvents([
        ...events,
        {
          title: values.title,
          start: selectedDate,
          allDay: true,
        },
      ]);
      setModalVisible(false);
      form.resetFields();
    });
  };

  return (
    <div style={{ padding: 5 }}>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        events={events}
        dateClick={handleDateClick}
        selectable={true}
        height="100vh"
      />

      <Modal
        title="Tạo sự kiện mới"
        open={modalVisible}
        onOk={handleAddEvent}
        onCancel={() => setModalVisible(false)}
        okText="Tạo"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Tên sự kiện"
            name="title"
            rules={[{ required: true, message: 'Vui lòng nhập tên sự kiện' }]}
          >
            <Input placeholder="VD: Họp team, Deadline..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Calendar;
