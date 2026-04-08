import React from 'react';
import { Card, Col, Row, Statistic, List, Avatar, Button } from 'antd';
import {
  UserOutlined,
  FileTextOutlined,
  CalendarOutlined,
  BellOutlined,
  TrophyOutlined,
  RightOutlined
} from '@ant-design/icons';
import { useAuth } from '../../hook/useAuth';

// Định nghĩa Interface cho dữ liệu
interface NotificationItem {
  id: number;
  title: string;
  time: string;
  type: 'success' | 'info' | 'warning';
}

export const VCDashboard: React.FC = () => {
  const { user } = useAuth();

  // Mock profile data (sẽ lấy từ API sau)
  const userProfile = {
    ma_vien_chuc: 'VC001',
    don_vi: 'Phòng Tổ chức cán bộ',
    chuc_danh: 'Chuyên viên chính',
    trang_thai_hoc_ham: 'Cao học lý chính trị',
    ngay_sinh: '15/02/1985',
  };

  const mockNotifications: NotificationItem[] = [
    { id: 1, title: 'Hồ sơ của bạn đã được cập nhật', time: '2 giờ trước', type: 'success' },
    { id: 2, title: 'Bạn được đưa vào quy hoạch mới', time: '1 ngày trước', type: 'info' },
    { id: 3, title: 'Lịch họp sắp tới', time: '3 ngày trước', type: 'warning' },
  ];

  return (
    <div className="p-6 space-y-6 bg-[#F8FAFC] min-h-screen font-sans">
      {/* Header: Chào mừng */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 m-0">Dashboard Viên Chức</h1>
          <p className="text-slate-500 text-sm">Hệ thống quản lý thông tin nhân sự</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-100">
          <span className="text-slate-600">Chào mừng, </span>
          <span className="font-semibold text-blue-600">{user?.ho_va_ten || 'Viên chức'}</span>
        </div>
      </div>
      
      {/* Hàng 2: Thông tin cá nhân (Nổi bật nhất) */}
      <Card 
        title={<span className="text-slate-700 font-bold">Thông tin cá nhân</span>} 
        className="shadow-sm rounded-xl border-none overflow-hidden"
      >
        <Row gutter={[32, 16]} align="middle">
          <Col xs={24} md={6} className="text-center border-r border-slate-100">
            <Avatar size={100} icon={<UserOutlined />} className="mb-4 bg-blue-50 text-blue-500 shadow-inner" />
            <h3 className="text-lg font-bold text-slate-800 m-0">{user?.ho_va_ten || 'Viên chức'}</h3>
            <p className="text-slate-500 font-medium">{userProfile.ma_vien_chuc}</p>
          </Col>
          <Col xs={24} md={18}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-12 p-2">
              <div>
                <p className="text-[12px] uppercase tracking-wider text-slate-400 font-bold mb-1">Đơn vị</p>
                <p className="text-[15px] font-semibold text-slate-700">{userProfile.don_vi}</p>
              </div>
              <div>
                <p className="text-[12px] uppercase tracking-wider text-slate-400 font-bold mb-1">Chức danh</p>
                <p className="text-[15px] font-semibold text-slate-700">{userProfile.chuc_danh}</p>
              </div>
              <div>
                <p className="text-[12px] uppercase tracking-wider text-slate-400 font-bold mb-1">Trình độ</p>
                <p className="text-[15px] font-semibold text-slate-700">{userProfile.trang_thai_hoc_ham}</p>
              </div>
              <div>
                <p className="text-[12px] uppercase tracking-wider text-slate-400 font-bold mb-1">Ngày sinh</p>
                <p className="text-[15px] font-semibold text-slate-700">{userProfile.ngay_sinh}</p>
              </div>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Hàng 3: 4 Stat Cards */}
      <Row gutter={[16, 16]}>
        {[
          { title: 'Hồ sơ', val: 1, unit: 'bản ghi', icon: <FileTextOutlined />, color: 'text-blue-500', bg: 'bg-blue-50' },
          { title: 'Quy hoạch', val: 3, unit: 'lần', icon: <TrophyOutlined />, color: 'text-green-500', bg: 'bg-green-50' },
          { title: 'Bổ nhiệm', val: 2, unit: 'lần', icon: <CalendarOutlined />, color: 'text-purple-500', bg: 'bg-purple-50' },
          { title: 'Thông báo', val: 5, unit: 'mới', icon: <BellOutlined />, color: 'text-orange-500', bg: 'bg-orange-50' },
        ].map((item, index) => (
          <Col xs={12} lg={6} key={index}>
            <Card className="shadow-sm rounded-xl border-none hover:shadow-md transition-shadow">
              <Statistic 
                title={<span className="text-slate-500 font-medium">{item.title}</span>} 
                value={item.val} 
                prefix={<span className={`${item.color} ${item.bg} p-2 rounded-lg mr-2`}>{item.icon}</span>}
                suffix={<span className="text-xs text-slate-400 lowercase">{item.unit}</span>}
                valueStyle={{ fontWeight: 700, color: '#1e293b' }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Hàng 4: Thông báo & Hành động */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card 
            title={<span className="text-slate-700 font-bold">Thông báo mới</span>} 
            extra={<Button type="link" size="small">Xem tất cả</Button>}
            className="shadow-sm rounded-xl border-none h-full min-h-100"
          >
            <List
              itemLayout="horizontal"
              dataSource={mockNotifications}
              renderItem={(item) => (
                <List.Item className="hover:bg-slate-50 px-2 rounded-lg transition-colors border-b border-slate-50 last:border-none cursor-pointer group">
                  <List.Item.Meta
                    avatar={
                      <div className={`mt-1 p-2 rounded-full flex items-center justify-center ${
                        item.type === 'success' ? 'bg-green-100 text-green-600' : 
                        item.type === 'warning' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
                      }`}>
                        {item.type === 'success' ? '✓' : item.type === 'warning' ? '!' : 'i'}
                      </div>
                    }
                    title={<span className="text-slate-700 font-semibold group-hover:text-blue-600 transition-colors">{item.title}</span>}
                    description={<span className="text-slate-400 text-xs">{item.time}</span>}
                  />
                  <RightOutlined className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card 
            title={<span className="text-slate-700 font-bold">Hành động nhanh</span>} 
            className="shadow-sm rounded-xl border-none h-full min-h-100"
          >
            <div className="flex flex-col gap-4 py-2">
              <Button 
                type="primary" 
                size="large" 
                block 
                className="h-14 rounded-xl font-bold shadow-blue-100 shadow-lg flex items-center justify-center"
                icon={<UserOutlined />}
              >
                Xem hồ sơ cá nhân
              </Button>
              <Button 
                size="large" 
                block 
                className="h-14 rounded-xl font-semibold border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-600 flex items-center justify-center"
                icon={<TrophyOutlined className="text-green-500" />}
              >
                Xem quy hoạch
              </Button>
              <Button 
                size="large" 
                block 
                className="h-14 rounded-xl font-semibold border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-600 flex items-center justify-center"
                icon={<CalendarOutlined className="text-purple-500" />}
              >
                Xem lịch công tác
              </Button>
              <Button 
                size="large" 
                block 
                className="h-14 rounded-xl font-semibold border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-600 flex items-center justify-center"
                icon={<FileTextOutlined className="text-orange-500" />}
              >
                Nộp hồ sơ mới
              </Button>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};