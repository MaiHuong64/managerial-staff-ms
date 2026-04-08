import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Tag, Button, message, Row, Col, Statistic } from 'antd';
import { FileTextOutlined, CheckCircleOutlined } from '@ant-design/icons';
import axiosClient from '../../utils/AxiosClient';
import type { PhuongAnNhanSu } from '../../types/PhuongAnNhanSu';

const ApprovePhuongAnPage: React.FC = () => {
    const navigate = useNavigate();
    const [list, setList] = useState<PhuongAnNhanSu[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchList = async () => {
        try {
            setLoading(true);
            const res = await axiosClient.get('/phuong-an-nhan-su');
            const all: PhuongAnNhanSu[] = res.data.data ?? [];
            setList(all.filter(p => p.trang_thai === 2));
        } catch {
            message.error('Không thể tải danh sách phương án');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchList(); }, []);

    const cols = [
        {
            title: 'Mã phương án', dataIndex: 'ma_phuong_an', key: 'ma_phuong_an', width: 130,
            render: (text: string) => <span className="font-mono font-semibold">{text}</span>,
        },
        {
            title: 'Số tờ trình', dataIndex: 'so_to_trinh', key: 'so_to_trinh',
            render: (text: string) => text ?? '—',
        },
        {
            title: 'Ngày lập', dataIndex: 'ngay_lap', key: 'ngay_lap', width: 120,
            render: (text: string) => text ? new Date(text).toLocaleDateString('vi-VN') : '—',
        },
        {
            title: 'Nhân sự', dataIndex: 'so_nhan_su', key: 'so_nhan_su', width: 100,
            render: (n: number) => <Tag color="blue">{n ?? 0} người</Tag>,
        },
        {
            title: 'Trạng thái', key: 'trang_thai', width: 140,
            render: () => <Tag color="processing">Chờ phê duyệt</Tag>,
        },
        {
            title: 'Thao tác', key: 'action', width: 120,
            render: (_: unknown, record: PhuongAnNhanSu) => (
                <Button size="small" type="primary"
                    onClick={() => navigate(`/phuong-an-nhan-su/${record.id}`)}>
                    Xem & Duyệt
                </Button>
            ),
        },
    ];

    return (
        <div className="p-6 bg-gray-50 min-h-screen space-y-5">
            <Row gutter={16}>
                <Col span={8}>
                    <Card>
                        <Statistic
                            title="Chờ phê duyệt"
                            value={list.length}
                            prefix={<FileTextOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card>
                        <Statistic
                            title="Đã xử lý hôm nay"
                            value={0}
                            prefix={<CheckCircleOutlined />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
            </Row>

            <Card title={
                <div className="flex items-center gap-2">
                    <FileTextOutlined className="text-blue-500" />
                    <span className="font-semibold">Phương án nhân sự chờ phê duyệt</span>
                </div>
            }>
                <Table
                    rowKey="id"
                    columns={cols}
                    dataSource={list}
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                    locale={{ emptyText: 'Không có phương án nào đang chờ duyệt' }}
                />
            </Card>
        </div>
    );
};

export default ApprovePhuongAnPage;
