import React, { useState, useEffect } from 'react';
import { Table, Button, Tag, Card, Row, Col, Statistic, Modal, message } from 'antd';
import { PlusOutlined, FileTextOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import SelectCandidateModal, { type PersonnelData } from './SelectedPersonnel';
import CreatePhuongAnForm from './CreatePhuongAnForm';
import type { PhuongAnNhanSu } from '../../types/PhuongAnNhanSu';
import { getPhuongAnList } from '../../api/phuongAnNhanSu.api';

const TRANG_THAI_MAP: Record<number, { label: string; color: string }> = {
    0: { label: 'Đã hủy', color: 'error' },
    1: { label: 'Đang soạn thảo', color: 'default' },
    2: { label: 'Chờ phê duyệt', color: 'processing' },
    3: { label: 'Đã phê duyệt', color: 'success' },
};

const PersonnelProposalPage: React.FC = () => {
    const navigate = useNavigate();
    const [listPA, setListPA] = useState<PhuongAnNhanSu[]>([]);
    const [loading, setLoading] = useState(true);

    const [selectModalVisible, setSelectModalVisible] = useState(false);
    const [createModalVisible, setCreateModalVisible] = useState(false);

    const [selectedPersonnel, setSelectedPersonnel] = useState<PersonnelData[]>([]);

    const fetchList = async () => {
        try {
            setLoading(true);
            const res = await getPhuongAnList();
            setListPA(res.data.data || []);
        } catch {
            message.error('Không thể tải danh sách phương án');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchList(); }, []);

    const handleSelectDone = (personnel: PersonnelData[]) => {
        setSelectedPersonnel(personnel);
        setSelectModalVisible(false);
        setCreateModalVisible(true);
    };

    const cols = [
        {
            title: 'Mã phương án', dataIndex: 'maPhuongAn', key: 'maPhuongAn', width: 130,
            render: (text: string) => <span className="font-mono font-semibold">{text}</span>,
        },
        {
            title: 'Số tờ trình', dataIndex: 'soToTrinh', key: 'soToTrinh', width: 160,
            render: (text: string) => text ?? '—',
        },
        {
            title: 'Ngày lập', dataIndex: 'ngayLap', key: 'ngayLap', width: 120,
            render: (text: string) => text
                ? new Date(text).toLocaleDateString('vi-VN')
                : '—',
        },
        {
            title: 'Nhân sự', dataIndex: 'soNhanSu', key: 'soNhanSu', width: 100,
            render: (n: number) => <Tag color="blue">{n ?? 0} người</Tag>,
        },
        {
            title: 'Trạng thái', dataIndex: 'trangThai', key: 'trangThai', width: 150,
            render: (s: number) => {
                const info = TRANG_THAI_MAP[s] ?? { label: '?', color: 'default' };
                return <Tag color={info.color}>{info.label}</Tag>;
            },
        },
        {
            title: 'Thao tác', key: 'action', width: 100,
            render: (_: unknown, record: PhuongAnNhanSu) => (
                <Button size="small" type="link" onClick={() => navigate(`/phuong-an-nhan-su/${record.id}`)}>
                    Xem chi tiết
                </Button>
            ),
        },
    ];

    const draftCount = listPA.filter(p => p.trangThai === 1).length;
    const pendingCount = listPA.filter(p => p.trangThai === 2).length;
    const approvedCount = listPA.filter(p => p.trangThai === 3).length;

    return (
        <div className="p-6 bg-gray-50 min-h-screen space-y-5">
            <Row gutter={16}>
                <Col span={6}>
                    <Card>
                        <Statistic title="Tổng phương án" value={listPA.length} valueStyle={{ color: '#1890ff' }} prefix={<FileTextOutlined />} />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic title="Đang soạn thảo" value={draftCount} valueStyle={{ color: '#888' }} prefix={<ClockCircleOutlined />} />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic title="Chờ phê duyệt" value={pendingCount} valueStyle={{ color: '#1890ff' }} prefix={<ClockCircleOutlined />} />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic title="Đã phê duyệt" value={approvedCount} valueStyle={{ color: '#52c41a' }} prefix={<CheckCircleOutlined />} />
                    </Card>
                </Col>
            </Row>

            <Card title={
                <div className="flex items-center justify-between">
                    <span className="font-semibold">Danh sách phương án nhân sự</span>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setSelectModalVisible(true)}>
                        Tạo phương án mới
                    </Button>
                </div>
            }>
                <Table
                    rowKey="id"
                    columns={cols}
                    dataSource={listPA}
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                />
            </Card>

            <SelectCandidateModal
                isOpen={selectModalVisible}
                onClose={() => setSelectModalVisible(false)}
                onConfirm={handleSelectDone}
            />

            <Modal
                title="Lập phương án nhân sự"
                open={createModalVisible}
                onCancel={() => setCreateModalVisible(false)}
                width={900}
                footer={null}
                destroyOnClose
            >
                <CreatePhuongAnForm
                    selectedPersonnel={selectedPersonnel}
                    onCancel={() => setCreateModalVisible(false)}
                    onSuccess={() => {
                        setCreateModalVisible(false);
                        fetchList();
                    }}
                />
            </Modal>
        </div>
    );
};

export default PersonnelProposalPage;
