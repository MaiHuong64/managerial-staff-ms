import React, { useState } from 'react';
import { Form, Input, Select, Button, Table, Tag, Card, Divider, message } from 'antd';
import { FileTextOutlined, UserOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import axiosClient from '../../utils/AxiosClient';

export interface SelectedPersonnel {
    chi_tiet_bn_id: number;
    ho_va_ten: string;
    ten_chuc_danh: string;
}

interface CreatePhuongAnFormProps {
    selectedPersonnel: SelectedPersonnel[];
    onCancel: () => void;
    onSuccess?: () => void;
}

interface ChiTietPhuongAn extends SelectedPersonnel {
    loai_phuong_an: string;
    ghi_chu: string;
}

const LOAI_PHUONG_AN = [
    { value: 'Bổ nhiệm', label: 'Bổ nhiệm' },
    { value: 'Bổ nhiệm lại', label: 'Bổ nhiệm lại' },
    { value: 'Thôi chức vụ', label: 'Thôi chức vụ' },
    { value: 'Thôi kiêm nhiệm',label: 'Thôi kiêm nhiệm' },
];

const generateMa = () => {
    const now = new Date();
    const y = now.getFullYear().toString().slice(-2);
    const m = (now.getMonth() + 1).toString().padStart(2, '0');
    const r = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    return `PA${y}${m}${r}`.substring(0, 6);
};

const CreatePhuongAnForm: React.FC<CreatePhuongAnFormProps> = ({
    selectedPersonnel, onCancel, onSuccess
}) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [chiTiet, setChiTiet] = useState<ChiTietPhuongAn[]>(
        selectedPersonnel.map(p => ({...p,
            loai_phuong_an: 'Bổ nhiệm',
            ghi_chu: '',
        }))
    );

    const handleDetailChange = (
        chi_tiet_bn_id: number,
        field: 'loai_phuong_an' | 'ghi_chu',
        value: string
    ) => {
        setChiTiet(prev => prev.map(item =>
            item.chi_tiet_bn_id === chi_tiet_bn_id
                ? { ...item, [field]: value }
                : item
        ));
    };

    const handleSubmit = async (values: any) => {
        setLoading(true);
        try {
           const payload = {
                thong_tin_chung: {
                    ma_phuong_an: values.ma_phuong_an,
                    so_to_trinh: values.so_to_trinh,
                    ngay_to_trinh: values.ngay_to_trinh ? dayjs(values.ngay_to_trinh).format('YYYY-MM-DD') : null,
                    ngay_lap: dayjs().format('YYYY-MM-DD'),
                    ghi_chu: values.ghi_chu,
                },
                chi_tiet: chiTiet.map(item => ({
                    chi_tiet_bn_id: item.chi_tiet_bn_id,
                    loai_phuong_an: item.loai_phuong_an,
                    ghi_chu: item.ghi_chu,
                })),
            };

            const res = await axiosClient.post('/phuong-an-nhan-su', payload);
            if (res.data.success) {
                message.success('Lập phương án thành công!');
                onSuccess?.();
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Lỗi khi lập phương án');
        } finally {
            setLoading(false);
        }
    };

    const cols = [
        {
            title: 'Họ và tên', dataIndex: 'ho_va_ten', key: 'ho_va_ten', width: 180,
            render: (text: string) => (
                <div className="flex items-center gap-2">
                    <UserOutlined className="text-blue-400" />
                    <span className="font-medium">{text}</span>
                </div>
            ),
        },
        {
            title: 'Chức danh', dataIndex: 'ten_chuc_danh', key: 'ten_chuc_danh', width: 160,
            render: (text: string) => <Tag color="purple">{text}</Tag>,
        },
        {
            title: 'Loại phương án', key: 'loai_phuong_an', width: 180,
            render: (_: unknown, record: ChiTietPhuongAn) => (
                <Select
                    size="small"
                    style={{ width: '100%' }}
                    value={record.loai_phuong_an}
                    options={LOAI_PHUONG_AN}
                    onChange={val => handleDetailChange(record.chi_tiet_bn_id, 'loai_phuong_an', val)}
                />
            ),
        },
        {
            title: 'Ghi chú', key: 'ghi_chu',
            render: (_: unknown, record: ChiTietPhuongAn) => (
                <Input
                    size="small"
                    placeholder="Ghi chú..."
                    value={record.ghi_chu}
                    onChange={e => handleDetailChange(record.chi_tiet_bn_id, 'ghi_chu', e.target.value)}
                />
            ),
        },
    ];

    return (
        <Form form={form} layout="vertical" onFinish={handleSubmit}
            initialValues={{ ma_phuong_an: generateMa() }}>

            <Card size="small" className="mb-4"
                title={<span><FileTextOutlined className="mr-2 text-blue-500" />Thông tin phương án</span>}>
                <div className="grid grid-cols-2 gap-4">
                    <Form.Item label="Mã phương án" name="ma_phuong_an"
                        rules={[{ required: true, message: 'Vui lòng nhập mã phương án' }]}>
                        <Input addonAfter={
                            <Button type="link" size="small"
                                onClick={() => form.setFieldValue('ma_phuong_an', generateMa())}>
                                Tạo mới
                            </Button>
                        } />
                    </Form.Item>
                    <Form.Item label="Số tờ trình" name="so_to_trinh">
                        <Input placeholder="VD: 18/TTr-ĐHAG" />
                    </Form.Item>
                    <Form.Item label="Ngày tờ trình" name="ngay_to_trinh">
                        <Input type="date" />
                    </Form.Item>
                    <Form.Item label="Ghi chú" name="ghi_chu">
                        <Input placeholder="Ghi chú thêm..." />
                    </Form.Item>
                </div>
            </Card>

            <Card size="small" className="mb-4"
                title={`Danh sách nhân sự (${chiTiet.length} người)`}>
                <Table
                    rowKey="chi_tiet_bn_id"
                    columns={cols}
                    dataSource={chiTiet}
                    pagination={false}
                    size="small"
                    bordered
                />
            </Card>

            <Divider />
            <div className="flex justify-end gap-2">
                <Button onClick={onCancel}>Hủy bỏ</Button>
                <Button type="primary" htmlType="submit" loading={loading}>
                    Lưu phương án
                </Button>
            </div>
        </Form>
    );
};

export default CreatePhuongAnForm;