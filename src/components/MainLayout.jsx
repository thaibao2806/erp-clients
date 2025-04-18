import React, { useState, useEffect } from 'react';
import { Layout, Menu, Select, Typography, Button, Tooltip, Dropdown, Avatar } from 'antd'; // Thêm Tooltip
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { moduleData, modules, defaultModuleKey, defaultPageKey } from '../data/modules'; // Import cấu hình của bạn
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  AppstoreOutlined, // Icon đại diện cho Module khi thu gọn
  CaretDownOutlined,
  EditOutlined,
  CalendarOutlined,
  CustomerServiceOutlined,
  BellOutlined,
  QuestionCircleOutlined,
  SettingOutlined,
  UserOutlined,
  // Thêm các icon bạn dùng cho menu items ở đây nếu có
} from '@ant-design/icons';
import HeaderIcons from './HeaderIcon';
import Title from 'antd/es/typography/Title';
import QuoteMarquee from './QuoteMarquee';

const { Header, Content, Footer, Sider } = Layout;
const { Option } = Select;
const { Text } = Typography; // Dùng Text để gói nội dung Header

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false); // State quản lý thu gọn Sider
  const [selectedModuleKey, setSelectedModuleKey] = useState(defaultModuleKey);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedKeys, setSelectedKeys] = useState(defaultPageKey ? [defaultPageKey] : []);

  const navigate = useNavigate();
  const location = useLocation();

  const SIDER_WIDTH_EXPANDED = 250; // Chiều rộng Sider khi mở
  const SIDER_WIDTH_COLLAPSED = 80; // Chiều rộng Sider khi đóng (chuẩn Antd)

  useEffect(() => {
    if (!selectedModuleKey && modules.length > 0) {
      // Lấy module đầu tiên
      const firstModule = modules[0].value;
      setSelectedModuleKey(firstModule);
  
      // Nếu module có trang, chọn trang đầu tiên và điều hướng
      const firstPage = moduleData[firstModule]?.pages[0];
      if (firstPage) {
        navigate(firstPage.path);
        setSelectedKeys([firstPage.key]);
      }
    }
  }, [selectedModuleKey, navigate]);
  

  // --- Cập nhật Menu items dựa trên Module được chọn ---
  useEffect(() => {
    if (selectedModuleKey && moduleData[selectedModuleKey]) {
      const currentModule = moduleData[selectedModuleKey];
  
      const createMenuItem = (page) => {
        if (page.children && page.children.length > 0) {
          return {
            key: page.key,
            label: page.label,
            children: page.children.map((subPage) => ({
              key: subPage.key,
              label: subPage.label,
              onClick: () => navigate(subPage.path),
            })),
          };
        } else {
          return {
            key: page.key,
            label: page.label,
            onClick: () => navigate(page.path),
          };
        }
      };
  
      const pages = currentModule.pages.map(createMenuItem);
      setMenuItems(pages);
    } else {
      setMenuItems([]);
    }
  }, [selectedModuleKey, navigate, location.pathname]); // Thêm location.pathname nếu cần logic chọn trang đầu tiên

  // --- Đồng bộ Sider (Module + Menu item) với URL hiện tại ---
  useEffect(() => {
    const currentPath = location.pathname;
    let foundPageKey = '';
    let foundModuleKey = '';
  
    Object.entries(moduleData).forEach(([moduleKey, moduleInfo]) => {
      moduleInfo.pages.forEach(page => {
        if (page.path === currentPath) {
          foundPageKey = page.key;
          foundModuleKey = moduleKey;
        } else if (page.children) {
          page.children.forEach(child => {
            if (child.path === currentPath) {
              foundPageKey = child.key;
              foundModuleKey = moduleKey;
            }
          });
        }
      });
    });
  
    if (foundPageKey) {
      setSelectedKeys([foundPageKey]);
      if (foundModuleKey && foundModuleKey !== selectedModuleKey) {
        setSelectedModuleKey(foundModuleKey);
      }
    } else {
      setSelectedKeys([]);
    }
  }, [location.pathname, selectedModuleKey]);

  // --- Xử lý khi người dùng chọn Module khác từ Select ---
  const handleModuleChange = (value) => {
    setSelectedModuleKey(value);
    // Tự động điều hướng đến trang đầu tiên của module mới
    const firstPage = moduleData[value]?.pages[0];
    if (firstPage) {
        navigate(firstPage.path);
        // Cập nhật selectedKeys ngay để highlight đúng menu item
        setSelectedKeys([firstPage.key]);
    } else {
        // Module mới không có trang nào
        setMenuItems([]);
        setSelectedKeys([]);
        // Có thể điều hướng về trang chủ hoặc trang lỗi
        // navigate('/');
    }
  };

  // --- Xử lý Toggle Sider ---
  const toggleSider = () => {
    setCollapsed(!collapsed);
  };

  const moduleMenu = (
    <Menu>
      {modules.map(module => (
        <Menu.Item key={module.value} onClick={() => handleModuleChange(module.value)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, padding:5 }}>
            <Avatar src={moduleData[module.value]?.icon} size={50} />
            <div>
              <div style={{ fontWeight: 'bold', fontSize: 18 }}>{moduleData[module.value]?.lable}</div>
              <div style={{ fontSize: 16, color: '#666' }}>{moduleData[module.value]?.name}</div>
            </div>
          </div>
        </Menu.Item>
      ))}
    </Menu>
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* ========== SIDER ========== */}
      <Sider
        theme="dark"
        trigger={null} // Quan trọng: Ẩn trigger mặc định
        collapsible
        collapsed={collapsed}
        width={SIDER_WIDTH_EXPANDED}
        collapsedWidth={SIDER_WIDTH_COLLAPSED}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 101, // Đảm bảo Sider luôn ở trên
          borderRight: '1px solid #f0f0f0', // Thêm đường viền phải nhẹ nhàng
        }}
      >
        {/* Phần Header của Sider (chứa Select hoặc Icon) */}
        <div
          style={{
            height: '64px', // Bằng chiều cao Header chính
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start', // Căn giữa icon khi thu gọn
            padding: collapsed ? '0' : '0 16px', // Padding khi mở
            position: 'sticky', // Giữ cố định khi scroll menu
            top: 0,
            color:"#ffff",
            //background: '#fff',
            zIndex: 1, // Trên Menu
            borderBottom: '1px solid #f0f0f0', // Đường kẻ dưới
            transition: 'padding 0.2s cubic-bezier(0.645, 0.045, 0.355, 1)',
          }}
        >
          <Dropdown overlay={moduleMenu} trigger={['click']} placement="bottomLeft">
              <Tooltip placement="right" style={{cursor: 'pointer'}}>
                <AppstoreOutlined style={{ fontSize: '30px', color: '#1890ff', cursor: 'pointer' }} />
                {!collapsed && <Text style={{ color: '#1890ff', fontWeight: 'bold', margin: 0, fontSize:"30px", cursor: 'pointer', paddingLeft:"15px"}}>SƠN HẢI</Text>}     
              </Tooltip>
            </Dropdown>
        </div>

        {/* Menu điều hướng */}
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={selectedKeys}
          items={menuItems}
          style={{ borderRight: 0, paddingTop: 8 }} // Giảm padding top một chút
          // inlineCollapsed={collapsed} // Sider tự quản lý khi có prop `collapsed`
        />
      </Sider>

      {/* ========== LAYOUT CHÍNH (Header, Content, Footer) ========== */}
      <Layout
        style={{
          marginLeft: collapsed ? SIDER_WIDTH_COLLAPSED : SIDER_WIDTH_EXPANDED,
          transition: 'margin-left 0.2s cubic-bezier(0.645, 0.045, 0.355, 1)', // Hiệu ứng mượt
        }}
      >
        {/* ========== HEADER ========== */}
        <Header
          style={{
            padding: '0 16px',
            background: '#fff',
            borderBottom: '1px solid #f0f0f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between', // Canh đều các phần
            position: 'sticky',
            top: 0,
            zIndex: 100,
            width: '100%',
          }}
        >
          {/* Nút Trigger Thu gọn/Mở rộng */}
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={toggleSider}
            style={{
              fontSize: '16px',
              width: 64, // Chiều rộng cố định
              height: '100%', // Chiều cao bằng Header
              marginRight: 16, // Khoảng cách với text bên phải
              marginLeft: -16, // Bù lại padding của Header để nút sát lề trái
              color: '#000000d9', // Màu icon
              borderRadius: 0, // Bỏ bo góc nếu muốn
            }}
          />

          <QuoteMarquee/>

          <HeaderIcons />
          {/* Có thể thêm các thành phần khác vào đây (VD: Avatar, chuông thông báo) */}
        </Header>

        {/* ========== CONTENT ========== */}
        <Content
          style={{
            margin: '24px 16px 0px 16px',
            paddingRight: 16, // thêm chút padding phải cho đẹp
            height: 'calc(100vh - 64px - 48px - 10px)', // 64px là Header, 48px là Footer
            overflowY: 'auto', // Cho phép scroll dọc
          }}
        >
          <div
            style={{
              padding:20,
              background: '#fff',
              borderRadius: "10px",
              minHeight: '100%', // đảm bảo full chiều cao trong Content
            }}
          >
            <Outlet />
          </div>
        </Content>


        {/* ========== FOOTER ========== */}
        <Footer style={{ textAlign: 'center', padding: '10px 0' }}>
          Công ty TNHH MTV Đóng tàu Sơn Hải ©{new Date().getFullYear()}
        </Footer>
      </Layout>
    </Layout>
  );
};

export default MainLayout;