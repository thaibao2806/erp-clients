import React, { useEffect, useState } from "react";
import "@fullcalendar/react/dist/vdom";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Modal, Form, Input } from "antd";
import { useSelector } from "react-redux";
import { filterApprovals } from "../../services/apiApprovals";

const Calendar = () => {
  const [events, setEvents] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const user = useSelector((state) => state.auth.login.currentUser);
  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await filterApprovals(
        "",
        user.data.userName,
        "",
        "pending",
        1,
        100
      );
      if (res && res.status === 200) {
        const { items } = res.data.data;
        const calendarEvents = items.map((item) => {
          const startDate = new Date(item.createdAt)
            .toISOString()
            .split("T")[0]; // 👉 chuyển đúng định dạng yyyy-MM-dd
          return {
            id: item.id,
            title: item.voucherNo,
            start: startDate,
            allDay: true,
            extendedProps: {
              linkDetail: item.linkDetail,
            },
          };
        });
        setEvents(calendarEvents);
      }
    } catch (error) {
      console.error("Lỗi khi gọi API:", error);
    } finally {
      setLoading(false);
    }
  };

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
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        events={events}
        //dateClick={handleDateClick}
        eventClick={(info) => {
          const link = info.event.extendedProps.linkDetail;
          if (link) {
            window.open(link, "_blank");
          }
        }}
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
            rules={[{ required: true, message: "Vui lòng nhập tên sự kiện" }]}
          >
            <Input placeholder="VD: Họp team, Deadline..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Calendar;
