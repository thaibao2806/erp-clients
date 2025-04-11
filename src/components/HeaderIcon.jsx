import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  EditOutlined,
  CalendarOutlined,
  BellOutlined,
  SettingOutlined,
  UserOutlined,
  LogoutOutlined,
  LockOutlined,
} from '@ant-design/icons';
import { Dropdown, Menu, Tooltip, Avatar, Typography, Divider } from 'antd';

const { Text } = Typography;

const notifications = [
  {
    id: 1,
    image: 'https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png',
    title: 'Cập nhật hệ thống',
    time: '13/06/2022 04:42',
  },
  {
    id: 2,
    image: 'https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png',
    title: 'Cập nhật hệ thống',
    time: '14/06/2022 09:30',
  },
  {
    id: 3,
    image: 'https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png',
    title: 'Cập nhật hệ thống',
    time: '14/06/2022 09:30',
  },
];

const HeaderIcons = () => {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);

  // Menu Thông báo
  const notificationMenu = (
    <Menu style={{ width: 320 }}>
      {notifications.length > 0 ? (
        notifications.map((notif) => (
          <Menu.Item key={notif.id} style={{ padding: 10, whiteSpace: 'normal' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Avatar src={notif.image} size={32} style={{ marginRight: 10 }} />
              <div>
                <Text strong>{notif.title}</Text>
                <br />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {notif.time}
                </Text>
              </div>
            </div>
            <Divider style={{ margin: '8px 0' }} />
          </Menu.Item>
        ))
      ) : (
        <Menu.Item style={{ textAlign: 'center' }}>Không có thông báo</Menu.Item>
      )}

      <Menu.Item style={{ textAlign: 'center', padding: '10px' }}>
        <Text type="link">Xem tất cả</Text> | <Text type="link">Đánh dấu đã đọc</Text>
      </Menu.Item>
    </Menu>
  );

  // Menu Tài khoản
  const accountMenu = (
    <Menu>
      <Menu.Item key="profile" icon={<UserOutlined />} onClick={() => navigate('/profile')}>
        Tài khoản
      </Menu.Item>
      <Menu.Item key="change-password" icon={<LockOutlined />} onClick={() => navigate('/change-password')}>
        Đổi mật khẩu
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item
        key="logout"
        icon={<LogoutOutlined />}
        style={{ color: 'red' }}
        onClick={() => {
          console.log('Đăng xuất');
          navigate('/login'); // Chuyển về trang đăng nhập
        }}
      >
        Đăng xuất
      </Menu.Item>
    </Menu>
  );

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '35px' }}>
      {/* Ghi chú */}
      <Tooltip title="Xét duyệt">
        <EditOutlined
          style={{ fontSize: '20px', cursor: 'pointer' }}
          onClick={() => navigate('/review')}
        />
      </Tooltip>

      {/* Lịch */}
      <Tooltip title="Lịch">
        <CalendarOutlined
          style={{ fontSize: '20px', cursor: 'pointer' }}
          onClick={() => navigate('/calendar')}
        />
      </Tooltip>

      {/* Thông báo */}
      <Dropdown
        overlay={notificationMenu}
        trigger={['click']}
        placement="bottomRight"
        onOpenChange={setShowNotifications}
      >
        <Tooltip>
          <BellOutlined
            style={{
              fontSize: '20px',
              cursor: 'pointer',
              color: showNotifications ? '#1890ff' : 'inherit',
            }}
          />
        </Tooltip>
      </Dropdown>

      {/* Cài đặt */}
      {/* <Tooltip >
        <SettingOutlined style={{ fontSize: '20px', cursor: 'pointer' }} />
      </Tooltip> */}

      {/* Tài khoản (Dropdown) */}
      <Dropdown overlay={accountMenu} trigger={['click']} placement="bottomRight">
        <Tooltip >
          <UserOutlined style={{ fontSize: '20px', cursor: 'pointer' }} />
        </Tooltip>
      </Dropdown>
    </div>
  );
};

export default HeaderIcons;
