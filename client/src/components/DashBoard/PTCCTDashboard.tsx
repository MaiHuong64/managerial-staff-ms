import { Card, Col, Row, Statistic, Table, Button, Tag, Progress, Tabs } from 'antd';
import { 
  SettingOutlined, 
  TeamOutlined, 
  BarChartOutlined,
  UserOutlined,
  BuildOutlined
} from '@ant-design/icons';
import { useAuth } from '../../hook/useAuth';

const { TabPane } = Tabs;

export const PTCCTDashboard = () => {
  const { user } = useAuth();

  // Mock data - sẽ thay bằng API call sau
  const mockSystemStats = [
    { 
      key: '1', 
      chi_tieu: 'Tổng viên chức', 
      gia_tri: 1250, 
      tang_truong: '+5.2%',
      chi_tieu_cong: 1188
    },
    { 
      key: '2', 
      chi_tieu: 'Tổng đơn vị', 
      gia_tri: 25, 
      tang_truong: '+2.1%',
      chi_tieu_cong: 24
    },
    { 
      key: '3', 
      chi_tieu: 'Tổng chức danh', 
      gia_tri: 45, 
      tang_truong: '+3.4%',
      chi_tieu_cong: 43
    },
  ];

  const mockRecentActivities = [
    { 
      key: '1', 
      hoat_dong: 'Tạo quy hoạch mới', 
      nguoi_thuc_hien: 'Trần Thị B',
      doi_tuong: 'Quy hoạch Q2/2024',
      thoi_gian: '10 phút trước',
      loai: 'create'
    },
    { 
      key: '2', 
      hoat_dong: 'Phê duyệt bổ nhiệm', 
      nguoi_thuc_hien: 'Nguyễn Văn A',
      doi_tuong: '5 chuyên viên chính',
      thoi_gian: '1 giờ trước',
      loai: 'approve'
    },
    { 
      key: '3', 
      hoat_dong: 'Cập nhật chức danh', 
      nguoi_thuc_hien: 'Lê Văn C',
      doi_tuong: 'Chuyên viên tập sự',
      thoi_gian: '2 giờ trước',
      loai: 'update'
    },
    { 
      key: '4', 
      hoat_dong: 'Xóa quy hoạch cũ', 
      nguoi_thuc_hien: 'Phạm Thị D',
      doi_tuong: 'Quy hoạch 2023',
      thoi_gian: '3 giờ trước',
      loai: 'delete'
    },
  ];

  const mockPendingTasks = [
    { 
      key: '1', 
      loai: 'Bổ nhiệm', 
      ten: 'Bổ nhiệm chuyên viên chính', 
      so_luong: 8,
      trang_thai: 'Chờ xử lý',
      do_uu_tien: 'Cao'
    },
    { 
      key: '2', 
      loai: 'Quy hoạch', 
      ten: 'Quy hoạch luân chuyển Q2/2024', 
      so_luong: 15,
      trang_thai: 'Đang xử lý',
      do_uu_tien: 'Trung bình'
    },
    { 
      key: '3', 
      loai: 'Hồ sơ', 
      ten: 'Cập nhật hồ sơ viên chức', 
      so_luong: 25,
      trang_thai: 'Chờ duyệt',
      do_uu_tien: 'Thấp'
    },
  ];

  const systemStatsColumns = [
    { title: 'Chỉ tiêu', dataIndex: 'chi_tieu', key: 'chi_tieu' },
    { title: 'Giá trị', dataIndex: 'gia_tri', key: 'gia_tri' },
    { 
      title: 'Tăng trưởng', 
      dataIndex: 'tang_truong', 
      key: 'tang_truong',
      render: (value: string) => (
        <Tag color={value.startsWith('+') ? 'green' : 'red'}>
          {value}
        </Tag>
      )
    },
    { title: 'Chỉ tiêu cùng kỳ', dataIndex: 'chi_tieu_cong', key: 'chi_tieu_cong' },
  ];

  const activityColumns = [
    { title: 'Hoạt động', dataIndex: 'hoat_dong', key: 'hoat_dong' },
    { title: 'Người thực hiện', dataIndex: 'nguoi_thuc_hien', key: 'nguoi_thuc_hien' },
    { title: 'Đối tượng', dataIndex: 'doi_tuong', key: 'doi_tuong' },
    { title: 'Thời gian', dataIndex: 'thoi_gian', key: 'thoi_gian' },
    { 
      title: 'Loại', 
      dataIndex: 'loai', 
      key: 'loai',
      render: (type: string) => {
        const colorMap: Record<string, string> = {
          create: 'blue',
          approve: 'green',
          update: 'orange',
          delete: 'red'
        };
        return (
          <Tag color={colorMap[type] || 'default'}>
            {type === 'create' ? 'Tạo' : 
             type === 'approve' ? 'Duyệt' :
             type === 'update' ? 'Cập nhật' : 'Xóa'}
          </Tag>
        );
      }
    },
  ];

  const pendingTasksColumns = [
    { title: 'Loại', dataIndex: 'loai', key: 'loai' },
    { title: 'Tên', dataIndex: 'ten', key: 'ten' },
    { title: 'Số lượng', dataIndex: 'so_luong', key: 'so_luong' },
    { 
      title: 'Trạng thái', 
      dataIndex: 'trang_thai', 
      key: 'trang_thai',
      render: (status: string) => {
        const colorMap: Record<string, string> = {
          'Chờ xử lý': 'orange',
          'Đang xử lý': 'blue',
          'Chờ duyệt': 'purple'
        };
        return <Tag color={colorMap[status] || 'default'}>{status}</Tag>;
      }
    },
    { 
      title: 'Độ ưu tiên', 
      dataIndex: 'do_uu_tien', 
      key: 'do_uu_tien',
      render: (priority: string) => {
        const colorMap: Record<string, string> = {
          'Cao': 'red',
          'Trung bình': 'orange',
          'Thấp': 'green'
        };
        return <Tag color={colorMap[priority] || 'default'}>{priority}</Tag>;
      }
    },
  ];

  return (
    <div className="p-6 space-y-6 bg-[#F8FAFC] min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Dashboard P.TC-CT</h1>
        <div className="text-sm text-slate-600">
          Chào mừng, <span className="font-semibold">{user?.ho_va_ten}</span>
        </div>
      </div>
      
      {/* Thống kê hệ thống */}
      <Row gutter={16}>
        <Col span={6}>
          <Card className="shadow-sm rounded-xl border-none">
            <Statistic 
              title="Tổng viên chức" 
              value={1250} 
              prefix={<UserOutlined className="text-blue-500" />}
              suffix={<span className="text-green-500 text-sm">+5.2%</span>}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="shadow-sm rounded-xl border-none">
            <Statistic 
              title="Tổng đơn vị" 
              value={25} 
              prefix={<BuildOutlined className="text-purple-500" />}
              suffix={<span className="text-green-500 text-sm">+2.1%</span>}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="shadow-sm rounded-xl border-none">
            <Statistic 
              title="Tổng chức danh" 
              value={45} 
              prefix={<SettingOutlined className="text-orange-500" />}
              suffix={<span className="text-green-500 text-sm">+3.4%</span>}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card className="shadow-sm rounded-xl border-none">
            <Statistic 
              title="Hoạt động hôm nay" 
              value={47} 
              prefix={<BarChartOutlined className="text-green-500" />}
            />
          </Card>
        </Col>
      </Row>

      {/* Tabs quản lý */}
      <Card className="shadow-sm rounded-xl border-none">
        <Tabs defaultActiveKey="overview">
          <TabPane tab="Tổng quan hệ thống" key="overview">
            <Table
              dataSource={mockSystemStats}
              columns={systemStatsColumns}
              pagination={false}
              size="small"
            />
          </TabPane>
          
          <TabPane tab="Hoạt động gần đây" key="activities">
            <Table
              dataSource={mockRecentActivities}
              columns={activityColumns}
              pagination={{ pageSize: 10 }}
              size="small"
            />
          </TabPane>
          
          <TabPane tab="Công việc chờ xử lý" key="pending">
            <Table
              dataSource={mockPendingTasks}
              columns={pendingTasksColumns}
              pagination={{ pageSize: 10 }}
              size="small"
            />
          </TabPane>
          
          <TabPane tab="Báo cáo thống kê" key="reports">
            <div className="space-y-4">
              <Row gutter={16}>
                <Col span={12}>
                  <Card title="Biểu đồ viên chức theo đơn vị" size="small">
                    <div className="h-48 flex items-center justify-center text-gray-500">
                      [Chart - Sẽ tích hợp sau]
                    </div>
                  </Card>
                </Col>
                <Col span={12}>
                  <Card title="Biểu đồ quy hoạch theo quý" size="small">
                    <div className="h-48 flex items-center justify-center text-gray-500">
                      [Chart - Sẽ tích hợp sau]
                    </div>
                  </Card>
                </Col>
              </Row>
              <Row gutter={16} className="mt-4">
                <Col span={12}>
                  <Card title="Thống kê bổ nhiệm" size="small">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Tháng 1:</span>
                        <span className="font-semibold">12 bổ nhiệm</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tháng 2:</span>
                        <span className="font-semibold">8 bổ nhiệm</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tháng 3:</span>
                        <span className="font-semibold">15 bổ nhiệm</span>
                      </div>
                    </div>
                  </Card>
                </Col>
                <Col span={12}>
                  <Card title="Hiệu suất xử lý" size="small">
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Tỷ lệ duyệt quy hoạch</span>
                          <span className="text-sm font-semibold">87%</span>
                        </div>
                        <Progress percent={87} size="small" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Tỷ lệ duyệt bổ nhiệm</span>
                          <span className="text-sm font-semibold">92%</span>
                        </div>
                        <Progress percent={92} size="small" />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Thời gian xử lý TB</span>
                          <span className="text-sm font-semibold">2.5 ngày</span>
                        </div>
                        <Progress percent={75} size="small" status="active" />
                      </div>
                    </div>
                  </Card>
                </Col>
              </Row>
            </div>
          </TabPane>
        </Tabs>
      </Card>

      {/* Hành động quản trị */}
      <Card title="Quản lý hệ thống" className="shadow-sm rounded-xl border-none">
        <Row gutter={16}>
          <Col span={6}>
            <Button type="primary" size="large" block className="h-12">
              <TeamOutlined /> Quản lý viên chức
            </Button>
          </Col>
          <Col span={6}>
            <Button type="primary" size="large" block className="h-12">
              <BuildOutlined /> Quản lý đơn vị
            </Button>
          </Col>
          <Col span={6}>
            <Button type="primary" size="large" block className="h-12">
              <SettingOutlined /> Quản lý chức danh
            </Button>
          </Col>
          <Col span={6}>
            <Button type="default" size="large" block className="h-12">
              <BarChartOutlined /> Báo cáo tổng hợp
            </Button>
          </Col>
        </Row>
      </Card>
    </div>
  );
};
