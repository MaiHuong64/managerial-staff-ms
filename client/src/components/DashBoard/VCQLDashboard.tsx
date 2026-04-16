import React from 'react';
import { Card, Col, Row, Statistic, Table, Button, Tag, Progress } from 'antd';
import { 
  UserOutlined, 
  TeamOutlined, 
  FileTextOutlined, 
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  BarChartOutlined,
  RightOutlined
} from '@ant-design/icons';
import { useAuth } from '../../hook/useAuth';

export const VCQLDashboard: React.FC = () => {
  const { user } = useAuth();

  // Dữ liệu giả lập cho danh sách viên chức đơn vị
  const mockStaffData = [
    { 
      key: '1', 
      ma_vc: 'VC001', 
      ho_va_ten: 'Nguyễn Văn A', 
      don_vi: 'Phòng Tổ chức',
      chuc_danh: 'Chuyên viên chính',
      trang_thai: 'Đang làm việc'
    },
    { 
      key: '2', 
      ma_vc: 'VC002', 
      ho_va_ten: 'Trần Thị B', 
      don_vi: 'Phòng Tổ chức',
      chuc_danh: 'Chuyên viên',
      trang_thai: 'Đang làm việc'
    },
    { 
      key: '3', 
      ma_vc: 'VC003', 
      ho_va_ten: 'Lê Văn C', 
      don_vi: 'Phòng Tổ chức',
      chuc_danh: 'Chuyên viên tập sự',
      trang_thai: 'Tạm nghỉ'
    },
  ];

  // Dữ liệu giả lập cho tiến độ quy hoạch
  const mockPlanningData = [
    { 
      key: '1', 
      ten_dot_qh: 'Quy hoạch Q1/2024', 
      so_luong: 15, 
      da_phan_bo: 8,
      trang_thai: 'Đang thực hiện'
    },
    { 
      key: '2', 
      ten_dot_qh: 'Quy hoạch Q4/2023', 
      so_luong: 20, 
      da_phan_bo: 20,
      trang_thai: 'Hoàn thành'
    },
  ];

  const staffColumns = [
    { title: 'Mã VC', dataIndex: 'ma_vc', key: 'ma_vc' },
    { title: 'Họ và tên', dataIndex: 'ho_va_ten', key: 'ho_va_ten' },
    { title: 'Chức danh', dataIndex: 'chuc_danh', key: 'chuc_danh' },
    { 
      title: 'Trạng thái', 
      dataIndex: 'trang_thai', 
      key: 'trang_thai',
      render: (status: string) => (
        <Tag color={status === 'Đang làm việc' ? 'green' : 'orange'} className="rounded-full px-3">
          {status}
        </Tag>
      )
    },
  ];

  const planningColumns = [
    { title: 'Tên đợt QH', dataIndex: 'ten_dot_qh', key: 'ten_dot_qh' },
    { 
      title: 'Tiến độ', 
      key: 'tien_do',
      render: (_: unknown, record: { da_phan_bo: number; so_luong: number; trang_thai: string }) => (
        <div className="flex flex-col">
          <span className="text-xs text-slate-500 mb-1">{record.da_phan_bo}/{record.so_luong} chỉ tiêu</span>
          <Progress 
            percent={Math.round((record.da_phan_bo / record.so_luong) * 100)} 
            size="small"
            status={record.trang_thai === 'Hoàn thành' ? 'success' : 'active'}
          />
        </div>
      )
    },
    { 
      title: 'Trạng thái', 
      dataIndex: 'trang_thai', 
      key: 'trang_thai',
      render: (status: string) => (
        <Tag color={status === 'Hoàn thành' ? 'green' : 'blue'}>
          {status}
        </Tag>
      )
    },
  ];

  return (
    <div className="p-6 space-y-6 bg-[#F8FAFC] min-h-screen">
      {/* Header & Greeting */}
      <div className="flex justify-between items-center mb-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 m-0">Dashboard Viên Chức Quản Lý</h1>
          <p className="text-slate-500 mt-1">Hệ thống quản lý nhân sự và quy hoạch đơn vị</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-100">
          <span className="text-slate-600">Chào mừng, </span>
          <span className="font-bold text-blue-600">{user?.hoVaTen || 'Trưởng đơn vị'}</span>
        </div>
      </div>
      
      {/* Hàng 2: Thống kê tổng quan */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm rounded-xl border-none hover:shadow-md transition-shadow">
            <Statistic 
              title={<span className="text-slate-500 font-medium">Tổng viên chức đơn vị</span>}
              value={45} 
              prefix={<UserOutlined className="p-2 bg-blue-50 text-blue-500 rounded-lg mr-2" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm rounded-xl border-none hover:shadow-md transition-shadow">
            <Statistic 
              title={<span className="text-slate-500 font-medium">Đang làm việc</span>}
              value={42} 
              prefix={<CheckCircleOutlined className="p-2 bg-green-50 text-green-500 rounded-lg mr-2" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm rounded-xl border-none hover:shadow-md transition-shadow">
            <Statistic 
              title={<span className="text-slate-500 font-medium">Tạm nghỉ / Vắng mặt</span>}
              value={3} 
              prefix={<ClockCircleOutlined className="p-2 bg-amber-50 text-amber-500 rounded-lg mr-2" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="shadow-sm rounded-xl border-none hover:shadow-md transition-shadow">
            <Statistic 
              title={<span className="text-slate-500 font-medium">Hồ sơ cần xem xét</span>}
              value={5} 
              prefix={<ExclamationCircleOutlined className="p-2 bg-red-50 text-red-500 rounded-lg mr-2" />}
              valueStyle={{ color: '#dc2626' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Hàng 3: Bảng quản lý chi tiết */}
      <Row gutter={[16, 16]}>
        <Col lg={12} span={24}>
          <Card 
            title={<span className="flex items-center gap-2"><TeamOutlined /> Danh sách viên chức</span>}
            className="shadow-sm rounded-xl border-none h-full"
            extra={
              <Button type="link" size="small" icon={<RightOutlined />}>
                Xem tất cả
              </Button>
            }
          >
            <Table
              dataSource={mockStaffData}
              columns={staffColumns}
              pagination={false}
              size="middle"
              className="mt-2"
            />
          </Card>
        </Col>
        <Col lg={12} span={24}>
          <Card 
            title={<span className="flex items-center gap-2"><BarChartOutlined /> Quy hoạch đang thực hiện</span>}
            className="shadow-sm rounded-xl border-none h-full"
            extra={
              <Button type="primary" size="small">
                Quản lý
              </Button>
            }
          >
            <Table
              dataSource={mockPlanningData}
              columns={planningColumns}
              pagination={false}
              size="middle"
              className="mt-2"
            />
          </Card>
        </Col>
      </Row>

      {/* Hàng 4: Hành động nhanh */}
      <Card 
        title={<span className="text-slate-700 font-bold">Hành động quản lý nhanh</span>} 
        className="shadow-sm rounded-xl border-none"
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Button type="primary" size="large" block className="h-14 rounded-lg flex items-center justify-center gap-2 shadow-blue-100 shadow-lg">
              <TeamOutlined className="text-lg" /> 
              <span className="font-semibold">Quản lý viên chức</span>
            </Button>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Button size="large" block className="h-14 rounded-lg flex items-center justify-center gap-2 hover:border-blue-400">
              <FileTextOutlined className="text-lg text-blue-500" /> 
              <span className="text-slate-700">Quản lý quy hoạch</span>
            </Button>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Button size="large" block className="h-14 rounded-lg flex items-center justify-center gap-2 hover:border-blue-400">
              <BarChartOutlined className="text-lg text-indigo-500" /> 
              <span className="text-slate-700">Báo cáo thống kê</span>
            </Button>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Button size="large" block className="h-14 rounded-lg flex items-center justify-center gap-2 hover:border-blue-400">
              <CheckCircleOutlined className="text-lg text-green-500" /> 
              <span className="text-slate-700">Phê duyệt hồ sơ</span>
            </Button>
          </Col>
        </Row>
      </Card>
    </div>
  );
};