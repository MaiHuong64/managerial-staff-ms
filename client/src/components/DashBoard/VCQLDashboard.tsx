import { Card, Col, Row, Statistic, Table, Button, Tag, Progress } from 'antd';
import { 
  UserOutlined, 
  TeamOutlined, 
  FileTextOutlined, 
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import { useAuth } from '../../hook/useAuth';

export const VCQLDashboard = () => {
  const { user } = useAuth();

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
      don_vi: 'Phòng Kế hoạch',
      chuc_danh: 'Chuyên viên',
      trang_thai: 'Đang làm việc'
    },
    { 
      key: '3', 
      ma_vc: 'VC003', 
      ho_va_ten: 'Lê Văn C', 
      don_vi: 'Phòng Tài chính',
      chuc_danh: 'Chuyên viên tập sự',
      trang_thai: 'Tạm nghỉ'
    },
  ];

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
    { title: 'Đơn vị', dataIndex: 'don_vi', key: 'don_vi' },
    { title: 'Chức danh', dataIndex: 'chuc_danh', key: 'chuc_danh' },
    { 
      title: 'Trạng thái', 
      dataIndex: 'trang_thai', 
      key: 'trang_thai',
      render: (status: string) => (
        <Tag color={status === 'Đang làm việc' ? 'green' : 'orange'}>
          {status}
        </Tag>
      )
    },
  ];

  const planningColumns = [
    { title: 'Tên đợt QH', dataIndex: 'ten_dot_qh', key: 'ten_dot_qh' },
    { title: 'Số lượng', dataIndex: 'so_luong', key: 'so_luong' },
    { title: 'Đã phân bổ', dataIndex: 'da_phan_bo', key: 'da_phan_bo' },
    { 
      title: 'Tiến độ', 
      key: 'tien_do',
      render: (record: any) => (
        <Progress 
          percent={Math.round((record.da_phan_bo / record.so_luong) * 100)} 
          size="small"
        />
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Dashboard Viên Chức Quản Lý</h1>
        <div className="text-sm text-slate-600">
          Chào mừng, <span className="font-semibold">{user?.ho_va_ten}</span>
        </div>
      </div>
      
      {/* Thống kê tổng quan */}
      <Row gutter={16}>
        <Col span={6}>
          <Card className="shadow-sm rounded-xl border-none">
            <Statistic 
              title="Tổng viên chức" 
              value={45} 
              prefix={<UserOutlined className="text-blue-500" />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="shadow-sm rounded-xl border-none">
            <Statistic 
              title="Đang làm việc" 
              value={42} 
              prefix={<CheckCircleOutlined className="text-green-500" />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="shadow-sm rounded-xl border-none">
            <Statistic 
              title="Tạm nghỉ" 
              value={3} 
              prefix={<ClockCircleOutlined className="text-orange-500" />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="shadow-sm rounded-xl border-none">
            <Statistic 
              title="Cần xem xét" 
              value={5} 
              prefix={<ExclamationCircleOutlined className="text-red-500" />}
            />
          </Card>
        </Col>
      </Row>

      {/* Bảng quản lý */}
      <Row gutter={16}>
        <Col span={12}>
          <Card 
            title="Danh sách viên chức" 
            className="shadow-sm rounded-xl border-none"
            extra={
              <Button type="primary" size="small">
                Xem tất cả
              </Button>
            }
          >
            <Table
              dataSource={mockStaffData}
              columns={staffColumns}
              pagination={{ pageSize: 5 }}
              size="small"
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card 
            title="Quy hoạch đang thực hiện" 
            className="shadow-sm rounded-xl border-none"
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
              size="small"
            />
          </Card>
        </Col>
      </Row>

      {/* Hành động nhanh */}
      <Card title="Hành động quản lý" className="shadow-sm rounded-xl border-none">
        <Row gutter={16}>
          <Col span={6}>
            <Button type="primary" size="large" block className="h-12">
              <TeamOutlined /> Quản lý viên chức
            </Button>
          </Col>
          <Col span={6}>
            <Button type="default" size="large" block className="h-12">
              <FileTextOutlined /> Quản lý quy hoạch
            </Button>
          </Col>
          <Col span={6}>
            <Button type="default" size="large" block className="h-12">
              <BarChartOutlined /> Báo cáo thống kê
            </Button>
          </Col>
          <Col span={6}>
            <Button type="default" size="large" block className="h-12">
              <CheckCircleOutlined /> Phê duyệt hồ sơ
            </Button>
          </Col>
        </Row>
      </Card>
    </div>
  );
};
