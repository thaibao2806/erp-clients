import PTIcon from '../assets/images/modules/ct_hc.png';
import FNIcon from '../assets/images/modules/tc.png';
import PMIcon from '../assets/images/modules/dd_sx.png';
import PLIcon from '../assets/images/modules/kh_kd.png';
import KTIcon from '../assets/images/modules/kt_vt.png';

export const moduleData = {
    TM: { // Sales Order
      lable: 'KT-VT-CN',
      name: 'Ban Kỹ thuật - Vật tư - Công nghệ',
      icon: KTIcon,
      pages: [
        { key: 'so-orders', label: 'Đơn hàng bán', path: '/so/orders' },
        { key: 'so-delivery', label: 'Tình trạng giao hàng', path: '/so/delivery-status' },
        { key: 'so-pricelist', label: 'Bảng giá', path: '/so/price-list' },
        { key: 'tm-task', label: 'Công việc', path: '/tm/task' },
      ],
    },
    PL: { // Purchase Order
      lable: 'KH-KD',
      name: 'Ban Kế hoạch - Kinh doanh',
      icon: PLIcon,
      pages: [
        { key: 'pl-phieu-giao-viec', label: 'A. Phiếu giao việc', path: '/pl/phieu-giao-viec' },
        { key: 'pl-ke-hoach', label: 'B. Kế hoạch', children: [
          { key: 'pl-ke-hoach', label: '1. Kế hoạch', path: '/pl/ke-hoach/ke-hoach' },
          { key: 'pl-ke-hoach-chay-thu', label: '2. Kế hoạch chạy thử', path: '/pl/ke-hoach/ke-hoach-chay-thu' },
          // { key: 'pm-bien-ban-khao-sat-thiet-bi', label: '3. Xác nhận tình trạng', path: '/pm/bien-ban/bien-ban-khao-sat-thiet-bi' },
          // { key: 'pm-bien-ban-nghiem-thu-sau-sua-chua', label: '4. Kiểm tra sau sửa chữa', path: '/pm/bien-ban/bien-ban-nghiem-thu-sau-sua-chua' },
          // { key: 'pm-vi-pham-atld', label: '5. Vi phạm ATLD', path: '/pm/bien-ban/vi-pham-atld' },
        ] },
        { key: 'pl-bien-ban', label: 'C. Biên bản', children: [
          { key: 'pl-bien-ban-tiep-nhan', label: '1. Biên bản tiếp nhận', path: '/pl/bien-ban/bien-ban-tiep-nhan' },
          // { key: 'pm-bien-ban-thu-hoi-vat-tu', label: '2. Thu hồi vật tư', path: '/pm/bien-ban/bien-ban-thu-hoi-vat-tu' },
          // { key: 'pm-bien-ban-khao-sat-thiet-bi', label: '3. Xác nhận tình trạng', path: '/pm/bien-ban/bien-ban-khao-sat-thiet-bi' },
          // { key: 'pm-bien-ban-nghiem-thu-sau-sua-chua', label: '4. Kiểm tra sau sửa chữa', path: '/pm/bien-ban/bien-ban-nghiem-thu-sau-sua-chua' },
          // { key: 'pm-vi-pham-atld', label: '5. Vi phạm ATLD', path: '/pm/bien-ban/vi-pham-atld' },
        ] },
        { key: 'pl-task', label: 'D. Công việc', path: '/pl/task' },
      ],
    },
    FN: { // Warehouse Management
      lable:'TC',
      name: 'Ban Tài Chính',
      icon: FNIcon,
      pages: [
        { key: 'wm-inventory', label: 'Tồn kho', path: '/wm/inventory' },
        { key: 'wm-transfer', label: 'Chuyển kho', path: '/wm/transfer' },
        { key: 'fn-task', label: 'Công việc', path: '/fn/task' },
      ],
    },
    PT: { // Customer Relationship Management
      lable:'CT-HC',
      name: 'Ban chính trị - hành chính',
      icon: PTIcon,
      pages: [
        { key: 'crm-customers', label: 'Danh sách khách hàng', path: '/crm/customers' },
        { key: 'crm-opportunities', label: 'Cơ hội bán hàng', path: '/crm/opportunities' },
        { key: 'pt-task', label: 'Công việc', path: '/pt/task' },
      ],
    },
    PM: { // Customer Relationship Management
        lable: 'DDSX',
        name: 'Điều độ sản xuất',
        icon: PMIcon,
        pages: [
          // { key: 'pm-dashboard', label: 'A. Dashboard', path: '/pm/dashboard' },
          // { key: 'pm-chamcong', label: 'A. Chấm công', path: '/pm/cham-cong' },
          // { key: 'pm-bien-ban', label: 'B. Biên bản', children: [
          //   { key: 'pm-bien-ban-ban-giao', label: '1. Bàn giao, thu hồi TB-VT', path: '/pm/bien-ban/bien-ban-ban-giao-thu-hoi' },
          //   // { key: 'pm-bien-ban-thu-hoi-vat-tu', label: '2. Thu hồi vật tư', path: '/pm/bien-ban/bien-ban-thu-hoi-vat-tu' },
          //   { key: 'pm-bien-ban-khao-sat-thiet-bi', label: '2. Xác nhận tình trạng', path: '/pm/bien-ban/bien-ban-khao-sat-thiet-bi' },
          //   { key: 'pm-bien-ban-nghiem-thu-sau-sua-chua', label: '3. Kiểm tra sau sửa chữa', path: '/pm/bien-ban/bien-ban-nghiem-thu-sau-sua-chua' },
          //   // { key: 'pm-vi-pham-atld', label: '5. Vi phạm ATLD', path: '/pm/bien-ban/vi-pham-atld' },
          // ] },
          { key: 'pm-bao-cao', label: 'A. Báo cáo', children: [
            { key: 'pm-bao-cao-kiem-ke', label: '1. Kiểm kê thiết bị', path: '/pm/bao-cao/kiem-ke-thiet-bi' },
            // { key: 'pm-bao-cao-nhan-cong', label: '1. Nhân công các tổ', path: '/pm/bao-cao/bao-cao-nhan-cong' },
            // { key: 'pm-bao-cao-thanh-tich', label: '2. Thành tích', path: '/pm/bao-cao/bao-cao-thanh-tich' },
            // { key: 'pm-bao-cao-chap-hanh-noi-quy', label: '3. Chấp hành nội quy', path: '/pm/bao-cao/bao-cao-chap-hanh-noi-quy' },
          ] },
          { key: 'pm-de-xuat', label: 'B. Đề xuất', children: [
            { key: 'pm-de-xuat-sua-chua', label: '1. Sửa chữa, thanh lý', path: '/pm/de-xuat/de-xuat-sua-chua-thanh-ly' },
            // { key: 'pm-de-xuat-thanh-ly', label: '2. Thanh lý', path: '/pm/de-xuat/de-xuat-thanh-ly' },
            { key: 'pm-de-xuat-mua-vat-tu-ccdc', label: '2. Mua, cấp, sửa VT CCDC', path: '/pm/de-xuat/de-xuat-mua-cap-sua' },
          //   { key: 'pm-de-xuat-vat-tu-sua-chua', label: '4. Vật tư sửa chữa', path: '/pm/de-xuat/de-xuat-vat-tu-sua-chua' },
          //   { key: 'pm-de-xuat-cap-may-moc-thiet-bi', label: '5. Cấp máy móc, thiết bị', path: '/pm/de-xuat/de-xuat-cap-may-moc-thiet-bi' },
          ] },
          { key: 'pm-so-kho', label: 'C. Sổ kho', path: '/pm/so-kho' },
          // { key: 'pm-du-an', label: 'D. Dự án', path: '/pm/du-an' },
          { key: 'pm-tien-do', label: 'D. Tiến độ sửa chữa', path: '/pm/tien-do' },
          // { key: 'pm-so-giao-nhan', label: 'H. Sổ giao nhận', path: '/pm/so-giao-nhan' },
          { key: 'pm-task', label: 'E. Công việc', path: '/pm/cong-viec' },
        ],
      },
    // Thêm các module khác nếu cần
  };
  
  // Lấy danh sách keys của các module
  const moduleKeys = Object.keys(moduleData);
  
  // Xác định thông tin mặc định
  let defaultModuleKey = '';
  let defaultPageKey = '';
  let defaultPath = '/'; // Đường dẫn fallback
  
  if (moduleKeys.length > 0) {
    defaultModuleKey = moduleKeys[0]; // Lấy key của module đầu tiên
    const firstModulePages = moduleData[defaultModuleKey]?.pages;
    if (firstModulePages && firstModulePages.length > 0) {
      defaultPageKey = firstModulePages[0].key; // Lấy key của trang đầu tiên
      defaultPath = firstModulePages[0].path; // Lấy path của trang đầu tiên
    }
  }
  
  // Tạo danh sách modules cho Select component
  export const modules = moduleKeys.map(key => ({
    value: key,
    label: moduleData[key].label,
  }));
  
  // Export các giá trị mặc định để sử dụng ở nơi khác
  export { defaultModuleKey, defaultPageKey, defaultPath };