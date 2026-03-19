import { Card, Col, Row, Statistic, List, Avatar, Tag, Button } from 'antd';
import { UserOutlined, FileTextOutlined, CalendarOutlined, BellOutlined, TrophyOutlined } from '@ant-design/icons';
import { useAuth } from '../../hook/useAuth';

export const VCDashboard = () => {
  const { user } = useAuth();

  const mockNotifications = [
    { 
      id: 1, 
      title: 'Hồ sơ của bạn đã được cập nhật', 
      time: '2 giờ trước',
      type: 'success'
    },
    { 
      id: 2, 
      title: 'Bạn được đưa vào quy hoạch mới', 
      time: '1 ngày trước',
      type: 'info'
    },
    { 
      id: 3, 
      title: 'Lịch họp sắp tới', 
      time: '3 ngày trước',
      type: 'warning'
    },
  ];

  const mockProfile = {
    ho_va_ten: user?.ho_va_ten || 'Nguyễn Văn A',
    ma_vien_chuc: 'VC001',
    don_vi: 'Phòng Tổ chức cán bộ',
    chuc_danh: 'Chuyên viên chính',
    trang_thai_hoc_ham: 'Cao học lý chính trị',
    ngay_sinh: '15/02/1985',
  };

  return (
    <div className="p-6 space-y-6 bg-[#F8FAFC] min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Dashboard Viên Chức</h1>
        <div className="text-sm text-slate-600">
          Chào mừng, <span className="font-semibold">{user?.ho_va_ten}</span>
        </div>
      </div>
      
      {/* Thông tin cá nhân */}
      <Card title="Thông tin cá nhân" className="shadow-sm rounded-xl border-none">
        <Row gutter={16}>
          <Col span={6}>
            <div className="text-center">
              <Avatar size={80} icon={<UserOutlined />} className="mb-3" />
              <h3 className="font-semibold">{mockProfile.ho_va_ten}</h3>
              <p className="text-slate-600">{mockProfile.ma_vien_chuc}</p>
            </div>
          </Col>
          <Col span={18}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-600">Đơn vị:</p>
                <p className="font-semibold">{mockProfile.don_vi}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Chức danh:</p>
                <p className="font-semibold">{mockProfile.chuc_danh}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Trình độ:</p>
                <p className="font-semibold">{mockProfile.trang_thai_hoc_ham}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Ngày sinh:</p>
                <p className="font-semibold">{mockProfile.ngay_sinh}</p>
              </div>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Thống kê cá nhân */}
      <Row gutter={16}>
        <Col span={6}>
          <Card className="shadow-sm rounded-xl border-none">
            <Statistic 
              title="Hồ sơ" 
              value={1} 
              prefix={<FileTextOutlined className="text-blue-500" />}
              suffix="bản ghi"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="shadow-sm rounded-xl border-none">
            <Statistic 
              title="Quy hoạch" 
              value={3} 
              prefix={<TrophyOutlined className="text-green-500" />}
              suffix="lần"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="shadow-sm rounded-xl border-none">
            <Statistic 
              title="Bổ nhiệm" 
              value={2} 
              prefix={<CalendarOutlined className="text-purple-500" />}
              suffix="lần"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="shadow-sm rounded-xl border-none">
            <Statistic 
              title="Thông báo" 
              value={5} 
              prefix={<BellOutlined className="text-orange-500" />}
              suffix="mới"
            />
          </Card>
        </Col>
      </Row>

      {/* Thông báo và hoạt động */}
      <Row gutter={16}>
        <Col span={12}>
          <Card title="Thông báo mới" className="shadow-sm rounded-xl border-none" style={{ height: '400px' }}>
            <List
              dataSource={mockNotifications}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Tag color={
                        item.type === 'success' ? 'green' : 
                        item.type === 'warning' ? 'orange' : 'blue'
                      }>
                        {item.type === 'success' ? '✓' : 
                         item.type === 'warning' ? '!' : 'i'}
                      </Tag>
                    }
                    title={item.title}
                    description={item.time}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Hành động nhanh" className="shadow-sm rounded-xl border-none" style={{ height: '400px' }}>
            <div className="space-y-4">
              <Button type="primary" size="large" block className="h-12">
                Xem hồ sơ cá nhân
              </Button>
              <Button size="large" block className="h-12">
                Xem quy hoạch
              </Button>
              <Button size="large" block className="h-12">
                Xem lịch công tác
              </Button>
              <Button size="large" block className="h-12">
                Nộp hồ sơ
              </Button>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
