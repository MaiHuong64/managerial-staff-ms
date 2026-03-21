import { Card, Col, Row, Statistic, Table, Button, Tag, Badge, Tabs } from 'antd';
import { 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  ExclamationCircleOutlined,
  FileTextOutlined,
  TeamOutlined,
  BarChartOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import { useAuth } from '../../hook/useAuth';

const { TabPane } = Tabs;

export const BGHDashboard = () => {
  const { user } = useAuth();

  const mockPendingApprovals = [
    { 
      key: '1', 
      loai: 'Quy hoạch', 
      ten: 'Quy hoạch cán bộ Q1/2024', 
      nguoi_tao: 'Trần Thị B',
      ngay_tao: '15/03/2024',
      trang_thai: 'Chờ duyệt'
    },
    { 
      key: '2', 
      loai: 'Bổ nhiệm', 
      ten: 'Bổ nhiệm chuyên viên chính', 
      nguoi_tao: 'Nguyễn Văn A',
      ngay_tao: '14/03/2024',
      trang_thai: 'Chờ duyệt'
    },
    { 
      key: '3', 
      loai: 'Quy hoạch', 
      ten: 'Quy hoạch luân chuyển', 
      nguoi_tao: 'Lê Văn C',
      ngay_tao: '13/03/2024',
      trang_thai: 'Chờ duyệt'
    },
  ];

  const mockStatistics = [
    { 
      key: '1', 
      chi_tieu: 'Tổng quy hoạch', 
      gia_tri: 15, 
      da_duyet: 12,
      cho_duyet: 3
    },
    { 
      key: '2', 
      chi_tieu: 'Tổng bổ nhiệm', 
      gia_tri: 8, 
      da_duyet: 6,
      cho_duyet: 2
    },
    { 
      key: '3', 
      chi_tieu: 'Tổng luân chuyển', 
      gia_tri: 5, 
      da_duyet: 4,
      cho_duyet: 1
    },
  ];

  const approvalColumns = [
    { title: 'Loại', dataIndex: 'loai', key: 'loai' },
    { title: 'Tên', dataIndex: 'ten', key: 'ten' },
    { title: 'Người tạo', dataIndex: 'nguoi_tao', key: 'nguoi_tao' },
    { title: 'Ngày tạo', dataIndex: 'ngay_tao', key: 'ngay_tao' },
    { 
      title: 'Trạng thái', 
      dataIndex: 'trang_thai', 
      key: 'trang_thai',
      render: (status: string) => (
        <Tag color={status === 'Chờ duyệt' ? 'orange' : 'green'}>
          {status}
        </Tag>
      )
    },
  ];

  const statisticsColumns = [
    { title: 'Chỉ tiêu', dataIndex: 'chi_tieu', key: 'chi_tieu' },
    { title: 'Tổng', dataIndex: 'gia_tri', key: 'gia_tri' },
    { title: 'Đã duyệt', dataIndex: 'da_duyet', key: 'da_duyet' },
    { title: 'Chờ duyệt', dataIndex: 'cho_duyet', key: 'cho_duyet' },
    { 
      title: 'Tiến độ', 
      key: 'tien_do',
      render: (record: unknown) => {
        const percent = Math.round((record.da_duyet / record.gia_tri) * 100);
        return (
          <div className="flex items-center">
            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
              <div 
                className="bg-green-500 h-2 rounded-full" 
                style={{ width: `${percent}%` }}
              />
            </div>
            <span className="text-sm">{percent}%</span>
          </div>
        );
      }
    },
  ];

  return (
    <div className="p-6 space-y-6 bg-[#F8FAFC] min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Dashboard Ban Giám Hiệu</h1>
        <div className="text-sm text-slate-600">
          Chào mừng, <span className="font-semibold">{user?.ho_va_ten}</span>
        </div>
      </div>
      
      {/* Thống kê tổng quan */}
      <Row gutter={16}>
        <Col span={6}>
          <Card className="shadow-sm rounded-xl border-none">
            <Statistic 
              title="Chờ duyệt" 
              value={6} 
              prefix={<ClockCircleOutlined className="text-orange-500" />}
              valueStyle={{ color: '#f97316' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="shadow-sm rounded-xl border-none">
            <Statistic 
              title="Đã duyệt hôm nay" 
              value={8} 
              prefix={<CheckCircleOutlined className="text-green-500" />}
              valueStyle={{ color: '#16a34a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="shadow-sm rounded-xl border-none">
            <Statistic 
              title="Cần xem xét" 
              value={3} 
              prefix={<ExclamationCircleOutlined className="text-red-500" />}
              valueStyle={{ color: '#dc2626' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="shadow-sm rounded-xl border-none">
            <Statistic 
              title="Tỷ lệ duyệt" 
              value={85} 
              suffix="%" 
              prefix={<BarChartOutlined className="text-blue-500" />}
              valueStyle={{ color: '#2563eb' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Tabs quản lý */}
      <Card className="shadow-sm rounded-xl border-none">
        <Tabs defaultActiveKey="approvals">
          <TabPane tab={
            <span>
              Chờ duyệt 
              <Badge count={6} style={{ marginLeft: 8 }} />
            </span>
          } key="approvals">
            <Table
              dataSource={mockPendingApprovals}
              columns={approvalColumns}
              pagination={{ pageSize: 5 }}
              size="small"
            />
          </TabPane>
          
          <TabPane tab="Thống kê" key="statistics">
            <Table
              dataSource={mockStatistics}
              columns={statisticsColumns}
              pagination={false}
              size="small"
            />
          </TabPane>
          
          <TabPane tab="Lịch làm việc" key="schedule">
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">Hôm nay - 20/03/2024</h4>
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <CalendarOutlined className="mr-2 text-blue-600" />
                    <span>09:00 - Họp UBND tỉnh</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <FileTextOutlined className="mr-2 text-blue-600" />
                    <span>14:00 - Xét duyệt quy hoạch Q1/2024</span>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2">Ngày mai - 21/03/2024</h4>
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <CalendarOutlined className="mr-2 text-gray-600" />
                    <span>10:00 - Họp Ban Giám đốc</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <TeamOutlined className="mr-2 text-gray-600" />
                    <span>15:00 - Gặp gỡ cán bộ mới</span>
                  </div>
                </div>
              </div>
            </div>
          </TabPane>
        </Tabs>
      </Card>

      {/* Hành động nhanh */}
      <Card title="Hành động quản lý" className="shadow-sm rounded-xl border-none">
        <Row gutter={16}>
          <Col span={6}>
            <Button type="primary" size="large" block className="h-12">
              <FileTextOutlined /> Duyệt quy hoạch
            </Button>
          </Col>
          <Col span={6}>
            <Button type="primary" size="large" block className="h-12">
              <CheckCircleOutlined /> Duyệt bổ nhiệm
            </Button>
          </Col>
          <Col span={6}>
            <Button type="default" size="large" block className="h-12">
              <BarChartOutlined /> Báo cáo tổng hợp
            </Button>
          </Col>
          <Col span={6}>
            <Button type="default" size="large" block className="h-12">
              <TeamOutlined /> Quản lý người dùng
            </Button>
          </Col>
        </Row>
      </Card>
    </div>
  );
};
