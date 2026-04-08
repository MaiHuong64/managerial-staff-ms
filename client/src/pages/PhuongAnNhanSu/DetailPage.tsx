import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {  Card, Col, Descriptions, Row, Statistic, Table, Tag,  Button, Input, Popconfirm, Spin, message } from 'antd';
import {
    ArrowLeftOutlined, CheckCircleOutlined, CloseCircleOutlined,
    FileTextOutlined, TeamOutlined, UserOutlined,
    SendOutlined, PlusOutlined, FileSearchOutlined
} from '@ant-design/icons';
import axiosClient from '../../utils/AxiosClient';
import { useAuth } from '../../hook/useAuth';
import dayjs from 'dayjs';
import { approvePhuongAn, getPhuongAnById, rejectPhuongAn } from '../../api/phuongAnNhanSu.api';

const getHoSoByPhuongAn = async (paId: string | number) => {
    try {
        const res = await axiosClient.get(`/ho-so-bo-nhiem/phuong-an/${paId}`);
        return res.data;
    } catch (error) {
        return { success: false, data: [] };
    }
};

const createHoSo = async (payload: unknown) => {
    return await axiosClient.post(`/ho-so-bo-nhiem`, payload);
};

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

const PersonnelPlanDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [yKien, setYKien] = useState('');
    const [approving, setApproving] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // State mới cho Hồ sơ
    const [hoSoMap, setHoSoMap] = useState(new Map());
    const [creatingHoSoId, setCreatingHoSoId] = useState<number | null>(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await getPhuongAnById(Number(id));
            setData(res.data.data);
            setYKien(res.data.data.y_kien_bgh ?? '');

            // Fetch danh sách hồ sơ liên quan nếu phương án đã được phê duyệt
            if (res.data.data.trang_thai === 3) {
                const resHS = await getHoSoByPhuongAn(id!);
                if (resHS.success) {
                    const newMap = new Map();
                    resHS.data.forEach((hs: any) => newMap.set(hs.chi_tiet_pa_id, hs));
                    setHoSoMap(newMap);
                }
            }
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
            await axiosClient.patch(`/phuong-an-nhan-su/${id}/trinh`);
            message.success('Đã trình BGH thành công');
            fetchData();
        } catch (err: any) {
            message.error(err?.response?.data?.message ?? 'Lỗi khi trình phương án');
        } finally {
            setSubmitting(false);
        }
    };

    const handleApprove = async () => {
        try {
            setApproving(true);
            await approvePhuongAn(Number(id), yKien);
            message.success("Đã phê duyệt phương án");
            fetchData();
        } catch (err: any) {
            message.error(err?.response?.data?.message ?? 'Lỗi khi cập nhật trạng thái');
        } finally {
            setApproving(false);
        }
    };

    const handleReject = async () => {
        try {
            setApproving(true);
            await rejectPhuongAn(Number(id), yKien);
            message.success("Đã từ chối phương án");
            fetchData();
        } catch (err: any) {
            message.error(err?.response?.data?.message ?? 'Lỗi khi cập nhật trạng thái');
        } finally {
            setApproving(false);
        }
    };

    const handleCreateHoSo = async (chiTietPAId: number) => {
        try {
            setCreatingHoSoId(chiTietPAId);
            const res = await createHoSo({ chiTietPAId });
            if ((res as any).data.success) {
                message.success('Đã tạo hồ sơ bổ nhiệm mới');
                // Cập nhật lại Map hồ sơ
                const resHS = await getHoSoByPhuongAn(id!);
                if (resHS.success) {
                    const newMap = new Map();
                    resHS.data.forEach((hs: any) => newMap.set(hs.chi_tiet_pa_id, hs));
                    setHoSoMap(newMap);
                }
            }
        } catch (err: any) {
            message.error(err?.response?.data?.message || 'Lỗi khi lập hồ sơ');
        } finally {
            setCreatingHoSoId(null);
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
    const boNhiemCount = data.chi_tiet.filter((c: any) => c.loai_phuong_an === 'Bổ nhiệm').length;
    const boNhiemLaiCount = data.chi_tiet.filter((c: any) => c.loai_phuong_an === 'Bổ nhiệm lại').length;

    const cols = [
        {
            title: 'Mã VC', dataIndex: 'ma_vien_chuc', key: 'ma_vien_chuc', width: 90,
            render: (text: string) => <span className="font-mono text-xs text-slate-500">{text ?? '—'}</span>,
        },
        {
            title: 'Họ và tên', dataIndex: 'ho_va_ten', key: 'ho_va_ten',
            render: (text: string) => (
                <div className="flex items-center gap-2">
                    <UserOutlined className="text-blue-400" />
                    <span className="font-semibold text-slate-800">{text}</span>
                </div>
            ),
        },
        {
            title: 'Chức danh', dataIndex: 'ten_chuc_danh', key: 'ten_chuc_danh',
            render: (text: string) => <Tag color="purple" className="border-0 bg-purple-50 text-purple-600 font-medium">{text}</Tag>,
        },
        {
            title: 'Loại PA', dataIndex: 'loai_phuong_an', key: 'loai_phuong_an', width: 130,
            render: (text: string) => (
                <Tag color={LOAI_PA_COLOR[text] ?? 'default'} className="rounded-full px-3">{text}</Tag>
            ),
        },
        {
            title: 'Hồ sơ BN', key: 'ho_so_bn', width: 150,
            render: (_: unknown, record: any) => {
                if (data.trang_thai !== 3) return <span className="text-gray-300">—</span>;

                const hoSo = hoSoMap.get(record.chi_tiet_pa_id);
                if (hoSo) {
                    return (
                        <Button
                            type="link"
                            size="small"
                            icon={<FileSearchOutlined />}
                            onClick={() => navigate(`/ho-so-bo-nhiem/${hoSo.id}`)}
                        >
                            Xem hồ sơ
                        </Button>
                    );
                }
                return (
                    <Button
                        type="primary"
                        size="small"
                        ghost
                        icon={<PlusOutlined />}
                        loading={creatingHoSoId === record.chi_tiet_pa_id}
                        onClick={() => handleCreateHoSo(record.chi_tiet_pa_id)}
                    >
                        Lập hồ sơ
                    </Button>
                );
            }
        },
    ];

    return (
        <div className="p-6 bg-gray-50 min-h-screen space-y-5">
            <div className="flex items-center justify-between">
                <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/phuong-an-nhan-su')}>
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

            <Row gutter={16}>
                <Col span={6}>
                    <Card size="small" bordered={false} className="shadow-sm">
                        <Statistic title="Tổng nhân sự" value={data.chi_tiet.length}
                            prefix={<TeamOutlined />} valueStyle={{ color: '#1890ff' }} />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card size="small" bordered={false} className="shadow-sm">
                        <Statistic title="Bổ nhiệm" value={boNhiemCount}
                            valueStyle={{ color: '#1890ff' }} />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card size="small" bordered={false} className="shadow-sm">
                        <Statistic title="Bổ nhiệm lại" value={boNhiemLaiCount}
                            valueStyle={{ color: '#13c2c2' }} />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card size="small" bordered={false} className="shadow-sm">
                        <Statistic title="Trạng thái"
                            valueRender={() => <Tag color={trangThaiInfo.color} className="font-medium px-4">{trangThaiInfo.label}</Tag>} />
                    </Card>
                </Col>
            </Row>

            <Card title={
                <div className="flex items-center gap-2">
                    <FileTextOutlined className="text-blue-500" />
                    <span className="font-semibold">Thông tin chung phương án</span>
                </div>
            } className="shadow-sm rounded-xl">
                <Descriptions bordered column={2} size="small">
                    <Descriptions.Item label="Mã phương án"><span className="font-mono font-bold text-blue-600">{data.ma_phuong_an}</span></Descriptions.Item>
                    <Descriptions.Item label="Trạng thái"><Tag color={trangThaiInfo.color}>{trangThaiInfo.label}</Tag></Descriptions.Item>
                    <Descriptions.Item label="Số tờ trình">{data.so_to_trinh ?? '—'}</Descriptions.Item>
                    <Descriptions.Item label="Ngày lập tờ trình">{data.ngay_to_trinh ? dayjs(data.ngay_to_trinh).format('DD/MM/YYYY') : '—'}</Descriptions.Item>
                    <Descriptions.Item label="Ngày lập">{dayjs(data.ngay_lap).format('DD/MM/YYYY')}</Descriptions.Item>
                    <Descriptions.Item label="Ngày duyệt">{data.ngay_phe_duyet ? dayjs(data.ngay_phe_duyet).format('DD/MM/YYYY') : '—'}</Descriptions.Item>
                    <Descriptions.Item label="Ghi chú" span={2}>{data.ghi_chu || '—'}</Descriptions.Item>
                    {data.y_kien_bgh && (
                        <Descriptions.Item label="Ý kiến BGH" span={2} labelStyle={{ color: '#1d4ed8', fontWeight: 'bold' }}>
                            <span className="text-blue-700 font-medium">{data.y_kien_bgh}</span>
                        </Descriptions.Item>
                    )}
                </Descriptions>
            </Card>

            <Card title={
                <div className="flex items-center gap-2">
                    <TeamOutlined className="text-blue-500" />
                    <span className="font-semibold">Chi tiết phương án nhân sự</span>
                </div>
            } className="shadow-sm rounded-xl overflow-hidden">
                <Table
                    rowKey="chi_tiet_pa_id"
                    columns={cols}
                    dataSource={data.chi_tiet}
                    pagination={false}
                    size="middle"
                    bordered
                />
            </Card>

            {canApprove && (
                <Card title="Phê duyệt phương án" className="border-blue-200 shadow-md">
                    <div className="space-y-3">
                        <Input.TextArea
                            rows={3}
                            placeholder="Nhập ý kiến phê duyệt hoặc lý do từ chối..."
                            value={yKien}
                            onChange={e => setYKien(e.target.value)}
                        />
                        <div className="flex gap-2 justify-end">
                            <Popconfirm title="Xác nhận từ chối?" onConfirm={handleReject} okButtonProps={{ danger: true }}>
                                <Button danger icon={<CloseCircleOutlined />} loading={approving}>Từ chối</Button>
                            </Popconfirm>
                            <Popconfirm title="Xác nhận phê duyệt?" onConfirm={handleApprove}>
                                <Button type="primary" icon={<CheckCircleOutlined />} loading={approving}>Phê duyệt</Button>
                            </Popconfirm>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default PersonnelPlanDetailPage;
