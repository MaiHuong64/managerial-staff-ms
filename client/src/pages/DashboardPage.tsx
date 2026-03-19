import { Card, Col, Row, Statistic, Table } from 'antd';
import { UserOutlined, DeploymentUnitOutlined, NotificationOutlined } from '@ant-design/icons';

export const DashboardPage = () => {
  return (
    <div className="p-6 space-y-6 bg-[#F8FAFC] min-h-screen">
      <h1 className="text-2xl font-bold text-slate-800">Bảng điều khiển</h1>
      
      <Row gutter={16}>
        <Col span={8}>
          <Card className="shadow-sm rounded-xl border-none">
            <Statistic title="Tổng viên chức" value={1250} prefix={<UserOutlined className="text-blue-500" />} />
          </Card>
        </Col>
        <Col span={8}>
          <Card className="shadow-sm rounded-xl border-none">
            <Statistic title="Đang quy hoạch" value={45} prefix={<DeploymentUnitOutlined className="text-purple-500" />} />
          </Card>
        </Col>
        <Col span={8}>
          <Card className="shadow-sm rounded-xl border-none">
            <Statistic title="Thông báo mới" value={12} prefix={<NotificationOutlined className="text-orange-500" />} />
          </Card>
        </Col>
      </Row>

      <Card title="Hoạt động quy hoạch gần đây" className="shadow-sm rounded-xl border-none">
        <Table 
          pagination={false}
          dataSource={[
            { key: '1', name: 'Nguyễn Văn A', action: 'Đã thêm vào quy hoạch', time: '10 phút trước' },
            { key: '2', name: 'Trần Thị B', action: 'Đã phê duyệt hồ sơ', time: '1 giờ trước' },
          ]}
          columns={[
            { title: 'Nhân sự', dataIndex: 'name', key: 'name' },
            { title: 'Hành động', dataIndex: 'action', key: 'action' },
            { title: 'Thời gian', dataIndex: 'time', key: 'time' },
          ]}
        />
      </Card>
    </div>
  );
};