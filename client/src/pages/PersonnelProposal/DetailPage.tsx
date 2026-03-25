import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Col, Descriptions, Row, Statistic, Table, Tag, Button, Input, Popconfirm, Spin, message, Alert } from 'antd';
import {
    ArrowLeftOutlined, CheckCircleOutlined, CloseCircleOutlined,
    FileTextOutlined, TeamOutlined, UserOutlined, HomeOutlined, SendOutlined,
} from '@ant-design/icons';
import axiosClient from '../../utils/AxiosClient';
import { useAuth } from '../../hook/useAuth';

// 0=Hủy, 1=Soạn thảo, 2=Chờ duyệt, 3=Đã duyệt
const TRANG_THAI_MAP: Record<number, { label: string; color: string }> = {
    0: { label: 'Đã hủy', color: 'error' },
    1: { label: 'Đang soạn thảo', color: 'default' },
    2: { label: 'Chờ phê duyệt', color: 'processing' },
    3: { label: 'Đã phê duyệt', color: 'success' },
};

const LOAI_PA_COLOR: Record<string, string> = {
    'Bổ nhiệm': 'blue',
    'Bổ nhiệm lại': 'cyan',
    'Thôi chức vụ': 'orange',
    'Thôi kiêm nhiệm': 'gold',
};

interface ChiTiet {
    chi_tiet_pa_id: number;
    chi_tiet_bn_id: number;
    loai_phuong_an: string;
    ghi_chu: string;
    trang_thai: number;
    ho_va_ten: string;
    ma_vien_chuc: string;
    ten_chuc_danh: string;
    ten_don_vi: string;
}

interface PhuongAnDetail {
    id: number;
    ma_phuong_an: string;
    so_to_trinh: string;
    ngay_to_trinh: string;
    ngay_lap: string;
    ngay_phe_duyet: string | null;
    trang_thai: number;
    ghi_chu: string;
    y_kien_bgh: string | null;
    chi_tiet: ChiTiet[];
}

const PersonnelPlanDetailPage: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [data, setData] = useState<PhuongAnDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [yKien, setYKien] = useState('');
    const [approving, setApproving] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await axiosClient.get(`/personnel/${id}`);
            setData(res.data.data);
            setYKien(res.data.data.y_kien_bgh ?? '');
        } catch {
            message.error('Không thể tải dữ liệu phương án');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { if (id) fetchData(); }, [id]);

    const handleSubmit = async () => {
        try {
            setSubmitting(true);
            await axiosClient.put(`/personnel/${id}/submit`, {});
            message.success('Đã trình BGH thành công');
            fetchData();
        } catch (err: any) {
            message.error(err?.response?.data?.message ?? 'Lỗi khi trình phương án');
        } finally {
            setSubmitting(false);
        }
    };

    const handleApprove = async (trang_thai: number) => {
        try {
            setApproving(true);
            await axiosClient.put(`/personnel/${id}/approve`, { trang_thai, y_kien_bgh: yKien });
            message.success(trang_thai === 3 ? 'Đã phê duyệt phương án' : 'Đã từ chối phương án');
            fetchData();
        } catch (err: any) {
            message.error(err?.response?.data?.message ?? 'Lỗi khi cập nhật trạng thái');
        } finally {
            setApproving(false);
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <Spin size="large" tip="Đang tải dữ liệu..." />
        </div>
    );
    if (!data) return (
        <div className="text-center mt-10 text-red-500">Không tìm thấy phương án!</div>
    );

    const trangThaiInfo = TRANG_THAI_MAP[data.trang_thai] ?? { label: '?', color: 'default' };
    const canSubmit = user?.vai_tro === 'PTCCT' && data.trang_thai === 1;
    const canApprove = user?.vai_tro === 'BGH' && data.trang_thai === 2;
    const boNhiemCount = data.chi_tiet.filter(c => c.loai_phuong_an === 'Bổ nhiệm').length;
    const boNhiemLaiCount = data.chi_tiet.filter(c => c.loai_phuong_an === 'Bổ nhiệm lại').length;

    const cols = [
        {
            title: 'Mã VC', dataIndex: 'ma_vien_chuc', key: 'ma_vien_chuc', width: 100,
            render: (text: string) => <span className="font-mono text-sm">{text ?? '—'}</span>,
        },
        {
            title: 'Họ và tên', dataIndex: 'ho_va_ten', key: 'ho_va_ten',
            render: (text: string) => (
                <div className="flex items-center gap-2">
                    <UserOutlined className="text-blue-400" />
                    <span className="font-semibold">{text}</span>
                </div>
            ),
        },
        {
            title: 'Chức danh bổ nhiệm', dataIndex: 'ten_chuc_danh', key: 'ten_chuc_danh',
            render: (text: string) => <Tag color="purple">{text}</Tag>,
        },
        {
            title: 'Đơn vị', dataIndex: 'ten_don_vi', key: 'ten_don_vi',
            render: (text: string) => (
                <div className="flex items-center gap-1 text-gray-600">
                    <HomeOutlined />
                    <span>{text}</span>
                </div>
            ),
        },
        {
            title: 'Loại phương án', dataIndex: 'loai_phuong_an', key: 'loai_phuong_an', width: 140,
            render: (text: string) => (
                <Tag color={LOAI_PA_COLOR[text] ?? 'default'}>{text}</Tag>
            ),
        },
        {
            title: 'Ghi chú', dataIndex: 'ghi_chu', key: 'ghi_chu',
            render: (text: string) => <span className="text-gray-500">{text || '—'}</span>,
        },
    ];

    return (
        <div className="p-6 bg-gray-50 min-h-screen space-y-5">

            {/* Header: nút quay lại + Trình BGH */}
            <div className="flex items-center justify-between">
                <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/personnel')}>
                    Quay lại danh sách
                </Button>
                {canSubmit && (
                    <Popconfirm
                        title="Trình phương án lên BGH?"
                        description="Sau khi trình, phương án sẽ không thể chỉnh sửa."
                        onConfirm={handleSubmit}
                        okText="Xác nhận"
                        cancelText="Hủy"
                    >
                        <Button type="primary" icon={<SendOutlined />} loading={submitting}>
                            Trình BGH phê duyệt
                        </Button>
                    </Popconfirm>
                )}
            </div>

            {/* Thống kê nhanh */}
            <Row gutter={16}>
                <Col span={6}>
                    <Card>
                        <Statistic title="Tổng nhân sự" value={data.chi_tiet.length}
                            prefix={<TeamOutlined />} valueStyle={{ color: '#1890ff' }} />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic title="Bổ nhiệm" value={boNhiemCount}
                            valueStyle={{ color: '#1890ff' }} />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic title="Bổ nhiệm lại" value={boNhiemLaiCount}
                            valueStyle={{ color: '#13c2c2' }} />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic title="Trạng thái"
                            valueRender={() => <Tag color={trangThaiInfo.color}>{trangThaiInfo.label}</Tag>} />
                    </Card>
                </Col>
            </Row>

            {/* Thông tin chung */}
            <Card title={
                <div className="flex items-center gap-2">
                    <FileTextOutlined className="text-blue-500" />
                    <span className="font-semibold">Thông tin phương án</span>
                </div>
            }>
                <Descriptions bordered column={2} size="small">
                    <Descriptions.Item label="Mã phương án">
                        <span className="font-mono font-bold">{data.ma_phuong_an}</span>
                    </Descriptions.Item>
                    <Descriptions.Item label="Trạng thái">
                        <Tag color={trangThaiInfo.color}>{trangThaiInfo.label}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Số tờ trình">{data.so_to_trinh ?? '—'}</Descriptions.Item>
                    <Descriptions.Item label="Ngày lập tờ trình">
                        {data.ngay_to_trinh ? new Date(data.ngay_to_trinh).toLocaleDateString('vi-VN') : '—'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Ngày lập">
                        {data.ngay_lap ? new Date(data.ngay_lap).toLocaleDateString('vi-VN') : '—'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Ngày phê duyệt">
                        {data.ngay_phe_duyet ? new Date(data.ngay_phe_duyet).toLocaleDateString('vi-VN') : '—'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Ghi chú" span={2}>
                        {data.ghi_chu || '—'}
                    </Descriptions.Item>
                    {data.y_kien_bgh && (
                        <Descriptions.Item label="Ý kiến BGH" span={2}>
                            <span className="text-blue-700 font-medium">{data.y_kien_bgh}</span>
                        </Descriptions.Item>
                    )}
                </Descriptions>
            </Card>

            {/* Alert trạng thái */}
            {data.trang_thai === 2 && (
                <Alert type="info" showIcon message="Phương án đang chờ BGH phê duyệt" />
            )}
            {data.trang_thai === 3 && (
                <Alert type="success" showIcon message="Phương án đã được BGH phê duyệt" />
            )}
            {data.trang_thai === 0 && (
                <Alert type="error" showIcon message="Phương án đã bị từ chối / hủy" />
            )}

            {/* Danh sách nhân sự */}
            <Card title={
                <div className="flex items-center gap-2">
                    <TeamOutlined className="text-blue-500" />
                    <span className="font-semibold">Danh sách nhân sự ({data.chi_tiet.length} người)</span>
                </div>
            }>
                <Table
                    rowKey="chi_tiet_pa_id"
                    columns={cols}
                    dataSource={data.chi_tiet}
                    pagination={false}
                    size="small"
                    bordered
                />
            </Card>

            {/* Phê duyệt BGH */}
            {canApprove && (
                <Card title="Phê duyệt phương án" className="border-blue-200">
                    <div className="space-y-3">
                        <div>
                            <label className="text-sm text-gray-600 font-medium block mb-1">Ý kiến BGH</label>
                            <Input.TextArea
                                rows={3}
                                placeholder="Nhập ý kiến phê duyệt hoặc lý do từ chối..."
                                value={yKien}
                                onChange={e => setYKien(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2 justify-end">
                            <Popconfirm
                                title="Từ chối phương án?"
                                description="Phương án sẽ bị hủy và không thể khôi phục."
                                onConfirm={() => handleApprove(0)}
                                okText="Xác nhận từ chối"
                                cancelText="Hủy"
                                okButtonProps={{ danger: true }}
                            >
                                <Button danger icon={<CloseCircleOutlined />} loading={approving}>
                                    Từ chối
                                </Button>
                            </Popconfirm>
                            <Popconfirm
                                title="Phê duyệt phương án?"
                                onConfirm={() => handleApprove(3)}
                                okText="Xác nhận"
                                cancelText="Hủy"
                            >
                                <Button type="primary" icon={<CheckCircleOutlined />} loading={approving}>
                                    Phê duyệt
                                </Button>
                            </Popconfirm>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default PersonnelPlanDetailPage;
