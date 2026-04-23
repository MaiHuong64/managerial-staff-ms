import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Table, Tag, Button, Popconfirm, Spin, message, Modal, Form, Input, Upload, Descriptions, Statistic, Row, Col, Tooltip, Select} from 'antd';
import {
    ArrowLeftOutlined, UploadOutlined, DeleteOutlined, FileDoneOutlined,
    FileTextOutlined, CheckCircleOutlined, TeamOutlined, CalendarOutlined,
    FolderOpenOutlined, InboxOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { getHoSoById, uploadTaiLieu, deleteTaiLieu, hoanThienHoSo } from '../../api/hoSoBoNhiem.api';
import { LOAI_TAI_LIEU_MAP, type HoSo, type TaiLieu } from '../../types/HoSoBoNhiem';

const TRANG_THAI_MAP: Record<number, { label: string; color: string }> = {
    1: { label: 'Đang lập', color: 'processing' },
    2: { label: 'Hoàn thiện', color: 'success' },
};

const HoSoBoNhiemDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [data, setData] = useState<HoSo | null>(null);
    const [loading, setLoading] = useState(true);
    
    const [uploadModalOpen, setUploadModalOpen] = useState(false);
    const [decisonModalOpen, setDecisonModalOpen] = useState(false);

    const [uploading, setUploading] = useState(false);
    // const []
    const [completing, setCompleting] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);


    const [form] = Form.useForm();
    const fileRef = useRef<File | null>(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const result = await getHoSoById(Number(id));
            const raw = result.data.data;
            setData({
                ...raw,
                taiLieu: (raw.taiLieu  ?? []).map((t: any) => ({
                    id: t.id,
                    tenTaiLieu: t.ten_tai_lieu,
                    loaiTaiLieu: t.loai_tai_lieu,
                    fileDinhKem: t.file_dinh_kem,
                    ngayCapNhat: t.ngay_cap_nhat,
                }))
            });
        } catch {
            message.error('Không thể tải hồ sơ');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { if (id) fetchData(); }, [id]);

    const handleUpload = async (values: { tenTaiLieu: string; loaiTaiLieu: string }) => {
        if (!fileRef.current) { message.warning('Vui lòng chọn file'); return; }
        try {
            setUploading(true);
            const fd = new FormData();
            fd.append('file', fileRef.current);
            fd.append('tenTaiLieu', values.tenTaiLieu);
            fd.append('loaiTaiLieu', values.loaiTaiLieu);
            await uploadTaiLieu(Number(id), fd);
            message.success('Tải lên thành công');
            setUploadModalOpen(false);
            form.resetFields();
            fileRef.current = null;
            fetchData();
        } catch (err: any) {
            message.error(err?.response?.data?.message || 'Lỗi khi tải lên');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (taiLieuId: number) => {
        try {
            setDeletingId(taiLieuId);
            await deleteTaiLieu(data!.id, taiLieuId);
            message.success('Đã xóa tài liệu');
            fetchData();
        } catch (err: any) {
            message.error(err?.response?.data?.message || 'Lỗi khi xóa');
        } finally {
            setDeletingId(null);
        }
    };

    const handleComplete = async () => {
        try {
            setCompleting(true);
            await hoanThienHoSo(Number(id));
            message.success('Hồ sơ đã được hoàn thiện');
            fetchData();
        } catch (err: any) {
            message.error(err?.response?.data?.message || 'Lỗi khi hoàn thiện');
        } finally {
            setCompleting(false);
        }
    };
    
    // const handleDecision = async () => {
    //     try {
    //         await 
    //     } catch (error) {
            
    //     }
    // }

    if (loading) return <div className="flex justify-center items-center h-64"><Spin size="large" tip="Đang tải hồ sơ..." /></div>;
    if (!data) return <div className="text-center mt-10 text-red-500">Không tìm thấy hồ sơ!</div>;

    const trangThaiInfo = TRANG_THAI_MAP[data.trangThai] ?? { label: '?', color: 'default' };
    const isDone = data.trangThai === 2;

    const taiLieuCols = [
        {
            title: 'Tên tài liệu', dataIndex: 'tenTaiLieu', key: 'tenTaiLieu',
            render: (text: string) => (
                <div className="flex items-center gap-2">
                    <FileTextOutlined className="text-blue-400" />
                    <span className="font-medium">{text}</span>
                </div>
            ),
        },
        {
            title: 'Loại', dataIndex: 'loaiTaiLieu', key: 'loaiTaiLieu', width: 120,
            render: (value: number) => <Tag color="blue">{LOAI_TAI_LIEU_MAP[value] ?? '-'}</Tag>
        },
        {
            title: 'Ngày cập nhật', dataIndex: 'ngayCapNhat', key: 'ngayCapNhat', width: 140,
            render: (text: string) => text ? dayjs(text).format('DD/MM/YYYY') : '—',
        },
        {
            title: 'File', dataIndex: 'fileDinhKem', key: 'fileDinhKem', width: 100,
            render: (url: string) => url ? (
                <a href={`http://localhost:3000${url}`} target="_blank" rel="noreferrer">
                    <Button size="small" type="link">Xem file</Button>
                </a>
            ) : '—',
        },
        {
            title: 'Thao tác', key: 'action', width: 80,
            render: (_: unknown, record: TaiLieu) => (
                isDone ? <span className="text-gray-300">—</span> : (
                    <Popconfirm title="Xác nhận xóa?" onConfirm={() => handleDelete(record.id)}
                        okText="Xóa" okButtonProps={{ danger: true }} cancelText="Hủy">
                        <Button size="small" danger icon={<DeleteOutlined />} loading={deletingId === record.id} />
                    </Popconfirm>
                )
            ),
        },
    ];

    return (
        <div className="p-6 bg-gray-50 min-h-screen space-y-5">
            <div className="flex items-center justify-between">
                <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>Quay lại</Button>
                {!isDone && (
                    <Popconfirm title="Hoàn thiện hồ sơ?"
                        description="Sau khi hoàn thiện sẽ không thể thêm/xóa tài liệu."
                        onConfirm={handleComplete} okText="Xác nhận" cancelText="Hủy"
                        disabled={data.taiLieu.length === 0}>
                        <Tooltip title={data.taiLieu.length === 0 ? 'Phải có ít nhất 1 tài liệu' : ''}>
                            <Button type="primary" icon={<CheckCircleOutlined />}
                                loading={completing} disabled={data.taiLieu.length === 0}>
                                Hoàn thiện hồ sơ
                            </Button>
                        </Tooltip>
                    </Popconfirm>
                )}
                {isDone && data.trangThai !== 3 &&(
                    <Button type="primary" icon={<CheckCircleOutlined/>}>Lập quyết định bổ nhiệm</Button>
                )}
            </div>

            <Row gutter={16}>
                <Col span={6}><Card size="small" bordered={false} className="shadow-sm">
                    <Statistic title="Mã hồ sơ" value={data.maHoSo} prefix={<FolderOpenOutlined />} valueStyle={{ color: '#1890ff', fontSize: 18 }} />
                </Card></Col>
                <Col span={6}><Card size="small" bordered={false} className="shadow-sm">
                    <Statistic title="Ngày lập" value={dayjs(data.ngayLap).format('DD/MM/YYYY')} prefix={<CalendarOutlined />} valueStyle={{ fontSize: 16 }} />
                </Card></Col>
                <Col span={6}><Card size="small" bordered={false} className="shadow-sm">
                    <Statistic title="Số tài liệu" value={data.taiLieu.length} prefix={<FileTextOutlined />} valueStyle={{ color: '#13c2c2' }} />
                </Card></Col>
                <Col span={6}><Card size="small" bordered={false} className="shadow-sm">
                    <Statistic title="Trạng thái" valueRender={() => (
                        <Tag color={trangThaiInfo.color} className="font-medium px-3 text-sm">{trangThaiInfo.label}</Tag>
                    )} />
                </Card></Col>
            </Row>

            <Card title={<div className="flex items-center gap-2"><TeamOutlined className="text-blue-500" /><span className="font-semibold">Thông tin viên chức</span></div>} className="shadow-sm rounded-xl">
                <Descriptions bordered column={2} size="small">
                    <Descriptions.Item label="Họ và tên"><span className="font-semibold">{data.hoVaTen}</span></Descriptions.Item>
                    <Descriptions.Item label="Mã viên chức"><span className="font-mono text-slate-500">{data.maVienChuc}</span></Descriptions.Item>
                    <Descriptions.Item label="Chức danh"><Tag color="purple">{data.tenChucDanh}</Tag></Descriptions.Item>
                    <Descriptions.Item label="Đơn vị">{data.tenDonVi}</Descriptions.Item>
                    {data.ghiChu && <Descriptions.Item label="Ghi chú" span={2}>{data.ghiChu}</Descriptions.Item>}
                </Descriptions>
            </Card>

            <Card title={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <FileDoneOutlined className="text-blue-500" />
                        <span className="font-semibold">Tài liệu đính kèm</span>
                    </div>
                    {!isDone && (
                        <Button type="primary" ghost icon={<UploadOutlined />} onClick={() => setUploadModalOpen(true)}>
                            Tải lên tài liệu
                        </Button>
                    )}
                </div>
            } className="shadow-sm rounded-xl">
                <Table rowKey="id" columns={taiLieuCols} dataSource={data.taiLieu}
                    pagination={false} size="middle" bordered
                    locale={{ emptyText: (
                        <div className="py-8 text-gray-400 flex flex-col items-center gap-2">
                            <InboxOutlined style={{ fontSize: 32 }} />
                            <span>Chưa có tài liệu nào</span>
                        </div>
                    )}} />
            </Card>

            <Modal title="Tải lên tài liệu" open={uploadModalOpen}
                onCancel={() => { setUploadModalOpen(false); form.resetFields(); fileRef.current = null; }}
                footer={null} destroyOnClose>
                <Form form={form} layout="vertical" onFinish={handleUpload} className="mt-4">
                    <Form.Item label="Tên tài liệu" name="tenTaiLieu" rules={[{ required: true, message: 'Nhập tên tài liệu' }]}>
                        <Input placeholder="VD: Bằng đại học, Lý lịch tư pháp..." />
                    </Form.Item>
                    <Form.Item label="Loại tài liệu" name="loaiTaiLieu" rules={[{ required: true, message: 'Nhập loại tài liệu' }]}>
                         <Select placeholder="Chọn loại tài liệu...">
                            {Object.entries(LOAI_TAI_LIEU_MAP).map(([value, label]) => (
                                <Select.Option key={value} value={Number(value)}>
                                    {label}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item label="File đính kèm" required>
                        <Upload beforeUpload={(file) => { fileRef.current = file; return false; }}
                            maxCount={1} onRemove={() => { fileRef.current = null; }}>
                            <Button icon={<UploadOutlined />}>Chọn file</Button>
                        </Upload>
                    </Form.Item>
                    <div className="flex justify-end gap-2 mt-2">
                        <Button onClick={() => { setUploadModalOpen(false); form.resetFields(); fileRef.current = null; }}>Hủy</Button>
                        <Button type="primary" htmlType="submit" loading={uploading}>Tải lên</Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default HoSoBoNhiemDetailPage;