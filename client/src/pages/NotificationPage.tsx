import { List, Badge, Avatar, Typography } from 'antd';
import  {NotificationOutlined } from '@ant-design/icons';
const { Text } = Typography;

export const NotificationPage = () => {
  const data = [
    { title: 'Thông báo quy hoạch cán bộ năm 2026', date: '15/03/2026', urgent: true },
    { title: 'Cập nhật hồ sơ viên chức khoa CNTT', date: '14/03/2026', urgent: false },
    { title: 'Nhắc nhở hạn chót rà soát quy hoạch quý 1', date: '10/03/2026', urgent: true },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Thông báo hệ thống</h1>
      <List
        itemLayout="horizontal"
        dataSource={data}
        renderItem={(item) => (
          <List.Item className="bg-white mb-3 p-4 rounded-xl border border-gray-100 hover:shadow-md transition-shadow cursor-pointer">
            <List.Item.Meta
              avatar={<Avatar icon={<NotificationOutlined />} className={item.urgent ? 'bg-red-100 text-red-500' : 'bg-blue-100 text-blue-500'} />}
              title={<span className="font-semibold">{item.title}</span>}
              description={<Text type="secondary">{item.date}</Text>}
            />
            {item.urgent && <Badge status="error" text="Khẩn" />}
          </List.Item>
        )}
      />
    </div>
  );
};