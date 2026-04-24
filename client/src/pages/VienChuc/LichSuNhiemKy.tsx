import React from "react";
import {  HistoryOutlined,  ArrowLeftOutlined, CheckCircleFilled, ClockCircleOutlined, WarningFilled, ExclamationCircleFilled, FileTextOutlined, UserOutlined,  IdcardOutlined
} from '@ant-design/icons';
import { Button, Card, Space, Typography, Tag, Timeline, Spin } from "antd";
import dayjs from 'dayjs';

const { Title, Text } = Typography;

export interface VienChuc {
    id: number;
    maVienChuc: string;
    hoVaTen: string;
    tenDonVi: string;
    chucVuHienTai: string;
    ngach: string;
}

export interface NhiemKy {
    id: string | number;
    chucDanh: string;
    ngayBatDau: string;
    ngayKetThuc: string;
    soQuyetDinh: string;
    ngayQuyetDinh: string;
    nguoiKy: string;
    chucVuNguoiKy: string;
    loaiBoNhiem: string;
    trangThai: 'Đang nhiệm kỳ' | 'Đã kết thúc';
    lyDoKetThuc?: string;
}

interface TermHistoryViewProps {
    onBack: () => void;
    tenVienChuc: string;
    nhiemKyHienTai: NhiemKy | null;
    lichSuNhiemKy: NhiemKy[];
    loading?: boolean;
}
export const TermHistoryView: React.FC<TermHistoryViewProps> = ({
    onBack,
    tenVienChuc,
    nhiemKyHienTai,
    lichSuNhiemKy,
    loading = false
}) => {
    const renderWarningBadge = (ngayKetThuc: string) => {
        if (!ngayKetThuc) return <Tag color="default" icon={<ClockCircleOutlined />} className="m-0">Chưa xác định</Tag>;
        const soThangConLai = dayjs(ngayKetThuc).diff(dayjs(), 'month');
        if (soThangConLai < 0) return <Tag color="error" className="m-0">Đã hết nhiệm kỳ</Tag>;
        if (soThangConLai < 3) return <Tag color="error" icon={<ExclamationCircleFilled />} className="m-0">Cần xử lý gấp (Còn {soThangConLai} tháng)</Tag>;
        if (soThangConLai < 6) return <Tag color="warning" icon={<WarningFilled />} className="m-0">Sắp hết hạn (Còn {soThangConLai} tháng)</Tag>;
        return <Tag color="success" icon={<CheckCircleFilled />} className="m-0">An toàn (Còn {soThangConLai} tháng)</Tag>;
    };

    const timelineItems = lichSuNhiemKy.map((nhiemKy) => {
        const isCurrent = nhiemKy.trangThai === 'Đang nhiệm kỳ';
        return {
            color: isCurrent ? 'green' : 'gray',
            dot: isCurrent ? <CheckCircleFilled className="text-lg text-green-500" /> : <ClockCircleOutlined className="text-lg text-gray-400" />,
            children: (
                <div className="flex flex-col gap-1 pb-4">
                    <Text strong className={isCurrent ? 'text-green-600' : 'text-gray-600'}>
                        {dayjs(nhiemKy.ngayBatDau).format('YYYY')} - {dayjs(nhiemKy.ngayKetThuc).format('YYYY')} ({nhiemKy.trangThai})
                    </Text>
                    <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm flex flex-col gap-2 mt-2">
                        <Text className="font-semibold text-indigo-700">{nhiemKy.loaiBoNhiem}</Text>
                        
                        <div className="flex flex-col gap-1 text-sm text-gray-600">
                            <Space><FileTextOutlined className="text-gray-400"/><span>QĐ: {nhiemKy.soQuyetDinh} ({dayjs(nhiemKy.ngayQuyetDinh).format('DD/MM/YYYY')})</span></Space>
                            <Space><UserOutlined className="text-gray-400"/><span>Người ký: {nhiemKy.nguoiKy} {nhiemKy.chucVuNguoiKy}</span></Space>
                        </div>

                        <div className="mt-2 border-t border-gray-100 pt-3 text-sm grid grid-cols-2 gap-y-2">
                            <div><Text type="secondary">Bắt đầu: </Text><Text strong>{dayjs(nhiemKy.ngayBatDau).format('DD/MM/YYYY')}</Text></div>
                            <div><Text type="secondary">Kết thúc: </Text><Text strong>{dayjs(nhiemKy.ngayKetThuc).format('DD/MM/YYYY')}</Text></div>
                            {nhiemKy.lyDoKetThuc && (
                                <div className="col-span-2">
                                    <Text type="secondary">Lý do: </Text><Text>{nhiemKy.lyDoKetThuc}</Text>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ),
        };
    });

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 bg-white rounded-2xl shadow-sm border border-gray-100">
                <Spin size="large" />
                <p className="mt-4 text-gray-500">Đang tải dữ liệu nhiệm kỳ...</p>
            </div>
        );
    }

    return (
        <Card
            title={
                <Space className="py-2">
                    <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center">
                        <HistoryOutlined className="text-indigo-600 text-xl" />
                    </div>
                    <div>
                        <Title level={4} className="m-0! text-slate-800">Lịch sử nhiệm kỳ</Title>
                        <Text className="text-slate-500">Viên chức: <span className="font-medium text-slate-700">{tenVienChuc}</span></Text>
                    </div>
                </Space>
            }
            extra={
                <Button icon={<ArrowLeftOutlined />} onClick={onBack} className="rounded-lg hover:bg-gray-50 border-gray-200">
                    Quay lại danh sách
                </Button>
            }
            className="w-full shadow-sm rounded-2xl border-gray-100"
            headStyle={{ borderBottom: '1px solid #f1f5f9', padding: '16px 24px' }}
            bodyStyle={{ padding: '24px', backgroundColor: '#f8fafc' }}
        >
            <div className="flex flex-col gap-6 max-w-4xl mx-auto">
                {/* KHỐI 1: NHIỆM KỲ HIỆN TẠI */}
                {nhiemKyHienTai && (
                    <Card 
                        size="small" 
                        title={<Space><IdcardOutlined className="text-blue-600" /><Text strong className="text-blue-800">NHIỆM KỲ HIỆN TẠI</Text></Space>} 
                        className="border-blue-100 shadow-sm rounded-xl overflow-hidden"
                        headStyle={{ backgroundColor: '#eff6ff', borderBottom: '1px solid #dbeafe' }}
                    >
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <Space>
                                    <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                                    <Text strong className="text-lg text-slate-800">{nhiemKyHienTai.chucDanh}</Text>
                                </Space>
                                {renderWarningBadge(nhiemKyHienTai.ngayKetThuc)}
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mt-1 bg-white p-4 rounded-lg border border-gray-50">
                                <div className="flex flex-col gap-1">
                                    <Text type="secondary" className="text-xs font-semibold uppercase tracking-wider">Thời gian nhiệm kỳ</Text>
                                    <Text strong className="text-slate-700">
                                        {dayjs(nhiemKyHienTai.ngayBatDau).format('DD/MM/YYYY')} <span className="text-gray-300 mx-2">→</span> {dayjs(nhiemKyHienTai.ngayKetThuc).format('DD/MM/YYYY')}
                                    </Text>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <Text type="secondary" className="text-xs font-semibold uppercase tracking-wider">Căn cứ quyết định</Text>
                                    <Text strong className="text-slate-700">{nhiemKyHienTai.soQuyetDinh}</Text>
                                </div>
                            </div>
                        </div>
                    </Card>
                )}

                {/* KHỐI 2: LỊCH SỬ */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <Title level={5} className="mb-6! text-slate-700 uppercase tracking-wider text-sm border-b border-gray-100 pb-3">
                        Lịch sử các kỳ bổ nhiệm
                    </Title>
                    <Timeline items={timelineItems} className="mt-4" />
                </div>
            </div>
        </Card>
    );
};